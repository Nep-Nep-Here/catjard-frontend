import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listarIncidentes,
  crearIncidente,
  actualizarIncidente,
  eliminarIncidente,
  sincronizarIncidentes,
} from '../../../services/incidentesService.js';
import { listarServicios, sugerenciasKB } from '../../../services/continuidadService.js';
import AdminHeader, { Card, EmptyState } from '../../../components/AdminHeader.jsx';

// ---------- catalogos ----------
const ORIGENES = [
  { id: 'usuario',       label: 'Usuario / Cliente' },
  { id: 'monitoreo',     label: 'Monitoreo / Alertas' },
  { id: 'mesa_ayuda',    label: 'Mesa de ayuda' },
  { id: 'logs_servidor', label: 'Logs del servidor (Droplet)' },
  { id: 'pipeline_cicd', label: 'Pipeline CI/CD' },
  { id: 'equipo_dev',    label: 'Equipo de desarrollo' },
];
const CATEGORIAS = [
  { id: 'infraestructura', label: 'Infraestructura' },
  { id: 'aplicaciones',    label: 'Aplicaciones' },
  { id: 'base_datos',      label: 'Base de datos' },
  { id: 'redes',           label: 'Redes y comunicaciones' },
  { id: 'seguridad',       label: 'Seguridad' },
  { id: 'despliegue',      label: 'Despliegue / DevOps' },
  { id: 'rendimiento',     label: 'Rendimiento' },
  { id: 'integracion',     label: 'Integración de servicios' },
  { id: 'documentacion',   label: 'Documentación' },
  { id: 'otros',           label: 'Otros' },
];

// Activos del stack Cat Jard (sugerencias para "Servicio / activo afectado"; editable).
const ACTIVOS = [
  'Servidor / Droplet (DigitalOcean)',
  'API Gateway',
  'Eureka (Service Discovery)',
  'identity-service',
  'catalog-service',
  'crm-service',
  'sales-service',
  'inventory-service',
  'operations-service',
  'solicitudes-service',
  'Base de datos PostgreSQL',
  'Frontend (React)',
  'Docker / Contenedores',
  'Red / Conectividad',
];

// Equipos de Jira a los que se asigna el incidente (Responsable).
const EQUIPOS = ['Área de TI', 'Mesa de ayuda', 'Desarrolladores', 'Asesor Comercial'];

// Al elegir un origen "de infraestructura" se sugiere un activo afectado (se puede cambiar).
const ORIGEN_SUGERIDO = {
  monitoreo: 'Servidor / Droplet (DigitalOcean)',
  logs_servidor: 'Servidor / Droplet (DigitalOcean)',
  pipeline_cicd: 'Docker / Contenedores',
};
const SUGERIDOS = new Set(Object.values(ORIGEN_SUGERIDO));
// Impacto y urgencia comparten los 3 niveles (bajo/medio/alto en el backend).
const NIVELES_IMPACTO = [
  { id: 'bajo', label: 'Bajo' },
  { id: 'medio', label: 'Medio' },
  { id: 'alto', label: 'Alto' },
];
const NIVELES_URGENCIA = [
  { id: 'bajo', label: 'Baja' },
  { id: 'medio', label: 'Media' },
  { id: 'alto', label: 'Alta' },
];

// Flujo del incidente (las 4 primeras etapas del docente ocurren al registrar).
const ESTADOS = [
  { id: 'registrado',     label: 'Registrado' },
  { id: 'en_diagnostico', label: 'En diagnóstico' },
  { id: 'en_resolucion',  label: 'En resolución' },
  { id: 'resuelto',       label: 'Resuelto' },
  { id: 'cerrado',        label: 'Cerrado' },
  { id: 'reabierto',      label: 'Reabierto' },
  { id: 'cancelado',      label: 'Cancelado' },
];
const ESTADO_LABELS = Object.fromEntries(ESTADOS.map((e) => [e.id, e.label]));
const ESTADO_BADGE = {
  registrado:     'bg-blue-400/10 text-blue-300 border-blue-400/30',
  en_diagnostico: 'bg-amber/10 text-amber-light border-amber/30',
  en_resolucion:  'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
  resuelto:       'bg-teal-400/10 text-teal-300 border-teal-400/30',
  cerrado:        'bg-green-400/10 text-green-300 border-green-400/30',
  reabierto:      'bg-orange-400/10 text-orange-300 border-orange-400/30',
  cancelado:      'bg-cream/10 text-cream/50 border-cream/20',
};
const ESTADO_BAR = {
  registrado: 'bg-blue-400', en_diagnostico: 'bg-amber', en_resolucion: 'bg-cyan-400',
  resuelto: 'bg-teal-400', cerrado: 'bg-green-400', reabierto: 'bg-orange-400', cancelado: 'bg-cream/40',
};

// Prioridad (derivada de la matriz Impacto x Urgencia).
const PRIORIDADES = [
  { id: 'baja', label: 'Baja' },
  { id: 'media', label: 'Media' },
  { id: 'alta', label: 'Alta' },
  { id: 'critica', label: 'Crítica' },
];
const PRIORIDAD_LABELS = Object.fromEntries(PRIORIDADES.map((p) => [p.id, p.label]));
const PRIORIDAD_BADGE = {
  baja:    'bg-green-400/10 text-green-300 border-green-400/30',
  media:   'bg-yellow-400/10 text-yellow-300 border-yellow-400/30',
  alta:    'bg-orange-400/10 text-orange-300 border-orange-400/30',
  critica: 'bg-red-400/10 text-red-300 border-red-400/30',
};

const ORIGEN_LABELS = Object.fromEntries(ORIGENES.map((o) => [o.id, o.label]));
const CAT_LABELS = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.label]));
const NIVEL_LABELS = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' };

// Matriz de priorizacion (misma logica que el backend): peso(impacto) x peso(urgencia).
const PESO = { bajo: 1, medio: 2, alto: 3 };
function calcularPrioridad(impacto, urgencia) {
  const score = (PESO[impacto] ?? 2) * (PESO[urgencia] ?? 2);
  if (score >= 9) return 'critica';
  if (score >= 5) return 'alta';
  if (score >= 3) return 'media';
  return 'baja';
}

const EMPTY = {
  titulo: '', descripcion: '', origen: 'usuario', servicioAfectado: '', servicioId: '',
  categoria: 'aplicaciones', impacto: 'medio', urgencia: 'medio',
  responsable: '', diagnostico: '', solucion: '', evidencia: '',
};

const ABIERTOS = ['registrado', 'en_diagnostico', 'en_resolucion', 'reabierto'];

export default function GestionIncidentes() {
  const [incidentes, setIncidentes] = useState([]);
  const [servicios, setServicios] = useState([]);   // catálogo de continuidad (contador RTO)
  const [status, setStatus] = useState('idle');
  const [loadError, setLoadError] = useState(null);
  const [vista, setVista] = useState('lista');   // lista | crear | detalle
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [confirmando, setConfirmando] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);

  const cargar = async () => {
    setStatus('loading'); setLoadError(null);
    try { setIncidentes(await listarIncidentes()); setStatus('ready'); }
    catch (e) { setLoadError(e.message); setStatus('error'); }
  };
  useEffect(() => {
    cargar();
    // Catálogo de continuidad (best-effort): habilita el contador RTO.
    listarServicios().then(setServicios).catch(() => {});
  }, []);

  // Tick de 1 s para el contador RTO en vivo (solo si hay algún contador corriendo).
  const [ahora, setAhora] = useState(() => Date.now());
  const hayContadores = incidentes.some((i) => i.rtoDeadline && i.cumplioRto == null);
  useEffect(() => {
    if (!hayContadores) return undefined;
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [hayContadores]);

  const sincronizar = async () => {
    setSincronizando(true);
    try { await sincronizarIncidentes(); } catch { /* best-effort */ }
    await cargar();
    setSincronizando(false);
  };

  const stats = useMemo(() => {
    const total = incidentes.length;
    const abiertos = incidentes.filter((i) => ABIERTOS.includes(i.estado)).length;
    const criticos = incidentes.filter((i) => i.prioridad === 'critica' && ABIERTOS.includes(i.estado)).length;
    const resueltos = incidentes.filter((i) => ['resuelto', 'cerrado'].includes(i.estado)).length;
    const avancePct = total ? Math.round((resueltos / total) * 100) : 0;
    const distribucion = ESTADOS.map((e) => ({
      ...e,
      count: incidentes.filter((i) => i.estado === e.id).length,
    })).filter((d) => d.count > 0 || !['reabierto', 'cancelado'].includes(d.id));
    return { total, abiertos, criticos, avancePct, distribucion };
  }, [incidentes]);

  const filtrados = useMemo(
    () => (filtro ? incidentes.filter((i) => i.estado === filtro) : incidentes),
    [incidentes, filtro],
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    // Al cambiar el origen, sugiere un activo afectado (sin pisar lo que el usuario ya escribió).
    if (name === 'origen') {
      setForm((f) => {
        const sugerido = ORIGEN_SUGERIDO[value] || '';
        const conservar = f.servicioAfectado && !SUGERIDOS.has(f.servicioAfectado);
        return { ...f, origen: value, servicioAfectado: conservar ? f.servicioAfectado : sugerido };
      });
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };
  const prioridadPreview = calcularPrioridad(form.impacto, form.urgencia);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null); setOk(null);
    if (!form.titulo.trim()) return setErr('Indica el incidente (título).');
    try {
      const creado = await crearIncidente({
        ...form,
        servicioId: form.servicioId ? Number(form.servicioId) : null,
      });
      setOk(creado);
      setForm(EMPTY);
      await cargar();
      setVista('lista');
    } catch (e2) { setErr(e2.message || 'No se pudo registrar el incidente.'); }
  };

  const borrar = async (id) => {
    try {
      await eliminarIncidente(id);
      setIncidentes((list) => list.filter((x) => x.id !== id));
      if (sel?.id === id) { setSel(null); setVista('lista'); }
    } catch (e) { setErr(e.message || 'No se pudo eliminar.'); }
    setConfirmando(null);
  };

  const abrir = (i) => { setSel(i); setVista('detalle'); setErr(null); };

  // ---------------- VISTA: CREAR ----------------
  if (vista === 'crear') {
    return (
      <section>
        <AdminHeader eyebrow="Dirección · Gestión de Incidentes" title="Registrar incidente"
          subtitle="Identificación, registro, clasificación y priorización del incidente" />
        <Card title="Registro de Incidente" className="mt-8">
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            <Field label="Incidente (título)" required className="sm:col-span-2">
              <input name="titulo" value={form.titulo} onChange={onChange} maxLength={160} className={inputCls} placeholder="Resume el incidente en una frase" />
            </Field>
            <Field label="Descripción" className="sm:col-span-2">
              <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={3} className={`${inputCls} resize-y`} placeholder="¿Qué ocurre? ¿Desde cuándo? ¿A quién afecta?" />
            </Field>

            <Field label="Origen de detección" required>
              <select name="origen" value={form.origen} onChange={onChange} className={inputCls}>
                {ORIGENES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Servicio / activo afectado">
              <ActivoSelect value={form.servicioAfectado} onChange={(v) => setForm((f) => ({ ...f, servicioAfectado: v }))} />
            </Field>

            {/* Continuidad: asociar el incidente al catálogo activa su contador RTO */}
            {servicios.length > 0 && (
              <Field label="Servicio del catálogo de continuidad (activa contador RTO)" className="sm:col-span-2">
                <select name="servicioId" value={form.servicioId} onChange={onChange} className={inputCls}>
                  <option value="">— Sin contador RTO —</option>
                  {servicios.filter((s) => s.activo).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}{s.rtoMinutos ? ` · RTO ${formatMinutos(s.rtoMinutos)}` : ''}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Clasificación (categoría)" required className="sm:col-span-2">
              <select name="categoria" value={form.categoria} onChange={onChange} className={inputCls}>
                {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>

            {/* Priorizacion: matriz Impacto x Urgencia -> Prioridad (en vivo) */}
            <Field label="Impacto" required>
              <select name="impacto" value={form.impacto} onChange={onChange} className={inputCls}>
                {NIVELES_IMPACTO.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
            </Field>
            <Field label="Urgencia" required>
              <select name="urgencia" value={form.urgencia} onChange={onChange} className={inputCls}>
                {NIVELES_URGENCIA.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-amber/15 bg-amber/[0.03] px-4 py-3">
              <span className="text-[11px] tracking-[0.2em] uppercase text-amber/70">Prioridad calculada</span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] border ${PRIORIDAD_BADGE[prioridadPreview]}`}>
                {PRIORIDAD_LABELS[prioridadPreview]}
              </span>
              <span className="text-[11px] text-cream/50">matriz Impacto × Urgencia (ITIL)</span>
            </div>

            <Field label="Responsable (equipo de Jira)" className="sm:col-span-2">
              <select name="responsable" value={form.responsable} onChange={onChange} className={inputCls}>
                <option value="">— Sin asignar —</option>
                {EQUIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            {err && <div className="sm:col-span-2 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors">Registrar incidente</button>
              <button type="button" onClick={() => { setVista('lista'); setErr(null); }} className="px-4 py-2.5 rounded-full text-cream/70 text-[13px] hover:text-cream">Cancelar</button>
            </div>
          </form>
        </Card>
      </section>
    );
  }

  // ---------------- VISTA: DETALLE / SEGUIMIENTO ----------------
  if (vista === 'detalle' && sel) {
    return (
      <DetalleIncidente
        sel={sel}
        servicios={servicios}
        onVolver={() => { setVista('lista'); setSel(null); }}
        onActualizado={async (actualizado) => { setSel(actualizado); await cargar(); }}
      />
    );
  }

  // ---------------- VISTA: LISTA + DASHBOARD ----------------
  return (
    <section>
      <AdminHeader
        eyebrow="Dirección · Gestión de Incidentes"
        title="Gestión de Incidentes"
        subtitle={`${incidentes.length} incidentes registrados`}
        action={
          <div className="flex gap-2">
            <button onClick={sincronizar} disabled={sincronizando}
              className="rounded-full border border-amber/30 text-cream/80 px-4 py-2 text-[13px] hover:border-amber/60 hover:text-cream transition-colors disabled:opacity-50">
              {sincronizando ? 'Sincronizando…' : '↻ Sincronizar con Jira'}
            </button>
            <button onClick={() => { setForm(EMPTY); setVista('crear'); setErr(null); setOk(null); }}
              className="rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors">+ Nuevo incidente</button>
          </div>
        }
      />

      {ok && (
        <div className="mt-6 p-3 rounded bg-green-400/10 text-green-300 text-[13px]">
          Incidente <strong>{ok.codigo}</strong> registrado · Prioridad <strong>{PRIORIDAD_LABELS[ok.prioridad] ?? ok.prioridad}</strong>.
          {ok.jiraUrl && <> · Jira: <a href={ok.jiraUrl} target="_blank" rel="noopener noreferrer" className="underline">{ok.jiraIssueKey}</a></>}
        </div>
      )}

      {/* Resumen: métricas agregadas + distribución por estado */}
      <div className="mt-8 grid lg:grid-cols-3 gap-3">
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          <StatCard label="Total" value={stats.total} tone="neutral" />
          <StatCard label="Abiertos" value={stats.abiertos} tone="blue" />
          <StatCard label="Críticos abiertos" value={stats.criticos} tone="red" />
          <StatCard label="% Resueltos" value={`${stats.avancePct}%`} tone="green" />
        </div>

        <div className="lg:col-span-2 rounded-xl border border-amber/15 bg-amber/[0.03] px-5 py-4">
          <p className="text-[10px] tracking-[0.25em] uppercase text-amber/70 mb-3">Distribución por estado</p>
          {stats.total === 0 ? (
            <p className="text-cream/40 text-[13px]">Sin incidentes registrados.</p>
          ) : (
            <div className="space-y-2.5">
              {stats.distribucion.map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-[12px] text-cream/70">{d.label}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-amber/5 overflow-hidden">
                    <div className={`h-full rounded-full ${ESTADO_BAR[d.id] ?? 'bg-amber'}`}
                      style={{ width: `${(d.count / stats.total) * 100}%` }} />
                  </div>
                  <span className="w-6 shrink-0 text-right text-[12px] text-cream/85">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loadError && <div className="mt-6 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">No se pudieron cargar los incidentes: {loadError}</div>}
      {status === 'loading' && <p className="mt-6 text-cream/60 text-[13px]">Cargando…</p>}

      {/* Filtros por estado */}
      <div className="mt-8 flex flex-wrap gap-2">
        <FiltroBtn active={filtro === ''} onClick={() => setFiltro('')}>Todos</FiltroBtn>
        {ESTADOS.map((e) => (
          <FiltroBtn key={e.id} active={filtro === e.id} onClick={() => setFiltro(e.id)}>{e.label}</FiltroBtn>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-8"><EmptyState titulo="Sin incidentes" descripcion="Registra el primer incidente." /></div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-amber/15">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
              <tr>
                <th className="px-5 py-4">Código</th>
                <th className="px-5 py-4">Incidente</th>
                <th className="px-5 py-4">Categoría</th>
                <th className="px-5 py-4">Prioridad</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">RTO</th>
                <th className="px-5 py-4">Jira</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((i) => (
                <tr key={i.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                  <td className="px-5 py-3 font-mono text-[12px] text-cream/85">{i.codigo}</td>
                  <td className="px-5 py-3 text-cream font-medium max-w-xs truncate">{i.titulo}</td>
                  <td className="px-5 py-3 text-cream/80">{CAT_LABELS[i.categoria] ?? i.categoria}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${PRIORIDAD_BADGE[i.prioridad] ?? ''}`}>{PRIORIDAD_LABELS[i.prioridad] ?? i.prioridad}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${ESTADO_BADGE[i.estado] ?? ''}`}>{ESTADO_LABELS[i.estado] ?? i.estado}</span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap"><RtoBadge i={i} ahora={ahora} /></td>
                  <td className="px-5 py-3">
                    {i.jiraIssueKey ? (
                      <a href={i.jiraUrl} target="_blank" rel="noopener noreferrer" className="text-amber-light underline underline-offset-4 text-[12px]">{i.jiraIssueKey}</a>
                    ) : <span className="text-cream/30">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button onClick={() => abrir(i)} className="text-amber-light hover:text-amber underline underline-offset-4 text-[12px] mr-3">Gestionar</button>
                    {confirmando === i.id ? (
                      <span className="text-[12px]">
                        <button onClick={() => borrar(i.id)} className="text-red-300 hover:text-red-200 underline underline-offset-4 mr-2">Confirmar</button>
                        <button onClick={() => setConfirmando(null)} className="text-cream/60 hover:text-cream">cancelar</button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmando(i.id)} className="text-red-300/80 hover:text-red-300 underline underline-offset-4 text-[12px]">Eliminar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ---------------- VISTA DETALLE (con panel de gestión editable) ----------------
function DetalleIncidente({ sel, servicios = [], onVolver, onActualizado }) {
  const navigate = useNavigate();
  // Estrategias documentadas de la Base de Conocimiento que aplican a este
  // incidente (por categoría y servicio); el enlace redirige a Continuidad y DRP.
  const [estrategias, setEstrategias] = useState([]);
  useEffect(() => {
    sugerenciasKB({ categoriaIncidente: sel.categoria, servicioId: sel.servicioId })
      .then(setEstrategias)
      .catch(() => setEstrategias([]));
  }, [sel.id, sel.categoria, sel.servicioId]);
  const [gest, setGest] = useState({
    estado: sel.estado, impacto: sel.impacto, urgencia: sel.urgencia,
    responsable: sel.responsable ?? '', servicioAfectado: sel.servicioAfectado ?? '',
    servicioId: sel.servicioId ?? '',
    diagnostico: sel.diagnostico ?? '', solucion: sel.solucion ?? '', evidencia: sel.evidencia ?? '',
  });
  const [guardando, setGuardando] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(false);

  // Tick de 1 s para el contador RTO del encabezado.
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (!sel.rtoDeadline) return undefined;
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [sel.rtoDeadline]);

  const onChange = (e) => { setGest((g) => ({ ...g, [e.target.name]: e.target.value })); setOk(false); };
  const prioridadPreview = calcularPrioridad(gest.impacto, gest.urgencia);

  const guardar = async () => {
    setGuardando(true); setErr(null); setOk(false);
    try {
      const actualizado = await actualizarIncidente(sel.id, {
        ...gest,
        // null = no tocar la asociación; el backend solo la cambia si llega un id.
        servicioId: gest.servicioId && Number(gest.servicioId) !== sel.servicioId
          ? Number(gest.servicioId) : null,
      });
      setOk(true);
      await onActualizado(actualizado);
    } catch (e) { setErr(e.message || 'No se pudo guardar.'); }
    setGuardando(false);
  };

  return (
    <section>
      <AdminHeader eyebrow="Dirección · Gestión de Incidentes"
        title={`${sel.codigo} — ${sel.titulo}`}
        subtitle={`${ORIGEN_LABELS[sel.origen] ?? sel.origen} · ${CAT_LABELS[sel.categoria] ?? sel.categoria}`}
        action={<button onClick={onVolver} className="rounded-full border border-amber/30 text-cream/80 px-4 py-2 text-[13px] hover:border-amber/60 hover:text-cream transition-colors">← Volver</button>}
      />

      {/* Flujo del incidente */}
      <div className="mt-8">
        <p className="text-[10px] tracking-[0.25em] uppercase text-amber/70 mb-2">Ciclo de vida del incidente</p>
        <Stepper steps={ESTADOS.filter((e) => !['reabierto', 'cancelado'].includes(e.id))} currentId={sel.estado}
          failed={sel.estado === 'cancelado'} failLabel="Cancelado"
          reopened={sel.estado === 'reabierto'} reopenLabel="Reabierto" />
      </div>

      {/* Contador RTO (Gestión de Continuidad): tiempo objetivo de recuperación del servicio */}
      {sel.rtoDeadline && <PanelRto sel={sel} ahora={ahora} />}

      {/* Estrategias documentadas (Base de Conocimiento) que aplican a este incidente */}
      {estrategias.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber/25 bg-amber/[0.04] px-5 py-4">
          <p className="text-[10px] tracking-[0.25em] uppercase text-amber/70">Estrategia documentada · Base de Conocimiento</p>
          <div className="mt-3 grid gap-2">
            {estrategias.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[11px] text-cream/50 shrink-0">{a.codigo}</span>
                <span className="text-[13px] text-cream flex-1 min-w-[200px]">{a.titulo}</span>
                <button onClick={() => navigate(`/admin/gerencia/continuidad?kb=${a.id}`)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-[12px] border border-amber/30 text-amber-light hover:border-amber/60 hover:text-amber transition-colors">
                  Ver estrategia →
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-cream/50">
            La referencia de la estrategia se incluye automáticamente al enviar el incidente a Jira.
          </p>
        </div>
      )}

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <Card title="Detalle del incidente">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
            <Info label="Código"><span className="font-mono">{sel.codigo}</span></Info>
            <Info label="Fecha">{sel.fecha}</Info>
            <Info label="Origen">{ORIGEN_LABELS[sel.origen] ?? sel.origen}</Info>
            <Info label="Categoría">{CAT_LABELS[sel.categoria] ?? sel.categoria}</Info>
            <Info label="Servicio afectado" className="sm:col-span-2">{sel.servicioAfectado || '—'}</Info>
            <Info label="Descripción" className="sm:col-span-2"><span className="text-cream/80 whitespace-pre-wrap">{sel.descripcion || '—'}</span></Info>
            <Info label="Impacto / Urgencia">{NIVEL_LABELS[sel.impacto] ?? sel.impacto} / {NIVEL_LABELS[sel.urgencia] ?? sel.urgencia}</Info>
            <Info label="Prioridad">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${PRIORIDAD_BADGE[sel.prioridad] ?? ''}`}>{PRIORIDAD_LABELS[sel.prioridad] ?? sel.prioridad}</span>
            </Info>
            <Info label="Diagnóstico (causa)" className="sm:col-span-2"><span className="text-cream/80 whitespace-pre-wrap">{sel.diagnostico || '—'}</span></Info>
            <Info label="Solución aplicada" className="sm:col-span-2"><span className="text-cream/80 whitespace-pre-wrap">{sel.solucion || '—'}</span></Info>
            <Info label="Evidencia" className="sm:col-span-2"><span className="text-cream/80 whitespace-pre-wrap">{sel.evidencia || '—'}</span></Info>
            <Info label="Responsable">{sel.responsable || '—'}</Info>
            <Info label="Reportante">{sel.solicitanteEmail}</Info>
            {sel.fechaResolucion && <Info label="Resuelto">{new Date(sel.fechaResolucion).toLocaleString()}</Info>}
            {sel.fechaCierre && <Info label="Cerrado">{new Date(sel.fechaCierre).toLocaleString()}</Info>}
            {sel.jiraIssueKey && (
              <Info label="Jira (GDICJ)" className="sm:col-span-2">
                <a href={sel.jiraUrl} target="_blank" rel="noopener noreferrer" className="text-amber-light underline underline-offset-4">{sel.jiraIssueKey}</a>
              </Info>
            )}
          </div>
        </Card>

        {/* Panel de gestion: diagnostico / resolucion / cierre */}
        <Card title="Gestionar incidente">
          <div className="grid gap-4">
            <Field label="Estado del flujo">
              <select name="estado" value={gest.estado} onChange={onChange} className={inputCls}>
                {ESTADOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Impacto">
                <select name="impacto" value={gest.impacto} onChange={onChange} className={inputCls}>
                  {NIVELES_IMPACTO.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
              </Field>
              <Field label="Urgencia">
                <select name="urgencia" value={gest.urgencia} onChange={onChange} className={inputCls}>
                  {NIVELES_URGENCIA.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-amber/70 uppercase tracking-[0.15em] text-[10px]">Prioridad →</span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${PRIORIDAD_BADGE[prioridadPreview]}`}>{PRIORIDAD_LABELS[prioridadPreview]}</span>
            </div>
            <Field label="Responsable (equipo de Jira)">
              <select name="responsable" value={gest.responsable} onChange={onChange} className={inputCls}>
                <option value="">— Sin asignar —</option>
                {EQUIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                {gest.responsable && !EQUIPOS.includes(gest.responsable) && (
                  <option value={gest.responsable}>{gest.responsable}</option>
                )}
              </select>
            </Field>
            <Field label="Servicio afectado">
              <ActivoSelect value={gest.servicioAfectado} onChange={(v) => { setGest((g) => ({ ...g, servicioAfectado: v })); setOk(false); }} />
            </Field>
            {servicios.length > 0 && (
              <Field label="Servicio del catálogo de continuidad (contador RTO)">
                <select name="servicioId" value={gest.servicioId} onChange={onChange} className={inputCls}>
                  <option value="">{sel.servicioId ? sel.servicioNombre : '— Sin contador RTO —'}</option>
                  {servicios.filter((s) => s.activo && s.id !== sel.servicioId).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}{s.rtoMinutos ? ` · RTO ${formatMinutos(s.rtoMinutos)}` : ''}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Diagnóstico (causa raíz)">
              <textarea name="diagnostico" value={gest.diagnostico} onChange={onChange} rows={2} className={`${inputCls} resize-y`} />
            </Field>
            <Field label="Solución aplicada">
              <textarea name="solucion" value={gest.solucion} onChange={onChange} rows={2} className={`${inputCls} resize-y`} />
            </Field>
            <Field label="Evidencia (enlace o nota)">
              <textarea name="evidencia" value={gest.evidencia} onChange={onChange} rows={2} className={`${inputCls} resize-y`} />
            </Field>

            {err && <div className="p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}
            {ok && <div className="p-3 rounded bg-green-400/10 text-green-300 text-[13px]">Cambios guardados.</div>}

            <button onClick={guardar} disabled={guardando}
              className="px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors disabled:opacity-50">
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <p className="text-[11px] text-cream/50">
              También puedes mover el incidente en el tablero <strong>GDICJ</strong> de Jira: el estado se
              sincroniza automáticamente con este panel.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ---------------- componentes auxiliares ----------------
const inputCls =
  'w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none';

// Desplegable de activos (igual estilo que las demás barras) con opción "Otro" editable.
function ActivoSelect({ value, onChange }) {
  const listado = ACTIVOS.includes(value);
  const [otro, setOtro] = useState(value !== '' && !listado);
  const mostrarOtro = otro || (value !== '' && !listado);
  return (
    <>
      <select
        value={mostrarOtro ? '__otro__' : value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '__otro__') setOtro(true);
          else { setOtro(false); onChange(v); }
        }}
        className={inputCls}
      >
        <option value="">— Selecciona un activo —</option>
        {ACTIVOS.map((a) => <option key={a} value={a}>{a}</option>)}
        <option value="__otro__">Otro (especificar)…</option>
      </select>
      {mostrarOtro && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} mt-2`}
          placeholder="Especifica el servicio o activo afectado"
        />
      )}
    </>
  );
}

function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[11px] tracking-[0.2em] uppercase text-amber mb-1.5">{label}{required && <span className="text-amber-light/60 ml-1">*</span>}</label>
      {children}
    </div>
  );
}
function Info({ label, children, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[10px] tracking-[0.2em] uppercase text-amber/70">{label}</p>
      <p className="text-cream mt-0.5">{children}</p>
    </div>
  );
}
function FiltroBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${active ? 'bg-amber text-brown border-amber font-semibold' : 'bg-transparent text-cream/80 border-amber/25 hover:border-amber/60 hover:text-cream'}`}>
      {children}
    </button>
  );
}

const TONES = {
  neutral: 'border-amber/20 text-cream',
  blue: 'border-blue-400/40 text-blue-300',
  green: 'border-green-400/40 text-green-300',
  red: 'border-red-400/40 text-red-300',
};
function StatCard({ label, value, tone }) {
  return (
    <div className={`rounded-xl border bg-amber/[0.03] px-4 py-4 ${TONES[tone] ?? TONES.neutral}`}>
      <p className="text-[26px] font-black leading-none">{value}</p>
      <p className="text-[11px] text-cream/60 mt-1">{label}</p>
    </div>
  );
}

// ---------------- contador RTO (Gestión de Continuidad) ----------------

// "90" → "1 h 30 min" (RTO objetivo legible).
function formatMinutos(min) {
  if (min == null) return '—';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// Milisegundos restantes → "1:23:45" (para el countdown en vivo).
function formatCountdown(ms) {
  const total = Math.floor(Math.abs(ms) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0'), ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss.padStart(2, '0')}`;
}

// Estado del contador de un incidente: medido (cumplió / no), corriendo o vencido.
function estadoRto(i, ahora) {
  if (!i.rtoDeadline) return null;
  if (i.cumplioRto != null) return { tipo: i.cumplioRto ? 'cumplido' : 'incumplido' };
  const restante = new Date(i.rtoDeadline).getTime() - ahora;
  if (restante <= 0) return { tipo: 'vencido', ms: restante };
  const total = (i.rtoMinutos ?? 0) * 60_000;
  const porAgotarse = total > 0 && restante <= total * 0.25;
  return { tipo: porAgotarse ? 'por_vencer' : 'en_tiempo', ms: restante };
}

// Badge compacto para la columna RTO de la lista.
function RtoBadge({ i, ahora }) {
  const st = estadoRto(i, ahora);
  if (!st) return <span className="text-cream/30">—</span>;
  switch (st.tipo) {
    case 'cumplido':
      return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] border bg-green-400/10 text-green-300 border-green-400/30">✓ Cumplió RTO</span>;
    case 'incumplido':
      return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] border bg-red-400/10 text-red-300 border-red-400/30">✗ RTO incumplido</span>;
    case 'vencido':
      return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] border bg-red-400/10 text-red-300 border-red-400/30 font-mono">Vencido +{formatCountdown(st.ms)}</span>;
    case 'por_vencer':
      return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] border bg-orange-400/10 text-orange-300 border-orange-400/30 font-mono">⏱ {formatCountdown(st.ms)}</span>;
    default:
      return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] border bg-green-400/10 text-green-300 border-green-400/30 font-mono">⏱ {formatCountdown(st.ms)}</span>;
  }
}

// Panel grande del detalle: countdown + barra de tiempo consumido.
function PanelRto({ sel, ahora }) {
  const st = estadoRto(sel, ahora);
  if (!st) return null;
  const total = (sel.rtoMinutos ?? 0) * 60_000;
  const consumidoPct = st.ms != null && total > 0
    ? Math.min(100, Math.max(0, ((total - st.ms) / total) * 100))
    : 100;
  const tono = {
    cumplido:   { borde: 'border-green-400/25 bg-green-400/[0.04]', texto: 'text-green-300', barra: 'bg-green-400' },
    en_tiempo:  { borde: 'border-green-400/25 bg-green-400/[0.04]', texto: 'text-green-300', barra: 'bg-green-400' },
    por_vencer: { borde: 'border-orange-400/25 bg-orange-400/[0.04]', texto: 'text-orange-300', barra: 'bg-orange-400' },
    vencido:    { borde: 'border-red-400/25 bg-red-400/[0.04]', texto: 'text-red-300', barra: 'bg-red-400' },
    incumplido: { borde: 'border-red-400/25 bg-red-400/[0.04]', texto: 'text-red-300', barra: 'bg-red-400' },
  }[st.tipo];
  const titulo = {
    cumplido: 'Servicio recuperado dentro del RTO',
    incumplido: 'Servicio recuperado fuera del RTO',
    vencido: 'RTO vencido — el servicio sigue sin recuperarse',
    por_vencer: 'Tiempo de recuperación por agotarse',
    en_tiempo: 'Tiempo restante para recuperar el servicio',
  }[st.tipo];

  return (
    <div className={`mt-6 rounded-xl border px-5 py-4 ${tono.borde}`}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[220px]">
          <p className="text-[10px] tracking-[0.25em] uppercase text-amber/70">Continuidad del servicio · {sel.servicioNombre ?? 'servicio'}</p>
          <p className={`mt-1 text-[13px] ${tono.texto}`}>{titulo}</p>
          <p className="mt-0.5 text-[11px] text-cream/50">
            RTO objetivo: {formatMinutos(sel.rtoMinutos)} · límite {new Date(sel.rtoDeadline).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'medium' })}
          </p>
        </div>
        {(st.tipo === 'en_tiempo' || st.tipo === 'por_vencer') && (
          <p className={`font-mono text-[34px] font-black leading-none ${tono.texto}`}>{formatCountdown(st.ms)}</p>
        )}
        {st.tipo === 'vencido' && (
          <p className={`font-mono text-[34px] font-black leading-none ${tono.texto}`}>+{formatCountdown(st.ms)}</p>
        )}
        {(st.tipo === 'cumplido' || st.tipo === 'incumplido') && (
          <p className={`text-[30px] font-black leading-none ${tono.texto}`}>{st.tipo === 'cumplido' ? '✓' : '✗'}</p>
        )}
      </div>
      {st.ms != null && (
        <div className="mt-3 h-2 rounded-full bg-amber/5 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${tono.barra}`} style={{ width: `${consumidoPct}%` }} />
        </div>
      )}
    </div>
  );
}

// Stepper visual del ciclo de vida
function Stepper({ steps, currentId, failed, failLabel, reopened, reopenLabel }) {
  const idx = steps.findIndex((s) => s.id === currentId);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {failed && (
        <span className="px-3 py-1.5 rounded-lg text-[12px] border bg-cream/10 text-cream/60 border-cream/20">{failLabel}</span>
      )}
      {reopened && (
        <span className="px-3 py-1.5 rounded-lg text-[12px] border bg-orange-500/20 text-orange-200 border-orange-400/40">{reopenLabel}</span>
      )}
      {!failed && steps.map((s, i) => {
        const done = idx >= 0 && i < idx;
        const cur = i === idx;
        const cls = cur
          ? 'bg-amber text-brown border-amber'
          : done
            ? 'bg-amber/20 text-amber-light border-amber/40'
            : 'bg-transparent text-cream/40 border-amber/15';
        return (
          <div key={s.id} className="flex items-center gap-1.5">
            <span className={`px-3 py-1.5 rounded-lg text-[12px] border ${cls}`}>{s.label}</span>
            {i < steps.length - 1 && <span className="text-amber/30">→</span>}
          </div>
        );
      })}
    </div>
  );
}

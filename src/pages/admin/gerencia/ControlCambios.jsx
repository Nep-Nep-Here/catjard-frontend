import { useEffect, useMemo, useState } from 'react';
import {
  listarCambios,
  crearCambio,
  eliminarCambio,
  sincronizarCambios,
} from '../../../services/cambiosService.js';
import AdminHeader, { Card, EmptyState } from '../../../components/AdminHeader.jsx';

// ---------- catalogos ----------
const TIPOS = [
  { id: 'estandar',   label: 'Estándar',   pref: 'CHE', desc: 'Repetitivo y de bajo riesgo (pre-aprobado).' },
  { id: 'normal',     label: 'Normal',     pref: 'CHN', desc: 'Nueva funcionalidad; requiere aprobación.' },
  { id: 'emergencia', label: 'Emergencia', pref: 'CHM', desc: 'Corrección crítica; aprobación express.' },
];
const CATEGORIAS = [
  { id: 'infraestructura', label: 'Infraestructura' },
  { id: 'aplicaciones',    label: 'Aplicaciones y BD' },
  { id: 'documentacion',   label: 'Documentación' },
  { id: 'calendario',      label: 'Calendario' },
];
const NIVELES = [
  { id: 'bajo', label: 'Bajo' },
  { id: 'medio', label: 'Medio' },
  { id: 'alto', label: 'Alto' },
];
const PRIORIDADES = [
  { id: 'baja', label: 'Baja' },
  { id: 'media', label: 'Media' },
  { id: 'alta', label: 'Alta' },
];

// Flujo de control de cambios
const ESTADOS = [
  { id: 'solicitado',    label: 'Solicitado' },
  { id: 'en_evaluacion', label: 'En evaluación' },
  { id: 'aprobado',      label: 'Aprobado' },
  { id: 'implementado',  label: 'En implementación' },
  { id: 'en_monitoreo',  label: 'En monitoreo' },
  { id: 'cerrado',       label: 'Cerrado' },
  { id: 'rechazado',     label: 'Rechazado' },
];
const ESTADO_LABELS = Object.fromEntries(ESTADOS.map((e) => [e.id, e.label]));
const ESTADO_BADGE = {
  solicitado: 'bg-blue-400/10 text-blue-300 border-blue-400/30',
  en_evaluacion: 'bg-amber/10 text-amber-light border-amber/30',
  aprobado: 'bg-purple-400/10 text-purple-300 border-purple-400/30',
  implementado: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
  en_monitoreo: 'bg-teal-400/10 text-teal-300 border-teal-400/30',
  cerrado: 'bg-green-400/10 text-green-300 border-green-400/30',
  rechazado: 'bg-red-400/10 text-red-300 border-red-400/30',
};
// Color sólido para las barras del gráfico de distribución.
const ESTADO_BAR = {
  solicitado: 'bg-blue-400',
  en_evaluacion: 'bg-amber',
  aprobado: 'bg-purple-400',
  implementado: 'bg-cyan-400',
  en_monitoreo: 'bg-teal-400',
  cerrado: 'bg-green-400',
  rechazado: 'bg-red-400',
};

// Pipeline de Integracion Continua
const CI_FLOW = ['repositorio', 'build', 'testing', 'validacion', 'monitoreo', 'completado'];
const CI_LABELS = {
  pendiente: 'Pendiente', repositorio: 'Repositorio', build: 'Build', testing: 'Testing',
  validacion: 'Validación', monitoreo: 'Monitoreo', completado: 'Completado', fallido: 'Fallido',
};
const TIPO_LABELS = Object.fromEntries(TIPOS.map((t) => [t.id, t.label]));
const CAT_LABELS = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.label]));

const EMPTY = {
  proyecto: '', tipoCambio: 'normal', categoria: 'aplicaciones', titulo: '', descripcion: '',
  impacto: 'medio', prioridad: 'media', responsable: '', areaAfectada: '',
  riesgo: '', nivelRiesgo: 'medio', planPruebas: '', planRollback: '',
};

export default function ControlCambios() {
  const [cambios, setCambios] = useState([]);
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
    try { setCambios(await listarCambios()); setStatus('ready'); }
    catch (e) { setLoadError(e.message); setStatus('error'); }
  };
  useEffect(() => { cargar(); }, []);

  // El estado lo gestiona el equipo de sistemas en Jira: sincroniza y recarga.
  const sincronizar = async () => {
    setSincronizando(true);
    try { await sincronizarCambios(); } catch { /* best-effort */ }
    await cargar();
    setSincronizando(false);
  };

  const stats = useMemo(() => {
    const total = cambios.length;
    const cerrados = cambios.filter((c) => c.estado === 'cerrado').length;
    const enProceso = cambios.filter((c) => !['cerrado', 'rechazado'].includes(c.estado)).length;
    const avancePct = total ? Math.round((cerrados / total) * 100) : 0;
    const distribucion = ESTADOS.map((e) => ({
      ...e,
      count: cambios.filter((c) => c.estado === e.id).length,
    }));
    return { total, enProceso, avancePct, distribucion };
  }, [cambios]);

  const filtrados = useMemo(
    () => (filtro ? cambios.filter((c) => c.estado === filtro) : cambios),
    [cambios, filtro],
  );

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null); setOk(null);
    if (!form.titulo.trim()) return setErr('Indica el cambio solicitado (título).');
    try {
      const creado = await crearCambio(form);
      setOk(creado);
      setForm(EMPTY);
      await cargar();
      setVista('lista');
    } catch (e2) { setErr(e2.message || 'No se pudo registrar el cambio.'); }
  };

  const borrar = async (id) => {
    try {
      await eliminarCambio(id);
      setCambios((list) => list.filter((x) => x.id !== id));
      if (sel?.id === id) { setSel(null); setVista('lista'); }
    } catch (e) { setErr(e.message || 'No se pudo eliminar.'); }
    setConfirmando(null);
  };

  const abrir = (c) => { setSel(c); setVista('detalle'); setErr(null); };

  // ---------------- VISTA: CREAR ----------------
  if (vista === 'crear') {
    return (
      <section>
        <AdminHeader eyebrow="Dirección · Control de Cambios" title="Nuevo plan de cambio"
          subtitle="Completa el formulario del plan de control de cambios" />
        <Card title="Plan de Control de Cambios" className="mt-8">
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            <Field label="Proyecto"><input name="proyecto" value={form.proyecto} onChange={onChange} className={inputCls} placeholder="Plataforma Cat Jard…" /></Field>
            <Field label="Responsable (TIC / área)"><input name="responsable" value={form.responsable} onChange={onChange} className={inputCls} /></Field>

            <Field label="Tipo de cambio" required className="sm:col-span-2">
              <div className="grid sm:grid-cols-3 gap-3">
                {TIPOS.map((t) => (
                  <label key={t.id}
                    className={`cursor-pointer rounded-xl border p-3 transition-colors ${form.tipoCambio === t.id ? 'border-amber bg-amber/10' : 'border-amber/20 hover:border-amber/50'}`}>
                    <input type="radio" name="tipoCambio" value={t.id} checked={form.tipoCambio === t.id} onChange={onChange} className="sr-only" />
                    <p className="text-[14px] font-semibold text-cream">{t.label} <span className="text-amber-light/70 text-[11px] font-mono">{t.pref}</span></p>
                    <p className="text-[11px] text-cream/60 mt-1 leading-snug">{t.desc}</p>
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Categoría (alcance)" required>
              <select name="categoria" value={form.categoria} onChange={onChange} className={inputCls}>
                {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Prioridad">
              <select name="prioridad" value={form.prioridad} onChange={onChange} className={inputCls}>
                {PRIORIDADES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>

            <Field label="Cambio solicitado (título)" required className="sm:col-span-2">
              <input name="titulo" value={form.titulo} onChange={onChange} maxLength={160} className={inputCls} placeholder="Resume el cambio en una frase" />
            </Field>
            <Field label="Descripción" className="sm:col-span-2">
              <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={3} className={`${inputCls} resize-y`} />
            </Field>

            <Field label="Área afectada"><input name="areaAfectada" value={form.areaAfectada} onChange={onChange} className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Impacto">
                <select name="impacto" value={form.impacto} onChange={onChange} className={inputCls}>
                  {NIVELES.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
              </Field>
              <Field label="Nivel de riesgo">
                <select name="nivelRiesgo" value={form.nivelRiesgo} onChange={onChange} className={inputCls}>
                  {NIVELES.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Riesgo" className="sm:col-span-2">
              <textarea name="riesgo" value={form.riesgo} onChange={onChange} rows={2} className={`${inputCls} resize-y`} />
            </Field>
            <Field label="Plan de pruebas" className="sm:col-span-2">
              <textarea name="planPruebas" value={form.planPruebas} onChange={onChange} rows={2} className={`${inputCls} resize-y`} placeholder="Tipo de prueba, responsable, evidencia…" />
            </Field>
            <Field label="Plan de rollback" className="sm:col-span-2">
              <textarea name="planRollback" value={form.planRollback} onChange={onChange} rows={2} className={`${inputCls} resize-y`} placeholder="Cómo revertir si algo falla…" />
            </Field>

            {err && <div className="sm:col-span-2 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors">Registrar cambio</button>
              <button type="button" onClick={() => { setVista('lista'); setErr(null); }} className="px-4 py-2.5 rounded-full text-cream/70 text-[13px] hover:text-cream">Cancelar</button>
            </div>
          </form>
        </Card>
      </section>
    );
  }

  // ---------------- VISTA: DETALLE / SEGUIMIENTO ----------------
  if (vista === 'detalle' && sel) {
    const ciActiva = ['aprobado', 'implementado', 'en_monitoreo', 'cerrado'].includes(sel.estado);
    return (
      <section>
        <AdminHeader eyebrow="Dirección · Control de Cambios"
          title={`${sel.codigo} — ${sel.titulo}`}
          subtitle={`${TIPO_LABELS[sel.tipoCambio]} · ${CAT_LABELS[sel.categoria]}`}
          action={<button onClick={() => { setVista('lista'); setSel(null); }} className="rounded-full border border-amber/30 text-cream/80 px-4 py-2 text-[13px] hover:border-amber/60 hover:text-cream transition-colors">← Volver</button>}
        />

        {/* Flujo de aprobacion */}
        <div className="mt-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-amber/70 mb-2">Flujo de control de cambios</p>
          <Stepper steps={ESTADOS.filter((e) => e.id !== 'rechazado')} currentId={sel.estado}
            failed={sel.estado === 'rechazado'} failLabel="Rechazado" />
        </div>

        {/* Pipeline CI */}
        <div className="mt-6">
          <p className="text-[10px] tracking-[0.25em] uppercase text-teal-300/80 mb-2">Integración Continua (tras aprobación)</p>
          {sel.etapaCI === 'pendiente' && !ciActiva ? (
            <p className="text-cream/50 text-[13px]">El pipeline inicia cuando el cambio es aprobado.</p>
          ) : (
            <Stepper steps={CI_FLOW.map((id) => ({ id, label: CI_LABELS[id] }))} currentId={sel.etapaCI}
              failed={sel.etapaCI === 'fallido'} failLabel="Fallido" color="teal" />
          )}
        </div>

        <Card title="Plan de Control de Cambios" className="mt-8">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
            <Info label="Proyecto">{sel.proyecto || '—'}</Info>
            <Info label="Versión">{sel.version}</Info>
            <Info label="Tipo / Código">{TIPO_LABELS[sel.tipoCambio]} · <span className="font-mono">{sel.codigo}</span></Info>
            <Info label="Prioridad">{sel.prioridad}</Info>
            <Info label="Cambio solicitado" className="sm:col-span-2"><span className="text-cream/85">{sel.titulo}</span></Info>
            <Info label="Descripción" className="sm:col-span-2"><span className="text-cream/80 whitespace-pre-wrap">{sel.descripcion || '—'}</span></Info>
            <Info label="Área afectada">{sel.areaAfectada || '—'}</Info>
            <Info label="Impacto / Riesgo">{sel.impacto || '—'} / {sel.nivelRiesgo || '—'}</Info>
            <Info label="Riesgo" className="sm:col-span-2"><span className="text-cream/80 whitespace-pre-wrap">{sel.riesgo || '—'}</span></Info>
            <Info label="Plan de pruebas" className="sm:col-span-2"><span className="text-cream/80 whitespace-pre-wrap">{sel.planPruebas || '—'}</span></Info>
            <Info label="Plan de rollback" className="sm:col-span-2"><span className="text-cream/80 whitespace-pre-wrap">{sel.planRollback || '—'}</span></Info>
            <Info label="Responsable">{sel.responsable || '—'}</Info>
            <Info label="Solicitante">{sel.solicitanteEmail}</Info>
            {sel.jiraIssueKey && (
              <Info label="Jira (gestión de cambios)" className="sm:col-span-2">
                <a href={sel.jiraUrl} target="_blank" rel="noopener noreferrer" className="text-amber-light underline underline-offset-4">{sel.jiraIssueKey}</a>
              </Info>
            )}
          </div>

          {err && <div className="mt-4 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}

          <p className="mt-6 pt-4 border-t border-amber/10 text-[12px] text-cream/50">
            El estado lo gestiona el equipo de sistemas en su tablero de Jira y se sincroniza
            automáticamente con este panel. Usa «Sincronizar con Jira» para ver el avance al instante.
          </p>
        </Card>
      </section>
    );
  }

  // ---------------- VISTA: LISTA + DASHBOARD ----------------
  return (
    <section>
      <AdminHeader
        eyebrow="Dirección · Control de Cambios"
        title="Control de Cambios"
        subtitle={`${cambios.length} cambios registrados`}
        action={
          <div className="flex gap-2">
            <button onClick={sincronizar} disabled={sincronizando}
              className="rounded-full border border-amber/30 text-cream/80 px-4 py-2 text-[13px] hover:border-amber/60 hover:text-cream transition-colors disabled:opacity-50">
              {sincronizando ? 'Sincronizando…' : '↻ Sincronizar con Jira'}
            </button>
            <button onClick={() => { setForm(EMPTY); setVista('crear'); setErr(null); setOk(null); }}
              className="rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors">+ Nuevo plan de cambio</button>
          </div>
        }
      />

      {ok && (
        <div className="mt-6 p-3 rounded bg-green-400/10 text-green-300 text-[13px]">
          Cambio <strong>{ok.codigo}</strong> registrado.
          {ok.jiraUrl && <> · Jira: <a href={ok.jiraUrl} target="_blank" rel="noopener noreferrer" className="underline">{ok.jiraIssueKey}</a></>}
        </div>
      )}

      {/* Resumen: métricas agregadas + distribución por estado */}
      <div className="mt-8 grid lg:grid-cols-3 gap-3">
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
          <StatCard label="Total de cambios" value={stats.total} tone="neutral" />
          <StatCard label="En proceso" value={stats.enProceso} tone="blue" />
          <StatCard label="% Completado" value={`${stats.avancePct}%`} tone="green" />
        </div>

        <div className="lg:col-span-2 rounded-xl border border-amber/15 bg-amber/[0.03] px-5 py-4">
          <p className="text-[10px] tracking-[0.25em] uppercase text-amber/70 mb-3">Distribución por estado</p>
          {stats.total === 0 ? (
            <p className="text-cream/40 text-[13px]">Sin cambios registrados.</p>
          ) : (
            <div className="space-y-2.5">
              {stats.distribucion.map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-[12px] text-cream/70">{d.label}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-amber/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ESTADO_BAR[d.id] ?? 'bg-amber'}`}
                      style={{ width: `${(d.count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-[12px] text-cream/85">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loadError && <div className="mt-6 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">No se pudieron cargar los cambios: {loadError}</div>}
      {status === 'loading' && <p className="mt-6 text-cream/60 text-[13px]">Cargando…</p>}

      {/* Filtros por estado */}
      <div className="mt-8 flex flex-wrap gap-2">
        <FiltroBtn active={filtro === ''} onClick={() => setFiltro('')}>Todos</FiltroBtn>
        {ESTADOS.map((e) => (
          <FiltroBtn key={e.id} active={filtro === e.id} onClick={() => setFiltro(e.id)}>{e.label}</FiltroBtn>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-8"><EmptyState titulo="Sin cambios" descripcion="Registra el primer plan de control de cambios." /></div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-amber/15">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
              <tr>
                <th className="px-5 py-4">Código</th>
                <th className="px-5 py-4">Cambio</th>
                <th className="px-5 py-4">Categoría</th>
                <th className="px-5 py-4">Prioridad</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">CI</th>
                <th className="px-5 py-4">Jira</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => (
                <tr key={c.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                  <td className="px-5 py-3 font-mono text-[12px] text-cream/85">{c.codigo}</td>
                  <td className="px-5 py-3 text-cream font-medium max-w-xs truncate">{c.titulo}</td>
                  <td className="px-5 py-3 text-cream/80">{CAT_LABELS[c.categoria] ?? c.categoria}</td>
                  <td className="px-5 py-3 text-cream/80">{c.prioridad}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${ESTADO_BADGE[c.estado] ?? ''}`}>{ESTADO_LABELS[c.estado] ?? c.estado}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] ${c.etapaCI === 'fallido' ? 'text-red-300' : c.etapaCI === 'completado' ? 'text-green-300' : 'text-teal-300/80'}`}>
                      {CI_LABELS[c.etapaCI] ?? c.etapaCI}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {c.jiraIssueKey ? (
                      <a href={c.jiraUrl} target="_blank" rel="noopener noreferrer" className="text-amber-light underline underline-offset-4 text-[12px]">{c.jiraIssueKey}</a>
                    ) : <span className="text-cream/30">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button onClick={() => abrir(c)} className="text-amber-light hover:text-amber underline underline-offset-4 text-[12px] mr-3">Gestionar</button>
                    {confirmando === c.id ? (
                      <span className="text-[12px]">
                        <button onClick={() => borrar(c.id)} className="text-red-300 hover:text-red-200 underline underline-offset-4 mr-2">Confirmar</button>
                        <button onClick={() => setConfirmando(null)} className="text-cream/60 hover:text-cream">cancelar</button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmando(c.id)} className="text-red-300/80 hover:text-red-300 underline underline-offset-4 text-[12px]">Eliminar</button>
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

// ---------------- componentes auxiliares ----------------
const inputCls =
  'w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none';

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
  amber: 'border-amber/40 text-amber-light',
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

// Stepper visual del flujo / pipeline
function Stepper({ steps, currentId, failed, failLabel, color = 'amber' }) {
  const idx = steps.findIndex((s) => s.id === currentId);
  const doneCls = color === 'teal' ? 'bg-teal-500/20 text-teal-200 border-teal-400/40' : 'bg-amber/20 text-amber-light border-amber/40';
  const curCls = color === 'teal' ? 'bg-teal-400 text-brown border-teal-300' : 'bg-amber text-brown border-amber';
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {failed && (
        <span className="px-3 py-1.5 rounded-lg text-[12px] border bg-red-500/20 text-red-200 border-red-400/40">{failLabel}</span>
      )}
      {!failed && steps.map((s, i) => {
        const done = idx >= 0 && i < idx;
        const cur = i === idx;
        const cls = cur ? curCls : done ? doneCls : 'bg-transparent text-cream/40 border-amber/15';
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

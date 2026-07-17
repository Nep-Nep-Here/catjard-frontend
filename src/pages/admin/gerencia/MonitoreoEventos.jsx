import { useEffect, useMemo, useRef, useState } from 'react';
import {
  listarEventos,
  metricasActuales,
  alertasDigitalOcean,
  sincronizarEventos,
  simularEvento,
  simularReinicio,
  enviarEventoAJira,
  actualizarEvento,
  eliminarEvento,
} from '../../../services/eventosService.js';
import AdminHeader, { Card, EmptyState } from '../../../components/AdminHeader.jsx';

// ---------- catálogos ----------
// Fase 1 — Clasificación de eventos por severidad (umbral que cruza la métrica).
const SEVERIDADES = [
  { id: 'informacion', label: 'Información' },
  { id: 'advertencia', label: 'Advertencia' },
  { id: 'alto',        label: 'Alto' },
  { id: 'critico',     label: 'Crítico' },
];
const SEV_LABELS = Object.fromEntries(SEVERIDADES.map((s) => [s.id, s.label]));
const SEV_BADGE = {
  informacion: 'bg-blue-400/10 text-blue-300 border-blue-400/30',
  advertencia: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/30',
  alto:        'bg-orange-400/10 text-orange-300 border-orange-400/30',
  critico:     'bg-red-400/10 text-red-300 border-red-400/30',
};
// Barra del gauge en vivo: informacion = operación normal (verde).
const SEV_BAR = {
  informacion: 'bg-green-400',
  advertencia: 'bg-yellow-400',
  alto:        'bg-orange-400',
  critico:     'bg-red-400',
};

const ESTADOS = [
  { id: 'nuevo',       label: 'Nuevo' },
  { id: 'en_revision', label: 'En revisión' },
  { id: 'atendido',    label: 'Atendido' },
  { id: 'descartado',  label: 'Descartado' },
];
const ESTADO_LABELS = Object.fromEntries(ESTADOS.map((e) => [e.id, e.label]));
const ESTADO_BADGE = {
  nuevo:       'bg-blue-400/10 text-blue-300 border-blue-400/30',
  en_revision: 'bg-amber/10 text-amber-light border-amber/30',
  atendido:    'bg-green-400/10 text-green-300 border-green-400/30',
  descartado:  'bg-cream/10 text-cream/50 border-cream/20',
};

const METRICAS = [
  { id: 'cpu',         label: 'CPU' },
  { id: 'memoria',     label: 'Memoria RAM' },
  { id: 'disco',       label: 'Disco' },
  { id: 'load',        label: 'Load (5 min)' },
  { id: 'red_entrada', label: 'Red entrante' },
  { id: 'red_salida',  label: 'Red saliente' },
];
const METRICA_LABELS = Object.fromEntries(METRICAS.map((m) => [m.id, m.label]));

// Presets del simulador (los ejemplos vistos en clase).
const PRESETS = [
  { metrica: 'cpu',     valor: 95, label: 'CPU 95% → Crítico' },
  { metrica: 'memoria', valor: 85, label: 'RAM 85% → Alto' },
  { metrica: 'disco',   valor: 95, label: 'Disco 95% → Crítico' },
  { metrica: 'cpu',     valor: 72, label: 'CPU 72% → Advertencia' },
];

const POLL_MS = 30_000; // el panel se refresca solo cada 30 s

export default function MonitoreoEventos() {
  const [eventos, setEventos] = useState([]);
  const [metricas, setMetricas] = useState([]);
  const [alertasDO, setAlertasDO] = useState([]);
  const [status, setStatus] = useState('idle');
  const [loadError, setLoadError] = useState(null);
  const [vista, setVista] = useState('lista');   // lista | detalle | simular
  const [sel, setSel] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [ok, setOk] = useState(null);
  const [err, setErr] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [simulandoReinicio, setSimulandoReinicio] = useState(false);
  const [confirmando, setConfirmando] = useState(null);
  const [enviandoJira, setEnviandoJira] = useState(null);
  const pollRef = useRef(null);

  const cargar = async (silencioso = false) => {
    if (!silencioso) { setStatus('loading'); setLoadError(null); }
    try {
      const [evs, mets] = await Promise.all([listarEventos(), metricasActuales()]);
      setEventos(evs);
      setMetricas(mets);
      setStatus('ready');
    } catch (e) {
      if (!silencioso) { setLoadError(e.message); setStatus('error'); }
    }
  };

  useEffect(() => {
    cargar();
    // Las políticas de DO casi no cambian: se cargan una sola vez (best-effort).
    alertasDigitalOcean().then(setAlertasDO).catch(() => {});
    pollRef.current = setInterval(() => cargar(true), POLL_MS);
    return () => clearInterval(pollRef.current);
  }, []);

  const sincronizar = async () => {
    setSincronizando(true); setErr(null);
    try {
      const r = await sincronizarEventos();
      setOk(r?.creados > 0
        ? { texto: `Lectura completada: ${r.creados} evento(s) nuevo(s).` }
        : { texto: 'Lectura completada: métricas dentro de lo esperado, sin eventos nuevos.' });
    } catch (e) { setErr(e.message || 'No se pudo leer las métricas.'); }
    await cargar(true);
    setSincronizando(false);
  };

  // Demo: abre el incidente de reinicio sin reiniciar el Droplet. El incidente aparece en
  // Gestión de Incidentes (con su contador RTO de infraestructura), no en esta lista.
  const simularReinicioHandler = async () => {
    setSimulandoReinicio(true); setErr(null); setOk(null);
    try {
      const inc = await simularReinicio();
      setOk({ texto: `Reinicio simulado: incidente ${inc?.codigo ?? ''} abierto en Gestión de Incidentes (Infraestructura, con contador RTO).` });
    } catch (e) { setErr(e.message || 'No se pudo simular el reinicio.'); }
    setSimulandoReinicio(false);
  };

  const enviarJira = async (id) => {
    setEnviandoJira(id); setErr(null);
    try {
      const actualizado = await enviarEventoAJira(id);
      setOk({ texto: `Evento ${actualizado.codigo} enviado a Jira`, jira: actualizado });
      setEventos((list) => list.map((x) => (x.id === id ? actualizado : x)));
      if (sel?.id === id) setSel(actualizado);
    } catch (e) { setErr(e.message || 'No se pudo enviar a Jira.'); }
    setEnviandoJira(null);
  };

  const borrar = async (id) => {
    try {
      await eliminarEvento(id);
      setEventos((list) => list.filter((x) => x.id !== id));
      if (sel?.id === id) { setSel(null); setVista('lista'); }
    } catch (e) { setErr(e.message || 'No se pudo eliminar.'); }
    setConfirmando(null);
  };

  const stats = useMemo(() => {
    const porSeveridad = (sev) => eventos.filter((e) => e.severidad === sev).length;
    return {
      total: eventos.length,
      informacion: porSeveridad('informacion'),
      advertencias: porSeveridad('advertencia'),
      altos: porSeveridad('alto'),
      criticos: porSeveridad('critico'),
      conIncidente: eventos.filter((e) => e.generaIncidente).length,
    };
  }, [eventos]);

  const filtrados = useMemo(
    () => (filtro ? eventos.filter((e) => e.severidad === filtro) : eventos),
    [eventos, filtro],
  );

  const abrir = (e) => { setSel(e); setVista('detalle'); setErr(null); };

  // ---------------- VISTA: SIMULAR ----------------
  if (vista === 'simular') {
    return (
      <Simulador
        onVolver={() => { setVista('lista'); setErr(null); }}
        onSimulado={async (creado) => {
          setOk({ texto: `Evento ${creado.codigo} generado (${SEV_LABELS[creado.severidad] ?? creado.severidad})`
            + (creado.incidenteCodigo ? ` · Incidente ${creado.incidenteCodigo} auto-creado` : '') });
          await cargar(true);
          setVista('lista');
        }}
      />
    );
  }

  // ---------------- VISTA: DETALLE ----------------
  if (vista === 'detalle' && sel) {
    return (
      <DetalleEvento
        sel={sel}
        enviandoJira={enviandoJira === sel.id}
        onEnviarJira={() => enviarJira(sel.id)}
        onVolver={() => { setVista('lista'); setSel(null); }}
        onActualizado={async (actualizado) => {
          setSel(actualizado);
          setEventos((list) => list.map((x) => (x.id === actualizado.id ? actualizado : x)));
        }}
      />
    );
  }

  // ---------------- VISTA: LISTA + PANEL ----------------
  return (
    <section>
      <AdminHeader
        eyebrow="Dirección · Monitoreo Estratégico"
        title="Monitoreo de Eventos"
        subtitle={`Droplet DigitalOcean · ${eventos.length} eventos registrados · el panel consulta cada 30 s (las métricas de DigitalOcean pueden tardar 1–2 min en reflejarse)`}
        action={
          <div className="flex gap-2">
            <button onClick={sincronizar} disabled={sincronizando}
              className="rounded-full border border-amber/30 text-cream/80 px-4 py-2 text-[13px] hover:border-amber/60 hover:text-cream transition-colors disabled:opacity-50">
              {sincronizando ? 'Leyendo…' : '↻ Leer métricas ahora'}
            </button>
            <button onClick={simularReinicioHandler} disabled={simulandoReinicio}
              className="rounded-full border border-amber/30 text-cream/80 px-4 py-2 text-[13px] hover:border-amber/60 hover:text-cream transition-colors disabled:opacity-50">
              {simulandoReinicio ? 'Simulando…' : '⟳ Simular reinicio'}
            </button>
            <button onClick={() => { setVista('simular'); setErr(null); setOk(null); }}
              className="rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors">
              + Simular evento
            </button>
          </div>
        }
      />

      {ok && (
        <div className="mt-6 p-3 rounded bg-green-400/10 text-green-300 text-[13px]">
          {ok.texto}
          {ok.jira?.jiraUrl && <> · Jira: <a href={ok.jira.jiraUrl} target="_blank" rel="noopener noreferrer" className="underline">{ok.jira.jiraIssueKey}</a></>}
        </div>
      )}
      {err && <div className="mt-6 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}

      {/* Métricas en vivo del Droplet (clasificadas con los mismos umbrales del backend) */}
      <div className="mt-8">
        <p className="text-[10px] tracking-[0.25em] uppercase text-amber/70 mb-3">Métricas en vivo del Droplet</p>
        {metricas.length === 0 ? (
          <div className="rounded-xl border border-amber/15 bg-amber/[0.03] px-5 py-4 text-[13px] text-cream/50">
            Sin lecturas todavía. Verifica que el backend tenga configurado el token de DigitalOcean
            (DO_API_TOKEN) o usa «Leer métricas ahora».
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {metricas.map((m) => <GaugeMetrica key={m.metrica} m={m} />)}
          </div>
        )}
      </div>

      {/* Resumen de eventos: total + conteo por severidad + incidentes */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Eventos totales" value={stats.total} tone="neutral" />
        <StatCard label="Información" value={stats.informacion} tone="blue" />
        <StatCard label="Advertencia" value={stats.advertencias} tone="yellow" />
        <StatCard label="Alto" value={stats.altos} tone="orange" />
        <StatCard label="Crítico" value={stats.criticos} tone="red" />
        <StatCard label="Incidentes generados" value={stats.conIncidente} tone="green" />
      </div>

      {/* Alertas configuradas en DigitalOcean */}
      {alertasDO.length > 0 && (
        <Card title="Alertas configuradas en DigitalOcean" className="mt-8">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
            {alertasDO.map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-3 border-b border-amber/10 pb-2">
                <span className="text-cream/80 truncate">{a.description}</span>
                <span className="shrink-0 text-[11px] text-cream/50">
                  umbral {a.value}{String(a.type ?? '').includes('bandwidth') ? ' Mbps' : String(a.type ?? '').includes('load') ? '' : '%'}
                  {a.enabled ? '' : ' · desactivada'}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-cream/50">
            Estas alertas también notifican por correo. El panel las complementa leyendo las métricas
            directamente desde la API de DigitalOcean.
          </p>
        </Card>
      )}

      {loadError && <div className="mt-6 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">No se pudieron cargar los eventos: {loadError}</div>}
      {status === 'loading' && <p className="mt-6 text-cream/60 text-[13px]">Cargando…</p>}

      {/* Filtros por severidad */}
      <div className="mt-8 flex flex-wrap gap-2">
        <FiltroBtn active={filtro === ''} onClick={() => setFiltro('')}>Todos</FiltroBtn>
        {SEVERIDADES.map((s) => (
          <FiltroBtn key={s.id} active={filtro === s.id} onClick={() => setFiltro(s.id)}>{s.label}</FiltroBtn>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-8">
          <EmptyState titulo="Sin eventos" descripcion="El Droplet está tranquilo. Usa «Simular evento» para probar el flujo completo." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-amber/15">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
              <tr>
                <th className="px-5 py-4">Código</th>
                <th className="px-5 py-4">Fecha / hora</th>
                <th className="px-5 py-4">Métrica</th>
                <th className="px-5 py-4">Valor</th>
                <th className="px-5 py-4">Severidad</th>
                <th className="px-5 py-4">Incidente</th>
                <th className="px-5 py-4">Jira</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((e) => (
                <tr key={e.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                  <td className="px-5 py-3 font-mono text-[12px] text-cream/85">{e.codigo}</td>
                  <td className="px-5 py-3 text-cream/70 text-[12px] whitespace-nowrap">{formatFecha(e.fechaHora)}</td>
                  <td className="px-5 py-3 text-cream font-medium">{METRICA_LABELS[e.metrica] ?? e.metrica}</td>
                  <td className="px-5 py-3 text-cream/85 whitespace-nowrap">{e.valor} {e.unidad}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${SEV_BADGE[e.severidad] ?? ''}`}>{SEV_LABELS[e.severidad] ?? e.severidad}</span>
                  </td>
                  <td className="px-5 py-3">
                    {e.incidenteCodigo
                      ? <span className="font-mono text-[12px] text-cream/85">{e.incidenteCodigo}</span>
                      : <span className="text-cream/30">No</span>}
                  </td>
                  <td className="px-5 py-3">
                    {e.jiraIssueKey ? (
                      <a href={e.jiraUrl} target="_blank" rel="noopener noreferrer" className="text-amber-light underline underline-offset-4 text-[12px]">{e.jiraIssueKey}</a>
                    ) : e.generaIncidente ? (
                      <button onClick={() => enviarJira(e.id)} disabled={enviandoJira === e.id}
                        className="text-amber-light hover:text-amber underline underline-offset-4 text-[12px] disabled:opacity-50">
                        {enviandoJira === e.id ? 'Enviando…' : 'Enviar a Jira'}
                      </button>
                    ) : <span className="text-cream/30">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${ESTADO_BADGE[e.estado] ?? ''}`}>{ESTADO_LABELS[e.estado] ?? e.estado}</span>
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button onClick={() => abrir(e)} className="text-amber-light hover:text-amber underline underline-offset-4 text-[12px] mr-3">Detalle</button>
                    {confirmando === e.id ? (
                      <span className="text-[12px]">
                        <button onClick={() => borrar(e.id)} className="text-red-300 hover:text-red-200 underline underline-offset-4 mr-2">Confirmar</button>
                        <button onClick={() => setConfirmando(null)} className="text-cream/60 hover:text-cream">cancelar</button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmando(e.id)} className="text-red-300/80 hover:text-red-300 underline underline-offset-4 text-[12px]">Eliminar</button>
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

// ---------------- VISTA DETALLE ----------------
function DetalleEvento({ sel, onVolver, onActualizado, onEnviarJira, enviandoJira }) {
  const [gest, setGest] = useState({
    estado: sel.estado,
    responsable: sel.responsable ?? '',
    accionRecomendada: sel.accionRecomendada ?? '',
    tiempoMaximo: sel.tiempoMaximo ?? '',
  });
  const [guardando, setGuardando] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(false);

  const onChange = (e) => { setGest((g) => ({ ...g, [e.target.name]: e.target.value })); setOk(false); };

  const guardar = async () => {
    setGuardando(true); setErr(null); setOk(false);
    try {
      const actualizado = await actualizarEvento(sel.id, gest);
      setOk(true);
      await onActualizado(actualizado);
    } catch (e) { setErr(e.message || 'No se pudo guardar.'); }
    setGuardando(false);
  };

  return (
    <section>
      <AdminHeader eyebrow="Dirección · Monitoreo Estratégico"
        title={`${sel.codigo} — ${METRICA_LABELS[sel.metrica] ?? sel.metrica}`}
        subtitle={sel.mensaje}
        action={<button onClick={onVolver} className="rounded-full border border-amber/30 text-cream/80 px-4 py-2 text-[13px] hover:border-amber/60 hover:text-cream transition-colors">← Volver</button>}
      />

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <Card title="Detalle del evento">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
            <Info label="Código"><span className="font-mono">{sel.codigo}</span></Info>
            <Info label="Fecha / hora">{formatFecha(sel.fechaHora)}</Info>
            <Info label="Origen">{sel.origen === 'digitalocean' ? 'DigitalOcean (API Monitoring)' : 'Simulación'}</Info>
            <Info label="Droplet">{sel.droplet || '—'}</Info>
            <Info label="Métrica">{METRICA_LABELS[sel.metrica] ?? sel.metrica}</Info>
            <Info label="Valor medido">{sel.valor} {sel.unidad}{sel.umbral != null && <span className="text-cream/50"> (umbral {sel.umbral} {sel.unidad})</span>}</Info>
            <Info label="Severidad (Fase 1 — Clasificación)">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${SEV_BADGE[sel.severidad] ?? ''}`}>{SEV_LABELS[sel.severidad] ?? sel.severidad}</span>
            </Info>
            <Info label="¿Genera incidente? (Fase 2)">
              {sel.generaIncidente
                ? <span className="text-red-300">Sí{sel.incidenteCodigo && <> · <span className="font-mono">{sel.incidenteCodigo}</span></>}</span>
                : <span className="text-green-300">No</span>}
            </Info>
            <Info label="Justificación" className="sm:col-span-2">
              <span className="text-cream/80 whitespace-pre-wrap">{sel.justificacion || '—'}</span>
            </Info>
            {sel.jiraIssueKey && (
              <Info label="Jira (GDICJ)" className="sm:col-span-2">
                <a href={sel.jiraUrl} target="_blank" rel="noopener noreferrer" className="text-amber-light underline underline-offset-4">{sel.jiraIssueKey}</a>
              </Info>
            )}
          </div>

          {sel.generaIncidente && !sel.jiraIssueKey && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.04] px-4 py-3">
              <div className="flex-1 text-[12px] text-cream/70">
                Este evento generó el incidente <span className="font-mono text-cream/90">{sel.incidenteCodigo}</span>.
                Puedes escalarlo al tablero <strong>GDICJ</strong> de Jira.
              </div>
              <button onClick={onEnviarJira} disabled={enviandoJira}
                className="shrink-0 px-5 py-2 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors disabled:opacity-50">
                {enviandoJira ? 'Enviando…' : 'Enviar a Jira'}
              </button>
            </div>
          )}
        </Card>

        <Card title="Plan de respuesta (Fase 5)">
          <div className="grid gap-4">
            <div className="rounded-xl border border-amber/15 bg-amber/[0.03] px-4 py-3 text-[12px] text-cream/70">
              La acción, el responsable y el tiempo máximo se <strong>autodesignan</strong> según la
              clasificación del evento; aquí puedes ajustarlos y registrar el seguimiento.
            </div>
            <Field label="Estado del evento">
              <select name="estado" value={gest.estado} onChange={onChange} className={inputCls}>
                {ESTADOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </Field>
            <Field label="Responsable">
              <input name="responsable" value={gest.responsable} onChange={onChange} className={inputCls} placeholder="Equipo o persona asignada" />
            </Field>
            <Field label="Acción o respuesta">
              <textarea name="accionRecomendada" value={gest.accionRecomendada} onChange={onChange} rows={4} className={`${inputCls} resize-y`} />
            </Field>
            <Field label="Tiempo máximo">
              <input name="tiempoMaximo" value={gest.tiempoMaximo} onChange={onChange} className={inputCls} placeholder="p. ej. 15 min" />
            </Field>

            {err && <div className="p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}
            {ok && <div className="p-3 rounded bg-green-400/10 text-green-300 text-[13px]">Cambios guardados.</div>}

            <button onClick={guardar} disabled={guardando}
              className="px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors disabled:opacity-50">
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ---------------- VISTA SIMULADOR ----------------
function Simulador({ onVolver, onSimulado }) {
  const [form, setForm] = useState({ metrica: 'cpu', valor: 95 });
  const [enviando, setEnviando] = useState(false);
  const [err, setErr] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true); setErr(null);
    try {
      const creado = await simularEvento({ metrica: form.metrica, valor: Number(form.valor) });
      await onSimulado(creado);
    } catch (e2) { setErr(e2.message || 'No se pudo simular el evento.'); }
    setEnviando(false);
  };

  return (
    <section>
      <AdminHeader eyebrow="Dirección · Monitoreo Estratégico" title="Simular evento"
        subtitle="La lectura simulada pasa por el mismo pipeline: clasificación → ¿incidente? → plan de respuesta"
        action={<button onClick={onVolver} className="rounded-full border border-amber/30 text-cream/80 px-4 py-2 text-[13px] hover:border-amber/60 hover:text-cream transition-colors">← Volver</button>}
      />

      <Card title="Lectura simulada" className="mt-8 max-w-2xl">
        <div className="mb-5">
          <p className="text-[11px] tracking-[0.2em] uppercase text-amber mb-2">Ejemplos de la clase</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.label} type="button"
                onClick={() => setForm({ metrica: p.metrica, valor: p.valor })}
                className="px-3 py-1.5 rounded-full text-[12px] border border-amber/25 text-cream/80 hover:border-amber/60 hover:text-cream transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
          <Field label="Métrica" required>
            <select value={form.metrica} onChange={(e) => setForm((f) => ({ ...f, metrica: e.target.value }))} className={inputCls}>
              {METRICAS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Valor" required>
            <input type="number" step="any" value={form.valor}
              onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} className={inputCls} />
          </Field>

          {err && <div className="sm:col-span-2 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}

          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={enviando}
              className="px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors disabled:opacity-50">
              {enviando ? 'Simulando…' : 'Generar evento'}
            </button>
            <button type="button" onClick={onVolver} className="px-4 py-2.5 rounded-full text-cream/70 text-[13px] hover:text-cream">Cancelar</button>
          </div>
        </form>
        <p className="mt-4 text-[11px] text-cream/50">
          Nota: una lectura con valor normal solo se registra si la métrica venía de una alerta
          (se guarda como «recuperación»); de lo contrario no genera evento.
        </p>
      </Card>
    </section>
  );
}

// ---------------- componentes auxiliares ----------------
const inputCls =
  'w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none';

// Gauge de una métrica en vivo: barra proporcional al umbral crítico, color por severidad.
function GaugeMetrica({ m }) {
  const esPct = m.unidad === '%';
  const tope = esPct ? 100 : (m.umbralCritical || 1);
  const pct = Math.min(100, Math.max(0, (m.valor / tope) * 100));
  return (
    <div className="rounded-xl border border-amber/15 bg-amber/[0.03] px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[12px] text-cream/70">{METRICA_LABELS[m.metrica] ?? m.metrica}</p>
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${SEV_BADGE[m.severidad] ?? ''}`}>
          {SEV_LABELS[m.severidad] ?? m.severidad}
        </span>
      </div>
      <p className="mt-1.5 text-[22px] font-black leading-none text-cream">
        {m.valor} <span className="text-[12px] font-normal text-cream/50">{m.unidad}</span>
      </p>
      <div className="mt-2.5 h-2 rounded-full bg-amber/5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${SEV_BAR[m.severidad] ?? 'bg-amber'}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-[10px] text-cream/40">
        umbrales: {m.umbralWarning} / {m.umbralError} / {m.umbralCritical} {m.unidad}
      </p>
    </div>
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
  yellow: 'border-yellow-400/40 text-yellow-300',
  orange: 'border-orange-400/40 text-orange-300',
  red: 'border-red-400/40 text-red-300',
  green: 'border-green-400/40 text-green-300',
};
function StatCard({ label, value, tone }) {
  return (
    <div className={`rounded-xl border bg-amber/[0.03] px-4 py-4 ${TONES[tone] ?? TONES.neutral}`}>
      <p className="text-[26px] font-black leading-none">{value}</p>
      <p className="text-[11px] text-cream/60 mt-1">{label}</p>
    </div>
  );
}

function formatFecha(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return iso; }
}

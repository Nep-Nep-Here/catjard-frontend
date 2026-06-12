import { useEffect, useMemo, useState } from 'react';
import {
  listarSolicitudes,
  actualizarSolicitud,
  eliminarSolicitud,
  sincronizarSolicitudes,
} from '../../../services/solicitudesService.js';
import AdminHeader, { Card, EmptyState } from '../../../components/AdminHeader.jsx';

const TIPO_LABELS = { servicio: 'Servicio', informacion: 'Información', acceso: 'Acceso' };

// Estados alineados con Jira (Por hacer -> En curso -> Finalizado).
const ESTADOS = [
  { id: 'por_hacer', label: 'Por hacer' },
  { id: 'en_curso', label: 'En curso' },
  { id: 'finalizado', label: 'Finalizado' },
];
const ESTADO_LABELS = Object.fromEntries(ESTADOS.map((e) => [e.id, e.label]));
const ESTADO_BADGE = {
  por_hacer: 'bg-blue-400/10 text-blue-300 border-blue-400/30',
  en_curso: 'bg-amber/10 text-amber-light border-amber/30',
  finalizado: 'bg-green-400/10 text-green-300 border-green-400/30',
};
const PRIORIDADES = [
  { id: 'baja', label: 'Baja' },
  { id: 'media', label: 'Media' },
  { id: 'alta', label: 'Alta' },
];
const PRIORIDAD_BADGE = {
  baja: 'text-cream/60',
  media: 'text-amber-light',
  alta: 'text-red-300 font-semibold',
};

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [status, setStatus] = useState('idle');
  const [loadError, setLoadError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [sel, setSel] = useState(null);          // solicitud seleccionada para gestionar
  const [draft, setDraft] = useState(null);      // cambios en curso
  const [err, setErr] = useState(null);
  const [confirmando, setConfirmando] = useState(null);

  const [sincronizando, setSincronizando] = useState(false);

  const cargar = async () => {
    setStatus('loading');
    setLoadError(null);
    try {
      setSolicitudes(await listarSolicitudes());
      setStatus('ready');
    } catch (e) {
      setLoadError(e.message);
      setStatus('error');
    }
  };

  // "Actualizar" = sincroniza con Jira y luego recarga (estado al día con Jira).
  const sincronizar = async () => {
    setSincronizando(true);
    try {
      await sincronizarSolicitudes();
    } catch { /* best-effort: igual recargamos lo que haya */ }
    await cargar();
    setSincronizando(false);
  };

  useEffect(() => { cargar(); }, []);

  const filtradas = useMemo(() => {
    return solicitudes.filter(
      (s) =>
        (!filtroEstado || s.estado === filtroEstado) &&
        (!filtroTipo || s.tipo === filtroTipo),
    );
  }, [solicitudes, filtroEstado, filtroTipo]);

  const abrir = (s) => {
    setSel(s);
    setDraft({ estado: s.estado, prioridad: s.prioridad, respuesta: s.respuesta ?? '' });
    setErr(null);
  };

  const guardar = async () => {
    setErr(null);
    try {
      const actualizada = await actualizarSolicitud(sel.id, { prioridad: draft.prioridad, respuesta: draft.respuesta });
      setSolicitudes((list) => list.map((x) => (x.id === actualizada.id ? actualizada : x)));
      setSel(null);
    } catch (e) {
      setErr(e.message || 'No se pudo guardar.');
    }
  };

  const borrar = async (id) => {
    try {
      await eliminarSolicitud(id);
      setSolicitudes((list) => list.filter((x) => x.id !== id));
      if (sel?.id === id) setSel(null);
    } catch (e) {
      setErr(e.message || 'No se pudo eliminar.');
    }
    setConfirmando(null);
  };

  const pendientes = solicitudes.filter((s) => !['cerrada', 'rechazada'].includes(s.estado)).length;

  return (
    <section>
      <AdminHeader
        eyebrow="Dirección · Mesa de ayuda"
        title="Solicitudes"
        subtitle={`${filtradas.length} de ${solicitudes.length} · ${pendientes} pendientes`}
        action={
          <button
            onClick={sincronizar}
            disabled={sincronizando}
            className="inline-flex items-center gap-2 rounded-full border border-amber/30 text-cream/80 px-4 py-2 text-[13px] hover:border-amber/60 hover:text-cream transition-colors disabled:opacity-50"
          >
            {sincronizando ? 'Sincronizando…' : '↻ Sincronizar con Jira'}
          </button>
        }
      />

      {/* Panel de gestion */}
      {sel && (
        <Card title={`Gestionar ${sel.codigo}`} className="mt-8">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
            <Info label="Tipo">{TIPO_LABELS[sel.tipo] ?? sel.tipo}</Info>
            <Info label="Solicitante">{sel.solicitanteEmail}</Info>
            <Info label="Estado (lo gestiona Jira)">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${ESTADO_BADGE[sel.estado] ?? ''}`}>
                {ESTADO_LABELS[sel.estado] ?? sel.estado}
              </span>
            </Info>
            <Info label="Prioridad">{sel.prioridad}</Info>
            <Info label="Asunto" className="sm:col-span-2">{sel.asunto}</Info>
            <Info label="Descripción" className="sm:col-span-2">
              <span className="text-cream/80 whitespace-pre-wrap">{sel.descripcion}</span>
            </Info>
            {sel.jiraIssueKey && (
              <Info label="Jira" className="sm:col-span-2">
                <a href={sel.jiraUrl} target="_blank" rel="noopener noreferrer"
                   className="text-amber-light underline underline-offset-4">
                  {sel.jiraIssueKey}
                </a>
              </Info>
            )}
          </div>

          <p className="mt-5 text-[12px] text-cream/50">
            El estado se gestiona en Jira y se sincroniza automáticamente. Aquí puedes ajustar la prioridad y responder.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            <Field label="Prioridad">
              <select
                value={draft.prioridad}
                onChange={(e) => setDraft((d) => ({ ...d, prioridad: e.target.value }))}
                className={inputCls}
              >
                {PRIORIDADES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Respuesta al solicitante" className="sm:col-span-2">
              <textarea
                rows={3}
                value={draft.respuesta}
                onChange={(e) => setDraft((d) => ({ ...d, respuesta: e.target.value }))}
                placeholder="Escribe la respuesta o el avance de la atención…"
                className={`${inputCls} resize-y`}
              />
            </Field>
          </div>

          {err && <div className="mt-4 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}

          <div className="flex gap-3 mt-5">
            <button
              onClick={guardar}
              className="px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors"
            >
              Guardar y reflejar en Jira
            </button>
            <button
              onClick={() => setSel(null)}
              className="px-4 py-2.5 rounded-full text-cream/70 text-[13px] hover:text-cream"
            >
              Cancelar
            </button>
          </div>
        </Card>
      )}

      {/* Filtros */}
      {!sel && (
        <>
          {loadError && (
            <div className="mt-8 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">
              No se pudieron cargar las solicitudes: {loadError}
            </div>
          )}
          {status === 'loading' && <p className="mt-8 text-cream/60 text-[13px]">Cargando…</p>}

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <FiltroBtn active={filtroEstado === ''} onClick={() => setFiltroEstado('')}>Todos</FiltroBtn>
            {ESTADOS.map((e) => (
              <FiltroBtn key={e.id} active={filtroEstado === e.id} onClick={() => setFiltroEstado(e.id)}>
                {e.label}
              </FiltroBtn>
            ))}
            <span className="mx-1 text-amber/30">|</span>
            <FiltroBtn active={filtroTipo === ''} onClick={() => setFiltroTipo('')}>Todo tipo</FiltroBtn>
            {Object.entries(TIPO_LABELS).map(([id, label]) => (
              <FiltroBtn key={id} active={filtroTipo === id} onClick={() => setFiltroTipo(id)}>
                {label}
              </FiltroBtn>
            ))}
          </div>

          {filtradas.length === 0 ? (
            <div className="mt-8">
              <EmptyState titulo="Sin solicitudes" descripcion="No hay solicitudes para los filtros seleccionados." />
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-xl border border-amber/15">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
                  <tr>
                    <th className="px-5 py-4">Código</th>
                    <th className="px-5 py-4">Tipo</th>
                    <th className="px-5 py-4">Asunto</th>
                    <th className="px-5 py-4">Solicitante</th>
                    <th className="px-5 py-4">Prioridad</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4">Jira</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((s) => (
                    <tr key={s.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                      <td className="px-5 py-3 font-mono text-[12px] text-cream/85">{s.codigo}</td>
                      <td className="px-5 py-3 text-cream/85">{TIPO_LABELS[s.tipo] ?? s.tipo}</td>
                      <td className="px-5 py-3 text-cream font-medium max-w-xs truncate">{s.asunto}</td>
                      <td className="px-5 py-3 text-cream/70 font-mono text-[12px]">{s.solicitanteEmail}</td>
                      <td className={`px-5 py-3 ${PRIORIDAD_BADGE[s.prioridad] ?? ''}`}>{s.prioridad}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${ESTADO_BADGE[s.estado] ?? ''}`}>
                          {ESTADO_LABELS[s.estado] ?? s.estado}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {s.jiraIssueKey ? (
                          <a href={s.jiraUrl} target="_blank" rel="noopener noreferrer"
                             className="text-amber-light underline underline-offset-4 text-[12px]">
                            {s.jiraIssueKey}
                          </a>
                        ) : <span className="text-cream/30">—</span>}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => abrir(s)}
                          className="text-amber-light hover:text-amber underline underline-offset-4 text-[12px] mr-3"
                        >
                          Gestionar
                        </button>
                        {confirmando === s.id ? (
                          <span className="text-[12px]">
                            <button onClick={() => borrar(s.id)} className="text-red-300 hover:text-red-200 underline underline-offset-4 mr-2">Confirmar</button>
                            <button onClick={() => setConfirmando(null)} className="text-cream/60 hover:text-cream">cancelar</button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmando(s.id)}
                            className="text-red-300/80 hover:text-red-300 underline underline-offset-4 text-[12px]"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none';

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[11px] tracking-[0.2em] uppercase text-amber mb-1.5">{label}</label>
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
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
        active
          ? 'bg-amber text-brown border-amber font-semibold'
          : 'bg-transparent text-cream/80 border-amber/25 hover:border-amber/60 hover:text-cream'
      }`}
    >
      {children}
    </button>
  );
}

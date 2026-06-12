import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { crearSolicitud, listarMisSolicitudes } from '../../services/solicitudesService.js';
import { selectUser } from '../../redux/slices/authSlice.js';

const TIPOS = [
  { id: 'servicio',    label: 'Servicio',    desc: 'Un problema o falla con el sistema o un pedido.' },
  { id: 'informacion', label: 'Información',  desc: 'Una consulta o duda sobre productos, precios, etc.' },
  { id: 'acceso',      label: 'Acceso',      desc: 'Problemas de ingreso, contraseña o permisos.' },
];

const PRIORIDADES = [
  { id: 'baja', label: 'Baja' },
  { id: 'media', label: 'Media' },
  { id: 'alta', label: 'Alta' },
];

// Estados alineados con Jira (Por hacer -> En curso -> Finalizado).
const FLUJO = ['Por hacer', 'En curso', 'Finalizado'];

export const ESTADO_LABELS = {
  por_hacer: 'Por hacer',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
};

export const ESTADO_BADGE = {
  por_hacer: 'bg-blue-400/10 text-blue-300 border-blue-400/30',
  en_curso: 'bg-amber/10 text-amber-light border-amber/30',
  finalizado: 'bg-green-400/10 text-green-300 border-green-400/30',
};

const TIPO_LABELS = { servicio: 'Servicio', informacion: 'Información', acceso: 'Acceso' };
const EMPTY = { tipo: 'servicio', asunto: '', prioridad: 'media', descripcion: '', solicitanteNombre: '', solicitanteEmail: '' };

export default function Ayuda() {
  const user = useSelector(selectUser);
  const isPublic = !user;                       // sin sesión = formulario público

  const [form, setForm] = useState(EMPTY);
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);

  const cargar = async () => {
    if (isPublic) return;                        // los públicos no tienen "mis solicitudes"
    try {
      setMisSolicitudes(await listarMisSolicitudes());
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { cargar(); }, [isPublic]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    if (!form.asunto.trim() || !form.descripcion.trim()) {
      return setErr('Indica un asunto y describe tu solicitud.');
    }
    if (isPublic && !form.solicitanteEmail.trim()) {
      return setErr('Déjanos un correo para poder darte seguimiento.');
    }
    setEnviando(true);
    try {
      const payload = {
        tipo: form.tipo,
        asunto: form.asunto,
        prioridad: form.prioridad,
        descripcion: form.descripcion,
      };
      if (isPublic) {
        payload.solicitanteEmail = form.solicitanteEmail;
        payload.solicitanteNombre = form.solicitanteNombre;
      }
      const creada = await crearSolicitud(payload);
      setOk(creada);
      setForm(EMPTY);
      await cargar();
    } catch (e2) {
      setErr(e2.message || 'No se pudo enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className={isPublic ? 'min-h-screen bg-bg-dark text-cream' : ''}>
      <div className={isPublic ? 'max-w-5xl mx-auto px-6 py-16' : 'max-w-5xl'}>
        <p className="text-[11px] tracking-[0.25em] uppercase text-amber/70">Centro de ayuda</p>
        <h1 className="font-display font-black text-[28px] text-cream mt-1">¿En qué te ayudamos?</h1>
        <p className="text-cream/60 text-[14px] mt-1">
          Registra tu solicitud. Cada una se gestiona en Jira y avanza por estos estados:
        </p>

        {/* Estados (alineados con Jira) */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {FLUJO.map((paso, i) => (
            <div key={paso} className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg text-[12px] bg-amber/10 text-amber-light border border-amber/25">
                {paso}
              </span>
              {i < FLUJO.length - 1 && <span className="text-amber/50">→</span>}
            </div>
          ))}
        </div>

        {/* Formulario */}
        <div className="mt-8 rounded-2xl border border-amber/15 bg-amber/[0.03] p-6">
          <h2 className="font-display font-bold text-[18px] text-cream mb-4">Nueva solicitud</h2>
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            {isPublic && (
              <>
                <Field label="Tu nombre">
                  <input name="solicitanteNombre" value={form.solicitanteNombre} onChange={onChange} className={inputCls} placeholder="Nombre y apellido" />
                </Field>
                <Field label="Tu correo" required>
                  <input type="email" name="solicitanteEmail" value={form.solicitanteEmail} onChange={onChange} className={inputCls} placeholder="correo@ejemplo.com" />
                </Field>
              </>
            )}

            <Field label="Tipo de solicitud" required className="sm:col-span-2">
              <div className="grid sm:grid-cols-3 gap-3">
                {TIPOS.map((t) => (
                  <label
                    key={t.id}
                    className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                      form.tipo === t.id ? 'border-amber bg-amber/10' : 'border-amber/20 hover:border-amber/50'
                    }`}
                  >
                    <input type="radio" name="tipo" value={t.id} checked={form.tipo === t.id} onChange={onChange} className="sr-only" />
                    <p className="text-[14px] font-semibold text-cream">{t.label}</p>
                    <p className="text-[11px] text-cream/60 mt-1 leading-snug">{t.desc}</p>
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Asunto" required>
              <input name="asunto" value={form.asunto} onChange={onChange} maxLength={160} placeholder="Resume tu solicitud en una frase" className={inputCls} />
            </Field>

            <Field label="Prioridad">
              <select name="prioridad" value={form.prioridad} onChange={onChange} className={inputCls}>
                {PRIORIDADES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>

            <Field label="Descripción" required className="sm:col-span-2">
              <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={4} placeholder="Cuéntanos con detalle qué necesitas o qué problema tienes." className={`${inputCls} resize-y`} />
            </Field>

            {err && <div className="sm:col-span-2 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}
            {ok && (
              <div className="sm:col-span-2 p-3 rounded bg-green-400/10 text-green-300 text-[13px]">
                ¡Solicitud <strong>{ok.codigo}</strong> registrada! Te daremos seguimiento.
                {ok.jiraIssueKey && (
                  <>
                    {' '}Ticket en Jira:{' '}
                    {ok.jiraUrl
                      ? <a href={ok.jiraUrl} target="_blank" rel="noopener noreferrer" className="underline">{ok.jiraIssueKey}</a>
                      : <strong>{ok.jiraIssueKey}</strong>}
                  </>
                )}
              </div>
            )}

            <div className="sm:col-span-2">
              <button type="submit" disabled={enviando} className="px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors disabled:opacity-50">
                {enviando ? 'Enviando…' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        </div>

        {/* Mis solicitudes (solo con sesión) */}
        {!isPublic && (
          <>
            <h2 className="font-display font-bold text-[18px] text-cream mt-10 mb-3">Mis solicitudes</h2>
            {misSolicitudes.length === 0 ? (
              <p className="text-cream/50 text-[13px]">Aún no has registrado solicitudes.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-amber/15">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
                    <tr>
                      <th className="px-5 py-4">Código</th>
                      <th className="px-5 py-4">Tipo</th>
                      <th className="px-5 py-4">Asunto</th>
                      <th className="px-5 py-4">Estado</th>
                      <th className="px-5 py-4">Respuesta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {misSolicitudes.map((s) => (
                      <tr key={s.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors align-top">
                        <td className="px-5 py-3 font-mono text-[12px] text-cream/85">{s.codigo}</td>
                        <td className="px-5 py-3 text-cream/85">{TIPO_LABELS[s.tipo] ?? s.tipo}</td>
                        <td className="px-5 py-3 text-cream font-medium">{s.asunto}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${ESTADO_BADGE[s.estado] ?? ''}`}>
                            {ESTADO_LABELS[s.estado] ?? s.estado}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-cream/70 max-w-xs">{s.respuesta || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none';

function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[11px] tracking-[0.2em] uppercase text-amber mb-1.5">
        {label}
        {required && <span className="text-amber-light/60 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

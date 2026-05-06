import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Mail, Phone, Whatsapp } from '../../components/Icons.jsx';
import { crearLead } from '../../redux/slices/leadsSlice.js';

const INITIAL = {
  nombre: '',
  empresa: '',
  ruc: '',
  email: '',
  telefono: '',
  productos: '',
  cantidad: '',
  mensaje: '',
};

export default function Contacto() {
  const dispatch = useDispatch();
  const [form, setForm] = useState(INITIAL);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [err, setErr] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setEnviando(true);
    try {
      await dispatch(crearLead(form)).unwrap();
      setEnviado(true);
      setForm(INITIAL);
      setTimeout(() => setEnviado(false), 6000);
    } catch (e2) {
      setErr(typeof e2 === 'string' ? e2 : 'No se pudo enviar la solicitud. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="bg-bg-dark min-h-screen px-6 pt-32 pb-24">
      <div className="max-w-[1240px] mx-auto">
        <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
          Contacto
        </span>
        <h1 className="mt-4 font-display font-black text-cream text-[56px] md:text-[72px] leading-[0.95] balance">
          Hablemos.
        </h1>
        <p className="mt-6 font-body text-amber-light/85 text-[18px] max-w-[560px]">
          Cuéntanos qué necesitas. Respondemos en menos de 24 horas con una
          propuesta concreta.
        </p>

        <div className="mt-16 grid lg:grid-cols-[1fr_360px] gap-12">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Tu nombre"   name="nombre"   value={form.nombre}   onChange={onChange} required />
              <Field label="Empresa"     name="empresa"  value={form.empresa}  onChange={onChange} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="RUC"         name="ruc"      value={form.ruc}      onChange={onChange} placeholder="11 dígitos" />
              <Field label="Teléfono"    name="telefono" value={form.telefono} onChange={onChange} placeholder="+51 999 555 222" />
            </div>
            <Field label="Correo" type="email" name="email" value={form.email} onChange={onChange} required />
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Productos de interés" name="productos" value={form.productos} onChange={onChange} placeholder="Polos, tazas, libretas…" />
              <Field label="Cantidad aprox." name="cantidad" value={form.cantidad} onChange={onChange} placeholder="200" />
            </div>
            <div>
              <label className="block text-[12px] tracking-[0.2em] uppercase text-amber mb-2">
                Mensaje
              </label>
              <textarea
                name="mensaje"
                value={form.mensaje}
                onChange={onChange}
                rows={5}
                placeholder="Cuéntanos un poco más sobre el proyecto…"
                className="w-full px-4 py-3 rounded-md bg-bg-dark border border-amber/30 text-cream focus:border-amber focus:outline-none transition-colors resize-y"
              />
            </div>

            {enviado && (
              <div className="p-4 rounded-md bg-amber/15 border border-amber/40 text-amber-light text-[14px]">
                ¡Recibimos tu solicitud! Te contactaremos en menos de 24 h.
              </div>
            )}

            {err && (
              <div className="p-4 rounded-md bg-red-400/10 border border-red-400/30 text-red-300 text-[14px]">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-semibold px-8 py-4 text-[15px] hover:bg-amber-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </form>

          <aside className="space-y-6">
            <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
              <p className="text-[12px] tracking-[0.2em] uppercase text-amber mb-4">
                Datos de contacto
              </p>
              <ul className="space-y-3 text-cream/90 text-[14px]">
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-amber" /> hola@catjard.pe
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-amber" /> +51 999 555 222
                </li>
                <li className="flex items-center gap-3">
                  <Whatsapp size={18} className="text-amber" /> WhatsApp directo
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
              <p className="text-[12px] tracking-[0.2em] uppercase text-amber mb-3">
                Oficina
              </p>
              <p className="text-cream/90 text-[14px] leading-relaxed">
                Av. Pardo 123, oficina 502<br />
                Miraflores, Lima — Perú
              </p>
              <p className="mt-4 text-amber-light/70 text-[12px]">
                Lun a Vie · 9:00 am – 6:30 pm
              </p>
            </div>
            <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
              <p className="text-[12px] tracking-[0.2em] uppercase text-amber mb-3">
                Cobertura
              </p>
              <p className="text-cream/90 text-[14px] leading-relaxed">
                Lima y 23 regiones del Perú vía Olva Courier y Shalom.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, value, onChange, required, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-[12px] tracking-[0.2em] uppercase text-amber mb-2">
        {label}
        {required && <span className="text-amber-light/60 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-md bg-bg-dark border border-amber/30 text-cream focus:border-amber focus:outline-none transition-colors"
      />
    </div>
  );
}

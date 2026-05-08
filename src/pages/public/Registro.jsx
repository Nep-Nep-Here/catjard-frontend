import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registrar } from '../../services/authService.js';

const INITIAL = {
  empresa: '',
  ruc: '',
  nombre: '',
  email: '',
  telefono: '',
  password: '',
  password2: '',
};

export default function Registro() {
  const [form, setForm] = useState(INITIAL);
  const [err, setErr] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (form.password !== form.password2) {
      setErr('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 6) {
      setErr('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (form.ruc.length !== 11) {
      setErr('El RUC debe tener 11 dígitos.');
      return;
    }
    setSubmitting(true);
    try {
      await registrar({
        email: form.email.trim(),
        password: form.password,
        nombre: form.nombre.trim(),
        empresa: form.empresa.trim(),
        ruc: form.ruc.trim(),
        telefono: form.telefono.trim() || null,
        direccion: null,
      });
      setEnviado(true);
    } catch (e) {
      setErr(e.message || 'No se pudo crear la cuenta.');
    } finally {
      setSubmitting(false);
    }
  };

  if (enviado) {
    return (
      <section className="min-h-screen bg-bg-dark px-6 py-32 flex items-center justify-center">
        <div className="max-w-[460px] text-center">
          <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
            ¡Bienvenido!
          </span>
          <h1 className="mt-4 font-display font-black text-cream text-[44px] leading-tight balance">
            Tu cuenta fue creada.
          </h1>
          <p className="mt-6 text-amber-light/85 text-[16px]">
            Tu cuenta ya está activa. Inicia sesión con tu correo y contraseña
            para empezar a cotizar.
          </p>
          <Link
            to="/login"
            className="inline-flex mt-8 items-center gap-2 rounded-full bg-amber text-brown font-semibold px-7 py-4 hover:bg-amber-light transition-colors"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-bg-dark px-6 py-32 flex items-center justify-center">
      <div className="w-full max-w-[520px]">
        <h1 className="font-display font-black text-cream text-[44px] leading-[0.95] balance">
          Registra tu empresa.
        </h1>
        <p className="mt-4 font-body text-amber-light/80 text-[15px]">
          Crea una cuenta corporativa para gestionar tus cotizaciones y pedidos.
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="underline text-amber hover:text-amber-light">
            Iniciar sesión
          </Link>
          .
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <Field label="Empresa"      name="empresa"  value={form.empresa}  onChange={onChange} required />
          <Field label="RUC"          name="ruc"      value={form.ruc}      onChange={onChange} required placeholder="11 dígitos" />
          <Field label="Tu nombre"    name="nombre"   value={form.nombre}   onChange={onChange} required />
          <Field label="Correo"       name="email"    value={form.email}    onChange={onChange} required type="email" />
          <Field label="Teléfono"     name="telefono" value={form.telefono} onChange={onChange} required placeholder="+51 ..." />
          <div className="grid grid-cols-2 gap-5">
            <Field label="Contraseña"            name="password"  value={form.password}  onChange={onChange} required type="password" />
            <Field label="Confirmar contraseña"  name="password2" value={form.password2} onChange={onChange} required type="password" />
          </div>

          {err && (
            <p className="text-red-400 text-[13px] bg-red-400/10 px-3 py-2 rounded">{err}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-4 rounded-full bg-amber text-brown font-semibold hover:bg-amber-light transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>
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

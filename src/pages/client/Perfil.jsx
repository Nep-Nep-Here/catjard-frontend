import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice.js';

export default function Perfil() {
  const user = useSelector(selectUser);
  const [datos, setDatos] = useState({
    nombre: user?.nombre ?? '',
    empresa: user?.empresa ?? '',
    ruc: user?.ruc ?? '',
    email: user?.email ?? '',
    telefono: user?.telefono ?? '',
    direccion: user?.direccion ?? '',
  });
  const [savedDatos, setSavedDatos] = useState(false);

  const [pwd, setPwd] = useState({ actual: '', nueva: '', confirmar: '' });
  const [savedPwd, setSavedPwd] = useState(false);
  const [pwdErr, setPwdErr] = useState(null);

  const onChange = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  const onSubmitDatos = (e) => {
    e.preventDefault();
    setSavedDatos(true);
    setTimeout(() => setSavedDatos(false), 4000);
  };

  const onSubmitPwd = (e) => {
    e.preventDefault();
    setPwdErr(null);
    if (pwd.nueva !== pwd.confirmar) {
      setPwdErr('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (pwd.nueva.length < 6) {
      setPwdErr('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setSavedPwd(true);
    setPwd({ actual: '', nueva: '', confirmar: '' });
    setTimeout(() => setSavedPwd(false), 4000);
  };

  return (
    <section>
      <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
        Mi perfil
      </span>
      <h1 className="mt-3 font-display font-black text-cream text-[40px] md:text-[48px] leading-tight">
        Datos de empresa.
      </h1>

      <div className="mt-12 grid lg:grid-cols-2 gap-8">
        <form onSubmit={onSubmitDatos} className="p-8 rounded-xl border border-amber/15 bg-amber/5 space-y-5">
          <h2 className="font-display font-bold text-cream text-[20px]">Información</h2>
          <Field label="Tu nombre"   name="nombre"   value={datos.nombre}   onChange={onChange} />
          <Field label="Empresa"     name="empresa"  value={datos.empresa}  onChange={onChange} />
          <Field label="RUC"         name="ruc"      value={datos.ruc}      onChange={onChange} />
          <Field label="Correo"      name="email"    value={datos.email}    onChange={onChange} type="email" />
          <Field label="Teléfono"    name="telefono" value={datos.telefono} onChange={onChange} />
          <Field label="Dirección"   name="direccion" value={datos.direccion} onChange={onChange} />
          {savedDatos && (
            <p className="text-amber-light text-[13px] bg-amber/10 px-3 py-2 rounded">
              ✓ Datos guardados.
            </p>
          )}
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-amber text-brown font-semibold hover:bg-amber-light transition-colors"
          >
            Guardar cambios
          </button>
        </form>

        <form onSubmit={onSubmitPwd} className="p-8 rounded-xl border border-amber/15 bg-amber/5 space-y-5 self-start">
          <h2 className="font-display font-bold text-cream text-[20px]">Cambiar contraseña</h2>
          <Field label="Contraseña actual"  type="password" name="actual"     value={pwd.actual}     onChange={(e) => setPwd({ ...pwd, actual: e.target.value })} required />
          <Field label="Nueva contraseña"   type="password" name="nueva"      value={pwd.nueva}      onChange={(e) => setPwd({ ...pwd, nueva: e.target.value })} required />
          <Field label="Confirmar"          type="password" name="confirmar"  value={pwd.confirmar}  onChange={(e) => setPwd({ ...pwd, confirmar: e.target.value })} required />

          {pwdErr && (
            <p className="text-red-400 text-[13px] bg-red-400/10 px-3 py-2 rounded">{pwdErr}</p>
          )}
          {savedPwd && (
            <p className="text-amber-light text-[13px] bg-amber/10 px-3 py-2 rounded">
              ✓ Contraseña actualizada.
            </p>
          )}
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-amber text-brown font-semibold hover:bg-amber-light transition-colors"
          >
            Actualizar contraseña
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, name, value, onChange, required, type = 'text' }) {
  return (
    <div>
      <label className="block text-[12px] tracking-[0.2em] uppercase text-amber mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-md bg-bg-dark border border-amber/30 text-cream focus:border-amber focus:outline-none transition-colors"
      />
    </div>
  );
}

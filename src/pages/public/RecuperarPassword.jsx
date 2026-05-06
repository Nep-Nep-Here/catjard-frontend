import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <section className="min-h-screen bg-bg-dark px-6 py-32 flex items-center justify-center">
      <div className="w-full max-w-[440px]">
        <h1 className="font-display font-black text-cream text-[40px] leading-[0.95] balance">
          Recuperar contraseña
        </h1>
        <p className="mt-4 font-body text-amber-light/80 text-[15px]">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {enviado ? (
          <div className="mt-10 p-6 rounded-xl border border-amber/30 bg-amber/10">
            <p className="text-cream text-[15px]">
              Si el correo <b>{email}</b> está registrado, recibirás un enlace de
              recuperación en los próximos minutos.
            </p>
            <Link
              to="/login"
              className="inline-flex mt-6 items-center gap-2 text-amber underline underline-offset-4 hover:text-amber-light"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <div>
              <label className="block text-[12px] tracking-[0.2em] uppercase text-amber mb-2">
                Correo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-md bg-bg-dark border border-amber/30 text-cream focus:border-amber focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-4 rounded-full bg-amber text-brown font-semibold hover:bg-amber-light transition-colors"
            >
              Enviar enlace
            </button>
            <p className="text-center text-[13px] text-amber-light/70">
              <Link to="/login" className="hover:text-amber-light underline underline-offset-4">
                Volver al inicio de sesión
              </Link>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

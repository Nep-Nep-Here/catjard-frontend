import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  loginSuccess,
  loginFailure,
  selectUser,
} from '../../redux/slices/authSlice.js';
import { login, HOME_BY_ROLE } from '../../services/authService.js';
import { ROLE_LABELS } from '../../data/users.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);

  if (user) {
    return <Navigate to={HOME_BY_ROLE[user.role] ?? '/'} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const u = await login({ email: email.trim(), password });
      dispatch(loginSuccess(u));
      const fromPath = location.state?.from?.pathname;
      navigate(fromPath ?? HOME_BY_ROLE[u.role] ?? '/', { replace: true });
    } catch (e) {
      dispatch(loginFailure(e.message));
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen bg-bg-dark px-6 py-32 flex items-center justify-center">
      <div className="w-full max-w-[440px]">
        <h1 className="font-display font-black text-cream text-[44px] leading-[0.95] balance">
          Inicia sesión
        </h1>
        <p className="mt-4 font-body text-amber-light/80 text-[15px]">
          Ingresa con tu cuenta. ¿Eres una empresa nueva?{' '}
          <Link to="/registro" className="underline text-amber hover:text-amber-light">
            Crea una cuenta
          </Link>
          .
        </p>
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
              autoComplete="email"
              className="w-full px-4 py-3 rounded-md bg-bg-dark border border-amber/30 text-cream focus:border-amber focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] tracking-[0.2em] uppercase text-amber mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-md bg-bg-dark border border-amber/30 text-cream focus:border-amber focus:outline-none transition-colors"
            />
          </div>
          {err && (
            <p className="text-red-400 text-[13px] bg-red-400/10 px-3 py-2 rounded">{err}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-4 rounded-full bg-amber text-brown font-semibold hover:bg-amber-light transition-colors disabled:opacity-50"
          >
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
          <p className="text-center text-[13px] text-amber-light/70">
            <Link to="/recuperar" className="hover:text-amber-light underline underline-offset-4">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </form>

        <details className="mt-10 text-amber-light/70 text-[13px] border border-amber/15 rounded-lg p-4">
          <summary className="cursor-pointer hover:text-amber-light font-semibold">
            Cuentas demo (mock)
          </summary>
          <div className="mt-4 space-y-2 font-mono text-[12px]">
            <p><b>cliente@empresa.com</b> / cliente123 — {ROLE_LABELS.cliente}</p>
            <p><b>vendedor@catjard.pe</b> / vendedor123 — {ROLE_LABELS.vendedor}</p>
            <p><b>almacen@catjard.pe</b> / almacen123 — {ROLE_LABELS.almacen}</p>
            <p><b>produccion@catjard.pe</b> / produccion123 — {ROLE_LABELS.produccion}</p>
            <p><b>gerente@catjard.pe</b> / gerente123 — {ROLE_LABELS.gerente}</p>
          </div>
        </details>
      </div>
    </section>
  );
}

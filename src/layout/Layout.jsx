

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CatJardMark, SoundWave, Mail, Phone, Instagram, Linkedin, Whatsapp } from '../components/Icons.jsx';
import { logout, selectUser } from '../redux/slices/authSlice.js';
import { HOME_BY_ROLE } from '../services/authService.js';
import { ROLE_LABELS } from '../data/users.js';

const NAV_ITEMS = [
  { label: 'Productos', to: '/catalogo' },
  { label: 'Servicios', to: '/servicios' },
  { label: 'Casos', to: '/portafolio' },
  { label: 'Contacto', to: '/contacto' },
  { label: 'Ayuda', to: '/ayuda' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  const showSolid = scrolled || !isHome;
  const panelTo = user ? HOME_BY_ROLE[user.role] ?? '/' : '/';
  const iniciales = (user?.nombre ?? user?.email ?? '?')
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const onLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        showSolid ? 'bg-bg-dark/85 backdrop-blur-md border-b border-amber/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-[78px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <CatJardMark size={42} />
          <span className="font-display font-black text-cream text-[20px] tracking-tight hidden sm:inline">
            Cat Jard
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-9">
          {NAV_ITEMS.map((it) => (
            <Link
              key={it.label}
              to={it.to}
              className="font-body font-medium text-[14px] text-cream/85 hover:text-amber-light transition-colors"
            >
              {it.label}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center gap-3 rounded-full bg-amber/10 hover:bg-amber/20 border border-amber/30 pl-2 pr-4 py-2 transition-colors"
            >
              <span className="w-9 h-9 rounded-full bg-amber text-brown font-display font-black flex items-center justify-center text-[14px]">
                {iniciales}
              </span>
              <span className="hidden sm:flex flex-col items-start leading-tight">
                <span className="font-body font-semibold text-cream text-[13px]">
                  {user.nombre ?? user.email}
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-amber-light/70">
                  {ROLE_LABELS[user.role] ?? '—'}
                </span>
              </span>
              <svg
                className={`w-4 h-4 text-amber-light/70 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-bg-dark border border-amber/20 shadow-xl shadow-black/40 overflow-hidden">
                <div className="px-4 py-3 border-b border-amber/15">
                  <p className="font-body font-semibold text-cream text-[14px] truncate">
                    {user.nombre ?? '—'}
                  </p>
                  <p className="text-amber-light/65 text-[12px] truncate">{user.email}</p>
                </div>
                <Link
                  to={panelTo}
                  className="block px-4 py-3 text-cream/85 hover:bg-amber/10 hover:text-amber-light text-[13px] transition-colors"
                >
                  Ir a mi panel
                </Link>
                {user.role === 'cliente' && (
                  <Link
                    to="/cliente/perfil"
                    className="block px-4 py-3 text-cream/85 hover:bg-amber/10 hover:text-amber-light text-[13px] transition-colors"
                  >
                    Mi perfil
                  </Link>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full text-left px-4 py-3 text-cream/85 hover:bg-amber/10 hover:text-amber-light text-[13px] border-t border-amber/15 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-body font-semibold px-7 py-4 text-[15px] hover:bg-amber-light transition-colors"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}

const FOOTER_LINKS = [
  { label: 'Productos', to: '/catalogo' },
  { label: 'Servicios', to: '/servicios' },
  { label: 'Casos', to: '/portafolio' },
  { label: 'Contacto', to: '/contacto' },
  { label: 'Iniciar sesión', to: '/login' },
];

export function Footer() {
  return (
    <footer id="contacto" className="relative bg-bg-dark text-cream py-20 px-6 overflow-hidden">
      <div className="absolute bottom-6 right-6 ee-pulse text-amber/50 pointer-events-none" aria-hidden="true">
        <SoundWave size={36} />
      </div>
      <div className="max-w-[1240px] mx-auto grid md:grid-cols-3 gap-12">
        <div>
          <div className="flex items-center gap-3">
            <CatJardMark size={44} />
            <span className="font-display font-black text-[22px]">Cat Jard</span>
          </div>
          <p className="mt-5 font-body text-[14px] text-amber-light/75 max-w-[260px] leading-relaxed">
            Merchandising corporativo · Lima, Perú. Diseño, producción y entrega.
          </p>
        </div>
        <div>
          <h5 className="font-body font-semibold text-[12px] tracking-[0.3em] uppercase text-amber">Navegar</h5>
          <ul className="mt-5 space-y-3 font-body text-[14px] text-cream/85">
            {FOOTER_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-amber-light transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="font-body font-semibold text-[12px] tracking-[0.3em] uppercase text-amber">Contacto</h5>
          <ul className="mt-5 space-y-3 font-body text-[14px] text-cream/85">
            <li className="flex items-center gap-3"><Mail size={16} className="text-amber"/> hola@catjard.pe</li>
            <li className="flex items-center gap-3"><Phone size={16} className="text-amber"/> +51 999 555 222</li>
          </ul>
          <div className="mt-6 flex items-center gap-4 text-cream/85">
            <a href="#" aria-label="Instagram" className="hover:text-amber transition-colors"><Instagram size={20}/></a>
            <a href="#" aria-label="LinkedIn"  className="hover:text-amber transition-colors"><Linkedin size={20}/></a>
            <a href="#" aria-label="WhatsApp"  className="hover:text-amber transition-colors"><Whatsapp size={20}/></a>
          </div>
        </div>
      </div>
      <div className="mt-16 max-w-[1240px] mx-auto pt-8 border-t border-amber/15 flex flex-wrap gap-3 justify-between font-body text-[12px] text-amber-light/55">
        <span>© 2026 Cat Jard. Todos los derechos reservados.</span>
        <span>Hecho en Lima · Perú</span>
      </div>
    </footer>
  );
}

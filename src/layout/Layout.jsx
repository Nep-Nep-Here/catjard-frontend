import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CatJardMark, SoundWave, Mail, Phone, Instagram, Linkedin, Whatsapp } from '../components/Icons.jsx';

const NAV_ITEMS = [
  { label: 'Productos', to: '/catalogo' },
  { label: 'Servicios', to: '/servicios' },
  { label: 'Casos', to: '/portafolio' },
  { label: 'Contacto', to: '/contacto' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showSolid = scrolled || !isHome;

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
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-body font-semibold px-7 py-4 text-[15px] hover:bg-amber-light transition-colors"
        >
          Iniciar sesión
        </Link>
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

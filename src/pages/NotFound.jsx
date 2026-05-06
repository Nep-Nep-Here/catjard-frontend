import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="min-h-screen bg-bg-dark px-6 py-32 flex items-center justify-center">
      <div className="text-center max-w-[520px]">
        <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">404</span>
        <h1 className="mt-4 font-display font-black text-cream text-[64px] leading-[0.95] balance">
          Esta página no existe.
        </h1>
        <p className="mt-6 font-body text-amber-light/80 text-[16px]">
          Tal vez te equivocaste de URL o el contenido fue movido.
        </p>
        <Link
          to="/"
          className="inline-flex mt-10 items-center gap-2 rounded-full bg-amber text-brown font-body font-semibold px-7 py-4 text-[15px] hover:bg-amber-light transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}

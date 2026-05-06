import { Link } from 'react-router-dom';

const CASOS = [
  { cliente: 'Banco Sigma',     industria: 'Banca',         producto: 'Polos aniversario',          unidades: 800,  anio: 2025, color: 'from-amber to-brown' },
  { cliente: 'Crehana',         industria: 'EdTech',        producto: 'Kits de bienvenida',         unidades: 1200, anio: 2025, color: 'from-brown to-bg-dark' },
  { cliente: 'BCP Wealth',      industria: 'Banca privada', producto: 'Libretas grabadas + USB',    unidades: 600,  anio: 2024, color: 'from-amber-light to-amber' },
  { cliente: 'AJE Group',       industria: 'Bebidas',       producto: 'Gorras, hoodies y mochilas', unidades: 2400, anio: 2025, color: 'from-bg-dark to-amber' },
  { cliente: 'Pacífico Seguros',industria: 'Seguros',       producto: 'Tomatodos y libretas',       unidades: 1500, anio: 2024, color: 'from-amber to-amber-light' },
  { cliente: 'Rappi Perú',      industria: 'Logística',     producto: 'Tote bags y stickers',       unidades: 3000, anio: 2025, color: 'from-brown to-amber' },
];

export default function Portafolio() {
  return (
    <section className="bg-bg-dark min-h-screen px-6 pt-32 pb-24">
      <div className="max-w-[1240px] mx-auto">
        <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
          Casos de éxito
        </span>
        <h1 className="mt-4 font-display font-black text-cream text-[56px] md:text-[72px] leading-[0.95] balance">
          Marcas que confían en Cat Jard.
        </h1>
        <p className="mt-6 font-body text-amber-light/85 text-[18px] max-w-[640px] leading-relaxed pretty">
          Una selección de proyectos entregados a empresas de Lima y provincias en los
          últimos dos años.
        </p>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CASOS.map((c) => (
            <article
              key={c.cliente}
              className="rounded-xl border border-amber/15 bg-amber/5 hover:border-amber/40 transition-colors overflow-hidden group"
            >
              <div className={`h-48 bg-gradient-to-br ${c.color} relative`}>
                <div className="absolute inset-0 halftone opacity-[0.12]" />
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                  <span className="font-display font-black text-cream/95 text-[28px] leading-tight">
                    {c.cliente}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[11px] tracking-[0.25em] uppercase text-amber-light/60">
                  {c.industria} · {c.anio}
                </p>
                <h3 className="mt-3 font-display font-bold text-[20px] text-cream">
                  {c.producto}
                </h3>
                <p className="mt-2 text-amber-light/75 text-[14px]">
                  {c.unidades.toLocaleString('es-PE')} unidades entregadas
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-20 p-10 rounded-2xl border border-amber/20 bg-amber/5 text-center">
          <h2 className="font-display font-black text-cream text-[36px] leading-tight">
            ¿Tu empresa es la siguiente?
          </h2>
          <p className="mt-4 text-amber-light/85 text-[16px] max-w-[480px] mx-auto">
            Cuéntanos qué necesitas y te enviamos una propuesta en menos de 24 horas.
          </p>
          <Link
            to="/contacto"
            className="inline-flex mt-8 items-center gap-2 rounded-full bg-amber text-brown font-semibold px-7 py-4 text-[15px] hover:bg-amber-light transition-colors"
          >
            Solicitar cotización
          </Link>
        </div>
      </div>
    </section>
  );
}

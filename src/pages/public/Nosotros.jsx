const VALORES = [
  { t: 'Obsesión por la marca',   d: 'Cada cliente tiene su ADN visual. Nuestro trabajo es respetarlo y amplificarlo, no aplastarlo con un logo genérico.' },
  { t: 'Calidad que se siente',   d: 'Trabajamos con proveedores auditados. Si no usaríamos el producto nosotros, no te lo vendemos.' },
  { t: 'Honestidad operativa',    d: 'Sin costos ocultos, sin promesas que no cumplimos. Si no llegamos al plazo, te avisamos antes que tú nos preguntes.' },
  { t: 'Respuesta humana',        d: 'No tenemos call center ni bots. Hablas con personas que conocen tu pedido por nombre.' },
];

export default function Nosotros() {
  return (
    <section className="bg-bg-dark min-h-screen px-6 pt-32 pb-24">
      <div className="max-w-[1100px] mx-auto">
        <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
          Nosotros
        </span>
        <h1 className="mt-4 font-display font-black text-cream text-[56px] md:text-[80px] leading-[0.92] balance">
          Una agencia pequeña<br />que se obsesiona con cada pedido.
        </h1>

        <div className="mt-16 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display font-bold text-amber text-[14px] tracking-[0.3em] uppercase">
              Misión
            </h2>
            <p className="mt-4 font-body text-cream text-[18px] leading-relaxed pretty">
              Hacer merchandising que la gente quiera usar. Convertir cada pieza
              corporativa en un objeto que represente a la marca con dignidad y
              calidad real.
            </p>
          </div>
          <div>
            <h2 className="font-display font-bold text-amber text-[14px] tracking-[0.3em] uppercase">
              Visión
            </h2>
            <p className="mt-4 font-body text-cream text-[18px] leading-relaxed pretty">
              Ser el partner de merchandising de referencia para empresas en el Perú
              que entienden que el regalo corporativo es un punto de contacto con su
              gente, no un trámite.
            </p>
          </div>
        </div>

        <div className="mt-24">
          <h2 className="font-display font-black text-cream text-[40px] md:text-[48px] leading-tight">
            Cómo empezamos.
          </h2>
          <div className="mt-8 space-y-6 text-cream text-[17px] leading-relaxed pretty max-w-[820px]">
            <p>
              Cat Jard nació en 2023 en un coworking de Miraflores. Empezamos
              tres personas con un solo cliente y la convicción de que el
              merchandising corporativo en el Perú podía ser mucho mejor de lo
              que era.
            </p>
            <p>
              En dos años hemos entregado más de 500 proyectos a empresas en
              Lima y 23 regiones del país. Seguimos siendo un equipo pequeño
              porque nos importa que cada pedido lo gestione una persona, no un
              sistema.
            </p>
          </div>
        </div>

        <div className="mt-24">
          <h2 className="font-display font-black text-cream text-[40px] md:text-[48px] leading-tight">
            Lo que nos importa.
          </h2>
          <div className="mt-12 grid md:grid-cols-2 gap-x-12 gap-y-10">
            {VALORES.map((v) => (
              <article key={v.t}>
                <h3 className="font-display font-bold text-[22px] text-amber-light">
                  {v.t}
                </h3>
                <p className="mt-2 font-body text-[15px] text-cream/85 leading-relaxed pretty">
                  {v.d}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-24 grid sm:grid-cols-3 gap-6 text-center">
          {[
            { n: '+500',  l: 'empresas atendidas' },
            { n: '+2 años', l: 'en el mercado' },
            { n: '24',  l: 'regiones cubiertas' },
          ].map((s) => (
            <div key={s.l} className="p-8 rounded-xl border border-amber/15 bg-amber/5">
              <p className="font-display font-black text-amber text-[44px] leading-none">{s.n}</p>
              <p className="mt-3 text-cream/80 text-[14px] tracking-wide">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

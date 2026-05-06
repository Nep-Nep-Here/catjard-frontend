/* Feature-based page sections — Hero, Problem, Solution, Features, Trust, Testimonials, FinalCTA */

import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../hooks/hooks.jsx';
import { PrimaryCTA, GhostCTA, DarkCTA, SectionTitle } from '../components/Primitives.jsx';
import {
  SoundWave, Package, Clock, Truck,
  TechSerigrafia, TechSublimado, TechDTF, TechBordado, TechLaser, TechUV
} from '../components/Icons.jsx';

/* ------------------ HERO ------------------ */
export function Hero() {
  const videoRef = useRef(null);
  const headlineRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    let direction = 1;
    let raf;
    const onEnded = () => {
      direction = -1;
      v.pause();
      const reverseStep = () => {
        if (direction !== -1) return;
        v.currentTime = Math.max(0, v.currentTime - 1 / 30);
        if (v.currentTime <= 0.02) {
          direction = 1;
          v.play().catch(() => {});
          return;
        }
        raf = requestAnimationFrame(reverseStep);
      };
      reverseStep();
    };
    v.addEventListener('ended', onEnded);
    v.play().catch(() => {});
    return () => {
      v.removeEventListener('ended', onEnded);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const h = headlineRef.current;
    if (!h) return;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > window.innerHeight) return;
      h.style.transform = `translateY(${-y * 0.3}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="top" className="relative h-screen min-h-[640px] w-full overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="/transition.mp4"
        poster="/hero-poster.png"
        muted
        playsInline
        autoPlay
        preload="metadata"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bg-dark/85 via-bg-dark/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent"></div>

      <div ref={headlineRef} className="relative h-full flex flex-col justify-center px-6 sm:px-[8vw] max-w-[1440px] mx-auto">
        <div className="flex items-center gap-3 mb-6 reveal in">
          <span className="block h-[1px] w-10 bg-amber"></span>
          <span className="font-body text-amber text-[12px] tracking-[0.28em] uppercase">Merchandising · Lima, Perú</span>
        </div>
        <h1 className="font-display font-black text-cream leading-[0.92] tracking-[-0.025em] balance text-[56px] sm:text-[80px] md:text-[96px] max-w-[760px]">
          Tu marca,<br/>en sus manos.
        </h1>
        <p className="mt-7 font-body font-normal text-amber-light/95 text-[17px] md:text-[18px] leading-relaxed max-w-[480px] pretty">
          Merchandising corporativo premium desde 50 unidades. Diseño, producción y entrega en todo el Perú.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <PrimaryCTA href="#cotiza" size="lg">Cotiza tu pedido</PrimaryCTA>
          <GhostCTA href="#productos">Ver portafolio</GhostCTA>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 bob">
        <span className="block w-[1px] h-12 bg-gradient-to-b from-transparent via-amber to-amber"></span>
        <span className="font-body text-[11px] tracking-[0.3em] uppercase text-amber-light/70">↓ scroll</span>
      </div>
    </section>
  );
}

/* ------------------ PROBLEM ------------------ */
export function Problem() {
  const ref = useReveal({ titleWave: false });
  return (
    <section ref={ref} className="reveal relative py-[160px] px-6 overflow-hidden bg-bg-dark">
      <div className="absolute inset-0">
        <img src="/hero-poster.png" alt=""
             className="w-full h-full object-cover scale-110"
             style={{ filter: 'brightness(0.32) contrast(1.05)' }} />
      </div>
      <div className="absolute inset-0 halftone opacity-[0.08]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/80 via-transparent to-bg-dark"></div>

      <div className="relative max-w-[860px] mx-auto text-center">
        <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber/80">El problema</span>
        <p className="mt-8 font-display italic font-medium text-cream text-[28px] sm:text-[34px] md:text-[40px] leading-[1.18] balance">
          Repartiste 200 lapiceros y nadie los usó. El polo del evento terminó en el fondo del cajón. Tu logo se descascaró en la primera lavada. Hacer merchandising no es imprimir cosas — <span className="text-amber-light">es hacer que la gente las quiera usar</span>.
        </p>
      </div>
    </section>
  );
}

/* ------------------ SOLUTION ------------------ */

export function Solution() {
  const ref = useReveal({ titleWave: true });
  const benefits = [
    { n: '01', t: 'Diseño que respeta tu marca', b: 'No solo estampamos un logo. Adaptamos cada pieza al ADN visual de tu empresa, con asesoría gráfica incluida en cada cotización.' },
    { n: '02', t: 'Materiales que la gente quiere tocar', b: 'Algodón pima, metales sólidos, papelería con peso. Trabajamos con proveedores auditados para que cada producto se sienta premium.' },
    { n: '03', t: 'Producción que dura', b: 'Técnicas correctas para cada material — no un “talla única”. Garantizamos color, fijación y acabado por escrito.' },
  ];
  return (
    <section ref={ref} id="productos" className="reveal bg-cream text-brown py-[140px] px-6">
      <div className="max-w-[1240px] mx-auto">
        <SectionTitle color="text-brown" size="text-5xl md:text-[64px]" waveColor="text-amber">
          Hacemos merchandising<br/>que se queda.
        </SectionTitle>
        <div className="mt-20 grid md:grid-cols-3 gap-12 md:gap-10">
          {benefits.map((b, i) => (
            <BenefitCard key={b.n} {...b} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitCard({ n, t, b, delay }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          setTimeout(() => el.classList.add('in'), delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <article ref={ref} className="reveal relative group"
             onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className={`absolute -top-6 -left-4 transition-opacity duration-500 ${hover ? 'opacity-100' : 'opacity-0'}`}>
        <SoundWave size={140} className="text-amber" />
      </div>
      <div className="relative">
        <span className="font-display font-bold text-[80px] leading-none text-amber/30">{n}</span>
        <h3 className="mt-6 font-display font-bold text-[28px] text-brown leading-tight balance">{t}</h3>
        <p className="mt-4 font-body text-[16px] text-brown/80 leading-relaxed pretty">{b}</p>
      </div>
    </article>
  );
}

/* ------------------ FEATURES ------------------ */
export function Features() {
  const ref = useReveal({ titleWave: true });
  const products = [
    { n: 'Polos', s: 'text-[44px]' },
    { n: 'Tazas', s: 'text-[28px]' },
    { n: 'Tote bags', s: 'text-[40px]' },
    { n: 'Lapiceros', s: 'text-[26px]' },
    { n: 'Libretas', s: 'text-[36px]' },
    { n: 'Gorras', s: 'text-[34px]' },
    { n: 'USB', s: 'text-[24px]' },
    { n: 'Termos', s: 'text-[42px]' },
    { n: 'Llaveros', s: 'text-[28px]' },
    { n: 'Mochilas', s: 'text-[38px]' },
    { n: 'Hoodies', s: 'text-[48px]' },
  ];
  const techs = [
    { I: TechSerigrafia, t: 'Serigrafía',     d: 'Para tirajes grandes y colores planos vivos.' },
    { I: TechSublimado,  t: 'Sublimado',      d: 'Full-color permanente sobre poliéster.' },
    { I: TechDTF,        t: 'DTF',            d: 'Detalles finos y degradados sobre algodón.' },
    { I: TechBordado,    t: 'Bordado',        d: 'Lujo táctil para uniformes y polos premium.' },
    { I: TechLaser,      t: 'Grabado Láser',  d: 'Madera, metal, cuero — marcaje permanente.' },
    { I: TechUV,         t: 'Impresión UV',   d: 'Sobre superficies rígidas, color preciso.' },
  ];
  return (
    <section ref={ref} id="técnicas" className="reveal bg-bg-dark py-[140px] px-6">
      <div className="max-w-[1240px] mx-auto">
        <SectionTitle color="text-cream" size="text-5xl md:text-[64px]" waveColor="text-amber">
          Once productos.<br/>Seis técnicas.<br/>
          <span className="text-amber-light">Una sola obsesión: que se vea bien.</span>
        </SectionTitle>

        <div className="mt-20 flex flex-wrap gap-x-10 gap-y-6 items-baseline">
          {products.map((p, i) => (
            <span key={p.n}
                  className={`chip font-display font-semibold text-cream cursor-default ${p.s}`}
                  style={{ opacity: 0.55 + (i % 4) * 0.12 }}>
              {p.n}
              {i < products.length - 1 && <span className="text-amber/50 ml-10">·</span>}
            </span>
          ))}
        </div>

        <div className="mt-24 mb-14 flex items-center gap-4">
          <span className="block h-[1px] flex-1 bg-amber/20"></span>
          <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber/70">Técnicas</span>
          <span className="block h-[1px] flex-1 bg-amber/20"></span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14">
          {techs.map(({ I, t, d }) => (
            <div key={t} className="group">
              <div className="text-amber group-hover:text-amber-light transition-colors">
                <I size={32} />
              </div>
              <h4 className="mt-5 font-body font-semibold text-[18px] text-cream">{t}</h4>
              <p className="mt-2 font-body text-[14px] text-amber-light/85 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------ TRUST ------------------ */
export function Trust() {
  const ref = useReveal({ titleWave: true });
  const pills = [
    { I: Package, t: '50 unidades mínimo',  s: 'Pedidos chicos también importan. Empezamos contigo.' },
    { I: Clock,   t: 'Cotización en 24 h', s: 'Sin formularios eternos ni esperar semanas.' },
    { I: Truck,   t: 'Envíos a todo el Perú', s: 'Lima, provincias, distritos remotos. Llegamos.' },
  ];
  return (
    <section ref={ref} id="casos" className="reveal relative py-[140px] px-6 overflow-hidden"
             style={{ background: 'radial-gradient(circle at 30% 20%, rgba(196,139,40,0.18), transparent 60%), #FFF5E1' }}>
      <div className="max-w-[1240px] mx-auto grid md:grid-cols-2 gap-16 items-start">
        <div>
          <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">Por qué nosotros</span>
          <div className="mt-4">
            <SectionTitle color="text-brown" size="text-5xl md:text-[56px]" waveColor="text-amber">
              Por qué Cat Jard.
            </SectionTitle>
          </div>
          <p className="mt-7 font-body text-[16px] text-brown/80 leading-relaxed max-w-[420px] pretty">
            Somos un equipo pequeño en Miraflores que se obsesiona con cada pedido. Sin call centers, sin intermediarios. Hablas con quien produce.
          </p>
        </div>
        <div className="space-y-5">
          {pills.map(({ I, t, s }) => (
            <div key={t} className="flex gap-5 items-start p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-amber/15 hover:border-amber/40 transition-colors">
              <div className="shrink-0 w-12 h-12 rounded-full bg-amber/15 grid place-items-center text-brown">
                <I size={22} />
              </div>
              <div>
                <h4 className="font-display font-bold text-[20px] text-brown">{t}</h4>
                <p className="mt-1 font-body text-[14px] text-brown/75">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-20 max-w-[1240px] mx-auto pt-10 border-t border-amber/25 flex flex-wrap gap-x-10 gap-y-4 items-center justify-center text-center">
        {['+500 empresas', '+2 años', 'Lima + 23 regiones'].map((s, i) => (
          <span key={s} className="font-body font-medium text-amber text-[15px] tracking-wide">
            {s}{i < 2 && <span className="ml-10 text-amber/50">·</span>}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ------------------ TESTIMONIALS ------------------ */
export function Testimonials() {
  const ref = useReveal({ titleWave: true });
  const quotes = [
    { q: 'Pedimos 80 polos para el aniversario y nos llegaron en 9 días. La gente del equipo todavía los usa fuera de la oficina.', n: 'Lucía Montoya', r: 'Head of People', c: 'Banco Sigma' },
    { q: 'Probamos tres proveedores antes. Cat Jard fue el primero que nos preguntó por la marca antes de mandar una proforma.', n: 'Diego Bracamonte', r: 'Marketing Lead', c: 'Crehana' },
    { q: 'El nivel de acabado en las libretas grabadas dejó callados a nuestros clientes en el evento de Q4. No exagero.', n: 'Ana Reátegui', r: 'Comms Manager', c: 'BCP Wealth' },
  ];
  return (
    <section ref={ref} className="reveal bg-bg-dark py-[140px] px-6">
      <div className="max-w-[1240px] mx-auto">
        <SectionTitle color="text-cream" size="text-5xl md:text-[56px]" waveColor="text-amber">
          Lo que dicen<br/>nuestros clientes.
        </SectionTitle>
        <div className="mt-20 grid md:grid-cols-3 gap-0 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-amber/15">
          {quotes.map((Q, i) => (
            <article key={i} className="group relative px-0 md:px-10 py-10 first:pt-0 md:first:pl-0 md:last:pr-0">
              <div className="absolute -top-2 left-0 md:left-10 transition-transform duration-500 group-hover:scale-110 origin-left">
                <SoundWave size={56} className="text-amber" />
              </div>
              <div className="pt-16">
                <p className="font-display italic font-medium text-cream text-[22px] leading-[1.4] balance max-w-[380px]">
                  “{Q.q}”
                </p>
                <div className="mt-7">
                  <p className="font-body font-semibold text-amber text-[16px]">{Q.n}</p>
                  <p className="font-body text-amber-light/70 text-[14px]">{Q.r} · {Q.c}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------ FINAL CTA ------------------ */
export function FinalCTA() {
  const ref = useReveal({ titleWave: true });
  return (
    <section id="cotiza" ref={ref} className="reveal relative bg-amber py-[140px] px-6 overflow-hidden">
      <div className="absolute inset-0 halftone opacity-[0.08]"></div>
      <div className="absolute -right-20 -top-20 opacity-30">
        <SoundWave size={520} className="text-brown" strokeWidth={0.8} />
      </div>
      <div className="absolute -left-32 -bottom-32 opacity-20">
        <SoundWave size={520} className="text-brown" strokeWidth={0.8} />
      </div>

      <div className="relative max-w-[760px] mx-auto text-center">
        <span className="font-body font-semibold text-[13px] tracking-[0.3em] uppercase text-brown">
          Pedidos desde 50 unidades
        </span>
        <h2 className="mt-6 font-display font-black text-brown text-[56px] sm:text-[68px] md:text-[80px] leading-[0.95] tracking-[-0.025em] balance">
          Cotización<br/>en 24 horas.
        </h2>
        <p className="mt-7 font-body text-[18px] text-brown/80 max-w-[520px] mx-auto pretty">
          Sin costos ocultos. Diseño incluido. Envíos a todo el Perú.
        </p>
        <div className="mt-10 flex justify-center">
          <DarkCTA href="#contacto" size="lg">Solicitar cotización</DarkCTA>
        </div>
        <p className="mt-8 font-body text-[14px] text-brown/75">
          o escríbenos a <a href="mailto:hola@catjard.pe" className="font-semibold underline decoration-brown/40 underline-offset-4 hover:decoration-brown">hola@catjard.pe</a>
          <span className="mx-3 text-brown/40">·</span>
          WhatsApp: <span className="font-semibold">+51 999 555 222</span>
        </p>
      </div>
    </section>
  );
}


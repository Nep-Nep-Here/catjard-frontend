import { Link } from 'react-router-dom';
import {
  TechSerigrafia,
  TechSublimado,
  TechDTF,
  TechBordado,
  TechLaser,
  TechUV,
} from '../../components/Icons.jsx';

const TECNICAS = [
  { I: TechSerigrafia, t: 'Serigrafía',     d: 'Para tirajes grandes y colores planos vivos. Ideal para polos y bolsas.' },
  { I: TechSublimado,  t: 'Sublimado',      d: 'Full-color permanente sobre poliéster. Tazas, mousepads y prendas técnicas.' },
  { I: TechDTF,        t: 'DTF',            d: 'Detalles finos y degradados sobre algodón. Logos complejos sin perder definición.' },
  { I: TechBordado,    t: 'Bordado',        d: 'Lujo táctil para uniformes y polos premium. Acabado profesional y duradero.' },
  { I: TechLaser,      t: 'Grabado Láser',  d: 'Madera, metal, cuero — marcaje permanente para lapiceros, USB y agendas.' },
  { I: TechUV,         t: 'Impresión UV',   d: 'Sobre superficies rígidas, color preciso. Perfecto para tomatodos y power banks.' },
];

const FASES = [
  { n: '01', t: 'Cotización en 24 h',   d: 'Nos cuentas qué necesitas. En menos de un día tienes una propuesta con precio, plazos y técnicas.' },
  { n: '02', t: 'Aprobación de arte',   d: 'Diseñamos tu pieza y te enviamos versiones para que apruebes desde tu portal de cliente.' },
  { n: '03', t: 'Producción y control', d: 'Personalizamos cada producto y pasamos control de calidad antes de salir a despacho.' },
  { n: '04', t: 'Despacho a todo Perú', d: 'Lima en 24-48 h. Provincias por Olva Courier o Shalom con tracking incluido.' },
];

export default function Servicios() {
  return (
    <section className="bg-bg-dark min-h-screen">
      <div className="px-6 pt-40 pb-20 max-w-[1240px] mx-auto">
        <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
          Servicios
        </span>
        <h1 className="mt-4 font-display font-black text-cream text-[64px] md:text-[80px] leading-[0.92] balance max-w-[760px]">
          Diseño, producción y entrega.
        </h1>
        <p className="mt-6 font-body text-amber-light/85 text-[18px] max-w-[640px] leading-relaxed pretty">
          Cubrimos todo el flujo del merchandising corporativo: desde la asesoría gráfica
          hasta la entrega en la puerta de tu cliente final.
        </p>
      </div>

      <div className="bg-cream text-brown py-24 px-6">
        <div className="max-w-[1240px] mx-auto">
          <h2 className="font-display font-black text-brown text-[40px] md:text-[56px] leading-tight">
            Seis técnicas, una sola obsesión.
          </h2>
          <p className="mt-4 text-brown/75 text-[16px] max-w-[560px]">
            Elegimos la técnica correcta para cada material. No usamos "talla única".
          </p>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
            {TECNICAS.map(({ I, t, d }) => (
              <div key={t}>
                <div className="text-amber">
                  <I size={32} />
                </div>
                <h3 className="mt-5 font-display font-bold text-[22px] text-brown">{t}</h3>
                <p className="mt-2 font-body text-[15px] text-brown/75 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-24">
        <div className="max-w-[1240px] mx-auto">
          <h2 className="font-display font-black text-cream text-[40px] md:text-[56px] leading-tight">
            Cómo trabajamos.
          </h2>
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {FASES.map((f) => (
              <article key={f.n}>
                <span className="font-display font-bold text-[64px] leading-none text-amber/30">
                  {f.n}
                </span>
                <h3 className="mt-4 font-display font-bold text-[22px] text-cream">{f.t}</h3>
                <p className="mt-2 font-body text-[15px] text-amber-light/75 leading-relaxed">
                  {f.d}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-16 flex flex-wrap gap-4">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-semibold px-7 py-4 text-[15px] hover:bg-amber-light transition-colors"
            >
              Ver catálogo
            </Link>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 rounded-full border border-amber/40 text-cream font-medium px-7 py-4 text-[15px] hover:border-amber hover:text-amber-light transition-colors"
            >
              Solicitar cotización
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import { getCategoria } from '../data/products.js';

const SIZE_CLS = {
  sm: { wrap: 'h-40',  text: 'text-[20px]' },
  md: { wrap: 'h-56',  text: 'text-[24px]' },
  lg: { wrap: 'h-[420px] md:h-[520px]', text: 'text-[40px] md:text-[56px]' },
};

export default function ProductImage({ producto, size = 'md', className = '' }) {
  const categoria = getCategoria(producto?.categoria);
  const gradient = categoria?.gradient ?? 'from-amber to-brown';
  const cls = SIZE_CLS[size] ?? SIZE_CLS.md;

  return (
    <div
      className={`relative w-full ${cls.wrap} rounded-xl overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
    >
      <div className="absolute inset-0 halftone opacity-[0.12]" aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center text-center px-6">
        <span
          className={`font-display font-black text-cream/95 leading-[0.95] balance ${cls.text}`}
        >
          {producto?.nombre ?? 'Producto'}
        </span>
      </div>
      <div className="absolute top-3 left-3">
        <span className="inline-block px-3 py-1 rounded-full bg-bg-dark/40 backdrop-blur-sm text-cream/90 text-[11px] tracking-[0.2em] uppercase">
          {categoria?.label ?? '—'}
        </span>
      </div>
    </div>
  );
}

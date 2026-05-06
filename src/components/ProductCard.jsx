import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import { getCategoria } from '../data/products.js';

export default function ProductCard({ producto }) {
  const categoria = getCategoria(producto.categoria);
  const stockBajo = producto.stock <= producto.stockMinimo;

  return (
    <Link
      to={`/producto/${producto.slug}`}
      className="group block rounded-xl border border-amber/15 bg-amber/5 hover:border-amber/40 hover:bg-amber/10 transition-all overflow-hidden"
    >
      <ProductImage producto={producto} size="md" />
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display font-bold text-cream text-[20px] leading-tight group-hover:text-amber-light transition-colors">
            {producto.nombre}
          </h3>
        </div>
        <p className="mt-1 text-amber-light/65 text-[12px] tracking-widest uppercase">
          {categoria?.label}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-amber text-[22px] leading-none">
              S/ {producto.precio.toFixed(2)}
            </p>
            <p className="text-cream/55 text-[11px] mt-1">desde 50 unidades</p>
          </div>
          <span
            className={`text-[11px] px-2.5 py-1 rounded-full ${
              stockBajo
                ? 'bg-red-500/15 text-red-300'
                : 'bg-amber/15 text-amber-light'
            }`}
          >
            {stockBajo ? 'Stock bajo' : `Stock ${producto.stock}`}
          </span>
        </div>
      </div>
    </Link>
  );
}

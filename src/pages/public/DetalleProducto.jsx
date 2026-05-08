import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEscalaPrecio, getCategoria } from '../../data/products.js';
import { selectUser } from '../../redux/slices/authSlice.js';
import { addItem } from '../../redux/slices/cartSlice.js';
import { selectProductoBySlug } from '../../redux/slices/productosSlice.js';
import { selectPromociones } from '../../redux/slices/promocionesSlice.js';
import { calcularPrecio } from '../../utils/promociones.js';
import ProductImage from '../../components/ProductImage.jsx';

export default function DetalleProducto() {
  const { slug } = useParams();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const producto = useSelector(selectProductoBySlug(slug));
  const promociones = useSelector(selectPromociones);

  const [cantidad, setCantidad] = useState(50);
  const [tecnica, setTecnica] = useState(producto?.tecnicas?.[0] ?? '');
  const [agregado, setAgregado] = useState(false);

  if (!producto) {
    return (
      <section className="min-h-screen bg-bg-dark px-6 pt-40 pb-24 flex items-center justify-center">
        <div className="text-center max-w-[480px]">
          <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
            404
          </span>
          <h1 className="mt-4 font-display font-black text-cream text-[44px] leading-tight balance">
            Producto no encontrado.
          </h1>
          <Link
            to="/catalogo"
            className="inline-flex mt-8 items-center gap-2 rounded-full bg-amber text-brown font-semibold px-6 py-3 hover:bg-amber-light transition-colors"
          >
            Volver al catálogo
          </Link>
        </div>
      </section>
    );
  }

  const categoria = getCategoria(producto.categoria);
  const escala = getEscalaPrecio(producto);
  const stockBajo = producto.stock <= producto.stockMinimo;
  const isCliente = user?.role === 'cliente';
  const { precioBase, precioFinal, descuentoPct, promocion } = calcularPrecio(
    producto,
    promociones,
  );
  const tienePromo = descuentoPct > 0;

  const onAgregar = () => {
    dispatch(
      addItem({
        productoId: producto.id,
        cantidad: Math.max(50, parseInt(cantidad, 10) || 50),
        tecnica,
      }),
    );
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2200);
  };

  const onAgregarYVer = () => {
    dispatch(
      addItem({
        productoId: producto.id,
        cantidad: Math.max(50, parseInt(cantidad, 10) || 50),
        tecnica,
      }),
    );
    navigate('/cliente/cotizar');
  };

  return (
    <section className="bg-bg-dark px-6 pt-32 pb-24 min-h-screen">
      <div className="max-w-[1240px] mx-auto">
        <Link
          to="/catalogo"
          className="text-amber-light/70 hover:text-amber-light text-[13px] underline underline-offset-4"
        >
          ← Volver al catálogo
        </Link>

        <div className="mt-8 grid md:grid-cols-2 gap-12">
          <ProductImage producto={producto} size="lg" />

          <div>
            <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
              {categoria?.label}
            </span>
            <h1 className="mt-3 font-display font-black text-cream text-[44px] md:text-[56px] leading-[0.95] balance">
              {producto.nombre}
            </h1>
            <p className="mt-6 font-body text-amber-light/90 text-[17px] leading-relaxed pretty">
              {producto.descripcion}
            </p>

            <div className="mt-8 flex items-baseline gap-6 flex-wrap">
              <div>
                <div className="flex items-baseline gap-3">
                  <p className="font-display font-black text-amber text-[40px] leading-none">
                    S/ {precioFinal.toFixed(2)}
                  </p>
                  {tienePromo && (
                    <p className="text-cream/45 text-[20px] line-through">
                      S/ {precioBase.toFixed(2)}
                    </p>
                  )}
                </div>
                <p className="text-cream/55 text-[12px] mt-1">
                  {tienePromo
                    ? `precio con descuento · 50 unidades`
                    : `precio base · 50 unidades`}
                </p>
                {tienePromo && (
                  <p className="mt-2 text-green-300 text-[12px]">
                    Promo «{promocion.nombre}» −{descuentoPct}% activa
                  </p>
                )}
              </div>
              <span
                className={`text-[12px] px-3 py-1 rounded-full ${
                  stockBajo
                    ? 'bg-red-500/15 text-red-300'
                    : 'bg-amber/15 text-amber-light'
                }`}
              >
                {stockBajo ? `Stock bajo (${producto.stock})` : `${producto.stock} en stock`}
              </span>
            </div>

            {isCliente && (
              <div className="mt-8 p-5 rounded-xl border border-amber/20 bg-amber/5">
                <p className="text-[12px] tracking-[0.2em] uppercase text-amber mb-3">
                  Agregar a cotización
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-amber-light/65 block mb-1.5">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min={50}
                      step={10}
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-amber-light/65 block mb-1.5">
                      Técnica
                    </label>
                    <select
                      value={tecnica}
                      onChange={(e) => setTecnica(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none"
                    >
                      {producto.tecnicas.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={onAgregar}
                    className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-semibold px-6 py-3 text-[14px] hover:bg-amber-light transition-colors"
                  >
                    {agregado ? '✓ Agregado' : 'Agregar al carrito'}
                  </button>
                  <button
                    onClick={onAgregarYVer}
                    className="inline-flex items-center gap-2 rounded-full border border-amber/40 text-cream font-medium px-6 py-3 text-[14px] hover:border-amber hover:text-amber-light transition-colors"
                  >
                    Agregar e ir al carrito
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8">
              <p className="text-[12px] tracking-[0.2em] uppercase text-amber mb-3">
                Técnicas disponibles
              </p>
              <div className="flex flex-wrap gap-2">
                {producto.tecnicas.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1.5 rounded-full bg-amber/10 border border-amber/30 text-cream/90 text-[13px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {!isCliente && (
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-semibold px-7 py-4 text-[15px] hover:bg-amber-light transition-colors"
                >
                  Iniciar sesión para cotizar
                </Link>
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 rounded-full border border-amber/40 text-cream font-medium px-7 py-4 text-[15px] hover:border-amber hover:text-amber-light transition-colors"
                >
                  Hablar con un asesor
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20">
          <h2 className="font-display font-black text-cream text-[32px] leading-tight">
            Precio por volumen
          </h2>
          <p className="mt-2 text-amber-light/75 text-[14px]">
            Cuanto más pides, mejor el precio. Los descuentos son automáticos en tu cotización.
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-amber/15">
            <table className="w-full text-left">
              <thead className="bg-amber/5 text-amber-light/80 text-[12px] tracking-widest uppercase">
                <tr>
                  <th className="px-6 py-4">Cantidad</th>
                  <th className="px-6 py-4">Precio unitario</th>
                  <th className="px-6 py-4">Ahorro</th>
                </tr>
              </thead>
              <tbody>
                {escala.map((e) => (
                  <tr key={e.label} className="border-t border-amber/10 text-cream">
                    <td className="px-6 py-4 font-medium">{e.label} unidades</td>
                    <td className="px-6 py-4 font-display font-bold text-amber text-[18px]">
                      S/ {e.precio.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-amber-light/75 text-[14px]">
                      {e.factor === 1 ? '—' : `${Math.round((1 - e.factor) * 100)}% menos`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

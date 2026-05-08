import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCartItems,
  selectCartNotas,
  selectCartLogoNombre,
  updateCantidad,
  updateTecnica,
  updateNotas,
  removeItem,
  setNotasCliente,
  setLogoNombre,
  clearCart,
} from '../../redux/slices/cartSlice.js';
import { crearCotizacion } from '../../redux/slices/cotizacionesSlice.js';
import { selectUser } from '../../redux/slices/authSlice.js';
import { getPrecioVolumen } from '../../data/products.js';
import { selectProductos } from '../../redux/slices/productosSlice.js';
import { selectPromociones } from '../../redux/slices/promocionesSlice.js';
import { mejorPromocion } from '../../utils/promociones.js';
import { calcularTotales } from '../../data/cotizaciones.js';

export default function Carrito() {
  const items = useSelector(selectCartItems);
  const notas = useSelector(selectCartNotas);
  const logoNombre = useSelector(selectCartLogoNombre);
  const user = useSelector(selectUser);
  const productos = useSelector(selectProductos);
  const promociones = useSelector(selectPromociones);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [err, setErr] = useState(null);

  const itemsConPrecio = useMemo(
    () =>
      items.map((it) => {
        const producto = productos.find((p) => p.id === it.productoId);
        const precioVolumen = producto ? getPrecioVolumen(producto, it.cantidad) : 0;
        const promo = producto ? mejorPromocion(producto, promociones) : null;
        const descuentoPct = promo ? Number(promo.descuentoPct) : 0;
        const precioUnit = +(precioVolumen * (1 - descuentoPct / 100)).toFixed(2);
        return {
          ...it,
          producto,
          precioBase: precioVolumen,
          precioUnit,
          descuentoPct,
          promocion: promo,
          importe: +(precioUnit * it.cantidad).toFixed(2),
        };
      }),
    [items, productos, promociones],
  );

  const totales = useMemo(
    () =>
      calcularTotales(
        itemsConPrecio.map((it) => ({ cantidad: it.cantidad, precioUnit: it.precioUnit })),
      ),
    [itemsConPrecio],
  );

  const onLogo = (e) => {
    const f = e.target.files?.[0];
    if (f) dispatch(setLogoNombre(f.name));
  };

  const onEnviar = async () => {
    if (items.length === 0) return;
    setErr(null);
    setEnviando(true);
    try {
      const payload = {
        clienteId: user.id,
        empresa: user.empresa,
        ruc: user.ruc,
        items: itemsConPrecio.map((it) => ({
          productoId: it.productoId,
          cantidad: it.cantidad,
          precioUnit: it.precioUnit,
          tecnica: it.tecnica,
          notas: it.notas || null,
        })),
        logoNombre,
        notasCliente: notas,
        validez: addDays(new Date(), 30).toISOString().slice(0, 10),
      };
      const creada = await dispatch(crearCotizacion(payload)).unwrap();
      dispatch(clearCart());
      navigate(`/cliente/cotizaciones/${creada.id}`);
    } catch (e) {
      setErr(typeof e === 'string' ? e : 'No se pudo enviar la cotización.');
    } finally {
      setEnviando(false);
    }
  };

  if (items.length === 0) {
    return (
      <section>
        <Header />
        <div className="mt-12 p-12 rounded-xl border border-amber/15 text-center">
          <h2 className="font-display font-bold text-cream text-[24px]">
            Tu carrito está vacío.
          </h2>
          <p className="mt-3 text-amber-light/75 text-[14px]">
            Explora el catálogo y agrega productos para armar una cotización.
          </p>
          <Link
            to="/catalogo"
            className="inline-flex mt-8 items-center gap-2 rounded-full bg-amber text-brown font-semibold px-6 py-3 hover:bg-amber-light transition-colors"
          >
            Ir al catálogo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <Header itemsCount={items.length} />

      <div className="mt-10 grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-4">
          {itemsConPrecio.map((it, i) => (
            <article
              key={`${it.productoId}-${it.tecnica}-${i}`}
              className="p-5 rounded-xl border border-amber/15 bg-amber/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-amber-light/65">
                    {it.producto?.categoria}
                  </p>
                  <h3 className="mt-1 font-display font-bold text-cream text-[18px] leading-tight">
                    {it.producto?.nombre ?? 'Producto'}
                  </h3>
                </div>
                <button
                  onClick={() => dispatch(removeItem(i))}
                  className="text-amber-light/60 hover:text-red-300 text-[12px] underline underline-offset-4"
                >
                  Quitar
                </button>
              </div>

              <div className="mt-4 grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-amber-light/65 block mb-1.5">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min={50}
                    step={10}
                    value={it.cantidad}
                    onChange={(e) =>
                      dispatch(updateCantidad({ index: i, cantidad: parseInt(e.target.value, 10) || 50 }))
                    }
                    className="w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-amber-light/55">mínimo 50</p>
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-amber-light/65 block mb-1.5">
                    Técnica
                  </label>
                  <select
                    value={it.tecnica}
                    onChange={(e) => dispatch(updateTecnica({ index: i, tecnica: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none"
                  >
                    {(it.producto?.tecnicas ?? []).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-right">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-amber-light/65">
                    Precio unit.
                  </p>
                  <div className="mt-1.5 flex items-baseline justify-end gap-2">
                    <p className="font-display font-bold text-amber text-[20px] leading-none">
                      S/ {it.precioUnit.toFixed(2)}
                    </p>
                    {it.descuentoPct > 0 && (
                      <p className="text-cream/45 text-[13px] line-through">
                        S/ {it.precioBase.toFixed(2)}
                      </p>
                    )}
                  </div>
                  {it.descuentoPct > 0 && (
                    <p className="mt-1 text-green-300 text-[11px]">
                      Promo «{it.promocion.nombre}» −{it.descuentoPct}%
                    </p>
                  )}
                  <p className="text-[12px] text-cream/65 mt-1">
                    Importe: <b className="text-cream">S/ {it.importe.toFixed(2)}</b>
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-[11px] tracking-[0.2em] uppercase text-amber-light/65 block mb-1.5">
                  Notas
                </label>
                <input
                  type="text"
                  value={it.notas}
                  onChange={(e) => dispatch(updateNotas({ index: i, notas: e.target.value }))}
                  placeholder="Color, ubicación del logo, talla…"
                  className="w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[13px] focus:border-amber focus:outline-none"
                />
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-5">
          <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
            <h3 className="font-display font-bold text-cream text-[18px]">Tu logo</h3>
            <p className="mt-1 text-amber-light/75 text-[12px]">
              Sube tu logo en alta resolución. Formatos: PNG, SVG, AI, PDF.
            </p>
            <label className="mt-4 inline-flex items-center gap-2 cursor-pointer rounded-full border border-amber/40 px-4 py-2.5 text-[13px] text-cream hover:border-amber hover:text-amber-light transition-colors">
              <input type="file" className="hidden" onChange={onLogo} accept=".png,.svg,.ai,.pdf,.jpg,.jpeg" />
              {logoNombre ? 'Cambiar archivo' : 'Subir archivo'}
            </label>
            {logoNombre && (
              <p className="mt-3 text-[12px] text-amber-light/85 break-all">
                ✓ {logoNombre}
              </p>
            )}
          </div>

          <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
            <h3 className="font-display font-bold text-cream text-[18px]">Notas adicionales</h3>
            <textarea
              value={notas}
              onChange={(e) => dispatch(setNotasCliente(e.target.value))}
              rows={4}
              placeholder="Plazos, requisitos especiales, dirección de entrega…"
              className="mt-3 w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[13px] focus:border-amber focus:outline-none resize-y"
            />
          </div>

          <div className="p-6 rounded-xl border border-amber/30 bg-amber/10">
            <h3 className="font-display font-bold text-cream text-[18px]">Resumen</h3>
            <dl className="mt-4 space-y-2 text-[14px]">
              <Row label="Subtotal"  value={`S/ ${totales.subtotal.toFixed(2)}`} />
              <Row label="IGV (18 %)" value={`S/ ${totales.igv.toFixed(2)}`} />
              <div className="border-t border-amber/20 pt-3 mt-3">
                <Row
                  label={<span className="text-cream font-semibold">Total estimado</span>}
                  value={
                    <span className="text-amber font-display font-bold text-[22px]">
                      S/ {totales.total.toFixed(2)}
                    </span>
                  }
                />
              </div>
            </dl>
            <p className="mt-4 text-[11px] text-amber-light/65 leading-relaxed">
              Al enviar, un asesor revisará tu solicitud y te enviará una propuesta formal en 24 h hábiles.
            </p>
            <button
              onClick={onEnviar}
              disabled={enviando}
              className="mt-5 w-full px-6 py-4 rounded-full bg-amber text-brown font-semibold hover:bg-amber-light transition-colors disabled:opacity-50"
            >
              {enviando ? 'Enviando…' : 'Enviar cotización'}
            </button>
            {err && (
              <p className="mt-3 text-red-300 text-[12px] bg-red-400/10 border border-red-400/30 rounded px-3 py-2">
                {err}
              </p>
            )}
            <button
              onClick={() => dispatch(clearCart())}
              className="mt-3 w-full text-[12px] text-amber-light/65 hover:text-amber-light underline underline-offset-4"
            >
              Vaciar carrito
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Header({ itemsCount }) {
  return (
    <div>
      <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
        Carrito de cotización
      </span>
      <h1 className="mt-3 font-display font-black text-cream text-[40px] md:text-[48px] leading-tight">
        Arma tu cotización.
      </h1>
      {itemsCount ? (
        <p className="mt-2 font-body text-amber-light/85 text-[15px]">
          {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'} en tu carrito.
        </p>
      ) : null}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-cream/85">{label}</dt>
      <dd className="text-cream">{value}</dd>
    </div>
  );
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCotizacionById,
  setEstadoCotizacion,
} from '../../redux/slices/cotizacionesSlice.js';
import {
  ESTADO_COTIZACION_LABEL,
  ESTADO_COTIZACION_COLOR,
} from '../../data/cotizaciones.js';
import { selectProductos } from '../../redux/slices/productosSlice.js';

export default function CotizacionDetalle() {
  const { id } = useParams();
  const cotizacion = useSelector(selectCotizacionById(id));
  const productos = useSelector(selectProductos);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [showRechazo, setShowRechazo] = useState(false);
  const [accionando, setAccionando] = useState(false);
  const [errAccion, setErrAccion] = useState(null);

  if (!cotizacion) {
    return (
      <section>
        <h1 className="font-display font-black text-cream text-[36px]">No encontrada</h1>
        <p className="mt-3 text-amber-light/75">La cotización solicitada no existe.</p>
        <Link to="/cliente/cotizaciones" className="inline-flex mt-6 text-amber underline underline-offset-4">
          ← Volver a mis cotizaciones
        </Link>
      </section>
    );
  }

  const aprobar = async () => {
    setErrAccion(null);
    setAccionando(true);
    try {
      const actualizada = await dispatch(
        setEstadoCotizacion({ id: cotizacion.id, estado: 'aprobada' }),
      ).unwrap();
      if (actualizada?.pedidoCodigo) {
        navigate(`/cliente/pedidos/${actualizada.pedidoCodigo}`);
      } else {
        navigate('/cliente/pedidos');
      }
    } catch (e) {
      setErrAccion(typeof e === 'string' ? e : 'No se pudo aprobar la cotización.');
    } finally {
      setAccionando(false);
    }
  };

  const rechazar = async () => {
    if (!motivoRechazo.trim()) return;
    setErrAccion(null);
    setAccionando(true);
    try {
      await dispatch(
        setEstadoCotizacion({
          id: cotizacion.id,
          estado: 'rechazada',
          motivo: motivoRechazo.trim(),
        }),
      ).unwrap();
      setShowRechazo(false);
    } catch (e) {
      setErrAccion(typeof e === 'string' ? e : 'No se pudo rechazar la cotización.');
    } finally {
      setAccionando(false);
    }
  };

  const esPropuesta = cotizacion.estado === 'propuesta';
  const esAprobada = cotizacion.estado === 'aprobada';
  const esRechazada = cotizacion.estado === 'rechazada';

  return (
    <section>
      <Link
        to="/cliente/cotizaciones"
        className="text-amber-light/70 hover:text-amber-light text-[13px] underline underline-offset-4"
      >
        ← Volver a mis cotizaciones
      </Link>

      <div className="mt-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="font-mono text-amber-light/65 text-[13px]">{cotizacion.codigo}</p>
          <h1 className="mt-2 font-display font-black text-cream text-[40px] leading-tight">
            Cotización
          </h1>
          <p className="mt-2 text-amber-light/85 text-[14px]">
            Emitida el {cotizacion.fecha} · Vence {cotizacion.validez ?? '—'}
          </p>
        </div>
        <span className={`inline-block px-3 py-1.5 rounded-full text-[12px] tracking-wide border ${ESTADO_COTIZACION_COLOR[cotizacion.estado]}`}>
          {ESTADO_COTIZACION_LABEL[cotizacion.estado]}
        </span>
      </div>

      <div className="mt-10 grid lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
            <h2 className="font-display font-bold text-cream text-[18px] mb-4">Productos</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="text-amber-light/80 text-[11px] tracking-widest uppercase">
                  <tr className="border-b border-amber/10">
                    <th className="text-left py-2 pr-3">Producto</th>
                    <th className="text-left py-2 px-3">Técnica</th>
                    <th className="text-right py-2 px-3">Cant.</th>
                    <th className="text-right py-2 px-3">Precio unit.</th>
                    <th className="text-right py-2 pl-3">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {cotizacion.items.map((it, i) => {
                    const producto = productos.find((p) => p.id === it.productoId);
                    const importe = it.cantidad * it.precioUnit;
                    return (
                      <tr key={i} className="border-b border-amber/10 last:border-0 text-cream">
                        <td className="py-3 pr-3">
                          <p className="font-medium">{producto?.nombre ?? 'Producto'}</p>
                          {it.notas && (
                            <p className="text-[11px] text-amber-light/65 mt-1">{it.notas}</p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-cream/85">{it.tecnica}</td>
                        <td className="py-3 px-3 text-right">{it.cantidad}</td>
                        <td className="py-3 px-3 text-right">S/ {it.precioUnit.toFixed(2)}</td>
                        <td className="py-3 pl-3 text-right font-medium">
                          S/ {importe.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-6 pt-4 border-t border-amber/15 grid sm:grid-cols-3 gap-4 text-[14px]">
              <Row label="Subtotal"  value={`S/ ${cotizacion.subtotal.toFixed(2)}`} />
              <Row label="IGV (18 %)" value={`S/ ${cotizacion.igv.toFixed(2)}`} />
              <Row
                label={<span className="text-cream font-semibold">Total</span>}
                value={
                  <span className="text-amber font-display font-bold text-[20px]">
                    S/ {cotizacion.total.toFixed(2)}
                  </span>
                }
              />
            </div>
          </div>

          {cotizacion.notasCliente && (
            <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
              <h2 className="font-display font-bold text-cream text-[18px]">Tus notas</h2>
              <p className="mt-2 text-cream/85 text-[14px] leading-relaxed">
                {cotizacion.notasCliente}
              </p>
              {cotizacion.logoNombre && (
                <p className="mt-3 text-[12px] text-amber-light/85">
                  📎 Logo adjunto: {cotizacion.logoNombre}
                </p>
              )}
            </div>
          )}

          {cotizacion.notasVendedor && (
            <div className="p-6 rounded-xl border border-amber/30 bg-amber/10">
              <p className="text-[12px] tracking-[0.2em] uppercase text-amber mb-2">
                Notas del vendedor
              </p>
              <p className="text-cream/95 text-[14px] leading-relaxed">{cotizacion.notasVendedor}</p>
              {cotizacion.vendedor && (
                <p className="mt-3 text-[12px] text-amber-light/65">— {cotizacion.vendedor}</p>
              )}
            </div>
          )}

          {esRechazada && cotizacion.motivoRechazo && (
            <div className="p-6 rounded-xl border border-red-500/40 bg-red-500/10">
              <p className="text-[12px] tracking-[0.2em] uppercase text-red-300 mb-2">
                Motivo de rechazo
              </p>
              <p className="text-cream/95 text-[14px]">{cotizacion.motivoRechazo}</p>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          {esPropuesta && !showRechazo && (
            <div className="p-6 rounded-xl border border-amber/30 bg-amber/10">
              <h3 className="font-display font-bold text-cream text-[18px]">Propuesta lista</h3>
              <p className="mt-2 text-amber-light/85 text-[13px]">
                Revisa los detalles. Aprobar genera un pedido y entra a producción.
              </p>
              <button
                onClick={aprobar}
                disabled={accionando}
                className="mt-5 w-full px-5 py-3 rounded-full bg-amber text-brown font-semibold hover:bg-amber-light transition-colors disabled:opacity-50"
              >
                {accionando ? 'Aprobando…' : 'Aprobar y generar pedido'}
              </button>
              <button
                onClick={() => setShowRechazo(true)}
                disabled={accionando}
                className="mt-3 w-full px-5 py-3 rounded-full border border-red-400/40 text-red-300 hover:bg-red-500/10 transition-colors text-[14px] disabled:opacity-50"
              >
                Rechazar
              </button>
              {errAccion && (
                <p className="mt-3 text-red-300 text-[12px] bg-red-400/10 border border-red-400/30 rounded px-3 py-2">
                  {errAccion}
                </p>
              )}
            </div>
          )}

          {esPropuesta && showRechazo && (
            <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/5">
              <h3 className="font-display font-bold text-cream text-[16px]">
                ¿Por qué rechazas la propuesta?
              </h3>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                rows={3}
                placeholder="Plazo, precio, alcance…"
                className="mt-3 w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[13px] focus:border-amber focus:outline-none resize-y"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={rechazar}
                  disabled={!motivoRechazo.trim() || accionando}
                  className="flex-1 px-4 py-2 rounded-full bg-red-500/90 text-cream text-[13px] hover:bg-red-500 transition-colors disabled:opacity-40"
                >
                  {accionando ? 'Rechazando…' : 'Confirmar rechazo'}
                </button>
                <button
                  onClick={() => setShowRechazo(false)}
                  className="px-4 py-2 rounded-full text-cream/70 text-[13px] hover:text-cream"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {esAprobada && cotizacion.pedidoCodigo && (
            <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/10">
              <p className="text-[12px] tracking-[0.2em] uppercase text-green-300 mb-2">
                Pedido generado
              </p>
              <p className="text-cream font-display font-bold">{cotizacion.pedidoCodigo}</p>
              <Link
                to={`/cliente/pedidos/${cotizacion.pedidoCodigo}`}
                className="inline-flex mt-4 items-center gap-2 rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors"
              >
                Ver pedido
              </Link>
            </div>
          )}

          <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
            <p className="text-[12px] tracking-[0.2em] uppercase text-amber mb-3">Resumen</p>
            <dl className="space-y-2 text-[14px]">
              <Row label="Productos" value={cotizacion.items.length} />
              <Row
                label="Unidades"
                value={cotizacion.items.reduce((acc, it) => acc + it.cantidad, 0)}
              />
              <Row label="Vendedor" value={cotizacion.vendedor ?? 'Por asignar'} />
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-cream/75 text-[13px]">{label}</dt>
      <dd className="text-cream text-right">{value}</dd>
    </div>
  );
}


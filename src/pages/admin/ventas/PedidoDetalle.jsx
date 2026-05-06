import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectPedidoById } from '../../../redux/slices/pedidosSlice.js';
import { fetchArtes, selectArtesByPedido } from '../../../redux/slices/artesSlice.js';
import { fetchTracking, selectTrackingByPedido } from '../../../redux/slices/trackingSlice.js';
import { selectProductos } from '../../../redux/slices/productosSlice.js';
import {
  ESTADO_PEDIDO_LABEL,
  ESTADO_PEDIDO_COLOR,
  PEDIDO_TIMELINE,
} from '../../../data/pedidos.js';
import AdminHeader, { Card, StatusBadge } from '../../../components/AdminHeader.jsx';

export default function PedidoDetalleAdmin() {
  const { id } = useParams();
  const pedido = useSelector(selectPedidoById(id));
  const productos = useSelector(selectProductos);
  const artes = useSelector(selectArtesByPedido(pedido?.codigo));
  const tracking = useSelector(selectTrackingByPedido(pedido?.codigo));
  const dispatch = useDispatch();

  useEffect(() => {
    if (pedido?.codigo) {
      dispatch(fetchArtes(pedido.codigo));
      dispatch(fetchTracking(pedido.codigo));
    }
  }, [dispatch, pedido?.codigo]);

  if (!pedido) {
    return (
      <section>
        <AdminHeader
          title="Pedido no encontrado"
          backTo="/admin/ventas/pedidos"
          backLabel="← Volver"
        />
      </section>
    );
  }

  return (
    <section>
      <AdminHeader
        backTo="/admin/ventas/pedidos"
        backLabel="← Volver a pedidos"
        eyebrow={pedido.codigo}
        title={pedido.empresa}
        subtitle={`Cotización ${pedido.cotizacionCodigo} · Creado ${pedido.fechaPedido}`}
        action={
          <StatusBadge className={ESTADO_PEDIDO_COLOR[pedido.estado]}>
            {ESTADO_PEDIDO_LABEL[pedido.estado]}
          </StatusBadge>
        }
      />

      <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Card title="Tracking">
            <ol className="relative">
              {PEDIDO_TIMELINE.map((meta, i) => {
                const evento = tracking.find((e) => e.hito === meta.key);
                const completo = evento?.completo ?? false;
                const isLast = i === PEDIDO_TIMELINE.length - 1;
                return (
                  <li key={meta.key} className="relative pl-8 pb-5 last:pb-0">
                    {!isLast && (
                      <span
                        className={`absolute left-[7px] top-4 bottom-0 w-px ${
                          completo ? 'bg-amber' : 'bg-amber/15'
                        }`}
                      />
                    )}
                    <span
                      className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${
                        completo ? 'bg-amber border-amber' : 'bg-bg-dark border-amber/30'
                      }`}
                    />
                    <p className={`font-display font-bold text-[14px] ${completo ? 'text-cream' : 'text-cream/45'}`}>
                      {meta.label}
                    </p>
                    <p className="text-[11px] text-amber-light/65">{evento?.fecha ?? 'Pendiente'}</p>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card title="Productos">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="text-amber-light/80 text-[10px] tracking-widest uppercase">
                  <tr className="border-b border-amber/10">
                    <th className="text-left py-2 pr-3">Producto</th>
                    <th className="text-left py-2 px-3">Técnica</th>
                    <th className="text-right py-2 px-3">Cant.</th>
                    <th className="text-right py-2 px-3">Precio</th>
                    <th className="text-right py-2 pl-3">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.items.map((it, i) => {
                    const producto = productos.find((p) => p.id === it.productoId);
                    return (
                      <tr key={i} className="border-b border-amber/10 last:border-0 text-cream">
                        <td className="py-3 pr-3 font-medium">{producto?.nombre ?? 'Producto'}</td>
                        <td className="py-3 px-3 text-cream/85">{it.tecnica}</td>
                        <td className="py-3 px-3 text-right">{it.cantidad}</td>
                        <td className="py-3 px-3 text-right">S/ {it.precioUnit.toFixed(2)}</td>
                        <td className="py-3 pl-3 text-right">
                          S/ {(it.cantidad * it.precioUnit).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-5 pt-4 border-t border-amber/15 grid sm:grid-cols-3 gap-4 text-[13px]">
              <Row label="Subtotal"   value={`S/ ${pedido.subtotal.toFixed(2)}`} />
              <Row label="IGV (18 %)"  value={`S/ ${pedido.igv.toFixed(2)}`} />
              <Row
                label={<span className="text-cream font-semibold">Total</span>}
                value={
                  <span className="text-amber font-display font-bold text-[18px]">
                    S/ {pedido.total.toFixed(2)}
                  </span>
                }
              />
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Pago">
            {pedido.voucherUrl ? (
              <div>
                <p className="text-cream text-[14px]">✓ Voucher cargado</p>
                <p className="text-amber-light/70 text-[12px] mt-1 break-all">
                  {pedido.voucherUrl}
                </p>
                <p className="text-amber-light/55 text-[11px] mt-1">{pedido.voucherFecha}</p>
              </div>
            ) : (
              <p className="text-cream/65 text-[13px]">Voucher pendiente.</p>
            )}
          </Card>

          {pedido.courier && (
            <Card title="Despacho">
              <p className="text-cream text-[14px]">{pedido.courier}</p>
              {pedido.guiaRemision && (
                <p className="mt-1 text-amber-light/70 text-[12px]">Guía: {pedido.guiaRemision}</p>
              )}
            </Card>
          )}

          <Card title="Artes">
            {artes.length === 0 ? (
              <p className="text-cream/65 text-[13px]">Sin artes cargados.</p>
            ) : (
              <ul className="space-y-3">
                {artes.map((a) => (
                  <li
                    key={a.id}
                    className="text-[13px] border-l-2 border-amber/40 pl-3"
                  >
                    <p className="text-cream">
                      Versión {a.version} · {a.estado}
                    </p>
                    <p className="text-amber-light/65 text-[11px]">{a.fecha}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
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

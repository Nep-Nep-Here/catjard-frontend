import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectProductos } from '../../../redux/slices/productosSlice.js';
import { selectMovimientos } from '../../../redux/slices/movimientosSlice.js';
import { selectOrdenesCompra } from '../../../redux/slices/ordenesCompraSlice.js';
import { selectPedidos } from '../../../redux/slices/pedidosSlice.js';
import {
  TIPO_MOVIMIENTO_LABEL,
  TIPO_MOVIMIENTO_COLOR,
} from '../../../data/movimientos.js';
import {
  ESTADO_OC_LABEL,
  ESTADO_OC_COLOR,
} from '../../../data/ordenesCompra.js';
import AdminHeader, { Card, KpiCard, StatusBadge } from '../../../components/AdminHeader.jsx';

export default function AlmacenDashboard() {
  const productos = useSelector(selectProductos);
  const movimientos = useSelector(selectMovimientos);
  const ordenesCompra = useSelector(selectOrdenesCompra);
  const pedidos = useSelector(selectPedidos);

  const stockCritico = productos.filter((p) => p.stock <= p.stockMinimo);
  const ocPendientes = ordenesCompra.filter((o) => ['borrador', 'enviada'].includes(o.estado));
  const despachosPendientes = pedidos.filter((p) =>
    ['control_calidad', 'listo'].includes(p.estado),
  );
  const movimientosRecientes = movimientos.slice(0, 5);

  return (
    <section>
      <AdminHeader
        eyebrow="Logística y Almacén"
        title="Dashboard"
        subtitle={`${productos.length} productos · ${movimientos.length} movimientos · ${ordenesCompra.length} órdenes de compra`}
      />

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Stock crítico" value={stockCritico.length} hint="Productos en o bajo el mínimo" />
        <KpiCard label="OCs pendientes" value={ocPendientes.length} hint="Por recibir o enviar al proveedor" />
        <KpiCard label="Despachos pendientes" value={despachosPendientes.length} hint="Pedidos por enviar" />
        <KpiCard label="Total productos" value={productos.length} hint="En catálogo" />
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <Card
          title="Stock crítico"
          action={
            <Link to="/admin/almacen/inventario" className="text-[12px] text-amber-light/70 hover:text-amber-light underline underline-offset-4">
              Ver inventario
            </Link>
          }
        >
          {stockCritico.length === 0 ? (
            <p className="text-cream/65 text-[13px]">Todo bajo control. No hay productos en stock crítico.</p>
          ) : (
            <ul className="divide-y divide-amber/10">
              {stockCritico.slice(0, 6).map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-cream text-[14px]">{p.nombre}</p>
                    <p className="text-amber-light/65 text-[11px]">Mínimo: {p.stockMinimo}</p>
                  </div>
                  <span className="text-red-300 font-display font-bold text-[16px]">{p.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Movimientos recientes"
          action={
            <Link to="/admin/almacen/movimientos" className="text-[12px] text-amber-light/70 hover:text-amber-light underline underline-offset-4">
              Ver todos
            </Link>
          }
        >
          {movimientosRecientes.length === 0 ? (
            <p className="text-cream/65 text-[13px]">Sin movimientos.</p>
          ) : (
            <ul className="divide-y divide-amber/10">
              {movimientosRecientes.map((m) => {
                const producto = productos.find((p) => p.id === m.productoId);
                return (
                  <li key={m.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display font-bold text-cream text-[14px] truncate">
                        {producto?.nombre ?? 'Producto'}
                      </p>
                      <p className="text-amber-light/65 text-[11px]">
                        {m.fecha} · {m.motivo}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge className={TIPO_MOVIMIENTO_COLOR[m.tipo]}>
                        {TIPO_MOVIMIENTO_LABEL[m.tipo]} {Math.abs(m.cantidad)}
                      </StatusBadge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card
          title="OCs activas"
          action={
            <Link to="/admin/almacen/ordenes" className="text-[12px] text-amber-light/70 hover:text-amber-light underline underline-offset-4">
              Ver todas
            </Link>
          }
        >
          {ocPendientes.length === 0 ? (
            <p className="text-cream/65 text-[13px]">No hay OCs pendientes.</p>
          ) : (
            <ul className="divide-y divide-amber/10">
              {ocPendientes.map((o) => (
                <li key={o.id}>
                  <Link to={`/admin/almacen/ordenes/${o.id}`} className="flex items-center justify-between py-3 group">
                    <div>
                      <p className="font-mono text-cream text-[13px]">{o.id}</p>
                      <p className="text-amber-light/60 text-[11px]">{o.proveedorNombre}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge className={ESTADO_OC_COLOR[o.estado]}>
                        {ESTADO_OC_LABEL[o.estado]}
                      </StatusBadge>
                      <p className="text-amber font-display font-bold text-[13px] mt-1">
                        S/ {o.total.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Despachos pendientes"
          action={
            <Link to="/admin/almacen/despachos" className="text-[12px] text-amber-light/70 hover:text-amber-light underline underline-offset-4">
              Ver todos
            </Link>
          }
        >
          {despachosPendientes.length === 0 ? (
            <p className="text-cream/65 text-[13px]">No hay despachos pendientes.</p>
          ) : (
            <ul className="divide-y divide-amber/10">
              {despachosPendientes.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-cream text-[13px]">{p.id}</p>
                    <p className="text-amber-light/60 text-[11px]">{p.empresa}</p>
                  </div>
                  <p className="text-cream/85 text-[12px]">
                    Entrega est. {p.fechaEntregaEstimada}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </section>
  );
}

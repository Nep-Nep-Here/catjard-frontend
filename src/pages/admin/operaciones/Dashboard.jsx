import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectPedidos } from '../../../redux/slices/pedidosSlice.js';
import { selectProductos } from '../../../redux/slices/productosSlice.js';
import {
  ESTADO_PEDIDO_LABEL,
  ESTADO_PEDIDO_COLOR,
} from '../../../data/pedidos.js';
import AdminHeader, { Card, KpiCard, StatusBadge } from '../../../components/AdminHeader.jsx';

export default function OperacionesDashboard() {
  const pedidos = useSelector(selectPedidos);
  const productos = useSelector(selectProductos);

  const enDiseno = pedidos.filter((p) => p.estado === 'en_diseno');
  const esperandoArte = pedidos.filter((p) => p.estado === 'esperando_aprobacion_arte');
  const enProduccion = pedidos.filter((p) => p.estado === 'en_produccion');
  const enControl = pedidos.filter((p) => p.estado === 'control_calidad');

  const activos = pedidos.filter((p) =>
    ['en_diseno', 'esperando_aprobacion_arte', 'en_produccion'].includes(p.estado),
  );

  return (
    <section>
      <AdminHeader
        eyebrow="Producción y Operaciones"
        title="Dashboard"
        subtitle={`${activos.length} pedidos activos`}
      />

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="En diseño" value={enDiseno.length} hint="Por subir arte" />
        <KpiCard label="Esperando aprobación" value={esperandoArte.length} hint="Cliente revisa arte" />
        <KpiCard label="En producción" value={enProduccion.length} hint="Personalizando" />
        <KpiCard label="En control de calidad" value={enControl.length} hint="Almacén revisa" />
      </div>

      <div className="mt-8">
        <Card
          title="Pedidos activos"
          action={
            <Link
              to="/admin/operaciones/kanban"
              className="text-[12px] text-amber-light/70 hover:text-amber-light underline underline-offset-4"
            >
              Ver tablero
            </Link>
          }
        >
          {activos.length === 0 ? (
            <p className="text-cream/65 text-[13px]">No hay pedidos activos en producción.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="text-amber-light/80 text-[10px] tracking-widest uppercase">
                  <tr className="border-b border-amber/10">
                    <th className="text-left py-2 pr-3">Pedido</th>
                    <th className="text-left py-2 px-3">Empresa</th>
                    <th className="text-left py-2 px-3">Items</th>
                    <th className="text-left py-2 px-3">Estado</th>
                    <th className="text-left py-2 px-3">Entrega</th>
                    <th className="text-left py-2 pl-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {activos.map((p) => {
                    const unidades = p.items.reduce((acc, it) => acc + it.cantidad, 0);
                    return (
                      <tr key={p.id} className="border-b border-amber/10 last:border-0">
                        <td className="py-3 pr-3 font-mono text-cream/90">{p.id}</td>
                        <td className="py-3 px-3 text-cream font-medium">{p.empresa}</td>
                        <td className="py-3 px-3 text-cream/85">
                          {p.items.length} líneas · {unidades} und
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge className={ESTADO_PEDIDO_COLOR[p.estado]}>
                            {ESTADO_PEDIDO_LABEL[p.estado]}
                          </StatusBadge>
                        </td>
                        <td className="py-3 px-3 text-cream/85">{p.fechaEntregaEstimada}</td>
                        <td className="py-3 pl-3 text-right">
                          <Link
                            to={`/admin/operaciones/pedidos/${p.id}`}
                            className="text-amber-light hover:text-amber underline underline-offset-4 text-[12px]"
                          >
                            Abrir
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}

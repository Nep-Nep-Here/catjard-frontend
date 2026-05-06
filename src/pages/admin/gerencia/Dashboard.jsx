import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCotizaciones } from '../../../redux/slices/cotizacionesSlice.js';
import { selectPedidos } from '../../../redux/slices/pedidosSlice.js';
import { selectProductos } from '../../../redux/slices/productosSlice.js';
import { selectClientes } from '../../../redux/slices/clientesSlice.js';
import { selectLeads } from '../../../redux/slices/leadsSlice.js';
import { selectUsuariosInternos } from '../../../redux/slices/usuariosSlice.js';
import AdminHeader, { Card, KpiCard } from '../../../components/AdminHeader.jsx';

export default function GerenciaDashboard() {
  const cotizaciones = useSelector(selectCotizaciones);
  const pedidos = useSelector(selectPedidos);
  const productos = useSelector(selectProductos);
  const clientes = useSelector(selectClientes);
  const leads = useSelector(selectLeads);
  const usuariosInternos = useSelector(selectUsuariosInternos);

  const ventasTotal = pedidos.reduce((acc, p) => acc + (p.total ?? 0), 0);
  const pedidosEntregados = pedidos.filter((p) => p.estado === 'entregado').length;
  const pedidosActivos = pedidos.filter((p) => p.estado !== 'entregado').length;
  const stockCritico = productos.filter((p) => p.stock <= p.stockMinimo).length;
  const tasaCierre = leads.length > 0
    ? Math.round((leads.filter((l) => l.estado === 'convertido').length / leads.length) * 100)
    : 0;

  const topProductos = useMemoTopProductos(pedidos, productos);
  const topClientes = useMemoTopClientes(pedidos, clientes);

  return (
    <section>
      <AdminHeader
        eyebrow="Dirección · Gerencia"
        title="Dashboard ejecutivo"
        subtitle="Vista global de la operación"
      />

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Ventas totales"
          value={`S/ ${ventasTotal.toLocaleString('es-PE', { minimumFractionDigits: 0 })}`}
          hint={`${pedidos.length} pedidos en total`}
        />
        <KpiCard
          label="Pedidos activos"
          value={pedidosActivos}
          hint={`${pedidosEntregados} ya entregados`}
        />
        <KpiCard
          label="Cotizaciones"
          value={cotizaciones.length}
          hint={`${cotizaciones.filter((c) => c.estado === 'aprobada').length} aprobadas`}
        />
        <KpiCard
          label="Tasa de cierre"
          value={`${tasaCierre}%`}
          hint={`${leads.length} leads totales`}
        />
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Clientes en CRM" value={clientes.length} hint={`${clientes.filter((c) => c.cuentaActiva).length} con cuenta`} />
        <KpiCard label="Productos" value={productos.length} hint={`${stockCritico} en stock crítico`} />
        <KpiCard label="Equipo interno" value={usuariosInternos.length} hint="Usuarios con acceso" />
        <KpiCard
          label="Leads activos"
          value={leads.filter((l) => l.estado === 'nuevo').length}
          hint={`${leads.filter((l) => l.estado === 'contactado').length} contactados`}
        />
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <Card
          title="Top productos vendidos"
          action={
            <Link to="/admin/gerencia/reportes" className="text-[12px] text-amber-light/70 hover:text-amber-light underline underline-offset-4">
              Ver reportes
            </Link>
          }
        >
          {topProductos.length === 0 ? (
            <p className="text-cream/65 text-[13px]">Sin datos.</p>
          ) : (
            <ul className="divide-y divide-amber/10">
              {topProductos.slice(0, 5).map((tp, i) => (
                <li key={tp.producto?.id ?? i} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-amber-light/55 text-[11px]">#{i + 1}</p>
                    <p className="font-display font-bold text-cream text-[14px] truncate">
                      {tp.producto?.nombre ?? '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-amber text-[15px]">{tp.cantidad}</p>
                    <p className="text-amber-light/65 text-[11px]">unidades</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Top clientes por facturación"
          action={
            <Link to="/admin/gerencia/reportes" className="text-[12px] text-amber-light/70 hover:text-amber-light underline underline-offset-4">
              Ver reportes
            </Link>
          }
        >
          {topClientes.length === 0 ? (
            <p className="text-cream/65 text-[13px]">Sin datos.</p>
          ) : (
            <ul className="divide-y divide-amber/10">
              {topClientes.slice(0, 5).map((tc, i) => (
                <li key={tc.empresa} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-amber-light/55 text-[11px]">#{i + 1}</p>
                    <p className="font-display font-bold text-cream text-[14px]">{tc.empresa}</p>
                  </div>
                  <p className="font-display font-bold text-amber text-[15px]">
                    S/ {tc.total.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
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

function useMemoTopProductos(pedidos, productos) {
  const acumulado = new Map();
  pedidos.forEach((p) => {
    p.items.forEach((it) => {
      const acc = acumulado.get(it.productoId) ?? { cantidad: 0, importe: 0 };
      acc.cantidad += it.cantidad;
      acc.importe += it.cantidad * it.precioUnit;
      acumulado.set(it.productoId, acc);
    });
  });
  return Array.from(acumulado.entries())
    .map(([id, v]) => ({ producto: productos.find((p) => p.id === id), ...v }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

function useMemoTopClientes(pedidos, clientes) {
  const acumulado = new Map();
  pedidos.forEach((p) => {
    const empresa = p.empresa;
    const acc = acumulado.get(empresa) ?? { total: 0, pedidos: 0 };
    acc.total += p.total ?? 0;
    acc.pedidos += 1;
    acumulado.set(empresa, acc);
  });
  return Array.from(acumulado.entries())
    .map(([empresa, v]) => ({ empresa, ...v }))
    .sort((a, b) => b.total - a.total);
}

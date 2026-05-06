import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectLeads } from '../../../redux/slices/leadsSlice.js';
import { selectCotizaciones } from '../../../redux/slices/cotizacionesSlice.js';
import { selectPedidos } from '../../../redux/slices/pedidosSlice.js';
import { selectClientes } from '../../../redux/slices/clientesSlice.js';
import {
  ESTADO_COTIZACION_LABEL,
  ESTADO_COTIZACION_COLOR,
} from '../../../data/cotizaciones.js';
import { ESTADO_LEAD_COLOR, ESTADO_LEAD_LABEL } from '../../../data/leads.js';
import AdminHeader, { Card, KpiCard, StatusBadge } from '../../../components/AdminHeader.jsx';

export default function VentasDashboard() {
  const leads = useSelector(selectLeads);
  const cotizaciones = useSelector(selectCotizaciones);
  const pedidos = useSelector(selectPedidos);
  const clientes = useSelector(selectClientes);

  const leadsNuevos = leads.filter((l) => l.estado === 'nuevo');
  const enRevision = cotizaciones.filter((c) => ['enviada', 'en_revision'].includes(c.estado));
  const propuestas = cotizaciones.filter((c) => c.estado === 'propuesta');
  const aprobadas = cotizaciones.filter((c) => c.estado === 'aprobada');

  const ingresosMes = pedidos
    .filter((p) => p.fechaPedido?.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((acc, p) => acc + (p.total ?? 0), 0);

  const ultimosLeads = [...leads].slice(0, 4);
  const ultimasCotizaciones = [...cotizaciones].slice(0, 5);

  return (
    <section>
      <AdminHeader
        eyebrow="Marketing y Ventas"
        title="Dashboard"
        subtitle={`${clientes.length} clientes · ${cotizaciones.length} cotizaciones · ${pedidos.length} pedidos`}
      />

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Leads nuevos"
          value={leadsNuevos.length}
          hint="Sin contactar"
        />
        <KpiCard
          label="Por revisar"
          value={enRevision.length}
          hint="Cotizaciones por procesar"
        />
        <KpiCard
          label="Propuestas activas"
          value={propuestas.length}
          hint="Esperando decisión del cliente"
        />
        <KpiCard
          label="Ingresos del mes"
          value={`S/ ${ingresosMes.toLocaleString('es-PE', { minimumFractionDigits: 0 })}`}
          hint={`${aprobadas.length} cotizaciones cerradas`}
        />
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <Card
          title="Leads recientes"
          action={
            <Link
              to="/admin/ventas/leads"
              className="text-[12px] text-amber-light/70 hover:text-amber-light underline underline-offset-4"
            >
              Ver todos
            </Link>
          }
        >
          {ultimosLeads.length === 0 ? (
            <p className="text-cream/65 text-[14px]">No hay leads.</p>
          ) : (
            <ul className="divide-y divide-amber/10">
              {ultimosLeads.map((l) => (
                <li key={l.id}>
                  <Link
                    to={`/admin/ventas/leads/${l.id}`}
                    className="flex items-center justify-between py-3 group"
                  >
                    <div className="min-w-0">
                      <p className="font-display font-bold text-cream text-[15px] group-hover:text-amber-light truncate">
                        {l.empresa}
                      </p>
                      <p className="text-amber-light/60 text-[12px] truncate">
                        {l.productos} · {l.cantidad} und
                      </p>
                    </div>
                    <StatusBadge className={ESTADO_LEAD_COLOR[l.estado]}>
                      {ESTADO_LEAD_LABEL[l.estado]}
                    </StatusBadge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Últimas cotizaciones"
          action={
            <Link
              to="/admin/ventas/cotizaciones"
              className="text-[12px] text-amber-light/70 hover:text-amber-light underline underline-offset-4"
            >
              Ver todas
            </Link>
          }
        >
          {ultimasCotizaciones.length === 0 ? (
            <p className="text-cream/65 text-[14px]">No hay cotizaciones.</p>
          ) : (
            <ul className="divide-y divide-amber/10">
              {ultimasCotizaciones.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/admin/ventas/cotizaciones/${c.id}`}
                    className="flex items-center justify-between py-3 group"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-cream text-[13px]">{c.id}</p>
                      <p className="text-amber-light/60 text-[12px] truncate">{c.empresa}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge className={ESTADO_COTIZACION_COLOR[c.estado]}>
                        {ESTADO_COTIZACION_LABEL[c.estado]}
                      </StatusBadge>
                      <p className="text-amber font-display font-bold text-[14px] mt-1">
                        S/ {c.total.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </section>
  );
}

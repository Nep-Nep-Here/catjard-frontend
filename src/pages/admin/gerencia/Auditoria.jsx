import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCotizaciones } from '../../../redux/slices/cotizacionesSlice.js';
import { selectPedidos } from '../../../redux/slices/pedidosSlice.js';
import { selectMovimientos } from '../../../redux/slices/movimientosSlice.js';
import { selectOrdenesCompra } from '../../../redux/slices/ordenesCompraSlice.js';
import { selectLeads } from '../../../redux/slices/leadsSlice.js';
import {
  ESTADO_COTIZACION_LABEL,
} from '../../../data/cotizaciones.js';
import { ESTADO_PEDIDO_LABEL } from '../../../data/pedidos.js';
import { ESTADO_OC_LABEL } from '../../../data/ordenesCompra.js';
import { ESTADO_LEAD_LABEL } from '../../../data/leads.js';
import {
  TIPO_MOVIMIENTO_LABEL,
} from '../../../data/movimientos.js';
import AdminHeader, { Card, EmptyState } from '../../../components/AdminHeader.jsx';

const TIPOS = [
  { id: '',             label: 'Todos' },
  { id: 'cotizacion',   label: 'Cotizaciones' },
  { id: 'pedido',       label: 'Pedidos' },
  { id: 'movimiento',   label: 'Movimientos' },
  { id: 'oc',           label: 'OCs' },
  { id: 'lead',         label: 'Leads' },
];

const TIPO_COLOR = {
  cotizacion:  'bg-blue-500/15 text-blue-300 border-blue-500/30',
  pedido:      'bg-purple-500/15 text-purple-300 border-purple-500/30',
  movimiento:  'bg-orange-500/15 text-orange-300 border-orange-500/30',
  oc:          'bg-amber/15 text-amber-light border-amber/30',
  lead:        'bg-green-500/15 text-green-300 border-green-500/30',
};

const TIPO_LABEL = {
  cotizacion: 'Cotización',
  pedido: 'Pedido',
  movimiento: 'Movimiento',
  oc: 'Orden de compra',
  lead: 'Lead',
};

export default function Auditoria() {
  const cotizaciones = useSelector(selectCotizaciones);
  const pedidos = useSelector(selectPedidos);
  const movimientos = useSelector(selectMovimientos);
  const ordenesCompra = useSelector(selectOrdenesCompra);
  const leads = useSelector(selectLeads);

  const [filtro, setFiltro] = useState('');

  const eventos = useMemo(() => {
    const all = [];
    cotizaciones.forEach((c) => {
      all.push({
        tipo: 'cotizacion',
        fecha: c.fecha,
        ref: c.codigo ?? c.id,
        descripcion: `Cotización ${c.empresa} (${ESTADO_COTIZACION_LABEL[c.estado]})`,
        usuario: c.vendedor ?? '—',
        monto: c.total,
      });
    });
    pedidos.forEach((p) => {
      all.push({
        tipo: 'pedido',
        fecha: p.fechaPedido,
        ref: p.codigo ?? p.id,
        descripcion: `Pedido ${p.empresa} (${ESTADO_PEDIDO_LABEL[p.estado]})`,
        usuario: p.procesadoPor ?? '—',
        monto: p.total,
      });
    });
    movimientos.forEach((m) => {
      all.push({
        tipo: 'movimiento',
        fecha: m.fecha,
        ref: m.referencia || `MOV-${m.id}`,
        descripcion: `${TIPO_MOVIMIENTO_LABEL[m.tipo]} de ${Math.abs(m.cantidad)} und · ${m.motivo}`,
        usuario: m.usuario,
      });
    });
    ordenesCompra.forEach((o) => {
      all.push({
        tipo: 'oc',
        fecha: o.fecha,
        ref: o.id,
        descripcion: `OC a ${o.proveedorNombre} (${ESTADO_OC_LABEL[o.estado]})`,
        usuario: o.usuario,
        monto: o.total,
      });
    });
    leads.forEach((l) => {
      all.push({
        tipo: 'lead',
        fecha: l.fecha,
        ref: l.codigo ?? l.id,
        descripcion: `Lead de ${l.empresa} (${ESTADO_LEAD_LABEL[l.estado]})`,
        usuario: l.asignadoA ?? '—',
      });
    });
    return all.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  }, [cotizaciones, pedidos, movimientos, ordenesCompra, leads]);

  const filtrados = filtro ? eventos.filter((e) => e.tipo === filtro) : eventos;

  return (
    <section>
      <AdminHeader
        eyebrow="Dirección"
        title="Auditoría"
        subtitle={`${filtrados.length} eventos registrados`}
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {TIPOS.map((t) => (
          <button
            key={t.id || 'all'}
            onClick={() => setFiltro(t.id)}
            className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
              filtro === t.id
                ? 'bg-amber text-brown border-amber font-semibold'
                : 'bg-transparent text-cream/80 border-amber/25 hover:border-amber/60 hover:text-cream'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-8">
          <EmptyState titulo="Sin eventos" descripcion="Cambia el filtro o realiza acciones en otros módulos." />
        </div>
      ) : (
        <Card className="mt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="text-amber-light/80 text-[10px] tracking-widest uppercase">
                <tr className="border-b border-amber/10">
                  <th className="text-left py-2 pr-3">Fecha</th>
                  <th className="text-left py-2 px-3">Tipo</th>
                  <th className="text-left py-2 px-3">Referencia</th>
                  <th className="text-left py-2 px-3">Descripción</th>
                  <th className="text-left py-2 px-3">Usuario</th>
                  <th className="text-right py-2 pl-3">Monto</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((e, i) => (
                  <tr key={`${e.tipo}-${e.ref}-${i}`} className="border-b border-amber/10 last:border-0 hover:bg-amber/5">
                    <td className="py-3 pr-3 text-cream/85 whitespace-nowrap">{e.fecha}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] tracking-wide border ${TIPO_COLOR[e.tipo]}`}>
                        {TIPO_LABEL[e.tipo]}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[12px] text-amber-light/65">{e.ref}</td>
                    <td className="py-3 px-3 text-cream">{e.descripcion}</td>
                    <td className="py-3 px-3 text-cream/85">{e.usuario}</td>
                    <td className="py-3 pl-3 text-right text-amber font-display font-bold">
                      {e.monto != null ? `S/ ${e.monto.toLocaleString('es-PE', { minimumFractionDigits: 0 })}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </section>
  );
}

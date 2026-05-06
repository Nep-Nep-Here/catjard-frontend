import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectOrdenesCompra } from '../../../redux/slices/ordenesCompraSlice.js';
import {
  ESTADO_OC_LABEL,
  ESTADO_OC_COLOR,
} from '../../../data/ordenesCompra.js';
import AdminHeader, { StatusBadge, EmptyState } from '../../../components/AdminHeader.jsx';

const FILTROS = [
  { id: '',           label: 'Todas' },
  { id: 'borrador',   label: 'Borradores' },
  { id: 'enviada',    label: 'Enviadas' },
  { id: 'recibida',   label: 'Recibidas' },
  { id: 'cancelada',  label: 'Canceladas' },
];

export default function OrdenesCompra() {
  const oc = useSelector(selectOrdenesCompra);
  const [filtro, setFiltro] = useState('');

  const filtradas = useMemo(
    () => (filtro ? oc.filter((o) => o.estado === filtro) : oc),
    [oc, filtro],
  );

  return (
    <section>
      <AdminHeader
        eyebrow="Almacén"
        title="Órdenes de compra"
        subtitle={`${filtradas.length} de ${oc.length}`}
        action={
          <Link
            to="/admin/almacen/ordenes/nueva"
            className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors"
          >
            + Nueva orden
          </Link>
        }
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.id || 'all'}
            onClick={() => setFiltro(f.id)}
            className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
              filtro === f.id
                ? 'bg-amber text-brown border-amber font-semibold'
                : 'bg-transparent text-cream/80 border-amber/25 hover:border-amber/60 hover:text-cream'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className="mt-8">
          <EmptyState titulo="Sin órdenes de compra" descripcion="Crea la primera." />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-amber/15">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
              <tr>
                <th className="px-5 py-4">N°</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Proveedor</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Esperada</th>
                <th className="px-5 py-4 text-right">Total</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((o) => (
                <tr key={o.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                  <td className="px-5 py-3 font-mono text-cream/90">{o.id}</td>
                  <td className="px-5 py-3 text-cream/85">{o.fecha}</td>
                  <td className="px-5 py-3 text-cream font-medium">{o.proveedorNombre}</td>
                  <td className="px-5 py-3 text-cream/85">{o.items.length}</td>
                  <td className="px-5 py-3">
                    <StatusBadge className={ESTADO_OC_COLOR[o.estado]}>
                      {ESTADO_OC_LABEL[o.estado]}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3 text-cream/85">{o.fechaEsperada || '—'}</td>
                  <td className="px-5 py-3 text-right font-display font-bold text-amber">
                    S/ {o.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to={`/admin/almacen/ordenes/${o.id}`}
                      className="text-amber-light hover:text-amber underline underline-offset-4 text-[12px]"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

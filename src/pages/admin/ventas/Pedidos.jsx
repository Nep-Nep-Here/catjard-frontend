import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectPedidos } from '../../../redux/slices/pedidosSlice.js';
import {
  ESTADO_PEDIDO_LABEL,
  ESTADO_PEDIDO_COLOR,
} from '../../../data/pedidos.js';
import AdminHeader, { StatusBadge, EmptyState } from '../../../components/AdminHeader.jsx';

const FILTROS = [
  { id: '',           label: 'Todos' },
  { id: 'en_curso',   label: 'En curso' },
  { id: 'entregado',  label: 'Entregados' },
];

export default function PedidosAdmin() {
  const pedidos = useSelector(selectPedidos);
  const [filtro, setFiltro] = useState('');
  const [search, setSearch] = useState('');

  const filtrados = useMemo(() => {
    let list = pedidos;
    if (filtro === 'entregado') list = list.filter((p) => p.estado === 'entregado');
    else if (filtro === 'en_curso') list = list.filter((p) => p.estado !== 'entregado');
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => p.codigo?.toLowerCase().includes(q) || p.empresa?.toLowerCase().includes(q));
    return list;
  }, [pedidos, filtro, search]);

  return (
    <section>
      <AdminHeader
        eyebrow="Ventas"
        title="Pedidos"
        subtitle={`${filtrados.length} de ${pedidos.length}`}
      />

      <div className="mt-8 grid sm:grid-cols-[1fr_auto] gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por ID o empresa…"
          className="px-4 py-2.5 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
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
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-8">
          <EmptyState titulo="Sin resultados" descripcion="Ajusta filtros o búsqueda." />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-amber/15">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
              <tr>
                <th className="px-5 py-4">N°</th>
                <th className="px-5 py-4">Cotización</th>
                <th className="px-5 py-4">Empresa</th>
                <th className="px-5 py-4">Creado</th>
                <th className="px-5 py-4">Entrega</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Total</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                  <td className="px-5 py-3 font-mono text-cream/90">{p.codigo}</td>
                  <td className="px-5 py-3 font-mono text-amber-light/65 text-[12px]">{p.cotizacionCodigo}</td>
                  <td className="px-5 py-3 text-cream font-medium">{p.empresa}</td>
                  <td className="px-5 py-3 text-cream/85">{p.fechaPedido}</td>
                  <td className="px-5 py-3 text-cream/85">{p.fechaEntregaEstimada ?? '—'}</td>
                  <td className="px-5 py-3">
                    <StatusBadge className={ESTADO_PEDIDO_COLOR[p.estado]}>
                      {ESTADO_PEDIDO_LABEL[p.estado]}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3 text-right font-display font-bold text-amber">
                    S/ {p.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to={`/admin/ventas/pedidos/${p.id}`}
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

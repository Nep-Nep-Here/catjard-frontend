import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCotizaciones } from '../../../redux/slices/cotizacionesSlice.js';
import {
  ESTADO_COTIZACION_LABEL,
  ESTADO_COTIZACION_COLOR,
} from '../../../data/cotizaciones.js';
import AdminHeader, { StatusBadge, EmptyState } from '../../../components/AdminHeader.jsx';

const FILTROS = [
  { id: '',            label: 'Todas' },
  { id: 'enviada',     label: 'Por revisar' },
  { id: 'en_revision', label: 'En revisión' },
  { id: 'propuesta',   label: 'Con propuesta' },
  { id: 'aprobada',    label: 'Aprobadas' },
  { id: 'rechazada',   label: 'Rechazadas' },
];

export default function Cotizaciones() {
  const cotizaciones = useSelector(selectCotizaciones);
  const [filtro, setFiltro] = useState('');
  const [search, setSearch] = useState('');

  const filtradas = useMemo(() => {
    let list = cotizaciones;
    if (filtro) list = list.filter((c) => c.estado === filtro);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.codigo?.toLowerCase().includes(q) ||
          c.empresa?.toLowerCase().includes(q) ||
          c.vendedor?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [cotizaciones, filtro, search]);

  return (
    <section>
      <AdminHeader
        eyebrow="Ventas"
        title="Cotizaciones"
        subtitle={`${filtradas.length} de ${cotizaciones.length}`}
      />

      <div className="mt-8 grid sm:grid-cols-[1fr_auto] gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por ID, empresa o vendedor…"
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

      {filtradas.length === 0 ? (
        <div className="mt-8">
          <EmptyState titulo="Sin resultados" descripcion="Ajusta filtros o búsqueda." />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-amber/15">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
              <tr>
                <th className="px-5 py-4">N°</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Empresa</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Vendedor</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Total</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((c) => (
                <tr key={c.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                  <td className="px-5 py-3 font-mono text-cream/90">{c.codigo}</td>
                  <td className="px-5 py-3 text-cream/85">{c.fecha}</td>
                  <td className="px-5 py-3 text-cream font-medium">{c.empresa}</td>
                  <td className="px-5 py-3 text-cream/85">{c.items.length}</td>
                  <td className="px-5 py-3 text-amber-light/70">{c.vendedor ?? 'Por asignar'}</td>
                  <td className="px-5 py-3">
                    <StatusBadge className={ESTADO_COTIZACION_COLOR[c.estado]}>
                      {ESTADO_COTIZACION_LABEL[c.estado]}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3 text-right font-display font-bold text-amber">
                    S/ {c.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to={`/admin/ventas/cotizaciones/${c.id}`}
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

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectLeads,
  selectLeadsStatus,
  selectLeadsError,
  fetchLeads,
} from '../../../redux/slices/leadsSlice.js';
import { ESTADO_LEAD_LABEL, ESTADO_LEAD_COLOR } from '../../../data/leads.js';
import AdminHeader, { StatusBadge, EmptyState } from '../../../components/AdminHeader.jsx';

const FILTROS = [
  { id: '',           label: 'Todos' },
  { id: 'nuevo',      label: 'Nuevos' },
  { id: 'contactado', label: 'Contactados' },
  { id: 'convertido', label: 'Convertidos' },
  { id: 'descartado', label: 'Descartados' },
];

export default function Leads() {
  const leads = useSelector(selectLeads);
  const status = useSelector(selectLeadsStatus);
  const error = useSelector(selectLeadsError);
  const dispatch = useDispatch();
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    if (status === 'idle') dispatch(fetchLeads());
  }, [status, dispatch]);

  const filtrados = useMemo(
    () => (filtro ? leads.filter((l) => l.estado === filtro) : leads),
    [leads, filtro],
  );

  return (
    <section>
      <AdminHeader
        eyebrow="Bandeja"
        title="Leads"
        subtitle={
          status === 'loading'
            ? 'Cargando…'
            : status === 'failed'
            ? `Error: ${error}`
            : `${filtrados.length} de ${leads.length}`
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

      {filtrados.length === 0 ? (
        <div className="mt-8">
          <EmptyState titulo="No hay leads aquí" descripcion="Cambia el filtro." />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-amber/15">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
              <tr>
                <th className="px-5 py-4">N°</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Empresa</th>
                <th className="px-5 py-4">Contacto</th>
                <th className="px-5 py-4">Productos</th>
                <th className="px-5 py-4">Cant.</th>
                <th className="px-5 py-4">Asignado</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((l) => (
                <tr key={l.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                  <td className="px-5 py-3 font-mono text-cream/90">{l.codigo}</td>
                  <td className="px-5 py-3 text-cream/85">{l.fecha}</td>
                  <td className="px-5 py-3 text-cream font-medium">{l.empresa}</td>
                  <td className="px-5 py-3 text-cream/85">{l.nombre}</td>
                  <td className="px-5 py-3 text-cream/85 max-w-[200px] truncate">{l.productos}</td>
                  <td className="px-5 py-3 text-cream/85">{l.cantidad}</td>
                  <td className="px-5 py-3 text-amber-light/70">{l.asignadoA ?? '—'}</td>
                  <td className="px-5 py-3">
                    <StatusBadge className={ESTADO_LEAD_COLOR[l.estado]}>
                      {ESTADO_LEAD_LABEL[l.estado]}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to={`/admin/ventas/leads/${l.id}`}
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

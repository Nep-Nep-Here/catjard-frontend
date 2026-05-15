import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectClienteId } from '../../redux/slices/authSlice.js';
import { selectCotizacionesByCliente } from '../../redux/slices/cotizacionesSlice.js';
import {
  ESTADO_COTIZACION_LABEL,
  ESTADO_COTIZACION_COLOR,
} from '../../data/cotizaciones.js';

const FILTROS = [
  { id: '',            label: 'Todas' },
  { id: 'enviada',     label: 'Enviadas' },
  { id: 'en_revision', label: 'En revisión' },
  { id: 'propuesta',   label: 'Con propuesta' },
  { id: 'aprobada',    label: 'Aprobadas' },
  { id: 'rechazada',   label: 'Rechazadas' },
];

export default function Cotizaciones() {
  const clienteId = useSelector(selectClienteId);
  const cotizaciones = useSelector(selectCotizacionesByCliente(clienteId));
  const [filtro, setFiltro] = useState('');

  const filtradas = useMemo(
    () => (filtro ? cotizaciones.filter((c) => c.estado === filtro) : cotizaciones),
    [cotizaciones, filtro],
  );

  return (
    <section>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
            Cotizaciones
          </span>
          <h1 className="mt-3 font-display font-black text-cream text-[40px] md:text-[48px] leading-tight">
            Mis cotizaciones.
          </h1>
          <p className="mt-2 font-body text-amber-light/85 text-[15px]">
            {filtradas.length} de {cotizaciones.length}
          </p>
        </div>
        <Link
          to="/cliente/cotizar"
          className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-semibold px-6 py-3 hover:bg-amber-light transition-colors"
        >
          + Nueva cotización
        </Link>
      </div>

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
        <div className="mt-12 p-12 rounded-xl border border-amber/15 text-center">
          <p className="font-display text-cream text-[20px]">No hay cotizaciones aquí.</p>
          <p className="mt-2 text-amber-light/70 text-[14px]">
            Cambia el filtro o crea una nueva cotización.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-amber/15">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-amber/5 text-amber-light/80 text-[11px] tracking-widest uppercase">
              <tr>
                <th className="px-5 py-4">N°</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Productos</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Total</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((c) => (
                <tr key={c.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                  <td className="px-5 py-4 font-mono text-cream">{c.codigo}</td>
                  <td className="px-5 py-4 text-cream/85">{c.fecha}</td>
                  <td className="px-5 py-4 text-cream/85">
                    {c.items.length} {c.items.length === 1 ? 'producto' : 'productos'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] tracking-wide border ${ESTADO_COTIZACION_COLOR[c.estado]}`}>
                      {ESTADO_COTIZACION_LABEL[c.estado]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-display font-bold text-amber">
                    S/ {c.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/cliente/cotizaciones/${c.id}`}
                      className="text-amber-light hover:text-amber underline underline-offset-4 text-[13px]"
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

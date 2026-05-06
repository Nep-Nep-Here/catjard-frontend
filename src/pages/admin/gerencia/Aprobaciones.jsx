import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCotizaciones,
  setEstadoCotizacion,
} from '../../../redux/slices/cotizacionesSlice.js';
import { selectParametros } from '../../../redux/slices/configSlice.js';
import {
  ESTADO_COTIZACION_LABEL,
  ESTADO_COTIZACION_COLOR,
} from '../../../data/cotizaciones.js';
import AdminHeader, { Card, StatusBadge, EmptyState } from '../../../components/AdminHeader.jsx';

export default function Aprobaciones() {
  const cotizaciones = useSelector(selectCotizaciones);
  const parametros = useSelector(selectParametros);
  const dispatch = useDispatch();
  const umbral = parametros?.umbralAprobacionGerencia ?? 10000;

  const grandes = useMemo(
    () => cotizaciones.filter((c) => c.total >= umbral).sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
    [cotizaciones, umbral],
  );

  const pendientes = grandes.filter((c) =>
    ['enviada', 'en_revision'].includes(c.estado),
  );

  const aprobar = (c) => {
    dispatch(
      setEstadoCotizacion({
        id: c.id,
        estado: 'propuesta',
        notasVendedor: (c.notasVendedor ?? '') + '\n[Aprobado por gerencia]',
      }),
    );
  };

  const rechazar = (c) => {
    dispatch(
      setEstadoCotizacion({
        id: c.id,
        estado: 'rechazada',
        motivo: 'Rechazada por gerencia: monto fuera de política.',
      }),
    );
  };

  return (
    <section>
      <AdminHeader
        eyebrow="Dirección"
        title="Bandeja de aprobaciones"
        subtitle={`Cotizaciones con monto ≥ S/ ${umbral.toLocaleString('es-PE')}`}
      />

      {pendientes.length > 0 && (
        <Card title={`Pendientes de revisión (${pendientes.length})`} className="mt-8">
          <ul className="divide-y divide-amber/10">
            {pendientes.map((c) => (
              <li key={c.id} className="py-4 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-mono text-amber-light/65 text-[12px]">{c.codigo}</p>
                  <p className="mt-1 font-display font-bold text-cream text-[16px]">{c.empresa}</p>
                  <p className="text-amber-light/65 text-[12px]">
                    Recibida {c.fecha} · {c.items.length} {c.items.length === 1 ? 'item' : 'items'} · vendedor: {c.vendedor ?? 'por asignar'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-amber font-display font-bold text-[20px]">
                    S/ {c.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                  <StatusBadge className={`mt-2 ${ESTADO_COTIZACION_COLOR[c.estado]}`}>
                    {ESTADO_COTIZACION_LABEL[c.estado]}
                  </StatusBadge>
                  <div className="mt-3 flex gap-2 flex-wrap justify-end">
                    <Link
                      to={`/admin/ventas/cotizaciones/${c.id}`}
                      className="px-3 py-1.5 rounded-full border border-amber/40 text-cream text-[12px] hover:border-amber hover:text-amber-light transition-colors"
                    >
                      Ver detalle
                    </Link>
                    <button
                      onClick={() => aprobar(c)}
                      className="px-3 py-1.5 rounded-full bg-amber text-brown font-semibold text-[12px] hover:bg-amber-light transition-colors"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => rechazar(c)}
                      className="px-3 py-1.5 rounded-full border border-red-400/40 text-red-300 text-[12px] hover:bg-red-500/10 transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="font-display font-bold text-cream text-[18px] mb-4">
          Histórico de cotizaciones grandes
        </h2>
        {grandes.length === 0 ? (
          <EmptyState
            titulo="No hay cotizaciones que requieran aprobación"
            descripcion={`El umbral actual es S/ ${umbral.toLocaleString('es-PE')}. Lo puedes ajustar en Configuración.`}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-amber/15">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
                <tr>
                  <th className="px-5 py-4">N°</th>
                  <th className="px-5 py-4">Fecha</th>
                  <th className="px-5 py-4">Empresa</th>
                  <th className="px-5 py-4">Vendedor</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Total</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {grandes.map((c) => (
                  <tr key={c.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                    <td className="px-5 py-3 font-mono text-cream/90">{c.codigo}</td>
                    <td className="px-5 py-3 text-cream/85">{c.fecha}</td>
                    <td className="px-5 py-3 text-cream font-medium">{c.empresa}</td>
                    <td className="px-5 py-3 text-amber-light/70">{c.vendedor ?? '—'}</td>
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
      </div>
    </section>
  );
}

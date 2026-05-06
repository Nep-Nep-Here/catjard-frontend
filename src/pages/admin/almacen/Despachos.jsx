import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectPedidos,
  setEstadoPedido,
  asignarCourier,
} from '../../../redux/slices/pedidosSlice.js';
import {
  ESTADO_PEDIDO,
  ESTADO_PEDIDO_LABEL,
  ESTADO_PEDIDO_COLOR,
  COURIERS,
} from '../../../data/pedidos.js';
import AdminHeader, { Card, StatusBadge, EmptyState } from '../../../components/AdminHeader.jsx';

const TABS = [
  { id: 'pendientes', label: 'Pendientes', estados: ['en_produccion', 'control_calidad', 'listo'] },
  { id: 'despachados', label: 'Despachados', estados: ['despachado'] },
  { id: 'entregados', label: 'Entregados', estados: ['entregado'] },
];

export default function Despachos() {
  const pedidos = useSelector(selectPedidos);
  const dispatch = useDispatch();
  const [tab, setTab] = useState('pendientes');

  const filtrados = useMemo(() => {
    const t = TABS.find((x) => x.id === tab);
    return pedidos.filter((p) => t?.estados.includes(p.estado));
  }, [pedidos, tab]);

  return (
    <section>
      <AdminHeader
        eyebrow="Almacén"
        title="Despachos"
        subtitle="Pedidos por enviar y trazabilidad de envíos"
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = pedidos.filter((p) => t.estados.includes(p.estado)).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-full text-[13px] border transition-colors ${
                tab === t.id
                  ? 'bg-amber text-brown border-amber font-semibold'
                  : 'bg-transparent text-cream/80 border-amber/25 hover:border-amber/60 hover:text-cream'
              }`}
            >
              {t.label}
              <span className="ml-2 text-[11px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-8">
          <EmptyState titulo="Sin pedidos en esta etapa" />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {filtrados.map((p) => (
            <DespachoCard key={p.id} pedido={p} dispatch={dispatch} />
          ))}
        </div>
      )}
    </section>
  );
}

function DespachoCard({ pedido, dispatch }) {
  const [courier, setCourier] = useState(pedido.courier ?? COURIERS[0]);
  const [guia, setGuia] = useState(pedido.guiaRemision ?? '');

  const marcarControl = () =>
    dispatch(
      setEstadoPedido({
        id: pedido.id,
        estado: ESTADO_PEDIDO.CONTROL_CALIDAD,
        trackingKey: 'control_calidad',
      }),
    );

  const marcarListo = () =>
    dispatch(
      setEstadoPedido({
        id: pedido.id,
        estado: ESTADO_PEDIDO.LISTO,
        trackingKey: 'listo',
      }),
    );

  const generarGuia = () => {
    if (!guia.trim()) return;
    dispatch(asignarCourier({ pedidoId: pedido.id, courier, guiaRemision: guia.trim() }));
    dispatch(
      setEstadoPedido({
        id: pedido.id,
        estado: ESTADO_PEDIDO.DESPACHADO,
        trackingKey: 'despachado',
      }),
    );
  };

  const marcarEntregado = () =>
    dispatch(
      setEstadoPedido({
        id: pedido.id,
        estado: ESTADO_PEDIDO.ENTREGADO,
        trackingKey: 'entregado',
      }),
    );

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-amber-light/70 text-[12px]">{pedido.codigo}</p>
          <h3 className="mt-1 font-display font-bold text-cream text-[20px]">{pedido.empresa}</h3>
          <p className="mt-1 text-amber-light/65 text-[12px]">
            Cotización {pedido.cotizacionCodigo} · Entrega est. {pedido.fechaEntregaEstimada}
          </p>
        </div>
        <StatusBadge className={ESTADO_PEDIDO_COLOR[pedido.estado]}>
          {ESTADO_PEDIDO_LABEL[pedido.estado]}
        </StatusBadge>
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-3 text-[13px]">
        <Info label="Items" value={`${pedido.items.length} líneas`} />
        <Info label="Unidades" value={pedido.items.reduce((acc, it) => acc + it.cantidad, 0)} />
        <Info label="Total" value={`S/ ${pedido.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} />
      </div>

      {pedido.estado === 'en_produccion' && (
        <div className="mt-5 pt-4 border-t border-amber/15">
          <p className="text-amber-light/70 text-[13px]">
            Pasa el pedido a control de calidad cuando producción lo entregue.
          </p>
          <button
            onClick={marcarControl}
            className="mt-3 px-5 py-2 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors"
          >
            Pasar a control de calidad
          </button>
        </div>
      )}

      {pedido.estado === 'control_calidad' && (
        <div className="mt-5 pt-4 border-t border-amber/15">
          <p className="text-amber-light/70 text-[13px]">
            Tras revisar la calidad, marca el pedido como listo para despacho.
          </p>
          <button
            onClick={marcarListo}
            className="mt-3 px-5 py-2 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors"
          >
            Marcar como listo
          </button>
        </div>
      )}

      {pedido.estado === 'listo' && (
        <div className="mt-5 pt-4 border-t border-amber/15 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <Field label="Courier">
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className={inputCls}
            >
              {COURIERS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="N° Guía de remisión">
            <input
              type="text"
              value={guia}
              onChange={(e) => setGuia(e.target.value)}
              placeholder="GR-2026-XXXXXX"
              className={inputCls}
            />
          </Field>
          <button
            onClick={generarGuia}
            disabled={!guia.trim()}
            className="px-5 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors disabled:opacity-50"
          >
            Generar guía y despachar
          </button>
        </div>
      )}

      {pedido.estado === 'despachado' && (
        <div className="mt-5 pt-4 border-t border-amber/15">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-[13px] text-cream/85">
              <p>📦 {pedido.courier}</p>
              <p className="text-amber-light/65 text-[12px] mt-0.5">Guía: {pedido.guiaRemision}</p>
            </div>
            <button
              onClick={marcarEntregado}
              className="px-5 py-2 rounded-full bg-green-500/90 text-cream text-[13px] font-semibold hover:bg-green-500 transition-colors"
            >
              Marcar como entregado
            </button>
          </div>
        </div>
      )}

      {pedido.estado === 'entregado' && (
        <div className="mt-5 pt-4 border-t border-amber/15 text-[13px] text-cream/85">
          <p>✓ Entregado vía {pedido.courier} · Guía {pedido.guiaRemision}</p>
        </div>
      )}
    </Card>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none';

function Info({ label, value }) {
  return (
    <div className="p-3 rounded-md bg-bg-dark/40 border border-amber/10">
      <p className="text-[10px] tracking-[0.2em] uppercase text-amber-light/65">{label}</p>
      <p className="mt-1 text-cream font-display font-bold text-[15px]">{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-amber-light/70 mb-1.5">{label}</p>
      {children}
    </div>
  );
}

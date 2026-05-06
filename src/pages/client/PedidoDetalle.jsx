import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectPedidoById,
  setVoucher,
} from '../../redux/slices/pedidosSlice.js';
import {
  fetchArtes,
  aprobarArte,
  rechazarArte,
  selectArtesByPedido,
} from '../../redux/slices/artesSlice.js';
import {
  fetchTracking,
  selectTrackingByPedido,
} from '../../redux/slices/trackingSlice.js';
import {
  ESTADO_PEDIDO_LABEL,
  ESTADO_PEDIDO_COLOR,
  PEDIDO_TIMELINE,
} from '../../data/pedidos.js';
import { selectProductos } from '../../redux/slices/productosSlice.js';

export default function PedidoDetalle() {
  const { id } = useParams();
  const pedido = useSelector(selectPedidoById(id));
  const productos = useSelector(selectProductos);
  const artes = useSelector(selectArtesByPedido(pedido?.codigo));
  const tracking = useSelector(selectTrackingByPedido(pedido?.codigo));
  const dispatch = useDispatch();
  const [voucherErr, setVoucherErr] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    if (pedido?.codigo) {
      dispatch(fetchArtes(pedido.codigo));
      dispatch(fetchTracking(pedido.codigo));
    }
  }, [dispatch, pedido?.codigo]);

  const onSubirVoucher = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setVoucherErr(null);
    setSubiendo(true);
    try {
      await dispatch(setVoucher({ pedidoId: pedido.id, voucherUrl: f.name })).unwrap();
    } catch (err) {
      setVoucherErr(typeof err === 'string' ? err : 'No se pudo subir el voucher.');
    } finally {
      setSubiendo(false);
      e.target.value = '';
    }
  };

  if (!pedido) {
    return (
      <section>
        <h1 className="font-display font-black text-cream text-[36px]">No encontrado</h1>
        <p className="mt-3 text-amber-light/75">El pedido solicitado no existe.</p>
        <Link to="/cliente/pedidos" className="inline-flex mt-6 text-amber underline underline-offset-4">
          ← Volver a mis pedidos
        </Link>
      </section>
    );
  }

  return (
    <section>
      <Link
        to="/cliente/pedidos"
        className="text-amber-light/70 hover:text-amber-light text-[13px] underline underline-offset-4"
      >
        ← Volver a mis pedidos
      </Link>

      <div className="mt-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="font-mono text-amber-light/65 text-[13px]">{pedido.codigo}</p>
          <h1 className="mt-2 font-display font-black text-cream text-[40px] leading-tight">
            Pedido en seguimiento
          </h1>
          <p className="mt-2 text-amber-light/85 text-[14px]">
            Creado el {pedido.fechaPedido} · Entrega estimada {pedido.fechaEntregaEstimada ?? 'por definir'}
          </p>
        </div>
        <span className={`inline-block px-3 py-1.5 rounded-full text-[12px] tracking-wide border ${ESTADO_PEDIDO_COLOR[pedido.estado]}`}>
          {ESTADO_PEDIDO_LABEL[pedido.estado]}
        </span>
      </div>

      <div className="mt-12 grid lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
            <h2 className="font-display font-bold text-cream text-[18px] mb-5">Tracking</h2>
            <Timeline tracking={tracking} />
          </div>

          {artes.length > 0 && (
            <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
              <h2 className="font-display font-bold text-cream text-[18px] mb-5">
                Versiones de arte
              </h2>
              <div className="space-y-4">
                {artes.map((arte) => (
                  <ArteVersion
                    key={arte.id}
                    arte={arte}
                    onAprobar={(comentarios) =>
                      dispatch(aprobarArte({ arteId: arte.id, comentariosCliente: comentarios }))
                    }
                    onRechazar={(comentarios) =>
                      dispatch(rechazarArte({ arteId: arte.id, comentariosCliente: comentarios }))
                    }
                  />
                ))}
              </div>
            </div>
          )}

          <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
            <h2 className="font-display font-bold text-cream text-[18px] mb-4">Productos</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="text-amber-light/80 text-[11px] tracking-widest uppercase">
                  <tr className="border-b border-amber/10">
                    <th className="text-left py-2 pr-3">Producto</th>
                    <th className="text-left py-2 px-3">Técnica</th>
                    <th className="text-right py-2 px-3">Cant.</th>
                    <th className="text-right py-2 px-3">Precio unit.</th>
                    <th className="text-right py-2 pl-3">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.items.map((it, i) => {
                    const producto = productos.find((p) => p.id === it.productoId);
                    return (
                      <tr key={i} className="border-b border-amber/10 last:border-0 text-cream">
                        <td className="py-3 pr-3 font-medium">{producto?.nombre ?? 'Producto'}</td>
                        <td className="py-3 px-3 text-cream/85">{it.tecnica}</td>
                        <td className="py-3 px-3 text-right">{it.cantidad}</td>
                        <td className="py-3 px-3 text-right">S/ {it.precioUnit.toFixed(2)}</td>
                        <td className="py-3 pl-3 text-right font-medium">
                          S/ {(it.cantidad * it.precioUnit).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-6 pt-4 border-t border-amber/15 grid sm:grid-cols-3 gap-4 text-[14px]">
              <Row label="Subtotal"  value={`S/ ${pedido.subtotal.toFixed(2)}`} />
              <Row label="IGV (18 %)" value={`S/ ${pedido.igv.toFixed(2)}`} />
              <Row
                label={<span className="text-cream font-semibold">Total</span>}
                value={
                  <span className="text-amber font-display font-bold text-[20px]">
                    S/ {pedido.total.toFixed(2)}
                  </span>
                }
              />
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
            <p className="text-[12px] tracking-[0.2em] uppercase text-amber mb-3">Pago</p>
            {pedido.voucherUrl ? (
              <div>
                <p className="text-cream text-[14px]">✓ Voucher cargado</p>
                <p className="text-amber-light/70 text-[12px] mt-1 break-all">
                  {pedido.voucherUrl} · {pedido.voucherFecha}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-cream text-[13px]">Aún no has cargado el voucher de pago.</p>
                <label className={`mt-4 inline-flex items-center gap-2 cursor-pointer rounded-full border border-amber/40 px-4 py-2.5 text-[13px] text-cream hover:border-amber hover:text-amber-light transition-colors ${subiendo ? 'opacity-50 cursor-wait' : ''}`}>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    disabled={subiendo}
                    onChange={onSubirVoucher}
                  />
                  {subiendo ? 'Subiendo…' : 'Subir voucher'}
                </label>
                {voucherErr && (
                  <p className="mt-3 text-red-300 text-[12px] bg-red-400/10 border border-red-400/30 rounded px-3 py-2">
                    {voucherErr}
                  </p>
                )}
              </div>
            )}
          </div>

          {pedido.courier && (
            <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
              <p className="text-[12px] tracking-[0.2em] uppercase text-amber mb-3">Despacho</p>
              <p className="text-cream text-[14px]">{pedido.courier}</p>
              {pedido.guiaRemision && (
                <p className="mt-1 text-amber-light/70 text-[12px]">
                  Guía: {pedido.guiaRemision}
                </p>
              )}
            </div>
          )}

          {pedido.cotizacionCodigo && (
            <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
              <p className="text-[12px] tracking-[0.2em] uppercase text-amber mb-3">
                Cotización origen
              </p>
              <Link
                to={`/cliente/cotizaciones/${pedido.cotizacionCodigo}`}
                className="text-amber-light hover:text-amber underline underline-offset-4 text-[14px] font-mono"
              >
                {pedido.cotizacionCodigo}
              </Link>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function Timeline({ tracking }) {
  const items = PEDIDO_TIMELINE.map((meta) => {
    const evento = tracking.find((e) => e.hito === meta.key);
    return {
      key: meta.key,
      label: meta.label,
      fecha: evento?.fecha ?? null,
      completo: evento?.completo ?? false,
    };
  });
  return (
    <ol className="relative">
      {items.map((t, i) => {
        const isLast = i === items.length - 1;
        return (
          <li key={t.key} className="relative pl-8 pb-6 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[7px] top-4 bottom-0 w-px ${
                  t.completo ? 'bg-amber' : 'bg-amber/15'
                }`}
              />
            )}
            <span
              className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${
                t.completo
                  ? 'bg-amber border-amber'
                  : 'bg-bg-dark border-amber/30'
              }`}
            />
            <div>
              <p
                className={`font-display font-bold text-[15px] ${
                  t.completo ? 'text-cream' : 'text-cream/45'
                }`}
              >
                {t.label}
              </p>
              <p className="text-[12px] text-amber-light/65">
                {t.fecha ?? 'Pendiente'}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ArteVersion({ arte, onAprobar, onRechazar }) {
  const [comentarios, setComentarios] = useState('');
  const [accion, setAccion] = useState(null);

  const colorEstado = {
    en_revision: 'bg-amber/15 text-amber-light border-amber/30',
    aprobado: 'bg-green-500/15 text-green-300 border-green-500/30',
    rechazado: 'bg-red-500/15 text-red-300 border-red-500/30',
  };

  return (
    <article className="p-5 rounded-lg border border-amber/15 bg-bg-dark/30">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-display font-bold text-cream text-[16px]">
            Versión {arte.version}
          </p>
          <p className="text-amber-light/70 text-[12px] mt-1">{arte.fecha}</p>
          <p className="text-cream/85 text-[13px] mt-3 break-all">📎 {arte.nombreArchivo}</p>
        </div>
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-[11px] border ${
            colorEstado[arte.estado] ?? colorEstado.en_revision
          }`}
        >
          {arte.estado === 'en_revision' && 'En revisión'}
          {arte.estado === 'aprobado' && 'Aprobado'}
          {arte.estado === 'rechazado' && 'Rechazado'}
        </span>
      </div>

      {arte.comentariosCliente && (
        <p className="mt-3 text-[13px] text-cream/80 italic border-l-2 border-amber/40 pl-3">
          "{arte.comentariosCliente}"
        </p>
      )}

      {arte.estado === 'en_revision' && (
        <div className="mt-4">
          {accion ? (
            <div>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={2}
                placeholder={
                  accion === 'aprobar'
                    ? 'Comentario opcional…'
                    : '¿Qué cambios necesitas?'
                }
                className="w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[13px] focus:border-amber focus:outline-none resize-y"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    if (accion === 'aprobar') onAprobar(comentarios);
                    else onRechazar(comentarios);
                    setAccion(null);
                    setComentarios('');
                  }}
                  disabled={accion === 'rechazar' && !comentarios.trim()}
                  className={`flex-1 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors disabled:opacity-40 ${
                    accion === 'aprobar'
                      ? 'bg-amber text-brown hover:bg-amber-light'
                      : 'bg-red-500/90 text-cream hover:bg-red-500'
                  }`}
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setAccion(null)}
                  className="px-4 py-2 rounded-full text-cream/70 text-[13px] hover:text-cream"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setAccion('aprobar')}
                className="flex-1 px-4 py-2 rounded-full bg-amber text-brown text-[13px] font-semibold hover:bg-amber-light transition-colors"
              >
                Aprobar arte
              </button>
              <button
                onClick={() => setAccion('rechazar')}
                className="flex-1 px-4 py-2 rounded-full border border-red-400/40 text-red-300 text-[13px] hover:bg-red-500/10 transition-colors"
              >
                Solicitar cambios
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] tracking-[0.2em] uppercase text-amber-light/65">{label}</dt>
      <dd className="mt-1.5 text-cream">{value}</dd>
    </div>
  );
}

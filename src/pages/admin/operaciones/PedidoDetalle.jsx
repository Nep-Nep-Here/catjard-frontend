import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectPedidoById,
  setEstadoPedido,
} from '../../../redux/slices/pedidosSlice.js';
import {
  fetchArtes,
  subirArte,
  selectArtesByPedido,
} from '../../../redux/slices/artesSlice.js';
import { selectProductos } from '../../../redux/slices/productosSlice.js';
import {
  ESTADO_PEDIDO,
  ESTADO_PEDIDO_LABEL,
  ESTADO_PEDIDO_COLOR,
} from '../../../data/pedidos.js';
import AdminHeader, { Card, StatusBadge } from '../../../components/AdminHeader.jsx';

export default function OperacionesPedidoDetalle() {
  const { id } = useParams();
  const pedido = useSelector(selectPedidoById(id));
  const productos = useSelector(selectProductos);
  const artes = useSelector(selectArtesByPedido(pedido?.codigo));
  const dispatch = useDispatch();

  useEffect(() => {
    if (pedido?.codigo) dispatch(fetchArtes(pedido.codigo));
  }, [dispatch, pedido?.codigo]);

  if (!pedido) {
    return (
      <section>
        <AdminHeader
          title="Pedido no encontrado"
          backTo="/admin/operaciones/kanban"
          backLabel="← Volver al tablero"
        />
      </section>
    );
  }

  const ultimoArte = artes[artes.length - 1];
  const arteAprobado = ultimoArte?.estado === 'aprobado';
  const artePendiente = ultimoArte?.estado === 'en_revision';

  const onSubirArte = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      await dispatch(subirArte({ pedidoCodigo: pedido.codigo, nombreArchivo: f.name })).unwrap();
      if (pedido.estado === 'en_diseno' || pedido.estado === 'esperando_aprobacion_arte') {
        dispatch(
          setEstadoPedido({
            id: pedido.id,
            estado: ESTADO_PEDIDO.ESPERANDO_APROBACION_ARTE,
          }),
        );
      }
    } catch {}
    e.target.value = '';
  };

  const iniciarProduccion = () =>
    dispatch(
      setEstadoPedido({
        id: pedido.id,
        estado: ESTADO_PEDIDO.EN_PRODUCCION,
        trackingKey: 'arte_aprobado',
      }),
    );

  const terminarProduccion = () =>
    dispatch(
      setEstadoPedido({
        id: pedido.id,
        estado: ESTADO_PEDIDO.CONTROL_CALIDAD,
        trackingKey: 'en_produccion',
      }),
    );

  return (
    <section>
      <AdminHeader
        backTo="/admin/operaciones/kanban"
        backLabel="← Volver al tablero"
        eyebrow={pedido.codigo}
        title={pedido.empresa}
        subtitle={`Cotización ${pedido.cotizacionCodigo} · Entrega est. ${pedido.fechaEntregaEstimada}`}
        action={
          <StatusBadge className={ESTADO_PEDIDO_COLOR[pedido.estado]}>
            {ESTADO_PEDIDO_LABEL[pedido.estado]}
          </StatusBadge>
        }
      />

      <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Card
            title="Versiones de arte"
            action={
              ['en_diseno', 'esperando_aprobacion_arte'].includes(pedido.estado) && (
                <label className="cursor-pointer text-[12px] text-amber hover:text-amber-light underline underline-offset-4">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.ai,.svg"
                    onChange={onSubirArte}
                  />
                  + Subir nueva versión
                </label>
              )
            }
          >
            {artes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-cream/65 text-[14px]">Aún no hay versiones de arte.</p>
                <p className="text-amber-light/60 text-[12px] mt-1">
                  Sube la primera versión para que el cliente la apruebe.
                </p>
                <label className="inline-flex mt-5 items-center gap-2 cursor-pointer rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.ai,.svg"
                    onChange={onSubirArte}
                  />
                  Subir arte
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                {artes.map((a) => (
                  <article key={a.id} className="p-4 rounded-lg border border-amber/15 bg-bg-dark/40">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-display font-bold text-cream text-[15px]">
                          Versión {a.version}
                        </p>
                        <p className="text-amber-light/65 text-[11px]">{a.fecha}</p>
                        <p className="text-cream/85 text-[13px] mt-2 break-all">📎 {a.nombreArchivo}</p>
                      </div>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] border ${
                          a.estado === 'aprobado'
                            ? 'bg-green-500/15 text-green-300 border-green-500/30'
                            : a.estado === 'rechazado'
                            ? 'bg-red-500/15 text-red-300 border-red-500/30'
                            : 'bg-amber/15 text-amber-light border-amber/30'
                        }`}
                      >
                        {a.estado === 'en_revision' && 'Esperando cliente'}
                        {a.estado === 'aprobado' && 'Aprobado'}
                        {a.estado === 'rechazado' && 'Rechazado'}
                      </span>
                    </div>
                    {a.comentariosCliente && (
                      <p className="mt-3 text-[13px] text-cream/85 italic border-l-2 border-amber/40 pl-3">
                        Cliente: "{a.comentariosCliente}"
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </Card>

          <Card title="Productos a producir">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="text-amber-light/80 text-[10px] tracking-widest uppercase">
                  <tr className="border-b border-amber/10">
                    <th className="text-left py-2 pr-3">Producto</th>
                    <th className="text-left py-2 px-3">Técnica</th>
                    <th className="text-right py-2 px-3">Cant.</th>
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-3 border-t border-amber/10 text-[13px] text-amber-light/75">
              Total a producir:{' '}
              <span className="text-cream font-display font-bold">
                {pedido.items.reduce((acc, it) => acc + it.cantidad, 0)} unidades
              </span>
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Acciones de producción">
            {pedido.estado === 'en_diseno' && (
              <>
                <p className="text-cream/85 text-[13px]">
                  Sube el arte final para iniciar la aprobación del cliente.
                </p>
                <label className="mt-4 inline-flex w-full justify-center items-center gap-2 cursor-pointer rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.ai,.svg"
                    onChange={onSubirArte}
                  />
                  Subir arte
                </label>
              </>
            )}

            {pedido.estado === 'esperando_aprobacion_arte' && (
              <>
                {artePendiente && (
                  <>
                    <p className="text-cream/85 text-[13px]">
                      El cliente está revisando la versión {ultimoArte.version}.
                    </p>
                    <p className="mt-2 text-amber-light/65 text-[11px]">
                      No puedes avanzar hasta que el cliente apruebe.
                    </p>
                  </>
                )}
                {ultimoArte?.estado === 'rechazado' && (
                  <>
                    <p className="text-red-300 text-[13px]">
                      Cliente rechazó la versión {ultimoArte.version}. Sube una nueva versión.
                    </p>
                    <label className="mt-4 inline-flex w-full justify-center items-center gap-2 cursor-pointer rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.ai,.svg"
                        onChange={onSubirArte}
                      />
                      Subir nueva versión
                    </label>
                  </>
                )}
                {arteAprobado && (
                  <>
                    <p className="text-green-300 text-[13px]">
                      ✓ Cliente aprobó la versión {ultimoArte.version}.
                    </p>
                    <button
                      onClick={iniciarProduccion}
                      className="mt-4 w-full px-5 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors"
                    >
                      Iniciar producción
                    </button>
                  </>
                )}
              </>
            )}

            {pedido.estado === 'en_produccion' && (
              <>
                <p className="text-cream/85 text-[13px]">
                  Cuando termines la personalización, marca el pedido como terminado para pasarlo a control de calidad.
                </p>
                <button
                  onClick={terminarProduccion}
                  className="mt-4 w-full px-5 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors"
                >
                  Marcar como terminado
                </button>
              </>
            )}

            {['control_calidad', 'listo', 'despachado', 'entregado'].includes(pedido.estado) && (
              <p className="text-cream/85 text-[13px]">
                ✓ Producción completada. Almacén ahora maneja control de calidad y despacho.
              </p>
            )}
          </Card>

          <Card title="Información">
            <dl className="space-y-2 text-[13px]">
              <Row label="Empresa" value={pedido.empresa} />
              <Row label="Cotización" value={pedido.cotizacionCodigo} />
              <Row label="Creado" value={pedido.fechaPedido} />
              <Row label="Entrega est." value={pedido.fechaEntregaEstimada} />
              <Row label="Versiones de arte" value={artes.length} />
              <Row
                label="Total"
                value={`S/ ${pedido.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
              />
            </dl>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-cream/75 text-[13px]">{label}</dt>
      <dd className="text-cream text-right">{value}</dd>
    </div>
  );
}

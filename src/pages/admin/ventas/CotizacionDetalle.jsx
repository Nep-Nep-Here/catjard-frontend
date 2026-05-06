import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCotizacionById,
  setEstadoCotizacion,
} from '../../../redux/slices/cotizacionesSlice.js';
import { selectProductos } from '../../../redux/slices/productosSlice.js';
import { selectUser } from '../../../redux/slices/authSlice.js';
import {
  ESTADO_COTIZACION,
  ESTADO_COTIZACION_LABEL,
  ESTADO_COTIZACION_COLOR,
  calcularTotales,
} from '../../../data/cotizaciones.js';
import AdminHeader, { Card, StatusBadge } from '../../../components/AdminHeader.jsx';

export default function CotizacionDetalleAdmin() {
  const { id } = useParams();
  const cotizacion = useSelector(selectCotizacionById(id));
  const productos = useSelector(selectProductos);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [editando, setEditando] = useState(false);
  const [items, setItems] = useState([]);
  const [notasVendedor, setNotasVendedor] = useState('');
  const [validez, setValidez] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (cotizacion) {
      setItems(cotizacion.items.map((it) => ({ ...it })));
      setNotasVendedor(cotizacion.notasVendedor ?? '');
      setValidez(cotizacion.validez ?? '');
    }
  }, [cotizacion]);

  const totales = useMemo(() => calcularTotales(items), [items]);

  if (!cotizacion) {
    return (
      <section>
        <AdminHeader
          title="Cotización no encontrada"
          backTo="/admin/ventas/cotizaciones"
          backLabel="← Volver"
        />
      </section>
    );
  }

  const tomarRevision = () => {
    dispatch(
      setEstadoCotizacion({
        id: cotizacion.id,
        estado: ESTADO_COTIZACION.EN_REVISION,
        vendedor: cotizacion.vendedor ?? user?.nombre,
      }),
    );
  };

  const enviarPropuesta = () => {
    dispatch(
      setEstadoCotizacion({
        id: cotizacion.id,
        estado: ESTADO_COTIZACION.PROPUESTA,
        vendedor: cotizacion.vendedor ?? user?.nombre,
        notasVendedor,
        items,
        subtotal: totales.subtotal,
        igv: totales.igv,
        total: totales.total,
        validez,
      }),
    );
    setEditando(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const guardarCambios = () => {
    dispatch(
      setEstadoCotizacion({
        id: cotizacion.id,
        estado: cotizacion.estado,
        vendedor: cotizacion.vendedor ?? user?.nombre,
        notasVendedor,
        items,
        subtotal: totales.subtotal,
        igv: totales.igv,
        total: totales.total,
        validez,
      }),
    );
    setEditando(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const updateItem = (i, key, value) => {
    setItems(items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  };

  const editable = editando && ['enviada', 'en_revision', 'propuesta'].includes(cotizacion.estado);

  return (
    <section>
      <AdminHeader
        backTo="/admin/ventas/cotizaciones"
        backLabel="← Volver a cotizaciones"
        eyebrow={cotizacion.codigo}
        title={cotizacion.empresa}
        subtitle={`Recibida ${cotizacion.fecha} · RUC ${cotizacion.ruc}`}
        action={
          <StatusBadge className={ESTADO_COTIZACION_COLOR[cotizacion.estado]}>
            {ESTADO_COTIZACION_LABEL[cotizacion.estado]}
          </StatusBadge>
        }
      />

      {saved && (
        <p className="mt-4 text-amber-light text-[13px] bg-amber/10 px-3 py-2 rounded">
          ✓ Cambios guardados.
        </p>
      )}

      <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Card
            title="Productos"
            action={
              ['enviada', 'en_revision', 'propuesta'].includes(cotizacion.estado) && (
                editando ? (
                  <button
                    onClick={() => setEditando(false)}
                    className="text-[12px] text-amber-light/70 hover:text-amber-light underline underline-offset-4"
                  >
                    Cancelar edición
                  </button>
                ) : (
                  <button
                    onClick={() => setEditando(true)}
                    className="text-[12px] text-amber-light hover:text-amber underline underline-offset-4"
                  >
                    Editar items y precios
                  </button>
                )
              )
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="text-amber-light/80 text-[10px] tracking-widest uppercase">
                  <tr className="border-b border-amber/10">
                    <th className="text-left py-2 pr-3">Producto</th>
                    <th className="text-left py-2 px-3">Técnica</th>
                    <th className="text-right py-2 px-3">Cant.</th>
                    <th className="text-right py-2 px-3">Precio unit.</th>
                    <th className="text-right py-2 pl-3">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => {
                    const producto = productos.find((p) => p.id === it.productoId);
                    const importe = it.cantidad * it.precioUnit;
                    return (
                      <tr key={i} className="border-b border-amber/10 last:border-0 text-cream">
                        <td className="py-3 pr-3">
                          <p className="font-medium">{producto?.nombre ?? 'Producto'}</p>
                          {it.notas && (
                            <p className="text-[11px] text-amber-light/65 mt-1">{it.notas}</p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-cream/85">{it.tecnica}</td>
                        <td className="py-3 px-3 text-right">
                          {editable ? (
                            <input
                              type="number"
                              min={50}
                              value={it.cantidad}
                              onChange={(e) =>
                                updateItem(i, 'cantidad', parseInt(e.target.value, 10) || 50)
                              }
                              className="w-24 px-2 py-1 rounded bg-bg-dark border border-amber/30 text-cream text-right text-[13px] focus:border-amber focus:outline-none"
                            />
                          ) : (
                            it.cantidad
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {editable ? (
                            <div className="inline-flex items-center gap-1">
                              <span className="text-amber-light/65 text-[11px]">S/</span>
                              <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={it.precioUnit}
                                onChange={(e) =>
                                  updateItem(i, 'precioUnit', parseFloat(e.target.value) || 0)
                                }
                                className="w-24 px-2 py-1 rounded bg-bg-dark border border-amber/30 text-cream text-right text-[13px] focus:border-amber focus:outline-none"
                              />
                            </div>
                          ) : (
                            `S/ ${it.precioUnit.toFixed(2)}`
                          )}
                        </td>
                        <td className="py-3 pl-3 text-right font-medium">
                          S/ {importe.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-6 pt-4 border-t border-amber/15 grid sm:grid-cols-3 gap-4 text-[13px]">
              <Row label="Subtotal" value={`S/ ${totales.subtotal.toFixed(2)}`} />
              <Row label="IGV (18 %)" value={`S/ ${totales.igv.toFixed(2)}`} />
              <Row
                label={<span className="text-cream font-semibold">Total</span>}
                value={
                  <span className="text-amber font-display font-bold text-[18px]">
                    S/ {totales.total.toFixed(2)}
                  </span>
                }
              />
            </div>
          </Card>

          {cotizacion.notasCliente && (
            <Card title="Notas del cliente">
              <p className="text-cream/85 text-[14px] leading-relaxed">{cotizacion.notasCliente}</p>
              {cotizacion.logoNombre && (
                <p className="mt-3 text-[12px] text-amber-light/85">
                  📎 Logo adjunto: {cotizacion.logoNombre}
                </p>
              )}
            </Card>
          )}

          <Card title="Notas para el cliente (vendedor)">
            <textarea
              value={notasVendedor}
              onChange={(e) => setNotasVendedor(e.target.value)}
              rows={4}
              disabled={!['enviada', 'en_revision', 'propuesta'].includes(cotizacion.estado)}
              placeholder="Plazo de entrega, condiciones especiales, alcance del diseño…"
              className="w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[13px] focus:border-amber focus:outline-none resize-y disabled:opacity-50"
            />
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-amber-light/65 mb-1.5">
                  Validez de la propuesta
                </p>
                <input
                  type="date"
                  value={validez}
                  onChange={(e) => setValidez(e.target.value)}
                  disabled={!['enviada', 'en_revision', 'propuesta'].includes(cotizacion.estado)}
                  className="w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[13px] focus:border-amber focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </Card>

          {cotizacion.estado === 'rechazada' && cotizacion.motivoRechazo && (
            <Card>
              <p className="text-[12px] tracking-[0.2em] uppercase text-red-300 mb-2">
                Motivo de rechazo del cliente
              </p>
              <p className="text-cream/95 text-[14px]">{cotizacion.motivoRechazo}</p>
            </Card>
          )}
        </div>

        <aside className="space-y-5">
          {cotizacion.estado === 'enviada' && (
            <Card>
              <p className="text-cream text-[14px]">
                Esta cotización está pendiente de revisión.
              </p>
              <button
                onClick={tomarRevision}
                className="mt-4 w-full px-5 py-3 rounded-full bg-amber text-brown font-semibold text-[14px] hover:bg-amber-light transition-colors"
              >
                Tomar y empezar revisión
              </button>
            </Card>
          )}

          {cotizacion.estado === 'en_revision' && (
            <Card>
              <p className="text-cream text-[14px]">
                Ajusta items y precios, agrega notas y envía la propuesta al cliente.
              </p>
              <button
                onClick={enviarPropuesta}
                className="mt-4 w-full px-5 py-3 rounded-full bg-amber text-brown font-semibold text-[14px] hover:bg-amber-light transition-colors"
              >
                Enviar propuesta al cliente
              </button>
            </Card>
          )}

          {cotizacion.estado === 'propuesta' && editable && (
            <Card>
              <button
                onClick={guardarCambios}
                className="w-full px-5 py-3 rounded-full bg-amber text-brown font-semibold text-[14px] hover:bg-amber-light transition-colors"
              >
                Guardar cambios
              </button>
            </Card>
          )}

          {cotizacion.estado === 'aprobada' && cotizacion.pedidoCodigo && (
            <Card>
              <p className="text-[12px] tracking-[0.2em] uppercase text-green-300 mb-2">
                Pedido generado
              </p>
              <p className="text-cream font-display font-bold">{cotizacion.pedidoCodigo}</p>
              <Link
                to={`/admin/ventas/pedidos/${cotizacion.pedidoCodigo}`}
                className="inline-flex mt-4 items-center gap-2 rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors"
              >
                Ver pedido
              </Link>
            </Card>
          )}

          <Card title="Resumen">
            <dl className="space-y-2 text-[13px]">
              <Row label="Items"     value={cotizacion.items.length} />
              <Row label="Unidades"  value={cotizacion.items.reduce((acc, it) => acc + it.cantidad, 0)} />
              <Row label="Vendedor"  value={cotizacion.vendedor ?? 'Por asignar'} />
              <Row label="Validez"   value={cotizacion.validez ?? '—'} />
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

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectOCById,
  selectOrdenesCompra,
  crearOC,
  actualizarOC,
  setEstadoOC,
} from '../../../redux/slices/ordenesCompraSlice.js';
import {
  selectProveedores,
} from '../../../redux/slices/proveedoresSlice.js';
import {
  selectProductos,
  ajustarStock,
} from '../../../redux/slices/productosSlice.js';
import { selectUser } from '../../../redux/slices/authSlice.js';
import { registrarMovimiento } from '../../../redux/slices/movimientosSlice.js';
import {
  ESTADO_OC,
  ESTADO_OC_LABEL,
  ESTADO_OC_COLOR,
  calcularTotalesOC,
  nuevoIdOC,
} from '../../../data/ordenesCompra.js';
import AdminHeader, { Card, StatusBadge } from '../../../components/AdminHeader.jsx';

const EMPTY = {
  fecha: new Date().toISOString().slice(0, 10),
  proveedorId: '',
  proveedorNombre: '',
  items: [{ productoId: '', cantidad: 0, precioUnit: 0 }],
  fechaEsperada: '',
  notas: '',
};

export default function OrdenCompraEditar() {
  const { id } = useParams();
  const isNew = id === 'nueva';
  const oc = useSelector(selectOCById(id));
  const ocList = useSelector(selectOrdenesCompra);
  const proveedores = useSelector(selectProveedores);
  const productos = useSelector(selectProductos);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState(isNew ? EMPTY : oc ?? EMPTY);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!isNew && oc) setForm(oc);
  }, [oc, isNew]);

  const totales = useMemo(() => calcularTotalesOC(form.items), [form.items]);

  const editable = isNew || (oc && (oc.estado === 'borrador' || oc.estado === 'enviada'));

  if (!isNew && !oc) {
    return (
      <section>
        <AdminHeader
          title="OC no encontrada"
          backTo="/admin/almacen/ordenes"
          backLabel="← Volver"
        />
      </section>
    );
  }

  const onChangeProveedor = (e) => {
    const proveedorId = parseInt(e.target.value, 10);
    const prov = proveedores.find((p) => p.id === proveedorId);
    setForm((f) => ({
      ...f,
      proveedorId,
      proveedorNombre: prov?.nombreComercial ?? prov?.razonSocial ?? '',
    }));
  };

  const onChangeItem = (i, key, value) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, idx) =>
        idx === i ? { ...it, [key]: key === 'productoId' ? parseInt(value, 10) || '' : parseFloat(value) || 0 } : it,
      ),
    }));
  };

  const addItem = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { productoId: '', cantidad: 0, precioUnit: 0 }],
    }));

  const removeItem = (i) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const guardar = (estado = null) => {
    setErr(null);
    if (!form.proveedorId) return setErr('Selecciona un proveedor.');
    if (form.items.length === 0) return setErr('Agrega al menos un item.');
    if (form.items.some((it) => !it.productoId || it.cantidad <= 0 || it.precioUnit <= 0))
      return setErr('Todos los items requieren producto, cantidad y precio.');

    const payload = {
      ...form,
      ...totales,
      usuario: user?.nombre ?? '—',
    };

    if (isNew) {
      const nuevoId = nuevoIdOC(ocList);
      dispatch(crearOC({ ...payload, id: nuevoId, estado: estado ?? 'borrador' }));
      navigate(`/admin/almacen/ordenes/${nuevoId}`);
    } else {
      dispatch(actualizarOC({ ...payload, id: oc.id, estado: estado ?? oc.estado }));
      if (estado) {
        dispatch(setEstadoOC({ id: oc.id, estado }));
      }
    }
  };

  const recibir = () => {
    if (!oc) return;
    const fechaRecepcion = new Date().toISOString().slice(0, 10);
    dispatch(setEstadoOC({ id: oc.id, estado: ESTADO_OC.RECIBIDA, fechaRecepcion }));
    oc.items.forEach((it) => {
      dispatch(ajustarStock({ id: it.productoId, delta: it.cantidad }));
      dispatch(
        registrarMovimiento({
          fecha: fechaRecepcion,
          tipo: 'entrada',
          productoId: it.productoId,
          cantidad: it.cantidad,
          motivo: 'Compra a proveedor',
          referencia: oc.id,
          usuario: user?.nombre ?? '—',
          notas: `Recepción de ${oc.id}`,
        }),
      );
    });
  };

  const cancelar = () => {
    if (!oc) return;
    dispatch(setEstadoOC({ id: oc.id, estado: ESTADO_OC.CANCELADA }));
  };

  return (
    <section>
      <AdminHeader
        backTo="/admin/almacen/ordenes"
        backLabel="← Volver a OCs"
        eyebrow={isNew ? 'Almacén' : oc.id}
        title={isNew ? 'Nueva orden de compra' : `OC para ${oc.proveedorNombre}`}
        subtitle={isNew ? null : `Emitida ${oc.fecha}`}
        action={
          !isNew && (
            <StatusBadge className={ESTADO_OC_COLOR[oc.estado]}>
              {ESTADO_OC_LABEL[oc.estado]}
            </StatusBadge>
          )
        }
      />

      <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Card title="Cabecera">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Proveedor" required>
                <select
                  value={form.proveedorId || ''}
                  onChange={onChangeProveedor}
                  required
                  disabled={!editable}
                  className={inputCls}
                >
                  <option value="">Selecciona…</option>
                  {proveedores.filter((p) => p.activo || p.id === form.proveedorId).map((p) => (
                    <option key={p.id} value={p.id}>{p.nombreComercial || p.razonSocial}</option>
                  ))}
                </select>
              </Field>
              <Field label="Fecha emisión">
                <input
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={onChange}
                  disabled={!editable}
                  className={inputCls}
                />
              </Field>
              <Field label="Fecha esperada">
                <input
                  type="date"
                  name="fechaEsperada"
                  value={form.fechaEsperada || ''}
                  onChange={onChange}
                  disabled={!editable}
                  className={inputCls}
                />
              </Field>
            </div>
          </Card>

          <Card
            title="Items"
            action={
              editable && (
                <button
                  type="button"
                  onClick={addItem}
                  className="text-[12px] text-amber hover:text-amber-light underline underline-offset-4"
                >
                  + Agregar item
                </button>
              )
            }
          >
            <div className="space-y-3">
              {form.items.map((it, i) => {
                const producto = productos.find((p) => p.id === it.productoId);
                const importe = (Number(it.cantidad) || 0) * (Number(it.precioUnit) || 0);
                return (
                  <div key={i} className="grid sm:grid-cols-[2fr_1fr_1fr_auto_auto] gap-3 p-3 rounded-md border border-amber/10 bg-bg-dark/30 items-end">
                    <Field label="Producto" required={i === 0}>
                      <select
                        value={it.productoId || ''}
                        onChange={(e) => onChangeItem(i, 'productoId', e.target.value)}
                        disabled={!editable}
                        className={inputCls}
                      >
                        <option value="">Selecciona…</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Cantidad" required={i === 0}>
                      <input
                        type="number"
                        min={1}
                        value={it.cantidad}
                        onChange={(e) => onChangeItem(i, 'cantidad', e.target.value)}
                        disabled={!editable}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Precio unit. S/" required={i === 0}>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={it.precioUnit}
                        onChange={(e) => onChangeItem(i, 'precioUnit', e.target.value)}
                        disabled={!editable}
                        className={inputCls}
                      />
                    </Field>
                    <div className="text-right">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-amber-light/65">Importe</p>
                      <p className="font-display font-bold text-amber text-[16px] mt-1">S/ {importe.toFixed(2)}</p>
                    </div>
                    {editable && form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="text-red-300/70 hover:text-red-300 text-[12px] self-center"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-amber/15 grid sm:grid-cols-3 gap-4 text-[14px]">
              <Row label="Subtotal" value={`S/ ${totales.subtotal.toFixed(2)}`} />
              <Row label="IGV (18 %)" value={`S/ ${totales.igv.toFixed(2)}`} />
              <Row
                label={<span className="text-cream font-semibold">Total</span>}
                value={
                  <span className="text-amber font-display font-bold text-[20px]">
                    S/ {totales.total.toFixed(2)}
                  </span>
                }
              />
            </div>
          </Card>

          <Card title="Notas">
            <textarea
              name="notas"
              value={form.notas}
              onChange={onChange}
              rows={3}
              disabled={!editable}
              className={`${inputCls} resize-y`}
            />
          </Card>
        </div>

        <aside className="space-y-5">
          {err && (
            <div className="p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>
          )}

          {editable && (
            <Card title="Acciones">
              <div className="space-y-2">
                <button
                  onClick={() => guardar('borrador')}
                  className="w-full px-5 py-2.5 rounded-full border border-amber/40 text-cream text-[13px] font-medium hover:border-amber hover:text-amber-light transition-colors"
                >
                  Guardar como borrador
                </button>
                <button
                  onClick={() => guardar('enviada')}
                  className="w-full px-5 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors"
                >
                  Enviar al proveedor
                </button>
                {!isNew && oc?.estado === 'enviada' && (
                  <button
                    onClick={recibir}
                    className="w-full px-5 py-2.5 rounded-full bg-green-500/90 text-cream text-[13px] font-semibold hover:bg-green-500 transition-colors"
                  >
                    Marcar como recibida
                  </button>
                )}
                {!isNew && (oc?.estado === 'borrador' || oc?.estado === 'enviada') && (
                  <button
                    onClick={cancelar}
                    className="w-full px-5 py-2.5 rounded-full border border-red-400/40 text-red-300 text-[13px] hover:bg-red-500/10 transition-colors"
                  >
                    Cancelar OC
                  </button>
                )}
              </div>
            </Card>
          )}

          {!isNew && (
            <Card title="Información">
              <dl className="space-y-2 text-[13px]">
                <Row label="Estado" value={ESTADO_OC_LABEL[oc.estado]} />
                <Row label="Esperada" value={oc.fechaEsperada || '—'} />
                <Row label="Recibida" value={oc.fechaRecepcion || '—'} />
                <Row label="Items" value={oc.items.length} />
                <Row label="Usuario" value={oc.usuario ?? '—'} />
              </dl>
            </Card>
          )}
        </aside>
      </div>
    </section>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none disabled:opacity-60';

function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[10px] tracking-[0.2em] uppercase text-amber-light/70 mb-1.5">
        {label}
        {required && <span className="text-amber-light/60 ml-1">*</span>}
      </label>
      {children}
    </div>
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

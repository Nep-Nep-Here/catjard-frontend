import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectOCById,
  selectOCStatus,
  fetchOC,
  crearOC,
  enviarOC,
  recibirOC,
  cancelarOC,
  eliminarOC,
} from '../../../redux/slices/ordenesCompraSlice.js';
import {
  selectProveedores,
  selectProveedoresStatus,
  fetchProveedores,
} from '../../../redux/slices/proveedoresSlice.js';
import { selectProductos } from '../../../redux/slices/productosSlice.js';
import { selectUser } from '../../../redux/slices/authSlice.js';
import {
  ESTADO_OC_LABEL,
  ESTADO_OC_COLOR,
  calcularTotalesOC,
} from '../../../data/ordenesCompra.js';
import AdminHeader, { Card, StatusBadge } from '../../../components/AdminHeader.jsx';

const EMPTY = {
  proveedorId: '',
  items: [{ productoId: '', cantidad: 0, precioUnit: 0 }],
  fechaEsperada: '',
  notas: '',
};

export default function OrdenCompraEditar() {
  const { id } = useParams();
  const isNew = id === 'nueva';
  const oc = useSelector(selectOCById(id));
  const ocStatus = useSelector(selectOCStatus);
  const proveedores = useSelector(selectProveedores);
  const proveedoresStatus = useSelector(selectProveedoresStatus);
  const productos = useSelector(selectProductos);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (proveedoresStatus === 'idle') dispatch(fetchProveedores());
  }, [proveedoresStatus, dispatch]);

  useEffect(() => {
    if (!isNew && ocStatus === 'idle') dispatch(fetchOC());
  }, [isNew, ocStatus, dispatch]);

  const totales = useMemo(() => calcularTotalesOC(form.items), [form.items]);

  if (!isNew && !oc) {
    return (
      <section>
        <AdminHeader
          title={ocStatus === 'loading' ? 'Cargando…' : 'OC no encontrada'}
          backTo="/admin/almacen/ordenes"
          backLabel="← Volver"
        />
      </section>
    );
  }

  const onChangeProveedor = (e) => {
    const proveedorId = parseInt(e.target.value, 10) || '';
    setForm((f) => ({ ...f, proveedorId }));
  };

  const onChangeItem = (i, key, value) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, idx) =>
        idx === i
          ? {
              ...it,
              [key]:
                key === 'productoId'
                  ? parseInt(value, 10) || ''
                  : parseFloat(value) || 0,
            }
          : it,
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

  const crear = async () => {
    setErr(null);
    if (!form.proveedorId) return setErr('Selecciona un proveedor.');
    if (form.items.length === 0) return setErr('Agrega al menos un item.');
    if (form.items.some((it) => !it.productoId || it.cantidad <= 0 || it.precioUnit <= 0))
      return setErr('Todos los items requieren producto, cantidad y precio.');

    setBusy(true);
    const action = await dispatch(
      crearOC({
        proveedorId: form.proveedorId,
        items: form.items.map((it) => ({
          productoId: it.productoId,
          cantidad: it.cantidad,
          precioUnit: it.precioUnit,
        })),
        fechaEsperada: form.fechaEsperada || null,
        usuario: user?.nombre ?? null,
        notas: form.notas || null,
      }),
    );
    setBusy(false);
    if (action.meta.requestStatus === 'fulfilled') {
      navigate(`/admin/almacen/ordenes/${action.payload.id}`);
    } else {
      setErr(action.payload || 'No se pudo crear la OC.');
    }
  };

  const accion = (thunk, args) => async () => {
    setErr(null);
    setBusy(true);
    const action = await dispatch(thunk(args));
    setBusy(false);
    if (action.meta.requestStatus !== 'fulfilled') {
      setErr(action.payload || 'No se pudo aplicar la acción.');
    }
  };

  const onEliminar = async () => {
    setErr(null);
    if (!window.confirm('¿Eliminar esta OC en borrador?')) return;
    setBusy(true);
    const action = await dispatch(eliminarOC(oc.id));
    setBusy(false);
    if (action.meta.requestStatus === 'fulfilled') {
      navigate('/admin/almacen/ordenes');
    } else {
      setErr(action.payload || 'No se pudo eliminar.');
    }
  };

  // ===== Vista CREAR =====
  if (isNew) {
    return (
      <section>
        <AdminHeader
          backTo="/admin/almacen/ordenes"
          backLabel="← Volver a OCs"
          eyebrow="Almacén"
          title="Nueva orden de compra"
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
                    className={inputCls}
                  >
                    <option value="">Selecciona…</option>
                    {proveedores
                      .filter((p) => p.activo)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombreComercial || p.razonSocial}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field label="Fecha esperada">
                  <input
                    type="date"
                    name="fechaEsperada"
                    value={form.fechaEsperada || ''}
                    onChange={onChange}
                    className={inputCls}
                  />
                </Field>
              </div>
            </Card>

            <Card
              title="Items"
              action={
                <button
                  type="button"
                  onClick={addItem}
                  className="text-[12px] text-amber hover:text-amber-light underline underline-offset-4"
                >
                  + Agregar item
                </button>
              }
            >
              <ItemsForm
                items={form.items}
                productos={productos}
                onChangeItem={onChangeItem}
                removeItem={removeItem}
                editable
              />
              <Totales totales={totales} />
            </Card>

            <Card title="Notas">
              <textarea
                name="notas"
                value={form.notas}
                onChange={onChange}
                rows={3}
                className={`${inputCls} resize-y`}
              />
            </Card>
          </div>

          <aside className="space-y-5">
            {err && (
              <div className="p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>
            )}
            <Card title="Acciones">
              <button
                onClick={crear}
                disabled={busy}
                className="w-full px-5 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors disabled:opacity-50"
              >
                {busy ? 'Creando…' : 'Crear como borrador'}
              </button>
              <p className="mt-3 text-[11px] text-amber-light/65">
                Una vez creada, podrás enviarla, recibirla o cancelarla desde el detalle.
              </p>
            </Card>
          </aside>
        </div>
      </section>
    );
  }

  // ===== Vista DETALLE =====
  return (
    <section>
      <AdminHeader
        backTo="/admin/almacen/ordenes"
        backLabel="← Volver a OCs"
        eyebrow={oc.codigo}
        title={`OC para ${oc.proveedorNombre}`}
        subtitle={`Emitida ${oc.fecha}`}
        action={
          <StatusBadge className={ESTADO_OC_COLOR[oc.estado]}>
            {ESTADO_OC_LABEL[oc.estado]}
          </StatusBadge>
        }
      />

      <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Card title="Items">
            <ItemsForm
              items={oc.items}
              productos={productos}
              editable={false}
            />
            <Totales
              totales={{ subtotal: oc.subtotal, igv: oc.igv, total: oc.total }}
            />
          </Card>

          {oc.notas && (
            <Card title="Notas">
              <p className="text-cream/85 text-[13px] whitespace-pre-line">{oc.notas}</p>
            </Card>
          )}
        </div>

        <aside className="space-y-5">
          {err && (
            <div className="p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>
          )}

          <Card title="Acciones">
            <div className="space-y-2">
              {oc.estado === 'borrador' && (
                <>
                  <button
                    onClick={accion(enviarOC, oc.id)}
                    disabled={busy}
                    className="w-full px-5 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors disabled:opacity-50"
                  >
                    Enviar al proveedor
                  </button>
                  <button
                    onClick={accion(cancelarOC, oc.id)}
                    disabled={busy}
                    className="w-full px-5 py-2.5 rounded-full border border-red-400/40 text-red-300 text-[13px] hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    Cancelar OC
                  </button>
                  <button
                    onClick={onEliminar}
                    disabled={busy}
                    className="w-full px-5 py-2 rounded-full text-red-300/70 text-[12px] hover:text-red-300 disabled:opacity-50"
                  >
                    Eliminar borrador
                  </button>
                </>
              )}
              {oc.estado === 'enviada' && (
                <>
                  <button
                    onClick={accion(recibirOC, { id: oc.id, usuario: user?.nombre })}
                    disabled={busy}
                    className="w-full px-5 py-2.5 rounded-full bg-green-500/90 text-cream text-[13px] font-semibold hover:bg-green-500 transition-colors disabled:opacity-50"
                  >
                    {busy ? 'Procesando…' : 'Marcar como recibida'}
                  </button>
                  <p className="text-[11px] text-amber-light/65">
                    Al recibir, se registra entrada en inventario y se actualiza el stock automáticamente.
                  </p>
                  <button
                    onClick={accion(cancelarOC, oc.id)}
                    disabled={busy}
                    className="w-full px-5 py-2.5 rounded-full border border-red-400/40 text-red-300 text-[13px] hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    Cancelar OC
                  </button>
                </>
              )}
              {oc.estado === 'recibida' && (
                <p className="text-cream/85 text-[13px]">
                  ✓ OC recibida el {oc.fechaRecepcion}. Stock actualizado.
                </p>
              )}
              {oc.estado === 'cancelada' && (
                <p className="text-cream/65 text-[13px]">OC cancelada.</p>
              )}
            </div>
          </Card>

          <Card title="Información">
            <dl className="space-y-2 text-[13px]">
              <Row label="Estado" value={ESTADO_OC_LABEL[oc.estado]} />
              <Row label="Esperada" value={oc.fechaEsperada || '—'} />
              <Row label="Recibida" value={oc.fechaRecepcion || '—'} />
              <Row label="Items" value={oc.items.length} />
              <Row label="Usuario" value={oc.usuario ?? '—'} />
            </dl>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function ItemsForm({ items, productos, onChangeItem, removeItem, editable }) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => {
        const importe = (Number(it.cantidad) || 0) * (Number(it.precioUnit) || 0);
        return (
          <div
            key={i}
            className="grid sm:grid-cols-[2fr_1fr_1fr_auto_auto] gap-3 p-3 rounded-md border border-amber/10 bg-bg-dark/30 items-end"
          >
            <Field label="Producto" required={editable && i === 0}>
              <select
                value={it.productoId || ''}
                onChange={(e) => editable && onChangeItem(i, 'productoId', e.target.value)}
                disabled={!editable}
                className={inputCls}
              >
                <option value="">
                  {editable ? 'Selecciona…' : (productos.find((p) => p.id === it.productoId)?.nombre ?? '—')}
                </option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cantidad" required={editable && i === 0}>
              <input
                type="number"
                min={1}
                value={it.cantidad}
                onChange={(e) => editable && onChangeItem(i, 'cantidad', e.target.value)}
                disabled={!editable}
                className={inputCls}
              />
            </Field>
            <Field label="Precio unit. S/" required={editable && i === 0}>
              <input
                type="number"
                step="0.01"
                min={0}
                value={it.precioUnit}
                onChange={(e) => editable && onChangeItem(i, 'precioUnit', e.target.value)}
                disabled={!editable}
                className={inputCls}
              />
            </Field>
            <div className="text-right">
              <p className="text-[10px] tracking-[0.2em] uppercase text-amber-light/65">
                Importe
              </p>
              <p className="font-display font-bold text-amber text-[16px] mt-1">
                S/ {importe.toFixed(2)}
              </p>
            </div>
            {editable && items.length > 1 && (
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
  );
}

function Totales({ totales }) {
  return (
    <div className="mt-5 pt-4 border-t border-amber/15 grid sm:grid-cols-3 gap-4 text-[14px]">
      <Row label="Subtotal" value={`S/ ${Number(totales.subtotal).toFixed(2)}`} />
      <Row label="IGV (18 %)" value={`S/ ${Number(totales.igv).toFixed(2)}`} />
      <Row
        label={<span className="text-cream font-semibold">Total</span>}
        value={
          <span className="text-amber font-display font-bold text-[20px]">
            S/ {Number(totales.total).toFixed(2)}
          </span>
        }
      />
    </div>
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

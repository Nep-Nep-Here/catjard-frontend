import { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectMovimientos,
  selectMovimientosStatus,
  selectMovimientosError,
  fetchMovimientos,
  registrarMovimiento,
} from '../../../redux/slices/movimientosSlice.js';
import { selectProductos } from '../../../redux/slices/productosSlice.js';
import { selectUser } from '../../../redux/slices/authSlice.js';
import {
  TIPO_MOVIMIENTO,
  TIPO_MOVIMIENTO_LABEL,
  TIPO_MOVIMIENTO_COLOR,
  MOTIVOS_ENTRADA,
  MOTIVOS_SALIDA,
} from '../../../data/movimientos.js';
import AdminHeader, { Card, StatusBadge, EmptyState } from '../../../components/AdminHeader.jsx';

const FILTROS = [
  { id: '',         label: 'Todos' },
  { id: 'entrada',  label: 'Entradas' },
  { id: 'salida',   label: 'Salidas' },
  { id: 'ajuste',   label: 'Ajustes' },
];

const EMPTY = {
  tipo: 'entrada',
  productoId: '',
  cantidad: 0,
  motivo: 'Compra a proveedor',
  referencia: '',
  notas: '',
};

export default function Movimientos() {
  const movimientos = useSelector(selectMovimientos);
  const status = useSelector(selectMovimientosStatus);
  const errorRemoto = useSelector(selectMovimientosError);
  const productos = useSelector(selectProductos);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [filtro, setFiltro] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchMovimientos());
  }, [status, dispatch]);

  const filtrados = useMemo(
    () => (filtro ? movimientos.filter((m) => m.tipo === filtro) : movimientos),
    [movimientos, filtro],
  );

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const onChangeTipo = (tipo) => {
    const motivo =
      tipo === 'entrada' ? MOTIVOS_ENTRADA[0] : tipo === 'salida' ? MOTIVOS_SALIDA[0] : 'Ajuste';
    setForm((f) => ({ ...f, tipo, motivo }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    const productoId = parseInt(form.productoId, 10);
    if (!productoId) return setErr('Selecciona un producto.');
    if (form.tipo !== 'ajuste' && form.cantidad <= 0)
      return setErr('La cantidad debe ser mayor a 0.');

    const action = await dispatch(
      registrarMovimiento({
        tipo: form.tipo,
        productoId,
        cantidad: form.cantidad,
        motivo: form.motivo,
        referencia: form.referencia || null,
        usuario: user?.nombre ?? null,
        notas: form.notas || null,
      }),
    );
    if (action.meta.requestStatus === 'fulfilled') {
      setForm(EMPTY);
      setShowForm(false);
    } else {
      setErr(action.payload || 'No se pudo registrar el movimiento.');
    }
  };

  return (
    <section>
      <AdminHeader
        eyebrow="Almacén"
        title="Movimientos"
        subtitle={
          status === 'loading'
            ? 'Cargando…'
            : status === 'failed'
            ? `Error: ${errorRemoto}`
            : `${filtrados.length} de ${movimientos.length}`
        }
        action={
          !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors"
            >
              + Registrar movimiento
            </button>
          )
        }
      />

      {showForm && (
        <Card title="Nuevo movimiento" className="mt-8">
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            <Field label="Tipo" required>
              <div className="flex flex-wrap gap-2">
                {Object.values(TIPO_MOVIMIENTO).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => onChangeTipo(t)}
                    className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
                      form.tipo === t
                        ? 'bg-amber text-brown border-amber font-semibold'
                        : 'bg-transparent text-cream/80 border-amber/25 hover:border-amber/60'
                    }`}
                  >
                    {TIPO_MOVIMIENTO_LABEL[t]}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Producto" required>
              <select
                name="productoId"
                value={form.productoId}
                onChange={onChange}
                required
                className={inputCls}
              >
                <option value="">Selecciona…</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (stock {p.stock})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cantidad" required hint={form.tipo === 'ajuste' ? 'Positivo suma, negativo resta.' : ''}>
              <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={onChange}
                step={1}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Motivo" required>
              <select name="motivo" value={form.motivo} onChange={onChange} required className={inputCls}>
                {(form.tipo === 'entrada'
                  ? MOTIVOS_ENTRADA
                  : form.tipo === 'salida'
                  ? MOTIVOS_SALIDA
                  : ['Ajuste positivo', 'Ajuste negativo']
                ).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Referencia (opcional)" hint="N° de OC, pedido, guía…">
              <input
                name="referencia"
                value={form.referencia}
                onChange={onChange}
                placeholder="OC-2026-0017, PED-2026-0089…"
                className={inputCls}
              />
            </Field>
            <Field label="Notas" className="sm:col-span-2">
              <textarea
                name="notas"
                value={form.notas}
                onChange={onChange}
                rows={2}
                className={`${inputCls} resize-y`}
              />
            </Field>

            {err && (
              <div className="sm:col-span-2 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">
                {err}
              </div>
            )}

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors">
                Registrar
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); }} className="px-4 py-2.5 rounded-full text-cream/70 text-[13px] hover:text-cream">
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

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
          <EmptyState titulo="No hay movimientos" descripcion="Registra entradas y salidas." />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-amber/15">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
              <tr>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Tipo</th>
                <th className="px-5 py-4">Producto</th>
                <th className="px-5 py-4 text-right">Cantidad</th>
                <th className="px-5 py-4">Motivo</th>
                <th className="px-5 py-4">Referencia</th>
                <th className="px-5 py-4">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((m) => {
                const producto = productos.find((p) => p.id === m.productoId);
                return (
                  <tr key={m.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                    <td className="px-5 py-3 text-cream/85">{m.fecha}</td>
                    <td className="px-5 py-3">
                      <StatusBadge className={TIPO_MOVIMIENTO_COLOR[m.tipo]}>
                        {TIPO_MOVIMIENTO_LABEL[m.tipo]}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-3 text-cream font-medium">{producto?.nombre ?? '—'}</td>
                    <td className={`px-5 py-3 text-right font-display font-bold ${m.tipo === 'entrada' ? 'text-green-300' : m.tipo === 'salida' ? 'text-orange-300' : 'text-yellow-200'}`}>
                      {m.tipo === 'salida' ? '−' : m.cantidad < 0 ? '−' : '+'}
                      {Math.abs(m.cantidad)}
                    </td>
                    <td className="px-5 py-3 text-cream/85">{m.motivo}</td>
                    <td className="px-5 py-3 text-amber-light/65 font-mono text-[11px]">{m.referencia || '—'}</td>
                    <td className="px-5 py-3 text-cream/85">{m.usuario}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none';

function Field({ label, required, hint, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[11px] tracking-[0.2em] uppercase text-amber mb-1.5">
        {label}
        {required && <span className="text-amber-light/60 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-amber-light/55">{hint}</p>}
    </div>
  );
}

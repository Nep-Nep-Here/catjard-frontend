import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectPromociones,
  crearPromocion,
  actualizarPromocion,
  togglePromocion,
  eliminarPromocion,
} from '../../../redux/slices/promocionesSlice.js';
import { selectProductos } from '../../../redux/slices/productosSlice.js';
import { CATEGORIAS } from '../../../data/products.js';
import AdminHeader, { Card } from '../../../components/AdminHeader.jsx';

const EMPTY = {
  nombre: '',
  descripcion: '',
  descuentoPct: 10,
  desde: '',
  hasta: '',
  aplicaA: 'todo',
  aplicaValor: null,
  activa: false,
};

export default function Promociones() {
  const promociones = useSelector(selectPromociones);
  const productos = useSelector(selectProductos);
  const dispatch = useDispatch();

  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const startNew = () => {
    setForm(EMPTY);
    setEditando('new');
  };

  const startEdit = (p) => {
    setForm(p);
    setEditando(p.id);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const onAplicaAChange = (e) => {
    setForm((f) => ({ ...f, aplicaA: e.target.value, aplicaValor: null }));
  };

  const onAplicaValorChange = (e) => {
    const v = e.target.value;
    setForm((f) => ({
      ...f,
      aplicaValor: f.aplicaA === 'producto' ? Number(v) || null : v || null,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (editando === 'new') {
      dispatch(crearPromocion(form));
    } else {
      dispatch(actualizarPromocion(form));
    }
    setEditando(null);
  };

  return (
    <section>
      <AdminHeader
        eyebrow="Campañas"
        title="Promociones"
        subtitle={`${promociones.length} configuradas`}
        action={
          editando == null && (
            <button
              onClick={startNew}
              className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors"
            >
              + Nueva promoción
            </button>
          )
        }
      />

      {editando != null && (
        <Card
          title={editando === 'new' ? 'Nueva promoción' : 'Editar promoción'}
          className="mt-8"
        >
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            <Field label="Nombre" required>
              <input name="nombre" value={form.nombre} onChange={onChange} required className={inputCls} />
            </Field>
            <Field label="Descuento (%)" required>
              <input type="number" min={0} max={100} name="descuentoPct" value={form.descuentoPct} onChange={onChange} required className={inputCls} />
            </Field>
            <Field label="Vigente desde" required>
              <input type="date" name="desde" value={form.desde} onChange={onChange} required className={inputCls} />
            </Field>
            <Field label="Vigente hasta" required>
              <input type="date" name="hasta" value={form.hasta} onChange={onChange} required className={inputCls} />
            </Field>
            <Field label="Aplica a" className="sm:col-span-2">
              <div className="flex flex-wrap gap-3 text-[14px] text-cream">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="aplicaA" value="todo" checked={form.aplicaA === 'todo'} onChange={onAplicaAChange} className="accent-amber" />
                  Todo el catálogo
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="aplicaA" value="categoria" checked={form.aplicaA === 'categoria'} onChange={onAplicaAChange} className="accent-amber" />
                  Una categoría
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="aplicaA" value="producto" checked={form.aplicaA === 'producto'} onChange={onAplicaAChange} className="accent-amber" />
                  Un producto específico
                </label>
              </div>
            </Field>
            {form.aplicaA === 'categoria' && (
              <Field label="Categoría" required className="sm:col-span-2">
                <select value={form.aplicaValor ?? ''} onChange={onAplicaValorChange} required className={inputCls}>
                  <option value="">Selecciona…</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {form.aplicaA === 'producto' && (
              <Field label="Producto" required className="sm:col-span-2">
                <select value={form.aplicaValor ?? ''} onChange={onAplicaValorChange} required className={inputCls}>
                  <option value="">Selecciona…</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Descripción" className="sm:col-span-2">
              <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={3} className={`${inputCls} resize-y`} />
            </Field>
            <label className="sm:col-span-2 inline-flex items-center gap-2 text-cream text-[14px]">
              <input type="checkbox" name="activa" checked={form.activa} onChange={onChange} className="accent-amber w-4 h-4" />
              Activar inmediatamente
            </label>

            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors">
                {editando === 'new' ? 'Crear promoción' : 'Guardar cambios'}
              </button>
              <button type="button" onClick={() => setEditando(null)} className="px-4 py-2.5 rounded-full text-cream/70 text-[13px] hover:text-cream">
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      {editando == null && (
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {promociones.map((p) => {
            const aplicaLabel =
              p.aplicaA === 'todo'
                ? 'Todo el catálogo'
                : p.aplicaA === 'categoria'
                ? `Categoría: ${CATEGORIAS.find((c) => c.id === p.aplicaValor)?.label ?? p.aplicaValor}`
                : `Producto: ${productos.find((pr) => pr.id === p.aplicaValor)?.nombre ?? '—'}`;
            return (
              <article key={p.id} className="p-5 rounded-xl border border-amber/15 bg-amber/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-bold text-cream text-[18px]">{p.nombre}</p>
                    <p className="text-amber-light/65 text-[12px] mt-1">{aplicaLabel}</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      p.activa
                        ? 'bg-green-500/15 text-green-300 border-green-500/30'
                        : 'bg-cream/10 text-cream/60 border-cream/15'
                    }`}
                  >
                    {p.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <p className="mt-3 font-display font-black text-amber text-[36px] leading-none">
                  -{p.descuentoPct}%
                </p>
                <p className="mt-2 text-amber-light/85 text-[13px]">
                  {p.desde} → {p.hasta}
                </p>
                {p.descripcion && (
                  <p className="mt-3 text-cream/80 text-[13px]">{p.descripcion}</p>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => dispatch(togglePromocion(p.id))}
                    className="px-4 py-1.5 rounded-full border border-amber/40 text-cream text-[12px] hover:border-amber hover:text-amber-light transition-colors"
                  >
                    {p.activa ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => startEdit(p)}
                    className="px-4 py-1.5 rounded-full text-cream/80 text-[12px] hover:text-amber-light"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => dispatch(eliminarPromocion(p.id))}
                    className="px-4 py-1.5 rounded-full text-red-300/80 text-[12px] hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none';

function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[11px] tracking-[0.2em] uppercase text-amber mb-1.5">
        {label}
        {required && <span className="text-amber-light/60 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

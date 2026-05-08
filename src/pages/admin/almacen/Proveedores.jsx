import { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectProveedores,
  selectProveedoresStatus,
  selectProveedoresError,
  fetchProveedores,
  crearProveedor,
  actualizarProveedor,
  toggleProveedor,
  eliminarProveedor,
} from '../../../redux/slices/proveedoresSlice.js';
import AdminHeader, { Card, EmptyState } from '../../../components/AdminHeader.jsx';

const EMPTY = {
  razonSocial: '',
  nombreComercial: '',
  ruc: '',
  contacto: '',
  email: '',
  telefono: '',
  direccion: '',
  productos: '',
  notas: '',
  activo: true,
  fechaAlta: new Date().toISOString().slice(0, 10),
};

export default function Proveedores() {
  const proveedores = useSelector(selectProveedores);
  const status = useSelector(selectProveedoresStatus);
  const errorRemoto = useSelector(selectProveedoresError);
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState(null);
  const [confirmando, setConfirmando] = useState(null);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProveedores());
  }, [status, dispatch]);

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return proveedores;
    return proveedores.filter(
      (p) =>
        p.nombreComercial.toLowerCase().includes(q) ||
        p.ruc?.includes(q) ||
        p.productos?.toLowerCase().includes(q),
    );
  }, [proveedores, search]);

  const startNew = () => {
    setForm(EMPTY);
    setEditando('new');
    setErr(null);
  };

  const startEdit = (p) => {
    setForm(p);
    setEditando(p.id);
    setErr(null);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!form.razonSocial || !form.ruc) return setErr('Razón social y RUC son obligatorios.');
    if (form.ruc.length !== 11) return setErr('El RUC debe tener 11 dígitos.');
    const action =
      editando === 'new'
        ? await dispatch(crearProveedor(form))
        : await dispatch(actualizarProveedor(form));
    if (action.meta.requestStatus === 'fulfilled') setEditando(null);
    else setErr(action.payload || 'No se pudo guardar el proveedor.');
  };

  const onDelete = async (id) => {
    const action = await dispatch(eliminarProveedor(id));
    setConfirmando(null);
    if (action.meta.requestStatus !== 'fulfilled') {
      alert(action.payload || 'No se pudo eliminar.');
    }
  };

  return (
    <section>
      <AdminHeader
        eyebrow="Almacén"
        title="Proveedores"
        subtitle={
          status === 'loading'
            ? 'Cargando…'
            : status === 'failed'
            ? `Error: ${errorRemoto}`
            : `${filtrados.length} de ${proveedores.length}`
        }
        action={
          editando == null && (
            <button
              onClick={startNew}
              className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors"
            >
              + Nuevo proveedor
            </button>
          )
        }
      />

      {editando != null && (
        <Card title={editando === 'new' ? 'Nuevo proveedor' : 'Editar proveedor'} className="mt-8">
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            <Field label="Razón social" required>
              <input name="razonSocial" value={form.razonSocial} onChange={onChange} required className={inputCls} />
            </Field>
            <Field label="Nombre comercial">
              <input name="nombreComercial" value={form.nombreComercial} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="RUC" required>
              <input name="ruc" value={form.ruc} onChange={onChange} required maxLength={11} className={inputCls} />
            </Field>
            <Field label="Contacto principal">
              <input name="contacto" value={form.contacto} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="Correo">
              <input type="email" name="email" value={form.email} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="Teléfono">
              <input name="telefono" value={form.telefono} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="Dirección" className="sm:col-span-2">
              <input name="direccion" value={form.direccion} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="Productos que provee" className="sm:col-span-2" hint="Texto libre, separado por comas.">
              <input name="productos" value={form.productos} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="Notas" className="sm:col-span-2">
              <textarea name="notas" value={form.notas} onChange={onChange} rows={2} className={`${inputCls} resize-y`} />
            </Field>
            <label className="sm:col-span-2 inline-flex items-center gap-2 text-cream text-[14px]">
              <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} className="accent-amber w-4 h-4" />
              Activo
            </label>

            {err && (
              <div className="sm:col-span-2 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>
            )}

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors">
                {editando === 'new' ? 'Crear' : 'Guardar'}
              </button>
              <button type="button" onClick={() => setEditando(null)} className="px-4 py-2.5 rounded-full text-cream/70 text-[13px] hover:text-cream">
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      {editando == null && (
        <>
          <div className="mt-8 max-w-[420px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, RUC o producto…"
              className="w-full px-4 py-3 rounded-md bg-bg-dark border border-amber/30 text-cream focus:border-amber focus:outline-none text-[14px]"
            />
          </div>

          {filtrados.length === 0 ? (
            <div className="mt-8">
              <EmptyState titulo="Sin coincidencias" descripcion="Ajusta los términos de búsqueda." />
            </div>
          ) : (
            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtrados.map((p) => (
                <article key={p.id} className="p-5 rounded-xl border border-amber/15 bg-amber/5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display font-bold text-cream text-[16px]">{p.nombreComercial || p.razonSocial}</p>
                      <p className="text-amber-light/65 text-[11px] font-mono mt-1">RUC {p.ruc}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${p.activo ? 'bg-green-500/15 text-green-300 border-green-500/30' : 'bg-cream/10 text-cream/60 border-cream/15'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="mt-3 text-cream/85 text-[13px]">{p.productos || '—'}</p>
                  <div className="mt-4 space-y-1 text-[12px] text-amber-light/75">
                    <p>{p.contacto}</p>
                    <p>{p.email}</p>
                    <p>{p.telefono}</p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => dispatch(toggleProveedor(p.id))}
                      className="px-3 py-1.5 rounded-full border border-amber/40 text-cream text-[11px] hover:border-amber hover:text-amber-light transition-colors"
                    >
                      {p.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => startEdit(p)}
                      className="px-3 py-1.5 rounded-full text-cream/80 text-[11px] hover:text-amber-light"
                    >
                      Editar
                    </button>
                    {confirmando === p.id ? (
                      <span className="text-[11px] inline-flex items-center gap-1.5">
                        <button onClick={() => onDelete(p.id)} className="text-red-300 hover:text-red-200 underline underline-offset-4">
                          Confirmar
                        </button>
                        <button onClick={() => setConfirmando(null)} className="text-cream/60 hover:text-cream">
                          cancelar
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmando(p.id)}
                        className="px-3 py-1.5 rounded-full text-red-300/80 text-[11px] hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
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

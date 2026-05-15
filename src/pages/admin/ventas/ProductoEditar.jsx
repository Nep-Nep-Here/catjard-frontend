import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectProductoById,
  crearProducto,
  actualizarProducto,
} from '../../../redux/slices/productosSlice.js';
import { CATEGORIAS, TECNICAS } from '../../../data/products.js';
import AdminHeader, { Card } from '../../../components/AdminHeader.jsx';

const EMPTY = {
  nombre: '',
  slug: '',
  categoria: 'oficina',
  precio: 0,
  stock: 0,
  stockMinimo: 50,
  descripcion: '',
  tecnicas: [],
  imagenUrl: '',
};

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function ProductoEditar() {
  const { id } = useParams();
  const isNew = id === 'nuevo';
  const productoExistente = useSelector(selectProductoById(Number(id)));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState(isNew ? EMPTY : productoExistente ?? EMPTY);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!isNew && productoExistente) setForm(productoExistente);
  }, [productoExistente, isNew]);

  if (!isNew && !productoExistente) {
    return (
      <section>
        <AdminHeader
          title="Producto no encontrado"
          backTo="/admin/almacen/catalogo"
          backLabel="← Volver al catálogo"
        />
      </section>
    );
  }

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const slugFromName = (s) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const onChangeNombre = (e) => {
    const nombre = e.target.value;
    setForm((f) => ({
      ...f,
      nombre,
      slug: isNew && (!f.slug || f.slug === slugFromName(f.nombre)) ? slugFromName(nombre) : f.slug,
    }));
  };

  const onImagenFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    if (!file.type.startsWith('image/')) {
      setErr('El archivo debe ser una imagen.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErr('La imagen supera 2 MB. Usa una más pequeña o pega una URL.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, imagenUrl: reader.result }));
    };
    reader.onerror = () => setErr('No se pudo leer la imagen.');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const limpiarImagen = () => setForm((f) => ({ ...f, imagenUrl: '' }));

  const toggleTecnica = (t) => {
    setForm((f) => ({
      ...f,
      tecnicas: f.tecnicas.includes(t)
        ? f.tecnicas.filter((x) => x !== t)
        : [...f.tecnicas, t],
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setErr(null);
    if (!form.nombre.trim()) return setErr('El nombre es obligatorio.');
    if (!form.slug.trim()) return setErr('El slug es obligatorio.');
    if (!form.categoria) return setErr('Selecciona una categoría.');
    if (form.tecnicas.length === 0)
      return setErr('Selecciona al menos una técnica.');
    if (form.precio <= 0) return setErr('El precio debe ser mayor a 0.');

    if (isNew) {
      dispatch(crearProducto(form));
    } else {
      dispatch(actualizarProducto(form));
    }
    navigate('/admin/almacen/catalogo');
  };

  return (
    <section>
      <AdminHeader
        backTo="/admin/almacen/catalogo"
        backLabel="← Volver al catálogo"
        eyebrow="Catálogo"
        title={isNew ? 'Nuevo producto' : 'Editar producto'}
        subtitle={isNew ? 'Crea un producto para el catálogo público.' : `Editando ${form.nombre}`}
      />

      <form onSubmit={onSubmit} className="mt-10 grid lg:grid-cols-2 gap-6 max-w-[1100px]">
        <Card title="Información">
          <div className="space-y-5">
            <Field label="Nombre" required>
              <input
                name="nombre"
                value={form.nombre}
                onChange={onChangeNombre}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Slug (URL)" required hint="Identificador en URL del producto.">
              <input
                name="slug"
                value={form.slug}
                onChange={onChange}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Categoría" required>
              <select
                name="categoria"
                value={form.categoria}
                onChange={onChange}
                required
                className={inputCls}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Descripción">
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={onChange}
                rows={4}
                className={`${inputCls} resize-y`}
              />
            </Field>
          </div>
        </Card>

        <Card title="Precio y stock">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Precio base (S/)" required hint="Precio para 50 unidades. Volumen aplica descuentos.">
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  name="precio"
                  value={form.precio}
                  onChange={onChange}
                  required
                  className={inputCls}
                />
              </Field>
              <Field label="Stock actual">
                <input
                  type="number"
                  min={0}
                  name="stock"
                  value={form.stock}
                  onChange={onChange}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Stock mínimo" hint="Si el stock cae por debajo, se mostrará una alerta.">
              <input
                type="number"
                min={0}
                name="stockMinimo"
                value={form.stockMinimo}
                onChange={onChange}
                className={inputCls}
              />
            </Field>
          </div>
        </Card>

        <Card title="Imagen del producto" className="lg:col-span-2">
          <p className="text-amber-light/70 text-[13px] mb-4">
            Pega una URL pública o sube una imagen desde tu equipo (máx. 2 MB). Si dejas esto vacío se mostrará un placeholder con el nombre.
          </p>
          <div className="grid md:grid-cols-[260px_1fr] gap-6 items-start">
            <div className="relative w-full h-[200px] rounded-xl overflow-hidden border border-amber/20 bg-bg-dark flex items-center justify-center">
              {form.imagenUrl ? (
                <img
                  src={form.imagenUrl}
                  alt={form.nombre || 'Previsualización'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-amber-light/55 text-[12px] tracking-[0.2em] uppercase">
                  Sin imagen
                </span>
              )}
            </div>
            <div className="space-y-4">
              <Field label="URL de imagen" hint="Ruta pública (https://...) o data URL.">
                <input
                  name="imagenUrl"
                  value={form.imagenUrl}
                  onChange={onChange}
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>
              <div className="flex flex-wrap gap-3 items-center">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber/40 text-cream cursor-pointer hover:border-amber hover:text-amber-light transition-colors text-[13px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImagenFile}
                    className="hidden"
                  />
                  Subir desde mi equipo
                </label>
                {form.imagenUrl && (
                  <button
                    type="button"
                    onClick={limpiarImagen}
                    className="text-[13px] text-cream/65 hover:text-amber-light transition-colors"
                  >
                    Quitar imagen
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Técnicas disponibles" className="lg:col-span-2">
          <p className="text-amber-light/70 text-[13px] mb-3">
            Marca todas las técnicas con las que se puede personalizar este producto.
          </p>
          <div className="flex flex-wrap gap-2">
            {TECNICAS.map((t) => {
              const selected = form.tecnicas.includes(t);
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleTecnica(t)}
                  className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
                    selected
                      ? 'bg-amber text-brown border-amber font-semibold'
                      : 'bg-transparent text-cream/80 border-amber/25 hover:border-amber/60 hover:text-cream'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </Card>

        {err && (
          <div className="lg:col-span-2 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">
            {err}
          </div>
        )}

        <div className="lg:col-span-2 flex flex-wrap gap-3">
          <button
            type="submit"
            className="px-7 py-3 rounded-full bg-amber text-brown font-semibold hover:bg-amber-light transition-colors"
          >
            {isNew ? 'Crear producto' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/almacen/catalogo')}
            className="px-5 py-3 rounded-full text-cream/80 hover:text-cream"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none';

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.2em] uppercase text-amber mb-1.5">
        {label}
        {required && <span className="text-amber-light/60 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-amber-light/55">{hint}</p>}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectProductos,
  eliminarProducto,
} from '../../../redux/slices/productosSlice.js';
import { CATEGORIAS, getCategoria } from '../../../data/products.js';
import AdminHeader, { EmptyState } from '../../../components/AdminHeader.jsx';

export default function CatalogoAdmin() {
  const productos = useSelector(selectProductos);
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [confirmando, setConfirmando] = useState(null);

  const filtrados = useMemo(() => {
    let list = productos;
    if (cat) list = list.filter((p) => p.categoria === cat);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.nombre.toLowerCase().includes(q) || p.slug.includes(q),
      );
    }
    return list;
  }, [productos, cat, search]);

  const onEliminar = (id) => {
    dispatch(eliminarProducto(id));
    setConfirmando(null);
  };

  return (
    <section>
      <AdminHeader
        eyebrow="Almacén"
        title="Inventario"
        subtitle={`${filtrados.length} de ${productos.length} productos · ${productos.filter((p) => p.stock <= p.stockMinimo).length} en stock crítico`}
        action={
          <Link
            to="/admin/almacen/catalogo/nuevo"
            className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors"
          >
            + Nuevo producto
          </Link>
        }
      />

      <div className="mt-8 grid sm:grid-cols-[1fr_auto] gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o slug…"
          className="px-4 py-2.5 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="px-4 py-2.5 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            titulo="Sin productos"
            descripcion="Crea el primer producto."
            action={
              <Link
                to="/admin/almacen/catalogo/nuevo"
                className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors"
              >
                + Nuevo producto
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-amber/15">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
              <tr>
                <th className="px-5 py-4">Nombre</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">Categoría</th>
                <th className="px-5 py-4 text-right">Precio</th>
                <th className="px-5 py-4 text-right">Stock</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Técnicas</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const stockBajo = p.stock <= p.stockMinimo;
                return (
                  <tr key={p.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                    <td className="px-5 py-3 text-cream font-medium">{p.nombre}</td>
                    <td className="px-5 py-3 text-amber-light/65 font-mono text-[12px]">{p.slug}</td>
                    <td className="px-5 py-3 text-cream/85">{getCategoria(p.categoria)?.label}</td>
                    <td className="px-5 py-3 text-right font-display font-bold text-amber">
                      S/ {p.precio.toFixed(2)}
                    </td>
                    <td className={`px-5 py-3 text-right ${stockBajo ? 'text-red-300' : 'text-cream/85'}`}>
                      {p.stock}
                    </td>
                    <td className="px-5 py-3">
                      {stockBajo ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-red-500/15 text-red-300 border border-red-500/30">
                          Stock crítico
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-green-500/15 text-green-300 border border-green-500/30">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-amber-light/70 text-[11px]">
                      {p.tecnicas.length} técnicas
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/almacen/catalogo/${p.id}`}
                        className="text-amber-light hover:text-amber underline underline-offset-4 text-[12px] mr-4"
                      >
                        Editar
                      </Link>
                      {confirmando === p.id ? (
                        <span className="text-[12px]">
                          <button
                            onClick={() => onEliminar(p.id)}
                            className="text-red-300 hover:text-red-200 underline underline-offset-4 mr-2"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setConfirmando(null)}
                            className="text-cream/60 hover:text-cream"
                          >
                            cancelar
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmando(p.id)}
                          className="text-red-300/80 hover:text-red-300 underline underline-offset-4 text-[12px]"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
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

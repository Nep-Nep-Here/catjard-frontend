import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CATEGORIAS, TECNICAS } from '../../data/products.js';
import { selectProductos } from '../../redux/slices/productosSlice.js';
import ProductCard from '../../components/ProductCard.jsx';

const ORDEN_OPTIONS = [
  { id: 'relevancia', label: 'Relevancia' },
  { id: 'precio-asc', label: 'Precio: menor a mayor' },
  { id: 'precio-desc', label: 'Precio: mayor a menor' },
  { id: 'nombre-asc', label: 'Nombre A → Z' },
];

export default function Catalogo() {
  const productos = useSelector(selectProductos);
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const cat = params.get('cat') ?? '';
  const tec = params.get('tec') ?? '';
  const stockOnly = params.get('stock') === '1';
  const orden = params.get('orden') ?? 'relevancia';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === '' || value === false || value == null) next.delete(key);
    else next.set(key, value === true ? '1' : value);
    setParams(next);
  };

  const filtrados = useMemo(() => {
    let list = [...productos];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q),
      );
    }
    if (cat) list = list.filter((p) => p.categoria === cat);
    if (tec) list = list.filter((p) => p.tecnicas.includes(tec));
    if (stockOnly) list = list.filter((p) => p.stock > p.stockMinimo);

    if (orden === 'precio-asc') list.sort((a, b) => a.precio - b.precio);
    else if (orden === 'precio-desc') list.sort((a, b) => b.precio - a.precio);
    else if (orden === 'nombre-asc') list.sort((a, b) => a.nombre.localeCompare(b.nombre));

    return list;
  }, [productos, search, cat, tec, stockOnly, orden]);

  const limpiar = () => {
    setSearch('');
    setParams(new URLSearchParams());
  };

  return (
    <section className="bg-bg-dark px-6 pt-32 pb-20 min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
              Catálogo
            </span>
            <h1 className="mt-3 font-display font-black text-cream text-[56px] md:text-[68px] leading-[0.95] balance">
              Productos.
            </h1>
            <p className="mt-4 font-body text-amber-light/85 text-[16px] max-w-[480px]">
              {filtrados.length} de {productos.length} productos. Pedido mínimo: 50 unidades.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-body text-[12px] tracking-widest uppercase text-amber-light/70">
              Ordenar
            </label>
            <select
              value={orden}
              onChange={(e) => setParam('orden', e.target.value === 'relevancia' ? '' : e.target.value)}
              className="bg-bg-dark border border-amber/30 rounded-md px-3 py-2 text-cream text-[14px] focus:border-amber focus:outline-none"
            >
              {ORDEN_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-10">
          <aside className="space-y-8">
            <div>
              <label className="block text-[12px] tracking-[0.2em] uppercase text-amber mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setParam('q', e.target.value);
                }}
                placeholder="Polo, taza, libreta…"
                className="w-full px-4 py-3 rounded-md bg-bg-dark border border-amber/30 text-cream focus:border-amber focus:outline-none"
              />
            </div>

            <FilterGroup label="Categoría" active={cat}>
              <FilterChip selected={!cat} onClick={() => setParam('cat', '')}>
                Todas
              </FilterChip>
              {CATEGORIAS.map((c) => (
                <FilterChip
                  key={c.id}
                  selected={cat === c.id}
                  onClick={() => setParam('cat', cat === c.id ? '' : c.id)}
                >
                  {c.label}
                </FilterChip>
              ))}
            </FilterGroup>

            <FilterGroup label="Técnica" active={tec}>
              <FilterChip selected={!tec} onClick={() => setParam('tec', '')}>
                Todas
              </FilterChip>
              {TECNICAS.map((t) => (
                <FilterChip
                  key={t}
                  selected={tec === t}
                  onClick={() => setParam('tec', tec === t ? '' : t)}
                >
                  {t}
                </FilterChip>
              ))}
            </FilterGroup>

            <label className="flex items-center gap-2 text-cream/85 text-[14px] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={stockOnly}
                onChange={(e) => setParam('stock', e.target.checked)}
                className="accent-amber w-4 h-4"
              />
              Solo con stock
            </label>

            <button
              onClick={limpiar}
              className="text-[13px] text-amber-light/70 hover:text-amber-light underline underline-offset-4"
            >
              Limpiar filtros
            </button>
          </aside>

          <div>
            {filtrados.length === 0 ? (
              <div className="p-12 rounded-xl border border-amber/15 text-center">
                <p className="font-display text-cream text-[22px]">No encontramos productos.</p>
                <p className="mt-2 text-amber-light/70 text-[14px]">
                  Prueba con otros términos o limpia los filtros.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtrados.map((p) => (
                  <ProductCard key={p.id} producto={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <p className="text-[12px] tracking-[0.2em] uppercase text-amber mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
        selected
          ? 'bg-amber text-brown border-amber font-semibold'
          : 'bg-transparent text-cream/80 border-amber/25 hover:border-amber/60 hover:text-cream'
      }`}
    >
      {children}
    </button>
  );
}

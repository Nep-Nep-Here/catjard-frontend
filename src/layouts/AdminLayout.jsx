import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../redux/slices/authSlice.js';
import { selectLeads, fetchLeads } from '../redux/slices/leadsSlice.js';
import { fetchClientes } from '../redux/slices/clientesSlice.js';
import { selectProductos } from '../redux/slices/productosSlice.js';
import { selectCotizaciones, fetchCotizaciones } from '../redux/slices/cotizacionesSlice.js';
import { fetchPedidos } from '../redux/slices/pedidosSlice.js';
import { selectParametros } from '../redux/slices/configSlice.js';
import { CatJardMark } from '../components/Icons.jsx';
import { ROLE_LABELS } from '../data/users.js';

const VENTAS_ITEMS = [
  { to: '/admin/ventas',                label: 'Dashboard', end: true },
  { to: '/admin/ventas/leads',          label: 'Leads', badge: 'leads' },
  { to: '/admin/ventas/clientes',       label: 'Clientes (CRM)' },
  { to: '/admin/ventas/cotizaciones',   label: 'Cotizaciones' },
  { to: '/admin/ventas/pedidos',        label: 'Pedidos' },
  { to: '/admin/ventas/promociones',    label: 'Promociones' },
];

const ALMACEN_ITEMS = [
  { to: '/admin/almacen',              label: 'Dashboard', end: true },
  { to: '/admin/almacen/movimientos',  label: 'Movimientos' },
  { to: '/admin/almacen/proveedores',  label: 'Proveedores' },
  { to: '/admin/almacen/ordenes',      label: 'Órdenes de compra' },
  { to: '/admin/almacen/despachos',    label: 'Despachos' },
  { to: '/admin/almacen/catalogo',     label: 'Inventario', badge: 'stockBajo' },
];

const OPERACIONES_ITEMS = [
  { to: '/admin/operaciones',         label: 'Dashboard', end: true },
  { to: '/admin/operaciones/kanban',  label: 'Tablero kanban' },
];

const GERENCIA_ITEMS = [
  { to: '/admin/gerencia',                label: 'Dashboard ejecutivo', end: true },
  { to: '/admin/gerencia/reportes',       label: 'Reportes' },
  { to: '/admin/gerencia/aprobaciones',   label: 'Aprobaciones', badge: 'aprobaciones' },
  { to: '/admin/gerencia/usuarios',       label: 'Usuarios del sistema' },
  { to: '/admin/gerencia/configuracion',  label: 'Configuración' },
  { to: '/admin/gerencia/auditoria',      label: 'Auditoría' },
];

const SECTIONS_BY_ROLE = {
  vendedor:    [{ titulo: 'Marketing y Ventas',     items: VENTAS_ITEMS }],
  almacen:     [{ titulo: 'Logística y Almacén',    items: ALMACEN_ITEMS }],
  produccion:  [{ titulo: 'Producción y Operaciones', items: OPERACIONES_ITEMS }],
  gerente: [
    { titulo: 'Dirección',                items: GERENCIA_ITEMS },
    { titulo: 'Marketing y Ventas',       items: VENTAS_ITEMS },
    { titulo: 'Logística y Almacén',      items: ALMACEN_ITEMS },
    { titulo: 'Producción y Operaciones', items: OPERACIONES_ITEMS },
  ],
};

export default function AdminLayout() {
  const user = useSelector(selectUser);
  const leads = useSelector(selectLeads);
  const productos = useSelector(selectProductos);
  const cotizaciones = useSelector(selectCotizaciones);
  const parametros = useSelector(selectParametros);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'vendedor' || user?.role === 'gerente') {
      dispatch(fetchLeads());
      dispatch(fetchClientes());
      dispatch(fetchCotizaciones());
    }
    if (['vendedor', 'gerente', 'almacen', 'produccion'].includes(user?.role)) {
      dispatch(fetchPedidos());
    }
  }, [dispatch, user?.role]);

  const onLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const sections = SECTIONS_BY_ROLE[user?.role] ?? [];
  const leadsNuevos = leads.filter((l) => l.estado === 'nuevo').length;
  const productosBajoStock = productos.filter((p) => p.stock <= p.stockMinimo).length;
  const aprobacionesPendientes = cotizaciones.filter(
    (c) => c.total >= (parametros?.umbralAprobacionGerencia ?? 10000) &&
           ['enviada', 'en_revision'].includes(c.estado),
  ).length;

  const getBadge = (key) => {
    if (key === 'leads' && leadsNuevos > 0) return leadsNuevos;
    if (key === 'stockBajo' && productosBajoStock > 0) return productosBajoStock;
    if (key === 'aprobaciones' && aprobacionesPendientes > 0) return aprobacionesPendientes;
    return null;
  };

  return (
    <div className="min-h-screen bg-bg-dark text-cream font-body flex">
      <aside className="w-72 shrink-0 bg-bg-dark border-r border-amber/15 px-5 py-6 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <Link to="/" className="flex items-center gap-3 mb-8 px-1">
          <CatJardMark size={36} />
          <div className="leading-tight">
            <p className="font-display font-black text-[18px]">Cat Jard</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-amber/70">Panel interno</p>
          </div>
        </Link>

        <nav className="space-y-6 mb-auto">
          {sections.map((sec) => (
            <div key={sec.titulo}>
              <p className="text-[10px] tracking-[0.25em] uppercase text-amber/70 px-3 mb-2">
                {sec.titulo}
              </p>
              <div className="space-y-1">
                {sec.items.map((m) => {
                  const badge = getBadge(m.badge);
                  return (
                    <NavLink
                      key={m.to}
                      to={m.to}
                      end={m.end}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors ${
                          isActive
                            ? 'bg-amber/15 text-amber'
                            : 'text-cream/80 hover:bg-amber/5 hover:text-amber-light'
                        }`
                      }
                    >
                      <span>{m.label}</span>
                      {badge && (
                        <span className="ml-2 text-[10px] bg-amber text-brown rounded-full px-2 py-0.5 font-bold">
                          {badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-amber/15 pt-4 mt-6">
          <p className="text-[12px] text-cream/85">{user?.nombre}</p>
          <p className="text-[10px] text-amber-light/55 mt-0.5">
            {ROLE_LABELS[user?.role] ?? '—'}
          </p>
          <button
            onClick={onLogout}
            className="mt-3 text-[12px] text-cream/60 hover:text-amber-light transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-x-auto max-w-full">
        <Outlet />
      </main>
    </div>
  );
}

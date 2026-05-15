import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser, selectClienteId } from '../redux/slices/authSlice.js';
import { selectCartLineCount } from '../redux/slices/cartSlice.js';
import { fetchCotizaciones } from '../redux/slices/cotizacionesSlice.js';
import { fetchPedidos } from '../redux/slices/pedidosSlice.js';
import { CatJardMark } from '../components/Icons.jsx';

const MENU = [
  { to: '/cliente',                label: 'Dashboard',  end: true },
  { to: '/cliente/cotizar',        label: 'Carrito de cotización', showCount: true },
  { to: '/cliente/cotizaciones',   label: 'Mis cotizaciones' },
  { to: '/cliente/pedidos',        label: 'Mis pedidos' },
  { to: '/cliente/perfil',         label: 'Mi perfil' },
];

export default function ClientLayout() {
  const user = useSelector(selectUser);
  const clienteId = useSelector(selectClienteId);
  const cartLines = useSelector(selectCartLineCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (clienteId != null) {
      dispatch(fetchCotizaciones({ clienteId }));
      dispatch(fetchPedidos({ clienteId }));
    }
  }, [dispatch, clienteId]);

  const onLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg-dark text-cream font-body flex">
      <aside className="w-64 shrink-0 bg-bg-dark border-r border-amber/15 px-6 py-6 flex flex-col sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-3 mb-10">
          <CatJardMark size={36} />
          <div className="leading-tight">
            <p className="font-display font-black text-[18px]">Cat Jard</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-amber/70">Portal cliente</p>
          </div>
        </Link>
        <p className="text-[11px] tracking-[0.25em] uppercase text-amber/70 mb-1">{user?.empresa}</p>
        <p className="text-[11px] text-amber-light/55 mb-6">RUC {user?.ruc}</p>

        <nav className="space-y-2 mb-auto">
          {MENU.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-lg text-[14px] transition-colors ${
                  isActive
                    ? 'bg-amber/15 text-amber'
                    : 'text-cream/80 hover:bg-amber/5 hover:text-amber-light'
                }`
              }
            >
              <span>{m.label}</span>
              {m.showCount && cartLines > 0 && (
                <span className="ml-2 text-[11px] bg-amber text-brown rounded-full px-2 py-0.5 font-bold">
                  {cartLines}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-amber/15 pt-4 mt-6">
          <p className="text-[13px] text-cream/85">{user?.nombre}</p>
          <p className="text-[11px] text-amber-light/55 mt-0.5">{user?.email}</p>
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

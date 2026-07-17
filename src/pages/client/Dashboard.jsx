
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectClienteId } from '../../redux/slices/authSlice.js';
import { selectCotizacionesByCliente } from '../../redux/slices/cotizacionesSlice.js';
import { selectPedidosByCliente } from '../../redux/slices/pedidosSlice.js';
import {
  ESTADO_COTIZACION_LABEL,
  ESTADO_COTIZACION_COLOR,
} from '../../data/cotizaciones.js';
import {
  ESTADO_PEDIDO_LABEL,
  ESTADO_PEDIDO_COLOR,
} from '../../data/pedidos.js';

export default function ClienteDashboard() {
  const user = useSelector(selectUser);
  // Filtrar por el clienteId del CRM, NO por user.id (id de identity): son de bases
  // distintas y user.id no matchea el clienteId que guardan cotizaciones/pedidos.
  const clienteId = useSelector(selectClienteId);
  const cotizaciones = useSelector(selectCotizacionesByCliente(clienteId));
  const pedidos = useSelector(selectPedidosByCliente(clienteId));

  const cotizacionesActivas = cotizaciones.filter((c) =>
    ['enviada', 'en_revision', 'propuesta'].includes(c.estado),
  );
  const pedidosEnCurso = pedidos.filter((p) => p.estado !== 'entregado');
  const pedidosEntregados = pedidos.filter((p) => p.estado === 'entregado');
  const gastoTotal = pedidos.reduce((acc, p) => acc + (p.total ?? 0), 0);

  const ultimasCotizaciones = cotizaciones.slice(0, 3);
  const ultimosPedidos = [...pedidos]
    .sort((a, b) => (a.fechaPedido < b.fechaPedido ? 1 : -1))
    .slice(0, 3);

  return (
    <section>
      <div>
        <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
          Portal del cliente
        </span>
        <h1 className="mt-3 font-display font-black text-cream text-[44px] md:text-[52px] leading-tight">
          Hola, {user?.nombre?.split(' ')[0] ?? 'cliente'}.
        </h1>
        <p className="mt-2 font-body text-amber-light/85 text-[15px]">
          {user?.empresa} · RUC {user?.ruc}
        </p>
      </div>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Kpi label="Cotizaciones activas"  value={cotizacionesActivas.length} />
        <Kpi label="Pedidos en curso"      value={pedidosEnCurso.length} />
        <Kpi label="Pedidos entregados"    value={pedidosEntregados.length} />
        <Kpi label="Gasto total" value={`S/ ${gastoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
      </div>

      <div className="mt-12 grid lg:grid-cols-2 gap-6">
        <Panel title="Últimas cotizaciones" linkTo="/cliente/cotizaciones" linkLabel="Ver todas">
          {ultimasCotizaciones.length === 0 ? (
            <Empty
              titulo="Aún no tienes cotizaciones"
              cta="Crear una cotización"
              to="/cliente/cotizar"
            />
          ) : (
            <ul className="divide-y divide-amber/10">
              {ultimasCotizaciones.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/cliente/cotizaciones/${c.id}`}
                    className="flex items-center justify-between py-4 group"
                  >
                    <div>
                      <p className="font-display font-bold text-cream text-[16px] group-hover:text-amber-light">
                        {c.id}
                      </p>
                      <p className="text-amber-light/60 text-[12px]">{c.fecha}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={ESTADO_COTIZACION_COLOR[c.estado]}>
                        {ESTADO_COTIZACION_LABEL[c.estado]}
                      </Badge>
                      <p className="text-amber font-display font-bold mt-1">
                        S/ {c.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Últimos pedidos" linkTo="/cliente/pedidos" linkLabel="Ver todos">
          {ultimosPedidos.length === 0 ? (
            <Empty titulo="Aún no tienes pedidos" />
          ) : (
            <ul className="divide-y divide-amber/10">
              {ultimosPedidos.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/cliente/pedidos/${p.id}`}
                    className="flex items-center justify-between py-4 group"
                  >
                    <div>
                      <p className="font-display font-bold text-cream text-[16px] group-hover:text-amber-light">
                        {p.id}
                      </p>
                      <p className="text-amber-light/60 text-[12px]">
                        Entrega est. {p.fechaEntregaEstimada}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={ESTADO_PEDIDO_COLOR[p.estado]}>
                        {ESTADO_PEDIDO_LABEL[p.estado]}
                      </Badge>
                      <p className="text-amber font-display font-bold mt-1">
                        S/ {p.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-12 p-8 rounded-2xl border border-amber/20 bg-amber/5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-black text-cream text-[24px]">¿Necesitas algo nuevo?</h3>
          <p className="text-amber-light/80 text-[14px] mt-1">
            Arma tu cotización agregando productos del catálogo.
          </p>
        </div>
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-semibold px-6 py-3 hover:bg-amber-light transition-colors"
        >
          Ir al catálogo
        </Link>
      </div>
    </section>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
      <p className="text-[11px] tracking-[0.2em] uppercase text-amber-light/65">{label}</p>
      <p className="mt-3 font-display font-black text-amber text-[32px] leading-none">{value}</p>
    </div>
  );
}

function Panel({ title, linkTo, linkLabel, children }) {
  return (
    <div className="p-6 rounded-xl border border-amber/15 bg-amber/5">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-display font-bold text-cream text-[20px]">{title}</h2>
        {linkTo && (
          <Link
            to={linkTo}
            className="text-[12px] text-amber-light/70 hover:text-amber-light underline underline-offset-4"
          >
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function Badge({ className = '', children }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] tracking-wide border ${className}`}
    >
      {children}
    </span>
  );
}

function Empty({ titulo, cta, to }) {
  return (
    <div className="py-8 text-center">
      <p className="text-cream/70 text-[14px]">{titulo}</p>
      {cta && to && (
        <Link
          to={to}
          className="inline-flex mt-4 items-center gap-2 rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}

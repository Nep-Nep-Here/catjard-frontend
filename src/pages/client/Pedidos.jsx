import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectClienteId } from '../../redux/slices/authSlice.js';
import { selectPedidosByCliente } from '../../redux/slices/pedidosSlice.js';
import {
  ESTADO_PEDIDO_LABEL,
  ESTADO_PEDIDO_COLOR,
} from '../../data/pedidos.js';

const FILTROS = [
  { id: '',           label: 'Todos' },
  { id: 'en_curso',   label: 'En curso' },
  { id: 'entregado',  label: 'Entregados' },
];

export default function Pedidos() {
  const clienteId = useSelector(selectClienteId);
  const pedidos = useSelector(selectPedidosByCliente(clienteId));
  const [filtro, setFiltro] = useState('');

  const filtrados = useMemo(() => {
    if (filtro === 'entregado') return pedidos.filter((p) => p.estado === 'entregado');
    if (filtro === 'en_curso') return pedidos.filter((p) => p.estado !== 'entregado');
    return pedidos;
  }, [pedidos, filtro]);

  return (
    <section>
      <div>
        <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
          Pedidos
        </span>
        <h1 className="mt-3 font-display font-black text-cream text-[40px] md:text-[48px] leading-tight">
          Mis pedidos.
        </h1>
        <p className="mt-2 font-body text-amber-light/85 text-[15px]">
          {filtrados.length} de {pedidos.length}
        </p>
      </div>

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
        <div className="mt-12 p-12 rounded-xl border border-amber/15 text-center">
          <p className="font-display text-cream text-[20px]">No hay pedidos aquí.</p>
          <p className="mt-2 text-amber-light/70 text-[14px]">
            Cuando apruebes una cotización, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-amber/15">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-amber/5 text-amber-light/80 text-[11px] tracking-widest uppercase">
              <tr>
                <th className="px-5 py-4">N° pedido</th>
                <th className="px-5 py-4">Creado</th>
                <th className="px-5 py-4">Entrega est.</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Total</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                  <td className="px-5 py-4 font-mono text-cream">{p.codigo}</td>
                  <td className="px-5 py-4 text-cream/85">{p.fechaPedido}</td>
                  <td className="px-5 py-4 text-cream/85">{p.fechaEntregaEstimada ?? '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] tracking-wide border ${ESTADO_PEDIDO_COLOR[p.estado]}`}>
                      {ESTADO_PEDIDO_LABEL[p.estado]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-display font-bold text-amber">
                    S/ {p.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/cliente/pedidos/${p.id}`}
                      className="text-amber-light hover:text-amber underline underline-offset-4 text-[13px]"
                    >
                      Ver tracking
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

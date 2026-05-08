import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectPedidos, setEstadoPedido } from '../../../redux/slices/pedidosSlice.js';
import AdminHeader from '../../../components/AdminHeader.jsx';

const COLUMNAS = [
  {
    id: 'por_iniciar',
    titulo: 'Por iniciar',
    descripcion: 'Recién aprobados, asignar diseño',
    estados: ['por_iniciar'],
    accent: 'border-cream/20',
  },
  {
    id: 'en_diseno',
    titulo: 'En diseño',
    descripcion: 'Por subir arte final',
    estados: ['en_diseno'],
    accent: 'border-blue-500/30',
  },
  {
    id: 'esperando_aprobacion_arte',
    titulo: 'Esperando aprobación',
    descripcion: 'El cliente debe aprobar el arte',
    estados: ['esperando_aprobacion_arte'],
    accent: 'border-amber/40',
  },
  {
    id: 'en_produccion',
    titulo: 'En producción',
    descripcion: 'Personalización en curso',
    estados: ['en_produccion'],
    accent: 'border-purple-500/30',
  },
  {
    id: 'control_calidad',
    titulo: 'Terminado',
    descripcion: 'Pasó a control de calidad / despacho',
    estados: ['control_calidad', 'listo', 'despachado', 'entregado'],
    accent: 'border-green-500/30',
  },
];

export default function Kanban() {
  const pedidos = useSelector(selectPedidos);
  const dispatch = useDispatch();

  return (
    <section>
      <AdminHeader
        eyebrow="Producción"
        title="Tablero kanban"
        subtitle="Mueve los pedidos a través de las etapas de producción."
      />

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        {COLUMNAS.map((col) => {
          const cards = pedidos.filter((p) => col.estados.includes(p.estado));
          return (
            <div
              key={col.id}
              className={`rounded-xl border ${col.accent} bg-amber/5 p-4 flex flex-col`}
            >
              <div className="mb-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display font-bold text-cream text-[16px]">{col.titulo}</h3>
                  <span className="text-[12px] text-amber-light/70">{cards.length}</span>
                </div>
                <p className="text-amber-light/60 text-[11px] mt-0.5">{col.descripcion}</p>
              </div>

              <div className="space-y-3 min-h-[80px]">
                {cards.length === 0 ? (
                  <p className="text-cream/45 text-[12px] text-center py-6">— vacío —</p>
                ) : (
                  cards.map((p) => (
                    <KanbanCard
                      key={p.id}
                      pedido={p}
                      onIniciarDiseno={
                        p.estado === 'por_iniciar'
                          ? () => dispatch(setEstadoPedido({ id: p.id, estado: 'en_diseno' }))
                          : null
                      }
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function KanbanCard({ pedido, onIniciarDiseno }) {
  const unidades = pedido.items.reduce((acc, it) => acc + it.cantidad, 0);

  return (
    <div className="rounded-lg bg-bg-dark/50 border border-amber/15 hover:border-amber/40 transition-colors">
      <Link to={`/admin/operaciones/pedidos/${pedido.id}`} className="block p-4">
        <p className="font-mono text-amber-light/65 text-[11px]">{pedido.codigo}</p>
        <h4 className="mt-1 font-display font-bold text-cream text-[15px] truncate">
          {pedido.empresa}
        </h4>
        <p className="mt-2 text-cream/75 text-[12px]">
          {pedido.items.length} líneas · {unidades} und
        </p>
        <p className="mt-1 text-amber-light/65 text-[11px]">
          Entrega est. {pedido.fechaEntregaEstimada ?? '—'}
        </p>
      </Link>
      {onIniciarDiseno && (
        <button
          onClick={onIniciarDiseno}
          className="block w-full text-left px-4 py-2 border-t border-amber/15 text-[12px] text-amber hover:bg-amber/10 hover:text-amber-light transition-colors rounded-b-lg"
        >
          → Iniciar diseño
        </button>
      )}
    </div>
  );
}

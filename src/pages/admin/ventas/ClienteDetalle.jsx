import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectClienteById,
  selectClientesStatus,
  fetchClientes,
  actualizarCliente,
} from '../../../redux/slices/clientesSlice.js';
import { selectCotizaciones } from '../../../redux/slices/cotizacionesSlice.js';
import { selectPedidos } from '../../../redux/slices/pedidosSlice.js';
import {
  ESTADO_COTIZACION_LABEL,
  ESTADO_COTIZACION_COLOR,
} from '../../../data/cotizaciones.js';
import {
  ESTADO_PEDIDO_LABEL,
  ESTADO_PEDIDO_COLOR,
} from '../../../data/pedidos.js';
import AdminHeader, { Card, StatusBadge } from '../../../components/AdminHeader.jsx';

export default function ClienteDetalle() {
  const { id } = useParams();
  const cliente = useSelector(selectClienteById(id));
  const clientesStatus = useSelector(selectClientesStatus);
  const cotizaciones = useSelector(selectCotizaciones);
  const pedidos = useSelector(selectPedidos);
  const dispatch = useDispatch();

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(cliente ?? {});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (clientesStatus === 'idle') dispatch(fetchClientes());
  }, [clientesStatus, dispatch]);

  if (!cliente) {
    return (
      <section>
        <AdminHeader
          title={clientesStatus === 'loading' ? 'Cargando…' : 'Cliente no encontrado'}
          backTo="/admin/ventas/clientes"
          backLabel="← Volver al CRM"
        />
      </section>
    );
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = () => {
    dispatch(actualizarCliente(form));
    setEditando(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const cotizacionesCliente = cotizaciones.filter((c) => c.empresa === cliente.nombreComercial);
  const pedidosCliente = pedidos.filter((p) => p.empresa === cliente.nombreComercial);
  const totalGastado = pedidosCliente.reduce((acc, p) => acc + (p.total ?? 0), 0);

  return (
    <section>
      <AdminHeader
        backTo="/admin/ventas/clientes"
        backLabel="← Volver al CRM"
        eyebrow="Cliente"
        title={cliente.nombreComercial}
        subtitle={`${cliente.razonSocial} · RUC ${cliente.ruc}`}
        action={
          editando ? (
            <div className="flex gap-2">
              <button
                onClick={onSave}
                className="px-4 py-2 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setForm(cliente);
                  setEditando(false);
                }}
                className="px-4 py-2 rounded-full text-cream/70 text-[13px] hover:text-cream"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditando(true)}
              className="px-4 py-2 rounded-full border border-amber/40 text-cream text-[13px] hover:border-amber hover:text-amber-light transition-colors"
            >
              Editar
            </button>
          )
        }
      />

      {saved && (
        <p className="mt-4 text-amber-light text-[13px] bg-amber/10 px-3 py-2 rounded">
          ✓ Datos del cliente actualizados.
        </p>
      )}

      <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Card title="Información">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Razón social"     name="razonSocial"     value={form.razonSocial}     editando={editando} onChange={onChange} />
              <Field label="Nombre comercial" name="nombreComercial" value={form.nombreComercial} editando={editando} onChange={onChange} />
              <Field label="RUC"              name="ruc"             value={form.ruc}             editando={editando} onChange={onChange} />
              <Field label="Industria"        name="industria"       value={form.industria}       editando={editando} onChange={onChange} />
              <Field label="Contacto"         name="contactoPrincipal" value={form.contactoPrincipal} editando={editando} onChange={onChange} />
              <Field label="Correo"           name="email"           value={form.email}           editando={editando} onChange={onChange} />
              <Field label="Teléfono"         name="telefono"        value={form.telefono}        editando={editando} onChange={onChange} />
              <Field label="Dirección"        name="direccion"       value={form.direccion}       editando={editando} onChange={onChange} />
            </div>
            <div className="mt-5">
              <p className="text-[10px] tracking-[0.2em] uppercase text-amber-light/65 mb-2">Notas</p>
              {editando ? (
                <textarea
                  name="notas"
                  value={form.notas ?? ''}
                  onChange={onChange}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[13px] focus:border-amber focus:outline-none resize-y"
                />
              ) : (
                <p className="text-cream/85 text-[14px]">{cliente.notas || '—'}</p>
              )}
            </div>
          </Card>

          <Card title={`Cotizaciones (${cotizacionesCliente.length})`}>
            {cotizacionesCliente.length === 0 ? (
              <p className="text-cream/65 text-[13px]">Aún sin cotizaciones.</p>
            ) : (
              <ul className="divide-y divide-amber/10">
                {cotizacionesCliente.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/admin/ventas/cotizaciones/${c.id}`}
                      className="flex items-center justify-between py-3 group"
                    >
                      <div>
                        <p className="font-mono text-cream text-[13px]">{c.codigo ?? c.id}</p>
                        <p className="text-amber-light/60 text-[12px]">{c.fecha}</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge className={ESTADO_COTIZACION_COLOR[c.estado]}>
                          {ESTADO_COTIZACION_LABEL[c.estado]}
                        </StatusBadge>
                        <p className="text-amber font-display font-bold text-[14px] mt-1">
                          S/ {c.total.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={`Pedidos (${pedidosCliente.length})`}>
            {pedidosCliente.length === 0 ? (
              <p className="text-cream/65 text-[13px]">Aún sin pedidos.</p>
            ) : (
              <ul className="divide-y divide-amber/10">
                {pedidosCliente.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/admin/ventas/pedidos/${p.id}`}
                      className="flex items-center justify-between py-3 group"
                    >
                      <div>
                        <p className="font-mono text-cream text-[13px]">{p.codigo ?? p.id}</p>
                        <p className="text-amber-light/60 text-[12px]">{p.fechaPedido}</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge className={ESTADO_PEDIDO_COLOR[p.estado]}>
                          {ESTADO_PEDIDO_LABEL[p.estado]}
                        </StatusBadge>
                        <p className="text-amber font-display font-bold text-[14px] mt-1">
                          S/ {p.total.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Resumen">
            <dl className="space-y-3 text-[13px]">
              <Row label="Cliente desde" value={cliente.fechaAlta ?? '—'} />
              <Row label="Cotizaciones"  value={cotizacionesCliente.length} />
              <Row label="Pedidos"       value={pedidosCliente.length} />
              <Row
                label="Gasto total"
                value={`S/ ${totalGastado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
              />
              <Row label="Cuenta" value={cliente.cuentaActiva ? 'Activa' : 'Sin cuenta'} />
            </dl>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function Field({ label, name, value, editando, onChange }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-amber-light/65">{label}</p>
      {editando ? (
        <input
          name={name}
          value={value ?? ''}
          onChange={onChange}
          className="w-full mt-1.5 px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[13px] focus:border-amber focus:outline-none"
        />
      ) : (
        <p className="mt-1 text-cream">{value || '—'}</p>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-cream/75">{label}</dt>
      <dd className="text-cream text-right">{value}</dd>
    </div>
  );
}

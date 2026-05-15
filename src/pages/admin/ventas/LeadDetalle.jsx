import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectLeadById,
  selectLeadsStatus,
  fetchLeads,
  actualizarLead,
  convertirLead,
} from '../../../redux/slices/leadsSlice.js';
import { fetchClientes } from '../../../redux/slices/clientesSlice.js';
import { selectUser } from '../../../redux/slices/authSlice.js';
import {
  ESTADO_LEAD,
  ESTADO_LEAD_LABEL,
  ESTADO_LEAD_COLOR,
} from '../../../data/leads.js';
import AdminHeader, { Card, StatusBadge } from '../../../components/AdminHeader.jsx';

export default function LeadDetalle() {
  const { id } = useParams();
  const lead = useSelector(selectLeadById(id));
  const leadsStatus = useSelector(selectLeadsStatus);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notas, setNotas] = useState(lead?.notasInternas ?? '');

  useEffect(() => {
    if (leadsStatus === 'idle') dispatch(fetchLeads());
  }, [leadsStatus, dispatch]);
  const [savedNotas, setSavedNotas] = useState(false);
  const [convirtiendo, setConvirtiendo] = useState(false);
  const [errConvert, setErrConvert] = useState(null);
  const [credenciales, setCredenciales] = useState(null);

  if (!lead) {
    return (
      <section>
        <AdminHeader
          title={leadsStatus === 'loading' ? 'Cargando…' : 'Lead no encontrado'}
          backTo="/admin/ventas/leads"
          backLabel="← Volver a leads"
        />
      </section>
    );
  }

  const cambiarEstado = (estado) => {
    dispatch(
      actualizarLead({
        id: lead.id,
        estado,
        asignadoA: lead.asignadoA ?? user?.nombre,
      }),
    );
  };

  const guardarNotas = () => {
    dispatch(actualizarLead({ id: lead.id, notasInternas: notas, asignadoA: lead.asignadoA ?? user?.nombre }));
    setSavedNotas(true);
    setTimeout(() => setSavedNotas(false), 3000);
  };

  const convertirACliente = async () => {
    setErrConvert(null);
    if (!lead.ruc || !/^\d{11}$/.test(lead.ruc)) {
      setErrConvert('El lead necesita un RUC válido (11 dígitos) para convertirse en cliente. Edítalo desde Postman o pídele el RUC al contacto.');
      return;
    }
    setConvirtiendo(true);
    try {
      const result = await dispatch(
        convertirLead({
          id: lead.id,
          payload: {
            razonSocial: lead.empresa,
            nombreComercial: lead.empresa,
            ruc: lead.ruc,
            industria: '',
            direccion: '',
            notas: `Originado del lead ${lead.codigo}.`,
          },
        }),
      ).unwrap();
      await dispatch(fetchClientes());
      setCredenciales({
        email: result?.email,
        password: result?.passwordTemporal,
        cuentaCreada: result?.cuentaCreada,
        mensaje: result?.mensaje,
      });
    } catch (e) {
      setErrConvert(typeof e === 'string' ? e : 'No se pudo convertir el lead.');
    } finally {
      setConvirtiendo(false);
    }
  };

  const irACliente = () => {
    setCredenciales(null);
    navigate('/admin/ventas/clientes');
  };

  return (
    <section>
      <AdminHeader
        backTo="/admin/ventas/leads"
        backLabel="← Volver a leads"
        eyebrow={lead.codigo}
        title={lead.empresa}
        subtitle={`Recibido el ${lead.fecha}`}
        action={
          <StatusBadge className={ESTADO_LEAD_COLOR[lead.estado]}>
            {ESTADO_LEAD_LABEL[lead.estado]}
          </StatusBadge>
        }
      />

      <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Card title="Mensaje del lead">
            <div className="grid sm:grid-cols-2 gap-4 mb-5 text-[13px]">
              <Field label="Contacto" value={lead.nombre} />
              <Field label="Correo"   value={lead.email} />
              <Field label="Teléfono" value={lead.telefono} />
              <Field label="RUC"      value={lead.ruc || '—'} />
              <Field label="Productos" value={lead.productos} />
              <Field label="Cantidad"  value={lead.cantidad} />
            </div>
            <p className="text-[12px] tracking-[0.2em] uppercase text-amber-light/65 mb-2">
              Mensaje
            </p>
            <p className="text-cream/90 text-[14px] leading-relaxed bg-bg-dark/40 rounded-md p-4 border border-amber/10">
              {lead.mensaje}
            </p>
          </Card>

          <Card title="Notas internas">
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={4}
              placeholder="Llamadas, próximos pasos…"
              className="w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[13px] focus:border-amber focus:outline-none resize-y"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={guardarNotas}
                className="px-5 py-2 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors"
              >
                Guardar notas
              </button>
              {savedNotas && (
                <span className="text-amber-light text-[12px]">✓ Guardado</span>
              )}
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Acciones">
            <div className="space-y-2">
              <Action
                label="Marcar como contactado"
                onClick={() => cambiarEstado(ESTADO_LEAD.CONTACTADO)}
                disabled={lead.estado === 'contactado' || lead.estado === 'convertido'}
              />
              <Action
                label={convirtiendo ? 'Convirtiendo…' : 'Convertir a cliente CRM'}
                onClick={convertirACliente}
                disabled={lead.estado === 'convertido' || convirtiendo}
                primary
              />
              <Action
                label="Descartar"
                onClick={() => cambiarEstado(ESTADO_LEAD.DESCARTADO)}
                disabled={lead.estado === 'descartado'}
                danger
              />
            </div>
            {errConvert && (
              <p className="mt-3 text-red-300 text-[12px] bg-red-400/10 border border-red-400/30 rounded px-3 py-2">
                {errConvert}
              </p>
            )}
          </Card>

          <Card title="Asignación">
            <p className="text-[14px] text-cream">
              {lead.asignadoA ?? <span className="text-amber-light/60 italic">Sin asignar</span>}
            </p>
            {!lead.asignadoA && (
              <button
                onClick={() =>
                  dispatch(actualizarLead({ id: lead.id, asignadoA: user?.nombre }))
                }
                className="mt-3 text-[13px] text-amber underline underline-offset-4 hover:text-amber-light"
              >
                Asignármelo
              </button>
            )}
          </Card>
        </aside>
      </div>

      {credenciales && (
        <CredencialesModal
          email={credenciales.email}
          password={credenciales.password}
          cuentaCreada={credenciales.cuentaCreada}
          mensaje={credenciales.mensaje}
          onClose={irACliente}
        />
      )}
    </section>
  );
}

function CredencialesModal({ email, password, cuentaCreada, mensaje, onClose }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`Email: ${email}\nContraseña: ${password}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {}
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-[520px] rounded-2xl border border-amber/30 bg-bg-dark p-7 shadow-2xl">
        <p className="text-[11px] tracking-[0.3em] uppercase text-amber">
          {cuentaCreada ? 'Cliente creado · acceso generado' : 'Cliente creado'}
        </p>
        <h2 className="mt-2 font-display font-black text-cream text-[28px] leading-tight">
          {cuentaCreada ? 'Credenciales del cliente' : 'Conversión completada'}
        </h2>
        <p className="mt-3 text-amber-light/80 text-[13px] leading-relaxed">
          {mensaje ?? 'El lead fue convertido en cliente CRM.'}
        </p>

        {cuentaCreada && password && (
          <>
            <div className="mt-6 rounded-xl border border-amber/30 bg-amber/5 p-4 space-y-3">
              <Row label="Email" value={email} />
              <Row label="Contraseña temporal" value={password} mono />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={copiar}
                className="px-4 py-2 rounded-full border border-amber/40 text-cream text-[13px] hover:border-amber hover:text-amber-light transition-colors"
              >
                {copiado ? '✓ Copiado' : 'Copiar credenciales'}
              </button>
              <p className="text-amber-light/65 text-[11px]">
                Esta contraseña no se vuelve a mostrar. Guárdala o envíasela al cliente.
              </p>
            </div>
          </>
        )}

        <div className="mt-7 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors"
          >
            Ir a clientes
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-amber-light/65">{label}</p>
      <p className={`mt-0.5 text-cream text-[14px] ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-amber-light/65">{label}</p>
      <p className="mt-1 text-cream">{value}</p>
    </div>
  );
}

function Action({ label, onClick, disabled, primary, danger }) {
  const cls = primary
    ? 'bg-amber text-brown hover:bg-amber-light'
    : danger
    ? 'border border-red-400/40 text-red-300 hover:bg-red-500/10'
    : 'border border-amber/40 text-cream hover:border-amber hover:text-amber-light';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-full text-[13px] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${cls}`}
    >
      {label}
    </button>
  );
}

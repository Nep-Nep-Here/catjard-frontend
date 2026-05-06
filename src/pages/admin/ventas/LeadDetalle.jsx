import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectLeadById,
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
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notas, setNotas] = useState(lead?.notasInternas ?? '');
  const [savedNotas, setSavedNotas] = useState(false);
  const [convirtiendo, setConvirtiendo] = useState(false);
  const [errConvert, setErrConvert] = useState(null);

  if (!lead) {
    return (
      <section>
        <AdminHeader title="Lead no encontrado" backTo="/admin/ventas/leads" backLabel="← Volver a leads" />
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
      await dispatch(
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
      navigate('/admin/ventas/clientes');
    } catch (e) {
      setErrConvert(typeof e === 'string' ? e : 'No se pudo convertir el lead.');
    } finally {
      setConvirtiendo(false);
    }
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
    </section>
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

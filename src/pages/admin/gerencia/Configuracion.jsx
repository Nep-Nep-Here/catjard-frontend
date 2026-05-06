import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectConfig,
  actualizarEmpresa,
  actualizarParametros,
  resetConfig,
} from '../../../redux/slices/configSlice.js';
import AdminHeader, { Card } from '../../../components/AdminHeader.jsx';

export default function Configuracion() {
  const config = useSelector(selectConfig);
  const dispatch = useDispatch();

  const [empresa, setEmpresa] = useState(config.empresa);
  const [parametros, setParametros] = useState(config.parametros);
  const [savedEmpresa, setSavedEmpresa] = useState(false);
  const [savedParametros, setSavedParametros] = useState(false);

  const onChangeEmpresa = (e) =>
    setEmpresa({ ...empresa, [e.target.name]: e.target.value });

  const onChangeParametros = (e) => {
    const { name, value, type } = e.target;
    setParametros({ ...parametros, [name]: type === 'number' ? parseFloat(value) || 0 : value });
  };

  const guardarEmpresa = (e) => {
    e.preventDefault();
    dispatch(actualizarEmpresa(empresa));
    setSavedEmpresa(true);
    setTimeout(() => setSavedEmpresa(false), 3500);
  };

  const guardarParametros = (e) => {
    e.preventDefault();
    dispatch(actualizarParametros(parametros));
    setSavedParametros(true);
    setTimeout(() => setSavedParametros(false), 3500);
  };

  const onReset = () => {
    if (confirm('¿Restaurar los valores por defecto? Se perderán los cambios actuales.')) {
      dispatch(resetConfig());
      setEmpresa(config.empresa);
      setParametros(config.parametros);
    }
  };

  return (
    <section>
      <AdminHeader
        eyebrow="Dirección"
        title="Configuración general"
        subtitle="Datos de la empresa y parámetros del sistema"
      />

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <form onSubmit={guardarEmpresa}>
          <Card title="Datos de la empresa">
            <div className="space-y-4">
              <Field label="Razón social"     name="razonSocial"     value={empresa.razonSocial}     onChange={onChangeEmpresa} />
              <Field label="Nombre comercial" name="nombreComercial" value={empresa.nombreComercial} onChange={onChangeEmpresa} />
              <Field label="RUC"              name="ruc"             value={empresa.ruc}             onChange={onChangeEmpresa} />
              <Field label="Dirección"        name="direccion"       value={empresa.direccion}       onChange={onChangeEmpresa} />
              <Field label="Teléfono"         name="telefono"        value={empresa.telefono}        onChange={onChangeEmpresa} />
              <Field label="Correo"           name="email" type="email" value={empresa.email}        onChange={onChangeEmpresa} />
              <Field label="Sitio web"        name="web"             value={empresa.web}             onChange={onChangeEmpresa} />
            </div>
            {savedEmpresa && (
              <p className="mt-4 text-amber-light text-[13px] bg-amber/10 px-3 py-2 rounded">
                ✓ Datos de la empresa actualizados.
              </p>
            )}
            <button
              type="submit"
              className="mt-5 px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors"
            >
              Guardar
            </button>
          </Card>
        </form>

        <form onSubmit={guardarParametros}>
          <Card title="Parámetros del sistema">
            <div className="space-y-4">
              <Field
                label="Umbral aprobación gerencia (S/)"
                name="umbralAprobacionGerencia"
                type="number"
                value={parametros.umbralAprobacionGerencia}
                onChange={onChangeParametros}
                hint="Cotizaciones con monto mayor o igual aparecen en bandeja de aprobaciones."
              />
              <Field
                label="Stock mínimo por defecto"
                name="stockMinimoDefault"
                type="number"
                value={parametros.stockMinimoDefault}
                onChange={onChangeParametros}
                hint="Se aplica a nuevos productos."
              />
              <Field
                label="IGV (%)"
                name="igvRate"
                type="number"
                value={parametros.igvRate}
                onChange={onChangeParametros}
              />
              <Field
                label="Pedido mínimo (unidades)"
                name="pedidoMinimoUnidades"
                type="number"
                value={parametros.pedidoMinimoUnidades}
                onChange={onChangeParametros}
              />
              <Field
                label="Días de validez de cotización"
                name="diasValidezCotizacion"
                type="number"
                value={parametros.diasValidezCotizacion}
                onChange={onChangeParametros}
              />
              <Field
                label="Moneda"
                name="monedaPrincipal"
                value={parametros.monedaPrincipal}
                onChange={onChangeParametros}
              />
            </div>
            {savedParametros && (
              <p className="mt-4 text-amber-light text-[13px] bg-amber/10 px-3 py-2 rounded">
                ✓ Parámetros actualizados.
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={onReset}
                className="px-4 py-2.5 rounded-full border border-red-400/40 text-red-300 text-[13px] hover:bg-red-500/10 transition-colors"
              >
                Restaurar defaults
              </button>
            </div>
          </Card>
        </form>
      </div>
    </section>
  );
}

function Field({ label, name, value, onChange, hint, type = 'text' }) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.2em] uppercase text-amber mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none"
      />
      {hint && <p className="mt-1.5 text-[11px] text-amber-light/55">{hint}</p>}
    </div>
  );
}

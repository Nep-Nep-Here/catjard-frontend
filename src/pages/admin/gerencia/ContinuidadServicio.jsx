import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  resumenContinuidad,
  listarServicios, crearServicio, actualizarServicio, eliminarServicio,
  listarRiesgos, crearRiesgo, actualizarRiesgo, eliminarRiesgo,
  listarRespaldos, registrarRespaldo, sincronizarRespaldosDO,
  listarArticulosKB, obtenerArticuloKB, crearArticuloKB, actualizarArticuloKB, eliminarArticuloKB,
} from '../../../services/continuidadService.js';
import AdminHeader, { Card, EmptyState } from '../../../components/AdminHeader.jsx';

// ---------- catálogos ----------
const TIPOS_SERVICIO = [
  { id: 'microservicio',   label: 'Microservicio' },
  { id: 'base_datos',      label: 'Base de datos' },
  { id: 'frontend',        label: 'Frontend' },
  { id: 'infraestructura', label: 'Infraestructura' },
];
const TIPO_LABELS = Object.fromEntries(TIPOS_SERVICIO.map((t) => [t.id, t.label]));

const CRITICIDADES = [
  { id: 'baja',    label: 'Baja' },
  { id: 'media',   label: 'Media' },
  { id: 'alta',    label: 'Alta' },
  { id: 'critica', label: 'Crítica' },
];
const CRIT_LABELS = Object.fromEntries(CRITICIDADES.map((c) => [c.id, c.label]));
const CRIT_BADGE = {
  baja:    'bg-blue-400/10 text-blue-300 border-blue-400/30',
  media:   'bg-yellow-400/10 text-yellow-300 border-yellow-400/30',
  alta:    'bg-orange-400/10 text-orange-300 border-orange-400/30',
  critica: 'bg-red-400/10 text-red-300 border-red-400/30',
};

const NIVELES = [
  { id: 'bajo',  label: 'Bajo' },
  { id: 'medio', label: 'Medio' },
  { id: 'alto',  label: 'Alto' },
];
const NIVEL_RIESGO_LABELS = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto', critico: 'Crítico' };
const NIVEL_RIESGO_BADGE = {
  bajo:    'bg-blue-400/10 text-blue-300 border-blue-400/30',
  medio:   'bg-yellow-400/10 text-yellow-300 border-yellow-400/30',
  alto:    'bg-orange-400/10 text-orange-300 border-orange-400/30',
  critico: 'bg-red-400/10 text-red-300 border-red-400/30',
};

const ESTADOS_RIESGO = [
  { id: 'identificado',  label: 'Identificado' },
  { id: 'en_mitigacion', label: 'En mitigación' },
  { id: 'mitigado',      label: 'Mitigado' },
  { id: 'aceptado',      label: 'Aceptado' },
];
const ESTADO_RIESGO_LABELS = Object.fromEntries(ESTADOS_RIESGO.map((e) => [e.id, e.label]));
const ESTADO_RIESGO_BADGE = {
  identificado:  'bg-blue-400/10 text-blue-300 border-blue-400/30',
  en_mitigacion: 'bg-amber/10 text-amber-light border-amber/30',
  mitigado:      'bg-green-400/10 text-green-300 border-green-400/30',
  aceptado:      'bg-cream/10 text-cream/50 border-cream/20',
};

const TIPOS_RESPALDO = [
  { id: 'completo',    label: 'Completo' },
  { id: 'incremental', label: 'Incremental' },
  { id: 'snapshot',    label: 'Snapshot' },
];
const TIPO_RESPALDO_LABELS = Object.fromEntries(TIPOS_RESPALDO.map((t) => [t.id, t.label]));

const DESTINOS = [
  { id: 'droplet_local', label: 'Droplet (local)' },
  { id: 'snapshot_do',   label: 'Snapshot DigitalOcean' },
  { id: 'copia_externa', label: 'Copia externa (PC)' },
];
const DESTINO_LABELS = Object.fromEntries(DESTINOS.map((d) => [d.id, d.label]));

const ORIGEN_RESPALDO_LABELS = {
  script: 'Cron del Droplet', manual: 'Manual', simulado: 'Simulado', digitalocean: 'DigitalOcean (auto)',
};

// ----- Base de Conocimiento -----
const CATEGORIAS_KB = [
  { id: 'continuidad_servicio',   label: 'Continuidad del servicio' },
  { id: 'recuperacion_desastres', label: 'Recuperación ante desastres' },
  { id: 'respaldos',              label: 'Respaldos' },
  { id: 'monitoreo_eventos',      label: 'Monitoreo y eventos' },
  { id: 'gestion_incidencias',    label: 'Gestión de incidencias' },
  { id: 'runbook',                label: 'Runbook / procedimiento' },
];
const KB_LABELS = Object.fromEntries(CATEGORIAS_KB.map((c) => [c.id, c.label]));
const KB_BADGE = {
  continuidad_servicio:   'bg-blue-400/10 text-blue-300 border-blue-400/30',
  recuperacion_desastres: 'bg-red-400/10 text-red-300 border-red-400/30',
  respaldos:              'bg-green-400/10 text-green-300 border-green-400/30',
  monitoreo_eventos:      'bg-yellow-400/10 text-yellow-300 border-yellow-400/30',
  gestion_incidencias:    'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
  runbook:                'bg-purple-400/10 text-purple-300 border-purple-400/30',
};
// Categorías de incidente a las que puede vincularse un runbook (mismas del módulo de incidentes).
const CATEGORIAS_INCIDENTE = [
  { id: 'infraestructura', label: 'Infraestructura' },
  { id: 'aplicaciones',    label: 'Aplicaciones' },
  { id: 'base_datos',      label: 'Base de datos' },
  { id: 'redes',           label: 'Redes y comunicaciones' },
  { id: 'seguridad',       label: 'Seguridad' },
  { id: 'despliegue',      label: 'Despliegue / DevOps' },
  { id: 'rendimiento',     label: 'Rendimiento' },
  { id: 'integracion',     label: 'Integración de servicios' },
  { id: 'documentacion',   label: 'Documentación' },
  { id: 'otros',           label: 'Otros' },
];
const CAT_INC_LABELS = Object.fromEntries(CATEGORIAS_INCIDENTE.map((c) => [c.id, c.label]));

// Misma matriz que el backend (bajo=1, medio=2, alto=3; producto → nivel).
function nivelRiesgoDe(probabilidad, impacto) {
  const peso = { bajo: 1, medio: 2, alto: 3 };
  const score = (peso[probabilidad] ?? 2) * (peso[impacto] ?? 2);
  if (score >= 9) return 'critico';
  if (score >= 5) return 'alto';
  if (score >= 3) return 'medio';
  return 'bajo';
}

// "90" → "1 h 30 min" (para RTO/RPO legibles).
function formatMin(min) {
  if (min == null) return '—';
  if (min < 60) return `${min} min`;
  if (min < 1440) {
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
  }
  const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60);
  return h ? `${d} d ${h} h` : `${d} d`;
}

const TABS = [
  { id: 'servicios', label: 'Servicios críticos' },
  { id: 'riesgos',   label: 'Matriz de riesgos' },
  { id: 'respaldos', label: 'Respaldos' },
  { id: 'kb',        label: 'Base de conocimiento' },
];

export default function ContinuidadServicio() {
  const [resumen, setResumen] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [riesgos, setRiesgos] = useState([]);
  const [respaldos, setRespaldos] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [tab, setTab] = useState('servicios');
  const [vista, setVista] = useState('tabs'); // tabs | form-servicio | form-riesgo | form-respaldo | form-kb | kb-detalle
  const [editando, setEditando] = useState(null);
  const [articuloSel, setArticuloSel] = useState(null);
  const [ok, setOk] = useState(null);
  const [err, setErr] = useState(null);
  const [confirmando, setConfirmando] = useState(null); // { tipo, id }
  const [sincronizandoDO, setSincronizandoDO] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const cargar = async () => {
    try {
      const [res, srv, rgs, rsp, kb] = await Promise.all([
        resumenContinuidad(), listarServicios(), listarRiesgos(), listarRespaldos(), listarArticulosKB(),
      ]);
      setResumen(res); setServicios(srv); setRiesgos(rgs); setRespaldos(rsp); setArticulos(kb);
      setStatus('ready');
    } catch (e) {
      setLoadError(e.message); setStatus('error');
    }
  };

  useEffect(() => { cargar(); }, []);

  // Deep-link desde Gestión de Incidentes: /admin/gerencia/continuidad?kb=<id>
  // abre directamente el artículo sugerido (la estrategia documentada).
  useEffect(() => {
    const kbId = searchParams.get('kb');
    if (!kbId) return;
    setTab('kb');
    obtenerArticuloKB(kbId)
      .then((a) => { setArticuloSel(a); setVista('kb-detalle'); })
      .catch(() => {});
    setSearchParams({}, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const abrirArticulo = async (id) => {
    try {
      const a = await obtenerArticuloKB(id);  // suma una vista
      setArticuloSel(a); setVista('kb-detalle'); setErr(null); setOk(null);
      setArticulos((list) => list.map((x) => (x.id === a.id ? { ...x, vistas: a.vistas } : x)));
    } catch (e) { setErr(e.message || 'No se pudo abrir el artículo.'); }
  };

  const borrarArticulo = async (id) => {
    try {
      await eliminarArticuloKB(id);
      setArticulos((list) => list.filter((x) => x.id !== id));
      setArticuloSel(null); setVista('tabs'); setTab('kb');
      setOk({ texto: 'Artículo eliminado.' });
    } catch (e) { setErr(e.message || 'No se pudo eliminar.'); }
  };

  const borrar = async ({ tipo, id }) => {
    setErr(null);
    try {
      if (tipo === 'servicio') await eliminarServicio(id);
      if (tipo === 'riesgo') await eliminarRiesgo(id);
      await cargar();
    } catch (e) { setErr(e.message || 'No se pudo eliminar.'); }
    setConfirmando(null);
  };

  // Lee los backups/snapshots del Droplet desde la API de DO y registra los nuevos.
  const sincronizarDO = async () => {
    setSincronizandoDO(true); setErr(null); setOk(null);
    try {
      const r = await sincronizarRespaldosDO();
      setOk({ texto: r?.creados > 0
        ? `Sincronización con DigitalOcean: ${r.creados} respaldo(s) nuevo(s) registrado(s).`
        : 'Sincronización con DigitalOcean: sin respaldos nuevos (todo ya estaba registrado).' });
      await cargar();
    } catch (e) { setErr(e.message || 'No se pudo sincronizar con DigitalOcean.'); }
    setSincronizandoDO(false);
  };

  const abrirForm = (formVista, item = null) => {
    setEditando(item); setVista(formVista); setErr(null); setOk(null);
  };
  const cerrarForm = async (mensajeOk = null) => {
    if (mensajeOk) { setOk({ texto: mensajeOk }); await cargar(); }
    setVista('tabs'); setEditando(null);
  };

  // ---------------- VISTAS FORMULARIO ----------------
  if (vista === 'form-servicio') {
    return <ServicioForm servicio={editando} onVolver={() => cerrarForm()} onGuardado={(s) =>
      cerrarForm(`Servicio ${s.codigo} ${editando ? 'actualizado' : 'agregado al catálogo'}.`)} />;
  }
  if (vista === 'form-riesgo') {
    return <RiesgoForm riesgo={editando} servicios={servicios} onVolver={() => cerrarForm()} onGuardado={(r) =>
      cerrarForm(`Riesgo ${r.codigo} ${editando ? 'actualizado' : 'registrado'} (nivel ${NIVEL_RIESGO_LABELS[r.nivelRiesgo] ?? r.nivelRiesgo}).`)} />;
  }
  if (vista === 'form-respaldo') {
    return <RespaldoForm servicios={servicios} onVolver={() => cerrarForm()} onGuardado={(r) =>
      cerrarForm(`Respaldo ${r.codigo} registrado.`)} />;
  }
  if (vista === 'form-kb') {
    return <ArticuloForm articulo={editando} servicios={servicios} onVolver={() => cerrarForm()} onGuardado={(a) =>
      cerrarForm(`Artículo ${a.codigo} ${editando ? 'actualizado' : 'publicado'} en la Base de Conocimiento.`)} />;
  }
  if (vista === 'kb-detalle' && articuloSel) {
    return (
      <DetalleArticulo
        a={articuloSel}
        onVolver={() => { setVista('tabs'); setTab('kb'); setArticuloSel(null); }}
        onEditar={() => abrirForm('form-kb', articuloSel)}
        onEliminar={() => borrarArticulo(articuloSel.id)}
      />
    );
  }

  // ---------------- VISTA PRINCIPAL ----------------
  const accionTab = {
    servicios: <BotonPrimario onClick={() => abrirForm('form-servicio')}>+ Agregar servicio</BotonPrimario>,
    riesgos:   <BotonPrimario onClick={() => abrirForm('form-riesgo')}>+ Registrar riesgo</BotonPrimario>,
    respaldos: (
      <div className="flex gap-2">
        <button onClick={sincronizarDO} disabled={sincronizandoDO}
          className="rounded-full border border-amber/30 text-cream/80 px-4 py-2 text-[13px] hover:border-amber/60 hover:text-cream transition-colors disabled:opacity-50">
          {sincronizandoDO ? 'Sincronizando…' : '↻ Sincronizar con DigitalOcean'}
        </button>
        <BotonPrimario onClick={() => abrirForm('form-respaldo')}>+ Registrar respaldo</BotonPrimario>
      </div>
    ),
    kb: <BotonPrimario onClick={() => abrirForm('form-kb')}>+ Nuevo artículo</BotonPrimario>,
  };

  return (
    <section>
      <AdminHeader
        eyebrow="Dirección · Continuidad del Servicio"
        title="Continuidad y Recuperación (DRP)"
        subtitle="Catálogo de servicios críticos con RTO/RPO, matriz de riesgos y trazabilidad de respaldos (regla 3-2-1)"
        action={accionTab[tab]}
      />

      {ok && <div className="mt-6 p-3 rounded bg-green-400/10 text-green-300 text-[13px]">{ok.texto}</div>}
      {err && <div className="mt-6 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}
      {loadError && <div className="mt-6 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">No se pudo cargar el plan: {loadError}</div>}
      {status === 'loading' && <p className="mt-6 text-cream/60 text-[13px]">Cargando…</p>}

      {/* Resumen del plan: la tabla de "resultados esperados", en vivo */}
      {resumen && (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Servicios en el catálogo" value={resumen.totalServicios} tone="neutral" />
          <StatCard label="Criticidad alta / crítica" value={resumen.serviciosCriticidadAlta} tone="orange" />
          <StatCard label="Riesgos abiertos" value={resumen.riesgosAbiertos} tone="yellow" />
          <StatCard label="Cumplimiento RTO"
            value={resumen.porcentajeCumplimientoRto != null ? `${resumen.porcentajeCumplimientoRto}%` : '—'}
            tone={resumen.porcentajeCumplimientoRto == null ? 'neutral' : resumen.porcentajeCumplimientoRto >= 90 ? 'green' : 'red'} />
          <StatCard label="RTO vencido (activos)" value={resumen.incidentesActivosRtoVencido}
            tone={resumen.incidentesActivosRtoVencido > 0 ? 'red' : 'green'} />
        </div>
      )}

      {/* Semáforo RPO: último respaldo exitoso vs. objetivo, por servicio con datos */}
      {resumen?.estadoRpo?.length > 0 && (
        <div className="mt-6">
          <p className="text-[10px] tracking-[0.25em] uppercase text-amber/70 mb-3">Semáforo RPO (pérdida máxima de datos)</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {resumen.estadoRpo.map((r) => (
              <div key={r.servicioId}
                className={`rounded-xl border px-4 py-3.5 ${r.cumple ? 'border-green-400/25 bg-green-400/[0.04]' : 'border-red-400/25 bg-red-400/[0.04]'}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] text-cream font-medium truncate">{r.servicioNombre}</p>
                  <span className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-[10px] border ${r.cumple ? 'bg-green-400/10 text-green-300 border-green-400/30' : 'bg-red-400/10 text-red-300 border-red-400/30'}`}>
                    {r.cumple ? 'Dentro del RPO' : 'RPO en riesgo'}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] text-cream/60">
                  Objetivo: {formatMin(r.rpoObjetivoMinutos)} · Último respaldo:{' '}
                  {r.minutosDesdeUltimoRespaldo != null
                    ? <>hace {formatMin(r.minutosDesdeUltimoRespaldo)}</>
                    : <span className="text-red-300">nunca</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pestañas */}
      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setOk(null); setErr(null); }}
            className={`px-4 py-2 rounded-full text-[13px] border transition-colors ${tab === t.id ? 'bg-amber text-brown border-amber font-semibold' : 'bg-transparent text-cream/80 border-amber/25 hover:border-amber/60 hover:text-cream'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'servicios' && (
        <TablaServicios servicios={servicios} confirmando={confirmando}
          onEditar={(s) => abrirForm('form-servicio', s)}
          onConfirmar={setConfirmando} onBorrar={borrar} />
      )}
      {tab === 'riesgos' && (
        <TablaRiesgos riesgos={riesgos} confirmando={confirmando}
          onEditar={(r) => abrirForm('form-riesgo', r)}
          onConfirmar={setConfirmando} onBorrar={borrar} />
      )}
      {tab === 'respaldos' && <TablaRespaldos respaldos={respaldos} />}
      {tab === 'kb' && <TabBaseConocimiento articulos={articulos} onAbrir={abrirArticulo} />}
    </section>
  );
}

// ---------------- TAB: BASE DE CONOCIMIENTO ----------------
function TabBaseConocimiento({ articulos, onAbrir }) {
  const [filtro, setFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const normalizar = (s) => (s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const filtrados = useMemo(() => {
    let data = filtro ? articulos.filter((a) => a.categoria === filtro) : articulos;
    if (busqueda.trim()) {
      const q = normalizar(busqueda);
      data = data.filter((a) =>
        normalizar(a.titulo).includes(q) || normalizar(a.resumen).includes(q)
        || normalizar(a.contenido).includes(q) || normalizar(a.codigo).includes(q));
    }
    return data;
  }, [articulos, filtro, busqueda]);

  const conteo = (cat) => articulos.filter((a) => a.categoria === cat).length;

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2 items-center">
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar (ej. snapshot, RTO, 3-2-1, umbral…)"
          className="flex-1 min-w-[260px] px-4 py-2 rounded-full bg-bg-dark border border-amber/30 text-cream text-[13px] focus:border-amber focus:outline-none" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setFiltro('')}
          className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${filtro === '' ? 'bg-amber text-brown border-amber font-semibold' : 'text-cream/80 border-amber/25 hover:border-amber/60 hover:text-cream'}`}>
          Todas · {articulos.length}
        </button>
        {CATEGORIAS_KB.filter((c) => conteo(c.id) > 0).map((c) => (
          <button key={c.id} onClick={() => setFiltro(filtro === c.id ? '' : c.id)}
            className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${filtro === c.id ? 'bg-amber text-brown border-amber font-semibold' : 'text-cream/80 border-amber/25 hover:border-amber/60 hover:text-cream'}`}>
            {c.label} · {conteo(c.id)}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-8"><EmptyState titulo="Sin artículos" descripcion="No hay artículos que coincidan con la búsqueda." /></div>
      ) : (
        <div className="mt-6 grid md:grid-cols-2 gap-3">
          {filtrados.map((a) => (
            <button key={a.id} onClick={() => onAbrir(a.id)}
              className="text-left rounded-xl border border-amber/15 bg-amber/[0.03] px-5 py-4 hover:border-amber/40 transition-colors">
              <div className="flex items-center gap-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${KB_BADGE[a.categoria] ?? ''}`}>{KB_LABELS[a.categoria] ?? a.categoria}</span>
                <span className="font-mono text-[11px] text-cream/50">{a.codigo}</span>
              </div>
              <p className="mt-2 text-[15px] font-semibold text-cream leading-snug">{a.titulo}</p>
              {a.resumen && <p className="mt-1.5 text-[12px] text-cream/60 line-clamp-2">{a.resumen}</p>}
              <p className="mt-2.5 text-[11px] text-cream/45">
                👁 {a.vistas} · {formatFecha(a.fechaActualizacion)} · {a.autor || '—'}
                {a.servicioNombre && <> · {a.servicioNombre}</>}
              </p>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ---------------- DETALLE DE ARTÍCULO ----------------
function DetalleArticulo({ a, onVolver, onEditar, onEliminar }) {
  const [confirmando, setConfirmando] = useState(false);
  return (
    <section>
      <AdminHeader eyebrow={`Base de Conocimiento · ${KB_LABELS[a.categoria] ?? a.categoria}`}
        title={`${a.codigo} — ${a.titulo}`}
        subtitle={a.resumen || ''}
        action={<BotonVolver onClick={onVolver} />}
      />

      <div className="mt-6 flex flex-wrap items-center gap-2 text-[12px] text-cream/50">
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${KB_BADGE[a.categoria] ?? ''}`}>{KB_LABELS[a.categoria] ?? a.categoria}</span>
        {a.categoriaIncidente && (
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] border border-amber/25 text-cream/70">
            Aplica a incidentes de: {CAT_INC_LABELS[a.categoriaIncidente] ?? a.categoriaIncidente}
          </span>
        )}
        {a.servicioNombre && (
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] border border-amber/25 text-cream/70">
            Servicio: {a.servicioNombre}
          </span>
        )}
        <span>👁 {a.vistas} lecturas · Actualizado {formatFecha(a.fechaActualizacion)} · {a.autor || '—'}</span>
        <span className="flex-1" />
        <button onClick={onEditar}
          className="px-3 py-1.5 rounded-full text-[12px] border border-amber/30 text-amber-light hover:border-amber/60 hover:text-amber transition-colors">✎ Editar</button>
        {confirmando ? (
          <span className="flex items-center gap-2">
            <button onClick={onEliminar}
              className="px-3 py-1.5 rounded-full text-[12px] border border-red-400/50 bg-red-400/10 text-red-300 hover:bg-red-400/20 transition-colors">Confirmar eliminación</button>
            <button onClick={() => setConfirmando(false)}
              className="px-3 py-1.5 rounded-full text-[12px] border border-amber/20 text-cream/60 hover:text-cream transition-colors">Cancelar</button>
          </span>
        ) : (
          <button onClick={() => setConfirmando(true)}
            className="px-3 py-1.5 rounded-full text-[12px] border border-red-400/30 text-red-300/90 hover:border-red-400/60 hover:text-red-300 transition-colors">✕ Eliminar</button>
        )}
      </div>

      <Card title="Contenido" className="mt-6">
        <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed text-cream/85">{a.contenido}</pre>
      </Card>
    </section>
  );
}

// ---------------- FORM: ARTÍCULO KB ----------------
function ArticuloForm({ articulo, servicios, onVolver, onGuardado }) {
  const [form, setForm] = useState({
    titulo: articulo?.titulo ?? '',
    categoria: articulo?.categoria ?? 'runbook',
    resumen: articulo?.resumen ?? '',
    contenido: articulo?.contenido ?? '',
    autor: articulo?.autor ?? '',
    categoriaIncidente: articulo?.categoriaIncidente ?? '',
    servicioId: articulo?.servicioId ?? '',
  });
  const [enviando, setEnviando] = useState(false);
  const [err, setErr] = useState(null);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true); setErr(null);
    try {
      const payload = {
        titulo: form.titulo,
        categoria: form.categoria,
        resumen: form.resumen || null,
        contenido: form.contenido,
        autor: form.autor || null,
        categoriaIncidente: form.categoriaIncidente || (articulo ? '' : null),
        servicioId: form.servicioId ? Number(form.servicioId) : (articulo ? 0 : null),
      };
      const guardado = articulo
        ? await actualizarArticuloKB(articulo.id, payload)
        : await crearArticuloKB(payload);
      onGuardado(guardado);
    } catch (e2) { setErr(e2.message || 'No se pudo guardar.'); }
    setEnviando(false);
  };

  return (
    <section>
      <AdminHeader eyebrow="Base de Conocimiento"
        title={articulo ? `Editar ${articulo.codigo}` : 'Nuevo artículo'}
        subtitle="Planes, políticas y runbooks: la estrategia documentada que se sugiere en los incidentes"
        action={<BotonVolver onClick={onVolver} />}
      />
      <Card title="Datos del artículo" className="mt-8 max-w-4xl">
        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
          <Field label="Título" required className="sm:col-span-2">
            <input name="titulo" value={form.titulo} onChange={onChange} required maxLength={160} className={inputCls}
              placeholder="p. ej. Runbook: restaurar la base de datos desde el dump diario" />
          </Field>
          <Field label="Categoría" required>
            <select name="categoria" value={form.categoria} onChange={onChange} className={inputCls}>
              {CATEGORIAS_KB.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Autor">
            <input name="autor" value={form.autor} onChange={onChange} maxLength={150} className={inputCls} placeholder="Equipo TI Cat Jard" />
          </Field>
          <Field label="Resumen (bajada de la tarjeta)" className="sm:col-span-2">
            <textarea name="resumen" value={form.resumen} onChange={onChange} rows={2} maxLength={400} className={`${inputCls} resize-y`} />
          </Field>
          <Field label="Contenido (el plan o el paso a paso)" required className="sm:col-span-2">
            <textarea name="contenido" value={form.contenido} onChange={onChange} rows={14} required className={`${inputCls} resize-y font-mono text-[13px]`} />
          </Field>
          <Field label="Aplica a incidentes de (para las sugerencias)">
            <select name="categoriaIncidente" value={form.categoriaIncidente} onChange={onChange} className={inputCls}>
              <option value="">— No aplica a incidentes —</option>
              {CATEGORIAS_INCIDENTE.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Servicio del catálogo (opcional)">
            <select name="servicioId" value={form.servicioId} onChange={onChange} className={inputCls}>
              <option value="">— Sin servicio —</option>
              {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </Field>
          {err && <div className="sm:col-span-2 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}
          <BotonesForm enviando={enviando} onCancelar={onVolver} textoEnviar={articulo ? 'Guardar cambios' : 'Publicar artículo'} />
        </form>
      </Card>
    </section>
  );
}

// ---------------- TAB: SERVICIOS CRÍTICOS (Fases 1 y 3) ----------------
function TablaServicios({ servicios, confirmando, onEditar, onConfirmar, onBorrar }) {
  const [expandido, setExpandido] = useState(null);
  if (servicios.length === 0) {
    return <div className="mt-8"><EmptyState titulo="Catálogo vacío" descripcion="Agrega los servicios de Cat Jard con su criticidad y objetivos RTO/RPO." /></div>;
  }
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-amber/15">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
          <tr>
            <th className="px-5 py-4">Código</th>
            <th className="px-5 py-4">Servicio</th>
            <th className="px-5 py-4">Tipo</th>
            <th className="px-5 py-4">Criticidad</th>
            <th className="px-5 py-4">Prioridad</th>
            <th className="px-5 py-4">RTO</th>
            <th className="px-5 py-4">RPO</th>
            <th className="px-5 py-4"></th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((s) => (
            <FragmentoServicio key={s.id} s={s} expandido={expandido === s.id}
              onExpandir={() => setExpandido(expandido === s.id ? null : s.id)}
              confirmando={confirmando} onEditar={onEditar} onConfirmar={onConfirmar} onBorrar={onBorrar} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FragmentoServicio({ s, expandido, onExpandir, confirmando, onEditar, onConfirmar, onBorrar }) {
  const esConf = confirmando?.tipo === 'servicio' && confirmando?.id === s.id;
  return (
    <>
      <tr className={`border-t border-amber/10 hover:bg-amber/5 transition-colors ${s.activo ? '' : 'opacity-50'}`}>
        <td className="px-5 py-3 font-mono text-[12px] text-cream/85">{s.codigo}</td>
        <td className="px-5 py-3 text-cream font-medium">{s.nombre}{!s.activo && <span className="ml-2 text-[10px] text-cream/40">(inactivo)</span>}</td>
        <td className="px-5 py-3 text-cream/70">{TIPO_LABELS[s.tipo] ?? s.tipo}</td>
        <td className="px-5 py-3">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${CRIT_BADGE[s.criticidad] ?? ''}`}>{CRIT_LABELS[s.criticidad] ?? s.criticidad}</span>
        </td>
        <td className="px-5 py-3 text-cream/85">{s.prioridadRecuperacion}</td>
        <td className="px-5 py-3 text-cream/85 whitespace-nowrap">{formatMin(s.rtoMinutos)}</td>
        <td className="px-5 py-3 text-cream/85 whitespace-nowrap">{formatMin(s.rpoMinutos)}</td>
        <td className="px-5 py-3 text-right whitespace-nowrap">
          <button onClick={onExpandir} className="text-amber-light hover:text-amber underline underline-offset-4 text-[12px] mr-3">{expandido ? 'Ocultar' : 'Estrategia'}</button>
          <button onClick={() => onEditar(s)} className="text-amber-light hover:text-amber underline underline-offset-4 text-[12px] mr-3">Editar</button>
          {esConf ? (
            <span className="text-[12px]">
              <button onClick={() => onBorrar(confirmando)} className="text-red-300 hover:text-red-200 underline underline-offset-4 mr-2">Confirmar</button>
              <button onClick={() => onConfirmar(null)} className="text-cream/60 hover:text-cream">cancelar</button>
            </span>
          ) : (
            <button onClick={() => onConfirmar({ tipo: 'servicio', id: s.id })} className="text-red-300/80 hover:text-red-300 underline underline-offset-4 text-[12px]">Eliminar</button>
          )}
        </td>
      </tr>
      {expandido && (
        <tr className="border-t border-amber/10 bg-amber/[0.02]">
          <td colSpan={8} className="px-5 py-4">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
              <Info label="Descripción" className="sm:col-span-2">
                <span className="text-cream/80">{s.descripcion || '—'}</span>
              </Info>
              <Info label="Estrategia de continuidad (Fase 4/5)" className="sm:col-span-2">
                <span className="text-cream/80 whitespace-pre-wrap">{s.estrategiaContinuidad || '—'}</span>
              </Info>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ---------------- TAB: MATRIZ DE RIESGOS (Fase 2) ----------------
function TablaRiesgos({ riesgos, confirmando, onEditar, onConfirmar, onBorrar }) {
  if (riesgos.length === 0) {
    return <div className="mt-8"><EmptyState titulo="Sin riesgos registrados" descripcion="Registra los riesgos con su probabilidad, impacto y acción de mitigación." /></div>;
  }
  return (
    <div className="mt-6 grid gap-3">
      {riesgos.map((r) => {
        const esConf = confirmando?.tipo === 'riesgo' && confirmando?.id === r.id;
        return (
          <div key={r.id} className="rounded-xl border border-amber/15 bg-amber/[0.03] px-5 py-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-mono text-[12px] text-cream/60">{r.codigo}</span>
              <p className="text-[14px] text-cream font-medium flex-1 min-w-[200px]">{r.nombre}</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${NIVEL_RIESGO_BADGE[r.nivelRiesgo] ?? ''}`}>
                Nivel {NIVEL_RIESGO_LABELS[r.nivelRiesgo] ?? r.nivelRiesgo}
              </span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${ESTADO_RIESGO_BADGE[r.estado] ?? ''}`}>
                {ESTADO_RIESGO_LABELS[r.estado] ?? r.estado}
              </span>
            </div>
            <p className="mt-2 text-[12px] text-cream/60">
              Probabilidad <strong className="text-cream/85">{r.probabilidad}</strong> ·
              Impacto <strong className="text-cream/85"> {r.impacto}</strong>
              {r.descripcion && <> — {r.descripcion}</>}
            </p>
            {r.accionMitigacion && (
              <p className="mt-2 text-[12px] text-cream/70">
                <span className="text-amber/80 uppercase tracking-widest text-[10px] mr-2">Mitigación</span>
                {r.accionMitigacion}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {r.servicios?.map((s) => (
                <span key={s.id} className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${CRIT_BADGE[s.criticidad] ?? 'border-amber/25 text-cream/70'}`}>
                  {s.nombre}
                </span>
              ))}
              <span className="flex-1" />
              <button onClick={() => onEditar(r)}
                className="px-3 py-1.5 rounded-full text-[12px] border border-amber/30 text-amber-light hover:border-amber/60 hover:text-amber transition-colors">
                ✎ Editar
              </button>
              {esConf ? (
                <span className="flex items-center gap-2">
                  <button onClick={() => onBorrar(confirmando)}
                    className="px-3 py-1.5 rounded-full text-[12px] border border-red-400/50 bg-red-400/10 text-red-300 hover:bg-red-400/20 transition-colors">
                    Confirmar eliminación
                  </button>
                  <button onClick={() => onConfirmar(null)}
                    className="px-3 py-1.5 rounded-full text-[12px] border border-amber/20 text-cream/60 hover:text-cream hover:border-amber/40 transition-colors">
                    Cancelar
                  </button>
                </span>
              ) : (
                <button onClick={() => onConfirmar({ tipo: 'riesgo', id: r.id })}
                  className="px-3 py-1.5 rounded-full text-[12px] border border-red-400/30 text-red-300/90 hover:border-red-400/60 hover:text-red-300 transition-colors">
                  ✕ Eliminar
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------- TAB: RESPALDOS (Fase 5) ----------------
function TablaRespaldos({ respaldos }) {
  if (respaldos.length === 0) {
    return <div className="mt-8"><EmptyState titulo="Sin respaldos registrados" descripcion="El cron del Droplet registra aquí cada ejecución; también puedes registrar uno manual." /></div>;
  }
  return (
    <>
      <div className="mt-6 rounded-xl border border-amber/15 bg-amber/[0.03] px-5 py-3.5 text-[12px] text-cream/60">
        <strong className="text-cream/85">Regla 3-2-1:</strong> 3 copias (producción + dump + snapshot),
        2 medios (disco del Droplet + imagen DigitalOcean) y 1 copia fuera del proveedor (PC del equipo).
        Los respaldos con origen «Cron del Droplet» se registran automáticamente vía API.
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-amber/15">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
            <tr>
              <th className="px-5 py-4">Código</th>
              <th className="px-5 py-4">Fecha / hora</th>
              <th className="px-5 py-4">Recurso</th>
              <th className="px-5 py-4">Servicio</th>
              <th className="px-5 py-4">Tipo</th>
              <th className="px-5 py-4">Destino</th>
              <th className="px-5 py-4">Tamaño</th>
              <th className="px-5 py-4">Resultado</th>
              <th className="px-5 py-4">Origen</th>
            </tr>
          </thead>
          <tbody>
            {respaldos.map((r) => (
              <tr key={r.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                <td className="px-5 py-3 font-mono text-[12px] text-cream/85">{r.codigo}</td>
                <td className="px-5 py-3 text-cream/70 text-[12px] whitespace-nowrap">{formatFecha(r.fechaHora)}</td>
                <td className="px-5 py-3 text-cream">{r.recurso}</td>
                <td className="px-5 py-3 text-cream/70">{r.servicioNombre ?? '—'}</td>
                <td className="px-5 py-3 text-cream/70">{TIPO_RESPALDO_LABELS[r.tipo] ?? r.tipo}</td>
                <td className="px-5 py-3 text-cream/70 whitespace-nowrap">{DESTINO_LABELS[r.destino] ?? r.destino}</td>
                <td className="px-5 py-3 text-cream/70 whitespace-nowrap">{r.tamanoMb != null ? `${r.tamanoMb >= 1024 ? `${(r.tamanoMb / 1024).toFixed(1)} GB` : `${r.tamanoMb} MB`}` : '—'}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${r.estado === 'exitoso' ? 'bg-green-400/10 text-green-300 border-green-400/30' : 'bg-red-400/10 text-red-300 border-red-400/30'}`}>
                    {r.estado === 'exitoso' ? 'Exitoso' : 'Fallido'}
                  </span>
                </td>
                <td className="px-5 py-3 text-cream/60 text-[12px]">{ORIGEN_RESPALDO_LABELS[r.origen] ?? r.origen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ---------------- FORM: SERVICIO ----------------
function ServicioForm({ servicio, onVolver, onGuardado }) {
  const [form, setForm] = useState({
    nombre: servicio?.nombre ?? '',
    descripcion: servicio?.descripcion ?? '',
    tipo: servicio?.tipo ?? 'microservicio',
    criticidad: servicio?.criticidad ?? 'media',
    prioridadRecuperacion: servicio?.prioridadRecuperacion ?? 10,
    rtoMinutos: servicio?.rtoMinutos ?? '',
    rpoMinutos: servicio?.rpoMinutos ?? '',
    estrategiaContinuidad: servicio?.estrategiaContinuidad ?? '',
    activo: servicio?.activo ?? true,
  });
  const [enviando, setEnviando] = useState(false);
  const [err, setErr] = useState(null);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true); setErr(null);
    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        tipo: form.tipo,
        criticidad: form.criticidad,
        prioridadRecuperacion: Number(form.prioridadRecuperacion),
        rtoMinutos: form.rtoMinutos ? Number(form.rtoMinutos) : null,
        rpoMinutos: form.rpoMinutos ? Number(form.rpoMinutos) : null,
        estrategiaContinuidad: form.estrategiaContinuidad || null,
      };
      const guardado = servicio
        ? await actualizarServicio(servicio.id, { ...payload, activo: form.activo })
        : await crearServicio(payload);
      onGuardado(guardado);
    } catch (e2) { setErr(e2.message || 'No se pudo guardar.'); }
    setEnviando(false);
  };

  return (
    <section>
      <AdminHeader eyebrow="Dirección · Continuidad del Servicio"
        title={servicio ? `Editar ${servicio.codigo}` : 'Agregar servicio crítico'}
        subtitle="Fase 1 (identificación y criticidad) + Fase 3 (objetivos RTO y RPO)"
        action={<BotonVolver onClick={onVolver} />}
      />
      <Card title="Datos del servicio" className="mt-8 max-w-3xl">
        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre" required className="sm:col-span-2">
            <input name="nombre" value={form.nombre} onChange={onChange} required maxLength={120} className={inputCls} placeholder="p. ej. API Gateway" />
          </Field>
          <Field label="Tipo" required>
            <select name="tipo" value={form.tipo} onChange={onChange} className={inputCls}>
              {TIPOS_SERVICIO.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Criticidad" required>
            <select name="criticidad" value={form.criticidad} onChange={onChange} className={inputCls}>
              {CRITICIDADES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Prioridad de recuperación (1 = primero)" required>
            <input type="number" name="prioridadRecuperacion" value={form.prioridadRecuperacion} onChange={onChange} min={1} max={99} required className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="RTO (minutos)">
              <input type="number" name="rtoMinutos" value={form.rtoMinutos} onChange={onChange} min={1} className={inputCls} placeholder="60" />
            </Field>
            <Field label="RPO (minutos)">
              <input type="number" name="rpoMinutos" value={form.rpoMinutos} onChange={onChange} min={1} className={inputCls} placeholder="1440" />
            </Field>
          </div>
          <Field label="Descripción" className="sm:col-span-2">
            <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={2} className={`${inputCls} resize-y`} />
          </Field>
          <Field label="Estrategia de continuidad (HA / respaldos / mitigación)" className="sm:col-span-2">
            <textarea name="estrategiaContinuidad" value={form.estrategiaContinuidad} onChange={onChange} rows={3} className={`${inputCls} resize-y`} />
          </Field>
          {servicio && (
            <label className="sm:col-span-2 flex items-center gap-2 text-[13px] text-cream/80">
              <input type="checkbox" checked={form.activo}
                onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))} />
              Servicio activo en el plan
            </label>
          )}
          <p className="sm:col-span-2 text-[11px] text-cream/50">
            RPO vacío = servicio sin datos propios (p. ej. microservicios sin estado cuyos datos viven en la BD).
          </p>
          {err && <div className="sm:col-span-2 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}
          <BotonesForm enviando={enviando} onCancelar={onVolver} textoEnviar={servicio ? 'Guardar cambios' : 'Agregar al catálogo'} />
        </form>
      </Card>
    </section>
  );
}

// ---------------- FORM: RIESGO ----------------
function RiesgoForm({ riesgo, servicios, onVolver, onGuardado }) {
  const [form, setForm] = useState({
    nombre: riesgo?.nombre ?? '',
    descripcion: riesgo?.descripcion ?? '',
    probabilidad: riesgo?.probabilidad ?? 'medio',
    impacto: riesgo?.impacto ?? 'medio',
    accionMitigacion: riesgo?.accionMitigacion ?? '',
    estado: riesgo?.estado ?? 'identificado',
    servicioIds: riesgo?.servicios?.map((s) => s.id) ?? [],
  });
  const [enviando, setEnviando] = useState(false);
  const [err, setErr] = useState(null);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const toggleServicio = (id) => setForm((f) => ({
    ...f,
    servicioIds: f.servicioIds.includes(id) ? f.servicioIds.filter((x) => x !== id) : [...f.servicioIds, id],
  }));

  const nivel = nivelRiesgoDe(form.probabilidad, form.impacto);

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true); setErr(null);
    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        probabilidad: form.probabilidad,
        impacto: form.impacto,
        accionMitigacion: form.accionMitigacion || null,
        servicioIds: form.servicioIds,
      };
      const guardado = riesgo
        ? await actualizarRiesgo(riesgo.id, { ...payload, estado: form.estado })
        : await crearRiesgo(payload);
      onGuardado(guardado);
    } catch (e2) { setErr(e2.message || 'No se pudo guardar.'); }
    setEnviando(false);
  };

  return (
    <section>
      <AdminHeader eyebrow="Dirección · Continuidad del Servicio"
        title={riesgo ? `Editar ${riesgo.codigo}` : 'Registrar riesgo'}
        subtitle="Fase 2 — Análisis de riesgos: Riesgo · Probabilidad · Impacto · Acción de mitigación"
        action={<BotonVolver onClick={onVolver} />}
      />
      <Card title="Datos del riesgo" className="mt-8 max-w-3xl">
        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
          <Field label="Riesgo" required className="sm:col-span-2">
            <input name="nombre" value={form.nombre} onChange={onChange} required maxLength={160} className={inputCls} placeholder="p. ej. Caída del Droplet" />
          </Field>
          <Field label="Probabilidad" required>
            <select name="probabilidad" value={form.probabilidad} onChange={onChange} className={inputCls}>
              {NIVELES.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </Field>
          <Field label="Impacto" required>
            <select name="impacto" value={form.impacto} onChange={onChange} className={inputCls}>
              {NIVELES.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2 rounded-xl border border-amber/15 bg-amber/[0.03] px-4 py-3 text-[12px] text-cream/70 flex items-center gap-3">
            Nivel de riesgo derivado (matriz Probabilidad × Impacto):
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${NIVEL_RIESGO_BADGE[nivel]}`}>{NIVEL_RIESGO_LABELS[nivel]}</span>
          </div>
          {riesgo && (
            <Field label="Estado">
              <select name="estado" value={form.estado} onChange={onChange} className={inputCls}>
                {ESTADOS_RIESGO.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
          )}
          <Field label="Descripción" className="sm:col-span-2">
            <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={2} className={`${inputCls} resize-y`} />
          </Field>
          <Field label="Acción de mitigación" className="sm:col-span-2">
            <textarea name="accionMitigacion" value={form.accionMitigacion} onChange={onChange} rows={3} className={`${inputCls} resize-y`} />
          </Field>
          <Field label="Servicios afectados" className="sm:col-span-2">
            <div className="grid sm:grid-cols-2 gap-2">
              {servicios.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-[13px] text-cream/80">
                  <input type="checkbox" checked={form.servicioIds.includes(s.id)} onChange={() => toggleServicio(s.id)} />
                  <span className="truncate">{s.nombre}</span>
                  <span className={`shrink-0 inline-block px-1.5 py-0.5 rounded-full text-[9px] border ${CRIT_BADGE[s.criticidad] ?? ''}`}>{CRIT_LABELS[s.criticidad] ?? s.criticidad}</span>
                </label>
              ))}
            </div>
          </Field>
          {err && <div className="sm:col-span-2 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}
          <BotonesForm enviando={enviando} onCancelar={onVolver} textoEnviar={riesgo ? 'Guardar cambios' : 'Registrar riesgo'} />
        </form>
      </Card>
    </section>
  );
}

// ---------------- FORM: RESPALDO MANUAL ----------------
function RespaldoForm({ servicios, onVolver, onGuardado }) {
  const [form, setForm] = useState({
    recurso: '', tipo: 'completo', destino: 'droplet_local', estado: 'exitoso',
    servicioId: '', tamanoMb: '', duracionSeg: '', mensaje: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [err, setErr] = useState(null);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true); setErr(null);
    try {
      const creado = await registrarRespaldo({
        recurso: form.recurso,
        tipo: form.tipo,
        destino: form.destino,
        estado: form.estado,
        servicioId: form.servicioId ? Number(form.servicioId) : null,
        tamanoMb: form.tamanoMb ? Number(form.tamanoMb) : null,
        duracionSeg: form.duracionSeg ? Number(form.duracionSeg) : null,
        mensaje: form.mensaje || null,
      });
      onGuardado(creado);
    } catch (e2) { setErr(e2.message || 'No se pudo registrar.'); }
    setEnviando(false);
  };

  return (
    <section>
      <AdminHeader eyebrow="Dirección · Continuidad del Servicio"
        title="Registrar respaldo"
        subtitle="Fase 5 — registro manual (p. ej. un snapshot tomado desde el panel de DigitalOcean)"
        action={<BotonVolver onClick={onVolver} />}
      />
      <Card title="Datos del respaldo" className="mt-8 max-w-3xl">
        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
          <Field label="Recurso respaldado" required className="sm:col-span-2">
            <input name="recurso" value={form.recurso} onChange={onChange} required maxLength={160} className={inputCls} placeholder="p. ej. Droplet completo (imagen)" />
          </Field>
          <Field label="Tipo" required>
            <select name="tipo" value={form.tipo} onChange={onChange} className={inputCls}>
              {TIPOS_RESPALDO.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Destino (regla 3-2-1)" required>
            <select name="destino" value={form.destino} onChange={onChange} className={inputCls}>
              {DESTINOS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </Field>
          <Field label="Resultado" required>
            <select name="estado" value={form.estado} onChange={onChange} className={inputCls}>
              <option value="exitoso">Exitoso</option>
              <option value="fallido">Fallido</option>
            </select>
          </Field>
          <Field label="Servicio del catálogo (para el semáforo RPO)">
            <select name="servicioId" value={form.servicioId} onChange={onChange} className={inputCls}>
              <option value="">— Sin asociar —</option>
              {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tamaño (MB)">
              <input type="number" step="any" name="tamanoMb" value={form.tamanoMb} onChange={onChange} min={0} className={inputCls} />
            </Field>
            <Field label="Duración (seg)">
              <input type="number" name="duracionSeg" value={form.duracionSeg} onChange={onChange} min={0} className={inputCls} />
            </Field>
          </div>
          <Field label="Nota" className="sm:col-span-2">
            <input name="mensaje" value={form.mensaje} onChange={onChange} maxLength={255} className={inputCls} placeholder="p. ej. Snapshot semanal antes del despliegue" />
          </Field>
          {err && <div className="sm:col-span-2 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>}
          <BotonesForm enviando={enviando} onCancelar={onVolver} textoEnviar="Registrar respaldo" />
        </form>
      </Card>
    </section>
  );
}

// ---------------- componentes auxiliares ----------------
const inputCls =
  'w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none';

function BotonPrimario({ onClick, children }) {
  return (
    <button onClick={onClick}
      className="rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors">
      {children}
    </button>
  );
}
function BotonVolver({ onClick }) {
  return (
    <button onClick={onClick}
      className="rounded-full border border-amber/30 text-cream/80 px-4 py-2 text-[13px] hover:border-amber/60 hover:text-cream transition-colors">
      ← Volver
    </button>
  );
}
function BotonesForm({ enviando, onCancelar, textoEnviar }) {
  return (
    <div className="sm:col-span-2 flex gap-3">
      <button type="submit" disabled={enviando}
        className="px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors disabled:opacity-50">
        {enviando ? 'Guardando…' : textoEnviar}
      </button>
      <button type="button" onClick={onCancelar} className="px-4 py-2.5 rounded-full text-cream/70 text-[13px] hover:text-cream">Cancelar</button>
    </div>
  );
}
function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[11px] tracking-[0.2em] uppercase text-amber mb-1.5">{label}{required && <span className="text-amber-light/60 ml-1">*</span>}</label>
      {children}
    </div>
  );
}
function Info({ label, children, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[10px] tracking-[0.2em] uppercase text-amber/70">{label}</p>
      <p className="text-cream mt-0.5">{children}</p>
    </div>
  );
}

const TONES = {
  neutral: 'border-amber/20 text-cream',
  yellow: 'border-yellow-400/40 text-yellow-300',
  orange: 'border-orange-400/40 text-orange-300',
  red: 'border-red-400/40 text-red-300',
  green: 'border-green-400/40 text-green-300',
};
function StatCard({ label, value, tone }) {
  return (
    <div className={`rounded-xl border bg-amber/[0.03] px-4 py-4 ${TONES[tone] ?? TONES.neutral}`}>
      <p className="text-[26px] font-black leading-none">{value}</p>
      <p className="text-[11px] text-cream/60 mt-1">{label}</p>
    </div>
  );
}

function formatFecha(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return iso; }
}

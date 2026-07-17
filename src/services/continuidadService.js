import { apiClient } from './apiClient.js';

// Gestión de Continuidad del Servicio y DRP: catálogo de servicios críticos
// (RTO/RPO), matriz de riesgos, registro de respaldos (regla 3-2-1) y resumen
// de cumplimiento en vivo (contador RTO de incidentes + semáforo RPO).

// Tablero resumen del plan (cumplimiento RTO medido + estado RPO por servicio).
export function resumenContinuidad() {
  return apiClient.get('/continuidad/resumen');
}

// ----- Fase 1/3: catálogo de servicios críticos -----

export function listarServicios() {
  return apiClient.get('/continuidad/servicios');
}
export function crearServicio(payload) {
  return apiClient.post('/continuidad/servicios', payload);
}
export function actualizarServicio(id, cambios) {
  return apiClient.patch(`/continuidad/servicios/${id}`, cambios);
}
export function eliminarServicio(id) {
  return apiClient.del(`/continuidad/servicios/${id}`);
}

// ----- Fase 2: matriz de riesgos -----

export function listarRiesgos() {
  return apiClient.get('/continuidad/riesgos');
}
export function crearRiesgo(payload) {
  return apiClient.post('/continuidad/riesgos', payload);
}
export function actualizarRiesgo(id, cambios) {
  return apiClient.patch(`/continuidad/riesgos/${id}`, cambios);
}
export function eliminarRiesgo(id) {
  return apiClient.del(`/continuidad/riesgos/${id}`);
}

// ----- Fase 5: registro de respaldos -----

export function listarRespaldos() {
  return apiClient.get('/continuidad/respaldos');
}
// Registro manual desde el panel (p. ej. un snapshot tomado a mano).
export function registrarRespaldo(payload) {
  return apiClient.post('/continuidad/respaldos', payload);
}
// Trae los backups automáticos y snapshots del Droplet desde la API de
// DigitalOcean (idempotente: no duplica los ya registrados).
export function sincronizarRespaldosDO() {
  return apiClient.post('/continuidad/respaldos/sync-do');
}
// Descarga la "1" de la regla 3-2-1: un ZIP con el pg_dump de las 7 BDs al equipo.
// Devuelve { blob, filename }; queda registrado como respaldo (copia externa).
export function exportarRespaldoLocal() {
  return apiClient.download('/continuidad/respaldos/exportar');
}

// ----- Base de Conocimiento (planes, políticas y runbooks) -----

export function listarArticulosKB({ categoria, q } = {}) {
  const params = new URLSearchParams();
  if (categoria) params.set('categoria', categoria);
  if (q) params.set('q', q);
  const qs = params.toString();
  return apiClient.get(`/continuidad/kb${qs ? `?${qs}` : ''}`);
}
// Abrir un artículo suma una vista (métrica de uso).
export function obtenerArticuloKB(id) {
  return apiClient.get(`/continuidad/kb/${id}`);
}
// Estrategias documentadas que aplican a un incidente (categoría y/o servicio).
export function sugerenciasKB({ categoriaIncidente, servicioId } = {}) {
  const params = new URLSearchParams();
  if (categoriaIncidente) params.set('categoriaIncidente', categoriaIncidente);
  if (servicioId) params.set('servicioId', servicioId);
  const qs = params.toString();
  return apiClient.get(`/continuidad/kb/sugerencias${qs ? `?${qs}` : ''}`);
}
export function crearArticuloKB(payload) {
  return apiClient.post('/continuidad/kb', payload);
}
export function actualizarArticuloKB(id, cambios) {
  return apiClient.patch(`/continuidad/kb/${id}`, cambios);
}
export function eliminarArticuloKB(id) {
  return apiClient.del(`/continuidad/kb/${id}`);
}

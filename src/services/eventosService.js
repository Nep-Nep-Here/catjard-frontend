import { apiClient } from './apiClient.js';

// Monitoreo Estratégico y Gestión de Eventos: eventos del Droplet (API DigitalOcean),
// clasificación por severidad, incidentes auto-generados y escalamiento opcional a Jira.

export function listarEventos({ severidad, estado } = {}) {
  const params = new URLSearchParams();
  if (severidad) params.set('severidad', severidad);
  if (estado) params.set('estado', estado);
  const qs = params.toString();
  return apiClient.get(`/eventos${qs ? `?${qs}` : ''}`);
}

export function obtenerEvento(id) {
  return apiClient.get(`/eventos/${id}`);
}

// Lecturas en vivo de las métricas del Droplet (gauges del panel).
export function metricasActuales() {
  return apiClient.get('/eventos/metricas');
}

// Políticas de alerta configuradas en el panel de DigitalOcean.
export function alertasDigitalOcean() {
  return apiClient.get('/eventos/alertas-do');
}

// Fuerza una lectura de métricas ahora (sin esperar al scheduler del backend).
export function sincronizarEventos() {
  return apiClient.post('/eventos/sync');
}

// Simula una lectura (demo): pasa por el mismo pipeline que las lecturas reales.
export function simularEvento(payload) {
  return apiClient.post('/eventos/simular', payload);
}

// Botón "Enviar a Jira": escala el incidente vinculado al tablero GDICJ.
export function enviarEventoAJira(id) {
  return apiClient.post(`/eventos/${id}/enviar-jira`);
}

// Gestionar el evento en el panel: estado / responsable / plan de respuesta.
export function actualizarEvento(id, cambios) {
  return apiClient.patch(`/eventos/${id}`, cambios);
}

export function eliminarEvento(id) {
  return apiClient.del(`/eventos/${id}`);
}

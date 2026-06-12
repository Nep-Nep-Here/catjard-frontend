import { apiClient } from './apiClient.js';

// Mesa de ayuda / tickets (servicio, informacion, acceso) + integracion Jira.

// El usuario abre una solicitud desde la pagina de Ayuda.
export function crearSolicitud(payload) {
  return apiClient.post('/solicitudes', payload);
}

// El usuario ve sus propias solicitudes.
export function listarMisSolicitudes() {
  return apiClient.get('/solicitudes/mias');
}

// El admin (gerente) ve todas; permite filtrar por estado o tipo.
export function listarSolicitudes({ estado, tipo } = {}) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  if (tipo) params.set('tipo', tipo);
  const qs = params.toString();
  return apiClient.get(`/solicitudes${qs ? `?${qs}` : ''}`);
}

export function obtenerSolicitud(id) {
  return apiClient.get(`/solicitudes/${id}`);
}

// El admin avanza estado, ajusta prioridad y/o responde (se refleja en Jira).
export function actualizarSolicitud(id, cambios) {
  return apiClient.patch(`/solicitudes/${id}`, cambios);
}

export function eliminarSolicitud(id) {
  return apiClient.del(`/solicitudes/${id}`);
}

// Sincroniza ahora los estados con Jira (Jira es la fuente de verdad del estado).
export function sincronizarSolicitudes() {
  return apiClient.post('/solicitudes/sync');
}

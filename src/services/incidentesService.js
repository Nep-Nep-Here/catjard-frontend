import { apiClient } from './apiClient.js';

// Gestion de Incidentes: registro + clasificacion + priorizacion (matriz) + diagnostico + cierre (Jira).

export function listarIncidentes({ estado } = {}) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  const qs = params.toString();
  return apiClient.get(`/incidentes${qs ? `?${qs}` : ''}`);
}

export function obtenerIncidente(id) {
  return apiClient.get(`/incidentes/${id}`);
}

// Registrar un incidente (la prioridad la calcula el backend con la matriz Impacto x Urgencia).
export function crearIncidente(payload) {
  return apiClient.post('/incidentes', payload);
}

// Diagnosticar / resolver / cerrar y avanzar el flujo.
export function actualizarIncidente(id, cambios) {
  return apiClient.patch(`/incidentes/${id}`, cambios);
}

export function eliminarIncidente(id) {
  return apiClient.del(`/incidentes/${id}`);
}

// Sincroniza ahora los estados con el tablero GDICJ en Jira.
export function sincronizarIncidentes() {
  return apiClient.post('/incidentes/sync');
}

import { apiClient } from './apiClient.js';

// Control de Cambios: plan tipo formulario + flujo de aprobacion + integracion continua (Jira).

export function listarCambios({ estado } = {}) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  const qs = params.toString();
  return apiClient.get(`/cambios${qs ? `?${qs}` : ''}`);
}

export function obtenerCambio(id) {
  return apiClient.get(`/cambios/${id}`);
}

// Solicitar un cambio (formulario del plan).
export function crearCambio(payload) {
  return apiClient.post('/cambios', payload);
}

// Evaluar / aprobar / rechazar y avanzar la CI.
export function actualizarCambio(id, cambios) {
  return apiClient.patch(`/cambios/${id}`, cambios);
}

export function eliminarCambio(id) {
  return apiClient.del(`/cambios/${id}`);
}

// Sincroniza ahora los estados con el tablero del equipo de sistemas en Jira.
export function sincronizarCambios() {
  return apiClient.post('/cambios/sync');
}

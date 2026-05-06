import { apiClient } from './apiClient.js';

export function listarLeads({ estado } = {}) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  const qs = params.toString();
  return apiClient.get(`/leads${qs ? `?${qs}` : ''}`);
}

export function obtenerLead(id) {
  return apiClient.get(`/leads/${id}`);
}

export function crearLeadApi(lead) {
  return apiClient.post('/leads', lead, { auth: false });
}

export function actualizarLeadApi(id, cambios) {
  return apiClient.patch(`/leads/${id}`, cambios);
}

export function convertirLeadApi(id, payload) {
  return apiClient.post(`/leads/${id}/convertir`, payload);
}

export function eliminarLeadApi(id) {
  return apiClient.del(`/leads/${id}`);
}

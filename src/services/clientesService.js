import { apiClient } from './apiClient.js';

export function listarClientes({ activos } = {}) {
  const params = new URLSearchParams();
  if (activos !== undefined) params.set('activos', activos);
  const qs = params.toString();
  return apiClient.get(`/clientes${qs ? `?${qs}` : ''}`);
}

export function obtenerCliente(id) {
  return apiClient.get(`/clientes/${id}`);
}

export function obtenerClientePorRuc(ruc) {
  return apiClient.get(`/clientes/ruc/${ruc}`);
}

export function crearClienteApi(cliente) {
  return apiClient.post('/clientes', cliente);
}

export function actualizarClienteApi(id, cambios) {
  return apiClient.patch(`/clientes/${id}`, cambios);
}

export function eliminarClienteApi(id) {
  return apiClient.del(`/clientes/${id}`);
}

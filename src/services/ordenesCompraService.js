import { apiClient } from './apiClient.js';

export function listarOC({ estado, proveedorId } = {}) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  if (proveedorId) params.set('proveedorId', proveedorId);
  const qs = params.toString();
  return apiClient.get(`/ordenes-compra${qs ? `?${qs}` : ''}`);
}

export function obtenerOC(id) {
  return apiClient.get(`/ordenes-compra/${id}`);
}

export function crearOCApi(payload) {
  return apiClient.post('/ordenes-compra', payload);
}

export function enviarOCApi(id) {
  return apiClient.post(`/ordenes-compra/${id}/enviar`);
}

export function recibirOCApi(id, usuario) {
  return apiClient.post(`/ordenes-compra/${id}/recibir`, { usuario });
}

export function cancelarOCApi(id) {
  return apiClient.post(`/ordenes-compra/${id}/cancelar`);
}

export function eliminarOCApi(id) {
  return apiClient.del(`/ordenes-compra/${id}`);
}

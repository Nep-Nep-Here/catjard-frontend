import { apiClient } from './apiClient.js';

export function listarProveedores({ activos } = {}) {
  const params = new URLSearchParams();
  if (activos !== undefined) params.set('activos', activos);
  const qs = params.toString();
  return apiClient.get(`/proveedores${qs ? `?${qs}` : ''}`);
}

export function obtenerProveedor(id) {
  return apiClient.get(`/proveedores/${id}`);
}

export function crearProveedorApi(payload) {
  return apiClient.post('/proveedores', payload);
}

export function actualizarProveedorApi(id, cambios) {
  return apiClient.patch(`/proveedores/${id}`, cambios);
}

export function eliminarProveedorApi(id) {
  return apiClient.del(`/proveedores/${id}`);
}

import { apiClient } from './apiClient.js';

export function listarCotizaciones({ estado, clienteId } = {}) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  if (clienteId !== undefined && clienteId !== null) params.set('clienteId', clienteId);
  const qs = params.toString();
  return apiClient.get(`/cotizaciones${qs ? `?${qs}` : ''}`);
}

export function obtenerCotizacion(id) {
  return apiClient.get(`/cotizaciones/${id}`);
}

export function crearCotizacionApi(payload) {
  return apiClient.post('/cotizaciones', payload);
}

export function actualizarCotizacionApi(id, cambios) {
  return apiClient.patch(`/cotizaciones/${id}`, cambios);
}

export function aprobarCotizacionApi(id) {
  return apiClient.post(`/cotizaciones/${id}/aprobar`);
}

export function rechazarCotizacionApi(id, motivo) {
  return apiClient.post(`/cotizaciones/${id}/rechazar`, { motivo });
}

export function eliminarCotizacionApi(id) {
  return apiClient.del(`/cotizaciones/${id}`);
}

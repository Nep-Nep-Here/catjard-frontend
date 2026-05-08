import { apiClient } from './apiClient.js';

export function listarMovimientos({ tipo, productoId, referencia } = {}) {
  const params = new URLSearchParams();
  if (tipo) params.set('tipo', tipo);
  if (productoId) params.set('productoId', productoId);
  if (referencia) params.set('referencia', referencia);
  const qs = params.toString();
  return apiClient.get(`/movimientos${qs ? `?${qs}` : ''}`);
}

export function crearMovimientoApi(payload) {
  return apiClient.post('/movimientos', payload);
}

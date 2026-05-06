import { apiClient } from './apiClient.js';

export function listarTrackingPorPedido(pedidoCodigo) {
  return apiClient.get(`/tracking/pedido/${pedidoCodigo}`);
}

export function marcarHitoApi(pedidoCodigo, { hito, fecha, observacion } = {}) {
  return apiClient.post(`/tracking/pedido/${pedidoCodigo}`, { hito, fecha, observacion });
}

import { apiClient } from './apiClient.js';

export function listarArtesPorPedido(pedidoCodigo) {
  return apiClient.get(`/artes/pedido/${pedidoCodigo}`);
}

export function obtenerArte(id) {
  return apiClient.get(`/artes/${id}`);
}

export function subirArteApi(pedidoCodigo, nombreArchivo) {
  return apiClient.post(`/artes/pedido/${pedidoCodigo}`, { nombreArchivo });
}

export function aprobarArteApi(id, comentariosCliente) {
  return apiClient.post(`/artes/${id}/aprobar`, { comentariosCliente: comentariosCliente ?? '' });
}

export function rechazarArteApi(id, comentariosCliente) {
  return apiClient.post(`/artes/${id}/rechazar`, { comentariosCliente: comentariosCliente ?? '' });
}

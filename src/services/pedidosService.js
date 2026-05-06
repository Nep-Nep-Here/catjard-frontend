import { apiClient } from './apiClient.js';

export function listarPedidos({ estado, clienteId } = {}) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  if (clienteId !== undefined && clienteId !== null) params.set('clienteId', clienteId);
  const qs = params.toString();
  return apiClient.get(`/pedidos${qs ? `?${qs}` : ''}`);
}

export function obtenerPedido(id) {
  return apiClient.get(`/pedidos/${id}`);
}

export function obtenerPedidoPorCodigo(codigo) {
  return apiClient.get(`/pedidos/codigo/${codigo}`);
}

export function actualizarPedidoApi(id, cambios) {
  return apiClient.patch(`/pedidos/${id}`, cambios);
}

export function subirVoucherApi(id, voucherUrl) {
  return apiClient.post(`/pedidos/${id}/voucher`, { voucherUrl });
}

export function eliminarPedidoApi(id) {
  return apiClient.del(`/pedidos/${id}`);
}

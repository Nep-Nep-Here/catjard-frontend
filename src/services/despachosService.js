import { apiClient } from './apiClient.js';

export function listarDespachos() {
  return apiClient.get('/despachos');
}

export function obtenerDespachoPorPedido(codigo) {
  return apiClient.get(`/despachos/pedido/${codigo}`);
}

export function crearDespacho({ pedidoCodigo, courier, guiaRemision, fechaDespacho, direccionEntrega, notas }) {
  return apiClient.post('/despachos', {
    pedidoCodigo,
    courier,
    guiaRemision,
    fechaDespacho,
    direccionEntrega,
    notas,
  });
}

export function marcarDespachoEntregado(codigo, { fechaEntregaReal, receptor, notas } = {}) {
  return apiClient.post(`/despachos/pedido/${codigo}/entregar`, {
    fechaEntregaReal,
    receptor,
    notas,
  });
}

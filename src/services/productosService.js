import { apiClient } from './apiClient.js';

export function listarProductos({ categoria, q } = {}) {
  const params = new URLSearchParams();
  if (categoria) params.set('categoria', categoria);
  if (q) params.set('q', q);
  const qs = params.toString();
  return apiClient.get(`/productos${qs ? `?${qs}` : ''}`, { auth: false });
}

export function obtenerProducto(id) {
  return apiClient.get(`/productos/${id}`, { auth: false });
}

export function obtenerProductoPorSlug(slug) {
  return apiClient.get(`/productos/slug/${slug}`, { auth: false });
}

export function crearProductoApi(producto) {
  return apiClient.post('/productos', producto);
}

export function actualizarProductoApi(id, cambios) {
  return apiClient.patch(`/productos/${id}`, cambios);
}

export function actualizarStockApi(id, { stock, delta } = {}) {
  return apiClient.patch(`/productos/${id}/stock`, { stock, delta });
}

export function eliminarProductoApi(id) {
  return apiClient.del(`/productos/${id}`);
}

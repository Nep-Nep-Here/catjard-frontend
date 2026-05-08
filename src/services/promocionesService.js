import { apiClient } from './apiClient.js';

export function listarPromociones() {
  return apiClient.get('/promociones');
}

export function listarPromocionesActivas() {
  return apiClient.get('/promociones/activas', { auth: false });
}

export function obtenerPromocion(id) {
  return apiClient.get(`/promociones/${id}`);
}

export function crearPromocionApi(payload) {
  return apiClient.post('/promociones', payload);
}

export function actualizarPromocionApi(id, cambios) {
  return apiClient.patch(`/promociones/${id}`, cambios);
}

export function eliminarPromocionApi(id) {
  return apiClient.del(`/promociones/${id}`);
}

export function toFormDePromocion(dto) {
  return {
    id: dto.id,
    nombre: dto.nombre ?? '',
    descripcion: dto.descripcion ?? '',
    descuentoPct: dto.descuentoPct ?? 0,
    desde: dto.desde ?? '',
    hasta: dto.hasta ?? '',
    aplicaA: dto.aplicaA ?? 'todo',
    aplicaValor:
      dto.aplicaA === 'producto'
        ? Number(dto.aplicaValor) || null
        : dto.aplicaValor ?? null,
    activa: !!dto.activa,
  };
}

export function toPayloadDePromocion(form) {
  const base = {
    nombre: form.nombre,
    descripcion: form.descripcion || null,
    descuentoPct: form.descuentoPct,
    desde: form.desde,
    hasta: form.hasta,
    aplicaA: form.aplicaA,
    activa: !!form.activa,
  };
  if (form.aplicaA === 'categoria') {
    return { ...base, categoriaAplica: form.aplicaValor, productoId: null };
  }
  if (form.aplicaA === 'producto') {
    return { ...base, categoriaAplica: null, productoId: Number(form.aplicaValor) || null };
  }
  return { ...base, categoriaAplica: null, productoId: null };
}

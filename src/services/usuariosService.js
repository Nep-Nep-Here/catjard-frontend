import { apiClient } from './apiClient.js';

// CRUD de usuarios — identity-service, /api/usuarios (solo rol gerente).
// RF-D-01. Backend: UsuarioController.

export function listarUsuarios() {
  return apiClient.get('/usuarios');
}

export function obtenerUsuario(id) {
  return apiClient.get(`/usuarios/${id}`);
}

// CrearUsuarioDTO espera: email, password, rol, nombre, empresa, ruc,
// telefono, direccion, cargo, clienteId.
export function crearUsuarioApi(payload) {
  return apiClient.post('/usuarios', payload);
}

// ActualizarUsuarioDTO solo acepta: nombre, empresa, ruc, telefono,
// direccion, cargo (no email/rol/password).
export function actualizarUsuarioApi(id, cambios) {
  return apiClient.patch(`/usuarios/${id}`, cambios);
}

export function eliminarUsuarioApi(id) {
  return apiClient.del(`/usuarios/${id}`);
}

// RF-D-02: alta de usuario-cliente al convertir un lead (vendedor/gerente).
export function crearClienteDesdeLeadApi(payload) {
  return apiClient.post('/usuarios/cliente-from-lead', payload);
}

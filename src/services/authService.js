import { apiClient, setToken, clearToken, decodeJwt } from './apiClient.js';

export async function login({ email, password }) {
  let res;
  try {
    res = await apiClient.post('/auth/login', { email, password }, { auth: false });
  } catch (e) {
    if (e.status === 401 || e.status === 403) {
      throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
    }
    throw e;
  }

  const token = res?.token || res?.accessToken || res?.jwt;
  if (!token) throw new Error('Respuesta del servidor sin token.');
  setToken(token);

  let user = res?.user;
  if (!user) {
    const claims = decodeJwt(token);
    if (!claims) throw new Error('Token inválido.');
    user = {
      id: claims.userId ?? claims.id ?? null,
      email: claims.sub ?? claims.email ?? email,
      nombre: claims.name ?? claims.nombre ?? null,
      role: claims.role ?? claims.rol ?? null,
      clienteId: claims.clienteId ?? null,
    };
  }
  return user;
}

export async function registrar({ email, password, nombre, empresa, ruc, telefono, direccion }) {
  try {
    return await apiClient.post(
      '/auth/registro',
      { email, password, nombre, empresa, ruc, telefono, direccion },
      { auth: false },
    );
  } catch (e) {
    if (e.status === 400) {
      throw new Error(e.message || 'Datos inválidos. Revisa los campos.');
    }
    if (e.status === 409) {
      throw new Error('Ya existe una cuenta con ese correo.');
    }
    throw e;
  }
}

export function logout() {
  clearToken();
}

export const HOME_BY_ROLE = {
  cliente: '/cliente',
  vendedor: '/admin/ventas',
  almacen: '/admin/almacen',
  produccion: '/admin/operaciones',
  gerente: '/admin/gerencia',
};

import { createSlice } from '@reduxjs/toolkit';
import { decodeJwt } from '../../services/apiClient.js';

const STORAGE_KEY = 'catjard_auth';
const TOKEN_KEY = 'catjard_token';

// Al arrancar la app: si no hay token o el JWT expiró, se limpia la sesión
// persistida (evita entrar "ya logueado" con una sesión vieja/vencida).
const loadInitial = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!token || !raw) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    const claims = decodeJwt(token);
    const vigente = claims?.exp && claims.exp * 1000 > Date.now();
    if (!vigente) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const initialState = {
  user: loadInitial(),
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload;
      state.error = null;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      } catch {}
    },
    loginFailure(state, action) {
      state.user = null;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.error = null;
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('catjard_token');
      } catch {}
    },
  },
});

export const { loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.user?.role ?? null;
export const selectIsAuthenticated = (state) => !!state.auth.user;
export const selectAuthError = (state) => state.auth.error;
// clienteId del CRM asociado al usuario. NO usar user.id como fallback: son ids de
// bases distintas (identity vs crm) y mapearían a OTRA empresa (fuga de datos B2B).
// Si es null, el portal de cliente se muestra vacío (usuario sin ClienteCRM enlazado).
export const selectClienteId = (state) => state.auth.user?.clienteId ?? null;

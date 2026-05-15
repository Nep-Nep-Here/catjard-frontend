import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'catjard_auth';

const loadInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
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
// clienteId del CRM asociado al usuario; cae al user.id como fallback para no romper usuarios antiguos
// que se registraron antes de la conversión lead→cliente.
export const selectClienteId = (state) =>
  state.auth.user?.clienteId ?? state.auth.user?.id ?? null;

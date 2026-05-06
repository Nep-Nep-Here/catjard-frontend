import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState } from '../../services/storage.js';
import { USERS as SEED_USERS } from '../../data/users.js';

const STORAGE_KEY = 'catjard_usuarios';

const initialState = {
  list: loadState(STORAGE_KEY, SEED_USERS),
};

const slice = createSlice({
  name: 'usuarios',
  initialState,
  reducers: {
    crearUsuario(state, action) {
      const id = (state.list.reduce((acc, u) => Math.max(acc, u.id), 0) || 0) + 1;
      state.list.push({ ...action.payload, id });
      saveState(STORAGE_KEY, state.list);
    },
    actualizarUsuario(state, action) {
      const idx = state.list.findIndex((u) => u.id === action.payload.id);
      if (idx >= 0) {
        const previo = state.list[idx];
        state.list[idx] = { ...previo, ...action.payload };
        if (!action.payload.password) {
          state.list[idx].password = previo.password;
        }
        saveState(STORAGE_KEY, state.list);
      }
    },
    eliminarUsuario(state, action) {
      state.list = state.list.filter((u) => u.id !== action.payload);
      saveState(STORAGE_KEY, state.list);
    },
  },
});

export const { crearUsuario, actualizarUsuario, eliminarUsuario } = slice.actions;
export default slice.reducer;

export const selectUsuarios = (state) => state.usuarios.list;
export const selectUsuariosInternos = (state) =>
  state.usuarios.list.filter((u) => u.role !== 'cliente');
export const selectUsuarioById = (id) => (state) =>
  state.usuarios.list.find((u) => u.id === Number(id));

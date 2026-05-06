import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState } from '../../services/storage.js';
import { SEED_PROVEEDORES, nuevoIdProveedor } from '../../data/proveedores.js';

const STORAGE_KEY = 'catjard_proveedores';

const initialState = {
  list: loadState(STORAGE_KEY, SEED_PROVEEDORES),
};

const slice = createSlice({
  name: 'proveedores',
  initialState,
  reducers: {
    crearProveedor(state, action) {
      const id = nuevoIdProveedor(state.list);
      state.list.push({ ...action.payload, id });
      saveState(STORAGE_KEY, state.list);
    },
    actualizarProveedor(state, action) {
      const idx = state.list.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) {
        state.list[idx] = { ...state.list[idx], ...action.payload };
        saveState(STORAGE_KEY, state.list);
      }
    },
    toggleProveedor(state, action) {
      const p = state.list.find((p) => p.id === action.payload);
      if (p) {
        p.activo = !p.activo;
        saveState(STORAGE_KEY, state.list);
      }
    },
    eliminarProveedor(state, action) {
      state.list = state.list.filter((p) => p.id !== action.payload);
      saveState(STORAGE_KEY, state.list);
    },
  },
});

export const {
  crearProveedor,
  actualizarProveedor,
  toggleProveedor,
  eliminarProveedor,
} = slice.actions;

export default slice.reducer;

export const selectProveedores = (state) => state.proveedores.list;
export const selectProveedorById = (id) => (state) =>
  state.proveedores.list.find((p) => p.id === Number(id));

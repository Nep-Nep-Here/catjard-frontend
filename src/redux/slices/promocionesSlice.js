import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState } from '../../services/storage.js';
import { SEED_PROMOCIONES, nuevoIdPromocion } from '../../data/promociones.js';

const STORAGE_KEY = 'catjard_promociones';

const initialState = {
  list: loadState(STORAGE_KEY, SEED_PROMOCIONES),
};

const promocionesSlice = createSlice({
  name: 'promociones',
  initialState,
  reducers: {
    crearPromocion(state, action) {
      const id = nuevoIdPromocion(state.list);
      state.list.push({ ...action.payload, id });
      saveState(STORAGE_KEY, state.list);
    },
    actualizarPromocion(state, action) {
      const idx = state.list.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) {
        state.list[idx] = { ...state.list[idx], ...action.payload };
        saveState(STORAGE_KEY, state.list);
      }
    },
    togglePromocion(state, action) {
      const p = state.list.find((p) => p.id === action.payload);
      if (p) {
        p.activa = !p.activa;
        saveState(STORAGE_KEY, state.list);
      }
    },
    eliminarPromocion(state, action) {
      state.list = state.list.filter((p) => p.id !== action.payload);
      saveState(STORAGE_KEY, state.list);
    },
    resetPromociones(state) {
      state.list = SEED_PROMOCIONES;
      saveState(STORAGE_KEY, state.list);
    },
  },
});

export const {
  crearPromocion,
  actualizarPromocion,
  togglePromocion,
  eliminarPromocion,
  resetPromociones,
} = promocionesSlice.actions;

export default promocionesSlice.reducer;

export const selectPromociones = (state) => state.promociones.list;
export const selectPromocionById = (id) => (state) =>
  state.promociones.list.find((p) => p.id === Number(id));

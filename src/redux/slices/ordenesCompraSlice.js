import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState } from '../../services/storage.js';
import { SEED_OC } from '../../data/ordenesCompra.js';

const STORAGE_KEY = 'catjard_oc';

const initialState = {
  list: loadState(STORAGE_KEY, SEED_OC),
};

const slice = createSlice({
  name: 'ordenesCompra',
  initialState,
  reducers: {
    crearOC(state, action) {
      state.list.unshift(action.payload);
      saveState(STORAGE_KEY, state.list);
    },
    actualizarOC(state, action) {
      const idx = state.list.findIndex((o) => o.id === action.payload.id);
      if (idx >= 0) {
        state.list[idx] = { ...state.list[idx], ...action.payload };
        saveState(STORAGE_KEY, state.list);
      }
    },
    setEstadoOC(state, action) {
      const { id, estado, fechaRecepcion } = action.payload;
      const oc = state.list.find((o) => o.id === id);
      if (oc) {
        oc.estado = estado;
        if (fechaRecepcion !== undefined) oc.fechaRecepcion = fechaRecepcion;
        saveState(STORAGE_KEY, state.list);
      }
    },
    eliminarOC(state, action) {
      state.list = state.list.filter((o) => o.id !== action.payload);
      saveState(STORAGE_KEY, state.list);
    },
  },
});

export const { crearOC, actualizarOC, setEstadoOC, eliminarOC } = slice.actions;
export default slice.reducer;

export const selectOrdenesCompra = (state) => state.ordenesCompra.list;
export const selectOCById = (id) => (state) =>
  state.ordenesCompra.list.find((o) => o.id === id);

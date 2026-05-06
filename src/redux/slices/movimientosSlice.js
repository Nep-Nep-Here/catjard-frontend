import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState } from '../../services/storage.js';
import { SEED_MOVIMIENTOS, nuevoIdMovimiento } from '../../data/movimientos.js';

const STORAGE_KEY = 'catjard_movimientos';

const initialState = {
  list: loadState(STORAGE_KEY, SEED_MOVIMIENTOS),
};

const slice = createSlice({
  name: 'movimientos',
  initialState,
  reducers: {
    registrarMovimiento(state, action) {
      const id = nuevoIdMovimiento(state.list);
      state.list.unshift({ ...action.payload, id });
      saveState(STORAGE_KEY, state.list);
    },
  },
});

export const { registrarMovimiento } = slice.actions;
export default slice.reducer;

export const selectMovimientos = (state) => state.movimientos.list;

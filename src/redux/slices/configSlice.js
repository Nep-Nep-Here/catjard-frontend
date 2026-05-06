import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState } from '../../services/storage.js';
import { CONFIG_DEFAULT } from '../../data/configuracion.js';

const STORAGE_KEY = 'catjard_config';

const initialState = loadState(STORAGE_KEY, CONFIG_DEFAULT);

const slice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    actualizarEmpresa(state, action) {
      state.empresa = { ...state.empresa, ...action.payload };
      saveState(STORAGE_KEY, state);
    },
    actualizarParametros(state, action) {
      state.parametros = { ...state.parametros, ...action.payload };
      saveState(STORAGE_KEY, state);
    },
    resetConfig() {
      saveState(STORAGE_KEY, CONFIG_DEFAULT);
      return CONFIG_DEFAULT;
    },
  },
});

export const { actualizarEmpresa, actualizarParametros, resetConfig } = slice.actions;
export default slice.reducer;

export const selectConfig = (state) => state.config;
export const selectEmpresa = (state) => state.config.empresa;
export const selectParametros = (state) => state.config.parametros;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarMovimientos,
  crearMovimientoApi,
} from '../../services/movimientosService.js';
import { fetchProductos } from './productosSlice.js';

export const fetchMovimientos = createAsyncThunk(
  'movimientos/fetch',
  async (filtros, { rejectWithValue }) => {
    try {
      return await listarMovimientos(filtros);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const registrarMovimiento = createAsyncThunk(
  'movimientos/registrar',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const creado = await crearMovimientoApi(payload);
      dispatch(fetchProductos());
      return creado;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

const initialState = {
  list: [],
  status: 'idle',
  error: null,
};

const slice = createSlice({
  name: 'movimientos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovimientos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMovimientos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchMovimientos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(registrarMovimiento.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      });
  },
});

export default slice.reducer;

export const selectMovimientos = (state) => state.movimientos.list;
export const selectMovimientosStatus = (state) => state.movimientos.status;
export const selectMovimientosError = (state) => state.movimientos.error;

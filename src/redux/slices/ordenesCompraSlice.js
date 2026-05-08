import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarOC,
  crearOCApi,
  enviarOCApi,
  recibirOCApi,
  cancelarOCApi,
  eliminarOCApi,
} from '../../services/ordenesCompraService.js';
import { fetchProductos } from './productosSlice.js';
import { fetchMovimientos } from './movimientosSlice.js';

export const fetchOC = createAsyncThunk(
  'ordenesCompra/fetch',
  async (filtros, { rejectWithValue }) => {
    try {
      return await listarOC(filtros);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const crearOC = createAsyncThunk(
  'ordenesCompra/crear',
  async (payload, { rejectWithValue }) => {
    try {
      return await crearOCApi(payload);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const enviarOC = createAsyncThunk(
  'ordenesCompra/enviar',
  async (id, { rejectWithValue }) => {
    try {
      return await enviarOCApi(id);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const recibirOC = createAsyncThunk(
  'ordenesCompra/recibir',
  async ({ id, usuario }, { rejectWithValue, dispatch }) => {
    try {
      const oc = await recibirOCApi(id, usuario);
      dispatch(fetchProductos());
      dispatch(fetchMovimientos());
      return oc;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const cancelarOC = createAsyncThunk(
  'ordenesCompra/cancelar',
  async (id, { rejectWithValue }) => {
    try {
      return await cancelarOCApi(id);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const eliminarOC = createAsyncThunk(
  'ordenesCompra/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await eliminarOCApi(id);
      return id;
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
  name: 'ordenesCompra',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const replaceById = (state, action) => {
      const idx = state.list.findIndex((o) => o.id === action.payload.id);
      if (idx >= 0) state.list[idx] = action.payload;
    };
    builder
      .addCase(fetchOC.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOC.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchOC.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(crearOC.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(enviarOC.fulfilled, replaceById)
      .addCase(recibirOC.fulfilled, replaceById)
      .addCase(cancelarOC.fulfilled, replaceById)
      .addCase(eliminarOC.fulfilled, (state, action) => {
        state.list = state.list.filter((o) => o.id !== action.payload);
      });
  },
});

export default slice.reducer;

export const selectOrdenesCompra = (state) => state.ordenesCompra.list;
export const selectOCStatus = (state) => state.ordenesCompra.status;
export const selectOCError = (state) => state.ordenesCompra.error;
export const selectOCById = (id) => (state) =>
  state.ordenesCompra.list.find((o) => String(o.id) === String(id));

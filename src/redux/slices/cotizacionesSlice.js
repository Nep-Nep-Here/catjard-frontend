import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarCotizaciones,
  crearCotizacionApi,
  actualizarCotizacionApi,
  aprobarCotizacionApi,
  rechazarCotizacionApi,
  eliminarCotizacionApi,
} from '../../services/cotizacionesService.js';

export const fetchCotizaciones = createAsyncThunk(
  'cotizaciones/fetch',
  async (filtros, { rejectWithValue }) => {
    try {
      return await listarCotizaciones(filtros);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const crearCotizacion = createAsyncThunk(
  'cotizaciones/crear',
  async (payload, { rejectWithValue }) => {
    try {
      const { id, fecha, estado, subtotal, igv, total, ...rest } = payload;
      return await crearCotizacionApi(rest);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const setEstadoCotizacion = createAsyncThunk(
  'cotizaciones/setEstado',
  async (payload, { rejectWithValue }) => {
    try {
      const { id, estado, motivo, subtotal, igv, total, ...cambios } = payload;
      if (estado === 'aprobada') {
        return await aprobarCotizacionApi(id);
      }
      if (estado === 'rechazada') {
        return await rechazarCotizacionApi(id, motivo ?? '');
      }
      return await actualizarCotizacionApi(id, { ...cambios, estado });
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const eliminarCotizacion = createAsyncThunk(
  'cotizaciones/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await eliminarCotizacionApi(id);
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

const cotizacionesSlice = createSlice({
  name: 'cotizaciones',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCotizaciones.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCotizaciones.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchCotizaciones.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(crearCotizacion.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(setEstadoCotizacion.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(eliminarCotizacion.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      });
  },
});

export default cotizacionesSlice.reducer;

export const selectCotizaciones = (state) => state.cotizaciones.list;
export const selectCotizacionesStatus = (state) => state.cotizaciones.status;
export const selectCotizacionesError = (state) => state.cotizaciones.error;
export const selectCotizacionesByCliente = (clienteId) => (state) =>
  state.cotizaciones.list.filter((c) => c.clienteId === clienteId);
export const selectCotizacionById = (idOrCodigo) => (state) =>
  state.cotizaciones.list.find(
    (c) => String(c.id) === String(idOrCodigo) || c.codigo === idOrCodigo,
  );

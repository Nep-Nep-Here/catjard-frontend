import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarTrackingPorPedido,
  marcarHitoApi,
} from '../../services/trackingService.js';

export const fetchTracking = createAsyncThunk(
  'tracking/fetch',
  async (pedidoCodigo, { rejectWithValue }) => {
    try {
      const data = await listarTrackingPorPedido(pedidoCodigo);
      return { pedidoCodigo, data };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const marcarHito = createAsyncThunk(
  'tracking/marcar',
  async ({ pedidoCodigo, hito, fecha, observacion }, { rejectWithValue }) => {
    try {
      const evento = await marcarHitoApi(pedidoCodigo, { hito, fecha, observacion });
      return { pedidoCodigo, evento };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

const upsertEvento = (state, pedidoCodigo, evento) => {
  const list = state.byPedido[pedidoCodigo] ?? [];
  const idx = list.findIndex((e) => e.hito === evento.hito);
  if (idx >= 0) list[idx] = evento;
  else list.push(evento);
  state.byPedido[pedidoCodigo] = list;
};

const initialState = {
  byPedido: {},
  status: 'idle',
  error: null,
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTracking.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTracking.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.byPedido[action.payload.pedidoCodigo] = action.payload.data;
      })
      .addCase(fetchTracking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(marcarHito.fulfilled, (state, action) => {
        upsertEvento(state, action.payload.pedidoCodigo, action.payload.evento);
      });
  },
});

export default trackingSlice.reducer;

export const selectTrackingByPedido = (pedidoCodigo) => (state) =>
  state.tracking.byPedido[pedidoCodigo] ?? [];

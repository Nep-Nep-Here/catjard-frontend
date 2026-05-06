import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarPedidos,
  actualizarPedidoApi,
  eliminarPedidoApi,
  subirVoucherApi,
} from '../../services/pedidosService.js';
import { marcarHito } from './trackingSlice.js';

const ESTADO_TO_HITO = new Set([
  'en_diseno',
  'en_produccion',
  'control_calidad',
  'listo',
  'despachado',
  'entregado',
]);


export const fetchPedidos = createAsyncThunk(
  'pedidos/fetch',
  async (filtros, { rejectWithValue }) => {
    try {
      return await listarPedidos(filtros);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const setEstadoPedido = createAsyncThunk(
  'pedidos/setEstado',
  async ({ id, estado }, { rejectWithValue, dispatch }) => {
    try {
      const pedido = await actualizarPedidoApi(id, { estado });
      if (ESTADO_TO_HITO.has(estado) && pedido?.codigo) {
        dispatch(marcarHito({ pedidoCodigo: pedido.codigo, hito: estado }));
      }
      return pedido;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const setVoucher = createAsyncThunk(
  'pedidos/setVoucher',
  async ({ pedidoId, voucherUrl }, { rejectWithValue }) => {
    try {
      return await subirVoucherApi(pedidoId, voucherUrl);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const asignarCourier = createAsyncThunk(
  'pedidos/asignarCourier',
  async ({ pedidoId, courier, guiaRemision }, { rejectWithValue }) => {
    try {
      return await actualizarPedidoApi(pedidoId, { courier, guiaRemision });
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const eliminarPedido = createAsyncThunk(
  'pedidos/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await eliminarPedidoApi(id);
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

const pedidosSlice = createSlice({
  name: 'pedidos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPedidos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPedidos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchPedidos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(setEstadoPedido.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(setVoucher.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(asignarCourier.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(eliminarPedido.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
      });
  },
});

export default pedidosSlice.reducer;

export const selectPedidos = (state) => state.pedidos.list;
export const selectPedidosStatus = (state) => state.pedidos.status;
export const selectPedidosError = (state) => state.pedidos.error;
export const selectPedidosByCliente = (clienteId) => (state) =>
  state.pedidos.list.filter((p) => p.clienteId === clienteId);
export const selectPedidoById = (idOrCodigo) => (state) =>
  state.pedidos.list.find(
    (p) => String(p.id) === String(idOrCodigo) || p.codigo === idOrCodigo,
  );

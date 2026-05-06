import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarArtesPorPedido,
  subirArteApi,
  aprobarArteApi,
  rechazarArteApi,
} from '../../services/artesService.js';

export const fetchArtes = createAsyncThunk(
  'artes/fetch',
  async (pedidoCodigo, { rejectWithValue }) => {
    try {
      const data = await listarArtesPorPedido(pedidoCodigo);
      return { pedidoCodigo, data };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const subirArte = createAsyncThunk(
  'artes/subir',
  async ({ pedidoCodigo, nombreArchivo }, { rejectWithValue }) => {
    try {
      return await subirArteApi(pedidoCodigo, nombreArchivo);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const aprobarArte = createAsyncThunk(
  'artes/aprobar',
  async ({ arteId, comentariosCliente }, { rejectWithValue }) => {
    try {
      return await aprobarArteApi(arteId, comentariosCliente);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const rechazarArte = createAsyncThunk(
  'artes/rechazar',
  async ({ arteId, comentariosCliente }, { rejectWithValue }) => {
    try {
      return await rechazarArteApi(arteId, comentariosCliente);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

const upsertInPedido = (state, arte) => {
  const list = state.byPedido[arte.pedidoCodigo] ?? [];
  const idx = list.findIndex((a) => a.id === arte.id);
  if (idx >= 0) list[idx] = arte;
  else list.push(arte);
  list.sort((a, b) => a.version - b.version);
  state.byPedido[arte.pedidoCodigo] = list;
};

const initialState = {
  byPedido: {},
  status: 'idle',
  error: null,
};

const artesSlice = createSlice({
  name: 'artes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchArtes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.byPedido[action.payload.pedidoCodigo] = action.payload.data;
      })
      .addCase(fetchArtes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(subirArte.fulfilled, (state, action) => {
        upsertInPedido(state, action.payload);
      })
      .addCase(aprobarArte.fulfilled, (state, action) => {
        upsertInPedido(state, action.payload);
      })
      .addCase(rechazarArte.fulfilled, (state, action) => {
        upsertInPedido(state, action.payload);
      });
  },
});

export default artesSlice.reducer;

export const selectArtesByPedido = (pedidoCodigo) => (state) =>
  state.artes.byPedido[pedidoCodigo] ?? [];

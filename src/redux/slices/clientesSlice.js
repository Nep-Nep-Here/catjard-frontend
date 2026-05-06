import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarClientes,
  crearClienteApi,
  actualizarClienteApi,
  eliminarClienteApi,
} from '../../services/clientesService.js';

export const fetchClientes = createAsyncThunk(
  'clientes/fetch',
  async (filtros, { rejectWithValue }) => {
    try {
      return await listarClientes(filtros);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const crearCliente = createAsyncThunk(
  'clientes/crear',
  async (cliente, { rejectWithValue }) => {
    try {
      return await crearClienteApi(cliente);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const actualizarCliente = createAsyncThunk(
  'clientes/actualizar',
  async (cliente, { rejectWithValue }) => {
    try {
      const { id, ruc, fechaAlta, ...cambios } = cliente;
      return await actualizarClienteApi(id, cambios);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const eliminarCliente = createAsyncThunk(
  'clientes/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await eliminarClienteApi(id);
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

const clientesSlice = createSlice({
  name: 'clientes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchClientes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchClientes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(crearCliente.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(actualizarCliente.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(eliminarCliente.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      });
  },
});

export default clientesSlice.reducer;

export const selectClientes = (state) => state.clientes.list;
export const selectClientesStatus = (state) => state.clientes.status;
export const selectClientesError = (state) => state.clientes.error;
export const selectClienteById = (id) => (state) =>
  state.clientes.list.find((c) => String(c.id) === String(id));

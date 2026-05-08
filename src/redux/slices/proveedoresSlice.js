import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarProveedores,
  crearProveedorApi,
  actualizarProveedorApi,
  eliminarProveedorApi,
} from '../../services/proveedoresService.js';

export const fetchProveedores = createAsyncThunk(
  'proveedores/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await listarProveedores();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const crearProveedor = createAsyncThunk(
  'proveedores/crear',
  async (payload, { rejectWithValue }) => {
    try {
      const { id, fechaAlta, ...rest } = payload;
      return await crearProveedorApi(rest);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const actualizarProveedor = createAsyncThunk(
  'proveedores/actualizar',
  async (payload, { rejectWithValue }) => {
    try {
      const { id, ruc, fechaAlta, ...cambios } = payload;
      return await actualizarProveedorApi(id, cambios);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const toggleProveedor = createAsyncThunk(
  'proveedores/toggle',
  async (id, { getState, rejectWithValue }) => {
    try {
      const actual = getState().proveedores.list.find((p) => p.id === id);
      if (!actual) throw new Error('Proveedor no encontrado');
      return await actualizarProveedorApi(id, { activo: !actual.activo });
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const eliminarProveedor = createAsyncThunk(
  'proveedores/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await eliminarProveedorApi(id);
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
  name: 'proveedores',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProveedores.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProveedores.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchProveedores.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(crearProveedor.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(actualizarProveedor.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(toggleProveedor.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(eliminarProveedor.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
      });
  },
});

export default slice.reducer;

export const selectProveedores = (state) => state.proveedores.list;
export const selectProveedoresStatus = (state) => state.proveedores.status;
export const selectProveedoresError = (state) => state.proveedores.error;
export const selectProveedorById = (id) => (state) =>
  state.proveedores.list.find((p) => p.id === Number(id));

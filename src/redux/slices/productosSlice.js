import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarProductos,
  crearProductoApi,
  actualizarProductoApi,
  actualizarStockApi,
  eliminarProductoApi,
} from '../../services/productosService.js';

export const fetchProductos = createAsyncThunk(
  'productos/fetch',
  async (filtros, { rejectWithValue }) => {
    try {
      return await listarProductos(filtros);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const crearProducto = createAsyncThunk(
  'productos/crear',
  async (producto, { rejectWithValue }) => {
    try {
      return await crearProductoApi(producto);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const actualizarProducto = createAsyncThunk(
  'productos/actualizar',
  async (producto, { rejectWithValue }) => {
    try {
      const { id, ...cambios } = producto;
      return await actualizarProductoApi(id, cambios);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const eliminarProducto = createAsyncThunk(
  'productos/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await eliminarProductoApi(id);
      return id;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const ajustarStock = createAsyncThunk(
  'productos/ajustarStock',
  async ({ id, delta }, { rejectWithValue }) => {
    try {
      return await actualizarStockApi(id, { delta });
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const setStock = createAsyncThunk(
  'productos/setStock',
  async ({ id, stock }, { rejectWithValue }) => {
    try {
      return await actualizarStockApi(id, { stock });
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

const productosSlice = createSlice({
  name: 'productos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProductos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchProductos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(crearProducto.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(actualizarProducto.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(eliminarProducto.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
      })
      .addCase(ajustarStock.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(setStock.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      });
  },
});

export default productosSlice.reducer;

export const selectProductos = (state) => state.productos.list;
export const selectProductosStatus = (state) => state.productos.status;
export const selectProductosError = (state) => state.productos.error;
export const selectProductoById = (id) => (state) =>
  state.productos.list.find((p) => p.id === id);
export const selectProductoBySlug = (slug) => (state) =>
  state.productos.list.find((p) => p.slug === slug);

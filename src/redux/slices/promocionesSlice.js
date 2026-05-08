import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarPromociones,
  listarPromocionesActivas,
  crearPromocionApi,
  actualizarPromocionApi,
  eliminarPromocionApi,
  toPayloadDePromocion,
} from '../../services/promocionesService.js';

export const fetchPromociones = createAsyncThunk(
  'promociones/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await listarPromociones();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const fetchPromocionesActivas = createAsyncThunk(
  'promociones/fetchActivas',
  async (_, { rejectWithValue }) => {
    try {
      return await listarPromocionesActivas();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const crearPromocion = createAsyncThunk(
  'promociones/crear',
  async (form, { rejectWithValue }) => {
    try {
      return await crearPromocionApi(toPayloadDePromocion(form));
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const actualizarPromocion = createAsyncThunk(
  'promociones/actualizar',
  async (form, { rejectWithValue }) => {
    try {
      return await actualizarPromocionApi(form.id, toPayloadDePromocion(form));
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const togglePromocion = createAsyncThunk(
  'promociones/toggle',
  async (id, { getState, rejectWithValue }) => {
    try {
      const actual = getState().promociones.list.find((p) => p.id === id);
      if (!actual) throw new Error('Promoción no encontrada');
      return await actualizarPromocionApi(id, { activa: !actual.activa });
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const eliminarPromocion = createAsyncThunk(
  'promociones/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await eliminarPromocionApi(id);
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

const promocionesSlice = createSlice({
  name: 'promociones',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPromociones.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPromociones.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchPromociones.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(fetchPromocionesActivas.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchPromocionesActivas.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(crearPromocion.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(actualizarPromocion.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(togglePromocion.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(eliminarPromocion.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
      });
  },
});

export default promocionesSlice.reducer;

export const selectPromociones = (state) => state.promociones.list;
export const selectPromocionesStatus = (state) => state.promociones.status;
export const selectPromocionesError = (state) => state.promociones.error;
export const selectPromocionById = (id) => (state) =>
  state.promociones.list.find((p) => p.id === Number(id));

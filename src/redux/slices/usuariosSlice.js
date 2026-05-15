import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarUsuarios,
  crearUsuarioApi,
  actualizarUsuarioApi,
  eliminarUsuarioApi,
} from '../../services/usuariosService.js';

export const fetchUsuarios = createAsyncThunk(
  'usuarios/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await listarUsuarios();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const crearUsuario = createAsyncThunk(
  'usuarios/crear',
  async (form, { rejectWithValue }) => {
    try {
      // form viene de la vista (usa `role`); el backend espera `rol`.
      const payload = {
        email: form.email,
        password: form.password,
        rol: form.role,
        nombre: form.nombre,
        cargo: form.cargo || undefined,
        empresa: form.empresa || undefined,
        ruc: form.ruc || undefined,
        telefono: form.telefono || undefined,
        direccion: form.direccion || undefined,
        clienteId: form.clienteId ?? undefined,
      };
      return await crearUsuarioApi(payload);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const actualizarUsuario = createAsyncThunk(
  'usuarios/actualizar',
  async (form, { rejectWithValue }) => {
    try {
      // ActualizarUsuarioDTO no admite email/rol/password: se omiten.
      const cambios = {
        nombre: form.nombre,
        cargo: form.cargo,
        empresa: form.empresa,
        ruc: form.ruc,
        telefono: form.telefono,
        direccion: form.direccion,
      };
      return await actualizarUsuarioApi(form.id, cambios);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const eliminarUsuario = createAsyncThunk(
  'usuarios/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await eliminarUsuarioApi(id);
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
  name: 'usuarios',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsuarios.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsuarios.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(crearUsuario.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(actualizarUsuario.fulfilled, (state, action) => {
        const idx = state.list.findIndex((u) => u.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(eliminarUsuario.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
      });
  },
});

export default slice.reducer;

export const selectUsuarios = (state) => state.usuarios.list;
export const selectUsuariosStatus = (state) => state.usuarios.status;
export const selectUsuariosError = (state) => state.usuarios.error;
export const selectUsuariosInternos = (state) =>
  state.usuarios.list.filter((u) => u.role !== 'cliente');
export const selectUsuarioById = (id) => (state) =>
  state.usuarios.list.find((u) => u.id === Number(id));

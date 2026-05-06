import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarLeads,
  crearLeadApi,
  actualizarLeadApi,
  eliminarLeadApi,
  convertirLeadApi,
} from '../../services/leadsService.js';

export const fetchLeads = createAsyncThunk(
  'leads/fetch',
  async (filtros, { rejectWithValue }) => {
    try {
      return await listarLeads(filtros);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const crearLead = createAsyncThunk(
  'leads/crear',
  async (lead, { rejectWithValue }) => {
    try {
      return await crearLeadApi(lead);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const actualizarLead = createAsyncThunk(
  'leads/actualizar',
  async (lead, { rejectWithValue }) => {
    try {
      const { id, ...cambios } = lead;
      return await actualizarLeadApi(id, cambios);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const eliminarLead = createAsyncThunk(
  'leads/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await eliminarLeadApi(id);
      return id;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const convertirLead = createAsyncThunk(
  'leads/convertir',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const result = await convertirLeadApi(id, payload);
      return { id, ...result };
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

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(crearLead.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(actualizarLead.fulfilled, (state, action) => {
        const idx = state.list.findIndex((l) => l.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(eliminarLead.fulfilled, (state, action) => {
        state.list = state.list.filter((l) => l.id !== action.payload);
      })
      .addCase(convertirLead.fulfilled, (state, action) => {
        const lead = state.list.find((l) => l.id === action.payload.id);
        if (lead) lead.estado = 'convertido';
      });
  },
});

export default leadsSlice.reducer;

export const selectLeads = (state) => state.leads.list;
export const selectLeadsStatus = (state) => state.leads.status;
export const selectLeadsError = (state) => state.leads.error;
export const selectLeadById = (id) => (state) =>
  state.leads.list.find((l) => String(l.id) === String(id));

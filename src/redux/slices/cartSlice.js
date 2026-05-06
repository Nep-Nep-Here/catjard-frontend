import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  notasCliente: '',
  logoNombre: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const { productoId, cantidad, tecnica } = action.payload;
      const existing = state.items.find(
        (it) => it.productoId === productoId && it.tecnica === tecnica,
      );
      if (existing) {
        existing.cantidad += cantidad;
      } else {
        state.items.push({ productoId, cantidad, tecnica, notas: '' });
      }
    },
    updateCantidad(state, action) {
      const { index, cantidad } = action.payload;
      if (state.items[index]) {
        state.items[index].cantidad = Math.max(50, cantidad);
      }
    },
    updateTecnica(state, action) {
      const { index, tecnica } = action.payload;
      if (state.items[index]) {
        state.items[index].tecnica = tecnica;
      }
    },
    updateNotas(state, action) {
      const { index, notas } = action.payload;
      if (state.items[index]) {
        state.items[index].notas = notas;
      }
    },
    removeItem(state, action) {
      state.items.splice(action.payload, 1);
    },
    setNotasCliente(state, action) {
      state.notasCliente = action.payload;
    },
    setLogoNombre(state, action) {
      state.logoNombre = action.payload;
    },
    clearCart(state) {
      state.items = [];
      state.notasCliente = '';
      state.logoNombre = null;
    },
  },
});

export const {
  addItem,
  updateCantidad,
  updateTecnica,
  updateNotas,
  removeItem,
  setNotasCliente,
  setLogoNombre,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;
export const selectCartLogoNombre = (state) => state.cart.logoNombre;
export const selectCartNotas = (state) => state.cart.notasCliente;
export const selectCartCount = (state) =>
  state.cart.items.reduce((acc, it) => acc + it.cantidad, 0);
export const selectCartLineCount = (state) => state.cart.items.length;

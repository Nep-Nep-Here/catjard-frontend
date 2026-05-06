import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import cartReducer from './slices/cartSlice.js';
import cotizacionesReducer from './slices/cotizacionesSlice.js';
import pedidosReducer from './slices/pedidosSlice.js';
import productosReducer from './slices/productosSlice.js';
import leadsReducer from './slices/leadsSlice.js';
import clientesReducer from './slices/clientesSlice.js';
import promocionesReducer from './slices/promocionesSlice.js';
import proveedoresReducer from './slices/proveedoresSlice.js';
import movimientosReducer from './slices/movimientosSlice.js';
import ordenesCompraReducer from './slices/ordenesCompraSlice.js';
import usuariosReducer from './slices/usuariosSlice.js';
import configReducer from './slices/configSlice.js';
import artesReducer from './slices/artesSlice.js';
import trackingReducer from './slices/trackingSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    cotizaciones: cotizacionesReducer,
    pedidos: pedidosReducer,
    productos: productosReducer,
    leads: leadsReducer,
    clientes: clientesReducer,
    promociones: promocionesReducer,
    proveedores: proveedoresReducer,
    movimientos: movimientosReducer,
    ordenesCompra: ordenesCompraReducer,
    usuarios: usuariosReducer,
    config: configReducer,
    artes: artesReducer,
    tracking: trackingReducer,
  },
});

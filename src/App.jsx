import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store.js';
import AppRouter from './routes/AppRouter.jsx';
import { fetchProductos } from './redux/slices/productosSlice.js';
import { fetchPromocionesActivas } from './redux/slices/promocionesSlice.js';

function Bootstrap({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchProductos());
    dispatch(fetchPromocionesActivas());
  }, [dispatch]);
  return children;
}

export default function App() {
  return (
    <Provider store={store}>
      <Bootstrap>
        <AppRouter />
      </Bootstrap>
    </Provider>
  );
}

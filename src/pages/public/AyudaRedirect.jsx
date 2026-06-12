import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice.js';
import Ayuda from '../client/Ayuda.jsx';

// Cada rol ya tiene su propia sección de Ayuda en su panel.
// Si el usuario está logueado, el botón "Ayuda" del sitio lo manda a SU panel.
const ROLE_AYUDA = {
  cliente: '/cliente/ayuda',
  vendedor: '/admin/ayuda',
  almacen: '/admin/ayuda',
  produccion: '/admin/ayuda',
  gerente: '/admin/gerencia/solicitudes', // gerencia solo gestiona/ve las solicitudes
};

export default function AyudaRedirect() {
  const user = useSelector(selectUser);
  const dest = user?.role ? ROLE_AYUDA[user.role] : null;
  // Logueado -> a su panel. Sin sesión -> formulario público de ayuda.
  return dest ? <Navigate to={dest} replace /> : <Ayuda />;
}

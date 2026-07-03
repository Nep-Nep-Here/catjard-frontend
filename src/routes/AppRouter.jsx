import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout.jsx';
import ClientLayout from '../layouts/ClientLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

import Home from '../pages/public/Home.jsx';
import Catalogo from '../pages/public/Catalogo.jsx';
import DetalleProducto from '../pages/public/DetalleProducto.jsx';
import Servicios from '../pages/public/Servicios.jsx';
import Portafolio from '../pages/public/Portafolio.jsx';
import Nosotros from '../pages/public/Nosotros.jsx';
import Contacto from '../pages/public/Contacto.jsx';
import Login from '../pages/public/Login.jsx';
import Registro from '../pages/public/Registro.jsx';
import RecuperarPassword from '../pages/public/RecuperarPassword.jsx';

import ClienteDashboard from '../pages/client/Dashboard.jsx';
import Carrito from '../pages/client/Carrito.jsx';
import ClienteCotizaciones from '../pages/client/Cotizaciones.jsx';
import ClienteCotizacionDetalle from '../pages/client/CotizacionDetalle.jsx';
import ClientePedidos from '../pages/client/Pedidos.jsx';
import ClientePedidoDetalle from '../pages/client/PedidoDetalle.jsx';
import Perfil from '../pages/client/Perfil.jsx';
import Ayuda from '../pages/client/Ayuda.jsx';
import AyudaRedirect from '../pages/public/AyudaRedirect.jsx';

import VentasDashboard from '../pages/admin/ventas/Dashboard.jsx';
import Leads from '../pages/admin/ventas/Leads.jsx';
import LeadDetalle from '../pages/admin/ventas/LeadDetalle.jsx';
import Clientes from '../pages/admin/ventas/Clientes.jsx';
import ClienteDetalleAdmin from '../pages/admin/ventas/ClienteDetalle.jsx';
import VentasCotizaciones from '../pages/admin/ventas/Cotizaciones.jsx';
import VentasCotizacionDetalle from '../pages/admin/ventas/CotizacionDetalle.jsx';
import VentasPedidos from '../pages/admin/ventas/Pedidos.jsx';
import VentasPedidoDetalle from '../pages/admin/ventas/PedidoDetalle.jsx';
import CatalogoAdmin from '../pages/admin/ventas/Catalogo.jsx';
import ProductoEditar from '../pages/admin/ventas/ProductoEditar.jsx';
import Promociones from '../pages/admin/ventas/Promociones.jsx';

import AlmacenDashboard from '../pages/admin/almacen/Dashboard.jsx';
import Movimientos from '../pages/admin/almacen/Movimientos.jsx';
import Proveedores from '../pages/admin/almacen/Proveedores.jsx';
import OrdenesCompra from '../pages/admin/almacen/OrdenesCompra.jsx';
import OrdenCompraEditar from '../pages/admin/almacen/OrdenCompraEditar.jsx';
import Despachos from '../pages/admin/almacen/Despachos.jsx';
import OperacionesDashboard from '../pages/admin/operaciones/Dashboard.jsx';
import Kanban from '../pages/admin/operaciones/Kanban.jsx';
import OperacionesPedidoDetalle from '../pages/admin/operaciones/PedidoDetalle.jsx';
import GerenciaDashboard from '../pages/admin/gerencia/Dashboard.jsx';
import Reportes from '../pages/admin/gerencia/Reportes.jsx';
import Aprobaciones from '../pages/admin/gerencia/Aprobaciones.jsx';
import Usuarios from '../pages/admin/gerencia/Usuarios.jsx';
import Configuracion from '../pages/admin/gerencia/Configuracion.jsx';
import Auditoria from '../pages/admin/gerencia/Auditoria.jsx';
import Solicitudes from '../pages/admin/gerencia/Solicitudes.jsx';
import ControlCambios from '../pages/admin/gerencia/ControlCambios.jsx';
import GestionIncidentes from '../pages/admin/gerencia/GestionIncidentes.jsx';
import MonitoreoEventos from '../pages/admin/gerencia/MonitoreoEventos.jsx';

import NotFound from '../pages/NotFound.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:slug" element={<DetalleProducto />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/portafolio" element={<Portafolio />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/ayuda" element={<AyudaRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/recuperar" element={<RecuperarPassword />} />
        </Route>

        <Route element={<ProtectedRoute roles={['cliente']} />}>
          <Route element={<ClientLayout />}>
            <Route path="/cliente" element={<ClienteDashboard />} />
            <Route path="/cliente/cotizar" element={<Carrito />} />
            <Route path="/cliente/cotizaciones" element={<ClienteCotizaciones />} />
            <Route path="/cliente/cotizaciones/:id" element={<ClienteCotizacionDetalle />} />
            <Route path="/cliente/pedidos" element={<ClientePedidos />} />
            <Route path="/cliente/pedidos/:id" element={<ClientePedidoDetalle />} />
            <Route path="/cliente/perfil" element={<Perfil />} />
            <Route path="/cliente/ayuda" element={<Ayuda />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['vendedor', 'gerente']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/ventas" element={<VentasDashboard />} />
            <Route path="/admin/ventas/leads" element={<Leads />} />
            <Route path="/admin/ventas/leads/:id" element={<LeadDetalle />} />
            <Route path="/admin/ventas/clientes" element={<Clientes />} />
            <Route path="/admin/ventas/clientes/:id" element={<ClienteDetalleAdmin />} />
            <Route path="/admin/ventas/cotizaciones" element={<VentasCotizaciones />} />
            <Route path="/admin/ventas/cotizaciones/:id" element={<VentasCotizacionDetalle />} />
            <Route path="/admin/ventas/pedidos" element={<VentasPedidos />} />
            <Route path="/admin/ventas/pedidos/:id" element={<VentasPedidoDetalle />} />
            <Route path="/admin/ventas/promociones" element={<Promociones />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['almacen', 'gerente']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/almacen" element={<AlmacenDashboard />} />
            <Route path="/admin/almacen/movimientos" element={<Movimientos />} />
            <Route path="/admin/almacen/proveedores" element={<Proveedores />} />
            <Route path="/admin/almacen/ordenes" element={<OrdenesCompra />} />
            <Route path="/admin/almacen/ordenes/:id" element={<OrdenCompraEditar />} />
            <Route path="/admin/almacen/despachos" element={<Despachos />} />
            <Route path="/admin/almacen/catalogo" element={<CatalogoAdmin />} />
            <Route path="/admin/almacen/catalogo/:id" element={<ProductoEditar />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['produccion', 'gerente']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/operaciones" element={<OperacionesDashboard />} />
            <Route path="/admin/operaciones/kanban" element={<Kanban />} />
            <Route path="/admin/operaciones/pedidos/:id" element={<OperacionesPedidoDetalle />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['gerente']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/gerencia" element={<GerenciaDashboard />} />
            <Route path="/admin/gerencia/reportes" element={<Reportes />} />
            <Route path="/admin/gerencia/aprobaciones" element={<Aprobaciones />} />
            <Route path="/admin/gerencia/usuarios" element={<Usuarios />} />
            <Route path="/admin/gerencia/solicitudes" element={<Solicitudes />} />
            <Route path="/admin/gerencia/cambios" element={<ControlCambios />} />
            <Route path="/admin/gerencia/incidentes" element={<GestionIncidentes />} />
            <Route path="/admin/gerencia/eventos" element={<MonitoreoEventos />} />
            <Route path="/admin/gerencia/configuracion" element={<Configuracion />} />
            <Route path="/admin/gerencia/auditoria" element={<Auditoria />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['vendedor', 'almacen', 'produccion']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/ayuda" element={<Ayuda />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

# Cat Jard Merchandising — Contexto completo del proyecto

> Documento maestro. Resume todo lo construido en el frontend para que se pueda continuar con el backend Spring Boot + microservicios + PostgreSQL.

---

## 1. Resumen ejecutivo

**Proyecto académico individual** (un solo desarrollador, estudiante de Ingeniería de Sistemas).
Aplicación web para empresa ficticia **"Cat Jard Merchandising Corporativo"**, basada en el modelo real de J&J Publicidad (jyjpublicidad.com), Lima, Perú.

- **Modelo de negocio:** B2B, comercializadora de productos de merchandising corporativo. Cat Jard compra productos terminados a proveedores y los revende personalizados (con logo del cliente).
- **Pedido mínimo:** 50 unidades.
- **Cobertura:** Lima y provincias vía Olva Courier y Shalom (envío manual, sin integración API).
- Cubre las **4 áreas obligatorias del proyecto académico**:
  1. Marketing y Ventas
  2. Logística y Almacén
  3. Producción y Operaciones
  4. Dirección / Gerencia General

---

## 2. Stack técnico

### Frontend (✅ implementado)
| Capa | Tecnología | Versión |
|---|---|---|
| Framework | React | 18.3 |
| Build | Vite | 5.4 |
| Estilos | Tailwind CSS | 3.4 |
| Router | react-router-dom | 6.x |
| Estado global | @reduxjs/toolkit + react-redux | 2.x |
| Persistencia mock | localStorage | nativo |
| Lenguaje | JavaScript (sin TypeScript) | — |

### Backend (⏳ pendiente)
| Capa | Tecnología | Estado |
|---|---|---|
| Framework | Spring Boot | por implementar |
| Arquitectura | Microservicios | por implementar |
| BD | PostgreSQL | por implementar |
| Autenticación | a definir (JWT recomendado) | por implementar |

---

## 3. Roles del sistema (5 + público)

| Rol | Email demo | Password | Home tras login | Permisos |
|---|---|---|---|---|
| Cliente (empresa) | `cliente@empresa.com` | `cliente123` | `/cliente` | Portal cliente: cotizar, pedidos, tracking |
| Vendedor (Marketing/Ventas) | `vendedor@catjard.pe` | `vendedor123` | `/admin/ventas` | Leads, CRM, cotizaciones, catálogo CRUD, promociones |
| Jefe de Almacén | `almacen@catjard.pe` | `almacen123` | `/admin/almacen` | Inventario, movimientos, proveedores, OCs, despachos |
| Jefe de Producción | `produccion@catjard.pe` | `produccion123` | `/admin/operaciones` | Kanban, arte final, transiciones de pedidos |
| Gerente | `gerente@catjard.pe` | `gerente123` | `/admin/gerencia` | Todo lo anterior + KPIs, reportes, aprobaciones, usuarios, config, auditoría |

**Visitante público** (sin login): landing, catálogo, detalle producto, contacto, registro.

---

## 4. Estructura de carpetas

```
src/
├── App.jsx                   → Provider Redux + AppRouter
├── main.jsx                  → entry point
├── index.css                 → Tailwind + animaciones del landing
├── routes/
│   ├── AppRouter.jsx         → todas las rutas + guards por rol
│   └── ProtectedRoute.jsx    → guard que redirige a /login si no autorizado
├── layouts/
│   ├── PublicLayout.jsx      → Navbar + Outlet + Footer
│   ├── ClientLayout.jsx      → sidebar del portal cliente con badge de carrito
│   └── AdminLayout.jsx       → sidebar dinámico por rol con badges contextuales
├── layout/
│   └── Layout.jsx            → Navbar y Footer del landing (heredado)
├── pages/
│   ├── public/               → Home, Catalogo, DetalleProducto, Servicios, Portafolio,
│   │                           Nosotros, Contacto, Login, Registro, RecuperarPassword
│   ├── client/               → Dashboard, Carrito, Cotizaciones, CotizacionDetalle,
│   │                           Pedidos, PedidoDetalle, Perfil
│   ├── admin/
│   │   ├── ventas/           → Dashboard, Leads, LeadDetalle, Clientes, ClienteDetalle,
│   │   │                       Cotizaciones, CotizacionDetalle, Pedidos, PedidoDetalle,
│   │   │                       Catalogo, ProductoEditar, Promociones
│   │   ├── almacen/          → Dashboard, Inventario, Movimientos, Proveedores,
│   │   │                       OrdenesCompra, OrdenCompraEditar, Despachos
│   │   ├── operaciones/      → Dashboard, Kanban, PedidoDetalle
│   │   └── gerencia/         → Dashboard, Reportes, Aprobaciones, Usuarios,
│   │                           Configuracion, Auditoria
│   └── NotFound.jsx
├── components/
│   ├── Icons.jsx             → SVGs custom + CatJardMark
│   ├── Primitives.jsx        → CTAs y SectionTitle del landing
│   ├── PageStub.jsx          → placeholders públicos y admin
│   ├── ProductImage.jsx      → placeholder visual con gradiente por categoría
│   ├── ProductCard.jsx       → tarjeta producto del catálogo
│   └── AdminHeader.jsx       → Header, KpiCard, Card, StatusBadge, EmptyState
├── features/
│   └── Sections.jsx          → secciones del landing (Hero, Problem, Solution, ...)
├── hooks/
│   └── hooks.jsx             → useRipple, useReveal
├── data/                     → SEEDS estáticos (también usados como datos iniciales del store)
│   ├── users.js              → 5 usuarios + ROLES + ROLE_LABELS
│   ├── products.js           → 18 productos + CATEGORIAS + TECNICAS + ESCALAS_VOLUMEN + helpers
│   ├── cotizaciones.js       → 4 cotizaciones + ESTADO_COTIZACION + helpers + IGV_RATE
│   ├── pedidos.js            → 2 pedidos + ESTADO_PEDIDO + PEDIDO_TIMELINE + COURIERS + helpers
│   ├── leads.js              → 5 leads + ESTADO_LEAD + helpers
│   ├── clientes.js           → 6 empresas (CRM) + helpers
│   ├── promociones.js        → 3 promociones + TIPO_APLICACION + helpers
│   ├── proveedores.js        → 5 proveedores + helpers
│   ├── movimientos.js        → 6 movimientos + TIPO_MOVIMIENTO + MOTIVOS_*
│   ├── ordenesCompra.js      → 3 OCs + ESTADO_OC + helpers
│   └── configuracion.js      → CONFIG_DEFAULT (empresa + parametros)
├── redux/
│   ├── store.js              → 13 slices configurados
│   └── slices/
│       ├── authSlice.js
│       ├── cartSlice.js
│       ├── cotizacionesSlice.js
│       ├── pedidosSlice.js
│       ├── productosSlice.js
│       ├── leadsSlice.js
│       ├── clientesSlice.js
│       ├── promocionesSlice.js
│       ├── proveedoresSlice.js
│       ├── movimientosSlice.js
│       ├── ordenesCompraSlice.js
│       ├── usuariosSlice.js
│       └── configSlice.js
└── services/
    ├── authService.js        → loginMock + HOME_BY_ROLE (lee de localStorage o seed)
    └── storage.js            → loadState / saveState / removeState helpers

context/
└── PROYECTO.md               → este documento

uploads/                      → carpeta vacía, prevista para archivos subidos
public/                       → assets estáticos del landing (transition.mp4, hero-poster.png)
```

---

## 5. Modelo de datos (entidades)

> Estas son las estructuras canónicas. Sirven como base para diseñar el MER y los DTOs en Spring Boot.

### 5.1. Usuario (`users.js`)
```js
{
  id, email, password,
  role: 'cliente' | 'vendedor' | 'almacen' | 'produccion' | 'gerente',
  nombre,
  empresa, ruc, telefono, direccion,   // solo cliente
  cargo                                 // solo internos
}
```
**Storage key:** `catjard_usuarios`

### 5.2. Producto (`products.js`)
```js
{
  id, slug, nombre,
  categoria: 'vestimenta' | 'oficina' | 'bebidas' | 'tecnologia' | 'bolsos',
  precio,            // precio base para 50 unidades
  stock,
  stockMinimo,
  descripcion,
  tecnicas: ['Serigrafía' | 'Sublimado' | 'DTF' | 'Bordado' | 'Grabado Láser' | 'Impresión UV']
}
```
**Storage key:** `catjard_productos`

**Escalas de precio por volumen** (calculadas, no almacenadas):
| Cantidad | Factor | % descuento |
|---|---|---|
| 50–99 | 1.00 | — |
| 100–249 | 0.92 | 8 % |
| 250–499 | 0.85 | 15 % |
| 500–999 | 0.78 | 22 % |
| 1000+ | 0.70 | 30 % |

### 5.3. Lead (`leads.js`)
```js
{
  id: 'LEAD-YYYY-NNNN',
  fecha, nombre, empresa, ruc, email, telefono,
  productos, cantidad, mensaje,
  estado: 'nuevo' | 'contactado' | 'convertido' | 'descartado',
  asignadoA, notasInternas
}
```
**Storage key:** `catjard_leads`

### 5.4. Cliente (CRM) (`clientes.js`)
```js
{
  id,
  razonSocial, nombreComercial, ruc,
  industria,
  contactoPrincipal, email, telefono, direccion,
  cuentaActiva: boolean,
  fechaAlta,
  notas
}
```
**Storage key:** `catjard_clientes`
> Diferencia entre **Usuario rol cliente** y **Cliente CRM**:
> Un Usuario rol=cliente puede loguearse al portal. Un Cliente CRM es una empresa con la que se trabaja (puede o no tener cuenta de portal). Se cruzan por `ruc` o `email`.

### 5.5. Cotización (`cotizaciones.js`)
```js
{
  id: 'COT-YYYY-NNNN',
  clienteId, empresa, ruc,
  fecha,
  items: [{ productoId, cantidad, precioUnit, tecnica, notas }],
  logoNombre, notasCliente,
  estado: 'enviada' | 'en_revision' | 'propuesta' | 'aprobada' | 'rechazada',
  subtotal, igv, total,
  validez,                   // fecha
  notasVendedor, vendedor,   // populados cuando vendedor toma la cotización
  motivoRechazo,             // si rechazada
  pedidoId                   // si aprobada → asociado a un pedido
}
```
**Storage key:** `catjard_cotizaciones`

### 5.6. Pedido (`pedidos.js`)
```js
{
  id: 'PED-YYYY-NNNN',
  cotizacionId, clienteId, empresa,
  fechaCreacion, fechaEntregaEstimada,
  items: [{ productoId, cantidad, precioUnit, tecnica }],
  subtotal, igv, total,
  voucherUrl, voucherFecha,
  estado:
    | 'por_iniciar'
    | 'en_diseno'
    | 'esperando_aprobacion_arte'
    | 'en_produccion'
    | 'control_calidad'
    | 'listo'
    | 'despachado'
    | 'entregado',
  artes: [{
    version, nombre, fecha,
    estado: 'pendiente' | 'aprobado' | 'rechazado',
    comentariosCliente
  }],
  tracking: [{
    key: 'cotizacion_aprobada' | 'en_diseno' | 'arte_aprobado' | 'en_produccion'
       | 'control_calidad' | 'listo' | 'despachado' | 'entregado',
    fecha,            // null si no completado
    completo: bool
  }],
  courier: 'Olva Courier' | 'Shalom' | null,
  guiaRemision
}
```
**Storage key:** `catjard_pedidos`

### 5.7. Promoción (`promociones.js`)
```js
{
  id, nombre, descripcion,
  descuentoPct,
  desde, hasta,
  aplicaA: 'todo' | 'categoria' | 'producto',
  aplicaValor: null | categoriaId | productoId,
  activa: boolean
}
```
**Storage key:** `catjard_promociones`

### 5.8. Proveedor (`proveedores.js`)
```js
{
  id,
  razonSocial, nombreComercial, ruc,
  contacto, email, telefono, direccion,
  productos,           // texto libre
  notas,
  activo, fechaAlta
}
```
**Storage key:** `catjard_proveedores`

### 5.9. Movimiento de almacén (`movimientos.js`)
```js
{
  id, fecha,
  tipo: 'entrada' | 'salida' | 'ajuste',
  productoId, cantidad,
  motivo,              // texto libre o de MOTIVOS_ENTRADA / MOTIVOS_SALIDA
  referencia,          // ID OC, ID pedido, vacío
  usuario, notas
}
```
**Storage key:** `catjard_movimientos`
> Append-only. Las entradas/salidas modifican el stock del producto.

### 5.10. Orden de compra (`ordenesCompra.js`)
```js
{
  id: 'OC-YYYY-NNNN',
  fecha,
  proveedorId, proveedorNombre,
  items: [{ productoId, cantidad, precioUnit }],
  subtotal, igv, total,
  estado: 'borrador' | 'enviada' | 'recibida' | 'cancelada',
  fechaEsperada, fechaRecepcion,
  usuario, notas
}
```
**Storage key:** `catjard_oc`

### 5.11. Configuración global (`configuracion.js`)
```js
{
  empresa: {
    razonSocial, nombreComercial, ruc,
    direccion, telefono, email, web
  },
  parametros: {
    umbralAprobacionGerencia,    // S/. Default 10000
    stockMinimoDefault,          // 50
    igvRate,                     // 18
    pedidoMinimoUnidades,        // 50
    diasValidezCotizacion,       // 30
    monedaPrincipal              // 'PEN'
  }
}
```
**Storage key:** `catjard_config`

---

## 6. Flujos de negocio principales

### 6.1. Flujo del pedido end-to-end (cotización → entrega)
```
[Cliente]
  Catálogo → Carrito → Enviar cotización
                              ↓
[Cotización: estado="enviada"]
                              ↓
[Vendedor]
  Toma → estado="en_revision" → edita items/precios → "Enviar propuesta"
                              ↓
[Cotización: estado="propuesta"]
                              ↓
[Cliente]
  Ve propuesta → Aprueba                              → Rechaza
                              ↓                        ↓
[Cotización: estado="aprobada"]            [Cotización: estado="rechazada"]
   Genera pedido nuevo                          + motivo
   Pedido: estado="en_diseno"
                              ↓
[Producción]
  Sube arte → Pedido: estado="esperando_aprobacion_arte"
                              ↓
[Cliente]
  Aprueba arte                                → Rechaza arte
                              ↓                  ↓ (sube otra versión)
[Producción]
  "Iniciar producción" → Pedido: estado="en_produccion"
  ... personalización (manual, externa) ...
  "Marcar terminado" → Pedido: estado="control_calidad"
                              ↓
[Almacén]
  "Marcar como listo" → Pedido: estado="listo"
  Asignar courier + guía → Pedido: estado="despachado"
  "Marcar entregado" → Pedido: estado="entregado"
```

### 6.2. Flujo de orden de compra
```
[Almacén]
  Crea OC borrador → "Enviar a proveedor" → estado="enviada"
  Llega producto → "Marcar como recibida"
                              ↓
  - estado OC → "recibida"
  - se generan registros en movimientos (tipo="entrada", referencia=OC)
  - se ajusta stock (suma)
```

### 6.3. Flujo de lead → cliente
```
[Visitante público]
  Llena formulario en /contacto              [no llega a slice todavía: es solo mock UI]

[Vendedor]
  Bandeja /admin/ventas/leads
  Toma lead → "Marcar como contactado"
            → "Convertir a cliente CRM" (crea registro en clientes)
            → "Descartar"
```

### 6.4. Flujo de aprobación gerencial
```
Toda cotización con total ≥ umbralAprobacionGerencia (default S/ 10 000)
aparece en /admin/gerencia/aprobaciones.

[Gerente] puede:
  - Aprobar      → marca propuesta + agrega "[Aprobado por gerencia]" a notas
  - Rechazar     → estado="rechazada" + motivo
  - Ver detalle  → va a /admin/ventas/cotizaciones/:id
```

---

## 7. Storage keys de localStorage (referencia para migración)

| Key | Slice | Datos |
|---|---|---|
| `catjard_auth` | authSlice | usuario logueado actual |
| `catjard_usuarios` | usuariosSlice | lista completa de usuarios |
| `catjard_productos` | productosSlice | catálogo |
| `catjard_cotizaciones` | cotizacionesSlice | cotizaciones |
| `catjard_pedidos` | pedidosSlice | pedidos |
| `catjard_leads` | leadsSlice | leads |
| `catjard_clientes` | clientesSlice | CRM |
| `catjard_promociones` | promocionesSlice | promociones |
| `catjard_proveedores` | proveedoresSlice | proveedores |
| `catjard_movimientos` | movimientosSlice | movimientos de stock |
| `catjard_oc` | ordenesCompraSlice | órdenes de compra |
| `catjard_config` | configSlice | configuración global |
| (no persistente) | cartSlice | carrito en memoria |

---

## 8. Rutas de la aplicación

### Públicas (sin login)
- `/` — Landing
- `/catalogo` — Grid de productos con filtros
- `/producto/:slug` — Detalle de producto
- `/servicios` — Servicios y técnicas
- `/portafolio` — Casos de éxito
- `/nosotros` — Misión, visión, valores
- `/contacto` — Formulario
- `/login` — Iniciar sesión
- `/registro` — Crear cuenta
- `/recuperar` — Recuperar contraseña

### Cliente (rol=cliente)
- `/cliente` — Dashboard cliente
- `/cliente/cotizar` — Carrito de cotización
- `/cliente/cotizaciones` — Lista
- `/cliente/cotizaciones/:id` — Detalle (aprobar/rechazar)
- `/cliente/pedidos` — Lista
- `/cliente/pedidos/:id` — Tracking + aprobación de arte
- `/cliente/perfil` — Datos de empresa

### Admin · Marketing y Ventas (rol=vendedor o gerente)
- `/admin/ventas` — Dashboard
- `/admin/ventas/leads`
- `/admin/ventas/leads/:id`
- `/admin/ventas/clientes`
- `/admin/ventas/clientes/:id`
- `/admin/ventas/cotizaciones`
- `/admin/ventas/cotizaciones/:id`
- `/admin/ventas/pedidos`
- `/admin/ventas/pedidos/:id`
- `/admin/ventas/promociones`

### Admin · Logística y Almacén (rol=almacen o gerente)
- `/admin/almacen` — Dashboard
- `/admin/almacen/movimientos`
- `/admin/almacen/proveedores`
- `/admin/almacen/ordenes`
- `/admin/almacen/ordenes/nueva`
- `/admin/almacen/ordenes/:id`
- `/admin/almacen/despachos`
- `/admin/almacen/catalogo`
- `/admin/almacen/catalogo/nuevo`
- `/admin/almacen/catalogo/:id`

### Admin · Producción (rol=produccion o gerente)
- `/admin/operaciones` — Dashboard
- `/admin/operaciones/kanban`
- `/admin/operaciones/pedidos/:id`

### Admin · Gerencia (rol=gerente)
- `/admin/gerencia` — Dashboard ejecutivo
- `/admin/gerencia/reportes`
- `/admin/gerencia/aprobaciones`
- `/admin/gerencia/usuarios`
- `/admin/gerencia/configuracion`
- `/admin/gerencia/auditoria`

---

## 9. Decisiones de diseño importantes

1. **Cat Jard NO fabrica.** Es comercializadora. El módulo "Producción y Operaciones" cubre la gestión del **arte final** que va sobre el producto y la **transición de estados** del pedido (no fabricación de la prenda en sí).
2. **5 roles internos + cliente.** Se descartó tener "Operario" y "Diseñador" como roles separados — el Jefe de Producción cubre ambos.
3. **Insumos = productos terminados.** No hay una tabla separada de insumos. El "inventario" es el catálogo.
4. **IGV 18 %** aplicado en toda cotización, pedido y OC.
5. **Pedido mínimo 50 unidades** validado en el carrito.
6. **Persistencia 100 % en localStorage** para que el frontend funcione standalone hasta que el backend esté listo.
7. **Servicios separados por dominio** (`src/services/`) — diseñado para que migrar a REST solo cambie esa carpeta.
8. **Sin gráficos en reportes** — solo tablas y métricas. (Si se requiere, agregar `recharts` o `chart.js`.)
9. **Sin TypeScript** — proyecto académico, JS plano.
10. **Sin autenticación real** — `password` está en plano en `users.js` (mock).

---

## 10. Plan sugerido para el backend Spring Boot

### 10.1. División en microservicios (propuesta — 6 services)

| Microservicio | Entidades | Endpoints clave (REST) |
|---|---|---|
| **auth-service** | Usuario, Rol | `POST /auth/login`, `POST /auth/refresh`, CRUD `/usuarios` |
| **catalog-service** | Producto, Categoria, Tecnica, Promocion | CRUD `/productos`, `/promociones`, `GET /productos/{slug}` |
| **sales-service** | Lead, Cliente, Cotizacion, Pedido | CRUD `/leads`, `/clientes`, `/cotizaciones`, `/pedidos`, transiciones de estado |
| **inventory-service** | Proveedor, OrdenCompra, Movimiento, Stock | CRUD `/proveedores`, `/ordenes-compra`, `POST /movimientos`, `PATCH /productos/{id}/stock` |
| **operations-service** | Arte, Despacho | `POST /pedidos/{id}/artes`, `PATCH /artes/{id}` (aprobar/rechazar), `PATCH /pedidos/{id}/estado`, `POST /despachos` |
| **admin-service** | Configuracion, AuditLog | CRUD `/config`, `GET /auditoria` |

### 10.2. Tabla de mapeo: slice de Redux → microservicio

| Slice frontend | Microservicio backend |
|---|---|
| `authSlice` | auth-service |
| `usuariosSlice` | auth-service |
| `productosSlice` | catalog-service |
| `promocionesSlice` | catalog-service |
| `leadsSlice` | sales-service |
| `clientesSlice` | sales-service |
| `cotizacionesSlice` | sales-service |
| `pedidosSlice` (estado + items) | sales-service |
| `pedidosSlice` (artes + tracking + courier) | operations-service |
| `proveedoresSlice` | inventory-service |
| `ordenesCompraSlice` | inventory-service |
| `movimientosSlice` | inventory-service |
| `configSlice` | admin-service |
| Auditoría (derivada en frontend) | admin-service (event sourcing recomendado) |

### 10.3. Recomendaciones técnicas para el backend

- **JWT con roles** en el claim. El frontend ya envía/recibe `user.role`.
- **API Gateway** delante de los microservicios para que el frontend siga llamando a un solo host.
- **Event-driven** entre servicios para integraciones cruzadas:
  - "Cotización aprobada" → sales emite evento → operations crea pedido en `en_diseno`
  - "OC recibida" → inventory emite evento → genera movimientos + ajusta stock
  - "Pedido despachado" → operations emite evento → sales actualiza estado del cliente
  Recomendación: RabbitMQ o Kafka.
- **Spring Cloud OpenFeign** para llamadas síncronas entre servicios.
- **Flyway** para migraciones de cada BD (recomendado: una BD por microservicio).
- **OpenAPI / Swagger** en cada servicio para documentar los endpoints.

### 10.4. Tareas pendientes que el frontend espera del backend

- [ ] Reemplazar `services/authService.js` para que llame `POST /auth/login` real con JWT.
- [ ] Reemplazar `services/storage.js` por un cliente HTTP (axios o fetch) hacia el API gateway.
- [ ] Cada slice de Redux debe convertirse en `createAsyncThunk` o usar **RTK Query** para llamar al backend.
- [ ] Subida real de archivos (logo del cliente en cotización, voucher de pago, arte final) → S3/MinIO o filesystem del servidor con endpoint `POST /uploads`.
- [ ] Generación real de PDFs (cotización formal, guía de remisión) — actualmente solo es UI.
- [ ] Validaciones server-side (RUC con 11 dígitos, email único, stock disponible al aprobar pedido, etc.).
- [ ] Auditoría real con event sourcing (actualmente la "auditoría" en frontend es derivada de los datos existentes).

### 10.5. Endpoints sugeridos por dominio (mínimo viable)

```
POST   /auth/login                      → { token, user }
POST   /auth/logout
GET    /auth/me

GET    /usuarios                         (gerente)
POST   /usuarios                         (gerente)
PATCH  /usuarios/{id}                    (gerente)
DELETE /usuarios/{id}                    (gerente)

GET    /productos
GET    /productos/{slug}
POST   /productos                        (vendedor/gerente)
PATCH  /productos/{id}                   (vendedor/gerente)
DELETE /productos/{id}                   (vendedor/gerente)
PATCH  /productos/{id}/stock             (almacen/gerente)

GET    /categorias
GET    /tecnicas
GET    /promociones
POST   /promociones                      (vendedor/gerente)
PATCH  /promociones/{id}

GET    /leads
POST   /leads                            (público — desde formulario contacto)
PATCH  /leads/{id}
POST   /leads/{id}/convertir             → crea cliente CRM

GET    /clientes
POST   /clientes
PATCH  /clientes/{id}

GET    /cotizaciones
POST   /cotizaciones                     (cliente)
PATCH  /cotizaciones/{id}                (vendedor edita items/precios)
PATCH  /cotizaciones/{id}/estado         (transiciones)
POST   /cotizaciones/{id}/aprobar        (cliente — genera pedido)
POST   /cotizaciones/{id}/rechazar       (cliente)

GET    /pedidos
POST   /pedidos/{id}/artes               (produccion — sube arte)
POST   /pedidos/{id}/artes/{v}/aprobar   (cliente)
POST   /pedidos/{id}/artes/{v}/rechazar  (cliente)
PATCH  /pedidos/{id}/estado              (transiciones de produccion/almacen)
POST   /pedidos/{id}/voucher             (cliente sube voucher)
POST   /pedidos/{id}/courier             (almacen asigna)

GET    /proveedores
POST   /proveedores                      (almacen/gerente)
PATCH  /proveedores/{id}

GET    /ordenes-compra
POST   /ordenes-compra                   (almacen)
PATCH  /ordenes-compra/{id}
PATCH  /ordenes-compra/{id}/estado       → si "recibida": genera movimientos + ajusta stock

GET    /movimientos
POST   /movimientos                      (almacen — registro manual)

GET    /config                           (gerente)
PATCH  /config/empresa                   (gerente)
PATCH  /config/parametros                (gerente)

GET    /auditoria                        (gerente)
GET    /reportes/ventas-por-mes
GET    /reportes/ventas-por-vendedor
GET    /reportes/ventas-por-cliente
GET    /reportes/top-productos
GET    /reportes/inventario-resumen
GET    /reportes/tiempos-produccion
```

---

## 11. Cómo correr y resetear el proyecto frontend

### Comandos
```bash
npm install                # ya hecho
npm run dev                # http://localhost:5173
npm run build              # genera /dist
npm run preview            # sirve /dist
npm run lint               # ESLint
```

### Resetear datos a los seeds
1. DevTools → Application → Local Storage → `http://localhost:5173`
2. Borrar todas las claves que empiecen con `catjard_`.
3. Recargar.

### Cuentas demo
Ver tabla en sección 3.

---

## 12. Estado final del frontend

| Métrica | Valor |
|---|---|
| Fases completadas | 7 / 7 |
| Módulos compilados (build) | 137 |
| JS bundle (sin gzip) | ~481 KB |
| JS bundle (gzip) | ~124 KB |
| CSS bundle | ~32 KB |
| Slices de Redux | 13 (12 persistentes + cart en memoria) |
| Páginas funcionales | ~50 |
| Roles del sistema | 5 internos + cliente público |
| Productos seed | 18 |
| Cotizaciones seed | 4 |
| Pedidos seed | 2 |
| Leads seed | 5 |
| Clientes CRM seed | 6 |
| Proveedores seed | 5 |
| Promociones seed | 3 |
| Movimientos seed | 6 |
| OCs seed | 3 |

---

## 13. Pendientes / fuera de alcance del frontend

- MER (modelo entidad-relación) formal — pendiente.
- Casos de uso UML — pendiente.
- Diccionario de datos — pendiente.
- Documento de arquitectura — pendiente.
- Tests automatizados — no hay (proyecto académico, no se priorizó).
- Generación real de PDF (cotización formal, guía de remisión) — solo UI.
- Subida real de archivos al servidor — solo se guarda el nombre.
- Notificaciones por email cuando cambia un estado — pendiente del backend.

---

## 14. Convenciones del proyecto

- **Idioma:** todo en español (UI, comentarios, nombres).
- **Indentación:** 2 espacios.
- **Comillas:** simples en JS, dobles en JSX.
- **Imports:** absolutos no, relativos sí (no se configuró alias).
- **IDs:** correlativos por año en formato `XXX-YYYY-NNNN` (ej: `COT-2026-0083`).
- **Moneda:** S/ (soles peruanos), formato `S/ 1,234.56` con `toLocaleString('es-PE', { minimumFractionDigits: 2 })`.
- **Fechas:** ISO `YYYY-MM-DD`.

---

**Fin del documento.** Próximo paso: arrancar el backend Spring Boot tomando como referencia la sección 10.

ahorc# MANUAL DE INSTALACIÓN Y CONFIGURACIÓN
## Cat Jard Merchandising Corporativo

> **Versión:** 1.0
> **Última actualización:** 2026-05-20
> **Proyecto académico** — Ingeniería de Sistemas

---

## ÍNDICE

1. [Presentación](#1-presentación)
   - 1.1 [Descripción de la aplicación](#11-descripción-de-la-aplicación)
   - 1.2 [Requisitos mínimos](#12-requisitos-mínimos)
   - 1.3 [Instalación](#13-instalación)
   - 1.4 [Configuración](#14-configuración)
   - 1.5 [Otros (arquitectura, glosario)](#15-otros)
2. [Módulo de Usuario (Cliente)](#2-módulo-de-usuario-cliente)
   - 2.1 [Estructura visual](#21-estructura-visual)
   - 2.2 [Funcionalidades](#22-funcionalidades)
3. [Módulo de Administración](#3-módulo-de-administración)
   - 3.1 [Estructura visual](#31-estructura-visual)
   - 3.2 [Funcionalidades por rol](#32-funcionalidades-por-rol)
4. [Arquitectura del Sistema](#4-arquitectura-del-sistema)
5. [Despliegue en Producción (DigitalOcean)](#5-despliegue-en-producción-digitalocean)
6. [Operación y Mantenimiento](#6-operación-y-mantenimiento)
7. [Solución de Problemas (Troubleshooting)](#7-solución-de-problemas-troubleshooting)
8. [Seguridad](#8-seguridad)
9. [Apéndices](#9-apéndices)

---

# 1. PRESENTACIÓN

## 1.1 Descripción de la aplicación

**Cat Jard Merchandising Corporativo** es una webapp B2B (empresa-a-empresa) para una comercializadora de merchandising corporativo basada en Lima, Perú. La empresa **no fabrica**: compra producto terminado a proveedores y lo revende a otras empresas con personalización (logo, técnica de impresión).

### Modelo de negocio cubierto

- Venta B2B con pedido mínimo de 50 unidades.
- Catálogo de productos: cuadernos, casacas, polos, etiquetas, etc.
- Distribución vía Olva Courier y Shalom (sin integración API; manejo manual de guía).
- Cobertura: Lima y provincias.

### Roles del sistema

| Rol | Quién es | Qué hace |
|---|---|---|
| **Cliente** | Empresa que compra | Solicita cotizaciones, confirma pedidos, hace seguimiento. |
| **Vendedor** | Marketing y Ventas | Gestiona leads, clientes, cotizaciones, promociones. |
| **Almacén** | Logística + Operaciones | Inventario, proveedores, órdenes de compra, despachos. |
| **Gerente** | Dirección | KPIs, reportes, aprobaciones (cotizaciones ≥ S/10k), CRUD usuarios. |

### Áreas funcionales

1. **Marketing y Ventas** — CRM, leads, cotizaciones, catálogo, promociones.
2. **Logística y Almacén** — Inventario, proveedores, órdenes de compra, despachos.
3. **Operaciones del pedido** — Kanban del flujo (recepción → preparación → control de calidad → listo para despacho).
4. **Dirección/Gerencia** — KPIs, reportes, aprobaciones, gestión de usuarios, auditoría.

---

## 1.2 Requisitos mínimos

### Para uso (usuario final)

| Componente | Requisito |
|---|---|
| Navegador | Chrome 110+, Firefox 110+, Edge 110+, Safari 16+ |
| Conexión | Internet estable, mínimo 2 Mbps |
| Resolución | 1280×720 mínimo (responsive desktop/tablet/móvil) |
| JavaScript | Habilitado |
| Cookies | Habilitadas (sesión por JWT en localStorage) |

### Para desarrollo

| Componente | Versión mínima |
|---|---|
| Node.js | 18.x LTS o superior |
| npm | 9.x o superior |
| JDK | 25 (LTS preview) |
| Maven | 3.9+ |
| PostgreSQL | 16.x |
| IntelliJ IDEA / VS Code | Cualquier versión reciente |
| Git | 2.30+ |
| RAM | 16 GB recomendado (los 8 microservicios Java consumen ~4 GB juntos) |
| Disco | 20 GB libres |
| Sistema operativo | Windows 10/11, macOS 12+, Ubuntu 22.04+ |

### Para producción (servidor)

| Componente | Requisito |
|---|---|
| Servidor | Droplet DigitalOcean 8 GB RAM / 4 vCPU / 160 GB SSD (o equivalente) |
| Sistema operativo | Ubuntu 24.04 LTS x64 |
| Docker | 27.x o superior |
| Docker Compose | v2.x |
| Puertos abiertos | 22 (SSH), 80 (HTTP), 443 (HTTPS opcional) |
| RAM mínima | 6 GB (4 GB justo con tuning JVM) |

---

## 1.3 Instalación

### 1.3.1 Entorno de desarrollo local

**Clonar los repositorios:**

```bash
git clone https://github.com/Nep-Nep-Here/catjard-backend.git
git clone https://github.com/Nep-Nep-Here/catjard-frontend.git
```

Estructura esperada (carpetas hermanas):

```
Universidad/
├── datos/                  ← frontend (catjard-frontend)
└── datos2 - backend/
    └── catjard/            ← backend (catjard-backend)
```

**Backend (en IntelliJ IDEA):**

1. Abrir `datos2 - backend/catjard/` como proyecto Maven.
2. Esperar a que IntelliJ indexe e importe dependencias (`pom.xml`).
3. Crear las 6 bases de datos en PostgreSQL local ejecutando `init-databases.sql`:
   ```sql
   psql -U postgres -f init-databases.sql
   ```
4. Configurar Run Configurations individuales para los 8 servicios.
5. Arrancarlos en este orden:
   1. `eureka-server`
   2. `api-gateway`
   3. `identity-service`
   4. `catalog-service`
   5. `crm-service`
   6. `sales-service`
   7. `inventory-service`
   8. `operations-service`

**Frontend:**

```bash
cd datos/
npm install
npm run dev
```

Disponible en `http://localhost:5173`.

### 1.3.2 Entorno de producción

Ver sección [5. Despliegue en Producción](#5-despliegue-en-producción-digitalocean).

---

## 1.4 Configuración

### 1.4.1 Variables de entorno del frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

En producción se omite (el `nginx.conf` hace proxy interno).

### 1.4.2 Variables de entorno del backend (`.env`)

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<contraseña fuerte aleatoria>
JWT_SECRET=<base64 de 48 bytes>
FRONT_ORIGIN=http://<dominio-o-IP>
SERVER_IP=<dominio-o-IP>
```

Generar valores seguros:

```bash
openssl rand -base64 48   # → JWT_SECRET
openssl rand -base64 24   # → POSTGRES_PASSWORD
```

### 1.4.3 Configuración por servicio Spring Boot

Cada servicio tiene su `application.properties` en `<servicio>/src/main/resources/`. Variables clave que se sobreescriben por entorno:

- `spring.datasource.url` — URL JDBC de su BD propia.
- `spring.datasource.username` / `password` — desde `${POSTGRES_USER}` / `${POSTGRES_PASSWORD}`.
- `eureka.client.service-url.defaultZone` — URL de Eureka.
- `jwt.secret` — clave HMAC-SHA512 compartida.
- `front.origin` — para CORS (solo en gateway).

### 1.4.4 CORS

CORS está configurado **únicamente en el `api-gateway`** (`spring.cloud.gateway.server.webflux.globalcors`). Los microservicios de negocio **no deben configurar CORS** para evitar headers duplicados.

---

## 1.5 Otros

### 1.5.1 Mapa de puertos

| Puerto | Servicio |
|---|---|
| 5173 | Frontend (dev) |
| 5432 | PostgreSQL |
| 8080 | API Gateway |
| 8081 | identity-service |
| 8082 | catalog-service |
| 8083 | crm-service |
| 8084 | sales-service |
| 8085 | inventory-service |
| 8086 | operations-service |
| 8761 | Eureka Dashboard |

### 1.5.2 Glosario

| Término | Definición |
|---|---|
| **B2B** | Business-to-Business (venta entre empresas, no consumidor final). |
| **CRM** | Customer Relationship Management. |
| **JWT** | JSON Web Token, mecanismo de autenticación basado en token firmado. |
| **HMAC-SHA512** | Algoritmo de firma criptográfica usado para JWT. |
| **Kanban** | Tablero visual con columnas (estados) para gestionar flujo de trabajo. |
| **Lead** | Prospecto/contacto interesado, aún no es cliente. |
| **Cotización** | Propuesta económica formal previa al pedido. |
| **OC** | Orden de Compra (a proveedor). |
| **IGV** | Impuesto General a las Ventas (18% Perú). |

---

# 2. MÓDULO DE USUARIO (CLIENTE)

Este módulo es accesible para usuarios con rol `cliente`. Permite navegar el catálogo, armar cotizaciones, hacer seguimiento de pedidos y administrar el perfil de empresa.

## 2.1 Estructura visual

El layout cliente (`src/layouts/ClientLayout.jsx`) divide la pantalla en tres zonas:

```
┌──────────────────────────────────────────────────────┐
│  [Sidebar izquierdo]   │   [Panel principal/derecho] │
│                        │                             │
│  - Logo Cat Jard       │   Contenido scrolleable     │
│  - Empresa (RUC)       │   según ruta activa         │
│  - Menú:               │                             │
│    · Dashboard         │                             │
│    · Carrito  [3]      │                             │
│    · Cotizaciones      │                             │
│    · Pedidos           │                             │
│    · Perfil            │                             │
│                        │                             │
│  - Usuario + logout    │                             │
│                        │                             │
└──────────────────────────────────────────────────────┘
```

### 2.1.1 Panel derecho - Panel de información

Es el área principal (main content). Muestra dinámicamente el contenido de la ruta activa:

- **Dashboard** (`/cliente`): KPIs en tarjetas (cotizaciones activas, pedidos en curso, pedidos entregados, gasto total acumulado) y tablas resumen con últimas cotizaciones y pedidos recientes.
- **Carrito** (`/cliente/cotizar`): lista de productos seleccionados, formularios de personalización, subida de logo y botón "Enviar cotización".
- **Cotizaciones** (`/cliente/cotizaciones`): tabla de cotizaciones con estado, fecha y total. Click en una fila lleva al detalle.
- **Pedidos** (`/cliente/pedidos`): tabla de pedidos con seguimiento y tracking del courier.
- **Perfil** (`/cliente/perfil`): formulario de datos de empresa (razón social, RUC, contacto, dirección).

### 2.1.2 Panel izquierdo - Panel de tareas

El **sidebar** es el panel de navegación principal del cliente, con:

- **Logo Cat Jard** + texto "Portal cliente".
- **Datos de la empresa autenticada** (razón social, RUC visible).
- **Menú de tareas:**
  - Dashboard (resumen)
  - Carrito (con **badge numérico** que muestra cantidad de items pendientes de cotizar)
  - Cotizaciones (historial)
  - Pedidos (historial)
  - Perfil (datos de empresa)
- **Pie del sidebar:** información del usuario logueado y botón "Cerrar sesión".

El item activo se resalta con color amber. Los badges (ej. carrito con 3 items) usan fondo amber sobre el texto.

### 2.1.3 Panel inferior

El módulo cliente **no tiene panel inferior dedicado** (no footer en panel interno). El área inferior es parte del scroll del panel principal.

En las **rutas públicas** (sin login: `/`, `/catalogo`, `/contacto`, etc.) sí existe un **footer** (`src/components/PublicLayout.jsx`) con:

- 3 columnas: branding, navegación, contacto.
- Iconos de redes sociales.
- Aviso de copyright y términos.

---

## 2.2 Funcionalidades

### 2.2.1 Seleccionar productos

**Página:** `/catalogo` (pública) y catálogo embebido en flujo de cotización.

- Vista en grilla con `ProductCard` (imagen, nombre, categoría, precio "desde S/X por 50 unidades", badge de stock).
- **Filtros:** categoría (cuadernos, polos, casacas, etc.), búsqueda por texto.
- **Promociones activas:** se muestran como badge de descuento porcentual sobre el precio base.
- Click en una tarjeta abre la **vista de detalle** (`/producto/:slug`) con:
  - Imágenes y descripción completa.
  - Lista de **técnicas de personalización disponibles** (bordado, serigrafía, sublimación, vinilo, etc.).
  - Selector de cantidad (mínimo 50).
  - Botón "Añadir al carrito".

### 2.2.2 Agregar, modificar, eliminar productos

**Página:** `/cliente/cotizar` (Carrito).

Operaciones disponibles sobre cada item del carrito:

| Acción | Cómo |
|---|---|
| **Agregar** | Desde el catálogo, botón "Añadir al carrito" en `ProductCard` o página de detalle. |
| **Modificar cantidad** | Input numérico en la fila del carrito (valida mínimo 50). |
| **Cambiar técnica** | Dropdown de técnicas disponibles para ese producto. |
| **Agregar notas** | Campo de texto libre por item (instrucciones especiales, ubicación del logo). |
| **Subir logo** | Botón de upload por item (acepta PNG, SVG, AI, PDF). |
| **Eliminar item** | Botón "X" o "Quitar" en la fila. |

Los cambios persisten en el estado Redux (`slice: cart`) y opcionalmente en `localStorage` para conservar el carrito entre sesiones.

### 2.2.3 Carrito de compras

**Estructura del carrito** (`/cliente/cotizar`):

- **Lista de items** con detalles editables (cantidad, técnica, notas, logo).
- **Datos de entrega:**
  - Dirección preferida (autocompletada del perfil).
  - Plazo deseado.
  - Notas generales para el vendedor.
- **Resumen económico:**
  - Subtotal (suma de items con descuentos por volumen y promociones).
  - IGV 18%.
  - Total estimado.

> **Importante:** los precios mostrados son **estimados**. El precio final se confirma cuando el vendedor revisa la cotización y emite una **propuesta formal**.

- **Botón "Enviar cotización":** crea una cotización en estado `enviada`, queda pendiente de revisión por un vendedor. El cliente recibe un código de cotización para seguimiento.

### 2.2.4 Pagos

**Importante para uso académico:** la pasarela de pago **no está integrada** en esta versión. El flujo es:

1. Cliente envía cotización.
2. Vendedor revisa y emite propuesta formal con condiciones de pago.
3. Cliente aprueba propuesta → se genera el pedido.
4. Pago se gestiona **fuera del sistema** (transferencia bancaria, depósito, factura electrónica).
5. Almacén procede con preparación tras confirmación manual de pago por el vendedor.

En el detalle del pedido (`/cliente/pedidos/:id`) se muestra:

- **Estado de pago:** pendiente / pagado / parcial.
- **Datos bancarios para transferencia** (si aplica).
- **Factura/boleta:** descarga PDF cuando el área de ventas la emite.

### 2.2.5 Mapas, chat y otros

#### Mapas

No hay integración con mapas en esta versión. La dirección de entrega es texto libre validado por el vendedor.

#### Chat

No hay chat en vivo. La comunicación cliente-vendedor se hace a través de:

- **Notas adjuntas a la cotización** (ambos lados pueden agregar comentarios).
- **Email externo** (el sistema notifica cambios de estado por email — pendiente de configurar SMTP).
- **Teléfono/WhatsApp** (datos en el footer público y en el perfil del vendedor asignado).

#### Otras funcionalidades

- **Seguimiento de pedido (tracking):** en `/cliente/pedidos/:id` se muestra el estado actual y el código de guía del courier (Olva o Shalom) cuando el despacho está hecho. El tracking del courier en sí se hace en la página web del courier (link directo).
- **Histórico exportable:** desde `/cliente/cotizaciones` y `/cliente/pedidos` se puede descargar el historial filtrado (CSV/PDF — funcionalidad opcional, según implementación final).
- **Notificaciones in-app:** el sidebar muestra badges con el número de cotizaciones nuevas con cambios de estado pendientes de revisar.

---

# 3. MÓDULO DE ADMINISTRACIÓN

Accesible para roles internos: `vendedor`, `almacen`, `produccion` (operaciones) y `gerente`. Cada rol ve solo su módulo en el sidebar; el Gerente tiene acceso a todos.

## 3.1 Estructura visual

El layout admin (`src/layouts/AdminLayout.jsx`) sigue el mismo patrón que el cliente pero con secciones específicas:

```
┌──────────────────────────────────────────────────────┐
│  [Sidebar admin]       │   [Panel principal]         │
│                        │                             │
│  - Logo + "Panel       │   Header de página:         │
│    interno"            │   - Breadcrumb              │
│  - Menú jerárquico:    │   - Título h1               │
│    · VENTAS            │   - Acciones (botones)      │
│      Leads     [2]     │                             │
│      Clientes          │   Contenido (tablas,        │
│      Cotizaciones [5]  │   formularios, kanban,      │
│      Pedidos           │   dashboards):              │
│      Promociones       │                             │
│    · ALMACÉN           │   - KpiCard (métricas)      │
│      Inventario        │   - Card (paneles)          │
│      Movimientos       │   - StatusBadge (estados)   │
│      Proveedores       │                             │
│      Órdenes Compra    │                             │
│      Despachos         │                             │
│    · OPERACIONES       │                             │
│      Kanban            │                             │
│    · GERENCIA          │                             │
│      Reportes          │                             │
│      Aprobaciones      │                             │
│      Usuarios          │                             │
│      Configuración     │                             │
│      Auditoría         │                             │
│                        │                             │
│  - Usuario + logout    │                             │
└──────────────────────────────────────────────────────┘
```

**Componentes visuales reutilizados:**

- `AdminHeader` — Cabecera de página con breadcrumb, título y acciones.
- `KpiCard` — Tarjeta de métrica grande con etiqueta, valor numérico y contexto (ej. "+12% vs mes anterior").
- `Card` — Contenedor genérico con título y slot de acciones (típico: "Ver todos").
- `StatusBadge` — Badge de color dinámico según estado de la entidad (verde/aprobada, naranja/pendiente, rojo/rechazada).
- `EmptyState` — Placeholder cuando una tabla no tiene datos.

---

## 3.2 Funcionalidades por rol

### 3.2.1 Rol Vendedor (Marketing y Ventas)

**Ruta base:** `/admin/ventas`

#### Dashboard (`/admin/ventas`)

- KPIs: leads nuevos, cotizaciones por revisar, propuestas activas, ingresos del mes.
- Tablas resumen: últimos leads, cotizaciones que requieren acción.

#### Leads (`/admin/ventas/leads`)

- Tabla con filtros por estado: `nuevo`, `contactado`, `convertido`, `descartado`.
- **CRUD completo:** crear lead, editar datos (empresa, RUC, producto de interés, cantidad estimada, mensaje), cambiar estado, asignar a vendedor.
- **Conversión:** un lead se convierte en `Cliente CRM` con un click (POST `/api/leads/{id}/convertir`).

#### Clientes (`/admin/ventas/clientes`)

- Base CRM con razón social, nombre comercial, RUC, industria, contacto, email, teléfono, dirección.
- Vista de ficha: historial completo de cotizaciones y pedidos del cliente.
- Edición de datos y activación/desactivación de cuenta.

#### Cotizaciones (`/admin/ventas/cotizaciones`)

- Bandeja con filtros por estado: `borrador`, `enviada`, `en_revision`, `propuesta`, `aprobada`, `rechazada`, `vencida`.
- **Crear cotización manual** (sin que el cliente haya usado el carrito).
- **Revisar cotización enviada por cliente:** ajustar precios, aplicar promociones, definir condiciones de pago y validez.
- **Emitir propuesta formal:** cambia el estado y notifica al cliente.
- **Aprobar/rechazar** (POST `/api/cotizaciones/{id}/aprobar` o `/rechazar`).
- Si el monto supera el umbral configurado (default S/10,000), requiere **aprobación del Gerente** antes de enviarse al cliente.

#### Pedidos (`/admin/ventas/pedidos`)

- Vista de pedidos confirmados, derivados de cotizaciones aprobadas.
- Filtros por estado: `por_confirmar`, `en_produccion`, `listo`, `despachado`, `entregado`.
- Vista de detalle: items, total, fecha estimada de entrega, datos del courier.

#### Promociones (`/admin/ventas/promociones`)

- CRUD de descuentos (nombre, porcentaje, rango de aplicación: productos, categorías o clientes específicos).
- Vigencia (fecha inicio / fin).
- Activación/desactivación.

---

### 3.2.2 Rol Almacén (Logística)

**Ruta base:** `/admin/almacen`

#### Dashboard (`/admin/almacen`)

- KPIs: productos con stock crítico (≤ stock_mínimo), OCs pendientes de recepción, pedidos pendientes de despacho.
- Alertas visuales (rojo) para productos sin stock.

#### Inventario / Catálogo (`/admin/almacen/catalogo`)

- Vista de todos los productos con stock actual.
- Editar stock manualmente (con motivo: ajuste, conteo físico, merma).
- Editar `stock_mínimo` por producto (umbral para alertas).

#### Movimientos (`/admin/almacen/movimientos`)

- Log completo de movimientos de inventario.
- Tipos: `ENTRADA` (recepción de OC), `SALIDA` (despacho de pedido), `AJUSTE` (corrección manual).
- Cada movimiento registra: fecha, tipo, producto, cantidad, motivo, usuario que lo hizo.

#### Proveedores (`/admin/almacen/proveedores`)

- CRUD de proveedores: razón social, RUC, contacto, email, teléfono, dirección, productos que ofrece.
- Activación/desactivación.

#### Órdenes de Compra (`/admin/almacen/ordenes`)

- CRUD con estados: `borrador`, `enviada`, `recibida_parcial`, `recibida`, `cancelada`.
- Crear OC con varios items, cantidades esperadas.
- Marcar como **enviada** (notifica al proveedor — vía email externo).
- Marcar como **recibida**: actualiza stock automáticamente y registra movimiento `ENTRADA`.

#### Despachos (`/admin/almacen/despachos`)

- Pedidos en estado `listo` esperando despacho.
- Asignar courier (Olva / Shalom).
- Registrar guía de remisión.
- Marcar como `despachado` → genera movimiento `SALIDA` y actualiza el pedido.

---

### 3.2.3 Rol Operaciones (flujo del pedido)

**Ruta base:** `/admin/operaciones`

#### Kanban (`/admin/operaciones/kanban`)

Tablero visual con columnas (estados del pedido):

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│Por iniciar│Preparando│ Control  │  Listo   │Despachado│
│           │          │de calidad│          │          │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│ PED-001  │ PED-002  │ PED-003  │ PED-004  │ PED-005  │
│ PED-006  │          │          │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

- **Drag-and-drop** entre columnas para cambiar estado.
- Click en tarjeta de pedido → detalle completo con items, técnicas, notas del cliente.
- Marca de tiempo y usuario en cada transición de estado (auditoría).

> **Nota:** como Cat Jard es comercializadora pura (no fabrica), no hay sub-estados de "diseño" ni "producción"; el flujo es simplemente preparación y control de calidad de productos terminados.

---

### 3.2.4 Rol Gerente (Dirección)

**Ruta base:** `/admin/gerencia`. **Acceso adicional:** todos los módulos anteriores.

#### Dashboard ejecutivo (`/admin/gerencia`)

- KPIs globales: ventas totales del mes, pedidos activos, tasa de cierre de leads, ticket promedio.
- Gráficos: ventas por mes, top 5 productos vendidos, top 5 clientes por facturación, ejecución vs meta.

#### Reportes (`/admin/gerencia/reportes`)

- Desglose de ventas por mes, producto, cliente, vendedor.
- Márgenes de utilidad (precio venta vs precio compra a proveedor).
- Proyecciones y comparativos.
- Exportable a PDF / Excel (según implementación final).

#### Aprobaciones (`/admin/gerencia/aprobaciones`)

- Bandeja de cotizaciones con monto ≥ umbral configurado (default S/10,000).
- Vista de detalle con todos los items y márgenes.
- Botones **Aprobar** / **Rechazar** con campo de comentario obligatorio.
- Solo después de aprobación gerencial el vendedor puede enviar la propuesta al cliente.

#### Usuarios (`/admin/gerencia/usuarios`)

- CRUD de usuarios internos del sistema.
- Asignar rol: `vendedor`, `almacen`, `produccion`, `gerente`.
- Datos por usuario: nombre, email, cargo, teléfono.
- Activación/desactivación de acceso (sin borrado físico).
- **No se editan clientes desde aquí** — para eso está el módulo Clientes en Ventas, pero el Gerente tiene acceso por compartir permisos.

#### Configuración (`/admin/gerencia/configuracion`)

- Parámetros del sistema:
  - Umbral de aprobación gerencial (S/).
  - Porcentaje de IGV.
  - Términos de pago por defecto.
  - Stock mínimo por defecto para productos nuevos.
  - Vigencia de cotizaciones (días).

#### Auditoría (`/admin/gerencia/auditoria`)

- Log de acciones críticas: cambios de estado de cotizaciones/pedidos, edición de clientes, creación de usuarios, ajustes de stock.
- Filtros por usuario, fecha, entidad afectada.
- Vista de "antes / después" para cada cambio.

---

# 4. ARQUITECTURA DEL SISTEMA

## 4.1 Visión general

El sistema sigue arquitectura **de microservicios** con un único punto de entrada (API Gateway) y descubrimiento de servicios (Eureka). El frontend es una SPA React 18 que consume el gateway vía REST/JSON.

```
                    ┌─────────────────────────────────┐
                    │      Navegador del cliente      │
                    │      (React 18 + Vite SPA)      │
                    └────────────────┬────────────────┘
                                     │ HTTP/HTTPS
                                     │
                    ┌────────────────▼────────────────┐
                    │  nginx (sirve SPA + /api proxy) │
                    │  Puerto 80 (público en prod)    │
                    └────────────────┬────────────────┘
                                     │ /api → :8080
                                     │
                    ┌────────────────▼────────────────┐
                    │   api-gateway (Spring Cloud)    │
                    │   - CORS                         │
                    │   - Routing por path            │
                    │   - Load balancing (Eureka)     │
                    └────────────────┬────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
   ┌──────────▼───┐   ┌──────────────▼────┐   ┌────────────▼────┐
   │identity (8081)│   │catalog (8082)    │   │crm (8083)       │
   ├───────────────┤   ├──────────────────┤   ├─────────────────┤
   │sales (8084)   │   │inventory (8085)  │   │operations (8086)│
   └───────┬───────┘   └─────────┬────────┘   └────────┬────────┘
           │                     │                     │
           └─────────────────────┴─────────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  PostgreSQL 16 (5432)    │
                    │  6 BDs:                  │
                    │  - catjard_identity      │
                    │  - catjard_catalog       │
                    │  - catjard_crm           │
                    │  - catjard_sales         │
                    │  - catjard_inventory     │
                    │  - catjard_operations    │
                    └──────────────────────────┘

   ┌─────────────────────────────────────────────────────────┐
   │          eureka-server (8761) - Service Discovery       │
   │       Todos los servicios se registran aquí             │
   └─────────────────────────────────────────────────────────┘
```

## 4.2 Microservicios

| Servicio | Puerto | BD | Responsabilidad |
|---|---|---|---|
| **eureka-server** | 8761 | — | Service discovery (Netflix Eureka). Todos los servicios se registran aquí. |
| **api-gateway** | 8080 | — | Único punto de entrada. CORS centralizado, routing por path. |
| **identity-service** | 8081 | catjard_identity | Autenticación JWT HS512, usuarios, roles. |
| **catalog-service** | 8082 | catjard_catalog | Productos, categorías, técnicas, promociones. |
| **crm-service** | 8083 | catjard_crm | Leads, clientes CRM, conversión. |
| **sales-service** | 8084 | catjard_sales | Cotizaciones, pedidos, estados de venta. |
| **inventory-service** | 8085 | catjard_inventory | Proveedores, OCs, movimientos, stock. |
| **operations-service** | 8086 | catjard_operations | Artes (placeholder), despachos, tracking. |

## 4.3 Stack tecnológico

### Backend

| Componente | Versión / Tecnología |
|---|---|
| Lenguaje | Java 25 (LTS preview) |
| Framework | Spring Boot 4.0.6 |
| Spring Cloud | 2025.1.1 |
| Build | Maven |
| Base de datos | PostgreSQL 16 |
| Service discovery | Netflix Eureka |
| Gateway | Spring Cloud Gateway (WebFlux reactivo) |
| Seguridad | Spring Security + JWT (`io.jsonwebtoken:jjwt` 0.12.6) |
| ORM | Hibernate (Spring Data JPA) |
| Migraciones | Flyway |
| Boilerplate | Lombok |
| API docs | springdoc-openapi (Swagger UI) |
| Service-to-service | OpenFeign + Spring Cloud LoadBalancer + OkHttp3 |
| Validación | jakarta.validation |

### Frontend

| Componente | Versión / Tecnología |
|---|---|
| Lenguaje | JavaScript (sin TypeScript) |
| Framework | React 18 |
| Bundler | Vite 5 |
| Estilos | Tailwind CSS 3 |
| Router | react-router-dom |
| Estado global | Redux Toolkit |
| HTTP client | fetch nativo (wrapper en `src/services/apiClient.js`) |
| Build output | SPA estática servida por nginx |

### Infraestructura (producción)

| Componente | Tecnología |
|---|---|
| Servidor | DigitalOcean Droplet Ubuntu 24.04 LTS |
| Containerización | Docker + Docker Compose v2 |
| Web server (frontend) | nginx (imagen oficial) |
| Base de datos | PostgreSQL 16 en contenedor |
| Reverse proxy | nginx integrado (proxy `/api` al gateway) |

## 4.4 Flujo de autenticación

1. Cliente envía `POST /api/auth/login` con email + password.
2. `identity-service` valida contra BD (`catjard_identity.usuarios`).
3. Si las credenciales son válidas, genera un **JWT** firmado con **HMAC-SHA512** usando `JWT_SECRET` (clave compartida entre todos los servicios).
4. El JWT contiene los claims:
   - `sub` (email)
   - `userId`
   - `role` (cliente / vendedor / almacen / gerente)
   - `name`
   - `clienteId` (si aplica)
   - `exp` (vencimiento — 24 horas)
5. Frontend guarda el JWT en `localStorage` y lo agrega como header `Authorization: Bearer <token>` en cada request.
6. Cada microservicio tiene un `JwtAuthenticationFilter` (extiende `OncePerRequestFilter`) que:
   - Extrae el token del header.
   - Verifica firma y vencimiento.
   - Construye un `UsernamePasswordAuthenticationToken` con `ROLE_<rol>` para usar con `@PreAuthorize`.

> **Importante:** la validación del JWT ocurre en **cada microservicio**, no en el gateway. El gateway solo enruta.

## 4.5 Comunicación service-to-service

Cuando un microservicio necesita datos de otro (ej. `sales-service` necesita validar que un cliente existe en `crm-service`), usa **OpenFeign** con balanceo cliente vía Eureka. Para llamadas internas autenticadas, `identity-service` puede emitir un **JWT de corta vida (60 segundos)** con rol elevado.

---

# 5. DESPLIEGUE EN PRODUCCIÓN (DigitalOcean)

Esta sección documenta el despliegue real ejecutado para la demo/sustentación.

## 5.1 Crear el Droplet

1. Iniciar sesión en https://cloud.digitalocean.com (recomendado activar **GitHub Student Developer Pack** para obtener **$200 de crédito**).
2. **Create → Droplets**.
3. Configuración:

| Campo | Valor |
|---|---|
| Región | New York 3 (NYC3) o San Francisco 3 (SFO3) |
| OS | Ubuntu 24.04 LTS x64 |
| Tipo | Basic / Regular SSD |
| Plan | $48/mo · 4 vCPU · 8 GB RAM · 160 GB SSD · 5 TB transferencia |
| Autenticación | SSH Key (recomendado) |
| Hostname | `catjard-demo` |

4. Click **Create Droplet**. Tarda ~45 segundos. Anotar la **IP pública**.

## 5.2 Generar clave SSH (Windows)

```powershell
ssh-keygen -t ed25519 -C "tu_email@example.com"
```

Acepta la ruta default (`C:\Users\<usuario>\.ssh\id_ed25519`). El contenido de `id_ed25519.pub` se pega en DigitalOcean al crear el droplet.

## 5.3 Conectarse e instalar Docker

```bash
ssh root@<IP_DEL_DROPLET>
```

Dentro del droplet:

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
docker --version
docker compose version
```

> Si durante `apt upgrade` aparece un prompt sobre `sshd_config`, seleccionar **"keep the local version currently installed"** (preserva la configuración endurecida de DigitalOcean).

## 5.4 Configurar firewall (UFW)

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

## 5.5 Subir el código

```bash
mkdir -p ~/catjard && cd ~/catjard
git clone https://github.com/Nep-Nep-Here/catjard-backend.git backend
git clone https://github.com/Nep-Nep-Here/catjard-frontend.git frontend
cd backend
```

Estructura resultante en el servidor:

```
/root/catjard/
├── backend/    ← contiene docker-compose.yml + microservicios
└── frontend/   ← contiene Dockerfile + nginx.conf + src/
```

## 5.6 Configurar `.env` de producción

Usar **sslip.io** como dominio gratuito basado en la IP. Si la IP es `104.131.17.147`, el dominio será `104-131-17-147.sslip.io`.

```bash
cd ~/catjard/backend
cp .env.example .env

JWT=$(openssl rand -base64 48)
PGPASS=$(openssl rand -base64 24 | tr -d '/+=')
HOST="104-131-17-147.sslip.io"

sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$JWT|" .env
sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$PGPASS|" .env
sed -i "s|^FRONT_ORIGIN=.*|FRONT_ORIGIN=http://$HOST|" .env
sed -i "s|^SERVER_IP=.*|SERVER_IP=$HOST|" .env

cat .env   # verificar
```

## 5.7 Levantar el stack

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

> **Importante:** el primer build tarda **15–25 minutos** porque compila los 7 servicios Java de cero (Maven baja todas las dependencias, JDK, etc.) y construye la imagen del frontend con `npm install` + `vite build`.

## 5.8 Verificar

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
curl -s -o /dev/null -w "Frontend HTTP %{http_code}\n" http://localhost/
```

Los 10 contenedores deben aparecer `Up`. La respuesta HTTP debe ser **200**.

Desde el navegador:

```
http://104-131-17-147.sslip.io
```

## 5.9 Diferencias entre dev (IntelliJ) y prod (Docker)

| Aspecto | Desarrollo local | Producción Docker |
|---|---|---|
| Cómo correr backend | Run Configurations en IntelliJ (Stop + Run por servicio) | `docker compose up -d --build` |
| Cómo correr frontend | `npm run dev` (Vite hot-reload) | nginx sirve build estático |
| BD | PostgreSQL local | PostgreSQL en contenedor |
| Puertos públicos | 8080 (gateway), 5173 (frontend), 8761 (eureka), 5432 (Postgres) | Solo 80 (frontend) |
| CORS | `FRONT_ORIGIN=http://localhost:5173` | Mismo origen (proxy nginx `/api`) |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | `/api` (relativo) |
| JWT_SECRET | Default en `application.properties` | Generado fresco en `.env` |
| Memoria JVM | Default | `-Xmx200m` por servicio (override en `docker-compose.prod.yml`) |

---

# 6. OPERACIÓN Y MANTENIMIENTO

## 6.1 Comandos comunes

Ejecutar siempre desde `~/catjard/backend/`. Definir alias para no escribir los dos `-f` cada vez:

```bash
alias dcp='docker compose -f docker-compose.yml -f docker-compose.prod.yml'
```

| Comando | Qué hace |
|---|---|
| `dcp ps` | Estado de los contenedores |
| `dcp logs -f <servicio>` | Logs en vivo de un servicio |
| `dcp logs --tail=200 <servicio>` | Últimas 200 líneas |
| `dcp restart <servicio>` | Reiniciar un contenedor |
| `dcp down` | Apagar el stack (`pgdata` persiste) |
| `dcp up -d` | Levantar sin rebuild |
| `dcp up -d --build` | Levantar con rebuild |
| `dcp exec postgres psql -U postgres` | Abrir psql en el contenedor |
| `docker stats` | RAM/CPU en vivo |

## 6.2 Actualizar tras un push

```bash
cd ~/catjard/backend && git pull
cd ~/catjard/frontend && git pull
cd ~/catjard/backend && dcp up -d --build
```

## 6.3 Backup de la base de datos

```bash
# Backup completo de las 6 BDs
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec postgres \
  pg_dumpall -U postgres > backup_$(date +%Y%m%d).sql

# Restaurar
cat backup_YYYYMMDD.sql | docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  exec -T postgres psql -U postgres
```

## 6.4 Resize del Droplet

Si 8 GB no alcanza:
1. Apagar Droplet desde el panel DO.
2. Resize → elegir plan superior.
3. Encender. Los volúmenes (`pgdata`) persisten.

---

# 7. SOLUCIÓN DE PROBLEMAS (TROUBLESHOOTING)

## 7.1 No se puede acceder al frontend desde el navegador

| Síntoma | Causa probable | Solución |
|---|---|---|
| Timeout | UFW no abrió puerto 80 | `ufw status` → `ufw allow 80/tcp` |
| 502 Bad Gateway | Gateway aún no arrancó | Esperar 1–2 min más; `dcp logs api-gateway` |
| Página en blanco | Frontend no compiló bien | `dcp logs frontend` y rebuild |
| `ERR_CONNECTION_REFUSED` | Frontend no levantó | `dcp ps` y reiniciar con `dcp restart frontend` |

## 7.2 Login falla con 401 / 403

- Verificar que `JWT_SECRET` sea el mismo en todos los servicios (lo configura `.env` y se propaga a través de `x-spring-env` en `docker-compose.yml`).
- Verificar logs de `identity-service`: `dcp logs identity-service`.

## 7.3 CORS bloqueado

- Verificar que `FRONT_ORIGIN` en `.env` coincida exactamente con el dominio desde el que entras (incluyendo `http://` vs `https://`).
- En producción con sslip.io: `FRONT_ORIGIN=http://104-131-17-147.sslip.io`.

## 7.4 Servicios no aparecen en Eureka

- Verificar `EUREKA_URI` en `.env`: debe ser `http://eureka-server:8761/eureka/` (nombre del servicio en la red Docker).
- Reiniciar el servicio afectado: `dcp restart <servicio>`.

## 7.5 Memoria insuficiente

- `docker stats` para ver consumo en vivo.
- Si un servicio crashea por OOM (`exit code 137`), aumentar `mem_limit` en `docker-compose.prod.yml` o subir el Droplet a 16 GB.

## 7.6 Postgres no inicia

- Verificar volumen: `docker volume ls`.
- Si la BD se corrompió: **NO** borrar `pgdata` sin backup. Primero hacer dump si es posible.
- Ver logs: `dcp logs postgres`.

## 7.7 El frontend dev no conecta al backend

- Verificar `VITE_API_BASE_URL` en `.env` del frontend: debe ser `http://localhost:8080/api`.
- Verificar que `api-gateway` esté arriba en `http://localhost:8080`.
- Reiniciar `npm run dev` después de cambiar `.env` (Vite no recarga `.env` en caliente).

## 7.8 Logs útiles para debugging

```bash
# Ver todos los logs en vivo
dcp logs -f

# Solo un servicio
dcp logs -f sales-service

# Filtrar por palabra
dcp logs sales-service | grep ERROR

# Últimas N líneas
dcp logs --tail=100 api-gateway
```

---

# 8. SEGURIDAD

## 8.1 Tokens y secretos

- **JWT_SECRET** es la clave maestra. Si se filtra, todos los tokens son falsificables.
  - Mínimo 32 bytes aleatorios codificados en base64.
  - **Nunca commitear** al repositorio (`.env` está en `.gitignore`).
  - Rotar tras un incidente (requiere re-emitir todos los tokens vigentes).

- **POSTGRES_PASSWORD** debe ser fuerte y único por entorno.

## 8.2 Firewall

- En producción, **solo abrir** puertos 22, 80 y 443.
- Bloquear todo lo demás (UFW con `default deny incoming`).
- Considerar **DigitalOcean Cloud Firewall** además del UFW para defensa en profundidad.

## 8.3 SSH

- Usar **autenticación por clave**, no por password.
- Deshabilitar login con password en `/etc/ssh/sshd_config`:
  ```
  PasswordAuthentication no
  PermitRootLogin prohibit-password
  ```
- DigitalOcean ya endurece esta configuración por default.

## 8.4 HTTPS (opcional)

Si se requiere candado verde para producción seria:

1. Agregar **Caddy** como reverse proxy delante de nginx:
   ```yaml
   caddy:
     image: caddy:2-alpine
     ports:
       - "443:443"
       - "80:80"
     volumes:
       - ./Caddyfile:/etc/caddy/Caddyfile
       - caddy_data:/data
   ```
2. `Caddyfile`:
   ```
   104-131-17-147.sslip.io {
       reverse_proxy frontend:80
   }
   ```
3. Caddy obtiene automáticamente certificado Let's Encrypt.

## 8.5 Validación

- Todos los endpoints usan `@Valid` con anotaciones `@NotBlank`, `@Email`, `@Size`, etc.
- Spring Security protege endpoints sensibles con `@PreAuthorize("hasRole('GERENTE')")`.
- Frontend nunca confía en role del JWT sin validar contra backend (la decoración es solo UX).

## 8.6 Auditoría

- El módulo de Auditoría (`/admin/gerencia/auditoria`) registra todas las acciones críticas.
- Logs de Docker se rotan automáticamente; configurar `log_driver: json-file` con `max-size: 10m` y `max-file: 3` si se necesita persistencia controlada.

---

# 9. APÉNDICES

## 9.1 URLs útiles

| Recurso | URL (producción) | URL (dev) |
|---|---|---|
| Aplicación | http://104-131-17-147.sslip.io | http://localhost:5173 |
| API | http://104-131-17-147.sslip.io/api | http://localhost:8080/api |
| Eureka Dashboard | (sin exposición pública) | http://localhost:8761 |
| Swagger por servicio | — | http://localhost:8080/api/<servicio>/swagger-ui.html |

## 9.2 Endpoints principales (referencia rápida)

### Identity (`/api/auth`, `/api/usuarios`)
- `POST /api/auth/login`
- `POST /api/auth/registro`
- `GET /api/auth/me`
- `GET /api/usuarios`
- `POST /api/usuarios`
- `PATCH /api/usuarios/{id}`

### Catalog (`/api/productos`, `/api/categorias`, `/api/promociones`)
- `GET /api/productos?categoria=&q=`
- `POST /api/productos`
- `PATCH /api/productos/{id}/stock`
- `GET /api/categorias`
- `GET /api/promociones`

### CRM (`/api/leads`, `/api/clientes`)
- `GET /api/leads?estado=`
- `POST /api/leads`
- `POST /api/leads/{id}/convertir`
- `GET /api/clientes`
- `PATCH /api/clientes/{id}`

### Sales (`/api/cotizaciones`, `/api/pedidos`)
- `GET /api/cotizaciones?estado=&clienteId=`
- `POST /api/cotizaciones`
- `POST /api/cotizaciones/{id}/aprobar`
- `POST /api/cotizaciones/{id}/rechazar`
- `GET /api/pedidos`
- `POST /api/pedidos`
- `PATCH /api/pedidos/{id}`

### Inventory (`/api/proveedores`, `/api/ordenes-compra`, `/api/movimientos`)
- `GET /api/proveedores`
- `POST /api/proveedores`
- `GET /api/ordenes-compra?estado=&proveedorId=`
- `POST /api/ordenes-compra`
- `POST /api/ordenes-compra/{id}/enviar`
- `POST /api/ordenes-compra/{id}/recibir`
- `GET /api/movimientos`

### Operations (`/api/despachos`, `/api/tracking`)
- `GET /api/despachos`
- `POST /api/despachos`
- `POST /api/despachos/pedido/{codigo}/entregar`
- `GET /api/tracking/{codigo}`

## 9.3 Estructura de directorios (frontend)

```
datos/
├── public/                  Assets estáticos
├── src/
│   ├── components/          Componentes reutilizables
│   │   ├── AdminHeader.jsx
│   │   ├── ProductCard.jsx
│   │   ├── Primitives.jsx
│   │   └── ...
│   ├── layouts/             Layouts por rol
│   │   ├── PublicLayout.jsx
│   │   ├── ClientLayout.jsx
│   │   └── AdminLayout.jsx
│   ├── pages/               Vistas por ruta
│   │   ├── public/
│   │   ├── cliente/
│   │   └── admin/
│   ├── redux/               Estado global
│   │   ├── store.js
│   │   └── slices/
│   ├── services/
│   │   ├── apiClient.js     Wrapper fetch con JWT auto
│   │   └── authService.js
│   ├── data/                Mocks (en migración a API)
│   ├── App.jsx              Router principal
│   └── main.jsx             Entry point
├── Dockerfile
├── nginx.conf               Config nginx (sirve SPA + proxy /api)
├── package.json
└── vite.config.js
```

## 9.4 Estructura de directorios (backend)

```
datos2 - backend/catjard/
├── eureka-server/
├── api-gateway/
├── identity-service/
│   └── src/main/java/com/catjard/identity/
│       ├── config/
│       ├── controller/
│       ├── entity/
│       ├── repository/
│       └── service/
├── catalog-service/
├── crm-service/
├── sales-service/
├── inventory-service/
├── operations-service/
├── init-databases.sql       Crea las 6 BDs
├── docker-compose.yml       Compose base (dev)
├── docker-compose.prod.yml  Override producción
├── .env.example             Plantilla de variables
└── DEPLOY.md                Guía resumida de despliegue
```

## 9.5 Convenciones de código

- **Java:** PascalCase para clases, camelCase para métodos y variables, UPPER_SNAKE_CASE para constantes. Lombok obligatorio para reducir boilerplate.
- **JavaScript:** camelCase para variables y funciones, PascalCase para componentes React. JSX en archivos `.jsx`.
- **Branch naming:** `main` (producción), `develop` (integración), `feat/<descripcion>` (features), `fix/<descripcion>` (bugs).
- **Commits:** mensaje en español, presente, imperativo. Ej: `agregar validación de RUC en lead`.

## 9.6 Contacto y soporte

| Asunto | Contacto |
|---|---|
| Cuestiones académicas | <correo del estudiante> |
| Issues técnicos | GitHub Issues en los repos correspondientes |
| Empresa simulada | Cat Jard Merchandising — Lima, Perú |

---

**Fin del manual.**

export const CATEGORIAS = [
  { id: 'vestimenta', label: 'Vestimenta', gradient: 'from-amber to-brown' },
  { id: 'oficina',    label: 'Oficina',    gradient: 'from-brown to-bg-dark' },
  { id: 'bebidas',    label: 'Bebidas',    gradient: 'from-amber-light to-amber' },
  { id: 'tecnologia', label: 'Tecnología', gradient: 'from-bg-dark to-amber' },
  { id: 'bolsos',     label: 'Bolsos',     gradient: 'from-amber to-amber-light' },
];

export const TECNICAS = [
  'Serigrafía',
  'Sublimado',
  'DTF',
  'Bordado',
  'Grabado Láser',
  'Impresión UV',
];

export const ESCALAS_VOLUMEN = [
  { min: 50,   max: 99,   factor: 1.00, label: '50 a 99' },
  { min: 100,  max: 249,  factor: 0.92, label: '100 a 249' },
  { min: 250,  max: 499,  factor: 0.85, label: '250 a 499' },
  { min: 500,  max: 999,  factor: 0.78, label: '500 a 999' },
  { min: 1000, max: null, factor: 0.70, label: '1000 +' },
];

export function getEscalaPrecio(producto) {
  return ESCALAS_VOLUMEN.map((e) => ({
    ...e,
    precio: +(producto.precio * e.factor).toFixed(2),
  }));
}

export function getPrecioVolumen(producto, cantidad) {
  const tier = ESCALAS_VOLUMEN.find(
    (e) => cantidad >= e.min && (e.max === null || cantidad <= e.max),
  );
  return tier ? +(producto.precio * tier.factor).toFixed(2) : producto.precio;
}

export function getCategoria(id) {
  return CATEGORIAS.find((c) => c.id === id);
}

const make = (overrides) => ({
  id: 0,
  slug: '',
  nombre: '',
  categoria: '',
  precio: 0,
  stock: 0,
  stockMinimo: 50,
  descripcion: '',
  tecnicas: [],
  ...overrides,
});

export const PRODUCTOS = [
  make({ id: 1,  slug: 'polo-clasico',        nombre: 'Polo clásico algodón',     categoria: 'vestimenta', precio: 28, stock: 1200, stockMinimo: 200,  descripcion: 'Polo unisex en algodón pima 180 g. Cuello redondo. Disponible en 8 colores.', tecnicas: ['Serigrafía','DTF','Bordado','Sublimado'] }),
  make({ id: 2,  slug: 'polo-pique',          nombre: 'Polo piqué premium',       categoria: 'vestimenta', precio: 45, stock: 600,  stockMinimo: 150,  descripcion: 'Polo piqué con cuello tejido. Ideal para uniforme corporativo.', tecnicas: ['Bordado','Serigrafía'] }),
  make({ id: 3,  slug: 'taza-ceramica',       nombre: 'Taza cerámica 11 oz',      categoria: 'bebidas',    precio: 14, stock: 800,  stockMinimo: 200,  descripcion: 'Taza cerámica blanca apta para sublimado full-color. Resistente al lavavajillas.', tecnicas: ['Sublimado','Impresión UV'] }),
  make({ id: 4,  slug: 'tomatodo-acero',      nombre: 'Tomatodo acero 600 ml',    categoria: 'bebidas',    precio: 32, stock: 350,  stockMinimo: 100,  descripcion: 'Termo de acero inoxidable doble pared. Mantiene 12 h frío / 6 h caliente.', tecnicas: ['Grabado Láser','Impresión UV'] }),
  make({ id: 5,  slug: 'tote-canvas',         nombre: 'Tote bag canvas',          categoria: 'bolsos',     precio: 18, stock: 900,  stockMinimo: 200,  descripcion: 'Bolsa de canvas natural, asas largas, capacidad 8 L.', tecnicas: ['Serigrafía','DTF'] }),
  make({ id: 6,  slug: 'mochila-corporativa', nombre: 'Mochila corporativa',      categoria: 'bolsos',     precio: 78, stock: 220,  stockMinimo: 80,   descripcion: 'Mochila con compartimento laptop 15", puerto USB y bolsillo antirrobo.', tecnicas: ['Bordado','DTF'] }),
  make({ id: 7,  slug: 'lapicero-metal',      nombre: 'Lapicero metálico',        categoria: 'oficina',    precio: 6,  stock: 5000, stockMinimo: 1000, descripcion: 'Cuerpo metálico con clip. Tinta azul, 0.7 mm.', tecnicas: ['Grabado Láser'] }),
  make({ id: 8,  slug: 'libreta-a5',          nombre: 'Libreta A5 tapa dura',     categoria: 'oficina',    precio: 22, stock: 700,  stockMinimo: 150,  descripcion: 'Libreta A5 con 120 hojas, tapa dura cartoné, elástico.', tecnicas: ['Serigrafía','Grabado Láser','Impresión UV'] }),
  make({ id: 9,  slug: 'agenda-2026',         nombre: 'Agenda ejecutiva 2026',    categoria: 'oficina',    precio: 45, stock: 280,  stockMinimo: 80,   descripcion: 'Agenda anual con planificador semanal y mensual.', tecnicas: ['Grabado Láser','Bordado'] }),
  make({ id: 10, slug: 'usb-16gb',            nombre: 'USB 16 GB metálico',       categoria: 'tecnologia', precio: 24, stock: 450,  stockMinimo: 100,  descripcion: 'USB 3.0 con carcasa metálica. 16 GB.', tecnicas: ['Grabado Láser','Impresión UV'] }),
  make({ id: 11, slug: 'mousepad-tela',       nombre: 'Mousepad de tela',         categoria: 'tecnologia', precio: 16, stock: 600,  stockMinimo: 150,  descripcion: 'Mousepad de tela 22 x 18 cm, base antideslizante.', tecnicas: ['Sublimado'] }),
  make({ id: 12, slug: 'gorra-bordada',       nombre: 'Gorra estructurada',       categoria: 'vestimenta', precio: 32, stock: 480,  stockMinimo: 100,  descripcion: 'Gorra 6 paneles con cierre ajustable. 6 colores.', tecnicas: ['Bordado'] }),
  make({ id: 13, slug: 'hoodie-canguro',      nombre: 'Hoodie canguro premium',   categoria: 'vestimenta', precio: 88, stock: 180,  stockMinimo: 60,   descripcion: 'Hoodie unisex en algodón francés 320 g.', tecnicas: ['DTF','Bordado','Serigrafía'] }),
  make({ id: 14, slug: 'sticker-pack',        nombre: 'Stickers vinilo (set 10)', categoria: 'oficina',    precio: 12, stock: 2000, stockMinimo: 500,  descripcion: 'Pack de 10 stickers de vinilo troquelados, resistentes al agua.', tecnicas: ['Impresión UV'] }),
  make({ id: 15, slug: 'llavero-metal',       nombre: 'Llavero metálico',         categoria: 'oficina',    precio: 8,  stock: 1500, stockMinimo: 300,  descripcion: 'Llavero metálico con anilla reforzada.', tecnicas: ['Grabado Láser','Impresión UV'] }),
  make({ id: 16, slug: 'powerbank-10000',     nombre: 'Power bank 10 000 mAh',    categoria: 'tecnologia', precio: 65, stock: 200,  stockMinimo: 60,   descripcion: 'Batería externa 10 000 mAh con doble salida USB y entrada tipo C.', tecnicas: ['Impresión UV','Grabado Láser'] }),
  make({ id: 17, slug: 'paraguas-corporativo', nombre: 'Paraguas corporativo',    categoria: 'bolsos',     precio: 38, stock: 320,  stockMinimo: 80,   descripcion: 'Paraguas automático 8 varillas, tela poliéster antiviento.', tecnicas: ['Sublimado','Serigrafía'] }),
  make({ id: 18, slug: 'cooler-bag',          nombre: 'Cooler bag isotérmico',    categoria: 'bolsos',     precio: 42, stock: 240,  stockMinimo: 60,   descripcion: 'Cooler bag 12 L, mantiene temperatura 6 h.', tecnicas: ['Serigrafía','DTF'] }),
];

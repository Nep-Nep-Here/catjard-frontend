import { IGV_RATE } from './cotizaciones.js';

export const ESTADO_OC = {
  BORRADOR: 'borrador',
  ENVIADA: 'enviada',
  RECIBIDA: 'recibida',
  CANCELADA: 'cancelada',
};

export const ESTADO_OC_LABEL = {
  borrador: 'Borrador',
  enviada: 'Enviada al proveedor',
  recibida: 'Recibida',
  cancelada: 'Cancelada',
};

export const ESTADO_OC_COLOR = {
  borrador: 'bg-cream/10 text-cream/65 border-cream/15',
  enviada: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  recibida: 'bg-green-500/15 text-green-300 border-green-500/30',
  cancelada: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export function calcularTotalesOC(items) {
  const subtotal = items.reduce(
    (acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precioUnit) || 0),
    0,
  );
  const igv = +(subtotal * IGV_RATE).toFixed(2);
  const total = +(subtotal + igv).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), igv, total };
}

export function nuevoIdOC(existentes) {
  const year = new Date().getFullYear();
  const nums = existentes
    .filter((o) => o.id?.startsWith(`OC-${year}-`))
    .map((o) => parseInt(o.id.split('-')[2], 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `OC-${year}-${String(next).padStart(4, '0')}`;
}

export const SEED_OC = [
  {
    id: 'OC-2026-0012',
    fecha: '2026-04-10',
    proveedorId: 4,
    proveedorNombre: 'Papelera Norte',
    items: [
      { productoId: 8, cantidad: 500, precioUnit: 14.5 },
      { productoId: 7, cantidad: 800, precioUnit: 3.8 },
    ],
    subtotal: 10290,
    igv: 1852.2,
    total: 12142.2,
    estado: 'recibida',
    fechaEsperada: '2026-04-20',
    fechaRecepcion: '2026-04-19',
    usuario: 'Marta Salinas',
    notas: 'Material para pedido Banco Sigma.',
  },
  {
    id: 'OC-2026-0014',
    fecha: '2026-04-22',
    proveedorId: 1,
    proveedorNombre: 'Textiles Andinos',
    items: [
      { productoId: 1, cantidad: 600, precioUnit: 18 },
    ],
    subtotal: 10800,
    igv: 1944,
    total: 12744,
    estado: 'recibida',
    fechaEsperada: '2026-04-26',
    fechaRecepcion: '2026-04-25',
    usuario: 'Marta Salinas',
    notas: '',
  },
  {
    id: 'OC-2026-0017',
    fecha: '2026-04-28',
    proveedorId: 3,
    proveedorNombre: 'Cerámicas Lima',
    items: [
      { productoId: 3, cantidad: 400, precioUnit: 8.5 },
      { productoId: 4, cantidad: 200, precioUnit: 19 },
    ],
    subtotal: 7200,
    igv: 1296,
    total: 8496,
    estado: 'enviada',
    fechaEsperada: '2026-05-08',
    fechaRecepcion: null,
    usuario: 'Marta Salinas',
    notas: 'Pendiente de recepción.',
  },
];

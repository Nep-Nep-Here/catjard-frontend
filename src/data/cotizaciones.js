export const ESTADO_COTIZACION = {
  ENVIADA: 'enviada',
  EN_REVISION: 'en_revision',
  PROPUESTA: 'propuesta',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada',
};

export const ESTADO_COTIZACION_LABEL = {
  enviada: 'Enviada',
  en_revision: 'En revisión',
  propuesta: 'Propuesta lista',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

export const ESTADO_COTIZACION_COLOR = {
  enviada: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  en_revision: 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30',
  propuesta: 'bg-amber/20 text-amber-light border-amber/40',
  aprobada: 'bg-green-500/15 text-green-300 border-green-500/30',
  rechazada: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export const IGV_RATE = 0.18;

export function calcularTotales(items) {
  const subtotal = items.reduce(
    (acc, it) => acc + it.precioUnit * it.cantidad,
    0,
  );
  const igv = +(subtotal * IGV_RATE).toFixed(2);
  const total = +(subtotal + igv).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), igv, total };
}

export function nuevoIdCotizacion(existentes) {
  const year = new Date().getFullYear();
  const nums = existentes
    .filter((c) => c.id?.startsWith(`COT-${year}-`))
    .map((c) => parseInt(c.id.split('-')[2], 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `COT-${year}-${String(next).padStart(4, '0')}`;
}

export const SEED_COTIZACIONES = [
  {
    id: 'COT-2026-0040',
    clienteId: 1,
    empresa: 'Banco Sigma',
    ruc: '20512345671',
    fecha: '2026-04-15',
    items: [
      { productoId: 8, cantidad: 300, precioUnit: 18.7, tecnica: 'Grabado Láser', notas: '' },
      { productoId: 7, cantidad: 500, precioUnit: 4.68, tecnica: 'Grabado Láser', notas: '' },
    ],
    logoNombre: 'logo-banco-sigma.png',
    notasCliente: 'Para entrega de fin de año a colaboradores.',
    estado: 'aprobada',
    subtotal: 7950,
    igv: 1431,
    total: 9381,
    validez: '2026-05-15',
    notasVendedor: 'Incluye diseño, una ronda de cambios y plotter de muestra. Plazo: 12 días hábiles desde la aprobación de arte.',
    vendedor: 'Carlos Rivas',
    pedidoId: 'PED-2026-0089',
  },
  {
    id: 'COT-2026-0058',
    clienteId: 1,
    empresa: 'Banco Sigma',
    ruc: '20512345671',
    fecha: '2026-04-22',
    items: [
      { productoId: 1, cantidad: 200, precioUnit: 23.8, tecnica: 'Bordado', notas: 'Bordado en pecho izquierdo, 8 cm.' },
    ],
    logoNombre: 'logo-banco-sigma.png',
    notasCliente: 'Polos para evento de aniversario.',
    estado: 'propuesta',
    subtotal: 4760,
    igv: 856.8,
    total: 5616.8,
    validez: '2026-05-22',
    notasVendedor: 'Producto en stock. Plazo de entrega: 8 días hábiles desde la aprobación.',
    vendedor: 'Carlos Rivas',
  },
  {
    id: 'COT-2026-0071',
    clienteId: 1,
    empresa: 'Banco Sigma',
    ruc: '20512345671',
    fecha: '2026-04-28',
    items: [
      { productoId: 13, cantidad: 60, precioUnit: 88, tecnica: 'DTF', notas: '' },
    ],
    logoNombre: null,
    notasCliente: 'Cantidad pequeña, urgente.',
    estado: 'rechazada',
    subtotal: 5280,
    igv: 950.4,
    total: 6230.4,
    validez: '2026-05-28',
    motivoRechazo: 'Plazo no calza con nuestra ventana de entrega.',
    vendedor: 'Carlos Rivas',
  },
  {
    id: 'COT-2026-0083',
    clienteId: 1,
    empresa: 'Banco Sigma',
    ruc: '20512345671',
    fecha: '2026-05-01',
    items: [
      { productoId: 3, cantidad: 150, precioUnit: 12.88, tecnica: 'Sublimado', notas: '' },
    ],
    logoNombre: 'logo-banco-sigma.png',
    notasCliente: 'Para sorteo de cumpleaños del staff.',
    estado: 'enviada',
    subtotal: 1932,
    igv: 347.76,
    total: 2279.76,
    validez: '2026-06-01',
    vendedor: null,
  },
];

export const ESTADO_PEDIDO = {
  POR_INICIAR: 'por_iniciar',
  EN_DISENO: 'en_diseno',
  ESPERANDO_APROBACION_ARTE: 'esperando_aprobacion_arte',
  EN_PRODUCCION: 'en_produccion',
  CONTROL_CALIDAD: 'control_calidad',
  LISTO: 'listo',
  DESPACHADO: 'despachado',
  ENTREGADO: 'entregado',
};

export const ESTADO_PEDIDO_LABEL = {
  por_iniciar: 'Por iniciar',
  en_diseno: 'En diseño',
  esperando_aprobacion_arte: 'Esperando aprobación de arte',
  en_produccion: 'En producción',
  control_calidad: 'Control de calidad',
  listo: 'Listo para despacho',
  despachado: 'Despachado',
  entregado: 'Entregado',
};

export const ESTADO_PEDIDO_COLOR = {
  por_iniciar: 'bg-cream/10 text-cream/80 border-cream/20',
  en_diseno: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  esperando_aprobacion_arte: 'bg-amber/25 text-amber-light border-amber/50',
  en_produccion: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  control_calidad: 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30',
  listo: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  despachado: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  entregado: 'bg-green-500/15 text-green-300 border-green-500/30',
};

export const PEDIDO_TIMELINE = [
  { key: 'cotizacion_aprobada', label: 'Cotización aprobada' },
  { key: 'en_diseno',           label: 'En diseño' },
  { key: 'arte_aprobado',       label: 'Arte aprobado' },
  { key: 'en_produccion',       label: 'En producción' },
  { key: 'control_calidad',     label: 'Control de calidad' },
  { key: 'listo',               label: 'Listo para despacho' },
  { key: 'despachado',          label: 'Despachado' },
  { key: 'entregado',           label: 'Entregado' },
];

export const COURIERS = ['Olva Courier', 'Shalom'];

export function nuevoIdPedido(existentes) {
  const year = new Date().getFullYear();
  const nums = existentes
    .filter((p) => p.id?.startsWith(`PED-${year}-`))
    .map((p) => parseInt(p.id.split('-')[2], 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `PED-${year}-${String(next).padStart(4, '0')}`;
}

export const SEED_PEDIDOS = [
  {
    id: 'PED-2026-0089',
    cotizacionId: 'COT-2026-0040',
    clienteId: 1,
    empresa: 'Banco Sigma',
    fechaCreacion: '2026-04-16',
    fechaEntregaEstimada: '2026-05-08',
    items: [
      { productoId: 8, cantidad: 300, precioUnit: 18.7, tecnica: 'Grabado Láser' },
      { productoId: 7, cantidad: 500, precioUnit: 4.68, tecnica: 'Grabado Láser' },
    ],
    subtotal: 7950,
    igv: 1431,
    total: 9381,
    voucherUrl: 'voucher-bcs-040.pdf',
    voucherFecha: '2026-04-17',
    estado: 'en_produccion',
    artes: [
      {
        version: 1,
        nombre: 'arte-banco-sigma-v1.pdf',
        fecha: '2026-04-19',
        estado: 'rechazado',
        comentariosCliente: 'Bajar el logo 5 mm. Cambiar el color del contorno a Pantone 7551 C.',
      },
      {
        version: 2,
        nombre: 'arte-banco-sigma-v2.pdf',
        fecha: '2026-04-21',
        estado: 'aprobado',
        comentariosCliente: '¡Perfecto, gracias!',
      },
    ],
    tracking: [
      { key: 'cotizacion_aprobada', fecha: '2026-04-15', completo: true },
      { key: 'en_diseno',           fecha: '2026-04-16', completo: true },
      { key: 'arte_aprobado',       fecha: '2026-04-21', completo: true },
      { key: 'en_produccion',       fecha: '2026-04-23', completo: true },
      { key: 'control_calidad',     fecha: null,         completo: false },
      { key: 'listo',               fecha: null,         completo: false },
      { key: 'despachado',          fecha: null,         completo: false },
      { key: 'entregado',           fecha: null,         completo: false },
    ],
    courier: null,
    guiaRemision: null,
  },
  {
    id: 'PED-2026-0072',
    cotizacionId: 'COT-2026-0021',
    clienteId: 1,
    empresa: 'Banco Sigma',
    fechaCreacion: '2026-03-04',
    fechaEntregaEstimada: '2026-03-22',
    items: [
      { productoId: 5, cantidad: 400, precioUnit: 14.04, tecnica: 'Serigrafía' },
    ],
    subtotal: 5616,
    igv: 1010.88,
    total: 6626.88,
    voucherUrl: 'voucher-bcs-021.pdf',
    voucherFecha: '2026-03-05',
    estado: 'entregado',
    artes: [
      {
        version: 1,
        nombre: 'arte-tote-bcs-v1.pdf',
        fecha: '2026-03-07',
        estado: 'aprobado',
        comentariosCliente: 'Aprobado.',
      },
    ],
    tracking: [
      { key: 'cotizacion_aprobada', fecha: '2026-03-04', completo: true },
      { key: 'en_diseno',           fecha: '2026-03-05', completo: true },
      { key: 'arte_aprobado',       fecha: '2026-03-07', completo: true },
      { key: 'en_produccion',       fecha: '2026-03-08', completo: true },
      { key: 'control_calidad',     fecha: '2026-03-18', completo: true },
      { key: 'listo',               fecha: '2026-03-19', completo: true },
      { key: 'despachado',          fecha: '2026-03-20', completo: true },
      { key: 'entregado',           fecha: '2026-03-22', completo: true },
    ],
    courier: 'Olva Courier',
    guiaRemision: 'GR-2026-001182',
  },
];

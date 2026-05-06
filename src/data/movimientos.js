export const TIPO_MOVIMIENTO = {
  ENTRADA: 'entrada',
  SALIDA: 'salida',
  AJUSTE: 'ajuste',
};

export const TIPO_MOVIMIENTO_LABEL = {
  entrada: 'Entrada',
  salida: 'Salida',
  ajuste: 'Ajuste',
};

export const TIPO_MOVIMIENTO_COLOR = {
  entrada: 'bg-green-500/15 text-green-300 border-green-500/30',
  salida: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  ajuste: 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30',
};

export const MOTIVOS_ENTRADA = [
  'Compra a proveedor',
  'Devolución de producción',
  'Ajuste positivo',
];

export const MOTIVOS_SALIDA = [
  'Salida a producción',
  'Merma',
  'Ajuste negativo',
];

export function nuevoIdMovimiento(existentes) {
  return (existentes.reduce((acc, m) => Math.max(acc, m.id), 0) || 0) + 1;
}

export const SEED_MOVIMIENTOS = [
  { id: 1, fecha: '2026-04-19', tipo: 'entrada', productoId: 8,  cantidad: 500, motivo: 'Compra a proveedor',     referencia: 'OC-2026-0012', usuario: 'Marta Salinas', notas: '' },
  { id: 2, fecha: '2026-04-19', tipo: 'entrada', productoId: 7,  cantidad: 800, motivo: 'Compra a proveedor',     referencia: 'OC-2026-0012', usuario: 'Marta Salinas', notas: '' },
  { id: 3, fecha: '2026-04-23', tipo: 'salida',  productoId: 8,  cantidad: 300, motivo: 'Salida a producción',    referencia: 'PED-2026-0089', usuario: 'Marta Salinas', notas: 'Pedido Banco Sigma.' },
  { id: 4, fecha: '2026-04-23', tipo: 'salida',  productoId: 7,  cantidad: 500, motivo: 'Salida a producción',    referencia: 'PED-2026-0089', usuario: 'Marta Salinas', notas: 'Pedido Banco Sigma.' },
  { id: 5, fecha: '2026-04-25', tipo: 'entrada', productoId: 1,  cantidad: 600, motivo: 'Compra a proveedor',     referencia: 'OC-2026-0014', usuario: 'Marta Salinas', notas: '' },
  { id: 6, fecha: '2026-04-28', tipo: 'ajuste',  productoId: 14, cantidad: -50, motivo: 'Ajuste negativo',         referencia: '',             usuario: 'Marta Salinas', notas: 'Diferencia inventario físico.' },
];

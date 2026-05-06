export const TIPO_APLICACION = {
  TODO: 'todo',
  CATEGORIA: 'categoria',
  PRODUCTO: 'producto',
};

export const SEED_PROMOCIONES = [
  {
    id: 1,
    nombre: 'Aniversario Cat Jard',
    descripcion: '15 % off en todo el catálogo durante mayo.',
    descuentoPct: 15,
    desde: '2026-05-01',
    hasta: '2026-05-31',
    aplicaA: 'todo',
    aplicaValor: null,
    activa: true,
  },
  {
    id: 2,
    nombre: 'Vestimenta corporativa Q3',
    descripcion: 'Descuento extra en polos, hoodies y gorras.',
    descuentoPct: 10,
    desde: '2026-07-01',
    hasta: '2026-09-30',
    aplicaA: 'categoria',
    aplicaValor: 'vestimenta',
    activa: false,
  },
  {
    id: 3,
    nombre: 'Lapicero corporativo',
    descripcion: 'Descuento al producto estrella de oficina.',
    descuentoPct: 20,
    desde: '2026-04-01',
    hasta: '2026-04-30',
    aplicaA: 'producto',
    aplicaValor: 7,
    activa: false,
  },
];

export function nuevoIdPromocion(existentes) {
  return (existentes.reduce((acc, p) => Math.max(acc, p.id), 0) || 0) + 1;
}

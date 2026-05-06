export const ESTADO_LEAD = {
  NUEVO: 'nuevo',
  CONTACTADO: 'contactado',
  CONVERTIDO: 'convertido',
  DESCARTADO: 'descartado',
};

export const ESTADO_LEAD_LABEL = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  convertido: 'Convertido',
  descartado: 'Descartado',
};

export const ESTADO_LEAD_COLOR = {
  nuevo: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  contactado: 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30',
  convertido: 'bg-green-500/15 text-green-300 border-green-500/30',
  descartado: 'bg-cream/10 text-cream/60 border-cream/15',
};

export function nuevoIdLead(existentes) {
  const year = new Date().getFullYear();
  const nums = existentes
    .filter((l) => l.id?.startsWith(`LEAD-${year}-`))
    .map((l) => parseInt(l.id.split('-')[2], 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `LEAD-${year}-${String(next).padStart(4, '0')}`;
}

export const SEED_LEADS = [
  {
    id: 'LEAD-2026-0034',
    fecha: '2026-04-30',
    nombre: 'Andrea Vargas',
    empresa: 'Pacífico Salud',
    ruc: '20517612345',
    email: 'andrea@pacifico.pe',
    telefono: '+51 998 555 333',
    productos: 'Polos, libretas, lapiceros',
    cantidad: '300',
    mensaje: 'Necesitamos kits de bienvenida para 300 nuevos colaboradores. Plazo: 3 semanas.',
    estado: 'nuevo',
    asignadoA: null,
    notasInternas: '',
  },
  {
    id: 'LEAD-2026-0033',
    fecha: '2026-04-29',
    nombre: 'Renzo Castillo',
    empresa: 'Globant Perú',
    ruc: '20498765432',
    email: 'renzo.castillo@globant.com',
    telefono: '+51 977 222 111',
    productos: 'Hoodies premium',
    cantidad: '120',
    mensaje: 'Hoodies para evento de fin de año, necesitamos calidad alta. Diseño minimalista.',
    estado: 'contactado',
    asignadoA: 'Carlos Rivas',
    notasInternas: 'Llamada el 30/04. Pidió muestras físicas, se las llevamos el viernes.',
  },
  {
    id: 'LEAD-2026-0032',
    fecha: '2026-04-27',
    nombre: 'María Salazar',
    empresa: 'Inkaferry Tours',
    ruc: '20611223344',
    email: 'msalazar@inkaferry.com.pe',
    telefono: '+51 955 888 666',
    productos: 'Mochilas, gorras, tomatodos',
    cantidad: '500',
    mensaje: 'Para tripulación nueva temporada. Diseño con marca corporativa.',
    estado: 'convertido',
    asignadoA: 'Carlos Rivas',
    notasInternas: 'Cotización COT-2026-0061 enviada y aprobada.',
  },
  {
    id: 'LEAD-2026-0031',
    fecha: '2026-04-26',
    nombre: 'Javier Mendoza',
    empresa: 'EmpresaXYZ',
    ruc: '',
    email: 'javier.mendoza@gmail.com',
    telefono: '+51 911 222 333',
    productos: 'Tazas',
    cantidad: '20',
    mensaje: 'Necesito 20 tazas con logo.',
    estado: 'descartado',
    asignadoA: 'Carlos Rivas',
    notasInternas: 'No cumple pedido mínimo (50 und). Se le derivó a competencia.',
  },
  {
    id: 'LEAD-2026-0030',
    fecha: '2026-04-25',
    nombre: 'Patricia Jiménez',
    empresa: 'Universidad Continental',
    ruc: '20389123456',
    email: 'p.jimenez@continental.edu.pe',
    telefono: '+51 944 777 222',
    productos: 'Agendas 2027 y libretas',
    cantidad: '800',
    mensaje: 'Para entrega a docentes en ceremonia institucional. Diseño coordinado con identidad UCI.',
    estado: 'nuevo',
    asignadoA: null,
    notasInternas: '',
  },
];

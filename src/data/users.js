export const ROLES = {
  CLIENTE: 'cliente',
  VENDEDOR: 'vendedor',
  ALMACEN: 'almacen',
  PRODUCCION: 'produccion',
  GERENTE: 'gerente',
};

export const ROLE_LABELS = {
  cliente: 'Cliente',
  vendedor: 'Vendedor',
  almacen: 'Jefe de Almacén',
  produccion: 'Jefe de Producción',
  gerente: 'Gerente',
};

export const USERS = [
  {
    id: 1,
    email: 'cliente@empresa.com',
    password: 'cliente123',
    role: 'cliente',
    nombre: 'Lucía Montoya',
    empresa: 'Banco Sigma',
    ruc: '20512345671',
    telefono: '+51 999 111 222',
    direccion: 'Av. Javier Prado 1234, San Isidro, Lima',
  },
  {
    id: 2,
    email: 'vendedor@catjard.pe',
    password: 'vendedor123',
    role: 'vendedor',
    nombre: 'Carlos Rivas',
    cargo: 'Ejecutivo de cuentas',
  },
  {
    id: 3,
    email: 'almacen@catjard.pe',
    password: 'almacen123',
    role: 'almacen',
    nombre: 'Marta Salinas',
    cargo: 'Jefe de Almacén',
  },
  {
    id: 4,
    email: 'produccion@catjard.pe',
    password: 'produccion123',
    role: 'produccion',
    nombre: 'Diego Flores',
    cargo: 'Jefe de Producción',
  },
  {
    id: 5,
    email: 'gerente@catjard.pe',
    password: 'gerente123',
    role: 'gerente',
    nombre: 'Ana Reátegui',
    cargo: 'Gerente General',
  },
];

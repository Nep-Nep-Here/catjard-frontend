export function promocionVigente(promo, hoy = new Date()) {
  if (!promo?.activa) return false;
  const desde = promo.desde ? new Date(promo.desde) : null;
  const hasta = promo.hasta ? new Date(promo.hasta) : null;
  if (desde && hoy < desde) return false;
  if (hasta && hoy > new Date(hasta.getTime() + 24 * 60 * 60 * 1000 - 1)) return false;
  return true;
}

export function promocionAplica(promo, producto) {
  if (promo.aplicaA === 'todo') return true;
  if (promo.aplicaA === 'categoria') return producto.categoria === promo.aplicaValor;
  if (promo.aplicaA === 'producto') return Number(promo.aplicaValor) === producto.id;
  return false;
}

export function mejorPromocion(producto, promociones, hoy = new Date()) {
  const candidatas = (promociones || []).filter(
    (p) => promocionVigente(p, hoy) && promocionAplica(p, producto),
  );
  if (candidatas.length === 0) return null;
  return candidatas.reduce((mejor, p) =>
    Number(p.descuentoPct) > Number(mejor.descuentoPct) ? p : mejor,
  );
}

export function calcularPrecio(producto, promociones, hoy = new Date()) {
  const promo = mejorPromocion(producto, promociones, hoy);
  const precioBase = Number(producto.precio) || 0;
  if (!promo) {
    return { precioBase, precioFinal: precioBase, descuentoPct: 0, promocion: null };
  }
  const descuentoPct = Number(promo.descuentoPct);
  const precioFinal = +(precioBase * (1 - descuentoPct / 100)).toFixed(2);
  return { precioBase, precioFinal, descuentoPct, promocion: promo };
}

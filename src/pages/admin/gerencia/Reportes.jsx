import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectPedidos } from '../../../redux/slices/pedidosSlice.js';
import { selectCotizaciones } from '../../../redux/slices/cotizacionesSlice.js';
import { selectProductos } from '../../../redux/slices/productosSlice.js';
import { selectMovimientos } from '../../../redux/slices/movimientosSlice.js';
import AdminHeader, { Card } from '../../../components/AdminHeader.jsx';

export default function Reportes() {
  const pedidos = useSelector(selectPedidos);
  const cotizaciones = useSelector(selectCotizaciones);
  const productos = useSelector(selectProductos);
  const movimientos = useSelector(selectMovimientos);

  const ventasPorMes = useMemo(() => {
    const map = new Map();
    pedidos.forEach((p) => {
      const mes = (p.fechaPedido || '').slice(0, 7);
      if (!mes) return;
      const acc = map.get(mes) ?? { total: 0, count: 0 };
      acc.total += p.total ?? 0;
      acc.count += 1;
      map.set(mes, acc);
    });
    return Array.from(map.entries())
      .map(([mes, v]) => ({ mes, ...v }))
      .sort((a, b) => (a.mes < b.mes ? 1 : -1));
  }, [pedidos]);

  const ventasPorVendedor = useMemo(() => {
    const map = new Map();
    cotizaciones
      .filter((c) => c.estado === 'aprobada' && c.vendedor)
      .forEach((c) => {
        const acc = map.get(c.vendedor) ?? { total: 0, count: 0 };
        acc.total += c.total ?? 0;
        acc.count += 1;
        map.set(c.vendedor, acc);
      });
    return Array.from(map.entries())
      .map(([vendedor, v]) => ({ vendedor, ...v }))
      .sort((a, b) => b.total - a.total);
  }, [cotizaciones]);

  const ventasPorCliente = useMemo(() => {
    const map = new Map();
    pedidos.forEach((p) => {
      const acc = map.get(p.empresa) ?? { total: 0, count: 0 };
      acc.total += p.total ?? 0;
      acc.count += 1;
      map.set(p.empresa, acc);
    });
    return Array.from(map.entries())
      .map(([empresa, v]) => ({ empresa, ...v }))
      .sort((a, b) => b.total - a.total);
  }, [pedidos]);

  const ventasPorProducto = useMemo(() => {
    const map = new Map();
    pedidos.forEach((p) => {
      p.items.forEach((it) => {
        const acc = map.get(it.productoId) ?? { cantidad: 0, importe: 0 };
        acc.cantidad += it.cantidad;
        acc.importe += it.cantidad * it.precioUnit;
        map.set(it.productoId, acc);
      });
    });
    return Array.from(map.entries())
      .map(([id, v]) => ({ producto: productos.find((p) => p.id === id), ...v }))
      .sort((a, b) => b.importe - a.importe);
  }, [pedidos, productos]);

  const valorInventario = useMemo(
    () => productos.reduce((acc, p) => acc + p.stock * p.precio, 0),
    [productos],
  );

  const stockCritico = productos.filter((p) => p.stock <= p.stockMinimo);
  const totalEntradas = movimientos.filter((m) => m.tipo === 'entrada').reduce((acc, m) => acc + m.cantidad, 0);
  const totalSalidas = movimientos.filter((m) => m.tipo === 'salida').reduce((acc, m) => acc + m.cantidad, 0);

  const tiemposPedidos = useMemo(() => {
    return pedidos
      .filter((p) => p.estado === 'entregado')
      .map((p) => {
        const inicio = new Date(p.fechaPedido);
        const entrega = null;
        if (!entrega) return null;
        const fin = new Date(entrega);
        const dias = Math.round((fin - inicio) / (1000 * 60 * 60 * 24));
        return { id: p.id, empresa: p.empresa, dias };
      })
      .filter(Boolean);
  }, [pedidos]);

  const tiempoPromedio = tiemposPedidos.length
    ? Math.round(tiemposPedidos.reduce((acc, t) => acc + t.dias, 0) / tiemposPedidos.length)
    : 0;

  return (
    <section>
      <AdminHeader
        eyebrow="Dirección"
        title="Reportes"
        subtitle="Indicadores de ventas, inventario y producción"
      />

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <Card title="Ventas por mes">
          {ventasPorMes.length === 0 ? (
            <p className="text-cream/65 text-[13px]">Sin pedidos.</p>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead className="text-amber-light/80 text-[10px] tracking-widest uppercase">
                <tr className="border-b border-amber/10">
                  <th className="text-left py-2">Mes</th>
                  <th className="text-right py-2">Pedidos</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {ventasPorMes.map((v) => (
                  <tr key={v.mes} className="border-b border-amber/10 last:border-0 text-cream">
                    <td className="py-2">{v.mes}</td>
                    <td className="py-2 text-right text-cream/85">{v.count}</td>
                    <td className="py-2 text-right font-display font-bold text-amber">
                      S/ {v.total.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Ventas por vendedor (cotizaciones cerradas)">
          {ventasPorVendedor.length === 0 ? (
            <p className="text-cream/65 text-[13px]">Sin datos.</p>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead className="text-amber-light/80 text-[10px] tracking-widest uppercase">
                <tr className="border-b border-amber/10">
                  <th className="text-left py-2">Vendedor</th>
                  <th className="text-right py-2">Cotizaciones</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {ventasPorVendedor.map((v) => (
                  <tr key={v.vendedor} className="border-b border-amber/10 last:border-0 text-cream">
                    <td className="py-2">{v.vendedor}</td>
                    <td className="py-2 text-right text-cream/85">{v.count}</td>
                    <td className="py-2 text-right font-display font-bold text-amber">
                      S/ {v.total.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Ventas por cliente">
          {ventasPorCliente.length === 0 ? (
            <p className="text-cream/65 text-[13px]">Sin datos.</p>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead className="text-amber-light/80 text-[10px] tracking-widest uppercase">
                <tr className="border-b border-amber/10">
                  <th className="text-left py-2">Empresa</th>
                  <th className="text-right py-2">Pedidos</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {ventasPorCliente.map((v) => (
                  <tr key={v.empresa} className="border-b border-amber/10 last:border-0 text-cream">
                    <td className="py-2">{v.empresa}</td>
                    <td className="py-2 text-right text-cream/85">{v.count}</td>
                    <td className="py-2 text-right font-display font-bold text-amber">
                      S/ {v.total.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Top productos por facturación">
          {ventasPorProducto.length === 0 ? (
            <p className="text-cream/65 text-[13px]">Sin datos.</p>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead className="text-amber-light/80 text-[10px] tracking-widest uppercase">
                <tr className="border-b border-amber/10">
                  <th className="text-left py-2">Producto</th>
                  <th className="text-right py-2">Unidades</th>
                  <th className="text-right py-2">Importe</th>
                </tr>
              </thead>
              <tbody>
                {ventasPorProducto.slice(0, 10).map((v, i) => (
                  <tr key={i} className="border-b border-amber/10 last:border-0 text-cream">
                    <td className="py-2">{v.producto?.nombre ?? '—'}</td>
                    <td className="py-2 text-right text-cream/85">{v.cantidad}</td>
                    <td className="py-2 text-right font-display font-bold text-amber">
                      S/ {v.importe.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Inventario">
          <dl className="space-y-3 text-[14px]">
            <Row label="Total productos" value={productos.length} />
            <Row
              label="Valor del inventario"
              value={`S/ ${valorInventario.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            />
            <Row label="Stock crítico" value={stockCritico.length} />
            <Row label="Total entradas históricas" value={totalEntradas} />
            <Row label="Total salidas históricas" value={totalSalidas} />
          </dl>
        </Card>

        <Card title="Producción · Tiempos">
          {tiemposPedidos.length === 0 ? (
            <p className="text-cream/65 text-[13px]">No hay pedidos entregados aún.</p>
          ) : (
            <>
              <p className="text-[14px] text-cream">
                Tiempo promedio de entrega:{' '}
                <span className="font-display font-bold text-amber text-[20px]">
                  {tiempoPromedio} días
                </span>
              </p>
              <table className="w-full text-left text-[13px] mt-4">
                <thead className="text-amber-light/80 text-[10px] tracking-widest uppercase">
                  <tr className="border-b border-amber/10">
                    <th className="text-left py-2">Pedido</th>
                    <th className="text-left py-2">Cliente</th>
                    <th className="text-right py-2">Días</th>
                  </tr>
                </thead>
                <tbody>
                  {tiemposPedidos.map((t) => (
                    <tr key={t.id} className="border-b border-amber/10 last:border-0 text-cream">
                      <td className="py-2 font-mono text-[12px]">{t.id}</td>
                      <td className="py-2">{t.empresa}</td>
                      <td className="py-2 text-right font-display font-bold text-amber">{t.dias} d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Card>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-cream/75">{label}</dt>
      <dd className="text-cream text-right font-display font-bold">{value}</dd>
    </div>
  );
}

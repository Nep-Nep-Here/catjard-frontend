import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectClientes } from '../../../redux/slices/clientesSlice.js';
import AdminHeader, { EmptyState } from '../../../components/AdminHeader.jsx';

export default function Clientes() {
  const clientes = useSelector(selectClientes);
  const [search, setSearch] = useState('');

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        c.nombreComercial.toLowerCase().includes(q) ||
        c.razonSocial.toLowerCase().includes(q) ||
        c.ruc?.includes(q) ||
        c.contactoPrincipal?.toLowerCase().includes(q),
    );
  }, [clientes, search]);

  return (
    <section>
      <AdminHeader
        eyebrow="CRM"
        title="Clientes"
        subtitle={`${filtrados.length} de ${clientes.length}`}
      />

      <div className="mt-8 max-w-[420px]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por empresa, RUC o contacto…"
          className="w-full px-4 py-3 rounded-md bg-bg-dark border border-amber/30 text-cream focus:border-amber focus:outline-none text-[14px]"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-8">
          <EmptyState titulo="Sin coincidencias" descripcion="Ajusta los términos de búsqueda." />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-amber/15">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
              <tr>
                <th className="px-5 py-4">Empresa</th>
                <th className="px-5 py-4">RUC</th>
                <th className="px-5 py-4">Industria</th>
                <th className="px-5 py-4">Contacto</th>
                <th className="px-5 py-4">Teléfono</th>
                <th className="px-5 py-4">Cuenta</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => (
                <tr key={c.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                  <td className="px-5 py-3 text-cream font-medium">{c.nombreComercial}</td>
                  <td className="px-5 py-3 text-cream/85 font-mono">{c.ruc}</td>
                  <td className="px-5 py-3 text-cream/85">{c.industria || '—'}</td>
                  <td className="px-5 py-3 text-cream/85">{c.contactoPrincipal || '—'}</td>
                  <td className="px-5 py-3 text-cream/85">{c.telefono || '—'}</td>
                  <td className="px-5 py-3">
                    {c.cuentaActiva ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-green-500/15 text-green-300 border border-green-500/30">
                        Activa
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-cream/10 text-cream/60 border border-cream/15">
                        Sin cuenta
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to={`/admin/ventas/clientes/${c.id}`}
                      className="text-amber-light hover:text-amber underline underline-offset-4 text-[12px]"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

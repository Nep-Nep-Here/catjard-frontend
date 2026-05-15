import { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectUsuarios,
  selectUsuariosStatus,
  selectUsuariosError,
  fetchUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../../../redux/slices/usuariosSlice.js';
import { selectUser } from '../../../redux/slices/authSlice.js';
import { ROLE_LABELS, ROLES } from '../../../data/users.js';
import AdminHeader, { Card, EmptyState } from '../../../components/AdminHeader.jsx';

const ROLES_INTERNOS = [
  { id: ROLES.VENDEDOR,   label: ROLE_LABELS.vendedor },
  { id: ROLES.ALMACEN,    label: ROLE_LABELS.almacen },
  { id: ROLES.PRODUCCION, label: ROLE_LABELS.produccion },
  { id: ROLES.GERENTE,    label: ROLE_LABELS.gerente },
];

const EMPTY = {
  nombre: '',
  email: '',
  password: '',
  role: ROLES.VENDEDOR,
  cargo: '',
};

export default function Usuarios() {
  const usuarios = useSelector(selectUsuarios);
  const status = useSelector(selectUsuariosStatus);
  const loadError = useSelector(selectUsuariosError);
  const userActual = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === 'idle') dispatch(fetchUsuarios());
  }, [status, dispatch]);

  const [filtro, setFiltro] = useState('');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState(null);
  const [confirmando, setConfirmando] = useState(null);

  const internos = useMemo(
    () => usuarios.filter((u) => u.role !== 'cliente'),
    [usuarios],
  );

  const filtrados = useMemo(
    () => (filtro ? internos.filter((u) => u.role === filtro) : internos),
    [internos, filtro],
  );

  const startNew = () => {
    setForm(EMPTY);
    setEditando('new');
    setErr(null);
  };

  const startEdit = (u) => {
    setForm({ ...u, password: '' });
    setEditando(u.id);
    setErr(null);
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!form.nombre || !form.email) return setErr('Nombre y correo son obligatorios.');
    const yaExiste = internos.find(
      (u) => u.email.toLowerCase() === form.email.toLowerCase() && u.id !== form.id,
    );
    if (yaExiste) return setErr('Ya existe un usuario con ese correo.');
    if (editando === 'new' && (!form.password || form.password.length < 6))
      return setErr('La contraseña debe tener al menos 6 caracteres.');

    try {
      if (editando === 'new') {
        await dispatch(crearUsuario(form)).unwrap();
      } else {
        await dispatch(actualizarUsuario(form)).unwrap();
      }
      setEditando(null);
    } catch (msg) {
      setErr(typeof msg === 'string' ? msg : 'No se pudo guardar el usuario.');
    }
  };

  const onDelete = async (id) => {
    try {
      await dispatch(eliminarUsuario(id)).unwrap();
    } catch (msg) {
      setErr(typeof msg === 'string' ? msg : 'No se pudo eliminar el usuario.');
    }
    setConfirmando(null);
  };

  return (
    <section>
      <AdminHeader
        eyebrow="Dirección"
        title="Usuarios del sistema"
        subtitle={`${filtrados.length} de ${internos.length} usuarios internos`}
        action={
          editando == null && (
            <button
              onClick={startNew}
              className="inline-flex items-center gap-2 rounded-full bg-amber text-brown font-semibold px-5 py-2.5 text-[13px] hover:bg-amber-light transition-colors"
            >
              + Crear usuario
            </button>
          )
        }
      />

      {editando != null && (
        <Card title={editando === 'new' ? 'Nuevo usuario interno' : 'Editar usuario'} className="mt-8">
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            <Field label="Nombre completo" required>
              <input name="nombre" value={form.nombre} onChange={onChange} required className={inputCls} />
            </Field>
            <Field label="Correo" required>
              <input type="email" name="email" value={form.email} onChange={onChange} required className={inputCls} />
            </Field>
            <Field
              label="Contraseña"
              required={editando === 'new'}
              hint={
                editando === 'new'
                  ? 'Mínimo 6 caracteres.'
                  : 'No se puede cambiar la contraseña desde esta vista.'
              }
            >
              <input
                type="text"
                name="password"
                value={editando === 'new' ? form.password : ''}
                onChange={onChange}
                required={editando === 'new'}
                disabled={editando !== 'new'}
                className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </Field>
            <Field
              label="Rol"
              required
              hint={editando !== 'new' ? 'El rol no se puede modificar después de crear el usuario.' : undefined}
            >
              <select
                name="role"
                value={form.role}
                onChange={onChange}
                required
                disabled={editando !== 'new'}
                className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {ROLES_INTERNOS.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Cargo" className="sm:col-span-2">
              <input name="cargo" value={form.cargo ?? ''} onChange={onChange} className={inputCls} placeholder="Ej. Ejecutivo de cuentas senior" />
            </Field>

            {err && (
              <div className="sm:col-span-2 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">{err}</div>
            )}

            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-amber text-brown font-semibold text-[13px] hover:bg-amber-light transition-colors"
              >
                {editando === 'new' ? 'Crear usuario' : 'Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="px-4 py-2.5 rounded-full text-cream/70 text-[13px] hover:text-cream"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      {editando == null && (
        <>
          {loadError && (
            <div className="mt-8 p-3 rounded bg-red-400/10 text-red-300 text-[13px]">
              No se pudieron cargar los usuarios: {loadError}
            </div>
          )}
          {status === 'loading' && (
            <p className="mt-8 text-cream/60 text-[13px]">Cargando usuarios…</p>
          )}
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              onClick={() => setFiltro('')}
              className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
                filtro === ''
                  ? 'bg-amber text-brown border-amber font-semibold'
                  : 'bg-transparent text-cream/80 border-amber/25 hover:border-amber/60 hover:text-cream'
              }`}
            >
              Todos
            </button>
            {ROLES_INTERNOS.map((r) => (
              <button
                key={r.id}
                onClick={() => setFiltro(r.id)}
                className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
                  filtro === r.id
                    ? 'bg-amber text-brown border-amber font-semibold'
                    : 'bg-transparent text-cream/80 border-amber/25 hover:border-amber/60 hover:text-cream'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {filtrados.length === 0 ? (
            <div className="mt-8">
              <EmptyState titulo="Sin usuarios" descripcion="Crea el primer usuario interno." />
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto rounded-xl border border-amber/15">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-amber/5 text-amber-light/80 text-[10px] tracking-widest uppercase">
                  <tr>
                    <th className="px-5 py-4">Nombre</th>
                    <th className="px-5 py-4">Correo</th>
                    <th className="px-5 py-4">Rol</th>
                    <th className="px-5 py-4">Cargo</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((u) => (
                    <tr key={u.id} className="border-t border-amber/10 hover:bg-amber/5 transition-colors">
                      <td className="px-5 py-3 text-cream font-medium">
                        {u.nombre}
                        {userActual?.id === u.id && (
                          <span className="ml-2 text-[10px] text-amber-light/70">(tú)</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-cream/85 font-mono text-[12px]">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-amber/10 text-amber-light border border-amber/30">
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-cream/85">{u.cargo ?? '—'}</td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => startEdit(u)}
                          className="text-amber-light hover:text-amber underline underline-offset-4 text-[12px] mr-3"
                        >
                          Editar
                        </button>
                        {userActual?.id === u.id ? (
                          <span className="text-cream/40 text-[11px]">cuenta actual</span>
                        ) : confirmando === u.id ? (
                          <span className="text-[12px]">
                            <button
                              onClick={() => onDelete(u.id)}
                              className="text-red-300 hover:text-red-200 underline underline-offset-4 mr-2"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setConfirmando(null)}
                              className="text-cream/60 hover:text-cream"
                            >
                              cancelar
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmando(u.id)}
                            className="text-red-300/80 hover:text-red-300 underline underline-offset-4 text-[12px]"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-md bg-bg-dark border border-amber/30 text-cream text-[14px] focus:border-amber focus:outline-none';

function Field({ label, required, hint, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[11px] tracking-[0.2em] uppercase text-amber mb-1.5">
        {label}
        {required && <span className="text-amber-light/60 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-amber-light/55">{hint}</p>}
    </div>
  );
}

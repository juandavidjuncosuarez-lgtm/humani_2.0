
import { useEffect, useState } from 'react';
import './Usuarios.css';

const API_URL = 'http://localhost:3000/api/usuarios';

function Usuarios({ token }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');

  const [formulario, setFormulario] = useState({
    nombre: '',
    usuario: '',
    password: '',
    rol: 'Empleado'
  });

  // =====================================
  // CONFIGURAR ENCABEZADOS DE SEGURIDAD
  // =====================================

  const obtenerHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  });

  // =====================================
  // CONSULTAR USUARIOS
  // =====================================

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setMensaje('');

      const respuesta = await fetch(API_URL, {
        method: 'GET',
        headers: obtenerHeaders()
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No fue posible consultar usuarios');
      }

      setUsuarios(datos);

    } catch (error) {
      console.error('Error al consultar usuarios:', error);
      setMensaje(error.message);
      setTipoMensaje('error');

    } finally {
      setCargando(false);
    }
  };

 useEffect(() => {
  if (!token) return;

  let activo = true;

  const consultarUsuarios = async () => {
    try {
      setCargando(true);
      setMensaje('');

      const respuesta = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || 'No fue posible consultar usuarios'
        );
      }

      if (activo) {
        setUsuarios(datos);
      }

    } catch (error) {
      console.error('Error al consultar usuarios:', error);

      if (activo) {
        setMensaje(error.message);
        setTipoMensaje('error');
      }

    } finally {
      if (activo) {
        setCargando(false);
      }
    }
  };

  consultarUsuarios();

  return () => {
    activo = false;
  };
}, [token]);

  // =====================================
  // CONTROLAR FORMULARIO
  // =====================================

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  };

  // =====================================
  // CREAR USUARIO
  // =====================================

  const crearUsuario = async (e) => {
    e.preventDefault();

    if (
      !formulario.nombre.trim() ||
      !formulario.usuario.trim() ||
      !formulario.password
    ) {
      setMensaje('Completa todos los campos.');
      setTipoMensaje('error');
      return;
    }

    if (formulario.password.length < 8) {
      setMensaje('La contraseña debe tener al menos 8 caracteres.');
      setTipoMensaje('error');
      return;
    }

    try {
      setGuardando(true);
      setMensaje('');

      const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: obtenerHeaders(),
        body: JSON.stringify(formulario)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No fue posible crear el usuario');
      }

      setMensaje('Usuario creado correctamente.');
      setTipoMensaje('exito');

      setFormulario({
        nombre: '',
        usuario: '',
        password: '',
        rol: 'Empleado'
      });

      setMostrarFormulario(false);

      await cargarUsuarios();

    } catch (error) {
      console.error('Error al crear usuario:', error);
      setMensaje(error.message);
      setTipoMensaje('error');

    } finally {
      setGuardando(false);
    }
  };

  // =====================================
  // INTERFAZ
  // =====================================

  return (
    <div className="usuarios-container">

      <div className="usuarios-encabezado">
        <div>
          <h2>Gestión de usuarios</h2>
          <p>Administra las cuentas y los roles del sistema HUMANI.</p>
        </div>

        <button
          className="usuarios-boton-crear"
          onClick={() => {
            setMostrarFormulario(!mostrarFormulario);
            setMensaje('');
          }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Crear usuario'}
        </button>
      </div>

      {mensaje && (
        <div className={`usuarios-mensaje ${tipoMensaje}`}>
          {mensaje}
        </div>
      )}

      {mostrarFormulario && (
        <form className="usuarios-formulario" onSubmit={crearUsuario}>

          <div className="usuarios-formulario-titulo">
            <h3>Registrar nuevo usuario</h3>
            <p>Completa la información de la nueva cuenta.</p>
          </div>

          <div className="usuarios-campos">

            <div className="usuarios-campo">
              <label>Nombre completo</label>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre del usuario"
                value={formulario.nombre}
                onChange={manejarCambio}
                maxLength={100}
                required
              />
            </div>

            <div className="usuarios-campo">
              <label>Nombre de usuario</label>
              <input
                type="text"
                name="usuario"
                placeholder="Usuario para iniciar sesión"
                value={formulario.usuario}
                onChange={manejarCambio}
                maxLength={50}
                required
              />
            </div>

            <div className="usuarios-campo">
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                placeholder="Mínimo 8 caracteres"
                value={formulario.password}
                onChange={manejarCambio}
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="usuarios-campo">
              <label>Rol del usuario</label>
              <select
                name="rol"
                value={formulario.rol}
                onChange={manejarCambio}
              >
                <option value="Empleado">Empleado</option>
                <option value="Jefe">Jefe</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

          </div>

          <div className="usuarios-formulario-acciones">
            <button
              type="submit"
              className="usuarios-boton-guardar"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Registrar usuario'}
            </button>

            <button
              type="button"
              className="usuarios-boton-cancelar"
              onClick={() => setMostrarFormulario(false)}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>

        </form>
      )}

      <div className="usuarios-tabla-contenedor">

        <div className="usuarios-tabla-encabezado">
          <div>
            <h3>Usuarios registrados</h3>
            <p>Listado de cuentas existentes en HUMANI.</p>
          </div>

          <span className="usuarios-total">
            {usuarios.length} usuarios
          </span>
        </div>

        {cargando ? (
          <p className="usuarios-estado">Cargando usuarios...</p>
        ) : usuarios.length === 0 ? (
          <p className="usuarios-estado">
            No hay usuarios registrados.
          </p>
        ) : (
          <div className="usuarios-tabla-scroll">
            <table className="usuarios-tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Rol</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((persona) => (
                  <tr key={persona.id}>
                    <td>#{persona.id}</td>
                    <td>{persona.nombre}</td>
                    <td>
                      <span
                        className={`usuarios-rol ${persona.rol.toLowerCase()}`}
                      >
                        {persona.rol}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}

export default Usuarios;

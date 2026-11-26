
import { useEffect, useState } from 'react';
import './Proveedores.css';
import { headersAutenticacion } from '../utils/auth';

const API_URL = 'https://humani-ok1w.onrender.com/api/proveedores';

function Proveedores({ soloLectura = false }) {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);

  const [formulario, setFormulario] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    producto: ''
  });

  // CARGAR PROVEEDORES
  const cargarProveedores = async () => {
    try {
      const respuesta = await fetch(API_URL, {
        headers: headersAutenticacion()
      });

      if (!respuesta.ok) {
        throw new Error('Error al consultar los proveedores');
      }

      const datos = await respuesta.json();
      setProveedores(datos);
      setMensaje('');
    } catch (error) {
      console.error(error);
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  };

  // CARGA INICIAL
  useEffect(() => {
    let activo = true;

    const consultar = async () => {
      try {
        const respuesta = await fetch(API_URL, {
          headers: headersAutenticacion()
        });

        if (!respuesta.ok) {
          throw new Error('Error al consultar los proveedores');
        }

        const datos = await respuesta.json();

        if (activo) {
          setProveedores(datos);
          setMensaje('');
        }
      } catch (error) {
        if (activo) {
          setMensaje(error.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    consultar();

    return () => {
      activo = false;
    };
  }, []);

  // CONTROLAR FORMULARIO
  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  };

  // ABRIR FORMULARIO
  const abrirFormulario = () => {
    if (soloLectura) return;

    setEditando(null);

    setFormulario({
      nombre: '',
      telefono: '',
      correo: '',
      producto: ''
    });

    setMostrarFormulario(true);
    setMensaje('');
  };

  // GUARDAR PROVEEDOR
  const guardarProveedor = async (e) => {
    e.preventDefault();

    if (soloLectura) return;

    try {
      const url = editando
        ? `${API_URL}/${editando}`
        : API_URL;

      const respuesta = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: headersAutenticacion(true),
        body: JSON.stringify(formulario)
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No se pudo guardar el proveedor'
        );
      }

      setMostrarFormulario(false);
      setEditando(null);

      setFormulario({
        nombre: '',
        telefono: '',
        correo: '',
        producto: ''
      });

      setMensaje(resultado.mensaje || 'Proveedor guardado correctamente');

      await cargarProveedores();
    } catch (error) {
      console.error(error);
      setMensaje(error.message);
    }
  };

  // EDITAR PROVEEDOR
  const editarProveedor = (proveedor) => {
    if (soloLectura) return;

    setEditando(proveedor.id);

    setFormulario({
      nombre: proveedor.nombre || '',
      telefono: proveedor.telefono || '',
      correo: proveedor.correo || '',
      producto: proveedor.producto || ''
    });

    setMostrarFormulario(true);
    setMensaje('');
  };

  // ELIMINAR PROVEEDOR
  const eliminarProveedor = async (id) => {
    if (soloLectura) return;

    const confirmar = window.confirm(
      '¿Estás seguro de eliminar este proveedor?'
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: headersAutenticacion()
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No se pudo eliminar el proveedor'
        );
      }

      setMensaje(resultado.mensaje || 'Proveedor eliminado correctamente');

      await cargarProveedores();
    } catch (error) {
      console.error(error);
      setMensaje(error.message);
    }
  };

  // VISTA PRINCIPAL
  return (
    <div className="proveedores-container">

      <div className="proveedores-encabezado">
        <div>
          <h2>Gestión de proveedores</h2>

          <p>
            {soloLectura
              ? 'Consulta la información de tus proveedores.'
              : 'Consulta y administra tus proveedores.'}
          </p>
        </div>

        {!soloLectura && (
          <button
            className="proveedores-boton-crear"
            onClick={abrirFormulario}
          >
            + Agregar proveedor
          </button>
        )}
      </div>

      {mensaje && (
        <div className="proveedores-mensaje">
          {mensaje}
        </div>
      )}

      {!soloLectura && mostrarFormulario && (
        <div className="proveedores-formulario">

          <h3>
            {editando ? 'Editar proveedor' : 'Registrar proveedor'}
          </h3>

          <form onSubmit={guardarProveedor}>

            <div className="proveedores-campos">

              <div>
                <label>Nombre del proveedor</label>
                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  placeholder="Nombre del proveedor"
                  required
                />
              </div>

              <div>
                <label>Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={formulario.telefono}
                  onChange={manejarCambio}
                  placeholder="Número de teléfono"
                  required
                />
              </div>

              <div>
                <label>Correo electrónico</label>
                <input
                  type="email"
                  name="correo"
                  value={formulario.correo}
                  onChange={manejarCambio}
                  placeholder="Correo electrónico"
                  required
                />
              </div>

              <div>
                <label>Producto que suministra</label>
                <input
                  type="text"
                  name="producto"
                  value={formulario.producto}
                  onChange={manejarCambio}
                  placeholder="Producto que suministra"
                  required
                />
              </div>

            </div>

            <div className="proveedores-formulario-botones">

              <button
                type="submit"
                className="proveedores-boton-guardar"
              >
                {editando ? 'Guardar cambios' : 'Registrar proveedor'}
              </button>

              <button
                type="button"
                className="proveedores-boton-cancelar"
                onClick={() => {
                  setMostrarFormulario(false);
                  setEditando(null);
                }}
              >
                Cancelar
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="proveedores-listado">

        <h3>Proveedores registrados</h3>

        {cargando ? (
          <div className="proveedores-vacio">
            Cargando proveedores...
          </div>
        ) : proveedores.length === 0 ? (
          <div className="proveedores-vacio">
            <h3>No hay proveedores registrados</h3>
            <p>Cuando registres un proveedor, aparecerá aquí.</p>
          </div>
        ) : (

          <div className="proveedores-lista">

            {proveedores.map((proveedor) => (
              <article
                className="proveedor-card"
                key={proveedor.id}
              >

                <div className="proveedor-card-encabezado">

                  <div>
                    <span className="proveedor-identificador">
                      PROVEEDOR #{proveedor.id}
                    </span>

                    <h3>{proveedor.nombre}</h3>
                  </div>

                  <span className="proveedor-etiqueta">
                    Proveedor
                  </span>

                </div>

                <div className="proveedor-informacion">

                  <div className="proveedor-detalle">
                    <span>Teléfono de contacto</span>
                    <strong>
                      {proveedor.telefono || 'No disponible'}
                    </strong>
                  </div>

                  <div className="proveedor-detalle">
                    <span>Correo electrónico</span>
                    <strong>
                      {proveedor.correo || 'No disponible'}
                    </strong>
                  </div>

                  <div className="proveedor-detalle proveedor-producto">
                    <span>Producto que suministra</span>
                    <strong>
                      {proveedor.producto || 'No disponible'}
                    </strong>
                  </div>

                </div>

                {!soloLectura && (
                  <div className="proveedor-acciones">

                    <button
                      type="button"
                      className="proveedor-boton-editar"
                      onClick={() => editarProveedor(proveedor)}
                    >
                      Editar proveedor
                    </button>

                    <button
                      type="button"
                      className="proveedor-boton-eliminar"
                      onClick={() => eliminarProveedor(proveedor.id)}
                    >
                      Eliminar proveedor
                    </button>

                  </div>
                )}

              </article>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Proveedores;


import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000/api/proveedores';

function Proveedores() {
  // =====================================
  // ESTADOS
  // =====================================

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

  // =====================================
  // CARGAR PROVEEDORES
  // =====================================

  const cargarProveedores = async () => {
    try {
      const respuesta = await fetch(API_URL);

      if (!respuesta.ok) {
        throw new Error('Error al consultar los proveedores');
      }

      const datos = await respuesta.json();
      setProveedores(datos);

    } catch (error) {
      console.error(error);
      setMensaje(error.message);

    } finally {
      setCargando(false);
    }
  };

  // =====================================
  // CARGA INICIAL
  // =====================================

  useEffect(() => {
    let activo = true;

    const consultar = async () => {
      try {
        const respuesta = await fetch(API_URL);

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
  // ABRIR FORMULARIO
  // =====================================

  const abrirFormulario = () => {
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

  // =====================================
  // GUARDAR PROVEEDOR
  // =====================================

  const guardarProveedor = async (e) => {
    e.preventDefault();

    try {
      const url = editando
        ? `${API_URL}/${editando}`
        : API_URL;

      const respuesta = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
      setMensaje(resultado.mensaje);

      await cargarProveedores();

    } catch (error) {
      console.error(error);
      setMensaje(error.message);
    }
  };

  // =====================================
  // EDITAR PROVEEDOR
  // =====================================

  const editarProveedor = (proveedor) => {
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

  // =====================================
  // ELIMINAR PROVEEDOR
  // =====================================

  const eliminarProveedor = async (id) => {
    const confirmar = window.confirm(
      '¿Estás seguro de eliminar este proveedor?'
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No se pudo eliminar el proveedor'
        );
      }

      setMensaje(resultado.mensaje);
      await cargarProveedores();

    } catch (error) {
      console.error(error);
      setMensaje(error.message);
    }
  };

  // =====================================
  // VISTA PRINCIPAL
  // =====================================

  return (
    <div className="proveedores-container">

      <div className="proveedores-encabezado">
        <div>
          <h2>Gestión de proveedores</h2>
          <p>Consulta y administra tus proveedores.</p>
        </div>

        <button onClick={abrirFormulario}>
          + Agregar proveedor
        </button>
      </div>

      {mensaje && (
        <p className="proveedores-mensaje">
          {mensaje}
        </p>
      )}

      {/* FORMULARIO */}

      {mostrarFormulario && (
        <div className="proveedores-formulario">

          <h3>
            {editando ? 'Editar proveedor' : 'Registrar proveedor'}
          </h3>

          <form onSubmit={guardarProveedor}>

            <label>Nombre del proveedor</label>
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              placeholder="Nombre del proveedor"
              required
            />

            <label>Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formulario.telefono}
              onChange={manejarCambio}
              placeholder="Número de teléfono"
              required
            />

            <label>Correo electrónico</label>
            <input
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={manejarCambio}
              placeholder="Correo electrónico"
              required
            />

            <label>Producto que suministra</label>
            <input
              type="text"
              name="producto"
              value={formulario.producto}
              onChange={manejarCambio}
              placeholder="Producto que suministra"
              required
            />

            <div className="proveedores-formulario-botones">

              <button type="submit">
                {editando ? 'Guardar cambios' : 'Registrar proveedor'}
              </button>

              <button
                type="button"
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

      {/* LISTA DE PROVEEDORES */}

      {cargando ? (
        <p>Cargando proveedores...</p>

      ) : proveedores.length === 0 ? (
        <p>No hay proveedores registrados.</p>

      ) : (

        <div className="proveedores-lista">

          {proveedores.map((proveedor) => (
            <article
              className="proveedor-card"
              key={proveedor.id}
            >

              <h3>{proveedor.nombre}</h3>

              <p>
                <strong>Teléfono:</strong> {proveedor.telefono}
              </p>

              <p>
                <strong>Correo:</strong> {proveedor.correo}
              </p>

              <p>
                <strong>Producto:</strong> {proveedor.producto}
              </p>

              <div className="proveedor-acciones">

                <button
                  type="button"
                  onClick={() => editarProveedor(proveedor)}
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => eliminarProveedor(proveedor.id)}
                >
                  Eliminar
                </button>

              </div>

            </article>
          ))}

        </div>
      )}

    </div>
  );
}

export default Proveedores;

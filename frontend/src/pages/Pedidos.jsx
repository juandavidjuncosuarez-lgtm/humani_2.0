
import { useEffect, useState } from 'react';

const API_PEDIDOS = 'http://localhost:3000/api/pedidos';
const API_PRODUCTOS = 'http://localhost:3000/api/productos';
const API_PROVEEDORES = 'http://localhost:3000/api/proveedores';

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [formulario, setFormulario] = useState({
    proveedor_id: '',
    producto_id: '',
    cantidad: ''
  });

  // =====================================
  // CARGAR INFORMACIÓN INICIAL
  // =====================================

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        const [resPedidos, resProductos, resProveedores] =
          await Promise.all([
            fetch(API_PEDIDOS),
            fetch(API_PRODUCTOS),
            fetch(API_PROVEEDORES)
          ]);

        if (!resPedidos.ok || !resProductos.ok || !resProveedores.ok) {
          throw new Error('No se pudo cargar toda la información');
        }

        const [datosPedidos, datosProductos, datosProveedores] =
          await Promise.all([
            resPedidos.json(),
            resProductos.json(),
            resProveedores.json()
          ]);

        if (activo) {
          setPedidos(datosPedidos);
          setProductos(datosProductos);
          setProveedores(datosProveedores);
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

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  // =====================================
  // CARGAR PEDIDOS
  // =====================================

  const cargarPedidos = async () => {
    try {
      const respuesta = await fetch(API_PEDIDOS);

      if (!respuesta.ok) {
        throw new Error('Error al consultar los pedidos');
      }

      const datos = await respuesta.json();
      setPedidos(datos);
      setMensaje('');
    } catch (error) {
      setMensaje(error.message);
    }
  };

  // =====================================
  // MANEJAR CAMBIOS DEL FORMULARIO
  // =====================================

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  };

  // =====================================
  // REGISTRAR PEDIDO
  // =====================================

  const guardarPedido = async (e) => {
    e.preventDefault();

    if (
      !formulario.proveedor_id ||
      !formulario.producto_id ||
      !formulario.cantidad ||
      Number(formulario.cantidad) <= 0
    ) {
      setMensaje('Completa todos los campos correctamente');
      return;
    }

    try {
      const respuesta = await fetch(API_PEDIDOS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proveedor_id: Number(formulario.proveedor_id),
          producto_id: Number(formulario.producto_id),
          cantidad: Number(formulario.cantidad)
        })
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'Error al registrar el pedido');
      }

      setFormulario({
        proveedor_id: '',
        producto_id: '',
        cantidad: ''
      });

      setMostrarFormulario(false);
      setMensaje('Pedido registrado correctamente');

      await cargarPedidos();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  // =====================================
  // CAMBIAR ESTADO
  // =====================================

  const cambiarEstado = async (id, estado) => {
    try {
      const respuesta = await fetch(`${API_PEDIDOS}/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado })
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'Error al cambiar el estado');
      }

      setMensaje('Estado actualizado correctamente');
      await cargarPedidos();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  // =====================================
  // ELIMINAR PEDIDO
  // =====================================

  const eliminarPedido = async (id) => {
    const confirmar = window.confirm(
      '¿Estás seguro de eliminar este pedido?'
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API_PEDIDOS}/${id}`, {
        method: 'DELETE'
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'Error al eliminar el pedido');
      }

      setMensaje('Pedido eliminado correctamente');
      await cargarPedidos();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  // =====================================
  // FORMATO DE DINERO
  // =====================================

  const formatoPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(Number(valor) || 0);
  };

  // =====================================
  // RESUMEN DE PEDIDOS
  // =====================================

  const enProceso = pedidos.filter(
    (pedido) => pedido.estado === 'En proceso'
  ).length;

  const entregados = pedidos.filter(
    (pedido) => pedido.estado === 'Entregado a la tienda'
  ).length;

  const cancelados = pedidos.filter(
    (pedido) => pedido.estado === 'Cancelado'
  ).length;

  // =====================================
  // INTERFAZ
  // =====================================

  if (cargando) {
    return <div className="pedidos-contenedor">Cargando pedidos...</div>;
  }

  return (
    <div className="pedidos-contenedor">

      <div className="pedidos-encabezado">
        <div>
          <h2>Gestión de pedidos</h2>
          <p>Administra las solicitudes de productos a proveedores.</p>
        </div>

        <button
          className="pedidos-boton-crear"
          onClick={() => {
            setMensaje('');
            setMostrarFormulario(!mostrarFormulario);
          }}
        >
          {mostrarFormulario ? 'Cerrar formulario' : '+ Crear pedido'}
        </button>
      </div>

      {mensaje && (
        <div className="pedidos-mensaje">
          {mensaje}
        </div>
      )}

      <div className="pedidos-resumen">

        <div className="pedido-resumen-card">
          <span>Total de pedidos</span>
          <strong>{pedidos.length}</strong>
        </div>

        <div className="pedido-resumen-card">
          <span>En proceso</span>
          <strong>{enProceso}</strong>
        </div>

        <div className="pedido-resumen-card">
          <span>Entregados</span>
          <strong>{entregados}</strong>
        </div>

        <div className="pedido-resumen-card">
          <span>Cancelados</span>
          <strong>{cancelados}</strong>
        </div>

      </div>

      {mostrarFormulario && (
        <form className="pedidos-formulario" onSubmit={guardarPedido}>

          <h3>Registrar nuevo pedido</h3>

          <div className="pedidos-campos">

            <div>
              <label>Proveedor</label>

              <select
                name="proveedor_id"
                value={formulario.proveedor_id}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccionar proveedor</option>

                {proveedores.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Producto</label>

              <select
                name="producto_id"
                value={formulario.producto_id}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccionar producto</option>

                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Cantidad solicitada</label>

              <input
                type="number"
                name="cantidad"
                min="1"
                value={formulario.cantidad}
                onChange={manejarCambio}
                placeholder="Ejemplo: 10"
                required
              />
            </div>

          </div>

          <button type="submit" className="pedidos-boton-guardar">
            Guardar pedido
          </button>

        </form>
      )}

      <div className="pedidos-listado">

        <h3>Pedidos registrados</h3>

        {pedidos.length === 0 ? (
          <div className="pedidos-vacio">
            <h3>No hay pedidos registrados</h3>
            <p>Cuando registres un pedido, aparecerá aquí.</p>
          </div>
        ) : (

          <div className="pedidos-tabla-contenedor">
            <table className="pedidos-tabla">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Proveedor</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio unitario</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id}>

                    <td>#{pedido.id}</td>

                    <td>{pedido.proveedor}</td>

                    <td>{pedido.producto}</td>

                    <td>{pedido.cantidad}</td>

                    <td>{formatoPrecio(pedido.precio_unitario)}</td>

                    <td>
                      {pedido.fecha
                        ? new Date(pedido.fecha).toLocaleDateString('es-CO')
                        : 'Sin fecha'}
                    </td>

                    <td>
                      <select
                        className={`pedido-estado ${
                          pedido.estado === 'Entregado a la tienda'
                            ? 'estado-entregado'
                            : pedido.estado === 'Cancelado'
                            ? 'estado-cancelado'
                            : 'estado-proceso'
                        }`}
                        value={pedido.estado || 'En proceso'}
                        onChange={(e) =>
                          cambiarEstado(pedido.id, e.target.value)
                        }
                      >
                        <option value="En proceso">En proceso</option>
                        <option value="Entregado a la tienda">
                          Entregado a la tienda
                        </option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>

                    <td>
                      <button
                        className="pedido-boton-eliminar"
                        onClick={() => eliminarPedido(pedido.id)}
                      >
                        Eliminar
                      </button>
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

export default Pedidos;

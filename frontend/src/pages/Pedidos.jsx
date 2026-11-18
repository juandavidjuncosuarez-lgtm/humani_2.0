
import { useEffect, useState } from 'react';
import './Pedidos.css';
import { headersAutenticacion } from '../utils/auth';

const API_PEDIDOS = 'http://localhost:3000/api/pedidos';
const API_PRODUCTOS = 'http://localhost:3000/api/productos';
const API_PROVEEDORES = 'http://localhost:3000/api/proveedores';

function Pedidos({ soloLectura = false }) {
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

  // CARGA INICIAL DE PEDIDOS, PRODUCTOS Y PROVEEDORES
  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        const [resPedidos, resProductos, resProveedores] =
          await Promise.all([
            fetch(API_PEDIDOS, {
              headers: headersAutenticacion()
            }),
            fetch(API_PRODUCTOS, {
              headers: headersAutenticacion()
            }),
            fetch(API_PROVEEDORES, {
              headers: headersAutenticacion()
            })
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

  // ACTUALIZAR LISTADO DE PEDIDOS
  const cargarPedidos = async () => {
    try {
      const respuesta = await fetch(API_PEDIDOS, {
        headers: headersAutenticacion()
      });

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

  // CONTROLAR CAMBIOS DEL FORMULARIO
  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  };

  // REGISTRAR UN NUEVO PEDIDO
  const guardarPedido = async (e) => {
    e.preventDefault();

    if (soloLectura) return;

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
        headers: headersAutenticacion(true),
        body: JSON.stringify({
          proveedor_id: Number(formulario.proveedor_id),
          producto_id: Number(formulario.producto_id),
          cantidad: Number(formulario.cantidad)
        })
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'Error al registrar el pedido'
        );
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

  // CAMBIAR ESTADO DEL PEDIDO
  const cambiarEstado = async (id, estado) => {
    if (soloLectura) return;

    try {
      const respuesta = await fetch(`${API_PEDIDOS}/${id}/estado`, {
        method: 'PUT',
        headers: headersAutenticacion(true),
        body: JSON.stringify({ estado })
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'Error al cambiar el estado'
        );
      }

      setMensaje('Estado actualizado correctamente');
      await cargarPedidos();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  // ELIMINAR PEDIDO
  const eliminarPedido = async (id) => {
    if (soloLectura) return;

    const confirmar = window.confirm(
      '¿Estás seguro de eliminar este pedido?'
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API_PEDIDOS}/${id}`, {
        method: 'DELETE',
        headers: headersAutenticacion()
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'Error al eliminar el pedido'
        );
      }

      setMensaje('Pedido eliminado correctamente');
      await cargarPedidos();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  // FORMATEAR VALORES EN PESOS COLOMBIANOS
  const formatoPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(Number(valor) || 0);
  };

  // FORMATEAR FECHA DEL PEDIDO
  const formatoFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';

    const fechaPedido = new Date(fecha);

    if (Number.isNaN(fechaPedido.getTime())) {
      return 'Fecha no disponible';
    }

    return fechaPedido.toLocaleDateString('es-CO');
  };

  // ASIGNAR CLASE VISUAL SEGÚN EL ESTADO
  const obtenerClaseEstado = (estado) => {
    if (estado === 'Entregado') return 'estado-entregado';
    if (estado === 'Cancelado') return 'estado-cancelado';
    return 'estado-proceso';
  };

  // CONTABILIZAR PEDIDOS POR ESTADO
  const pendientes = pedidos.filter(
    (pedido) => pedido.estado === 'Pendiente'
  ).length;

  const entregados = pedidos.filter(
    (pedido) => pedido.estado === 'Entregado'
  ).length;

  const cancelados = pedidos.filter(
    (pedido) => pedido.estado === 'Cancelado'
  ).length;

  if (cargando) {
    return (
      <div className="pedidos-contenedor">
        Cargando pedidos...
      </div>
    );
  }

  // VISTA PRINCIPAL
  return (
    <div className="pedidos-contenedor">

      <div className="pedidos-encabezado">
        <div>
          <h2>Gestión de pedidos</h2>
          <p>
            {soloLectura
              ? 'Consulta los pedidos realizados a los proveedores.'
              : 'Administra las solicitudes de productos a proveedores.'}
          </p>
        </div>

        {!soloLectura && (
          <button
            className="pedidos-boton-crear"
            onClick={() => {
              setMensaje('');
              setMostrarFormulario(!mostrarFormulario);
            }}
          >
            {mostrarFormulario ? 'Cerrar formulario' : '+ Crear pedido'}
          </button>
        )}
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
          <span>Pendientes</span>
          <strong>{pendientes}</strong>
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

      {!soloLectura && mostrarFormulario && (
        <form
          className="pedidos-formulario"
          onSubmit={guardarPedido}
        >
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
                  <option
                    key={proveedor.id}
                    value={proveedor.id}
                  >
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
                  <option
                    key={producto.id}
                    value={producto.id}
                  >
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

          <button
            type="submit"
            className="pedidos-boton-guardar"
          >
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
          <div className="pedidos-tarjetas">

            {pedidos.map((pedido) => (
              <article className="pedido-card" key={pedido.id}>

                <div className="pedido-card-encabezado">
                  <div>
                    <span className="pedido-numero">
                      PEDIDO #{pedido.id}
                    </span>
                    <h4>{pedido.producto || 'Producto no disponible'}</h4>
                  </div>

                  <span
                    className={`pedido-estado ${obtenerClaseEstado(
                      pedido.estado
                    )}`}
                  >
                    {pedido.estado || 'Pendiente'}
                  </span>
                </div>

                <div className="pedido-card-informacion">

                  <div className="pedido-detalle">
                    <span>Proveedor</span>
                    <strong>
                      {pedido.proveedor || 'No disponible'}
                    </strong>
                  </div>

                  <div className="pedido-detalle">
                    <span>Producto</span>
                    <strong>
                      {pedido.producto || 'No disponible'}
                    </strong>
                  </div>

                  <div className="pedido-detalle">
                    <span>Cantidad solicitada</span>
                    <strong>{pedido.cantidad}</strong>
                  </div>

                  <div className="pedido-detalle">
                    <span>Precio unitario</span>
                    <strong>
                      {formatoPrecio(pedido.precio_unitario)}
                    </strong>
                  </div>

                  <div className="pedido-detalle">
                    <span>Fecha del pedido</span>
                    <strong>{formatoFecha(pedido.fecha)}</strong>
                  </div>

                </div>

                {!soloLectura && (
                  <div className="pedido-card-acciones">
                    <div className="pedido-cambiar-estado">
                      <label>Actualizar estado</label>

                      <select
                        className={`pedido-estado-select ${obtenerClaseEstado(
                          pedido.estado
                        )}`}
                        value={pedido.estado || 'Pendiente'}
                        onChange={(e) =>
                          cambiarEstado(pedido.id, e.target.value)
                        }
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>

                    <button
                      className="pedido-boton-eliminar"
                      onClick={() => eliminarPedido(pedido.id)}
                    >
                      Eliminar pedido
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

export default Pedidos;

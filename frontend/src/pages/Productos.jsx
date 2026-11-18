
import { useEffect, useState } from 'react';
import './Productos.css';
import { headersAutenticacion } from '../utils/auth';

const API_URL = 'http://localhost:3000/api/productos';

function Productos({ soloLectura = false }) {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const formularioInicial = {
    nombre: '',
    categoria: '',
    cantidad: '',
    stock_minimo: '10',
    almacenamiento: '',
    temperatura: '',
    precio: '',
  };

  const [formulario, setFormulario] = useState(formularioInicial);

  // DETERMINAR ESTADO DEL INVENTARIO
  const obtenerEstado = (producto) => {
    const cantidad = Number(producto.cantidad);
    const minimo = Number(producto.stock_minimo);

    if (cantidad === 0) return 'agotado';
    if (cantidad <= minimo) return 'por-agotarse';

    return 'normal';
  };

  // CONSULTAR PRODUCTOS
  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError('');

      const respuesta = await fetch(API_URL, {
        headers: headersAutenticacion()
      });

      if (!respuesta.ok) {
        throw new Error(`Error del servidor: ${respuesta.status}`);
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos)) {
        throw new Error('La respuesta del servidor no es válida.');
      }

      setProductos(datos);

    } catch (error) {
      console.error('Error al consultar productos:', error);
      setError(
        'No se pudieron cargar los productos. Verifica que el backend esté funcionando.'
      );
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
  const iniciar = async () => {
    await cargarProductos();
  };

  iniciar();
}, []);

  // CAPTURAR DATOS DEL FORMULARIO
  const cambiarCampo = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  // GUARDAR O ACTUALIZAR PRODUCTO
  const guardarProducto = async (e) => {
    e.preventDefault();

    if (soloLectura) {
      setError('No tienes permisos para modificar productos.');
      return;
    }

    try {
      setGuardando(true);
      setError('');
      setMensaje('');

      const producto = {
        nombre: formulario.nombre.trim(),
        categoria: formulario.categoria,
        cantidad: Number(formulario.cantidad),
        stock_minimo: Number(formulario.stock_minimo),
        almacenamiento: formulario.almacenamiento,
        temperatura: formulario.temperatura,
        precio: Number(formulario.precio),
      };

      const url = editando !== null
        ? `${API_URL}/${editando}`
        : API_URL;

      const metodo = editando !== null ? 'PUT' : 'POST';

      const respuesta = await fetch(url, {
        method: metodo,
        headers: headersAutenticacion(true),
        body: JSON.stringify(producto),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No se pudo guardar el producto.'
        );
      }

      setMensaje(resultado.mensaje);
      cancelarFormulario();
      await cargarProductos();

    } catch (error) {
      console.error('Error al guardar producto:', error);
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  };

  // PREPARAR FORMULARIO PARA EDITAR
  const editarProducto = (producto) => {
    if (soloLectura) return;

    setFormulario({
      nombre: producto.nombre || '',
      categoria: producto.categoria || '',
      cantidad: String(producto.cantidad ?? ''),
      stock_minimo: String(producto.stock_minimo ?? 10),
      almacenamiento: producto.almacenamiento || '',
      temperatura: producto.temperatura || '',
      precio: String(producto.precio ?? ''),
    });

    setEditando(producto.id);
    setMostrarFormulario(true);
    setMensaje('');
    setError('');
  };

  // ELIMINAR PRODUCTO
  const eliminarProducto = async (id) => {
    if (soloLectura) return;

    if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    try {
      setError('');
      setMensaje('');

      const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: headersAutenticacion()
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No se pudo eliminar el producto.'
        );
      }

      setMensaje(resultado.mensaje);
      await cargarProductos();

    } catch (error) {
      console.error('Error al eliminar producto:', error);
      setError(error.message);
    }
  };

  // CERRAR FORMULARIO
  const cancelarFormulario = () => {
    setFormulario(formularioInicial);
    setEditando(null);
    setMostrarFormulario(false);
  };

  // BUSCAR PRODUCTOS
  const productosFiltrados = productos.filter((producto) =>
    (producto.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  // FORMATO DE PRECIOS
  const formatoPrecio = (precio) =>
    Number(precio).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });

  // RESUMEN DE INVENTARIO
  const totalUnidades = productos.reduce(
    (total, producto) => total + Number(producto.cantidad),
    0
  );

  const productosPorAgotarse = productos.filter(
    (producto) => obtenerEstado(producto) === 'por-agotarse'
  ).length;

  const productosAgotados = productos.filter(
    (producto) => obtenerEstado(producto) === 'agotado'
  ).length;

  return (
    <div className="productos-container">

      {/* ENCABEZADO */}
      <div className="productos-header">
        <div>
          <h2>Inventario de productos</h2>
          <p>
            {soloLectura
              ? 'Consulta los productos y el estado del inventario.'
              : 'Consulta y administra los productos de HUMANI.'}
          </p>
        </div>

        {!soloLectura && (
          <button
            className="producto-btn guardar"
            onClick={() => {
              setFormulario(formularioInicial);
              setEditando(null);
              setMostrarFormulario(true);
              setMensaje('');
              setError('');
            }}
          >
            + Nuevo producto
          </button>
        )}
      </div>

      {/* MENSAJES */}
      {mensaje && <p className="mensaje-exito">{mensaje}</p>}
      {error && <p className="mensaje-error">{error}</p>}

      {/* RESUMEN */}
      <div className="productos-resumen">

        <div className="producto-resumen-card">
          <span>Total de productos</span>
          <strong>{productos.length}</strong>
        </div>

        <div className="producto-resumen-card">
          <span>Unidades en inventario</span>
          <strong>{totalUnidades}</strong>
        </div>

        <div className="producto-resumen-card">
          <span>Por agotarse</span>
          <strong className="estado-texto-alerta">
            {productosPorAgotarse}
          </strong>
        </div>

        <div className="producto-resumen-card">
          <span>Agotados</span>
          <strong className="estado-texto-agotado">
            {productosAgotados}
          </strong>
        </div>

      </div>

      {/* FORMULARIO SOLO PARA JEFES Y ADMINISTRADORES */}
      {!soloLectura && mostrarFormulario && (
        <form
          className="producto-formulario"
          onSubmit={guardarProducto}
        >
          <h3>
            {editando !== null
              ? 'Actualizar producto'
              : 'Registrar producto'}
          </h3>

          <div className="producto-form-grid">

            <div>
              <label>Nombre del producto</label>
              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={cambiarCampo}
                placeholder="Ej. Gaseosa"
                required
              />
            </div>

            <div>
              <label>Categoría</label>
              <select
                name="categoria"
                value={formulario.categoria}
                onChange={cambiarCampo}
                required
              >
                <option value="">Seleccionar categoría</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Dulces">Dulces</option>
                <option value="Enlatados">Enlatados</option>
                <option value="Granos">Granos</option>
                <option value="Aseo">Aseo</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label>Cantidad disponible</label>
              <input
                type="number"
                name="cantidad"
                min="0"
                step="1"
                value={formulario.cantidad}
                onChange={cambiarCampo}
                required
              />
            </div>

            <div>
              <label>Stock mínimo de alerta</label>
              <input
                type="number"
                name="stock_minimo"
                min="0"
                step="1"
                value={formulario.stock_minimo}
                onChange={cambiarCampo}
                required
              />
              <small>
                Se generará una alerta al llegar a este límite.
              </small>
            </div>

            <div>
              <label>Precio (COP)</label>
              <input
                type="number"
                name="precio"
                min="0"
                step="1"
                value={formulario.precio}
                onChange={cambiarCampo}
                required
              />
            </div>

            <div>
              <label>Almacenamiento</label>
              <select
                name="almacenamiento"
                value={formulario.almacenamiento}
                onChange={cambiarCampo}
                required
              >
                <option value="">Seleccionar almacenamiento</option>
                <option value="Nevera">Nevera</option>
                <option value="Estantes">Estantes</option>
                <option value="Lugar fresco">Lugar fresco</option>
              </select>
            </div>

            <div>
              <label>Temperatura</label>
              <input
                type="text"
                name="temperatura"
                value={formulario.temperatura}
                onChange={cambiarCampo}
                placeholder="Ej. 2-8 °C o Ambiente"
              />
            </div>

          </div>

          <div className="producto-form-actions">

            <button
              type="submit"
              className="producto-btn guardar"
              disabled={guardando}
            >
              {guardando
                ? 'Guardando...'
                : editando !== null
                  ? 'Actualizar'
                  : 'Guardar producto'}
            </button>

            <button
              type="button"
              className="producto-btn cancelar"
              onClick={cancelarFormulario}
              disabled={guardando}
            >
              Cancelar
            </button>

          </div>
        </form>
      )}

      {/* TABLA */}
      <div className="productos-tabla-contenedor">

        <div className="productos-busqueda">
          <input
            type="text"
            placeholder="Buscar producto por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="tabla-scroll">

          <table className="productos-tabla">

            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Stock mínimo</th>
                <th>Estado</th>
                <th>Almacenamiento</th>
                <th>Precio</th>
                {!soloLectura && <th>Acciones</th>}
              </tr>
            </thead>

            <tbody>

              {cargando ? (
                <tr>
                  <td colSpan={soloLectura ? 7 : 8} className="sin-productos">
                    Cargando productos...
                  </td>
                </tr>
              ) : productosFiltrados.length > 0 ? (
                productosFiltrados.map((producto) => {
                  const estado = obtenerEstado(producto);

                  return (
                    <tr key={producto.id}>

                      <td>{producto.nombre}</td>
                      <td>{producto.categoria}</td>
                      <td>{producto.cantidad}</td>
                      <td>{producto.stock_minimo}</td>

                      <td>
                        <span className={`estado-inventario ${estado}`}>
                          {estado === 'agotado'
                            ? 'Agotado'
                            : estado === 'por-agotarse'
                              ? 'Por agotarse'
                              : 'Normal'}
                        </span>
                      </td>

                      <td>
                        {producto.almacenamiento || 'No especificado'}
                      </td>

                      <td>{formatoPrecio(producto.precio)}</td>

                      {!soloLectura && (
                        <td>
                          <div className="producto-acciones">

                            <button
                              type="button"
                              className="producto-btn actualizar"
                              onClick={() => editarProducto(producto)}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="producto-btn eliminar"
                              onClick={() => eliminarProducto(producto.id)}
                            >
                              Eliminar
                            </button>

                          </div>
                        </td>
                      )}

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={soloLectura ? 7 : 8}
                    className="sin-productos"
                  >
                    {error
                      ? 'No fue posible cargar los productos.'
                      : 'No se encontraron productos.'}
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}

export default Productos;

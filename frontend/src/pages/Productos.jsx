
import { useState } from 'react';
import './Productos.css';

function Productos() {
  // Productos iniciales de prueba
  const [productos, setProductos] = useState([
    {
      id: 1,
      nombre: 'Gaseosa',
      categoria: 'Bebidas',
      cantidad: 20,
      almacenamiento: 'Nevera',
      precio: 3500,
    },
    {
      id: 2,
      nombre: 'Arroz',
      categoria: 'Granos',
      cantidad: 35,
      almacenamiento: 'Estantes',
      precio: 4200,
    },
  ]);

  // Estados del módulo
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);

  // Valores iniciales del formulario
  const formularioInicial = {
    nombre: '',
    categoria: '',
    cantidad: '',
    almacenamiento: '',
    precio: '',
  };

  const [formulario, setFormulario] = useState(formularioInicial);

  // Capturar los datos de los campos
  const cambiarCampo = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  // Guardar o actualizar un producto
  const guardarProducto = (e) => {
    e.preventDefault();

    const producto = {
      ...formulario,
      cantidad: Number(formulario.cantidad),
      precio: Number(formulario.precio),
    };

    if (editando !== null) {
      // Actualizar producto existente
      setProductos(
        productos.map((p) =>
          p.id === editando
            ? { ...producto, id: editando }
            : p
        )
      );
    } else {
      // Generar un nuevo identificador
      const nuevoId =
        productos.length > 0
          ? Math.max(...productos.map((p) => p.id)) + 1
          : 1;

      // Agregar producto nuevo
      setProductos([
        ...productos,
        { ...producto, id: nuevoId },
      ]);
    }

    cancelarFormulario();
  };

  // Preparar formulario para editar
  const editarProducto = (producto) => {
    setFormulario({
      nombre: producto.nombre,
      categoria: producto.categoria,
      cantidad: String(producto.cantidad),
      almacenamiento: producto.almacenamiento,
      precio: String(producto.precio),
    });

    setEditando(producto.id);
    setMostrarFormulario(true);
  };

  // Eliminar producto
  const eliminarProducto = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      setProductos(
        productos.filter((p) => p.id !== id)
      );
    }
  };

  // Limpiar y cerrar formulario
  const cancelarFormulario = () => {
    setFormulario(formularioInicial);
    setEditando(null);
    setMostrarFormulario(false);
  };

  // Buscar productos por nombre
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Formato de precios colombianos
  const formatoPrecio = (precio) =>
    precio.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });

  return (
    <div className="productos-container">

      {/* Encabezado */}
      <div className="productos-header">
        <div>
          <h2>Inventario de productos</h2>
          <p>Consulta y administra los productos de HUMANI.</p>
        </div>

        <button
          className="producto-btn guardar"
          onClick={() => {
            setFormulario(formularioInicial);
            setEditando(null);
            setMostrarFormulario(true);
          }}
        >
          + Nuevo producto
        </button>
      </div>

      {/* Resumen del inventario */}
      <div className="productos-resumen">
        <div className="producto-resumen-card">
          <span>Total de productos</span>
          <strong>{productos.length}</strong>
        </div>

        <div className="producto-resumen-card">
          <span>Unidades en inventario</span>
          <strong>
            {productos.reduce((total, p) => total + p.cantidad, 0)}
          </strong>
        </div>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
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
              <label>Cantidad</label>
              <input
                type="number"
                name="cantidad"
                min="0"
                value={formulario.cantidad}
                onChange={cambiarCampo}
                placeholder="Cantidad disponible"
                required
              />
            </div>

            <div>
              <label>Precio (COP)</label>
              <input
                type="number"
                name="precio"
                min="0"
                value={formulario.precio}
                onChange={cambiarCampo}
                placeholder="Ej. 3500"
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
              </select>
            </div>

          </div>

          {/* Botones del formulario */}
          <div className="producto-form-actions">
            <button
              type="submit"
              className="producto-btn guardar"
            >
              {editando !== null
                ? 'Actualizar'
                : 'Guardar producto'}
            </button>

            <button
              type="button"
              className="producto-btn cancelar"
              onClick={cancelarFormulario}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Tabla de productos */}
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
                <th>Almacenamiento</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productosFiltrados.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.categoria}</td>
                  <td>{producto.cantidad}</td>
                  <td>{producto.almacenamiento}</td>
                  <td>{formatoPrecio(producto.precio)}</td>

                  <td>
                    <div className="producto-acciones">

                      <button
                        className="producto-btn actualizar"
                        onClick={() => editarProducto(producto)}
                      >
                        Editar
                      </button>

                      <button
                        className="producto-btn eliminar"
                        onClick={() => eliminarProducto(producto.id)}
                      >
                        Eliminar
                      </button>

                    </div>
                  </td>
                </tr>
              ))}

              {productosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="sin-productos">
                    No se encontraron productos.
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

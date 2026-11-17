
import { useEffect, useState } from 'react';
import './Almacenamiento.css';
import { obtenerImagenProducto } from '../utils/imagenes';

const API_PRODUCTOS = 'http://localhost:3000/api/productos';
const API_ALMACENAMIENTO = 'http://localhost:3000/api/almacenamiento';

function Almacenamiento() {
  const [productos, setProductos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);

  const formularioInicial = {
    producto_id: '',
    ubicacion_id: '',
    condiciones: '',
    motivo: '',
    recomendacion: ''
  };

  const [formulario, setFormulario] = useState(formularioInicial);

  // CARGAR PRODUCTOS, UBICACIONES Y REGISTROS
  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [
        respuestaProductos,
        respuestaUbicaciones,
        respuestaRegistros
      ] = await Promise.all([
        fetch(API_PRODUCTOS),
        fetch(`${API_ALMACENAMIENTO}/ubicaciones`),
        fetch(API_ALMACENAMIENTO)
      ]);

      if (
        !respuestaProductos.ok ||
        !respuestaUbicaciones.ok ||
        !respuestaRegistros.ok
      ) {
        throw new Error('No se pudieron cargar los datos');
      }

      const datosProductos = await respuestaProductos.json();
      const datosUbicaciones = await respuestaUbicaciones.json();
      const datosRegistros = await respuestaRegistros.json();

      setProductos(datosProductos);
      setUbicaciones(datosUbicaciones);
      setRegistros(datosRegistros);

    } catch (error) {
      console.error('Error:', error);
      setMensaje('No fue posible cargar la información.');
    } finally {
      setCargando(false);
    }
  };

  // CARGAR DATOS AL ABRIR EL MÓDULO
  useEffect(() => {
    const temporizador = setTimeout(() => {
      cargarDatos();
    }, 0);

    return () => clearTimeout(temporizador);
  }, []);

  // ABRIR FORMULARIO PARA NUEVO REGISTRO
  const abrirFormulario = () => {
    setEditando(null);
    setFormulario(formularioInicial);
    setMensaje('');
    setModalAbierto(true);
  };

  // EDITAR REGISTRO
  const editarRegistro = (registro) => {
    setEditando(registro.id);

    setFormulario({
      producto_id: String(registro.producto_id),
      ubicacion_id: String(registro.ubicacion_id),
      condiciones: registro.condiciones || '',
      motivo: registro.motivo || '',
      recomendacion: registro.recomendacion || ''
    });

    setMensaje('');
    setModalAbierto(true);
  };

  // GUARDAR O ACTUALIZAR REGISTRO
  const guardarRegistro = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      const url = editando
        ? `${API_ALMACENAMIENTO}/${editando}`
        : API_ALMACENAMIENTO;

      const respuesta = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formulario,
          producto_id: Number(formulario.producto_id),
          ubicacion_id: Number(formulario.ubicacion_id)
        })
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'No se pudo guardar');
      }

      setModalAbierto(false);
      setFormulario(formularioInicial);
      setEditando(null);
      setMensaje(resultado.mensaje);

      await cargarDatos();

    } catch (error) {
      setMensaje(error.message);
    }
  };

  // ELIMINAR REGISTRO
  const eliminarRegistro = async (id) => {
    const confirmar = window.confirm(
      '¿Estás seguro de eliminar esta ubicación del producto?'
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(
        `${API_ALMACENAMIENTO}/${id}`,
        { method: 'DELETE' }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje);
      }

      setMensaje(resultado.mensaje);
      await cargarDatos();

    } catch (error) {
      setMensaje(error.message);
    }
  };

  // CAPTURAR CAMBIOS DEL FORMULARIO
  const cambiarCampo = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  };

  // AGRUPAR UBICACIONES POR PRODUCTO
  const productosConAlmacenamiento = productos.map((producto) => ({
    ...producto,
    ubicaciones: registros.filter(
      (registro) =>
        Number(registro.producto_id) === Number(producto.id)
    )
  }));

  if (cargando) {
    return (
      <div className="almacenamiento-cargando">
        Cargando almacenamiento...
      </div>
    );
  }

  return (
    <div className="almacenamiento-container">

      {/* ENCABEZADO */}
      <div className="almacenamiento-encabezado">
        <div>
          <h2>Almacenamiento de productos</h2>
          <p>
            Consulta y administra dónde se encuentra cada producto.
          </p>
        </div>

        <button
          className="almacenamiento-boton-principal"
          onClick={abrirFormulario}
        >
          + Asignar ubicación
        </button>
      </div>

      {/* MENSAJES */}
      {mensaje && (
        <div className="almacenamiento-mensaje">
          {mensaje}
        </div>
      )}

      {/* RESUMEN */}
      <div className="almacenamiento-resumen">

        <div className="almacenamiento-resumen-card">
          <span>Productos</span>
          <strong>{productos.length}</strong>
        </div>

        <div className="almacenamiento-resumen-card">
          <span>Ubicaciones disponibles</span>
          <strong>{ubicaciones.length}</strong>
        </div>

        <div className="almacenamiento-resumen-card">
          <span>Asignaciones</span>
          <strong>{registros.length}</strong>
        </div>

      </div>

      {/* TARJETAS DE PRODUCTOS */}
      <div className="almacenamiento-grid">

        {productosConAlmacenamiento.map((producto) => {
          const imagen = obtenerImagenProducto(producto.nombre);

          return (
            <article
              className="almacenamiento-producto"
              key={producto.id}
            >

              {/* IMAGEN DEL PRODUCTO */}
              <div className="almacenamiento-imagen">

                {imagen ? (
                  <img
                    src={imagen}
                    alt={producto.nombre}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>📦</span>
                )}

              </div>

              {/* INFORMACIÓN DEL PRODUCTO */}
              <div className="almacenamiento-producto-info">
                <h3>{producto.nombre}</h3>
                <p>{producto.categoria}</p>
              </div>

              {/* UBICACIONES */}
              <div className="almacenamiento-ubicaciones">

                <h4>Ubicaciones asignadas</h4>

                {producto.ubicaciones.length > 0 ? (

                  producto.ubicaciones.map((registro) => (

                    <div
                      className="almacenamiento-ubicacion"
                      key={registro.id}
                    >

                      <div className="almacenamiento-ubicacion-titulo">

                        <strong>
                          📍 {registro.ubicacion}
                        </strong>

                        <div className="almacenamiento-acciones">

                          <button
                            type="button"
                            onClick={() => editarRegistro(registro)}
                            title="Editar"
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            onClick={() => eliminarRegistro(registro.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>

                        </div>

                      </div>

                      <p>
                        <strong>Condiciones:</strong>{' '}
                        {registro.condiciones || 'Sin información'}
                      </p>

                      <p>
                        <strong>Motivo:</strong>{' '}
                        {registro.motivo || 'Sin información'}
                      </p>

                      <p>
                        <strong>Recomendación:</strong>{' '}
                        {registro.recomendacion || 'Sin información'}
                      </p>

                    </div>

                  ))

                ) : (

                  <p className="almacenamiento-sin-ubicacion">
                    Este producto todavía no tiene ubicaciones asignadas.
                  </p>

                )}

              </div>

            </article>
          );
        })}

      </div>

      {/* SIN PRODUCTOS */}
      {productos.length === 0 && (
        <div className="almacenamiento-vacio">
          No hay productos registrados.
        </div>
      )}

      {/* MODAL */}
      {modalAbierto && (

        <div className="almacenamiento-modal-fondo">

          <div className="almacenamiento-modal">

            <div className="almacenamiento-modal-encabezado">

              <h2>
                {editando
                  ? 'Editar almacenamiento'
                  : 'Asignar almacenamiento'}
              </h2>

              <button
                type="button"
                onClick={() => setModalAbierto(false)}
              >
                ✕
              </button>

            </div>

            <form onSubmit={guardarRegistro}>

              <label>Producto</label>

              <select
                name="producto_id"
                value={formulario.producto_id}
                onChange={cambiarCampo}
                required
              >

                <option value="">
                  Seleccionar producto
                </option>

                {productos.map((producto) => (

                  <option
                    key={producto.id}
                    value={producto.id}
                  >
                    {producto.nombre}
                  </option>

                ))}

              </select>

              <label>Ubicación</label>

              <select
                name="ubicacion_id"
                value={formulario.ubicacion_id}
                onChange={cambiarCampo}
                required
              >

                <option value="">
                  Seleccionar ubicación
                </option>

                {ubicaciones.map((ubicacion) => (

                  <option
                    key={ubicacion.id}
                    value={ubicacion.id}
                  >
                    {ubicacion.nombre}
                  </option>

                ))}

              </select>

              <label>Condiciones de almacenamiento</label>

              <textarea
                name="condiciones"
                value={formulario.condiciones}
                onChange={cambiarCampo}
                placeholder="Ejemplo: conservar según las indicaciones del fabricante"
              />

              <label>Motivo de almacenamiento</label>

              <textarea
                name="motivo"
                value={formulario.motivo}
                onChange={cambiarCampo}
                placeholder="¿Por qué se almacena en este lugar?"
              />

              <label>Recomendaciones</label>

              <textarea
                name="recomendacion"
                value={formulario.recomendacion}
                onChange={cambiarCampo}
                placeholder="Recomendaciones para conservar el producto"
              />

              {/* BOTONES */}
              <div className="almacenamiento-modal-botones">

                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="almacenamiento-boton-cancelar"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="almacenamiento-boton-principal"
                >
                  {editando
                    ? 'Guardar cambios'
                    : 'Registrar ubicación'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Almacenamiento;

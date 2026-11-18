
import { useEffect, useState } from 'react';
import './Ventas.css';
import { headersAutenticacion } from '../utils/auth';

const API_VENTAS = 'http://localhost:3000/api/ventas';
const API_PRODUCTOS = 'http://localhost:3000/api/productos';

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');

  // CARGAR PRODUCTOS Y VENTAS
  const cargarDatos = async () => {
    try {
      const [resVentas, resProductos] = await Promise.all([
        fetch(API_VENTAS, {
          headers: headersAutenticacion()
        }),
        fetch(API_PRODUCTOS, {
          headers: headersAutenticacion()
        })
      ]);

      if (!resVentas.ok || !resProductos.ok) {
        throw new Error('No se pudo cargar la información');
      }

      const [datosVentas, datosProductos] = await Promise.all([
        resVentas.json(),
        resProductos.json()
      ]);

      setVentas(datosVentas);
      setProductos(datosProductos);

    } catch (error) {
      setMensaje(error.message);
      setTipoMensaje('error');
    } finally {
      setCargando(false);
    }
  };

  // CARGA INICIAL
  useEffect(() => {
    let activo = true;

    const iniciar = async () => {
      try {
        const [resVentas, resProductos] = await Promise.all([
          fetch(API_VENTAS, {
            headers: headersAutenticacion()
          }),
          fetch(API_PRODUCTOS, {
            headers: headersAutenticacion()
          })
        ]);

        if (!resVentas.ok || !resProductos.ok) {
          throw new Error('No se pudo cargar la información');
        }

        const [datosVentas, datosProductos] = await Promise.all([
          resVentas.json(),
          resProductos.json()
        ]);

        if (activo) {
          setVentas(datosVentas);
          setProductos(datosProductos);
          setMensaje('');
        }
      } catch (error) {
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

    iniciar();

    return () => {
      activo = false;
    };
  }, []);

  // REGISTRAR VENTA
  const registrarVenta = async (e) => {
    e.preventDefault();

    if (!productoId || !cantidad || Number(cantidad) <= 0) {
      setMensaje('Selecciona un producto y una cantidad válida');
      setTipoMensaje('error');
      return;
    }

    setGuardando(true);
    setMensaje('');

    try {
      const respuesta = await fetch(API_VENTAS, {
        method: 'POST',
        headers: headersAutenticacion(true),
        body: JSON.stringify({
          producto_id: Number(productoId),
          cantidad: Number(cantidad)
        })
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'No se pudo registrar la venta');
      }

      setMensaje(resultado.mensaje);
      setTipoMensaje('exito');

      setProductoId('');
      setCantidad('');

      await cargarDatos();

    } catch (error) {
      setMensaje(error.message);
      setTipoMensaje('error');
    } finally {
      setGuardando(false);
    }
  };

  // FORMATO DE PESOS COLOMBIANOS
  const formatoPesos = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(Number(valor) || 0);
  };

  // ESTADÍSTICAS
  const totalVentas = ventas.reduce(
    (total, venta) => total + Number(venta.total),
    0
  );

  const unidadesVendidas = ventas.reduce(
    (total, venta) => total + Number(venta.cantidad),
    0
  );

  if (cargando) {
    return <div className="ventas-contenedor">Cargando ventas...</div>;
  }

  // VISTA PRINCIPAL
  return (
    <div className="ventas-contenedor">

      <div className="ventas-encabezado">
        <div>
          <h1>Ventas</h1>
          <p>Registro y control de ventas de la tienda</p>
        </div>
      </div>

      {mensaje && (
        <div className={`ventas-mensaje ${tipoMensaje}`}>
          {mensaje}
        </div>
      )}

      {/* ESTADÍSTICAS */}
      <div className="ventas-estadisticas">

        <div className="venta-estadistica">
          <span>Total de ventas</span>
          <strong>{ventas.length}</strong>
        </div>

        <div className="venta-estadistica">
          <span>Unidades vendidas</span>
          <strong>{unidadesVendidas}</strong>
        </div>

        <div className="venta-estadistica">
          <span>Ingresos registrados</span>
          <strong>{formatoPesos(totalVentas)}</strong>
        </div>

      </div>

      {/* FORMULARIO */}
      <div className="ventas-formulario">

        <h2>Registrar nueva venta</h2>

        <form onSubmit={registrarVenta}>

          <div className="ventas-campo">
            <label>Producto</label>

            <select
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              required
            >
              <option value="">Seleccionar producto</option>

              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} - Disponible: {producto.cantidad}
                </option>
              ))}

            </select>
          </div>

          <div className="ventas-campo">
            <label>Cantidad</label>

            <input
              type="number"
              min="1"
              step="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Cantidad de unidades"
              required
            />
          </div>

          <button type="submit" disabled={guardando}>
            {guardando ? 'Registrando...' : 'Registrar venta'}
          </button>

        </form>

      </div>

      {/* HISTORIAL */}
      <div className="ventas-historial">

        <h2>Historial de ventas</h2>

        <div className="ventas-tabla-contenedor">

          <table className="ventas-tabla">

            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Total</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>

              {ventas.length > 0 ? (
                ventas.map((venta) => (
                  <tr key={venta.id}>
                    <td>#{venta.id}</td>
                    <td>{venta.producto}</td>
                    <td>{venta.cantidad}</td>
                    <td>{formatoPesos(venta.precio_unitario)}</td>
                    <td>{formatoPesos(venta.total)}</td>
                    <td>
                      {new Date(venta.fecha).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    Todavía no hay ventas registradas
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

export default Ventas;

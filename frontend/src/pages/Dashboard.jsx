
import { useState } from 'react';
import './Dashboard.css';

import Productos from './Productos';
import Almacenamiento from './Almacenamiento';
import Proveedores from './Proveedores';
import Pedidos from './Pedidos';
import Ventas from './Ventas';
import Usuarios from './Usuarios';

function Dashboard({ usuario, token, onCerrarSesion }) {
  const [seccion, setSeccion] = useState('Inicio');

  // IDENTIFICAR EL ROL DEL USUARIO
  const rol = usuario?.rol || 'Empleado';

  const esEmpleado = rol === 'Empleado';
  const esJefe = rol === 'Jefe';
  const esAdministrador = rol === 'Administrador';

  // MODULOS DISPONIBLES SEGUN EL ROL
  const modulos = [
    { nombre: 'Inicio', icono: '⌂' },
    { nombre: 'Productos', icono: '▣' },
    { nombre: 'Almacenamiento', icono: '▤' },
    { nombre: 'Pedidos', icono: '▧' },
    { nombre: 'Proveedores', icono: '♧' },
    { nombre: 'Ventas', icono: '$' },

    // SOLO JEFES Y ADMINISTRADORES
    ...(!esEmpleado
      ? [{ nombre: 'Usuarios', icono: '♙' }]
      : [])
  ];

  // RESUMEN GENERAL
  const estadisticas = [
    { titulo: 'Productos', valor: '0', icono: '▣' },
    { titulo: 'Pedidos', valor: '0', icono: '▧' },
    { titulo: 'Proveedores', valor: '0', icono: '♧' },
  ];

  const nombreUsuario =
    usuario?.nombre || usuario?.usuario || 'Usuario';

  const inicial = nombreUsuario.charAt(0).toUpperCase();

  const descripcionRol = esAdministrador
    ? 'Administrador del sistema'
    : esJefe
    ? 'Jefe del sistema'
    : 'Empleado';

  // CAMBIAR DE SECCION
  const cambiarSeccion = (nombre) => {
    const tieneAcceso = modulos.some(
      (modulo) => modulo.nombre === nombre
    );

    if (tieneAcceso) {
      setSeccion(nombre);
    } else {
      setSeccion('Inicio');
    }
  };

  return (
    <div className="dashboard-container">

      {/* MENU LATERAL */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">H</div>

          <div>
            <h2>HUMANI</h2>
            <span>Gestión empresarial</span>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">MENÚ PRINCIPAL</p>

          <nav>
            {modulos.map((modulo) => (
              <button
                key={modulo.nombre}
                className={`menu-item ${
                  seccion === modulo.nombre ? 'active' : ''
                }`}
                onClick={() => cambiarSeccion(modulo.nombre)}
              >
                <span className="menu-icon">
                  {modulo.icono}
                </span>

                {modulo.nombre}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">

          <div className="user-profile">
            <div className="user-avatar">{inicial}</div>

            <div>
              <strong>{nombreUsuario}</strong>
              <span>{descripcionRol}</span>
            </div>
          </div>

          <button
            className="menu-item"
            onClick={onCerrarSesion}
          >
            <span className="menu-icon">↪</span>
            Cerrar sesión
          </button>

        </div>

      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <h1>{seccion}</h1>
            <p>Bienvenido al sistema de gestión HUMANI.</p>
          </div>

          <div className="header-user">
            <span>{nombreUsuario}</span>
            <div className="header-avatar">{inicial}</div>
          </div>

        </header>

        <section className="dashboard-content">

          {/* MODULO PRODUCTOS */}
          {seccion === 'Productos' ? (

            <Productos soloLectura={esEmpleado} />

          ) : seccion === 'Almacenamiento' ? (

            <Almacenamiento soloLectura={esEmpleado} />

          ) : seccion === 'Proveedores' ? (

            <Proveedores soloLectura={esEmpleado} />

          ) : seccion === 'Pedidos' ? (

            <Pedidos soloLectura={esEmpleado} />

          ) : seccion === 'Ventas' ? (

            <Ventas />

          ) : seccion === 'Usuarios' && !esEmpleado ? (

            <Usuarios token={token} />

          ) : seccion === 'Inicio' ? (

            <>

              <div className="welcome-banner">

                <div>
                  <span className="welcome-tag">
                    PANEL DE CONTROL
                  </span>

                  <h2>Bienvenido a HUMANI</h2>

                  <p>
                    {esEmpleado
                      ? 'Consulta productos, almacenamiento, pedidos y proveedores. También puedes registrar y consultar ventas.'
                      : 'Administra y consulta la información de tu negocio desde un solo lugar.'}
                  </p>
                </div>

                <div className="welcome-symbol">H</div>

              </div>

              <div className="section-heading">
                <h2>Resumen general</h2>
                <span>Información del sistema</span>
              </div>

              <div className="statistics-grid">

                {estadisticas.map((dato) => (
                  <div className="stat-card" key={dato.titulo}>

                    <div className="stat-icon">
                      {dato.icono}
                    </div>

                    <div>
                      <p>{dato.titulo}</p>
                      <h3>{dato.valor}</h3>
                    </div>

                  </div>
                ))}

              </div>

              <div className="section-heading">
                <h2>Módulos del sistema</h2>
                <span>Acceso según tu rol</span>
              </div>

              <div className="modules-grid">

                {modulos
                  .filter((modulo) => modulo.nombre !== 'Inicio')
                  .map((modulo) => (

                    <button
                      className="module-card"
                      key={modulo.nombre}
                      onClick={() => cambiarSeccion(modulo.nombre)}
                    >

                      <span className="module-icon">
                        {modulo.icono}
                      </span>

                      <h3>{modulo.nombre}</h3>

                      <p>
                        {esEmpleado
                          ? modulo.nombre === 'Ventas'
                            ? 'Registrar ventas y consultar el historial'
                            : 'Consultar información del módulo'
                          : modulo.nombre === 'Usuarios'
                          ? 'Crear cuentas y consultar usuarios registrados'
                          : 'Consultar y administrar información'}
                      </p>

                      <span className="module-link">
                        Ingresar →
                      </span>

                    </button>

                  ))}

              </div>

            </>

          ) : (

            <div className="welcome-banner">

              <div>
                <span className="welcome-tag">
                  MÓDULO HUMANI
                </span>

                <h2>{seccion}</h2>

                <p>
                  Este módulo no está disponible.
                </p>

                <button
                  className="module-link"
                  onClick={() => setSeccion('Inicio')}
                >
                  Volver a Inicio
                </button>
              </div>

              <div className="welcome-symbol">H</div>

            </div>

          )}

        </section>

        <footer className="dashboard-footer">
          HUMANI © 2026 - Sistema de administración y control
        </footer>

      </main>

    </div>
  );
}

export default Dashboard;

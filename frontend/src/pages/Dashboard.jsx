
import { useState } from 'react';
import './Dashboard.css';

import Productos from './Productos';
import Almacenamiento from './Almacenamiento';
import Proveedores from './Proveedores';
import Pedidos from './Pedidos';

function Dashboard() {
  const [seccion, setSeccion] = useState('Inicio');

  // MODULOS PRINCIPALES
  const modulos = [
    { nombre: 'Inicio', icono: '⌂' },
    { nombre: 'Productos', icono: '▣' },
    { nombre: 'Almacenamiento', icono: '▤' },
    { nombre: 'Pedidos', icono: '▧' },
    { nombre: 'Proveedores', icono: '♧' },
  ];

  // RESUMEN GENERAL
  const estadisticas = [
    { titulo: 'Productos', valor: '0', icono: '▣' },
    { titulo: 'Pedidos', valor: '0', icono: '▧' },
    { titulo: 'Proveedores', valor: '0', icono: '♧' },
  ];

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
                onClick={() => setSeccion(modulo.nombre)}
              >
                <span className="menu-icon">{modulo.icono}</span>
                {modulo.nombre}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="user-profile">
            <div className="user-avatar">A</div>

            <div>
              <strong>Administrador</strong>
              <span>Jefe del sistema</span>
            </div>
          </div>
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
            <span>Administrador</span>
            <div className="header-avatar">A</div>
          </div>

        </header>

        <section className="dashboard-content">

          {/* PRODUCTOS */}
          {seccion === 'Productos' ? (

            <Productos />

          ) : seccion === 'Almacenamiento' ? (

            <Almacenamiento />

          ) : seccion === 'Proveedores' ? (

            <Proveedores />

          ) : seccion === 'Pedidos' ? (

            <Pedidos />

          ) : seccion === 'Inicio' ? (

            <>
              <div className="welcome-banner">

                <div>
                  <span className="welcome-tag">
                    PANEL DE CONTROL
                  </span>

                  <h2>Bienvenido a HUMANI</h2>

                  <p>
                    Administra y consulta la información de tu negocio
                    desde un solo lugar.
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
                <span>Acceso rápido</span>
              </div>

              <div className="modules-grid">

                {modulos
                  .filter((modulo) => modulo.nombre !== 'Inicio')
                  .map((modulo) => (
                    <button
                      className="module-card"
                      key={modulo.nombre}
                      onClick={() => setSeccion(modulo.nombre)}
                    >
                      <span className="module-icon">
                        {modulo.icono}
                      </span>

                      <h3>{modulo.nombre}</h3>

                      <p>
                        Consultar y administrar información
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
                  Este módulo está pendiente de desarrollo.
                  Próximamente podrás consultar y administrar
                  toda su información desde aquí.
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

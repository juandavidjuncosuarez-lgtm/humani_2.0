
import { useState } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';

function App() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [sesionIniciada, setSesionIniciada] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!usuario.trim() || !contrasena.trim()) {
      setMensaje('Por favor, completa todos los campos.');
      return;
    }

    setMensaje('');
    setSesionIniciada(true);
  };

  if (sesionIniciada) {
    return <Dashboard />;
  }

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="logo">
          <div className="logo-icon">H</div>
          <h1>HUMANI</h1>
          <p>Sistema de gestión de inventario</p>
        </div>

        <div className="login-header">
          <h2>Bienvenido</h2>
          <p>Ingresa tus datos para continuar</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </div>

          <button type="submit" className="login-button">
            Iniciar sesión
          </button>

          {mensaje && (
            <p className="login-message">{mensaje}</p>
          )}

        </form>

        <div className="login-footer">
          <p>HUMANI © 2026</p>
          <span>Sistema de administración y control</span>
        </div>

      </div>
    </div>
  );
}

export default App;

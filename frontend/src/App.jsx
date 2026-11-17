
import { useState } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';

function App() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      const guardada = localStorage.getItem('humaniSesion');
      return guardada ? JSON.parse(guardada) : null;
    } catch {
      localStorage.removeItem('humaniSesion');
      return null;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario.trim() || !contrasena) {
      setMensaje('Por favor, completa todos los campos.');
      return;
    }

    try {
      setCargando(true);
      setMensaje('');

      const respuesta = await fetch(
        'http://localhost:3000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            usuario: usuario.trim(),
            password: contrasena
          })
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || 'No fue posible iniciar sesión.');
        return;
      }

      const nuevaSesion = {
        token: datos.token,
        usuario: datos.usuario
      };

      localStorage.setItem(
        'humaniSesion',
        JSON.stringify(nuevaSesion)
      );

      setSesion(nuevaSesion);
      setContrasena('');

    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setMensaje('No se pudo conectar con el servidor HUMANI.');
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('humaniSesion');
    setSesion(null);
    setUsuario('');
    setContrasena('');
    setMensaje('');
  };

  if (sesion) {
    return (
      <Dashboard
        usuario={sesion.usuario}
        token={sesion.token}
        onCerrarSesion={cerrarSesion}
      />
    );
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
              autoComplete="username"
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              autoComplete="current-password"
              disabled={cargando}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={cargando}
          >
            {cargando ? 'Verificando...' : 'Iniciar sesión'}
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

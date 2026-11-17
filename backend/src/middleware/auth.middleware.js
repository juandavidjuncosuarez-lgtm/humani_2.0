
const jwt = require('jsonwebtoken');

// VERIFICAR QUE EL USUARIO TENGA UNA SESION VALIDA
function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization;

  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({
      mensaje: 'Debes iniciar sesión para acceder a esta función'
    });
  }

  const token = encabezado.split(' ')[1];

  if (!process.env.JWT_SECRET) {
    console.error('No está configurada la clave JWT_SECRET');
    return res.status(500).json({
      mensaje: 'Error de configuración de seguridad'
    });
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = {
      id: datos.id,
      nombre: datos.nombre,
      usuario: datos.usuario,
      rol: datos.rol
    };

    next();

  } catch (error) {
    return res.status(401).json({
      mensaje: 'La sesión no es válida o ha expirado'
    });
  }
}

// COMPROBAR LOS PERMISOS SEGUN EL ROL
function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: 'Debes iniciar sesión'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: 'No tienes permisos para realizar esta operación'
      });
    }

    next();
  };
}

module.exports = {
  verificarToken,
  permitirRoles
};

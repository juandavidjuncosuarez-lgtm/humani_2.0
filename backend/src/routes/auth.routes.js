
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const router = express.Router();

// INICIAR SESION
router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;

    // VALIDAR DATOS
    if (
      typeof usuario !== 'string' ||
      typeof password !== 'string' ||
      !usuario.trim() ||
      !password
    ) {
      return res.status(400).json({
        mensaje: 'Ingresa tu usuario y contraseña'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('Falta configurar JWT_SECRET');
      return res.status(500).json({
        mensaje: 'Error de configuración del servidor'
      });
    }

    // BUSCAR USUARIO
    const [usuarios] = await db.query(
      `SELECT id, nombre, usuario, password, rol
       FROM usuarios
       WHERE usuario = ?
       LIMIT 1`,
      [usuario.trim()]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        mensaje: 'Usuario o contraseña incorrectos'
      });
    }

    const cuenta = usuarios[0];
    const hash = cuenta.password;

    // COMPROBAR SI LA CONTRASEÑA ES BCRYPT
    const esBcrypt =
      /^\$2[aby]\$\d{2}\$/.test(hash);

    let contrasenaCorrecta = false;

    if (esBcrypt) {
      contrasenaCorrecta = await bcrypt.compare(
        password,
        hash
      );
    } else {
      // COMPATIBILIDAD CON CONTRASEÑAS ANTIGUAS
      // Si coincide, se actualizará inmediatamente a BCRYPT.
      contrasenaCorrecta = password === hash;

      if (contrasenaCorrecta) {
        const nuevoHash = await bcrypt.hash(password, 12);

        await db.query(
          `UPDATE usuarios
           SET password = ?
           WHERE id = ?`,
          [nuevoHash, cuenta.id]
        );
      }
    }

    if (!contrasenaCorrecta) {
      return res.status(401).json({
        mensaje: 'Usuario o contraseña incorrectos'
      });
    }

    // VALIDAR ROL
    const rolesPermitidos = [
      'Administrador',
      'Jefe',
      'Empleado'
    ];

    if (!rolesPermitidos.includes(cuenta.rol)) {
      return res.status(403).json({
        mensaje: 'El rol de esta cuenta no está autorizado'
      });
    }

    // CREAR TOKEN
    const token = jwt.sign(
      {
        id: cuenta.id,
        nombre: cuenta.nombre,
        usuario: cuenta.usuario,
        rol: cuenta.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    // RESPUESTA
    res.json({
      mensaje: 'Inicio de sesión correcto',
      token,
      usuario: {
        id: cuenta.id,
        nombre: cuenta.nombre,
        usuario: cuenta.usuario,
        rol: cuenta.rol
      }
    });

  } catch (error) {
    console.error('Error en inicio de sesión:', error);

    res.status(500).json({
      mensaje: 'Error al iniciar sesión'
    });
  }
});

module.exports = router;

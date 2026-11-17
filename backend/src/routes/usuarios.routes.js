
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const {
  verificarToken,
  permitirRoles
} = require('../middleware/auth.middleware');

const router = express.Router();

// =====================================
// CONSULTAR TODOS LOS USUARIOS
// SOLO JEFES Y ADMINISTRADORES
// =====================================

router.get(
  '/',
  verificarToken,
  permitirRoles('Jefe', 'Administrador'),
  async (req, res) => {
    try {
      const [usuarios] = await db.query(
        `SELECT id, nombre, rol
         FROM usuarios
         ORDER BY id ASC`
      );

      res.json(usuarios);

    } catch (error) {
      console.error('Error al consultar usuarios:', error);

      res.status(500).json({
        mensaje: 'Error al consultar los usuarios'
      });
    }
  }
);

// =====================================
// CREAR UN NUEVO USUARIO
// SOLO JEFES Y ADMINISTRADORES
// =====================================

router.post(
  '/',
  verificarToken,
  permitirRoles('Jefe', 'Administrador'),
  async (req, res) => {
    try {
      const { nombre, usuario, password, rol } = req.body;

      // VALIDAR CAMPOS

      if (
        typeof nombre !== 'string' ||
        typeof usuario !== 'string' ||
        typeof password !== 'string' ||
        typeof rol !== 'string' ||
        !nombre.trim() ||
        !usuario.trim() ||
        !password
      ) {
        return res.status(400).json({
          mensaje: 'Todos los campos son obligatorios'
        });
      }

      // VALIDAR LONGITUD

      if (
        nombre.trim().length > 100 ||
        usuario.trim().length > 50
      ) {
        return res.status(400).json({
          mensaje: 'El nombre o usuario supera la longitud permitida'
        });
      }

      if (password.length < 8 || password.length > 72) {
        return res.status(400).json({
          mensaje: 'La contraseña debe tener entre 8 y 72 caracteres'
        });
      }

      // VALIDAR ROL

      const rolesPermitidos = [
        'Administrador',
        'Jefe',
        'Empleado'
      ];

      if (!rolesPermitidos.includes(rol)) {
        return res.status(400).json({
          mensaje: 'El rol seleccionado no es válido'
        });
      }

      // COMPROBAR SI EL USUARIO YA EXISTE

      const [existentes] = await db.query(
        `SELECT id
         FROM usuarios
         WHERE usuario = ?
         LIMIT 1`,
        [usuario.trim()]
      );

      if (existentes.length > 0) {
        return res.status(409).json({
          mensaje: 'Este nombre de usuario ya está registrado'
        });
      }

      // PROTEGER CONTRASEÑA

      const passwordHash = await bcrypt.hash(password, 12);

      // GUARDAR USUARIO

      const [resultado] = await db.query(
        `INSERT INTO usuarios (nombre, usuario, password, rol)
         VALUES (?, ?, ?, ?)`,
        [
          nombre.trim(),
          usuario.trim(),
          passwordHash,
          rol
        ]
      );

      res.status(201).json({
        mensaje: 'Usuario creado correctamente',
        usuario: {
          id: resultado.insertId,
          nombre: nombre.trim(),
          rol
        }
      });

    } catch (error) {
      console.error('Error al crear usuario:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          mensaje: 'Este nombre de usuario ya está registrado'
        });
      }

      res.status(500).json({
        mensaje: 'Error al crear el usuario'
      });
    }
  }
);

module.exports = router;

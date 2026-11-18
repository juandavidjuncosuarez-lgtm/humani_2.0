
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware de autenticación y permisos
const {
  verificarToken,
  permitirRoles
} = require('../middleware/auth.middleware');

// =====================================
// CONSULTAR TODOS LOS PROVEEDORES
// TODOS LOS USUARIOS AUTENTICADOS
// =====================================

router.get('/', verificarToken, async (req, res) => {
  try {
    const [resultados] = await db.query(
      'SELECT * FROM proveedores ORDER BY id DESC'
    );

    res.json(resultados);

  } catch (error) {
    console.error('Error al consultar proveedores:', error);

    res.status(500).json({
      mensaje: 'Error al consultar los proveedores'
    });
  }
});

// =====================================
// REGISTRAR UN PROVEEDOR
// SOLO JEFE Y ADMINISTRADOR
// =====================================

router.post(
  '/',
  verificarToken,
  permitirRoles('Jefe', 'Administrador'),
  async (req, res) => {
    try {
      const { nombre, telefono, correo, producto } = req.body;

      if (
        typeof nombre !== 'string' ||
        !nombre.trim() ||
        nombre.trim().length > 100 ||
        typeof telefono !== 'string' ||
        !telefono.trim() ||
        telefono.trim().length > 30 ||
        typeof correo !== 'string' ||
        !correo.trim() ||
        correo.trim().length > 150 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()) ||
        typeof producto !== 'string' ||
        !producto.trim() ||
        producto.trim().length > 150
      ) {
        return res.status(400).json({
          mensaje: 'Verifica que todos los campos sean válidos'
        });
      }

      const sql = `
        INSERT INTO proveedores (nombre, telefono, correo, producto)
        VALUES (?, ?, ?, ?)
      `;

      const [resultado] = await db.query(sql, [
        nombre.trim(),
        telefono.trim(),
        correo.trim(),
        producto.trim()
      ]);

      res.status(201).json({
        mensaje: 'Proveedor registrado correctamente',
        id: resultado.insertId
      });

    } catch (error) {
      console.error('Error al registrar proveedor:', error);

      res.status(500).json({
        mensaje: 'Error al registrar el proveedor'
      });
    }
  }
);

// =====================================
// EDITAR UN PROVEEDOR
// SOLO JEFE Y ADMINISTRADOR
// =====================================

router.put(
  '/:id',
  verificarToken,
  permitirRoles('Jefe', 'Administrador'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { nombre, telefono, correo, producto } = req.body;

      if (
        !Number.isSafeInteger(id) ||
        id <= 0 ||
        typeof nombre !== 'string' ||
        !nombre.trim() ||
        nombre.trim().length > 100 ||
        typeof telefono !== 'string' ||
        !telefono.trim() ||
        telefono.trim().length > 30 ||
        typeof correo !== 'string' ||
        !correo.trim() ||
        correo.trim().length > 150 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()) ||
        typeof producto !== 'string' ||
        !producto.trim() ||
        producto.trim().length > 150
      ) {
        return res.status(400).json({
          mensaje: 'Verifica los datos del proveedor'
        });
      }

      const sql = `
        UPDATE proveedores
        SET nombre = ?, telefono = ?, correo = ?, producto = ?
        WHERE id = ?
      `;

      const [resultado] = await db.query(sql, [
        nombre.trim(),
        telefono.trim(),
        correo.trim(),
        producto.trim(),
        id
      ]);

      if (resultado.affectedRows === 0) {
        const [existentes] = await db.query(
          'SELECT id FROM proveedores WHERE id = ?',
          [id]
        );

        if (existentes.length === 0) {
          return res.status(404).json({
            mensaje: 'Proveedor no encontrado'
          });
        }
      }

      res.json({
        mensaje: 'Proveedor actualizado correctamente'
      });

    } catch (error) {
      console.error('Error al editar proveedor:', error);

      res.status(500).json({
        mensaje: 'Error al editar el proveedor'
      });
    }
  }
);

// =====================================
// ELIMINAR UN PROVEEDOR
// SOLO JEFE Y ADMINISTRADOR
// =====================================

router.delete(
  '/:id',
  verificarToken,
  permitirRoles('Jefe', 'Administrador'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
          mensaje: 'Identificador de proveedor inválido'
        });
      }

      const [resultado] = await db.query(
        'DELETE FROM proveedores WHERE id = ?',
        [id]
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          mensaje: 'Proveedor no encontrado'
        });
      }

      res.json({
        mensaje: 'Proveedor eliminado correctamente'
      });

    } catch (error) {
      console.error('Error al eliminar proveedor:', error);

      res.status(500).json({
        mensaje: 'Error al eliminar el proveedor'
      });
    }
  }
);

module.exports = router;


const express = require('express');
const router = express.Router();
const db = require('../config/database');

// =====================================
// CONSULTAR TODOS LOS PROVEEDORES
// =====================================

router.get('/', async (req, res) => {
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
// =====================================

router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, correo, producto } = req.body;

    if (!nombre || !telefono || !correo || !producto) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    const sql = `
      INSERT INTO proveedores (nombre, telefono, correo, producto)
      VALUES (?, ?, ?, ?)
    `;

    const [resultado] = await db.query(sql, [
      nombre,
      telefono,
      correo,
      producto
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
});

// =====================================
// EDITAR UN PROVEEDOR
// =====================================

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, correo, producto } = req.body;

    if (!nombre || !telefono || !correo || !producto) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    const sql = `
      UPDATE proveedores
      SET nombre = ?, telefono = ?, correo = ?, producto = ?
      WHERE id = ?
    `;

    const [resultado] = await db.query(sql, [
      nombre,
      telefono,
      correo,
      producto,
      id
    ]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Proveedor no encontrado'
      });
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
});

// =====================================
// ELIMINAR UN PROVEEDOR
// =====================================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

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
});

module.exports = router;

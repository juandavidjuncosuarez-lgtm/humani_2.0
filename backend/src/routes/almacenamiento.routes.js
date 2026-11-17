
const express = require('express');
const router = express.Router();
const conexion = require('../config/database');

// =====================================
// 1. CONSULTAR PRODUCTOS Y UBICACIONES
// =====================================
router.get('/', async (req, res) => {
  try {
    const [resultado] = await conexion.query(`
      SELECT
        pu.id,
        p.id AS producto_id,
        p.nombre AS producto,
        p.categoria,
        pu.ubicacion_id,
        u.nombre AS ubicacion,
        pu.condiciones,
        pu.motivo,
        pu.recomendacion
      FROM producto_ubicaciones pu
      INNER JOIN productos p ON pu.producto_id = p.id
      INNER JOIN ubicaciones u ON pu.ubicacion_id = u.id
      ORDER BY p.nombre, u.nombre
    `);

    res.json(resultado);
  } catch (error) {
    console.error('Error al consultar almacenamiento:', error);
    res.status(500).json({
      mensaje: 'Error al consultar el almacenamiento'
    });
  }
});

// =====================================
// 2. CONSULTAR UBICACIONES DISPONIBLES
// =====================================
router.get('/ubicaciones', async (req, res) => {
  try {
    const [resultado] = await conexion.query(
      'SELECT * FROM ubicaciones ORDER BY nombre'
    );

    res.json(resultado);
  } catch (error) {
    console.error('Error al consultar ubicaciones:', error);
    res.status(500).json({
      mensaje: 'Error al consultar las ubicaciones'
    });
  }
});

// =====================================
// 3. REGISTRAR ALMACENAMIENTO
// =====================================
router.post('/', async (req, res) => {
  try {
    const {
      producto_id,
      ubicacion_id,
      condiciones,
      motivo,
      recomendacion
    } = req.body;

    if (!producto_id || !ubicacion_id) {
      return res.status(400).json({
        mensaje: 'Debes seleccionar un producto y una ubicación'
      });
    }

    const [resultado] = await conexion.query(
      `INSERT INTO producto_ubicaciones
       (producto_id, ubicacion_id, condiciones, motivo, recomendacion)
       VALUES (?, ?, ?, ?, ?)`,
      [
        producto_id,
        ubicacion_id,
        condiciones || null,
        motivo || null,
        recomendacion || null
      ]
    );

    res.status(201).json({
      mensaje: 'Almacenamiento registrado correctamente',
      id: resultado.insertId
    });
  } catch (error) {
    console.error('Error al registrar almacenamiento:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensaje: 'Este producto ya está registrado en esa ubicación'
      });
    }

    res.status(500).json({
      mensaje: 'Error al registrar el almacenamiento'
    });
  }
});

// =====================================
// 4. MODIFICAR ALMACENAMIENTO
// =====================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      producto_id,
      ubicacion_id,
      condiciones,
      motivo,
      recomendacion
    } = req.body;

    const [resultado] = await conexion.query(
      `UPDATE producto_ubicaciones
       SET producto_id = ?,
           ubicacion_id = ?,
           condiciones = ?,
           motivo = ?,
           recomendacion = ?
       WHERE id = ?`,
      [
        producto_id,
        ubicacion_id,
        condiciones || null,
        motivo || null,
        recomendacion || null,
        id
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Registro de almacenamiento no encontrado'
      });
    }

    res.json({
      mensaje: 'Almacenamiento actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al modificar almacenamiento:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensaje: 'Este producto ya está registrado en esa ubicación'
      });
    }

    res.status(500).json({
      mensaje: 'Error al actualizar el almacenamiento'
    });
  }
});

// =====================================
// 5. ELIMINAR ALMACENAMIENTO
// =====================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await conexion.query(
      'DELETE FROM producto_ubicaciones WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Registro de almacenamiento no encontrado'
      });
    }

    res.json({
      mensaje: 'Almacenamiento eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar almacenamiento:', error);
    res.status(500).json({
      mensaje: 'Error al eliminar el almacenamiento'
    });
  }
});

module.exports = router;

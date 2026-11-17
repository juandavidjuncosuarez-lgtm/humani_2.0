
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// =====================================
// CONSULTAR TODOS LOS PEDIDOS
// =====================================

router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT
        pedidos.id,
        pedidos.proveedor_id,
        pedidos.producto_id,
        pedidos.cantidad,
        pedidos.fecha,
        pedidos.estado,
        proveedores.nombre AS proveedor,
        productos.nombre AS producto,
        productos.precio AS precio_unitario
      FROM pedidos
      INNER JOIN proveedores
        ON pedidos.proveedor_id = proveedores.id
      INNER JOIN productos
        ON pedidos.producto_id = productos.id
      ORDER BY pedidos.id DESC
    `;

    const [resultados] = await db.query(sql);

    res.json(resultados);
  } catch (error) {
    console.error('Error al consultar pedidos:', error);

    res.status(500).json({
      mensaje: 'Error al consultar los pedidos'
    });
  }
});

// =====================================
// REGISTRAR UN PEDIDO
// =====================================

router.post('/', async (req, res) => {
  try {
    const { proveedor_id, producto_id, cantidad } = req.body;

    if (
      !Number.isInteger(Number(proveedor_id)) ||
      !Number.isInteger(Number(producto_id)) ||
      !Number.isInteger(Number(cantidad)) ||
      Number(cantidad) <= 0
    ) {
      return res.status(400).json({
        mensaje: 'Selecciona un proveedor, un producto y una cantidad válida'
      });
    }

    const sql = `
      INSERT INTO pedidos
        (proveedor_id, producto_id, cantidad, estado)
      VALUES (?, ?, ?, 'Pendiente')
    `;

    const [resultado] = await db.query(sql, [
      proveedor_id,
      producto_id,
      cantidad
    ]);

    res.status(201).json({
      mensaje: 'Pedido registrado correctamente',
      id: resultado.insertId
    });
  } catch (error) {
    console.error('Error al registrar pedido:', error);

    res.status(500).json({
      mensaje: 'Error al registrar el pedido'
    });
  }
});

// =====================================
// ACTUALIZAR ESTADO DEL PEDIDO
// =====================================

router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = [
      'Pendiente',
      'Entregado',
      'Cancelado'
    ];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        mensaje: 'El estado seleccionado no es válido'
      });
    }

    const [resultado] = await db.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Pedido no encontrado'
      });
    }

    res.json({
      mensaje: 'Estado del pedido actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);

    res.status(500).json({
      mensaje: 'Error al actualizar el estado'
    });
  }
});

// =====================================
// ELIMINAR UN PEDIDO
// =====================================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await db.query(
      'DELETE FROM pedidos WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Pedido no encontrado'
      });
    }

    res.json({
      mensaje: 'Pedido eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);

    res.status(500).json({
      mensaje: 'Error al eliminar el pedido'
    });
  }
});

module.exports = router;

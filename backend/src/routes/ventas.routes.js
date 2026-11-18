
const express = require('express');
const router = express.Router();
const db = require('../config/database');

const {
  verificarToken
} = require('../middleware/auth.middleware');

// =====================================
// CONSULTAR TODAS LAS VENTAS
// =====================================

router.get('/', verificarToken, async (req, res) => {
  try {
    const sql = `
      SELECT
        ventas.id,
        ventas.producto_id,
        ventas.cantidad,
        ventas.precio_unitario,
        ventas.total,
        ventas.fecha,
        productos.nombre AS producto
      FROM ventas
      INNER JOIN productos
        ON ventas.producto_id = productos.id
      ORDER BY ventas.id DESC
    `;

    const [resultados] = await db.query(sql);

    res.json(resultados);

  } catch (error) {
    console.error('Error al consultar ventas:', error);

    res.status(500).json({
      mensaje: 'Error al consultar las ventas'
    });
  }
});

// =====================================
// REGISTRAR UNA VENTA
// Los tres roles pueden registrar ventas
// =====================================

router.post('/', verificarToken, async (req, res) => {
  let conexion;

  try {
    const producto_id = Number(req.body.producto_id);
    const cantidad = Number(req.body.cantidad);

    if (
      !Number.isSafeInteger(producto_id) ||
      producto_id <= 0 ||
      !Number.isSafeInteger(cantidad) ||
      cantidad <= 0
    ) {
      return res.status(400).json({
        mensaje: 'Selecciona un producto y una cantidad válida'
      });
    }

    conexion = await db.getConnection();

    await conexion.beginTransaction();

    // Buscar y bloquear el producto
    const [productos] = await conexion.query(
      `SELECT id, nombre, cantidad, precio
       FROM productos
       WHERE id = ?
       FOR UPDATE`,
      [producto_id]
    );

    if (productos.length === 0) {
      await conexion.rollback();

      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    const producto = productos[0];

    // Comprobar existencias
    if (cantidad > producto.cantidad) {
      await conexion.rollback();

      return res.status(400).json({
        mensaje: `Inventario insuficiente. Solo hay ${producto.cantidad} unidades disponibles.`
      });
    }

    const precioUnitario = Number(producto.precio);

    if (
      !Number.isSafeInteger(precioUnitario) ||
      precioUnitario < 0
    ) {
      await conexion.rollback();

      return res.status(400).json({
        mensaje: 'El precio del producto no es válido'
      });
    }

    const total = precioUnitario * cantidad;

    if (!Number.isSafeInteger(total)) {
      await conexion.rollback();

      return res.status(400).json({
        mensaje: 'El total de la venta supera el valor permitido'
      });
    }

    // Registrar venta
    const [resultado] = await conexion.query(
      `INSERT INTO ventas
       (producto_id, cantidad, precio_unitario, total)
       VALUES (?, ?, ?, ?)`,
      [producto_id, cantidad, precioUnitario, total]
    );

    // Descontar inventario
    await conexion.query(
      `UPDATE productos
       SET cantidad = cantidad - ?
       WHERE id = ?`,
      [cantidad, producto_id]
    );

    await conexion.commit();

    res.status(201).json({
      mensaje: 'Venta registrada correctamente',
      id: resultado.insertId,
      producto: producto.nombre,
      cantidad,
      total,
      inventario_restante: producto.cantidad - cantidad
    });

  } catch (error) {
    if (conexion) {
      await conexion.rollback();
    }

    console.error('Error al registrar venta:', error);

    res.status(500).json({
      mensaje: 'Error al registrar la venta'
    });

  } finally {
    if (conexion) {
      conexion.release();
    }
  }
});

module.exports = router;

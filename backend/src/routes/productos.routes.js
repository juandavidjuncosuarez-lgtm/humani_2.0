
const express = require('express');
const router = express.Router();

const conexion = require('../config/database');

// Middleware de autenticación y permisos
const {
  verificarToken,
  permitirRoles
} = require('../middleware/auth.middleware');

// ==========================================
// CONSULTAR TODOS LOS PRODUCTOS
// ==========================================

router.get('/', verificarToken, async (req, res) => {
  try {
    const [productos] = await conexion.query(
      'SELECT * FROM productos ORDER BY id DESC'
    );

    res.json(productos);

  } catch (error) {
    console.error('Error al consultar productos:', error.message);

    res.status(500).json({
      mensaje: 'Error al consultar los productos'
    });
  }
});

// ==========================================
// CONSULTAR PRODUCTOS POR AGOTARSE
// ==========================================

router.get('/alertas', verificarToken, async (req, res) => {
  try {
    const [productos] = await conexion.query(`
      SELECT *,
        CASE
          WHEN cantidad = 0 THEN 'AGOTADO'
          WHEN cantidad <= stock_minimo THEN 'POR AGOTARSE'
          ELSE 'NORMAL'
        END AS estado_inventario
      FROM productos
      WHERE cantidad <= stock_minimo
      ORDER BY cantidad ASC
    `);

    res.json({
      total_alertas: productos.length,
      productos
    });

  } catch (error) {
    console.error('Error al consultar alertas:', error.message);

    res.status(500).json({
      mensaje: 'Error al consultar las alertas de inventario'
    });
  }
});

// ==========================================
// REGISTRAR UN PRODUCTO
// SOLO JEFE Y ADMINISTRADOR
// ==========================================

router.post(
  '/',
  verificarToken,
  permitirRoles('Jefe', 'Administrador'),
  async (req, res) => {
    try {
      const {
        nombre,
        cantidad,
        categoria,
        almacenamiento,
        temperatura,
        precio,
        stock_minimo = 10
      } = req.body;

      if (
        typeof nombre !== 'string' ||
        !nombre.trim() ||
        nombre.trim().length > 100 ||
        typeof categoria !== 'string' ||
        !categoria.trim() ||
        categoria.trim().length > 50 ||
        !Number.isSafeInteger(Number(cantidad)) ||
        Number(cantidad) < 0 ||
        !Number.isSafeInteger(Number(precio)) ||
        Number(precio) < 0 ||
        !Number.isSafeInteger(Number(stock_minimo)) ||
        Number(stock_minimo) < 0
      ) {
        return res.status(400).json({
          mensaje: 'Verifica el nombre, categoría, cantidad, precio y stock mínimo'
        });
      }

      const [resultado] = await conexion.query(
        `INSERT INTO productos
        (nombre, cantidad, categoria, almacenamiento, temperatura, precio, stock_minimo)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre.trim(),
          Number(cantidad),
          categoria.trim(),
          almacenamiento || null,
          temperatura || null,
          Number(precio),
          Number(stock_minimo)
        ]
      );

      res.status(201).json({
        mensaje: 'Producto registrado correctamente',
        id: resultado.insertId
      });

    } catch (error) {
      console.error('Error al registrar producto:', error.message);

      res.status(500).json({
        mensaje: 'Error al registrar el producto'
      });
    }
  }
);

// ==========================================
// ACTUALIZAR UN PRODUCTO
// SOLO JEFE Y ADMINISTRADOR
// ==========================================

router.put(
  '/:id',
  verificarToken,
  permitirRoles('Jefe', 'Administrador'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const {
        nombre,
        cantidad,
        categoria,
        almacenamiento,
        temperatura,
        precio
      } = req.body;

      const stockMinimo = req.body.stock_minimo === undefined
        ? null
        : Number(req.body.stock_minimo);

      if (
        !Number.isSafeInteger(id) ||
        id <= 0 ||
        typeof nombre !== 'string' ||
        !nombre.trim() ||
        nombre.trim().length > 100 ||
        typeof categoria !== 'string' ||
        !categoria.trim() ||
        categoria.trim().length > 50 ||
        !Number.isSafeInteger(Number(cantidad)) ||
        Number(cantidad) < 0 ||
        !Number.isSafeInteger(Number(precio)) ||
        Number(precio) < 0 ||
        (
          stockMinimo !== null &&
          (!Number.isSafeInteger(stockMinimo) || stockMinimo < 0)
        )
      ) {
        return res.status(400).json({
          mensaje: 'Verifica los datos del producto'
        });
      }

      const [resultado] = await conexion.query(
        `UPDATE productos
         SET nombre = ?,
             cantidad = ?,
             categoria = ?,
             almacenamiento = ?,
             temperatura = ?,
             precio = ?,
             stock_minimo = COALESCE(?, stock_minimo)
         WHERE id = ?`,
        [
          nombre.trim(),
          Number(cantidad),
          categoria.trim(),
          almacenamiento || null,
          temperatura || null,
          Number(precio),
          stockMinimo,
          id
        ]
      );

      if (resultado.affectedRows === 0) {
        const [existentes] = await conexion.query(
          'SELECT id FROM productos WHERE id = ?',
          [id]
        );

        if (existentes.length === 0) {
          return res.status(404).json({
            mensaje: 'Producto no encontrado'
          });
        }
      }

      res.json({
        mensaje: 'Producto actualizado correctamente'
      });

    } catch (error) {
      console.error('Error al actualizar producto:', error.message);

      res.status(500).json({
        mensaje: 'Error al actualizar el producto'
      });
    }
  }
);

// ==========================================
// ELIMINAR UN PRODUCTO
// SOLO JEFE Y ADMINISTRADOR
// ==========================================

router.delete(
  '/:id',
  verificarToken,
  permitirRoles('Jefe', 'Administrador'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
          mensaje: 'Identificador de producto inválido'
        });
      }

      const [resultado] = await conexion.query(
        'DELETE FROM productos WHERE id = ?',
        [id]
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          mensaje: 'Producto no encontrado'
        });
      }

      res.json({
        mensaje: 'Producto eliminado correctamente'
      });

    } catch (error) {
      console.error('Error al eliminar producto:', error.message);

      res.status(500).json({
        mensaje: 'Error al eliminar el producto'
      });
    }
  }
);

module.exports = router;

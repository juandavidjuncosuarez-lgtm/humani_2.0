
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware de autenticación y permisos
const {
  verificarToken,
  permitirRoles
} = require('../middleware/auth.middleware');

// =====================================
// CONSULTAR TODOS LOS PEDIDOS
// TODOS LOS USUARIOS AUTENTICADOS
// =====================================

router.get('/', verificarToken, async (req, res) => {
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
// SOLO JEFE Y ADMINISTRADOR
// =====================================

router.post(
  '/',
  verificarToken,
  permitirRoles('Jefe', 'Administrador'),
  async (req, res) => {
    try {
      const { proveedor_id, producto_id, cantidad } = req.body;

      if (
        !Number.isSafeInteger(Number(proveedor_id)) ||
        Number(proveedor_id) <= 0 ||
        !Number.isSafeInteger(Number(producto_id)) ||
        Number(producto_id) <= 0 ||
        !Number.isSafeInteger(Number(cantidad)) ||
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
        Number(proveedor_id),
        Number(producto_id),
        Number(cantidad)
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
  }
);

// =====================================
// ACTUALIZAR ESTADO DEL PEDIDO
// SOLO JEFE Y ADMINISTRADOR
// =====================================

router.put(
  '/:id/estado',
  verificarToken,
  permitirRoles('Jefe', 'Administrador'),
  async (req, res) => {
    let conexion;

    try {
      const id = Number(req.params.id);
      const { estado } = req.body;

      const estadosPermitidos = [
        'Pendiente',
        'Entregado',
        'Cancelado'
      ];

      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
          mensaje: 'El ID del pedido no es válido'
        });
      }

      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
          mensaje: 'El estado seleccionado no es válido'
        });
      }

      conexion = await db.getConnection();
      await conexion.beginTransaction();

      // Buscar y bloquear el pedido
      const [pedidos] = await conexion.query(
        `SELECT id, producto_id, cantidad, estado
         FROM pedidos
         WHERE id = ?
         FOR UPDATE`,
        [id]
      );

      if (pedidos.length === 0) {
        await conexion.rollback();

        return res.status(404).json({
          mensaje: 'Pedido no encontrado'
        });
      }

      const pedido = pedidos[0];

      // Evitar modificar un pedido que ya fue recibido
      if (pedido.estado === 'Entregado' && estado !== 'Entregado') {
        await conexion.rollback();

        return res.status(400).json({
          mensaje: 'Un pedido entregado no puede volver a otro estado porque sus unidades ya fueron sumadas al inventario'
        });
      }

      // Evitar sumar nuevamente las unidades
      if (pedido.estado === 'Entregado' && estado === 'Entregado') {
        await conexion.rollback();

        return res.json({
          mensaje: 'Este pedido ya fue entregado. El inventario no se modificó nuevamente.'
        });
      }

      // Sumar las unidades cuando el pedido se entrega
      if (estado === 'Entregado') {
        const [productos] = await conexion.query(
          `SELECT id
           FROM productos
           WHERE id = ?
           FOR UPDATE`,
          [pedido.producto_id]
        );

        if (productos.length === 0) {
          await conexion.rollback();

          return res.status(404).json({
            mensaje: 'No se encontró el producto asociado al pedido'
          });
        }

        await conexion.query(
          `UPDATE productos
           SET cantidad = cantidad + ?
           WHERE id = ?`,
          [pedido.cantidad, pedido.producto_id]
        );
      }

      // Guardar el nuevo estado
      await conexion.query(
        'UPDATE pedidos SET estado = ? WHERE id = ?',
        [estado, id]
      );

      await conexion.commit();

      res.json({
        mensaje: estado === 'Entregado'
          ? `Pedido entregado. Se agregaron ${pedido.cantidad} unidades al inventario.`
          : 'Estado del pedido actualizado correctamente'
      });

    } catch (error) {
      if (conexion) {
        await conexion.rollback();
      }

      console.error('Error al actualizar pedido:', error);

      res.status(500).json({
        mensaje: 'Error al actualizar el estado del pedido'
      });

    } finally {
      if (conexion) {
        conexion.release();
      }
    }
  }
);

// =====================================
// ELIMINAR UN PEDIDO
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
          mensaje: 'El ID del pedido no es válido'
        });
      }

      const [pedidos] = await db.query(
        'SELECT estado FROM pedidos WHERE id = ?',
        [id]
      );

      if (pedidos.length === 0) {
        return res.status(404).json({
          mensaje: 'Pedido no encontrado'
        });
      }

      if (pedidos[0].estado === 'Entregado') {
        return res.status(400).json({
          mensaje: 'No se puede eliminar un pedido entregado porque sus unidades ya fueron sumadas al inventario'
        });
      }

      await db.query(
        'DELETE FROM pedidos WHERE id = ?',
        [id]
      );

      res.json({
        mensaje: 'Pedido eliminado correctamente'
      });

    } catch (error) {
      console.error('Error al eliminar pedido:', error);

      res.status(500).json({
        mensaje: 'Error al eliminar el pedido'
      });
    }
  }
);

module.exports = router;

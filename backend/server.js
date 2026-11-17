
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

// =====================================
// IMPORTAR RUTAS
// =====================================

const productosRoutes = require('./src/routes/productos.routes');
const almacenamientoRoutes = require('./src/routes/almacenamiento.routes');
const proveedoresRoutes = require('./src/routes/proveedores.routes');
const pedidosRoutes = require('./src/routes/pedidos.routes');

// =====================================
// CONFIGURACIÓN DEL SERVIDOR
// =====================================

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// RUTA PRINCIPAL
// =====================================

app.get('/', (req, res) => {
  res.json({
    mensaje: 'Servidor HUMANI activo',
    estado: 'Funcionando correctamente',
    frontend: 'http://localhost:5173'
  });
});

// =====================================
// RUTA DE PRUEBA
// =====================================

app.get('/api', (req, res) => {
  res.json({
    mensaje: 'Bienvenido a la API HUMANI',
    estado: 'Funcionando correctamente'
  });
});

// =====================================
// MÓDULO PRODUCTOS
// =====================================

app.use('/api/productos', productosRoutes);

// =====================================
// MÓDULO ALMACENAMIENTO
// =====================================

app.use('/api/almacenamiento', almacenamientoRoutes);

// =====================================
// MÓDULO PROVEEDORES
// =====================================

app.use('/api/proveedores', proveedoresRoutes);

// =====================================
// MÓDULO PEDIDOS
// =====================================

app.use('/api/pedidos', pedidosRoutes);

// =====================================
// INICIAR SERVIDOR
// =====================================

app.listen(PORT, () => {
  console.log(`Servidor HUMANI activo en http://localhost:${PORT}`);

  const url = 'http://localhost:5173';

  exec(`start "" "${url}"`);
});

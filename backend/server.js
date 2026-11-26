
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// =====================================
// IMPORTAR RUTAS
// =====================================

const authRoutes = require('./src/routes/auth.routes');
const productosRoutes = require('./src/routes/productos.routes');
const almacenamientoRoutes = require('./src/routes/almacenamiento.routes');
const proveedoresRoutes = require('./src/routes/proveedores.routes');
const pedidosRoutes = require('./src/routes/pedidos.routes');
const ventasRoutes = require('./src/routes/ventas.routes');
const usuariosRoutes = require('./src/routes/usuarios.routes');

// =====================================
// CONFIGURACIÓN DEL SERVIDOR
// =====================================

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// RUTA PRINCIPAL
// =====================================

app.get('/', (req, res) => {
    res.json({
        mensaje: 'Servidor HUMANI activo',
        estado: 'Funcionando correctamente'
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
// AUTENTICACIÓN
// =====================================

app.use('/api/auth', authRoutes);

// =====================================
// MÓDULOS DEL SISTEMA
// =====================================

app.use('/api/productos', productosRoutes);
app.use('/api/almacenamiento', almacenamientoRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/usuarios', usuariosRoutes);

// =====================================
// INICIAR SERVIDOR
// =====================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor HUMANI activo en puerto ${PORT}`);
});

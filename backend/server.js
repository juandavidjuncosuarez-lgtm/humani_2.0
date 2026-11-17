
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const conexion = require('./src/config/database');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Bienvenido a la API HUMANI',
    estado: 'Funcionando correctamente'
  });
});

// Probar conexión con MySQL
app.get('/api/prueba-db', async (req, res) => {
  try {
    const [resultado] = await conexion.query(
      'SELECT DATABASE() AS base_datos'
    );

    res.json({
      mensaje: 'Conexión exitosa con MySQL',
      base_datos: resultado[0].base_datos
    });

  } catch (error) {
    console.error('Error de conexión:', error.message);

    res.status(500).json({
      mensaje: 'No se pudo conectar con MySQL',
      error: error.message
    });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor HUMANI activo en http://localhost:${PORT}`);
});

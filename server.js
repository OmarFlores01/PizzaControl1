const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models/config/db'); // Asegúrate de que db esté bien importado
require('dotenv').config();  // Cargar las variables de entorno desde el archivo .env

const app = express();
const PORT = 3000;

// Sirve archivos estáticos sean accesibles
app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// Cuando el usuario visita la raíz, se envía el archivo login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

// Rutas para interactuar con el servidor
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pedidos', require('./routes/pedidoRoutes'));
app.use('/api/productos', require('./routes/productoRoutes'));
app.use('/api/inventario', require('./routes/inventarioRoutes'));
app.use('/api/cliente', require('./routes/clienteRoutes'));

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);

    // Ejemplo de uso de la base de datos, solo para probar si está funcionando
    db.query('SELECT 1', (err, result) => {
        if (err) {
            console.error('❌ Error en la consulta:', err);
        } else {
            console.log('✅ Conexión a la base de datos exitosa.');
        }
    });
});

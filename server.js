const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models/config/db'); // Asegúrate de que db esté bien importado
require('dotenv').config();  // Cargar las variables de entorno desde el archivo .env

const app = express();
const PORT = 3000;

// Configuración de middleware
app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// Cuando el usuario visita la raíz, se envía el archivo login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

// Rutas de la API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pedidos', require('./routes/pedidoRoutes'));
app.use('/api/productos', require('./routes/productoRoutes'));
app.use('/api/inventario', require('./routes/inventarioRoutes'));
app.use('/api/cliente', require('./routes/clienteRoutes'));

// Descarga del menú
app.get('/descargar-menu', (req, res) => {
    const menuPath = path.join(__dirname, 'assets/Menu/Menu.pdf');
    res.download(menuPath, 'Menu.pdf', (err) => {
        if (err) {
            console.error('Error al descargar el menú:', err);
            res.status(500).send('Error al descargar el menú');
        }
    });
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);

    // Prueba de conexión a la base de datos
    async function testDBConnection() {
    try {
        const [result] = await db.query('SELECT 1');  // ✅ Correcto con Promises
        console.log('✅ Conexión a la base de datos exitosa.');
    } catch (err) {
        console.error('❌ Error en la consulta:', err);
    }
}
testDBConnection();

});

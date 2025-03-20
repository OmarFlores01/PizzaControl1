require('dotenv').config(); // Carga las variables de entorno desde .env

const mysql = require('mysql'); // Carga el paquete mysql

// Crear la conexión a la base de datos usando las variables de entorno
const db = mysql.createConnection({
    host: process.env.DB_HOST,       // Host de la base de datos
    user: process.env.DB_USER,       // Usuario de la base de datos
    password: process.env.DB_PASSWORD, // Contraseña de la base de datos
    database: process.env.DB_DATABASE, // Nombre de la base de datos
    port: process.env.DB_PORT        // Puerto de la base de datos
});

// Intentar conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('❌ Error al conectar a MySQL:', err);
        return;
    }
    console.log('✅ Conectado exitosamente a MySQL 🚀');
});

module.exports = db;

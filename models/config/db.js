require('dotenv').config();
const mysql = require('mysql2');

// Verificar variables de entorno
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_DATABASE || !process.env.DB_PORT) {
    console.error('❌ Faltan variables de entorno para la conexión a la base de datos.');
    process.exit(1);
}

// Crear conexión
const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

// Probar la conexión
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
        return;
    }
    console.log('✅ Conectado a la base de datos MySQL 🚀');
    connection.release();
});

module.exports = db;

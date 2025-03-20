require('dotenv').config(); // Cargar las variables de entorno
const mysql = require('mysql2'); // Usar mysql2 en lugar de mysql

// Verificar que las variables de entorno estén definidas
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_DATABASE || !process.env.DB_PORT) {
    console.error('❌ Faltan variables de entorno para la conexión a la base de datos.');
    process.exit(1); // Salir si las variables necesarias no están definidas
}

// Crear el pool de conexiones
const db = mysql.createPool({
    connectionLimit: 10,  // Número de conexiones en el pool
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
    connection.release();  // Liberar la conexión después de la prueba
});

module.exports = db;

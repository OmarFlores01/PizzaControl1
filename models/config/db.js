require('dotenv').config(); // Cargar las variables de entorno

const mysql = require('mysql2'); // Usar mysql2 en lugar de mysql

const db = mysql.createPool({
    connectionLimit: 10,  // Número de conexiones en el pool
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

// Test de conexión
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err);
        return;
    }
    console.log('✅ Conectado a la base de datos MySQL 🚀');
    connection.release();  // Liberar la conexión después de la prueba
});

module.exports = db;

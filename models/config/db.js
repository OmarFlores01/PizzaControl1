require('dotenv').config(); // Carga las variables de entorno

const mysql = require('mysql');

const db = mysql.createPool({
    connectionLimit: 10,  // Número de conexiones permitidas en el pool
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

// Test de conexión para asegurarse de que la base de datos está funcionando
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err);
        return;
    }
    console.log('✅ Conectado a la base de datos MySQL 🚀');
    connection.release();  // Libera la conexión después de la prueba
});

module.exports = db;

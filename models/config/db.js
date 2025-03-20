const mysql = require('mysql'); // Carga el paquete mysql

const db = mysql.createConnection({
    host: 'mysql.railway.internal', // Host de Railway
    user: 'root',                   // Usuario de Railway
    password: 'hnctdwdlnuEmVnaWSDpVobLzMjKFmeDI', // Contraseña de Railway
    database: 'railway',             // Nombre de la base de datos
    port: 3306                       // Puerto de MySQL en Railway
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error al conectar a MySQL en Railway:', err);
        return;
    }
    console.log('✅ Conectado exitosamente a MySQL en Railway 🚀');
});

module.exports = db;

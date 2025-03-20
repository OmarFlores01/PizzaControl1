const express = require('express');
const router = express.Router();
const db = require('../models/config/db'); // Verifica que esté bien configurado

// Agregar un pedido
router.post('/agregar-pedido-cliente', (req, res) => {
    const { id_cliente, descripcion, total } = req.body;

    if (!id_cliente || !descripcion || !total) {
        return res.status(400).json({ success: false, message: 'Faltan datos del pedido' });
    }

    const query = `INSERT INTO pedidos (ID_Cliente, Descripcion, Estado, Fecha, Total) VALUES (?, ?, 'Pendiente', NOW(), ?)`;

    db.query(query, [id_cliente, descripcion, total], (err, result) => {
        if (err) {
            console.error('❌ Error al agregar el pedido:', err.message);
            return res.status(500).json({ success: false, message: 'Error al realizar el pedido' });
        }

        res.json({ success: true, message: 'Pedido realizado con éxito', id_pedido: result.insertId });
    });
});

// Obtener pedidos por ID de Cliente
router.get('/obtener-pedidos-cliente/:id_cliente', (req, res) => {
    const { id_cliente } = req.params;

    const query = `SELECT ID_Pedido, Descripcion, Estado, Fecha, Total FROM pedidos WHERE ID_Cliente = ? ORDER BY Fecha DESC`;

    db.query(query, [id_cliente], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener pedidos:', err.message);
            return res.status(500).json({ success: false, message: 'Error al obtener los pedidos' });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: 'No se encontraron pedidos para este cliente' });
        }

        res.json({ success: true, pedidos: results });
    });
});

// Obtener productos
router.get('/api/productos/obtener-productos', (req, res) => {
    const query = `SELECT ID_Producto, Nombre, Precio FROM productos`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error al obtener productos:', err.message);
            return res.status(500).json({ success: false, message: 'Error al obtener productos' });
        }

        res.json({ success: true, productos: results });
    });
});

module.exports = router;

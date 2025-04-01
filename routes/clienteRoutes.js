const express = require('express');
const router = express.Router();
const db = require('../models/config/db'); // Verifica que esté bien configurado

// Agregar un pedido
// Agregar un pedido
router.post('/agregar-pedido-cliente', (req, res) => {
    const { id_cliente, descripcion, total } = req.body;

    if (!id_cliente || !descripcion || !total) {
        return res.status(400).json({ success: false, message: 'Faltan datos del pedido' });
    }

    const query = "INSERT INTO pedidos (ID_Cliente, Descripcion, Total, Estado, Fecha) VALUES (?, ?, ?, 'Pendiente', NOW());";

    db.query(query, [id_cliente, descripcion, total], (err, result) => {
        if (err) {
            console.error('❌ Error al agregar el pedido:', err.message);
            return res.status(500).json({ success: false, message: 'Error al realizar el pedido' });
        }

        res.json({ success: true, message: 'Pedido realizado con éxito', id_pedido: result.insertId });
    });
});

// Obtener todos los pedidos con información del cliente
router.get('/obtener-pedidos', (req, res) => {
    const query = `
        SELECT p.ID_Pedido, c.Nombre AS Cliente, p.Total, p.Estado
        FROM pedidos p
        LEFT JOIN clientes c ON p.ID_Cliente = c.ID_Cliente
        ORDER BY p.Fecha DESC;
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('❌ Error al obtener los pedidos:', err.message);
            return res.status(500).json({ success: false, message: 'Error al obtener pedidos' });
        }

        res.json({ success: true, pedidos: result });
    });
});

// Obtener pedidos de un cliente específico
router.get('/obtener-pedidos-cliente/:id_cliente', (req, res) => {
    const id_cliente = req.params.id_cliente;

    const query = `
        SELECT ID_Pedido, Descripcion, Estado, Fecha, Total 
        FROM pedidos 
        WHERE ID_Cliente = ? 
        ORDER BY Fecha DESC;
    `;

    db.query(query, [id_cliente], (err, result) => {
        if (err) {
            console.error('❌ Error al obtener los pedidos del cliente:', err.message);
            return res.status(500).json({ success: false, message: 'Error al obtener pedidos del cliente' });
        }

        res.json({ success: true, pedidos: result });
    });
});

// Obtener productos
router.get('/obtener-productos', (req, res) => {
    const query = 'SELECT ID_Producto, Nombre FROM producto';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener productos' });
        }
        res.json({ success: true, productos: results });
    });
});






// Finalizar un pedido
router.post('/finalizar', (req, res) => {
    const { id_cliente, productos } = req.body;

    if (!id_cliente || !productos || productos.length === 0) {
        return res.status(400).json({ success: false, message: 'Faltan datos del pedido' });
    }

    const descripcion = productos.map(p => `${p.cantidad}x ${p.nombre || 'Producto desconocido'}`).join(', ');
    const total = productos.reduce((sum, p) => sum + (p.precio * p.cantidad || 0), 0);

    if (isNaN(total) || total <= 0) {
        return res.status(400).json({ success: false, message: 'Error en el cálculo del total del pedido.' });
    }

    const query = "INSERT INTO pedidos (ID_Cliente, Descripcion, Estado, Fecha, Total, ID_Empleado) VALUES (?, ?, 'En preparación', NOW(), ?, NULL);";

    db.query(query, [id_cliente, descripcion, total], (err, result) => {
        if (err) {
            console.error('❌ Error al finalizar el pedido:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error al finalizar el pedido.',
                error: err.message
            });
        }

        res.json({
            success: true,
            message: 'Pedido finalizado exitosamente.',
            id_pedido: result.insertId
        });
    });
});

module.exports = router;

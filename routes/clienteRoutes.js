const express = require('express');
const router = express.Router();
const db = require('../models/config/db'); // Asegúrate de que este archivo está bien configurado

// Agregar un pedido para clientes
router.post('/agregar-pedido-cliente', (req, res) => {
    const { id_cliente, descripcion, total } = req.body;

    if (!id_cliente || !descripcion || !total) {
        return res.status(400).json({ success: false, message: 'Faltan datos del pedido' });
    }

    const query = `INSERT INTO pedidos (ID_Cliente, Descripcion, Estado, Fecha, Total) VALUES (?, ?, 'Pendiente', NOW(), ?)`;

    db.query(query, [id_cliente, descripcion, total], (err, result) => {
        if (err) {
            console.error('❌ Error al agregar el pedido del cliente:', err.message);
            return res.status(500).json({ success: false, message: 'Error al realizar el pedido' });
        }

        res.json({ success: true, message: 'Pedido realizado con éxito', id_pedido: result.insertId });
    });
});

// Obtener pedidos por ID de Cliente
router.get('/obtener-pedidos-cliente/:id_cliente', (req, res) => {
    const { id_cliente } = req.params;

    const query = `SELECT ID_Pedido, Descripcion, Estado, Fecha, Total 
                   FROM pedidos 
                   WHERE ID_Cliente = ? 
                   ORDER BY Fecha DESC`;

    db.query(query, [id_cliente], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener pedidos del cliente:', err.message);
            return res.status(500).json({ success: false, message: 'Error al obtener los pedidos' });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: 'No se encontraron pedidos para este cliente' });
        }

        res.json({ success: true, pedidos: results });
    });
});

// Obtener un pedido específico del cliente por ID
router.get('/obtener-pedido-cliente/:id_pedido', (req, res) => {
    const { id_pedido } = req.params;

    db.query('SELECT * FROM pedidos WHERE ID_Pedido = ?', [id_pedido], (err, result) => {
        if (err) {
            console.error('❌ Error al obtener el pedido del cliente:', err);
            return res.status(500).json({ success: false, message: 'Error en la base de datos' });
        }
        res.json(result.length > 0 ? { success: true, pedido: result[0] } : { success: false, message: 'Pedido no encontrado' });
    });
});

// Obtener productos por ID de Cliente
router.get('/obtener-productos-cliente/:id_cliente', (req, res) => {
    const { id_cliente } = req.params;

    const query = `
        SELECT p.ID_Producto, p.Nombre, p.Precio, pp.Cantidad 
        FROM productos p
        JOIN pedido_producto pp ON p.ID_Producto = pp.ID_Producto
        JOIN pedidos ped ON pp.ID_Pedido = ped.ID_Pedido
        WHERE ped.ID_Cliente = ?
        ORDER BY ped.Fecha DESC`;

    db.query(query, [id_cliente], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener productos del cliente:', err.message);
            return res.status(500).json({ success: false, message: 'Error al obtener los productos' });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: 'No se encontraron productos para este cliente' });
        }

        res.json({ success: true, productos: results });
    });
});

module.exports = router;

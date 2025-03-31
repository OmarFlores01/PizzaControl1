const express = require('express');
const router = express.Router();
const db = require('../models/config/db'); // Asegúrate de tener tu conexión a la BD en este archivo

// Ruta para agregar un pedido
router.post('/agregar-pedido', (req, res) => {
    const { descripcion, total, id_empleado } = req.body;
    if (!descripcion || !total || !id_empleado) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }
    const query = `INSERT INTO pedidos (Descripcion, Estado, Fecha, Total, ID_Empleado) VALUES (?, 'En preparación', NOW(), ?, ?)`;
    
    db.query(query, [descripcion, total, id_empleado], (err, result) => {
        if (err) {
            console.error('Error al agregar pedido:', err.message);
            return res.status(500).json({ success: false, message: 'Error al agregar el pedido' });
        }
        res.json({ success: true, message: 'Pedido agregado correctamente' });
    });
});

// Obtener todos los pedidos
router.get('/obtener-pedidos', (req, res) => {
    db.query('SELECT * FROM pedidos', (err, result) => {
        if (err) {
            console.error('Error al obtener pedidos:', err);
            return res.status(500).json({ success: false, message: 'Error en la base de datos' });
        }
        res.json({ success: true, pedidos: result });
    });
});

// Obtener un pedido por ID
router.get('/obtener-pedidos/:id_pedido', (req, res) => {
    const { id_pedido } = req.params;
    db.query('SELECT * FROM pedidos WHERE ID_Pedido = ?', [id_pedido], (err, result) => {
        if (err) {
            console.error('Error al obtener el pedido:', err);
            return res.status(500).json({ success: false, message: 'Error en la base de datos' });
        }
        res.json(result.length > 0 ? { success: true, pedido: result[0] } : { success: false, message: 'Pedido no encontrado' });
    });
});

// Actualizar un pedido
router.put('/actualizar-pedido', (req, res) => {
    const { id_pedido, descripcion, estado, total } = req.body;
    if (!id_pedido || !descripcion || !estado || !total) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const query = 'UPDATE pedidos SET Descripcion = ?, Estado = ?, Total = ? WHERE ID_Pedido = ?';
    db.query(query, [descripcion, estado, total, id_pedido], (err, result) => {
        if (err) {
            console.error('Error al actualizar pedido:', err);
            return res.status(500).json({ success: false, message: 'Error en la base de datos' });
        }
        res.json({ success: true, message: 'Pedido actualizado correctamente' });
    });
});

// Eliminar un pedido
router.delete('/eliminar', (req, res) => {
    const { id_pedido } = req.body;
    if (!id_pedido) {
        return res.status(400).json({ success: false, message: 'ID de pedido requerido' });
    }
    db.query('DELETE FROM pedidos WHERE ID_Pedido = ?', [id_pedido], (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error al eliminar el pedido' });
        }
        res.json({ success: true, message: 'Pedido eliminado correctamente' });
    });
});

// Finalizar un pedido
router.post('/finalizar', (req, res) => {
    const { id_cliente, productos } = req.body;

    if (!id_cliente || !productos || productos.length === 0) {
        return res.status(400).json({ success: false, message: 'Faltan datos del pedido' });
    }

    const descripcion = productos.map(p => `${p.cantidad}x ${p.nombre}`).join(', ');
    const total = productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

    const query = `INSERT INTO pedidos (ID_Cliente, Descripcion, Estado, Fecha, Total, ID_Empleado)
                   VALUES (?, ?, 'En preparación', NOW(), ?, NULL)`;

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

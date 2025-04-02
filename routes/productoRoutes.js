const express = require('express');
const router = express.Router();
const db = require('../models/config/db'); 

// Agregar producto
router.post('/agregar-producto', (req, res) => {
    const { nombre_producto, tamanio, precio } = req.body;

    if (!nombre_producto || !tamanio || isNaN(precio) || precio <= 0) {
        return res.status(400).json({ success: false, message: "Datos inválidos" });
    }

    const query = 'INSERT INTO producto (Nombre, Tamanio, Precio) VALUES (?, ?, ?)';
    db.query(query, [nombre_producto, tamanio, precio], (err, result) => {
        if (err) {
            console.error("Error al agregar producto:", err);
            return res.status(500).json({ success: false, message: "Error al agregar producto" });
        }
        res.json({ success: true, message: "Producto agregado correctamente" });
    });
});

// Obtener todos los productos (Ahora incluye Tamanio)
router.get('/obtener-productos', (req, res) => {
    const query = 'SELECT ID_Producto, Nombre, Tamanio, Precio FROM producto';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener productos' });
        }
        res.json({ success: true, productos: results });
    });
});

// Obtener un producto por ID
router.get('/obtener-producto/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM producto WHERE ID_Producto = ?', [id], (err, result) => {
        if (err || result.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.json({ success: true, producto: result[0] });
    });
});

// Actualizar producto
router.put('/actualizar-producto', (req, res) => {
    const { id_producto, nombre_producto, tamanio, precio } = req.body;

    if (!id_producto || !nombre_producto || !tamanio || isNaN(precio) || precio <= 0) {
        return res.status(400).json({ success: false, message: "Datos inválidos" });
    }

    db.query('UPDATE producto SET Nombre = ?, Tamanio = ?, Precio = ? WHERE ID_Producto = ?', 
    [nombre_producto, tamanio, precio, id_producto], 
    (err, result) => {
        if (err) {
            console.error('Error al actualizar producto:', err);
            return res.status(500).json({ success: false, message: 'Error al actualizar producto' });
        }
        res.json({ success: true, message: 'Producto actualizado correctamente' });
    });
});

// Eliminar producto
router.delete('/eliminar-producto/:id', (req, res) => {
    const id = req.params.id;

    db.query('DELETE FROM producto WHERE ID_Producto = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar producto:', err);
            return res.status(500).json({ success: false, message: 'Error al eliminar producto' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.json({ success: true, message: 'Producto eliminado correctamente' });
    });
});

module.exports = router;

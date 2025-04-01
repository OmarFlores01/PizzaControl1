//Agregar producto-------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const db = require('../models/config/db'); // Asegúrate de importar la conexión a la BD


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



// Obtener todos los productos
router.get('/obtener-productos', (req, res) => {
    db.query('SELECT * FROM producto', (err, results) => { // Cambiado 'productos' a 'producto'
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
    db.query('SELECT * FROM producto WHERE ID_Producto = ?', [id], (err, result) => { // Cambiado 'productos' a 'producto'
        if (err || result.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.json({ success: true, producto: result[0] });
    });
});

// Actualizar producto
router.put('/actualizar-producto', (req, res) => {
    const { id_producto, nombre_producto, precio } = req.body;

    db.query('UPDATE producto SET Nombre = ?, Precio = ? WHERE ID_Producto = ?', 
    [nombre_producto, precio, id_producto], 
    (err, result) => { // Cambiado 'productos' a 'producto'
        if (err) {
            console.error('Error al actualizar producto:', err);
            return res.status(500).json({ success: false, message: 'Error al actualizar producto' });
        }
        res.json({ success: true, message: 'Producto actualizado correctamente' });
    });
});

// Eliminar un producto por ID
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

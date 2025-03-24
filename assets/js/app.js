async function finalizarPedido() {
    const id_cliente = localStorage.getItem('id_cliente');

    if (!id_cliente) {
        alert("Error: No hay cliente registrado.");
        return;
    }

    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    const pedido = {
        id_cliente: id_cliente,
        productos: carrito.map(item => ({
            id: item.id,
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio: item.precio
        }))
    };

    try {
        const response = await fetch('/api/pedidos/finalizar', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        });

        const data = await response.json();

        if (data.success) {
            carrito = [];  // Vacía el carrito
            actualizarCarrito();

            // ✅ Mostrar modal con detalles del pedido
            const modalPago = document.getElementById('modalPago');
            const detallePago = document.getElementById('detallePago');

            detallePago.innerHTML = `
                <p>Pedido finalizado correctamente.</p>
                <p><strong>ID Pedido:</strong> ${data.id_pedido}</p>
                <p><strong>Total:</strong> $${pedido.productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0).toFixed(2)}</p>
            `;

            modalPago.style.display = 'block';
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error("Error al finalizar el pedido:", error);
        alert(`Error al finalizar el pedido: ${error.message}`);
    }
}

async function verPedido() {
    const id_cliente = localStorage.getItem('id_cliente');

    if (!id_cliente) {
        alert("Error: No hay cliente registrado.");
        return;
    }

    try {
        const response = await fetch(`/api/cliente/obtener-pedidos-cliente/${id_cliente}`);
        const data = await response.json();

        if (data.success) {
            mostrarPedidosEnModal(data.pedidos);
        } else {
            alert("No se encontraron pedidos.");
        }
    } catch (error) {
        console.error("❌ Error al obtener pedidos:", error);
    }
}

function mostrarPedidosEnModal(pedidos) {
    const detallePedido = document.getElementById('detallePedido');
    
    if (pedidos.length === 0) {
        detallePedido.innerHTML = "<p>No hay pedidos registrados.</p>";
    } else {
        let contenido = "<ul>";
        pedidos.forEach(pedido => {
            contenido += `<li>
                <strong>ID:</strong> ${pedido.ID_Pedido} | 
                <strong>Descripción:</strong> ${pedido.Descripcion} | 
                <strong>Total:</strong> $${Number(pedido.Total).toFixed(2)} | 
                <strong>Estado:</strong> ${pedido.Estado} | 
                <strong>Fecha:</strong> ${pedido.Fecha}
            </li>`;
        });
        contenido += "</ul>";
        detallePedido.innerHTML = contenido;
    }

    // ✅ Mostrar el modal de pedidos
    document.getElementById('modalPedido').style.display = 'block';
}

// Funciones para cerrar los modales
function cerrarModalPago() {
    document.getElementById('modalPago').style.display = 'none';
}

function cerrarModal() {
    document.getElementById('modalPedido').style.display = 'none';
}

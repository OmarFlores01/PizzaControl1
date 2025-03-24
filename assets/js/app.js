let carrito = [];

async function obtenerProductos() {
    try {
        const response = await fetch('/api/productos/obtener-productos');
        const data = await response.json();

        if (data.success) {
            console.log("Productos recibidos:", data.productos); // Para depuración
            mostrarProductos(data.productos);
        } else {
            console.error("No se recibieron productos.");
        }
    } catch (error) {
        console.error("Error al obtener productos:", error);
    }
}

function mostrarProductos(productos) {
    const tabla = document.getElementById('productos-lista');
    tabla.innerHTML = ''; // Limpiar tabla antes de agregar nuevos productos

    productos.forEach(producto => {
        const precio = Number(producto.Precio);

        if (isNaN(precio)) {
            console.error(`❌ Precio inválido para ${producto.Nombre}:`, producto.Precio);
            return;
        }

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${producto.Nombre}</td>
            <td>$${precio.toFixed(2)}</td>
            <td>
                <button onclick="agregarAlCarrito(${producto.ID_Producto}, '${producto.Nombre.replace(/'/g, "\\'")}', ${precio})">Añadir</button>
            </td>
        `;

        tabla.appendChild(fila);
    });
}

window.addEventListener('DOMContentLoaded', obtenerProductos);

function agregarAlCarrito(id, nombre, precio) {
    console.log(`Añadiendo al carrito - ID: ${id}, Nombre: ${nombre}, Precio: ${precio}`);

    let productoEnCarrito = carrito.find(producto => producto.id === id);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad += 1;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }

    actualizarCarrito();
}

function actualizarCarrito() {
    const tablaCarrito = document.getElementById('carrito-lista');
    tablaCarrito.innerHTML = '';

    carrito.forEach((producto, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${producto.nombre}</td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td>${producto.cantidad}</td>
            <td>$${(producto.precio * producto.cantidad).toFixed(2)}</td>
            <td>
                <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
                <button onclick="aumentarCantidad(${index})">+</button>
                <button onclick="disminuirCantidad(${index})">-</button>
            </td>
        `;
        tablaCarrito.appendChild(fila);
    });
}

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


function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

function aumentarCantidad(index) {
    carrito[index].cantidad += 1;
    actualizarCarrito();
}

function disminuirCantidad(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad -= 1;
    } else {
        eliminarDelCarrito(index);
    }
    actualizarCarrito();
}


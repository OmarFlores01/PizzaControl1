let carrito = [];

// Asegurar que los modales estén ocultos al cargar la página con CSS
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('modalPago').style.display = 'none';
    document.getElementById('modalPedido').style.display = 'none';
    obtenerProductos(); // Cargar productos al inicio
});


// Función para obtener productos
async function obtenerProductos() {
    try {
        const response = await fetch('/api/productos/obtener-productos');
        if (!response.ok) throw new Error("Error en la API");
        const data = await response.json();

        if (data.success) {
            console.log("Productos recibidos:", data.productos);
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
    tabla.innerHTML = '';

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
            carrito = [];  
            actualizarCarrito();

            // ✅ Mostrar modal con detalles del pedido
            const modalPago = document.getElementById('modalPago');
            const detallePago = document.getElementById('detallePago');

            detallePago.innerHTML = `
                <p>Pedido finalizado correctamente.</p>
                <p><strong>ID Pedido:</strong> ${data.id_pedido}</p>
                <p><strong>Total:</strong> $${pedido.productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0).toFixed(2)}</p>
                <p><strong>Cuenta de Transferencia:</strong> 123456789876543</p>
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

// Función para ver el pedido con validación
async function verPedido() {
    const id_cliente = localStorage.getItem('id_cliente');

    if (!id_cliente) {
        alert("Error: No hay cliente registrado.");
        return;
    }

    try {
        const response = await fetch(`/api/cliente/obtener-pedidos-cliente/${id_cliente}`);
        const data = await response.json();

        console.log("📌 Datos obtenidos del pedido:", data);

        if (data.success && data.pedidos.length > 0) {
            mostrarPedidosEnModal(data.pedidos);
            document.getElementById('modalPedido').style.display = 'block';
        } else {
            alert("No se encontraron pedidos.");
        }
    } catch (error) {
        console.error("❌ Error al obtener pedidos:", error);
    }
}


// Función para mostrar los pedidos en el modal
function mostrarPedidosEnModal(pedidos) {
    const modalBody = document.getElementById('modalPedidoBody');
    modalBody.innerHTML = "";
    
    pedidos.forEach(pedido => {
        const pedidoElemento = document.createElement("div");
        pedidoElemento.textContent = `Pedido: ${pedido.id} - Estado: ${pedido.estado}`;
        modalBody.appendChild(pedidoElemento);
    });
}

    // ✅ Asegurar que el modal se muestra
    document.getElementById('modalPedido').style.display = 'block';
    console.log("✅ Modal de pedido mostrado");
}


    // ✅ Mostrar el modal de pedidos
    document.getElementById('modalPedido').style.display = 'block';
}


// Función para cerrar modales
function cerrarModal(idModal) {
    document.getElementById(idModal).style.display = 'none';
}

function verPedido() {
    const modal = document.getElementById('modalPedido');
    modal.style.display = 'block';
    console.log("✅ Modal de pedido abierto");
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

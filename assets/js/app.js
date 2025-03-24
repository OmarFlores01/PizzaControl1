let carrito = [];

async function obtenerProductos() {
    try {
        const response = await fetch('/api/productos/obtener-productos');
        const data = await response.json();
        if (data.success) {
            mostrarProductos(data.productos);
        } else {
            console.error("No se recibieron productos.");
        }
    } catch (error) {
        console.error("Error al obtener productos:", error);
    }
}

function mostrarProductos(productos) {
    console.log("Entré a mostrarProductos con productos:", productos);

    const tabla = document.getElementById('productos-lista');
    tabla.innerHTML = ''; // Limpiar tabla

    productos.forEach(producto => {
        const precio = Number(producto.Precio);

        if (isNaN(precio)) {
            console.error(`❌ Precio inválido para ${producto.Nombre}: ${producto.Precio}`);
            return;
        }

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${producto.Nombre}</td>
            <td>$${precio.toFixed(2)}</td>
            <td>
                <button onclick='agregarAlCarrito(${producto.ID_Producto}, "${producto.Nombre.replace(/"/g, '\\"')}", ${precio})'>Añadir</button>
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

// Función que se llama cuando el pedido se finaliza
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

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);

        const data = await response.json();

        if (data.success) {
            alert("Pedido finalizado correctamente.");
            carrito = [];  // Vacía el carrito
            actualizarCarrito();

            // Mostrar modal de detalles de pago
            mostrarModalPago(data.id_pedido, data.total);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error("Error al finalizar el pedido:", error);
        alert(`Error al finalizar el pedido: ${error.message}`);
    }
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

// Función para ver los pedidos del cliente
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
        console.error("Error al obtener los pedidos:", error);
    }
}

// Función para mostrar el modal de pago con detalles del pedido
function mostrarModalPago(id_pedido, total) {
    document.getElementById('modal-pedido-id').textContent = id_pedido;
    document.getElementById('modal-total-pedido').textContent = total.toFixed(2);
    document.getElementById('modalPago').style.display = 'block';
}


// Función para cerrar el modal de pago
function cerrarModalPago() {
    document.getElementById('modalPago').style.display = 'none';
}

// Función para mostrar los pedidos en el modal
function mostrarPedidosEnModal(pedidos) {
    const listaPedidos = document.getElementById('lista-pedidos');
    listaPedidos.innerHTML = ''; // Limpiar contenido previo

    if (pedidos.length === 0) {
        listaPedidos.innerHTML = "<li>No tienes pedidos realizados.</li>";
    } else {
        pedidos.forEach(pedido => {
            const itemPedido = document.createElement('li');
            itemPedido.innerHTML = `
                <strong>ID:</strong> ${pedido.ID_Pedido} | 
                <strong>Descripción:</strong> ${pedido.Descripcion} | 
                <strong>Total:</strong> $${pedido.Total.toFixed(2)} | 
                <strong>Estado:</strong> ${pedido.Estado} | 
                <strong>Fecha:</strong> ${pedido.Fecha}
            `;
            listaPedidos.appendChild(itemPedido);
        });
    }

    // Mostrar el modal de pedidos
    document.getElementById('modalPedido').style.display = 'block';
}

// Función para cerrar el modal de pedidos
function cerrarModal() {
    document.getElementById('modalPedido').style.display = 'none';
}

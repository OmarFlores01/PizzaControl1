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
    const tabla = document.getElementById('productos-lista');
    tabla.innerHTML = '';

    productos.forEach(producto => {
        const precio = Number(producto.Precio);
        const nombreDecodificado = decodeURIComponent(producto.Nombre);

        if (isNaN(precio) || !nombreDecodificado) {
            console.error(`❌ Producto inválido: ${producto.Nombre} - Precio: ${producto.Precio}`);
            return;
        }

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${nombreDecodificado}</td>
            <td>$${precio.toFixed(2)}</td>
            <td>
                <button onclick='agregarAlCarrito(${producto.ID_Producto}, "${nombreDecodificado}", ${precio})'>Añadir</button>
            </td>
        `;

        tabla.appendChild(fila);
    });
}

window.addEventListener('DOMContentLoaded', obtenerProductos);

function agregarAlCarrito(id, nombre, precio) {
    if (!nombre || isNaN(precio)) {
        console.error("❌ No se puede agregar un producto inválido.");
        return;
    }

    let productoEnCarrito = carrito.find(producto => producto.id === id);

    if (!productoEnCarrito) {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }

    actualizarCarrito();
}

function actualizarCarrito() {
    const tablaCarrito = document.getElementById('carrito-lista');
    tablaCarrito.innerHTML = '';

    if (carrito.length === 0) {
        tablaCarrito.innerHTML = '<tr><td colspan="5">Tu carrito está vacío.</td></tr>';
    } else {
        carrito.forEach((producto, index) => {
            const totalProducto = producto.precio * producto.cantidad;
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${producto.nombre}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>
                    <input type="number" value="${producto.cantidad}" min="1" onchange="cambiarCantidad(${index}, this.value)">
                </td>
                <td>$${totalProducto.toFixed(2)}</td>
                <td>
                    <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
                </td>
            `;
            tablaCarrito.appendChild(fila);
        });
    }
}

function cambiarCantidad(index, nuevaCantidad) {
    nuevaCantidad = parseInt(nuevaCantidad);
    if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
        nuevaCantidad = 1;
    }
    carrito[index].cantidad = nuevaCantidad;
    actualizarCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
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

    const productosValidos = carrito.map(item => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio
    }));

    const total = productosValidos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

    if (isNaN(total) || total <= 0) {
        alert("Error: El total del pedido no es válido.");
        return;
    }

    const pedido = {
        id_cliente: id_cliente,
        productos: productosValidos
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
            
            // Vaciar carrito
            carrito = [];
            actualizarCarrito();

            // Mostrar el modal con los datos del pedido
            mostrarModalPago(data.id_pedido, total);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error("Error al finalizar el pedido:", error);
        alert(`Error al finalizar el pedido: ${error.message}`);
    }
}

// ✅ Esta función ahora muestra el ID en el modal de pago correctamente
function mostrarModalPago(idPedido, total) {
    document.getElementById("modal-pedido-id").textContent = idPedido;
    document.getElementById("modal-total-pedido").textContent = total.toFixed(2);
    document.getElementById("modal-concepto").textContent = `Pedido-${idPedido}`;

    // Mostrar el modal
    document.getElementById("modalPago").style.display = "block";
}

function cerrarModalPago() {
    document.getElementById("modalPago").style.display = "none";
}


function aumentarCantidad(index) {
    if (index >= 0 && index < carrito.length) {
        carrito[index].cantidad += 1;
        actualizarCarrito();
    }
}

function disminuirCantidad(index) {
    if (index >= 0 && index < carrito.length) {
        if (carrito[index].cantidad > 1) {
            carrito[index].cantidad -= 1;
        } else {
            // Si la cantidad llega a 0, eliminar el producto del carrito
            carrito.splice(index, 1);
        }
        actualizarCarrito();
    }
}


function cerrarModalPago() {
    document.getElementById('modalPago').style.display = 'none';
}

// 💡 Función corregida para ver pedidos
async function verPedido() {
    const id_cliente = localStorage.getItem('id_cliente');

    if (!id_cliente) {
        alert("Error: No hay cliente registrado.");
        return;
    }

    // Redirigir a pedidos.html con el ID del cliente en la URL
    window.location.href = `/views/pedidos.html?id_cliente=${id_cliente}`;
}



// 💡 Función corregida para mostrar pedidos en el modal
function mostrarPedidosEnModal(pedidos) {
    const listaPedidos = document.getElementById('lista-pedidos');
    listaPedidos.innerHTML = '';

    if (pedidos.length === 0) {
        listaPedidos.innerHTML = "<li>No tienes pedidos realizados.</li>";
        return;
    }

    pedidos.forEach(pedido => {
        // Verificar si `Total` es un número, si no, convertirlo
        let total = Number(pedido.Total); 

        if (isNaN(total)) {
            console.warn(`Pedido con ID ${pedido.ID_Pedido} tiene un Total inválido:`, pedido.Total);
            total = 0; // Si no es un número, asignamos 0 para evitar errores
        }

        const itemPedido = document.createElement('li');
        itemPedido.innerHTML = `
            <strong>ID:</strong> ${pedido.ID_Pedido} | 
            <strong>Descripción:</strong> ${pedido.Descripcion} | 
            <strong>Total:</strong> $${total.toFixed(2)} | 
            <strong>Estado:</strong> ${pedido.Estado} | 
            <strong>Fecha:</strong> ${pedido.Fecha}
        `;

        listaPedidos.appendChild(itemPedido);
    });

    document.getElementById('modalPedido').style.display = 'block';
}

// 💡 Función para cerrar modal de pedidos
function cerrarModal() {
    document.getElementById('modalPedido').style.display = 'none';
}

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
    } else {
        productoEnCarrito.cantidad += 1;
    }

    actualizarCarrito();
}

function actualizarCarrito() {
    const tablaCarrito = document.getElementById('carrito-lista');
    const btnFinalizar = document.getElementById('btn-finalizar');
    tablaCarrito.innerHTML = '';

    if (carrito.length === 0) {
        tablaCarrito.innerHTML = '<tr><td colspan="5">Tu carrito está vacío.</td></tr>';
        btnFinalizar.disabled = true;
        return;
    }

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

    btnFinalizar.disabled = false;
}

function cambiarCantidad(index, nuevaCantidad) {
    nuevaCantidad = parseInt(nuevaCantidad);
    if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
        alert("La cantidad debe ser un número válido y mayor a 0.");
        actualizarCarrito();
        return;
    }
    carrito[index].cantidad = nuevaCantidad;
    actualizarCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

async function finalizarPedido() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    const id_cliente = localStorage.getItem('id_cliente');
    if (!id_cliente) {
        alert("Error: No hay cliente registrado.");
        return;
    }

    try {
        const response = await fetch('/finalizar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cliente, productos: carrito })
        });

        const data = await response.json();
        if (data.success) {
            alert("Pedido finalizado con éxito.");
            carrito = [];
            actualizarCarrito();
        } else {
            alert("Error al finalizar el pedido: " + (data.message || "Desconocido"));
        }
    } catch (error) {
        console.error("Error en finalizarPedido:", error);
        alert("Hubo un problema al conectar con el servidor.");
    }
}

    const data = await response.json();
    if (data.success) {
        alert("Pedido finalizado con éxito.");
        carrito = [];
        actualizarCarrito();
    } else {
        alert("Error al finalizar el pedido: " + data.message);
    }
}

function mostrarModalPago(idPedido, total) {
    document.getElementById("modal-pedido-id").textContent = idPedido;
    document.getElementById("modal-total-pedido").textContent = total.toFixed(2);
    document.getElementById("modal-concepto").textContent = `Pedido-${idPedido}`;
    document.getElementById("modalPago").style.display = "block";
}

function cerrarModalPago() {
    document.getElementById('modalPago').style.display = 'none';
}

async function verPedido() {
    const id_cliente = localStorage.getItem('id_cliente');
    if (!id_cliente) {
        alert("Error: No hay cliente registrado.");
        return;
    }
    window.location.href = `/views/pedidos.html?id_cliente=${id_cliente}`;
}

function mostrarPedidosEnModal(pedidos) {
    const listaPedidos = document.getElementById('lista-pedidos');
    listaPedidos.innerHTML = '';

    if (pedidos.length === 0) {
        listaPedidos.innerHTML = "<li>No tienes pedidos realizados.</li>";
        return;
    }

    pedidos.forEach(pedido => {
        const total = Number(pedido.Total) || 0;
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

function cerrarModal() {
    document.getElementById('modalPedido').style.display = 'none';
}

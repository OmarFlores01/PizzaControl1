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
    tabla.innerHTML = ''; // Evitar duplicados
    
    productos.forEach(producto => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${producto.Nombre}</td>
            <td>$${producto.Precio.toFixed(2)}</td>
            <td><button onclick="agregarAlCarrito(${producto.ID_Producto}, '${producto.Nombre}', ${producto.Precio})">Añadir</button></td>
        `;
        tabla.appendChild(fila);
    });
}

function agregarAlCarrito(id, nombre, precio) {
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
            contenido += `<li><strong>ID:</strong> ${pedido.ID_Pedido} | <strong>Descripción:</strong> ${pedido.Descripcion} | <strong>Total:</strong> $${pedido.Total.toFixed(2)} | <strong>Estado:</strong> ${pedido.Estado} | <strong>Fecha:</strong> ${pedido.Fecha}</li>`;
        });
        contenido += "</ul>";
        detallePedido.innerHTML = contenido;
    }

    document.getElementById('modalPedido').style.display = 'block';
}

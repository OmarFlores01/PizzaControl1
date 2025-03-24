// Asegurar que los modales estén ocultos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const modales = ["modalPago", "modalPedido"];
    modales.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = 'none';
    });

    obtenerProductos(); // Cargar productos al inicio
});

// Función para cerrar un modal
function cerrarModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) modal.style.display = 'none';
}

// Función para abrir un modal
function mostrarModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) modal.style.display = 'block';
}

// Obtener productos
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

// Mostrar productos en la tabla
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

// Ver pedidos
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
            mostrarModal('modalPedido');
        } else {
            alert("No se encontraron pedidos.");
        }
    } catch (error) {
        console.error("❌ Error al obtener pedidos:", error);
    }
}

// Mostrar pedidos en el modal
function mostrarPedidosEnModal(pedidos) {
    const modalBody = document.getElementById('modalPedidoBody');
    modalBody.innerHTML = "";

    pedidos.forEach(pedido => {
        const pedidoElemento = document.createElement("div");
        pedidoElemento.textContent = `Pedido: ${pedido.id} - Estado: ${pedido.estado}`;
        modalBody.appendChild(pedidoElemento);
    });
}

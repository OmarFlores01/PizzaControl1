let pedidos = [];

async function obtenerPedidos() {
    try {
        const response = await fetch('/api/pedidos/obtener-pedidos');
        const data = await response.json();
        if (data.success) {
            mostrarPedidos(data.pedidos);
        } else {
            console.error("No se recibieron pedidos.");
        }
    } catch (error) {
        console.error("Error al obtener pedidos:", error);
    }
}

function mostrarPedidos(pedidos) {
    const tabla = document.getElementById('pedidos-lista');
    tabla.innerHTML = '';

    pedidos.forEach(pedido => {
        const total = Number(pedido.Total) || 0;
        const descripcionDecodificada = decodeURIComponent(pedido.Descripcion);

        if (!descripcionDecodificada) {
            console.error(`❌ Pedido inválido: ${pedido.ID_Pedido} - Descripción: ${pedido.Descripcion}`);
            return;
        }

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${pedido.ID_Pedido}</td>
            <td>${descripcionDecodificada}</td>
            <td>$${total.toFixed(2)}</td>
            <td>${pedido.Estado}</td>
            <td>
                <button onclick='actualizarEstadoPedido(${pedido.ID_Pedido}, "Completado")'>Completar</button>
                <button onclick='eliminarPedido(${pedido.ID_Pedido})'>Eliminar</button>
            </td>
        `;

        tabla.appendChild(fila);
    });
}

window.addEventListener('DOMContentLoaded', obtenerPedidos);

function actualizarEstadoPedido(idPedido, nuevoEstado) {
    fetch(`/api/pedidos/actualizar-estado/${idPedido}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Estado actualizado correctamente");
            obtenerPedidos();
        } else {
            alert("Error al actualizar estado: " + data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}

function eliminarPedido(idPedido) {
    fetch(`/api/pedidos/eliminar/${idPedido}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Pedido eliminado correctamente");
            obtenerPedidos();
        } else {
            alert("Error al eliminar el pedido: " + data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}

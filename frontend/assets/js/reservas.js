/* ============================================================
   CONFIG GLOBAL + TOKEN
============================================================ */
const API = "http://127.0.0.1:8000";
const token = localStorage.getItem("token");

// Helper fetch con token
async function apiFetch(url, options = {}) {
    options.headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`
    };
    return await fetch(url, options);
}

/* ============================================================
   LISTAR RESERVAS
============================================================ */
async function cargarReservas() {
    if (!location.href.includes("lista_reservas")) return;

    const res = await apiFetch(`${API}/reservas`);
    const data = await res.json();

    const tbody = document.getElementById("tabla-reservas");
    tbody.innerHTML = "";

    data.forEach(r => {
        tbody.innerHTML += `
            <tr>
                <td>${r.id}</td>
                <td>${r.cliente?.nombres ?? "-"}</td>
                <td>${r.fecha_reserva}</td>
                <td>${r.fecha_evento}</td>
                <td><span class="estado estado-${r.estado.toLowerCase()}">${r.estado}</span></td>
                <td>
                    <a href="ver_reserva.html?id=${r.id}" class="btn-sm btn-view">Ver</a>
                    <a href="editar_reserva.html?id=${r.id}" class="btn-sm btn-edit">Editar</a>
                    <button class="btn-sm btn-delete" onclick="eliminarReserva(${r.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

cargarReservas();

/* ============================================================
   BUSCADOR EN TIEMPO REAL
============================================================ */
document.getElementById("buscador")?.addEventListener("keyup", e => {
    const texto = e.target.value.toLowerCase();
    const filas = document.querySelectorAll("#tabla-reservas tr");

    filas.forEach(f => {
        f.style.display = f.textContent.toLowerCase().includes(texto) ? "" : "none";
    });
});

/* ============================================================
   ELIMINAR RESERVA
============================================================ */
async function eliminarReserva(id) {
    if (!confirm("¿Eliminar esta reserva?")) return;

    const res = await apiFetch(`${API}/reservas/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) {
        alert("Error al eliminar la reserva");
        return;
    }

    alert("Reserva eliminada correctamente");
    cargarReservas();
}

/* ============================================================
   REGISTRAR RESERVA
============================================================ */
async function registrarReserva() {
    const data = {
        cliente_id: document.getElementById("cliente").value,
        fecha_reserva: document.getElementById("fecha_reserva").value,
        fecha_evento: document.getElementById("fecha_evento").value,
        estado: document.getElementById("estado").value
    };

    const res = await apiFetch(`${API}/reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        alert("Error al registrar la reserva");
        return;
    }

    alert("Reserva registrada correctamente");
    window.location.href = "lista_reservas.html";
}

/* ============================================================
   CARGAR RESERVA PARA EDITAR
============================================================ */
async function cargarEditarReserva() {
    if (!location.href.includes("editar_reserva")) return;

    const id = new URLSearchParams(location.search).get("id");

    const res = await apiFetch(`${API}/reservas/${id}`);
    const r = await res.json();

    document.getElementById("cliente").value = r.cliente_id;
    document.getElementById("fecha_reserva").value = r.fecha_reserva;
    document.getElementById("fecha_evento").value = r.fecha_evento;
    document.getElementById("estado").value = r.estado;
}

cargarEditarReserva();

/* ============================================================
   GUARDAR EDICIÓN
============================================================ */
async function guardarReserva() {
    const id = new URLSearchParams(window.location.search).get("id");

    const data = {
        fecha_reserva: document.getElementById("fecha_reserva").value,
        fecha_evento: document.getElementById("fecha_evento").value,
        estado: document.getElementById("estado").value
    };

    const res = await apiFetch(`${API}/reservas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        alert("Error al actualizar la reserva");
        return;
    }

    alert("Reserva actualizada");
    window.location.href = "lista_reservas.html";
}

/* ============================================================
   VER DETALLE RESERVA
============================================================ */
async function cargarDetalle() {
    if (!location.href.includes("ver_reserva")) return;

    const id = new URLSearchParams(location.search).get("id");

    const res = await apiFetch(`${API}/reservas/${id}`);
    const r = await res.json();

    document.getElementById("det-id").textContent = r.id;
    document.getElementById("det-cliente").textContent = r.cliente?.nombres ?? "-";
    document.getElementById("det-fecha-reserva").textContent = r.fecha_reserva;
    document.getElementById("det-fecha-evento").textContent = r.fecha_evento;

    const estado = document.getElementById("det-estado");
    estado.textContent = r.estado;
    estado.classList.add(`estado-${r.estado.toLowerCase()}`);
}

cargarDetalle();


/* ============================================================
   CONFIG GLOBAL
============================================================ */
const API = "http://127.0.0.1:8000";

/* ============================================================
   FETCH CON TOKEN (NO CONGELADO)
============================================================ */
async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token") || "";
    const headers = {...(options.headers || {}) };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    return fetch(url, {...options, headers });
}

/* ============================================================
   LISTAR RESERVAS
============================================================ */
async function cargarReservas() {
    if (!location.pathname.endsWith("lista_reservas.html")) return;

    try {
        const res = await apiFetch(`${API}/reservas/`);
        if (!res.ok) throw new Error(res.status);

        const data = await res.json();
        const tbody = document.getElementById("tabla-reservas");
        if (!tbody) return;

        tbody.innerHTML = "";

        (data || []).forEach(r => {
            let clienteNombre = "-";
            if (r && r.cliente && r.cliente.nombres) {
                clienteNombre = r.cliente.nombres;
            }

            tbody.innerHTML += `
                <tr>
                    <td>${r.id || "-"}</td>
                    <td>${clienteNombre}</td>
                    <td>${r.fecha_reserva || "-"}</td>
                    <td>${r.fecha_evento || "-"}</td>
                    <td>
                        <span class="estado estado-${String(r.estado || "").toLowerCase()}">
                            ${r.estado || "-"}
                        </span>
                    </td>
                    <td>
                        <a href="ver_reserva.html?id=${r.id}" class="btn-sm btn-view">Ver</a>
                        <a href="editar_reserva.html?id=${r.id}" class="btn-sm btn-edit">Editar</a>
                        <button class="btn-sm btn-delete"
                            onclick="eliminarReserva(${r.id})">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Error cargando reservas:", e);
    }
}

cargarReservas();

/* ============================================================
   BUSCADOR
============================================================ */
const buscador = document.getElementById("buscador");
if (buscador) {
    buscador.addEventListener("keyup", e => {
        const texto = e.target.value.toLowerCase();
        document.querySelectorAll("#tabla-reservas tr").forEach(fila => {
            fila.style.display = fila.textContent.toLowerCase().includes(texto) ?
                "" :
                "none";
        });
    });
}

/* ============================================================
   ELIMINAR RESERVA
============================================================ */
async function eliminarReserva(id) {
    if (!confirm("¿Eliminar esta reserva?")) return;

    const res = await apiFetch(`${API}/reservas/${id}`, { method: "DELETE" });
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

    const res = await apiFetch(`${API}/reservas/`, {
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
    if (!location.pathname.endsWith("editar_reserva.html")) return;

    const id = new URLSearchParams(location.search).get("id");
    if (!id) return;

    const res = await apiFetch(`${API}/reservas/${id}`);
    if (!res.ok) return alert("No se pudo cargar la reserva");

    const r = await res.json();

    document.getElementById("cliente").value = r.cliente_id || "";
    document.getElementById("fecha_reserva").value = r.fecha_reserva || "";
    document.getElementById("fecha_evento").value = r.fecha_evento || "";
    document.getElementById("estado").value = r.estado || "";
}

cargarEditarReserva();

/* ============================================================
   GUARDAR EDICIÓN
============================================================ */
async function guardarReserva() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return alert("ID inválido");

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
    if (!location.pathname.endsWith("ver_reserva.html")) return;

    const id = new URLSearchParams(location.search).get("id");
    if (!id) return;

    const res = await apiFetch(`${API}/reservas/${id}`);
    if (!res.ok) return;

    const r = await res.json();

    document.getElementById("det-id").textContent = r.id || "-";
    document.getElementById("det-cliente").textContent =
        r && r.cliente && r.cliente.nombres ? r.cliente.nombres : "-";
    document.getElementById("det-fecha-reserva").textContent = r.fecha_reserva || "-";
    document.getElementById("det-fecha-evento").textContent = r.fecha_evento || "-";

    const estado = document.getElementById("det-estado");
    estado.textContent = r.estado || "-";
    estado.classList.add(`estado-${String(r.estado || "").toLowerCase()}`);
}

cargarDetalle();

/* ============================================================
   EXPORT GLOBAL
============================================================ */
window.registrarReserva = registrarReserva;
window.guardarReserva = guardarReserva;
window.eliminarReserva = eliminarReserva;
/* ============================================================
   CONFIG + TOKEN
============================================================ */
const API = "http://127.0.0.1:8000";

function getToken() {
    return localStorage.getItem("token") || "";
}

async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = {...(options.headers || {}) };

    // Solo manda Authorization si hay token
    if (token) headers["Authorization"] = "Bearer " + token;

    // Si NO es FormData y hay body, asume JSON
    if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {...options, headers });

    // Si sesión expirada, redirige al login
    if (res.status === 401) {
        alert("Sesión expirada");
        localStorage.clear();
        window.location.href = "../../login.html";
    }

    return res;
}

/* ============================================================
   CARGAR FULLCALENDAR
============================================================ */
let calendar;

document.addEventListener("DOMContentLoaded", function() {
    calendar = new FullCalendar.Calendar(document.getElementById("calendar"), {
        initialView: "dayGridMonth",
        height: 680,
        locale: "es",
        selectable: true,

        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },

        events: async function(info, success, fail) {
            try {
                const res = await apiFetch(`${API}/disponibilidad/`);
                const data = await res.json();

                const eventos = data.map(d => ({
                    id: d.id,
                    title: d.estado.toUpperCase(),
                    date: d.fecha,
                    color: d.estado === "reservado" ? "#EF4444" : d.estado === "bloqueado" ? "#6B7280" : "#22C55E"
                }));

                success(eventos);

            } catch (e) {
                fail(e);
            }
        },

        dateClick(info) { abrirModal(info.dateStr, null); },
        eventClick(info) { abrirModal(info.event.startStr, info.event.id); }
    });

    calendar.render();
});

/* ============================================================
   MODAL
============================================================ */
const modal = document.getElementById("modal-bg");
const fechaInput = document.getElementById("fecha");
const estadoInput = document.getElementById("estado");
const motivoInput = document.getElementById("motivo");
const btnGuardar = document.getElementById("btn-guardar");
const btnEliminar = document.getElementById("btn-eliminar");
const btnCerrar = document.getElementById("btn-cerrar");

let editId = null;

function abrirModal(fecha, id) {
    modal.style.display = "flex";
    fechaInput.value = fecha;
    editId = id;

    if (id) {
        document.getElementById("modal-title").textContent = "Editar Disponibilidad";
        btnEliminar.style.display = "block";
        cargarDisponibilidad(id);
    } else {
        document.getElementById("modal-title").textContent = "Nueva Disponibilidad";
        btnEliminar.style.display = "none";
        estadoInput.value = "disponible";
        motivoInput.value = "";
    }
}

btnCerrar.onclick = () => modal.style.display = "none";

/* ============================================================
   CARGAR PARA EDITAR
============================================================ */
async function cargarDisponibilidad(id) {
    const res = await apiFetch(`${API}/disponibilidad/${id}`);
    const d = await res.json();

    fechaInput.value = d.fecha;
    estadoInput.value = d.estado;
    motivoInput.value = d.motivo || "";
}

/* ============================================================
   GUARDAR
============================================================ */
btnGuardar.onclick = async() => {
    const payload = {
        fecha: fechaInput.value,
        estado: estadoInput.value,
        motivo: motivoInput.value
    };

    const url = editId ?
        `${API}/disponibilidad/${editId}` :
        `${API}/disponibilidad/`;

    const res = await apiFetch(url, {
        method: editId ? "PUT" : "POST",
        body: JSON.stringify(payload)
    });

    if (!res.ok) return alert("Error al guardar");

    alert("Guardado correctamente");
    modal.style.display = "none";
    calendar.refetchEvents();
};

/* ============================================================
   ELIMINAR
============================================================ */
btnEliminar.onclick = async() => {
    if (!confirm("¿Eliminar disponibilidad?")) return;

    const res = await apiFetch(`${API}/disponibilidad/${editId}`, { method: "DELETE" });

    if (!res.ok) return alert("Error al eliminar");

    alert("Eliminado correctamente");
    modal.style.display = "none";
    calendar.refetchEvents();
};
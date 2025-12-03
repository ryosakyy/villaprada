/* ============================================================
   CONFIG GLOBAL
============================================================ */
const API = "http://127.0.0.1:8000";
const token = localStorage.getItem("token");

/* Helper para fetch con token */
async function apiFetch(url, options = {}) {
    options.headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`
    };
    const res = await fetch(url, options);
    return res;
}

/* ============================================================
   CARGAR LISTA DE CONTRATOS
============================================================ */

async function cargarContratos() {
    const tabla = document.getElementById("tabla-contratos");
    if (!tabla) return;

    const res = await apiFetch(`${API}/contratos`);
    const contratos = await res.json();

    tabla.innerHTML = "";

    contratos.forEach(c => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${c.id}</td>
            <td>${c.cliente?.nombres || "-"}</td>
            <td>${c.paquete?.nombre || "-"}</td>
            <td>${c.fecha_evento}</td>
            <td>S/ ${c.monto_total}</td>
            <td>${c.estado}</td>
            <td>
                <a href="ver_contrato.html?id=${c.id}" class="btn-sm btn-view">Ver</a>
                <a href="editar_contrato.html?id=${c.id}" class="btn-sm btn-edit">Editar</a>
                <button onclick="eliminarContrato(${c.id})" class="btn-sm btn-delete">Eliminar</button>
            </td>
        `;

        tabla.appendChild(tr);
    });
}

cargarContratos();

/* ============================================================
   REGISTRAR CONTRATO
============================================================ */

async function registrarContrato() {
    const data = {
        cliente_id: clienteSeleccionado,
        paquete_id: document.getElementById("paquete").value,
        fecha_evento: document.getElementById("fecha_evento").value,
        monto_total: document.getElementById("monto").value,
        estado: document.getElementById("estado").value
    };

    const res = await apiFetch(`${API}/contratos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) return alert("Error al registrar contrato");

    alert("Contrato registrado");
    window.location.href = "lista_contratos.html";
}

/* ============================================================
   EDITAR CONTRATO
============================================================ */

async function cargarContratoEditar() {
    if (!location.href.includes("editar_contrato")) return;

    const id = new URLSearchParams(window.location.search).get("id");

    const res = await apiFetch(`${API}/contratos/${id}`);
    const contrato = await res.json();

    await cargarPaquetes();

    document.getElementById("cliente").value = contrato.cliente.nombres;
    document.getElementById("paquete").value = contrato.paquete_id;
    document.getElementById("fecha_evento").value = contrato.fecha_evento;
    document.getElementById("monto").value = contrato.monto_total;
    document.getElementById("estado").value = contrato.estado;
}

cargarContratoEditar();

/* ============================================================
   GUARDAR CAMBIOS
============================================================ */
async function guardarCambios() {
    const id = new URLSearchParams(window.location.search).get("id");

    const data = {
        paquete_id: document.getElementById("paquete").value,
        fecha_evento: document.getElementById("fecha_evento").value,
        monto_total: document.getElementById("monto").value,
        estado: document.getElementById("estado").value
    };

    const res = await apiFetch(`${API}/contratos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) return alert("Error al actualizar");

    alert("Contrato actualizado");
    window.location.href = "lista_contratos.html";
}

/* ============================================================
   ELIMINAR CONTRATO
============================================================ */
async function eliminarContrato(id) {
    if (!confirm("¿Eliminar contrato?")) return;

    const res = await apiFetch(`${API}/contratos/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) return alert("Error al eliminar");

    alert("Contrato eliminado");
    cargarContratos();
}

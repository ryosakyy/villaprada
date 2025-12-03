/* ===========================
    CONFIG TOKEN + API
=========================== */
const API = "http://127.0.0.1:8000";
const token = localStorage.getItem("token");

// Helper para fetch con token
async function apiFetch(url, options = {}) {
    options.headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`
    };
    return await fetch(url, options);
}

/* ===========================
    LISTAR PAGOS
=========================== */
async function cargarPagos() {
    const tabla = document.getElementById("tabla-pagos");
    if (!tabla) return; // No estamos en lista_pagos.html

    const res = await apiFetch(`${API}/pagos`);
    if (!res.ok) {
        console.error("Error al cargar pagos");
        return;
    }
    const pagos = await res.json();

    tabla.innerHTML = "";

    pagos.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.contrato_id}</td>
            <td>${p.fecha_pago}</td>
            <td>S/ ${p.monto}</td>
            <td>${p.metodo}</td>
            <td>
                <a href="editar_pago.html?id=${p.id}" class="btn-sm btn-edit">Editar</a>
                <button class="btn-sm btn-delete" onclick="eliminarPago(${p.id})">Eliminar</button>
            </td>
        `;
        tabla.appendChild(tr);
    });
}

cargarPagos();

/* ===========================
    BUSCADOR
=========================== */
const inputBuscador = document.getElementById("buscador");

inputBuscador?.addEventListener("keyup", () => {
    const texto = inputBuscador.value.toLowerCase();

    document.querySelectorAll("#tabla-pagos tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(texto) ? "" : "none";
    });
});

/* ===========================
    REGISTRAR PAGO
=========================== */
async function registrarPago() {
    const data = {
        contrato_id: document.getElementById("contrato_id").value,
        fecha_pago: document.getElementById("fecha_pago").value,
        monto: document.getElementById("monto").value,
        metodo: document.getElementById("metodo").value,
        observacion: document.getElementById("observacion").value
    };

    const res = await apiFetch(`${API}/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        alert("Error al registrar pago");
        return;
    }

    alert("Pago registrado");
    window.location.href = "lista_pagos.html";
}

/* ===========================
    CARGAR PAGO PARA EDITAR
=========================== */
async function cargarPagoEditar() {
    if (!location.href.includes("editar_pago")) return;

    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
        alert("ID inválido");
        return;
    }

    const res = await apiFetch(`${API}/pagos/${id}`);
    if (!res.ok) {
        alert("No se pudo cargar el pago");
        return;
    }

    const pago = await res.json();

    document.getElementById("fecha_pago").value = pago.fecha_pago;
    document.getElementById("monto").value = pago.monto;
    document.getElementById("metodo").value = pago.metodo;
    document.getElementById("observacion").value = pago.observacion || "";
}

cargarPagoEditar();

/* ===========================
    GUARDAR PAGO (EDITAR)
=========================== */
async function guardarPago() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
        alert("ID inválido");
        return;
    }

    const data = {
        fecha_pago: document.getElementById("fecha_pago").value,
        monto: document.getElementById("monto").value,
        metodo: document.getElementById("metodo").value,
        observacion: document.getElementById("observacion").value
    };

    const res = await apiFetch(`${API}/pagos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        alert("Error al actualizar pago");
        return;
    }

    alert("Pago actualizado");
    window.location.href = "lista_pagos.html";
}

/* ===========================
    ELIMINAR PAGO
=========================== */
async function eliminarPago(id) {
    if (!confirm("¿Eliminar pago definitivamente?")) return;

    const res = await apiFetch(`${API}/pagos/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) {
        alert("No se pudo eliminar");
        return;
    }

    alert("Pago eliminado");
    cargarPagos();
}

/* ===========================
    AUTOLLENAR CONTRATO DESDE URL
    (cuando vengo desde ver_contrato)
=========================== */
if (location.href.includes("registrar_pago")) {
    const idContrato = new URLSearchParams(location.search).get("contrato_id");
    if (idContrato && document.getElementById("contrato_id")) {
        document.getElementById("contrato_id").value = idContrato;
    }
}

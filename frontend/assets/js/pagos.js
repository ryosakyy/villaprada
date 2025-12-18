/* ===========================
   CONFIG GLOBAL
=========================== */
const API = "http://127.0.0.1:8000";

/* ===========================
   FETCH CON TOKEN (NO CONGELADO)
=========================== */
async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token") || "";
    const headers = {...(options.headers || {}) };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    return fetch(url, {...options, headers });
}

/* ===========================
   LISTAR PAGOS
=========================== */
async function cargarPagos() {
    const tabla = document.getElementById("tabla-pagos");
    if (!tabla) return; // No estamos en lista_pagos.html

    try {
        const res = await apiFetch(`${API}/pagos/`);
        if (!res.ok) throw new Error(res.status);

        const pagos = await res.json();
        tabla.innerHTML = "";

        (pagos || []).forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${p.id || "-"}</td>
                <td>${p.contrato_id || "-"}</td>
                <td>${p.fecha_pago || "-"}</td>
                <td>S/ ${p.monto != null ? p.monto : "-"}</td>
                <td>${p.metodo || "-"}</td>
                <td>
                    <a href="editar_pago.html?id=${p.id}" class="btn-sm btn-edit">Editar</a>
                    <button class="btn-sm btn-delete" onclick="eliminarPago(${p.id})">Eliminar</button>
                </td>
            `;
            tabla.appendChild(tr);
        });
    } catch (e) {
        console.error("Error cargando pagos:", e);
        tabla.innerHTML = `<tr><td colspan="6">Error cargando pagos</td></tr>`;
    }
}

cargarPagos();

/* ===========================
   BUSCADOR
=========================== */
const inputBuscador = document.getElementById("buscador");
if (inputBuscador) {
    inputBuscador.addEventListener("keyup", () => {
        const texto = inputBuscador.value.toLowerCase();
        document.querySelectorAll("#tabla-pagos tr").forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(texto) ?
                "" :
                "none";
        });
    });
}

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

    const res = await apiFetch(`${API}/pagos/`, {
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
    if (!location.pathname.endsWith("editar_pago.html")) return;

    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return alert("ID inválido");

    const res = await apiFetch(`${API}/pagos/${id}`);
    if (!res.ok) return alert("No se pudo cargar el pago");

    const pago = await res.json();

    document.getElementById("fecha_pago").value = pago.fecha_pago || "";
    document.getElementById("monto").value = pago.monto != null ? pago.monto : "";
    document.getElementById("metodo").value = pago.metodo || "";
    document.getElementById("observacion").value = pago.observacion || "";
}

cargarPagoEditar();

/* ===========================
   GUARDAR CAMBIOS
=========================== */
async function guardarPago() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return alert("ID inválido");

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

    const res = await apiFetch(`${API}/pagos/${id}`, { method: "DELETE" });
    if (!res.ok) {
        alert("No se pudo eliminar");
        return;
    }

    alert("Pago eliminado");
    cargarPagos();
}

/* ===========================
   AUTOLLENAR CONTRATO DESDE URL
=========================== */
if (location.pathname.endsWith("registrar_pago.html")) {
    const idContrato = new URLSearchParams(location.search).get("contrato_id");
    if (idContrato && document.getElementById("contrato_id")) {
        document.getElementById("contrato_id").value = idContrato;
    }
}

/* ===========================
   EXPORT GLOBAL
=========================== */
window.registrarPago = registrarPago;
window.guardarPago = guardarPago;
window.eliminarPago = eliminarPago;
/* ============================================================
   CONFIG GLOBAL
============================================================ */
const API = "http://127.0.0.1:8000";

/* ============================================================
   TOKEN + FETCH SEGURO
============================================================ */
function getToken() {
    return localStorage.getItem("token") || "";
}

async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = {...(options.headers || {}) };

    if (token) headers["Authorization"] = "Bearer " + token;

    if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {...options, headers });

    if (res.status === 401) {
        alert("Sesión expirada");
        localStorage.clear();
        window.location.href = "/frontend/admin/login.html";
    }

    return res;
}

function $(id) {
    return document.getElementById(id);
}

/* ============================================================
   LISTA DE CONTRATOS
============================================================ */
let contratosCache = [];

async function cargarContratos() {
    const tabla = $("tabla-contratos");
    if (!tabla) return;

    try {
        const res = await apiFetch(`${API}/contratos/`);
        if (!res.ok) throw new Error(res.status);

        const contratos = await res.json();
        contratosCache = Array.isArray(contratos) ? contratos : [];
        pintarContratos(contratosCache);
    } catch (e) {
        console.error(e);
        tabla.innerHTML = `<tr><td colspan="7">Error cargando contratos</td></tr>`;
    }
}

function pintarContratos(lista) {
    const tabla = $("tabla-contratos");
    if (!tabla) return;

    if (!lista || !lista.length) {
        tabla.innerHTML = `<tr><td colspan="7">No hay contratos registrados</td></tr>`;
        return;
    }

    tabla.innerHTML = "";

    lista.forEach(c => {
        let clienteNombre = "-";
        if (c && c.cliente && c.cliente.nombres) {
            clienteNombre = (
                c.cliente.nombres + " " + (c.cliente.apellidos || "")
            ).trim();
        }

        let paqueteNombre = "-";
        if (c && c.paquete && c.paquete.nombre) {
            paqueteNombre = c.paquete.nombre;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${c.id}</td>
            <td>${clienteNombre}</td>
            <td>${paqueteNombre}</td>
            <td>${c.fecha_evento || "-"}</td>
            <td>S/ ${c.monto_total != null ? c.monto_total : "-"}</td>
            <td>${c.estado || "-"}</td>
            <td>
                <a href="ver_contrato.html?id=${c.id}" class="btn-sm btn-view">Ver</a>
                <a href="editar_contrato.html?id=${c.id}" class="btn-sm btn-edit">Editar</a>
                <button class="btn-sm btn-delete" onclick="eliminarContrato(${c.id})">
                    Eliminar
                </button>
            </td>
        `;
        tabla.appendChild(tr);
    });
}

/* ============================================================
   BUSCADOR
============================================================ */
function activarBuscadorContratos() {
    const buscador = $("buscador");
    if (!buscador) return;

    buscador.addEventListener("input", () => {
        const q = buscador.value.trim().toLowerCase();

        const filtrado = contratosCache.filter(c => {
            const cliente = (
                (c && c.cliente && c.cliente.nombres ? c.cliente.nombres : "") +
                " " +
                (c && c.cliente && c.cliente.apellidos ? c.cliente.apellidos : "")
            ).toLowerCase();

            const dni = String(
                c && c.cliente && c.cliente.dni ? c.cliente.dni : ""
            ).toLowerCase();

            const paquete = String(
                c && c.paquete && c.paquete.nombre ? c.paquete.nombre : ""
            ).toLowerCase();

            const estado = String(c && c.estado ? c.estado : "").toLowerCase();

            return (
                cliente.includes(q) ||
                dni.includes(q) ||
                paquete.includes(q) ||
                estado.includes(q)
            );
        });

        pintarContratos(filtrado);
    });
}

/* ============================================================
   PAQUETES
============================================================ */
async function cargarPaquetes() {
    const sel = $("paquete");
    if (!sel) return;

    try {
        const res = await apiFetch(`${API}/paquetes/`);
        if (!res.ok) throw new Error(res.status);

        const paquetes = await res.json();
        sel.innerHTML = "";

        paquetes.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.nombre;
            opt.dataset.precio = p.precio || 0;
            sel.appendChild(opt);
        });

        actualizarMontoDesdePaquete();
        sel.addEventListener("change", actualizarMontoDesdePaquete);
    } catch (e) {
        console.error(e);
    }
}

function actualizarMontoDesdePaquete() {
    const sel = $("paquete");
    const monto = $("monto");
    if (!sel || !monto) return;

    const opt = sel.options[sel.selectedIndex];
    monto.value = opt ? Number(opt.dataset.precio || 0) : 0;
}

/* ============================================================
   AUTOCOMPLETE CLIENTES
============================================================ */
let clienteSeleccionado = null;

async function activarAutocompleteClientes() {
    const input = $("buscarCliente");
    const box = $("listaClientes");
    if (!input || !box) return;

    input.addEventListener("input", async() => {
        const q = input.value.trim();
        clienteSeleccionado = null;

        if (q.length < 2) {
            box.style.display = "none";
            box.innerHTML = "";
            return;
        }

        try {
            const res = await apiFetch(`${API}/clientes/?search=${encodeURIComponent(q)}`);
            if (!res.ok) throw new Error(res.status);

            const clientes = await res.json();
            box.innerHTML = "";

            (clientes || []).slice(0, 8).forEach(c => {
                const div = document.createElement("div");
                div.textContent = `${c.nombres} ${c.apellidos || ""} - DNI: ${c.dni || ""}`.trim();

                div.onclick = () => {
                    clienteSeleccionado = c.id;
                    input.value = `${c.nombres} ${c.apellidos || ""}`.trim();
                    box.style.display = "none";
                    box.innerHTML = "";
                };

                box.appendChild(div);
            });

            box.style.display = clientes.length ? "block" : "none";
        } catch (e) {
            console.error(e);
            box.style.display = "none";
        }
    });
}

/* ============================================================
   REGISTRAR / ELIMINAR
============================================================ */
async function registrarContrato() {
    if (!clienteSeleccionado) {
        alert("Seleccione un cliente");
        return;
    }

    const data = {
        cliente_id: clienteSeleccionado,
        paquete_id: $("paquete").value,
        fecha_evento: $("fecha_evento").value,
        monto_total: $("monto").value,
        estado: $("estado").value
    };

    const res = await apiFetch(`${API}/contratos/`, {
        method: "POST",
        body: JSON.stringify(data)
    });

    if (res.ok) {
        window.location.href = "lista_contratos.html";
    } else {
        alert("Error registrando contrato");
    }
}

async function eliminarContrato(id) {
    if (!confirm("¿Eliminar contrato?")) return;

    const res = await apiFetch(`${API}/contratos/${id}`, { method: "DELETE" });
    if (res.ok) cargarContratos();
    else alert("Error eliminando contrato");
}

/* ============================================================
   INIT
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    if ($("tabla-contratos")) {
        cargarContratos();
        activarBuscadorContratos();
    }

    if ($("buscarCliente")) {
        cargarPaquetes();
        activarAutocompleteClientes();
    }
});

window.registrarContrato = registrarContrato;
window.eliminarContrato = eliminarContrato;
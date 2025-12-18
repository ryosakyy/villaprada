const API_BASE = "http://127.0.0.1:8000";
const API_URL = API_BASE + "/clientes/";

/* Helpers */
function $(id) { return document.getElementById(id); }

function getToken() {
    return localStorage.getItem("token") || "";
}

async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = {...(options.headers || {}) };

    if (token) headers["Authorization"] = "Bearer " + token;

    // Si NO es FormData y hay body, asume JSON
    if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    return fetch(url, {...options, headers });
}

function getQueryParam(name) {
    try {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    } catch (e) {
        return null;
    }
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function(m) {
        return ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[m];
    });
}

function onReady(fn) {
    document.addEventListener("DOMContentLoaded", fn);
}

/* Detect pages */
function isListaPage() { return !!$("tabla-clientes"); }

function isEditarPage() { return window.location.pathname.endsWith("editar_cliente.html"); }

function isRegistrarSimplePage() { return window.location.pathname.endsWith("registrar_cliente.html"); }

/* =========================
   LISTA CLIENTES
========================= */
var clientesCache = [];

async function cargarClientes() {
    try {
        const res = await apiFetch(API_URL);
        if (!res.ok) throw new Error("GET /clientes -> " + res.status);

        const data = await res.json();
        clientesCache = Array.isArray(data) ? data : [];
        pintarTabla(clientesCache);
    } catch (e) {
        console.error("Error cargando clientes:", e);
        const tbody = $("tabla-clientes");
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="empty">Error cargando clientes</td></tr>';
    }
}

function pintarTabla(clientes) {
    const tbody = $("tabla-clientes");
    if (!tbody) return;

    if (!clientes || !clientes.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">No hay clientes registrados</td></tr>';
        return;
    }

    tbody.innerHTML = clientes.map(function(c) {
        var dni = (c && c.dni) ? c.dni : "—";
        var nombres = (c && c.nombres) ? c.nombres : "";
        var apellidos = (c && c.apellidos) ? c.apellidos : "";
        var nombreCompleto = (nombres + " " + apellidos).trim() || "(Sin nombre)";
        var telefono = (c && c.telefono) ? c.telefono : "—";
        var email = (c && c.email) ? c.email : "—";
        var estado = (c && (c.estado_reniec || c.estadoReniec)) ? (c.estado_reniec || c.estadoReniec) : "—";
        var id = (c && c.id != null) ? c.id : "";

        return (
            "<tr>" +
            "<td>" + escapeHtml(dni) + "</td>" +
            "<td>" + escapeHtml(nombreCompleto) + "</td>" +
            "<td>" + escapeHtml(telefono) + "</td>" +
            "<td>" + escapeHtml(email) + "</td>" +
            "<td>" + escapeHtml(estado) + "</td>" +
            '<td class="acciones"><a href="editar_cliente.html?id=' + encodeURIComponent(id) + '">✏️</a></td>' +
            "</tr>"
        );
    }).join("");
}

function filtrarTabla(q) {
    var query = (q || "").toLowerCase();
    var filtrado = clientesCache.filter(function(c) {
        var dni = String((c && c.dni) ? c.dni : "").toLowerCase();
        var full = ((c && c.nombres) ? c.nombres : "") + " " + ((c && c.apellidos) ? c.apellidos : "");
        full = full.toLowerCase();
        return dni.indexOf(query) !== -1 || full.indexOf(query) !== -1;
    });

    pintarTabla(filtrado);
}

/* =========================
   REGISTRAR (registrar_cliente.html)
========================= */
async function registrarCliente() {
    var payload = {
        dni: ($("dni") ? $("dni").value : "").trim(),
        nombres: ($("nombres") ? $("nombres").value : "").trim(),
        telefono: ($("telefono") ? $("telefono").value : "").trim(),
        email: ($("email") ? $("email").value : "").trim()
    };

    if (!payload.dni || !payload.nombres || !payload.telefono) {
        alert("Complete DNI, Nombres y Teléfono.");
        return;
    }

    try {
        var res = await apiFetch(API_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("POST /clientes -> " + res.status);

        window.location.href = "lista_clientes.html";
    } catch (e) {
        console.error(e);
        alert("Error registrando cliente.");
    }
}

/* =========================
   EDITAR
========================= */
async function cargarClienteEditar() {
    var id = getQueryParam("id");
    if (!id) return;

    try {
        var res = await apiFetch(API_URL + encodeURIComponent(id));
        if (!res.ok) throw new Error("GET /clientes/{id} -> " + res.status);

        var c = await res.json();
        if ($("dni")) $("dni").value = c && c.dni ? c.dni : "";
        if ($("nombres")) $("nombres").value = c && c.nombres ? c.nombres : "";
        if ($("telefono")) $("telefono").value = c && c.telefono ? c.telefono : "";
        if ($("email")) $("email").value = c && c.email ? c.email : "";
    } catch (e) {
        console.error(e);
        alert("No se pudo cargar el cliente.");
    }
}

async function guardarCliente() {
    var id = getQueryParam("id");
    if (!id) {
        alert("Falta el id del cliente.");
        return;
    }

    var payload = {
        dni: ($("dni") ? $("dni").value : "").trim(),
        nombres: ($("nombres") ? $("nombres").value : "").trim(),
        telefono: ($("telefono") ? $("telefono").value : "").trim(),
        email: ($("email") ? $("email").value : "").trim()
    };

    try {
        var res = await apiFetch(API_URL + encodeURIComponent(id), {
            method: "PUT",
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("PUT /clientes/{id} -> " + res.status);

        window.location.href = "lista_clientes.html";
    } catch (e) {
        console.error(e);
        alert("Error guardando cambios.");
    }
}

/* =========================
   INIT
========================= */
onReady(function() {
    // Lista
    if (isListaPage()) {
        cargarClientes();

        var buscador = $("buscador");
        if (buscador) {
            buscador.addEventListener("input", function() {
                filtrarTabla(buscador.value);
            });
        }
    }

    // Editar
    if (isEditarPage()) {
        cargarClienteEditar();
    }

    // Registrar simple
    if (isRegistrarSimplePage()) {
        // nada extra
    }
});

// Export global functions for onclick
window.registrarCliente = registrarCliente;
window.guardarCliente = guardarCliente;
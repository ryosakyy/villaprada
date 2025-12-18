/* ===========================
   CONFIG GLOBAL
=========================== */
const API = "http://127.0.0.1:8000";

/* ===========================
   FETCH CON TOKEN (NO CONGELADO)
=========================== */
function getToken() {
    return localStorage.getItem("token") || "";
}

async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = {...(options.headers || {}) };

    if (token) headers["Authorization"] = "Bearer " + token;
    if (options.body) headers["Content-Type"] = "application/json";

    return fetch(url, {...options, headers });
}

/* ===========================
   LISTAR EGRESOS
=========================== */
let egresosCache = [];

async function cargarEgresosLista() {
    const tbody = document.getElementById("tabla-egresos");
    if (!tbody) return;

    try {
        const res = await apiFetch(`${API}/egresos/`);
        if (!res.ok) throw new Error(res.status);

        const egresos = await res.json();
        egresosCache = Array.isArray(egresos) ? egresos : [];

        pintarTablaEgresos(egresosCache);
    } catch (err) {
        console.error("Error cargando egresos:", err);
        tbody.innerHTML = `<tr><td colspan="5">Error al cargar egresos</td></tr>`;
    }
}

function pintarTablaEgresos(lista) {
    const tbody = document.getElementById("tabla-egresos");
    const totalReg = document.getElementById("total-registros");
    const totalMonto = document.getElementById("total-monto");

    tbody.innerHTML = "";
    let suma = 0;

    if (!lista || !lista.length) {
        tbody.innerHTML = `<tr><td colspan="5">No hay egresos registrados</td></tr>`;
        if (totalReg) totalReg.textContent = "0";
        if (totalMonto) totalMonto.textContent = "S/ 0.00";
        return;
    }

    lista.forEach(e => {
        const fecha = (e.fecha || e.fecha_egreso || "").slice(0, 10);
        const concepto = e.concepto || e.descripcion || "Sin concepto";
        const categoria = e.categoria || e.tipo || "otro";
        const monto = Number(e.monto || e.cantidad || 0);
        const obs = e.observacion || e.nota || "";

        suma += monto;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${fecha}</td>
            <td title="${obs}">${concepto}</td>
            <td><span class="badge-cat">${categoria}</span></td>
            <td class="monto-negativo">- S/ ${monto.toFixed(2)}</td>
            <td>
                <a href="editar_egreso.html?id=${e.id}" class="btn-sm btn-edit">Editar</a>
                <button class="btn-sm btn-delete" onclick="eliminarEgreso(${e.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (totalReg) totalReg.textContent = lista.length;
    if (totalMonto) totalMonto.textContent = `S/ ${suma.toFixed(2)}`;
}

cargarEgresosLista();

/* ===========================
   FILTROS Y BUSCADOR
=========================== */
function aplicarFiltros() {
    if (!egresosCache.length) return;

    const buscador = document.getElementById("buscador");
    const filtroDesde = document.getElementById("filtro-desde");
    const filtroHasta = document.getElementById("filtro-hasta");
    const filtroCategoria = document.getElementById("filtro-categoria");

    const texto = buscador ? buscador.value.toLowerCase() : "";
    const desde = filtroDesde ? filtroDesde.value : "";
    const hasta = filtroHasta ? filtroHasta.value : "";
    const cat = filtroCategoria ? filtroCategoria.value.toLowerCase() : "";

    const filtrados = egresosCache.filter(e => {
        const fecha = (e.fecha || e.fecha_egreso || "").slice(0, 10);
        const concepto = (e.concepto || e.descripcion || "").toLowerCase();
        const categoria = (e.categoria || e.tipo || "").toLowerCase();

        if (texto && !concepto.includes(texto)) return false;
        if (desde && fecha < desde) return false;
        if (hasta && fecha > hasta) return false;
        if (cat && categoria !== cat) return false;

        return true;
    });

    pintarTablaEgresos(filtrados);
}

const buscador = document.getElementById("buscador");
if (buscador) buscador.addEventListener("keyup", aplicarFiltros);

const filtroDesde = document.getElementById("filtro-desde");
if (filtroDesde) filtroDesde.addEventListener("change", aplicarFiltros);

const filtroHasta = document.getElementById("filtro-hasta");
if (filtroHasta) filtroHasta.addEventListener("change", aplicarFiltros);

const filtroCategoria = document.getElementById("filtro-categoria");
if (filtroCategoria) filtroCategoria.addEventListener("change", aplicarFiltros);

/* ===========================
   REGISTRAR EGRESO
=========================== */
async function registrarEgreso() {
    const data = {
        fecha: document.getElementById("fecha").value,
        concepto: document.getElementById("concepto").value.trim(),
        categoria: document.getElementById("categoria").value,
        monto: Number(document.getElementById("monto").value),
        observacion: document.getElementById("observacion").value.trim()
    };

    const res = await apiFetch(`${API}/egresos/`, {
        method: "POST",
        body: JSON.stringify(data)
    });

    if (!res.ok) return alert("Error al registrar egreso");

    alert("Egreso registrado correctamente");
    window.location.href = "lista_egresos.html";
}

/* ===========================
   CARGAR EGRESO PARA EDITAR
=========================== */
async function cargarEgresoEditar() {
    if (!location.pathname.endsWith("editar_egreso.html")) return;

    const id = new URLSearchParams(location.search).get("id");
    if (!id) return;

    const res = await apiFetch(`${API}/egresos/${id}`);
    if (!res.ok) return alert("Error al cargar egreso");

    const e = await res.json();

    document.getElementById("fecha").value = (e.fecha || e.fecha_egreso || "").slice(0, 10);
    document.getElementById("concepto").value = e.concepto || e.descripcion || "";
    document.getElementById("categoria").value = e.categoria || e.tipo || "";
    document.getElementById("monto").value = e.monto || e.cantidad || 0;
    document.getElementById("observacion").value = e.observacion || e.nota || "";
}

cargarEgresoEditar();

/* ===========================
   GUARDAR CAMBIOS
=========================== */
async function guardarEgreso() {
    const id = new URLSearchParams(location.search).get("id");
    if (!id) return;

    const data = {
        fecha: document.getElementById("fecha").value,
        concepto: document.getElementById("concepto").value.trim(),
        categoria: document.getElementById("categoria").value,
        monto: Number(document.getElementById("monto").value),
        observacion: document.getElementById("observacion").value.trim()
    };

    const res = await apiFetch(`${API}/egresos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });

    if (!res.ok) return alert("Error al actualizar egreso");

    alert("Egreso actualizado correctamente");
    window.location.href = "lista_egresos.html";
}

/* ===========================
   ELIMINAR EGRESO
=========================== */
async function eliminarEgreso(id) {
    if (!confirm("¿Seguro de eliminar este egreso?")) return;

    const res = await apiFetch(`${API}/egresos/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Error al eliminar egreso");

    alert("Egreso eliminado correctamente");
    cargarEgresosLista();
}

/* ===========================
   EXPORT GLOBAL
=========================== */
window.registrarEgreso = registrarEgreso;
window.guardarEgreso = guardarEgreso;
window.eliminarEgreso = eliminarEgreso;
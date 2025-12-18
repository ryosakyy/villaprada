/* ============================================================
   CONFIG / TOKEN
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

    return fetch(url, {...options, headers });
}

// Para descargas con window.open (NO permite headers)
function openWithToken(url) {
    const token = getToken();
    if (!token) {
        alert("No hay token. Inicia sesión.");
        window.location.href = "/admin/login.html";
        return;
    }

    const sep = url.includes("?") ? "&" : "?";
    window.open(url + sep + "token=" + encodeURIComponent(token));
}

/* ============================================================
   CARGAR REPORTE (solo muestra aviso)
============================================================ */
async function cargarReporte() {
    if (!location.href.includes("reportes")) return;

    const inicio = document.getElementById("fecha_inicio") ? .value;
    const fin = document.getElementById("fecha_fin") ? .value;

    if (!inicio || !fin) {
        alert("Seleccione un rango de fechas.");
        return;
    }

    const res = await apiFetch(
        `${API}/reportes/flujo-caja/pdf?fecha_inicio=${encodeURIComponent(inicio)}&fecha_fin=${encodeURIComponent(fin)}`
    );

    if (!res.ok) {
        alert("No hay datos para mostrar o no autorizado.");
        return;
    }

    document.getElementById("tabla-reportes").innerHTML = `
        <tr>
            <td colspan="4" style="text-align:center; padding:20px;">
                Solo exportación disponible (PDF/Excel).
            </td>
        </tr>
    `;
}

document.getElementById("btn-filtrar") ? .addEventListener("click", cargarReporte);

/* ============================================================
   EXPORTAR EXCEL – INGRESOS
============================================================ */
document.getElementById("btn-excel-ingresos") ? .addEventListener("click", () => {
    const i = document.getElementById("fecha_inicio") ? .value;
    const f = document.getElementById("fecha_fin") ? .value;

    if (!i || !f) return alert("Seleccione fecha inicio y fin.");

    openWithToken(`${API}/reportes/ingresos/excel?fecha_inicio=${encodeURIComponent(i)}&fecha_fin=${encodeURIComponent(f)}`);
});

/* ============================================================
   EXPORTAR EXCEL – EGRESOS
============================================================ */
document.getElementById("btn-excel-egresos") ? .addEventListener("click", () => {
    const i = document.getElementById("fecha_inicio") ? .value;
    const f = document.getElementById("fecha_fin") ? .value;

    if (!i || !f) return alert("Seleccione fecha inicio y fin.");

    openWithToken(`${API}/reportes/egresos/excel?fecha_inicio=${encodeURIComponent(i)}&fecha_fin=${encodeURIComponent(f)}`);
});

/* ============================================================
   EXPORTAR PDF – FLUJO DE CAJA
============================================================ */
document.getElementById("btn-pdf-flujo") ? .addEventListener("click", () => {
    const i = document.getElementById("fecha_inicio") ? .value;
    const f = document.getElementById("fecha_fin") ? .value;

    if (!i || !f) return alert("Seleccione fecha inicio y fin.");

    openWithToken(`${API}/reportes/flujo-caja/pdf?fecha_inicio=${encodeURIComponent(i)}&fecha_fin=${encodeURIComponent(f)}`);
});
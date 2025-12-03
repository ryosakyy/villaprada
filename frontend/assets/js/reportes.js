/* ============================================================
   CONFIG / TOKEN
============================================================ */
const API = "http://127.0.0.1:8000";

function getToken() {
    return localStorage.getItem("token");
}

async function apiFetch(url, options = {}) {
    options.headers = {
        ...(options.headers || {}),
        "Authorization": "Bearer " + getToken()
    };
    return await fetch(url, options);
}

/* ============================================================
   CARGAR FINANZAS (INGRESOS - EGRESOS - SALDO)
============================================================ */
async function cargarReporte() {
    if (!location.href.includes("reportes")) return;

    const inicio = document.getElementById("fecha_inicio").value;
    const fin = document.getElementById("fecha_fin").value;

    if (!inicio || !fin) {
        alert("Seleccione un rango de fechas.");
        return;
    }

    const res = await apiFetch(`${API}/reportes/flujo-caja/pdf?fecha_inicio=${inicio}&fecha_fin=${fin}`);

    if (!res.ok) {
        alert("No hay datos para mostrar.");
        return;
    }

    // No tenemos endpoint que entregue datos,
    // así que se queda la tabla en blanco (solo PDF / Excel generan archivo).
    document.getElementById("tabla-reportes").innerHTML = `
        <tr>
            <td colspan="4" style="text-align:center; padding:20px;">
                Solo exportación disponible (PDF/Excel).
            </td>
        </tr>
    `;
}

document.getElementById("btn-filtrar")?.addEventListener("click", cargarReporte);

/* ============================================================
   EXPORTAR EXCEL – INGRESOS
============================================================ */
document.getElementById("btn-excel-ingresos")?.addEventListener("click", () => {
    const i = document.getElementById("fecha_inicio").value;
    const f = document.getElementById("fecha_fin").value;

    if (!i || !f) return alert("Seleccione fecha inicio y fin.");

    window.open(`${API}/reportes/ingresos/excel?fecha_inicio=${i}&fecha_fin=${f}`);
});

/* ============================================================
   EXPORTAR EXCEL – EGRESOS
============================================================ */
document.getElementById("btn-excel-egresos")?.addEventListener("click", () => {
    const i = document.getElementById("fecha_inicio").value;
    const f = document.getElementById("fecha_fin").value;

    if (!i || !f) return alert("Seleccione fecha inicio y fin.");

    window.open(`${API}/reportes/egresos/excel?fecha_inicio=${i}&fecha_fin=${f}`);
});

/* ============================================================
   EXPORTAR PDF – FLUJO DE CAJA
============================================================ */
document.getElementById("btn-pdf-flujo")?.addEventListener("click", () => {
    const i = document.getElementById("fecha_inicio").value;
    const f = document.getElementById("fecha_fin").value;

    if (!i || !f) return alert("Seleccione fecha inicio y fin.");

    window.open(`${API}/reportes/flujo-caja/pdf?fecha_inicio=${i}&fecha_fin=${f}`);
});

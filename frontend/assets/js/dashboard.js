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
   CARGAR RESUMEN GENERAL
============================================================ */
async function cargarDashboard() {
    if (!location.href.includes("dashboard")) return;

    // 1. RESUMEN GENERAL
    const resResumen = await apiFetch(`${API}/dashboard/resumen`);
    const resumen = await resResumen.json();

    document.getElementById("card-clientes").textContent = resumen.total_clientes;
    document.getElementById("card-contratos").textContent = resumen.total_contratos;
    document.getElementById("card-ingresos").textContent = `S/ ${resumen.ingresos_totales}`;
    document.getElementById("card-egresos").textContent = `S/ ${resumen.egresos_totales}`;

    // 2. GRÁFICA OCUPACIÓN DEL MES ACTUAL
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = hoy.getMonth() + 1;

    const resOcup = await apiFetch(`${API}/dashboard/ocupacion-mensual?anio=${anio}&mes=${mes}`);
    const ocup = await resOcup.json();

    chartReservas(ocup.ocupacion);

    // 3. INGRESOS VS EGRESOS DEL MES
    const resEst = await apiFetch(`${API}/dashboard/estadisticas-mes?anio=${anio}&mes=${mes}`);
    const est = await resEst.json();

    let totalIngresos = 0;
    let totalEgresos = 0;

    est.detalle.forEach(d => {
        totalIngresos += d.ingresos;
        totalEgresos += d.egresos;
    });

    chartFinanzas({
        ingresos: totalIngresos,
        egresos: totalEgresos
    });
}

cargarDashboard();

/* ============================================================
   GRÁFICA 1: RESERVAS POR DÍA
============================================================ */
function chartReservas(datos) {
    new Chart(document.getElementById("chartReservas"), {
        type: "line",
        data: {
            labels: datos.map(d => d.dia),
            datasets: [
                {
                    label: "Eventos",
                    data: datos.map(d => d.eventos),
                    borderWidth: 3,
                    borderColor: "#305077",
                    backgroundColor: "rgba(48, 80, 119, 0.25)",
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true
        }
    });
}

/* ============================================================
   GRÁFICA 2: INGRESOS VS EGRESOS
============================================================ */
function chartFinanzas(data) {
    new Chart(document.getElementById("chartFinanzas"), {
        type: "bar",
        data: {
            labels: ["Ingresos", "Egresos"],
            datasets: [
                {
                    data: [data.ingresos, data.egresos],
                    backgroundColor: ["#22C55E", "#EF4444"],
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true
        }
    });
}

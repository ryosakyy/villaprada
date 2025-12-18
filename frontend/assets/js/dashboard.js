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

    if (token) headers["Authorization"] = "Bearer " + token;

    // si mandas body y NO es FormData, asume JSON
    if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {...options, headers });

    if (res.status === 401) {
        alert("Sesión expirada");
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "/frontend/admin/login.html";
    }

    return res;
}

/* ============================================================
   CARGAR DASHBOARD
============================================================ */
async function cargarDashboard() {
    // solo corre en dashboard.html
    if (!location.pathname.endsWith("dashboard.html")) return;

    try {
        // 1) RESUMEN
        const resResumen = await apiFetch(`${API}/dashboard/resumen/`);
        if (!resResumen.ok) throw new Error("Error resumen " + resResumen.status);
        const resumen = await resResumen.json();

        const elClientes = document.getElementById("card-clientes");
        const elContratos = document.getElementById("card-contratos");
        const elIngresos = document.getElementById("card-ingresos");
        const elEgresos = document.getElementById("card-egresos");

        if (elClientes) elClientes.textContent = resumen.total_clientes ? ? 0;
        if (elContratos) elContratos.textContent = resumen.total_contratos ? ? 0;
        if (elIngresos) elIngresos.textContent = `S/ ${resumen.ingresos_totales ?? 0}`;
        if (elEgresos) elEgresos.textContent = `S/ ${resumen.egresos_totales ?? 0}`;

        // 2) Ocupación mes actual
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = hoy.getMonth() + 1;

        const resOcup = await apiFetch(
            `${API}/dashboard/ocupacion-mensual/?anio=${encodeURIComponent(anio)}&mes=${encodeURIComponent(mes)}`
        );
        if (!resOcup.ok) throw new Error("Error ocupación " + resOcup.status);
        const ocup = await resOcup.json();

        chartReservas((ocup && ocup.ocupacion) ? ocup.ocupacion : []);

        // 3) Ingresos vs Egresos del mes
        const resEst = await apiFetch(
            `${API}/dashboard/estadisticas-mes/?anio=${encodeURIComponent(anio)}&mes=${encodeURIComponent(mes)}`
        );
        if (!resEst.ok) throw new Error("Error estadísticas " + resEst.status);
        const est = await resEst.json();

        let totalIngresos = 0;
        let totalEgresos = 0;

        const detalle = (est && Array.isArray(est.detalle)) ? est.detalle : [];
        detalle.forEach(d => {
            totalIngresos += Number(d.ingresos || 0);
            totalEgresos += Number(d.egresos || 0);
        });

        chartFinanzas({ ingresos: totalIngresos, egresos: totalEgresos });
    } catch (e) {
        console.error("Dashboard error:", e);
    }
}

cargarDashboard();

/* ============================================================
   GRÁFICA 1: RESERVAS POR DÍA
============================================================ */
function chartReservas(datos) {
    const canvas = document.getElementById("chartReservas");
    if (!canvas) return;

    const labels = (datos || []).map(d => d.dia);
    const values = (datos || []).map(d => d.eventos);

    new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Eventos",
                data: values,
                borderWidth: 3,
                borderColor: "#305077",
                backgroundColor: "rgba(48, 80, 119, 0.25)",
                tension: 0.3
            }]
        },
        options: { responsive: true }
    });
}

/* ============================================================
   GRÁFICA 2: INGRESOS VS EGRESOS
============================================================ */
function chartFinanzas(data) {
    const canvas = document.getElementById("chartFinanzas");
    if (!canvas) return;

    new Chart(canvas, {
        type: "bar",
        data: {
            labels: ["Ingresos", "Egresos"],
            datasets: [{
                data: [Number(data.ingresos || 0), Number(data.egresos || 0)],
                backgroundColor: ["#22C55E", "#EF4444"],
                borderRadius: 6
            }]
        },
        options: { responsive: true }
    });
}
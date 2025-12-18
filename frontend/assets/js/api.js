/* ============================================================
   CONFIG GLOBAL
============================================================ */
const API = "http://127.0.0.1:8000";

/* ============================================================
   FETCH CON TOKEN (NO CONGELADO)
============================================================ */
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token") || "";
    const headers = {...(options.headers || {}) };

    if (token) headers["Authorization"] = "Bearer " + token;

    if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const url = endpoint.startsWith("http") ?
        endpoint :
        `${API}${endpoint}`;

    const res = await fetch(url, {...options, headers });

    if (res.status === 401) {
        localStorage.clear();
        if (!location.pathname.includes("login.html")) {
            window.location.href = "/frontend/admin/login.html";
        }
    }

    return res;
}

window.apiFetch = apiFetch;
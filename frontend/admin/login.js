/* ============================================================
   CONFIG GLOBAL
============================================================ */
const API = "http://127.0.0.1:8000";

/* ============================================================
   LOGIN
============================================================ */
async function login(e) {
    e.preventDefault(); // ⛔ evita recarga del form

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorBox = document.getElementById("error");

    errorBox.classList.add("d-none");

    if (!emailInput || !passwordInput) {
        errorBox.textContent = "Formulario inválido";
        errorBox.classList.remove("d-none");
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        errorBox.textContent = "Ingrese correo y contraseña";
        errorBox.classList.remove("d-none");
        return;
    }

    try {
        const res = await fetch(
            `${API}/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, { method: "POST" }
        );

        const data = await res.json();

        if (!res.ok) {
            errorBox.textContent = data.detail || "Credenciales incorrectas";
            errorBox.classList.remove("d-none");
            return;
        }

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        // 🔥 RUTA CORRECTA SEGÚN TU ESTRUCTURA
        window.location.href = "/frontend/admin/reportes/dashboard.html";

    } catch (err) {
        console.error(err);
        errorBox.textContent = "Error de conexión con el servidor";
        errorBox.classList.remove("d-none");
    }
}

/* ============================================================
   VERIFICAR SESIÓN
============================================================ */
function verificarSesion() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/frontend/admin/login.html";
    }
}

/* ============================================================
   LOGOUT
============================================================ */
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("theme");
    window.location.href = "/frontend/admin/login.html";
}

/* ============================================================
   INIT
============================================================ */
document.getElementById("loginForm") ? .addEventListener("submit", login);

window.login = login;
window.logout = logout;
window.verificarSesion = verificarSesion;
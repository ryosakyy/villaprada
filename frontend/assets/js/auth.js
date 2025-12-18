/* ============================================================
   CONFIG GLOBAL
============================================================ */
const API = "http://127.0.0.1:8000";

/* ============================================================
   LOGIN
============================================================ */
async function login() {
    const emailInput = document.getElementById("correo");
    const passwordInput = document.getElementById("password");

    if (!emailInput || !passwordInput) {
        alert("Formulario inválido");
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Ingrese correo y contraseña");
        return;
    }

    try {
        const res = await fetch(
            `${API}/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, { method: "POST" }
        );

        if (!res.ok) {
            alert("Credenciales incorrectas");
            return;
        }

        const data = await res.json();

        if (!data || !data.access_token) {
            alert("Respuesta inválida del servidor");
            return;
        }

        // Guardar sesión
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        // 👉 Ruta correcta según tu estructura
        window.location.href = "/frontend/admin/reportes/dashboard.html";

    } catch (error) {
        console.error("Error login:", error);
        alert("Error de conexión con el servidor");
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
    localStorage.removeItem("theme"); // dark mode si existe

    window.location.href = "/frontend/admin/login.html";
}

/* ============================================================
   EXPORT GLOBAL
============================================================ */
window.login = login;
window.logout = logout;
window.verificarSesion = verificarSesion;
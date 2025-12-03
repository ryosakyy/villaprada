const API = "http://127.0.0.1:8000";

async function login() {
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API}/auth/login?correo=${correo}&password=${password}`, {
        method: "POST"
    });

    if (!res.ok) {
        return alert("Credenciales incorrectas");
    }

    const data = await res.json();

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    window.location.href = "../admin/dashboard.html";
}

function verificarSesion() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login.html";
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "../login.html";
}

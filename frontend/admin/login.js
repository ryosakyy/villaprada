const API_URL = "http://127.0.0.1:8000";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const errorBox = document.getElementById("error");
    errorBox.classList.add("d-none");

    try {
        const response = await fetch(`${API_URL}/auth/login?email=${email}&password=${password}`, {
            method: "POST"
        });

        const data = await response.json();

        if (!response.ok) {
            errorBox.textContent = data.detail || "Credenciales incorrectas";
            errorBox.classList.remove("d-none");
            return;
        }

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        // 🔥 REDIRECCIÓN CORRECTA
        window.location.href = "/admin/reportes/dashboard.html";

    } catch (error) {
        errorBox.textContent = "Error de conexión con el servidor";
        errorBox.classList.remove("d-none");
    }
});

// assets/js/navbar.js
// Carga dinámica del navbar (ruta ABSOLUTA)

fetch("/assets/components/navbar_admin.html")
    .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar navbar");
        return res.text();
    })
    .then(html => {
        document.getElementById("navbar-container").innerHTML = html;

        // BOTÓN CERRAR SESIÓN
        const btnLogout = document.getElementById("btn-logout");
        if (btnLogout) {
            btnLogout.addEventListener("click", () => {
                localStorage.removeItem("token");
                window.location.href = "/login.html";
            });
        }
    })
    .catch(err => console.error(err));
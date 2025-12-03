// Insertar el sidebar dinámicamente
fetch("../assets/components/sidebar_admin.html")
    .then(res => res.text())
    .then(html => {
        document.getElementById("sidebar-container").innerHTML = html;

        // Después de insertarlo, activar botones
        setTimeout(() => {
            const btn = document.getElementById("btnSidebar");
            const sidebar = document.getElementById("sidebar");

            btn?.addEventListener("click", () => {
                sidebar.classList.toggle("open");
            });
        }, 50);
    });

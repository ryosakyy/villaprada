async function loadHTML(id, path) {
    const el = document.getElementById(id);
    if (!el) return;

    const res = await fetch(path);

    // Si el archivo no existe, no metas el HTML del 404 al layout
    if (!res.ok) {
        console.error(`No se pudo cargar ${path} -> ${res.status}`);
        return;
    }

    el.innerHTML = await res.text();
}

(function() {
    const layout = document.body.dataset.layout; // "public" o "admin"
    const isAdminByPath = location.pathname.includes("/admin/");
    const isAdmin = layout ? layout === "admin" : isAdminByPath;

    if (isAdmin) {
        loadHTML("navbar-container", `/components/navbar_admin.html`);
        loadHTML("footer-container", `/components/footer_admin.html`);

        if (document.getElementById("sidebar-container")) {
            loadHTML("sidebar-container", `/components/sidebar_admin.html`);
        }
    } else {
        loadHTML("navbar-container", `/components/navbar_public.html`);
        loadHTML("footer-container", `/components/footer_public.html`);
    }
})();
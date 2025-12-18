// frontend/assets/js/sidebar.js
// UI: colapsar/expandir sidebar + mover el layout (SOLUCIÓN DEFINITIVA)

document.addEventListener("click", (e) => {
    const btn = e.target.closest("#toggle-sidebar");
    if (!btn) return;

    // 1) Colapsar visualmente el sidebar (oculta textos)
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("collapsed");

    // 2) Colapsar el layout completo (mueve main-content y navbar)
    document.body.classList.toggle("sidebar-collapsed");
});
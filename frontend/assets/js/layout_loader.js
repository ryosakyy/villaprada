// frontend/assets/js/layout_loader.js

/**
 * RUTAS CORRECTAS: los componentes están en /components
 * directamente bajo la raíz del servidor estático.
 */
const SIDEBAR_PATH = "/components/sidebar_admin.html";
const NAVBAR_PATH  = "/components/navbar_admin.html";

/**
 * Inserta el HTML dentro del contenedor indicado.
 */
function cargarComponente(ruta, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    fetch(ruta)
        .then(res => {
            if (!res.ok) {
                console.error(`[layout_loader] No se pudo cargar ${ruta} -> ${res.status}`);
                return "";
            }
            return res.text();
        })
        .then(html => {
            if (html) contenedor.innerHTML = html;
        })
        .catch(err => {
            console.error("[layout_loader] Error al cargar:", ruta, err);
        });
}

// Cargar al iniciar
document.addEventListener("DOMContentLoaded", () => {
    cargarComponente(SIDEBAR_PATH, "sidebar-container");
    cargarComponente(NAVBAR_PATH, "navbar-container");
});

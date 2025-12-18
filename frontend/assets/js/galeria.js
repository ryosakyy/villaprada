/* ============================================================
   CONFIG + TOKEN
============================================================ */
const API = "http://127.0.0.1:8000";

function getToken() {
    return localStorage.getItem("token") || "";
}

async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = {...(options.headers || {}) };

    // Solo manda Authorization si hay token
    if (token) headers["Authorization"] = "Bearer " + token;

    // Si NO es FormData y hay body, asume JSON
    if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    return fetch(url, {...options, headers });
}

/* ============================================================
   CARGAR GALERIA
============================================================ */
async function cargarGaleria() {
    if (!location.pathname.endsWith("lista_galeria.html")) return;

    const cont = document.getElementById("galeria-grid");
    if (!cont) return;

    try {
        const res = await apiFetch(`${API}/galeria/`);
        if (!res.ok) throw new Error(res.status);

        const data = await res.json();
        cont.innerHTML = "";

        if (!data || !data.length) {
            cont.innerHTML = `<p>No hay imágenes registradas.</p>`;
            return;
        }

        data.forEach(img => {
            const titulo = img && img.titulo ? img.titulo : "Sin título";
            const fecha = img && img.fecha_subida ? img.fecha_subida : "-";
            const url = img && img.imagen_url ? img.imagen_url : "";

            cont.innerHTML += `
                <div class="galeria-card">
                    <img src="${url}" alt="imagen">

                    <div class="card-info">
                        <strong>${titulo}</strong><br>
                        <small>${fecha}</small>
                    </div>

                    <button class="btn-delete" onclick="eliminarImagen(${img.id})">
                        Eliminar
                    </button>
                </div>
            `;
        });
    } catch (e) {
        console.error("Error cargando galería:", e);
        cont.innerHTML = `<p>Error cargando galería.</p>`;
    }
}

cargarGaleria();

/* ============================================================
   ELIMINAR IMAGEN
============================================================ */
async function eliminarImagen(id) {
    if (!confirm("¿Eliminar esta imagen?")) return;

    const res = await apiFetch(`${API}/galeria/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("No se pudo eliminar");

    alert("Imagen eliminada correctamente");
    cargarGaleria();
}

/* ============================================================
   SUBIR IMAGEN
============================================================ */
async function subirImagen() {
    const input = document.getElementById("imagen");
    const archivo = input && input.files ? input.files[0] : null;

    const tituloInput = document.getElementById("titulo");
    const descripcionInput = document.getElementById("descripcion");
    const categoriaInput = document.getElementById("categoria");

    const titulo = tituloInput ? tituloInput.value.trim() : "";
    const descripcion = descripcionInput ? descripcionInput.value.trim() : "";
    const categoria = categoriaInput ? categoriaInput.value : "";

    if (!archivo) return alert("Seleccione una imagen");

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    formData.append("categoria", categoria);
    formData.append("imagen", archivo);

    const res = await apiFetch(`${API}/galeria/`, {
        method: "POST",
        body: formData
    });

    if (!res.ok) return alert("Error al subir imagen");

    alert("Imagen subida correctamente");
    window.location.href = "lista_galeria.html";
}

/* ============================================================
   PREVIEW (VER IMAGEN ANTES DE SUBIR)
============================================================ */
const fileInput = document.getElementById("imagen");
const preview = document.getElementById("preview");

if (fileInput && preview) {
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            preview.src = reader.result;
            preview.style.display = "block";
        };

        if (file) reader.readAsDataURL(file);
    });
}

/* ============================================================
   EXPORT GLOBAL (para onclick / botones)
============================================================ */
window.subirImagen = subirImagen;
window.eliminarImagen = eliminarImagen;
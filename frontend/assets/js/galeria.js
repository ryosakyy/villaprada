/* ============================================================
   CONFIG + TOKEN
============================================================ */
const API = "http://127.0.0.1:8000";

function getToken() {
    return localStorage.getItem("token");
}

async function apiFetch(url, options = {}) {
    options.headers = {
        ...(options.headers || {}),
        "Authorization": "Bearer " + getToken()
    };
    return await fetch(url, options);
}

/* ============================================================
   CARGAR GALERIA
============================================================ */
async function cargarGaleria() {
    if (!location.href.includes("lista_galeria")) return;

    const res = await apiFetch(`${API}/galeria`);
    const data = await res.json();

    const cont = document.getElementById("galeria-grid");
    cont.innerHTML = "";

    if (data.length === 0) {
        cont.innerHTML = `<p>No hay imágenes registradas.</p>`;
        return;
    }

    data.forEach(img => {
        cont.innerHTML += `
            <div class="galeria-card">
                <img src="${img.imagen_url}" alt="imagen">

                <div class="card-info">
                    <strong>${img.titulo || "Sin título"}</strong><br>
                    <small>${img.fecha_subida}</small>
                </div>

                <button class="btn-delete" onclick="eliminarImagen(${img.id})">
                    Eliminar
                </button>
            </div>
        `;
    });
}

cargarGaleria();

/* ============================================================
   ELIMINAR IMAGEN
============================================================ */
async function eliminarImagen(id) {
    if (!confirm("¿Eliminar esta imagen?")) return;

    const res = await apiFetch(`${API}/galeria/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) return alert("No se pudo eliminar");

    alert("Imagen eliminada correctamente");
    cargarGaleria();
}

/* ============================================================
   SUBIR IMAGEN
============================================================ */
async function subirImagen() {

    const archivo = document.getElementById("imagen").files[0];
    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const categoria = document.getElementById("categoria").value;

    if (!archivo) return alert("Seleccione una imagen");

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    formData.append("categoria", categoria);
    formData.append("imagen", archivo);

    const res = await apiFetch(`${API}/galeria`, {
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

if (fileInput) {
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

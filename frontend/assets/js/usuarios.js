/* ============================================================
   CONFIG GLOBAL
============================================================ */
const API = "http://127.0.0.1:8000";

/* ============================================================
   TOKEN + SESIÓN
============================================================ */
function getToken() {
    return localStorage.getItem("token");
}

function verificarSesion() {
    if (!getToken()) {
        // Ruta universal → funciona desde cualquier carpeta
        window.location.href = "../../login.html";
    }
}

/* ============================================================
   FETCH AUTOMÁTICO CON TOKEN
============================================================ */
async function apiFetch(url, options = {}) {
    options.headers = {
        ...(options.headers || {}),
        "Authorization": "Bearer " + getToken(),
        "Content-Type": "application/json"
    };

    let res = await fetch(url, options);

    // Si token expiró
    if (res.status === 401) {
        alert("Su sesión ha expirado");
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "../../login.html";
    }

    return res;
}

/* ============================================================
   LISTAR USUARIOS
============================================================ */
async function cargarUsuarios() {
    if (!location.href.includes("lista_usuarios")) return;

    verificarSesion();

    const res = await apiFetch(`${API}/usuarios`);
    const data = await res.json();

    const tbody = document.getElementById("tabla-usuarios");
    tbody.innerHTML = "";

    data.forEach(u => {
        tbody.innerHTML += `
            <tr>
                <td>${u.id}</td>
                <td>${u.nombres}</td>
                <td>${u.email}</td>
                <td>${u.rol}</td>
                <td>${u.activo ? "Activo" : "Inactivo"}</td>
                <td>
                    <button class="btn-edit" onclick="editarUsuario(${u.id})">Editar</button>
                    <button class="btn-delete" onclick="eliminarUsuario(${u.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

cargarUsuarios();

/* ============================================================
   BUSCADOR EN TIEMPO REAL
============================================================ */
document.getElementById("buscador")?.addEventListener("keyup", () => {
    const texto = document.getElementById("buscador").value.toLowerCase();
    const filas = document.querySelectorAll("#tabla-usuarios tr");

    filas.forEach(fila => {
        fila.style.display = fila.textContent.toLowerCase().includes(texto) ? "" : "none";
    });
});

/* ============================================================
   REDIRECCIONAR A EDITAR
============================================================ */
function editarUsuario(id) {
    window.location.href = `editar_usuario.html?id=${id}`;
}

/* ============================================================
   ELIMINAR USUARIO (SOFT DELETE)
============================================================ */
async function eliminarUsuario(id) {
    if (!confirm("¿Eliminar usuario?")) return;

    const res = await apiFetch(`${API}/usuarios/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) {
        alert("Error al eliminar usuario");
        return;
    }

    alert("Usuario eliminado");
    cargarUsuarios();
}

/* ============================================================
   REGISTRAR USUARIO (ADMIN)
============================================================ */
async function registrarUsuario() {
    verificarSesion();

    const data = {
        nombres: document.getElementById("nombres").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        rol: document.getElementById("rol").value,
        activo: true
    };

    const res = await apiFetch(`${API}/usuarios`, {
        method: "POST",
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        alert("Error al registrar usuario");
        return;
    }

    alert("Usuario registrado correctamente");
    window.location.href = "lista_usuarios.html";
}

/* ============================================================
   CARGAR USUARIO PARA EDITAR
============================================================ */
async function cargarUsuarioEditar() {
    if (!location.href.includes("editar_usuario")) return;

    verificarSesion();

    const params = new URLSearchParams(location.search);
    const id = params.get("id");

    const res = await apiFetch(`${API}/usuarios/${id}`);
    if (!res.ok) {
        alert("Usuario no encontrado");
        return;
    }

    const u = await res.json();

    document.getElementById("nombres").value = u.nombres;
    document.getElementById("email").value = u.email;
    document.getElementById("rol").value = u.rol;
    document.getElementById("activo").value = u.activo ? "1" : "0";
}

cargarUsuarioEditar();

/* ============================================================
   GUARDAR CAMBIOS
============================================================ */
async function guardarCambios() {
    verificarSesion();

    const params = new URLSearchParams(location.search);
    const id = params.get("id");

    const data = {
        nombres: document.getElementById("nombres").value,
        email: document.getElementById("email").value,
        rol: document.getElementById("rol").value,
        activo: document.getElementById("activo").value === "1"
    };

    const res = await apiFetch(`${API}/usuarios/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        alert("Error al actualizar usuario");
        return;
    }

    alert("Usuario actualizado");
    window.location.href = "lista_usuarios.html";
}

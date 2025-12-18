/* ============================================================
   CONFIG GLOBAL
============================================================ */
const API = "http://127.0.0.1:8000";

/* ============================================================
   TOKEN / SESIÓN
============================================================ */
function getToken() {
    return localStorage.getItem("token") || "";
}

function redirectLogin() {
    // ruta absoluta segura
    window.location.href = "/frontend/admin/login.html";
}

function verificarSesion() {
    if (!getToken()) {
        redirectLogin();
    }
}

/* ============================================================
   FETCH CON TOKEN (NO CONGELADO)
============================================================ */
async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = {...(options.headers || {}) };

    if (token) headers["Authorization"] = "Bearer " + token;
    if (options.body) headers["Content-Type"] = "application/json";

    const res = await fetch(url, {...options, headers });

    // Token inválido o expirado
    if (res.status === 401) {
        alert("Su sesión ha expirado");
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        redirectLogin();
    }

    return res;
}

/* ============================================================
   LISTAR USUARIOS
============================================================ */
async function cargarUsuarios() {
    if (!location.pathname.endsWith("lista_usuarios.html")) return;

    verificarSesion();

    try {
        const res = await apiFetch(`${API}/usuarios/`);
        if (!res.ok) throw new Error(res.status);

        const data = await res.json();
        const tbody = document.getElementById("tabla-usuarios");
        if (!tbody) return;

        tbody.innerHTML = "";

        (data || []).forEach(u => {
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
    } catch (e) {
        console.error("Error cargando usuarios:", e);
    }
}

cargarUsuarios();

/* ============================================================
   BUSCADOR
============================================================ */
const buscador = document.getElementById("buscador");
if (buscador) {
    buscador.addEventListener("keyup", () => {
        const texto = buscador.value.toLowerCase();
        document.querySelectorAll("#tabla-usuarios tr").forEach(fila => {
            fila.style.display = fila.textContent.toLowerCase().includes(texto) ?
                "" :
                "none";
        });
    });
}

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

    const res = await apiFetch(`${API}/usuarios/${id}`, { method: "DELETE" });
    if (!res.ok) {
        alert("Error al eliminar usuario");
        return;
    }

    alert("Usuario eliminado");
    cargarUsuarios();
}

/* ============================================================
   REGISTRAR USUARIO
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

    const res = await apiFetch(`${API}/usuarios/`, {
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
    if (!location.pathname.endsWith("editar_usuario.html")) return;

    verificarSesion();

    const id = new URLSearchParams(location.search).get("id");
    if (!id) return;

    const res = await apiFetch(`${API}/usuarios/${id}`);
    if (!res.ok) {
        alert("Usuario no encontrado");
        return;
    }

    const u = await res.json();

    document.getElementById("nombres").value = u.nombres || "";
    document.getElementById("email").value = u.email || "";
    document.getElementById("rol").value = u.rol || "";
    document.getElementById("activo").value = u.activo ? "1" : "0";
}

cargarUsuarioEditar();

/* ============================================================
   GUARDAR CAMBIOS
============================================================ */
async function guardarCambios() {
    verificarSesion();

    const id = new URLSearchParams(location.search).get("id");
    if (!id) return;

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

/* ============================================================
   EXPORT GLOBAL
============================================================ */
window.registrarUsuario = registrarUsuario;
window.guardarCambios = guardarCambios;
window.eliminarUsuario = eliminarUsuario;
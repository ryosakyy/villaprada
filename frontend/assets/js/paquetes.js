/* ===========================
   CONFIG API
=========================== */
const API = "http://127.0.0.1:8000";

/* ===========================
   FETCH CON TOKEN (NO CONGELADO)
=========================== */
async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token") || "";
    const headers = {...(options.headers || {}) };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    return fetch(url, {...options, headers });
}

/* ===========================
   LISTAR PAQUETES
=========================== */
async function cargarPaquetesLista() {
    const tabla = document.getElementById("tabla-paquetes");
    if (!tabla) return;

    try {
        const res = await apiFetch(`${API}/paquetes/`);
        if (!res.ok) throw new Error(res.status);

        const data = await res.json();
        tabla.innerHTML = "";

        (data || []).forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${p.id || "-"}</td>
                <td>${p.nombre || "-"}</td>
                <td>${p.descripcion || "-"}</td>
                <td>S/ ${p.precio != null ? p.precio : "-"}</td>
                <td>
                    <a href="editar_paquete.html?id=${p.id}" class="btn-sm btn-edit">Editar</a>
                    <button class="btn-sm btn-delete" onclick="eliminarPaquete(${p.id})">Eliminar</button>
                </td>
            `;
            tabla.appendChild(tr);
        });
    } catch (e) {
        console.error("Error cargando paquetes:", e);
        tabla.innerHTML = `<tr><td colspan="5">Error cargando paquetes</td></tr>`;
    }
}

cargarPaquetesLista();

/* ===========================
   BUSCADOR
=========================== */
const buscador = document.getElementById("buscador");
if (buscador) {
    buscador.addEventListener("keyup", () => {
        const texto = buscador.value.toLowerCase();
        document.querySelectorAll("#tabla-paquetes tr").forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(texto) ? "" : "none";
        });
    });
}

/* ===========================
   REGISTRAR PAQUETE
=========================== */
async function registrarPaquete() {
    const data = {
        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value,
        precio: Number(document.getElementById("precio").value)
    };

    const res = await apiFetch(`${API}/paquetes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        alert("Error al registrar paquete");
        return;
    }

    alert("Paquete registrado correctamente");
    window.location.href = "lista_paquetes.html";
}

/* ===========================
   CARGAR PAQUETE PARA EDITAR
=========================== */
async function cargarPaqueteEditar() {
    if (!location.pathname.endsWith("editar_paquete.html")) return;

    const id = new URLSearchParams(location.search).get("id");
    if (!id) return;

    const res = await apiFetch(`${API}/paquetes/${id}`);
    if (!res.ok) return alert("No se pudo cargar el paquete");

    const p = await res.json();
    document.getElementById("nombre").value = p.nombre || "";
    document.getElementById("descripcion").value = p.descripcion || "";
    document.getElementById("precio").value = p.precio != null ? p.precio : 0;
}

cargarPaqueteEditar();

/* ===========================
   GUARDAR CAMBIOS
=========================== */
async function guardarPaquete() {
    const id = new URLSearchParams(location.search).get("id");
    if (!id) return alert("ID inválido");

    const data = {
        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value,
        precio: Number(document.getElementById("precio").value)
    };

    const res = await apiFetch(`${API}/paquetes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        alert("Error al actualizar paquete");
        return;
    }

    alert("Paquete actualizado correctamente");
    window.location.href = "lista_paquetes.html";
}

/* ===========================
   ELIMINAR PAQUETE
=========================== */
async function eliminarPaquete(id) {
    if (!confirm("¿Eliminar paquete definitivamente?")) return;

    const res = await apiFetch(`${API}/paquetes/${id}`, { method: "DELETE" });
    if (!res.ok) {
        alert("No se pudo eliminar el paquete");
        return;
    }

    alert("Paquete eliminado correctamente");
    cargarPaquetesLista();
}

/* ===========================
   EXPORT GLOBAL
=========================== */
window.registrarPaquete = registrarPaquete;
window.guardarPaquete = guardarPaquete;
window.eliminarPaquete = eliminarPaquete;
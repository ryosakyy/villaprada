/* ===========================
    CONFIG API + TOKEN
=========================== */
const API = "http://127.0.0.1:8000";
const token = localStorage.getItem("token");

// Helper universal con JWT
async function apiFetch(url, options = {}) {
    options.headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`
    };
    return await fetch(url, options);
}

/* ===========================
     LISTAR PAQUETES
=========================== */
async function cargarPaquetesLista() {
    const tabla = document.getElementById("tabla-paquetes");
    if (!tabla) return;

    const res = await apiFetch(`${API}/paquetes`);
    const data = await res.json();

    tabla.innerHTML = "";

    data.forEach(p => {
        let tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nombre}</td>
            <td>${p.descripcion}</td>
            <td>S/ ${p.precio}</td>
            <td>
                <a href="editar_paquete.html?id=${p.id}" class="btn-sm btn-edit">Editar</a>
                <button onclick="eliminarPaquete(${p.id})" class="btn-sm btn-delete">Eliminar</button>
            </td>
        `;

        tabla.appendChild(tr);
    });
}

cargarPaquetesLista();

/* ===========================
       BUSCADOR
=========================== */
document.getElementById("buscador")?.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();

    document.querySelectorAll("#tabla-paquetes tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(texto) ? "" : "none";
    });
});

/* ===========================
     REGISTRAR PAQUETE
=========================== */
async function registrarPaquete() {
    const data = {
        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value,
        precio: Number(document.getElementById("precio").value)
    };

    const res = await apiFetch(`${API}/paquetes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) return alert("Error al registrar paquete");

    alert("Paquete registrado correctamente");
    window.location.href = "lista_paquetes.html";
}

/* ===========================
   CARGAR PAQUETE PARA EDITAR
=========================== */
async function cargarPaqueteEditar() {
    if (!location.href.includes("editar_paquete")) return;

    const id = new URLSearchParams(location.search).get("id");

    const res = await apiFetch(`${API}/paquetes/${id}`);
    const p = await res.json();

    document.getElementById("nombre").value = p.nombre;
    document.getElementById("descripcion").value = p.descripcion;
    document.getElementById("precio").value = p.precio;
}

cargarPaqueteEditar();

/* ===========================
        GUARDAR CAMBIOS
=========================== */
async function guardarPaquete() {
    const id = new URLSearchParams(location.search).get("id");

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

    if (!res.ok) return alert("Error al actualizar paquete");

    alert("Paquete actualizado correctamente");
    window.location.href = "lista_paquetes.html";
}

/* ===========================
        ELIMINAR PAQUETE
=========================== */
async function eliminarPaquete(id) {
    if (!confirm("¿Eliminar paquete definitivamente?")) return;

    const res = await apiFetch(`${API}/paquetes/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) return alert("No se pudo eliminar el paquete");

    alert("Paquete eliminado correctamente");
    cargarPaquetesLista();
}

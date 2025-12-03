/* ============================================================
   CONFIG
============================================================ */
const API = "http://127.0.0.1:8000";
const token = localStorage.getItem("token");

/* ============================================================
   MIDDLEWARE DE SESIÓN
============================================================ */
function verificarSesion() {
    if (!token) {
        alert("Sesión expirada. Inicie sesión nuevamente.");
        window.location.href = "/admin/login.html";
    }
}
verificarSesion();

/* Headers con JWT */
const authHeaders = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
};

/* ============================================================
   LISTAR CLIENTES
============================================================ */
async function cargarClientes() {
    if (!location.href.includes("lista_clientes")) return;

    try {
        const res = await fetch(`${API}/clientes`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Error al obtener clientes");

        const clientes = await res.json();
        const tbody = document.getElementById("tabla-clientes");
        tbody.innerHTML = "";

        clientes.forEach(cli => {
            tbody.innerHTML += `
                <tr>
                    <td>${cli.id}</td>
                    <td>${cli.dni}</td>
                    <td>${cli.nombres}</td>
                    <td>${cli.telefono}</td>
                    <td>${cli.email}</td>
                    <td>
                        <a href="editar_cliente.html?id=${cli.id}">
                            <button class="btn-sm btn-edit">Editar</button>
                        </a>
                        <button class="btn-sm btn-delete" onclick="eliminarCliente(${cli.id})">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
    }
}
cargarClientes();

/* ============================================================
   BUSCADOR EN TIEMPO REAL
============================================================ */
document.getElementById("buscador")?.addEventListener("keyup", () => {
    const texto = document.getElementById("buscador").value.toLowerCase();
    document.querySelectorAll("#tabla-clientes tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(texto) ? "" : "none";
    });
});

/* ============================================================
   REGISTRAR CLIENTE
============================================================ */
async function registrarCliente() {
    const data = {
        dni: document.getElementById("dni").value,
        nombres: document.getElementById("nombres").value,
        telefono: document.getElementById("telefono").value,
        email: document.getElementById("email").value
    };

    const res = await fetch(`${API}/clientes`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(data)
    });

    if (!res.ok) return alert("Error al registrar cliente");

    alert("Cliente registrado con éxito");
    window.location.href = "lista_clientes.html";
}

/* ============================================================
   CARGAR CLIENTE PARA EDITAR
============================================================ */
async function cargarClienteEditar() {
    if (!location.href.includes("editar_cliente")) return;

    const id = new URLSearchParams(location.search).get("id");

    const res = await fetch(`${API}/clientes/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) return alert("Error al cargar datos");

    const cli = await res.json();

    document.getElementById("dni").value = cli.dni;
    document.getElementById("nombres").value = cli.nombres;
    document.getElementById("telefono").value = cli.telefono;
    document.getElementById("email").value = cli.email;
}
cargarClienteEditar();

/* ============================================================
   GUARDAR CAMBIOS
============================================================ */
async function guardarCliente() {
    const id = new URLSearchParams(location.search).get("id");

    const data = {
        dni: document.getElementById("dni").value,
        nombres: document.getElementById("nombres").value,
        telefono: document.getElementById("telefono").value,
        email: document.getElementById("email").value,
    };

    const res = await fetch(`${API}/clientes/${id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(data)
    });

    if (!res.ok) return alert("Error al actualizar cliente");

    alert("Cliente actualizado correctamente");
    window.location.href = "lista_clientes.html";
}

/* ============================================================
   ELIMINAR CLIENTE
============================================================ */
async function eliminarCliente(id) {
    if (!confirm("¿Eliminar este cliente?")) return;

    const res = await fetch(`${API}/clientes/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) return alert("Error al eliminar");

    alert("Cliente eliminado correctamente");
    cargarClientes();
}

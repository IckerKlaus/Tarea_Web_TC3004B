// =======================================================
// BASE DE DATOS SIMULADA (HARDCODEADA)
// =======================================================
// Simula una pequeña base de datos en formato JSON.
// En un proyecto real esto vendría desde un backend.
const usuariosRegistrados = [
    { correo: "admin@test.com", password: "123", nombre: "Administrador" },
    { correo: "usuario@web.com", password: "abc", nombre: "Juan Pérez" }
];


// =======================================================
// 1. COMPONENTES REUTILIZABLES (HEADER / FOOTER)
// =======================================================
// Esta función inserta el mismo menú en todas las páginas
// para evitar repetir código HTML.
function cargarComponentes() {

    const esPaginaLogin = window.location.pathname.includes("login.html");
    
    // Si estamos en login no cargamos header ni botón de logout
    if (esPaginaLogin) return;

    const headerHTML = `
        <header>
            <div class="logo">Mi Sitio Web</div>
            <nav>
                <ul>
                    <li><a href="registro.html">Inicio</a></li>
                    <li><a href="tenisweb.html">Tenis</a></li>
                    <li><button id="btnSalir" class="btn-logout">Cerrar Sesión</button></li>
                </ul>
            </nav>
        </header>`;

    const footerHTML = `
        <footer>
            <p>© 2026 Mi Sitio Web - Todos los derechos reservados</p>
        </footer>`;

    // Insertamos header al inicio del body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // Insertamos footer al final
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    // Evento para cerrar sesión
    document.getElementById("btnSalir")?.addEventListener("click", () => {
        // Eliminamos la variable que simula la sesión
        localStorage.removeItem("usuarioActivo");

        // Redirigimos al login
        window.location.href = "login.html";
    });
}


// =======================================================
// 2. CONTROL DE ACCESO (SIMULACIÓN DE SEGURIDAD)
// =======================================================
// Verifica si existe un usuario activo en localStorage.
function verificarAcceso() {

    const usuarioLogueado = localStorage.getItem("usuarioActivo");
    const esPaginaLogin = window.location.pathname.includes("login.html");

    // Si no hay sesión y no estamos en login, redirigir
    if (!usuarioLogueado && !esPaginaLogin) {
        window.location.href = "login.html";
    } 
    // Si ya hay sesión y el usuario intenta entrar a login, redirigir
    else if (usuarioLogueado && esPaginaLogin) {
        window.location.href = "registro.html";
    }
}


// =======================================================
// 3. INICIALIZACIÓN GENERAL
// =======================================================
// Todo se ejecuta cuando el DOM ya está cargado.
document.addEventListener("DOMContentLoaded", () => {

    // Primero validamos acceso
    verificarAcceso();

    // Luego cargamos header/footer si corresponde
    cargarComponentes();


    // ===================================================
    // LÓGICA DE LOGIN
    // ===================================================
    const loginBtn = document.getElementById("btnEntrar");

    if (loginBtn) {

        loginBtn.addEventListener("click", () => {

            const correo = document.getElementById("loginCorreo").value;
            const pass = document.getElementById("loginPass").value;

            // Buscamos coincidencia en nuestra "base de datos"
            const usuarioEncontrado = usuariosRegistrados.find(u => 
                u.correo === correo && u.password === pass
            );

            if (usuarioEncontrado) {

                // Guardamos el nombre como si fuera un token
                localStorage.setItem("usuarioActivo", usuarioEncontrado.nombre);

                alert("¡Bienvenido, " + usuarioEncontrado.nombre + "!");
                window.location.href = "registro.html";

            } else {
                alert("Credenciales incorrectas. Intenta de nuevo.");
            }
        });
    }


    // ===================================================
    // LÓGICA DE REGISTRO (SIMULADA)
    // ===================================================
    const registroForm = document.getElementById("registroForm");

    if (registroForm) {

        registroForm.addEventListener("submit", (e) => {

            // Evitamos que la página se recargue
            e.preventDefault();

            const nombre = document.getElementById("nombre").value;

            // Solo mostramos en consola (no guardamos realmente)
            console.log("Nuevo usuario registrado:", nombre);

            alert(`¡Gracias ${nombre}! Registro recibido (Simulado).`);

            // Limpiamos el formulario
            registroForm.reset();
        });
    }

});
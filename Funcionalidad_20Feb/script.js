// --- BASE DE DATOS HARDCODEADA (JSON) ---
const usuariosRegistrados = [
    { correo: "admin@test.com", password: "123", nombre: "Administrador" },
    { correo: "usuario@web.com", password: "abc", nombre: "Juan Pérez" }
];

// Esperar a que el DOM esté cargado para evitar errores de elementos no encontrados
document.addEventListener("DOMContentLoaded", () => {

    // --- LÓGICA DE REGISTRO (registro.html) ---
    const registroForm = document.querySelector("#contacto form");
    if (registroForm) {
        registroForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Evita que la página se recargue

            // Captura de valores
            const nombre = document.getElementById("nombre").value;
            const correo = document.getElementById("correo").value;
            const password = document.getElementById("password").value;

            // Simulación de guardado
            const nuevoUsuario = { nombre, correo, password };
            
            console.log("--- NUEVO REGISTRO DETECTADO ---");
            console.log("Datos capturados:", nuevoUsuario);
            console.log("Estado: Guardado exitosamente (Simulado)");
            
            alert(`¡Bienvenido ${nombre}! Registro completado (revisa la consola).`);
            registroForm.reset(); // Limpia los campos
        });
    }

    // --- LÓGICA DE LOGIN (login.html) ---
    // Seleccionamos el botón de la login-box
    const loginBtn = document.querySelector(".login-box button");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            const inputs = document.querySelectorAll(".login-box input");
            const correoIngresado = inputs[0].value;
            const passwordIngresado = inputs[1].value;

            // Buscar si el usuario existe en nuestro JSON hardcodeado
            const usuarioEncontrado = usuariosRegistrados.find(u => 
                u.correo === correoIngresado && u.password === passwordIngresado
            );

            console.log("--- INTENTO DE INICIO DE SESIÓN ---");
            if (usuarioEncontrado) {
                console.log("Acceso concedido para:", usuarioEncontrado.nombre);
                alert("¡Bienvenido de nuevo, " + usuarioEncontrado.nombre + "!");
                window.location.href = "registro.html";
            } else {
                console.error("Acceso denegado: Credenciales incorrectas.");
                alert("Error: Correo o contraseña inválidos.");
            }
        });
    }
});
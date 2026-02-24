// =======================================================
// BASE DE DATOS SIMULADA (HARDCODEADA)
// =======================================================
const usuariosRegistrados = [
    { correo: "admin@test.com", password: "123", nombre: "Administrador" },
    { correo: "usuario@web.com", password: "abc", nombre: "Juan Pérez" }
];

// Variable global para almacenar los datos de los Pokémon una vez descargados
let todosLosPokemon = [];

// =======================================================
// 1. COMPONENTES REUTILIZABLES (HEADER / FOOTER)
// =======================================================
function cargarComponentes() {
    const esPaginaLogin = window.location.pathname.includes("login.html");
    
    // Si estamos en login no cargamos header ni footer
    if (esPaginaLogin) return;

    const headerHTML = `
        <header>
            <div class="logo">Mi Sitio Web</div>
            <nav>
                <ul>
                    <li><a href="registro.html">Inicio</a></li>
                    <li><a href="tenisweb.html">Tenis</a></li>
                    <li><a href="pokemonweb.html">Pokemon</a></li>
                    <li><button id="btnSalir" class="btn-logout">Cerrar Sesión</button></li>
                </ul>
            </nav>
        </header>`;

    const footerHTML = `
        <footer>
            <p>© 2026 Mi Sitio Web - Todos los derechos reservados</p>
        </footer>`;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    // Evento para cerrar sesión
    document.getElementById("btnSalir")?.addEventListener("click", () => {
        localStorage.removeItem("usuarioActivo");
        window.location.href = "login.html";
    });
}

// =======================================================
// 2. CONTROL DE ACCESO (SIMULACIÓN DE SEGURIDAD)
// =======================================================
function verificarAcceso() {
    const usuarioLogueado = localStorage.getItem("usuarioActivo");
    const esPaginaLogin = window.location.pathname.includes("login.html");

    if (!usuarioLogueado && !esPaginaLogin) {
        window.location.href = "login.html";
    } 
    else if (usuarioLogueado && esPaginaLogin) {
        window.location.href = "registro.html";
    }
}

// =======================================================
// 3. LÓGICA DE POKEAPI (LISTADO, DATOS Y FILTRADO)
// =======================================================

// Función principal para obtener los 151 Pokémon originales
async function cargarPokedex() {
    const contenedor = document.getElementById("pokemon-container");
    if (!contenedor) return;

    try {
        // 1. Obtenemos la lista básica
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
        const data = await response.json();

        // 2. Mapeamos cada resultado para obtener su JSON de detalle completo
        const promesas = data.results.map(p => fetch(p.url).then(res => res.json()));
        
        // Resolvemos todas las promesas en paralelo
        todosLosPokemon = await Promise.all(promesas);

        // 3. Renderizamos por primera vez
        renderizarPokemon(todosLosPokemon);

        // 4. Activamos el buscador
        configurarBuscador();

    } catch (error) {
        console.error("Error cargando la Pokédex:", error);
        contenedor.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Error al conectar con la PokeAPI.</p>";
    }
}

// Función para pintar las tarjetas en el HTML
function renderizarPokemon(lista) {
    const contenedor = document.getElementById("pokemon-container");
    contenedor.innerHTML = ""; 

    if (lista.length === 0) {
        contenedor.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>No se encontraron Pokémon con ese nombre.</p>";
        return;
    }

    lista.forEach(pokemon => {
        // Formatear el número de Pokémon (ID) para que sea #001, #025, etc.
        const pokemonID = pokemon.id.toString().padStart(3, '0');

        // Formatear tipos
        const tipos = pokemon.types.map(t => 
            `<span style="background: #2c3e50; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7em; margin-right: 5px; text-transform: uppercase;">
                ${t.type.name}
            </span>`
        ).join("");

        // Formatear habilidades
        const habilidades = pokemon.abilities.map(a => a.ability.name.replace("-", " ")).join(", ");

        // Crear tarjeta (Box tipo Tenis con el ID añadido)
        const card = `
            <div class="box" style="position: relative;">
                <span style="position: absolute; top: 10px; right: 15px; font-weight: bold; color: #ccc; font-size: 1.2rem;">
                    #${pokemonID}
                </span>
                <div style="text-align: center;">
                    <h2 style="text-transform: capitalize; margin-bottom: 5px;">${pokemon.name}</h2>
                    <div style="margin-bottom: 10px;">${tipos}</div>
                    <img src="${pokemon.sprites.other['official-artwork'].front_default}" 
                         alt="${pokemon.name}" 
                         style="width: 130px; height: 130px; object-fit: contain; margin: 10px 0;">
                </div>
                <div style="font-size: 0.9rem; color: #444; border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px;">
                    <p><strong>Nivel Base:</strong> ${pokemon.base_experience} XP</p>
                    <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
                    <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
                    <p><strong>Habilidades:</strong> <span style="text-transform: capitalize;">${habilidades}</span></p>
                </div>
            </div>
        `;
        contenedor.insertAdjacentHTML('beforeend', card);
    });
}

// Configuración del filtro en tiempo real
function configurarBuscador() {
    const searchInput = document.getElementById("pokemonSearch");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const busqueda = e.target.value.toLowerCase();
        const filtrados = todosLosPokemon.filter(p => p.name.includes(busqueda));
        renderizarPokemon(filtrados);
    });
}

// =======================================================
// 4. INICIALIZACIÓN GENERAL
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
    
    verificarAcceso();
    cargarComponentes();

    if (document.getElementById("pokemon-container")) {
        cargarPokedex();
    }

    // Lógica de Login
    const loginBtn = document.getElementById("btnEntrar");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            const correo = document.getElementById("loginCorreo").value;
            const pass = document.getElementById("loginPass").value;

            const usuarioEncontrado = usuariosRegistrados.find(u => 
                u.correo === correo && u.password === pass
            );

            if (usuarioEncontrado) {
                localStorage.setItem("usuarioActivo", usuarioEncontrado.nombre);
                alert("¡Bienvenido, " + usuarioEncontrado.nombre + "!");
                window.location.href = "registro.html";
            } else {
                alert("Credenciales incorrectas. Intenta de nuevo.");
            }
        });
    }

    // Lógica de Registro
    const registroForm = document.getElementById("registroForm");
    if (registroForm) {
        registroForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const nombre = document.getElementById("nombre").value;
            alert(`¡Gracias ${nombre}! Registro recibido (Simulado).`);
            registroForm.reset();
        });
    }
});
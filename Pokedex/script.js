// =======================================================
// BASE DE DATOS SIMULADA (HARDCODEADA)
// =======================================================

/*
Qué hace:
Define una lista de usuarios registrados simulando una base de datos.

Cómo lo hace:
Se utiliza un arreglo de objetos donde cada objeto representa un usuario
con tres propiedades: correo, password y nombre.

Por qué se eligió hacerlo de esa manera:
Para evitar usar una base de datos real o un backend durante el desarrollo.
Esto permite simular autenticación de forma simple usando datos
almacenados directamente en el código.
*/
const usuariosRegistrados = [
    { correo: "admin@test.com", password: "123", nombre: "Administrador" },
    { correo: "usuario@web.com", password: "abc", nombre: "Juan Pérez" }
];

/*
Qué hace:
Declara una variable global que almacenará todos los Pokémon descargados de la API.

Cómo lo hace:
Inicializa un arreglo vacío que posteriormente será llenado con los datos
obtenidos desde la PokeAPI.

Por qué se eligió hacerlo de esa manera:
Se necesita mantener los Pokémon en memoria para poder filtrarlos
sin tener que hacer nuevas peticiones a la API cada vez que el usuario
utilice el buscador o los filtros.
*/
let todosLosPokemon = [];


// =======================================================
// 1. COMPONENTES REUTILIZABLES (HEADER / FOOTER)
// =======================================================

/*
Qué hace:
Carga dinámicamente el header y el footer en todas las páginas del sitio.

Cómo lo hace:
1. Detecta si la página actual es la página de login.
2. Si no es login, inserta HTML del header y footer en el DOM.
3. Agrega un botón que permite cerrar sesión.

Por qué se eligió hacerlo de esa manera:
Permite reutilizar los mismos componentes en todas las páginas
sin duplicar código HTML en cada archivo.
Esto facilita mantenimiento y consistencia visual.
*/
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

    // Inserta el header al inicio del body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // Inserta el footer al final del body
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    /*
    Qué hace:
    Implementa la funcionalidad de cerrar sesión.

    Cómo lo hace:
    Elimina la variable usuarioActivo del localStorage y redirige
    al usuario a la página de login.

    Por qué se eligió hacerlo de esa manera:
    localStorage permite mantener la sesión activa incluso
    después de recargar la página.
    */
    document.getElementById("btnSalir")?.addEventListener("click", () => {
        localStorage.removeItem("usuarioActivo");
        window.location.href = "login.html";
    });
}


// =======================================================
// 2. CONTROL DE ACCESO (SIMULACIÓN DE SEGURIDAD)
// =======================================================

/*
Qué hace:
Verifica si el usuario tiene acceso a la página actual.

Cómo lo hace:
1. Revisa si existe un usuario almacenado en localStorage.
2. Si no hay usuario y no estamos en login → redirige a login.
3. Si ya hay usuario pero estamos en login → redirige al inicio.

Por qué se eligió hacerlo de esa manera:
Permite simular un sistema de autenticación básico sin
necesidad de backend ni tokens reales.
*/
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

/*
Qué hace:
Carga los primeros 151 Pokémon desde la PokeAPI.

Cómo lo hace:
1. Realiza una petición fetch a la API para obtener la lista básica.
2. Obtiene la URL de detalle de cada Pokémon.
3. Hace múltiples peticiones en paralelo para obtener información completa.
4. Guarda todos los datos en memoria.
5. Renderiza los Pokémon en la página.
6. Activa el sistema de búsqueda.

Por qué se eligió hacerlo de esa manera:
La PokeAPI separa los datos en dos niveles (lista y detalle).
Por eso se necesitan dos pasos para obtener toda la información.
Promise.all permite descargar todos los Pokémon al mismo tiempo,
mejorando el rendimiento.
*/
async function cargarPokedex() {
    const contenedor = document.getElementById("pokemon-container"); // Busca en HTML un elemento con id "pokemon-container" (está en pokemonweb.html) y lo guarda en la variable
    if (!contenedor) return; // Si no existe el elemento, termina la función

    try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151"); // Esperamos a que se llammen a los 151 pokemons
        const data = await response.json(); // Espera hasta transformar la respuesta del API en un objeto usable de JavaScript
        
        // data.results contiene la lista de pokemon (cada pokemon tiene una URL con su información completa)
        // map() crea un arreglo de promesas que descargan data de cada Pokémon usando su URL
        const promesas = data.results.map(p => fetch(p.url).then(res => res.json()));
        
        // Descarga todos los Pokémon en paralelo
        todosLosPokemon = await Promise.all(promesas);

        // Llama a la función que renderiza los Pokémon en la página
        renderizarPokemon(todosLosPokemon);
        configurarBuscador();

    } catch (error) {
        console.error("Error cargando la Pokédex:", error); // Para el desarrollador, muestra el error en la consola
        contenedor.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Error al conectar con la PokeAPI.</p>"; // Para el usuario, muestra un mensaje de error en la página
    }
}


/*
Qué hace:
Muestra visualmente los Pokémon en la página web.

Cómo lo hace:
1. Limpia el contenedor HTML.
2. Recorre cada Pokémon recibido.
3. Formatea sus datos (ID, tipos, habilidades).
4. Genera una tarjeta HTML para cada Pokémon.
5. Inserta las tarjetas en el contenedor.

Por qué se eligió hacerlo de esa manera:
Permite generar dinámicamente el contenido del sitio
a partir de datos obtenidos desde la API.
*/
function renderizarPokemon(lista) {
    const contenedor = document.getElementById("pokemon-container"); // Busca nuevamente el contenedor donde se mostrarán las tarjetas.
    contenedor.innerHTML = ""; // Limpia el contenedor, para evitar que se dupliquen Pokémon cuando se vuelva a renderizar.

    if (lista.length === 0) {
        // Muestra un mensaje si no hay resultados (lista vacía) y finaliza la función.
        contenedor.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>No se encontraron Pokémon con ese nombre.</p>";
        return;
    }

    // Recorre cada Pokémon en la lista y genera su tarjeta HTML, forEach permite ejecutar código para cada elemento.
    lista.forEach(pokemon => {

        // Formatea el ID del Pokémon a string con 3 ceros iniciales (ej. 1 -> 003, 25 -> 025, 150 -> 150)
        const pokemonID = pokemon.id.toString().padStart(3, '0');

        // Genera etiquetas HTML para cada tipo (ej. charizard -> fire + flying)
        const tipos = pokemon.types.map(t => 
            `<span style="background: #2c3e50; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7em; margin-right: 5px; text-transform: uppercase;">
                ${t.type.name}
            </span>`
        ).join(""); // Une todos los elementos del array en un solo texto HTML.

        // Obtiene las habilidades, reemplaza los guiones y las une con coma (ej. overgrow, chlorophyll)
        const habilidades = pokemon.abilities.map(a => a.ability.name.replace("-", " ")).join(", ");

        // Crea un template string con el HTML de la tarjeta e inserta las variables.
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
        // Inserta la tarjeta generada al final del contenedor, para que se muestren todos los Pokémon.
        contenedor.insertAdjacentHTML('beforeend', card);
    });
}


/*
Qué hace:
Configura el sistema de búsqueda y filtrado de Pokémon.

Cómo lo hace:
1. Obtiene referencias a los campos de búsqueda.
2. Define una función que aplica todos los filtros.
3. Filtra por nombre, ID y tipo.
4. Vuelve a renderizar solo los Pokémon filtrados.

Por qué se eligió hacerlo de esa manera:
Permite combinar múltiples filtros al mismo tiempo
y actualizar los resultados en tiempo real sin recargar la página.
*/
function configurarBuscador() {
    const searchInput = document.getElementById("pokemonSearch"); // Busca el campo de búsqueda por nombre en el HTML
    const idInput = document.getElementById("pokemonIdSearch"); // Busca el campo de búsqueda por ID en el HTML
    const typeFilter = document.getElementById("pokemonTypeFilter"); // Busca el campo de selección de tipo en el HTML

    if (!searchInput || !idInput || !typeFilter) return; // Si alguno de los campos no existe, termina la función

    const aplicarFiltros = () => {
        const nombreBusqueda = searchInput.value.toLowerCase(); // Obtiene el texto escrito por el usuario y lo convierte a minúsculas.
        const idBusqueda = idInput.value; // Obtiene el ID escrito por el usuario.
        const tipoBusqueda = typeFilter.value; // Obtiene el tipo seleccionado por el usuario.

        // Filtra la lista completa de Pokémon, filter() devuelve solo los que cumplen la condición.
        const filtrados = todosLosPokemon.filter(p => {

            const coincideNombre = p.name.includes(nombreBusqueda); // Verifica si el nombre contiene el texto buscado.
            const coincideID = idBusqueda === "" || p.id.toString() === idBusqueda; // Si el campo ID está vacío, acepta todos o si tiene valor compara el ID
            const coincideTipo = tipoBusqueda === "all" || 
                                p.types.some(t => t.type.name === tipoBusqueda); // Verifica si el Pokémon tiene ese tipo, some() devuelve true si al menos un tipo coincide.

            return coincideNombre && coincideID && coincideTipo; // El Pokémon se muestra solo si cumple con los tres filtros al mismo tiempo.
        });

        renderizarPokemon(filtrados); // Vuelve a mostrar los Pokémon pero ya filtrados.
    };

    // Cada vez que el usuario escribe, se aplican filtros.
    searchInput.addEventListener("input", aplicarFiltros);
    idInput.addEventListener("input", aplicarFiltros);
    typeFilter.addEventListener("change", aplicarFiltros);
}


// =======================================================
// 4. INICIALIZACIÓN GENERAL
// =======================================================

/*
Qué hace:
Inicializa toda la lógica de la aplicación cuando el DOM
ha terminado de cargarse.

Cómo lo hace:
1. Verifica acceso del usuario.
2. Carga header y footer.
3. Si la página tiene contenedor de Pokémon, carga la Pokédex.
4. Configura login.
5. Configura formulario de registro.

Por qué se eligió hacerlo de esa manera:
DOMContentLoaded asegura que todo el HTML esté disponible
antes de manipular el DOM o agregar eventos.
*/
document.addEventListener("DOMContentLoaded", () => {
    
    verificarAcceso();
    cargarComponentes();

    if (document.getElementById("pokemon-container")) {
        cargarPokedex();
    }

    /*
    Lógica de autenticación simulada
    */
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

    /*
    Lógica del formulario de registro (simulado)
    */
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
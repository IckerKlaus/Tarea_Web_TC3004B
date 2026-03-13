let pokemon = []; 
// Qué: Arreglo donde se guardarán los objetos de los 2 Pokémon.
// Cómo: Se llenará después de hacer fetch a la API.
// Por qué: Necesitamos almacenar estado del juego.
// Para qué: Acceder fácilmente a stats, vida e imagen.

let currentTurn = 0; 
// Qué: Variable que indica de quién es el turno.
// Cómo: Solo puede ser 0 o 1.
// Por qué: Permite alternar entre jugadores.
// Para qué: Controlar quién ataca.

let turnCount = [0, 0]; 
// Qué: Arreglo contador de turnos por Pokémon.
// Cómo: Se incrementa cuando inicia su turno.
// Por qué: Controlar cooldown de habilidades.
// Para qué: Habilitar ataque especial y defensa.

let gameActive = false; 
// Qué: Bandera de estado del juego.
// Cómo: true cuando batalla inicia, false cuando termina.
// Por qué: Evitar acciones después de ganar.
// Para qué: Bloquear botones.

const startBtn = document.getElementById('start-btn'); 
// Qué: Obtiene el botón iniciar del DOM.
// Cómo: Por su id.
// Por qué: Para escuchar click.
// Para qué: Iniciar batalla.

const battleLog = document.getElementById('battle-log'); 
// Qué: Obtiene contenedor del log.
// Cómo: Selección DOM.
// Por qué: Mostrar eventos del combate.
// Para qué: Feedback al jugador.

startBtn.addEventListener('click', async () => { 
// Qué: Evento cuando usuario hace click.
// Cómo: Función async.
// Por qué: Necesitamos await fetch.
// Para qué: Cargar Pokémon.

    const p1Name = document.getElementById('p1-input').value.toLowerCase(); 
    // Qué: Lee nombre input jugador 1.
    // Cómo: Accede value y lo pasa a minúsculas.
    // Por qué: API requiere lowercase.
    // Para qué: Construir URL fetch.

    const p2Name = document.getElementById('p2-input').value.toLowerCase(); 
    // Igual pero jugador 2.

    if (!p1Name || !p2Name) return alert("Ingresa ambos nombres"); 
    // Qué: Validación.
    // Cómo: Si alguno está vacío.
    // Por qué: Evitar fetch inválido.
    // Para qué: UX.

    try {
        pokemon[0] = await fetchPokeData(p1Name); 
        // Qué: Llama función que trae datos Pokémon.
        // Cómo: await espera respuesta.
        // Para qué: Guardar stats.

        pokemon[1] = await fetchPokeData(p2Name); 
        // Igual para Pokémon 2.

        gameActive = true; 
        // Qué: Activa estado juego.
        // Para qué: Permitir acciones.

        setupBattle(); 
        // Qué: Cambia pantalla a batalla.
        // Para qué: Iniciar simulación.

    } catch (error) {
        alert("No se encontró el Pokémon. Revisa la ortografía."); 
        // Qué: Manejo de error fetch.
        // Para qué: Avisar usuario.
    }
});

async function fetchPokeData(name) { 
// Qué: Función que obtiene info de la API.
// Cómo: HTTP fetch.
// Para qué: Construir objeto Pokémon.

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`); 
    // Qué: Petición GET.
    // Para qué: Traer datos.

    const data = await response.json(); 
    // Qué: Convierte respuesta a JSON.
    // Para qué: Acceder propiedades.

    return {
        name: data.name.toUpperCase(), 
        // Qué: Nombre Pokémon.
        // Por qué: Estética UI.

        hp: 100, 
        // Qué: Vida inicial.
        // Por qué: Sistema porcentaje.

        img: data.sprites.other['official-artwork'].front_default || data.sprites.front_default, 
        // Qué: Imagen oficial.
        // Cómo: Fallback si no existe.

        attack: data.stats[1].base_stat, 
        // Qué: Ataque físico real.

        specialAttack: data.stats[3].base_stat, 
        // Qué: Ataque especial real.

        isDefending: false 
        // Qué: Estado defensa activa.
    };
}

function setupBattle() {
// Qué: Configura pantalla de batalla.

    document.getElementById('selection-screen').classList.add('hidden'); 
    // Oculta selección.

    document.getElementById('battle-screen').classList.remove('hidden'); 
    // Muestra arena.

    updateUI(); 
    // Renderiza datos Pokémon.

    log("¡La batalla comienza!"); 
    // Mensaje inicial.
}

function updateUI() {
// Qué: Actualiza toda la interfaz.

    const attackBtn = document.getElementById('attack-btn'); 
    const specialAtBtn = document.getElementById('special-at-btn'); 
    const specialDfBtn = document.getElementById('special-df-btn'); 
    // Obtiene botones.

    for (let i = 0; i < 2; i++) {
    // Loop para ambos Pokémon.

        document.getElementById(`name-${i}`).innerText = pokemon[i].name; 
        // Actualiza nombre.

        document.getElementById(`img-${i}`).src = pokemon[i].img; 
        // Actualiza imagen.

        document.getElementById(`hp-text-${i}`).innerText = Math.ceil(pokemon[i].hp); 
        // Actualiza número HP.

        const fill = document.getElementById(`hp-fill-${i}`); 
        // Obtiene barra visual.

        fill.style.width = pokemon[i].hp + "%"; 
        // Ajusta ancho según vida.

        if (pokemon[i].hp < 30) fill.style.background = "#f44336"; 
        // Rojo si vida baja.

        else if (pokemon[i].hp < 60) fill.style.background = "#ffeb3b"; 
        // Amarillo media.

        else fill.style.background = "#4caf50"; 
        // Verde vida alta.
    }

    if (!gameActive) {
    // Si batalla terminó.

        attackBtn.disabled = true;
        specialAtBtn.disabled = true;
        specialDfBtn.disabled = true;
        // Bloquea botones.

        document.getElementById('turn-indicator').innerText = "¡FIN DE LA BATALLA!";
        // Texto final.
    } 
    else {
        document.getElementById('turn-indicator').innerText =
            `Turno de: ${pokemon[currentTurn].name}`;
        // Indica turno actual.

        attackBtn.disabled = false;
        // Ataque normal siempre activo.

        specialAtBtn.disabled = turnCount[currentTurn] < 3;
        // Cooldown ataque especial.

        specialDfBtn.disabled = turnCount[currentTurn] < 2;
        // Cooldown defensa.
    }
}

function log(msg) {
// Qué: Agrega mensaje al log.

    const p = document.createElement('p'); 
    // Crea párrafo.

    p.innerText = `> ${msg}`; 
    // Texto tipo consola.

    battleLog.prepend(p); 
    // Inserta arriba.
}

function executeAction(type) {
// Qué: Ejecuta acción del turno.

    if (!gameActive) return; 
    // Bloquea si juego terminó.

    const attacker = pokemon[currentTurn]; 
    const defender = pokemon[1 - currentTurn]; 
    // Define roles.

    if (Math.random() < 0.15) {
        log(`¡${attacker.name} falló su movimiento!`);
        // Probabilidad fallo.
    } 
    else {

        if (type === 'attack') {
            const damage = Math.floor(Math.random() * 10) + 5;
            // Daño random.

            applyDamage(defender, damage, "Ataque Normal");
        } 
        else if (type === 'special-attack') {
            const damage = Math.floor(Math.random() * 20) + 15;
            // Daño fuerte.

            applyDamage(defender, damage, "ATAQUE ESPECIAL");
            turnCount[currentTurn] = -1;
            // Reinicia cooldown.
        } 
        else if (type === 'special-defense') {
            attacker.isDefending = true;
            // Activa defensa.

            log(`${attacker.name} se está preparando para defender.`);
            turnCount[currentTurn] = -1;
        }
    }

    updateUI();
    // Refresca pantalla.

    if (defender.hp <= 0) {
        gameActive = false;
        // Termina juego.

        updateUI();

        setTimeout(() => showWinner(attacker), 800);
        // Muestra ganador.
        return;
    }

    currentTurn = 1 - currentTurn;
    // Cambia turno.

    turnCount[currentTurn]++;
    // Incrementa contador.

    pokemon[currentTurn].isDefending = false;
    // Quita defensa.

    updateUI();
}

function applyDamage(target, damage, moveName) {
// Qué: Aplica daño.

    let finalDamage = target.isDefending ? Math.floor(damage / 2) : damage;
    // Reduce si defiende.

    if (target.isDefending) log(`¡La defensa redujo el impacto!`);

    target.hp = Math.max(0, target.hp - finalDamage);
    // Resta vida con límite.

    log(`${pokemon[currentTurn].name} usó ${moveName} e hizo ${finalDamage}% de daño.`);
}

function showWinner(winner) {
// Qué: Muestra pantalla final.

    document.getElementById('battle-screen').classList.add('hidden');
    // Oculta arena.

    document.getElementById('winner-screen').classList.remove('hidden');
    // Muestra ganador.

    document.getElementById('winner-name').innerText = winner.name;
    // Nombre ganador.

    document.getElementById('winner-img').src = winner.img;
    // Imagen ganador.
}
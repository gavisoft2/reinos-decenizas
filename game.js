```javascript
"use strict";

/* =========================================================
   ⚔️ REINOS DE CENIZA
   GAME.JS v0.7
   ========================================================= */

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

/* =========================================================
   CONFIGURACIÓN DEL MUNDO
   ========================================================= */

const WORLD_WIDTH = 5000;
const WORLD_HEIGHT = 5000;
const TILE = 64;

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

let dpr = Math.min(window.devicePixelRatio || 1, 2);

let camera = {
    x: 0,
    y: 0
};

let lastTime = performance.now();

/* =========================================================
   RESPAWN
   ========================================================= */

const respawnPoint = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2
};

/* =========================================================
   RESIZE
   ========================================================= */

function resizeCanvas() {

    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;

    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = screenWidth * dpr;
    canvas.height = screenHeight * dpr;

    canvas.style.width = screenWidth + "px";
    canvas.style.height = screenHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

/* =========================================================
   UTILIDADES
   ========================================================= */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function distance(a, b) {

    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

/* =========================================================
   PLAYER
   ========================================================= */

const player = {

    x: respawnPoint.x,
    y: respawnPoint.y,

    radius: 22,

    speed: 260,

    level: 1,

    xp: 0,

    xpNeeded: 100,

    hp: 100,
    maxHp: 100,

    mana: 50,
    maxMana: 50,

    damage: 25,

    attackRange: 90,

    attackCooldown: 0,

    attackDelay: 0.55,

    directionX: 0,
    directionY: 1,

    dead: false,

    respawnTimer: 0
};

/* =========================================================
   🛠️ HERRAMIENTAS EQUIPADAS
   ========================================================= */

const tools = {

    axe: {
        name: "Hacha",
        equipped: true
    },

    pickaxe: {
        name: "Pico",
        equipped: true
    },

    fishingRod: {
        name: "Caña de pescar",
        equipped: true
    }
};

/*
   Recursos que puede recoger cada herramienta
*/

const resourceTools = {

    tree: "axe",

    rock: "pickaxe",

    copper: "pickaxe",

    iron: "pickaxe"
};

/* =========================================================
   INVENTARIO
   ========================================================= */

const inventory = {

    gold: 0,

    wood: 0,

    stone: 0,

    copper: 0,

    iron: 0,

    fish: 0
};

/* =========================================================
   JOYSTICK
   ========================================================= */

const joystick = document.getElementById("joystick");
const joystickKnob = document.getElementById("joystickKnob");

let joystickActive = false;

let joystickX = 0;
let joystickY = 0;

const joystickRadius = 55;

function updateJoystick(clientX, clientY) {

    const rect = joystick.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const length =
        Math.sqrt(dx * dx + dy * dy);

    if (length > joystickRadius) {

        dx = dx / length * joystickRadius;
        dy = dy / length * joystickRadius;
    }

    joystickX = dx / joystickRadius;
    joystickY = dy / joystickRadius;

    joystickKnob.style.transform =
        `translate(${dx}px, ${dy}px)`;
}

function resetJoystick() {

    joystickActive = false;

    joystickX = 0;
    joystickY = 0;

    joystickKnob.style.transform =
        "translate(0px, 0px)";
}

/* Touch */

joystick.addEventListener("touchstart", e => {

    e.preventDefault();

    joystickActive = true;

    const touch = e.touches[0];

    updateJoystick(
        touch.clientX,
        touch.clientY
    );

}, { passive: false });

joystick.addEventListener("touchmove", e => {

    e.preventDefault();

    if (!joystickActive) return;

    const touch = e.touches[0];

    updateJoystick(
        touch.clientX,
        touch.clientY
    );

}, { passive: false });

joystick.addEventListener("touchend", e => {

    e.preventDefault();

    resetJoystick();

}, { passive: false });

joystick.addEventListener(
    "touchcancel",
    resetJoystick
);

/* Mouse */

joystick.addEventListener("mousedown", e => {

    joystickActive = true;

    updateJoystick(
        e.clientX,
        e.clientY
    );
});

window.addEventListener("mousemove", e => {

    if (!joystickActive) return;

    updateJoystick(
        e.clientX,
        e.clientY
    );
});

window.addEventListener(
    "mouseup",
    resetJoystick
);

/* =========================================================
   TECLADO
   ========================================================= */

const keys = {};

window.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

    if (e.key === " ") {

        e.preventDefault();

        attack();
    }
});

window.addEventListener("keyup", e => {

    keys[e.key.toLowerCase()] = false;
});

/* =========================================================
   MAPA
   ========================================================= */

const terrain = [];

const TILE_TYPES = {

    GRASS: 0,
    WATER: 1,
    SAND: 2,
    FOREST: 3,
    ROCK: 4
};

function generateTerrain() {

    terrain.length = 0;

    const columns =
        Math.floor(WORLD_WIDTH / TILE);

    const rows =
        Math.floor(WORLD_HEIGHT / TILE);

    for (let y = 0; y < rows; y++) {

        for (let x = 0; x < columns; x++) {

            let type = TILE_TYPES.GRASS;

            const nx = x / columns;
            const ny = y / rows;

            if (
                Math.sin(nx * 12) +
                Math.cos(ny * 9) < -1.65
            ) {

                type = TILE_TYPES.WATER;

            } else {

                const r = Math.random();

                if (r < 0.08) {
                    type = TILE_TYPES.FOREST;
                }
                else if (r < 0.12) {
                    type = TILE_TYPES.ROCK;
                }
                else if (r < 0.16) {
                    type = TILE_TYPES.SAND;
                }
            }

            terrain.push({
                x: x * TILE,
                y: y * TILE,
                type
            });
        }
    }
}

generateTerrain();

/* =========================================================
   RECURSOS
   ========================================================= */

const resources = [];

function createResource(type, x, y) {

    const maxHp =
        type === "tree" ? 3 : 2;

    resources.push({

        type,

        x,
        y,

        radius: 20,

        hp: maxHp,

        maxHp,

        respawnTimer: 0
    });
}

function generateResources() {

    resources.length = 0;

    for (let i = 0; i < 260; i++) {

        const x =
            random(100, WORLD_WIDTH - 100);

        const y =
            random(100, WORLD_HEIGHT - 100);

        const typeRoll = Math.random();

        let type;

        if (typeRoll < 0.45) {

            type = "tree";

        }
        else if (typeRoll < 0.70) {

            type = "rock";

        }
        else if (typeRoll < 0.85) {

            type = "copper";

        }
        else {

            type = "iron";
        }

        createResource(
            type,
            x,
            y
        );
    }
}

generateResources();

/* =========================================================
   ENEMIGOS
   ========================================================= */

const enemies = [];

const enemyTypes = {

    wolf: {

        name: "Lobo",

        hp: 70,

        damage: 12,

        speed: 110,

        radius: 23,

        xp: 30,

        gold: 5
    },

    boar: {

        name: "Jabalí",

        hp: 100,

        damage: 15,

        speed: 80,

        radius: 25,

        xp: 40,

        gold: 8
    },

    goblin: {

        name: "Goblin",

        hp: 130,

        damage: 20,

        speed: 65,

        radius: 25,

        xp: 60,

        gold: 15
    }
};

function spawnEnemy(type) {

    const data = enemyTypes[type];

    let x;
    let y;

    do {

        x =
            random(200, WORLD_WIDTH - 200);

        y =
            random(200, WORLD_HEIGHT - 200);

    } while (
        Math.abs(x - player.x) < 400 &&
        Math.abs(y - player.y) < 400
    );

    enemies.push({

        type,

        name: data.name,

        x,
        y,

        radius: data.radius,

        hp: data.hp,

        maxHp: data.hp,

        damage: data.damage,

        speed: data.speed,

        xp: data.xp,

        gold: data.gold,

        attackCooldown: random(0, 1),

        hitFlash: 0,

        dead: false
    });
}

function generateEnemies() {

    enemies.length = 0;

    for (let i = 0; i < 25; i++) {

        const r = Math.random();

        if (r < 0.45) {

            spawnEnemy("wolf");

        }
        else if (r < 0.75) {

            spawnEnemy("boar");

        }
        else {

            spawnEnemy("goblin");
        }
    }
}

generateEnemies();

/* =========================================================
   TEXTOS FLOTANTES
   ========================================================= */

const floatingTexts = [];

function floatingText(
    text,
    x,
    y,
    color = "#fff"
) {

    floatingTexts.push({

        text,

        x,

        y,

        life: 1,

        color
    });
}

/* =========================================================
   MENSAJES
   ========================================================= */

let messageTimer = 0;

function showMessage(text) {

    const element =
        document.getElementById("message");

    element.textContent = text;

    element.style.opacity = "1";

    messageTimer = 2;
}

/* =========================================================
   ⚔️ ATAQUE
   ========================================================= */

function attack() {

    if (player.dead) return;

    if (player.attackCooldown > 0) return;

    player.attackCooldown =
        player.attackDelay;

    let target = null;

    let nearest = Infinity;

    for (const enemy of enemies) {

        if (enemy.dead) continue;

        const d =
            distance(player, enemy);

        if (
            d <= player.attackRange &&
            d < nearest
        ) {

            nearest = d;

            target = enemy;
        }
    }

    if (!target) {

        floatingText(
            "¡Sin objetivo!",
            player.x,
            player.y - 45,
            "#ffff00"
        );

        return;
    }

    const damage =
        randomInt(
            Math.floor(player.damage * 0.8),
            Math.floor(player.damage * 1.2)
        );

    target.hp -= damage;

    target.hitFlash = 0.12;

    floatingText(
        "-" + damage,
        target.x,
        target.y - 35,
        "#ff5252"
    );

    if (target.hp <= 0) {

        target.dead = true;

        floatingText(
            "+" + target.xp + " XP",
            target.x,
            target.y - 60,
            "#64b5f6"
        );

        gainXP(target.xp);

        inventory.gold += target.gold;

        showMessage(
            `${target.name} derrotado +${target.gold} oro`
        );

        saveGame();
    }
}

/* =========================================================
   BOTÓN DE ATAQUE
   ========================================================= */

document
    .getElementById("attackButton")
    .addEventListener(
        "touchstart",
        e => {

            e.preventDefault();

            attack();

        },
        { passive: false }
    );

document
    .getElementById("attackButton")
    .addEventListener(
        "mousedown",
        e => {

            e.preventDefault();

            attack();
        }
    );

/* =========================================================
   ⭐ XP
   ========================================================= */

function gainXP(amount) {

    player.xp += amount;

    while (
        player.xp >= player.xpNeeded
    ) {

        player.xp -=
            player.xpNeeded;

        levelUp();
    }
}

function levelUp() {

    player.level++;

    player.xpNeeded =
        Math.floor(
            player.xpNeeded * 1.35
        );

    player.maxHp += 20;

    player.hp =
        player.maxHp;

    player.maxMana += 10;

    player.mana =
        player.maxMana;

    player.damage += 5;

    floatingText(
        "¡NIVEL " +
        player.level +
        "!",
        player.x,
        player.y - 70,
        "#ffd54f"
    );

    showMessage(
        "🎉 ¡Nivel " +
        player.level +
        "!"
    );

    saveGame();
}

/* =========================================================
   🕹️ MOVIMIENTO
   ========================================================= */

function updateMovement(dt) {

    if (player.dead) return;

    let moveX = joystickX;
    let moveY = joystickY;

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        moveY -= 1;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        moveY += 1;
    }

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        moveX -= 1;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        moveX += 1;
    }

    const length =
        Math.sqrt(
            moveX * moveX +
            moveY * moveY
        );

    if (length > 0) {

        moveX /= length;
        moveY /= length;

        player.directionX =
            moveX;

        player.directionY =
            moveY;

        player.x +=
            moveX *
            player.speed *
            dt;

        player.y +=
            moveY *
            player.speed *
            dt;
    }

    player.x =
        clamp(
            player.x,
            30,
            WORLD_WIDTH - 30
        );

    player.y =
        clamp(
            player.y,
            30,
            WORLD_HEIGHT - 30
        );
}

/* =========================================================
   👹 ENEMIGOS
   ========================================================= */

function updateEnemies(dt) {

    for (const enemy of enemies) {

        if (enemy.dead) continue;

        if (enemy.hitFlash > 0) {

            enemy.hitFlash -= dt;
        }

        enemy.attackCooldown -= dt;

        const dx =
            player.x - enemy.x;

        const dy =
            player.y - enemy.y;

        const d =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (d < 400) {

            if (d > 55) {

                enemy.x +=
                    dx / d *
                    enemy.speed *
                    dt;

                enemy.y +=
                    dy / d *
                    enemy.speed *
                    dt;
            }

            if (
                d <= 60 &&
                enemy.attackCooldown <= 0
            ) {

                enemy.attackCooldown =
                    1.2;

                const damage =
                    randomInt(
                        Math.floor(
                            enemy.damage * 0.8
                        ),
                        Math.floor(
                            enemy.damage * 1.2
                        )
                    );

                player.hp -= damage;

                floatingText(
                    "-" + damage,
                    player.x,
                    player.y - 40,
                    "#ff4444"
                );

                if (player.hp <= 0) {

                    die();
                }
            }
        }
    }

    let deadCount = 0;

    for (const enemy of enemies) {

        if (enemy.dead) {

            deadCount++;
        }
    }

    if (deadCount > 10) {

        for (
            let i = enemies.length - 1;
            i >= 0;
            i--
        ) {

            if (enemies[i].dead) {

                enemies.splice(i, 1);
            }
        }
    }

    while (
        enemies.length < 25
    ) {

        const r =
            Math.random();

        if (r < 0.45) {

            spawnEnemy("wolf");

        }
        else if (r < 0.75) {

            spawnEnemy("boar");

        }
        else {

            spawnEnemy("goblin");
        }
    }
}

/* =========================================================
   💀 MUERTE
   ========================================================= */

function die() {

    if (player.dead) return;

    player.hp = 0;

    player.mana = 0;

    player.dead = true;

    player.respawnTimer = 3;

    /*
       Guardamos inmediatamente una versión segura.
       Nunca se guarda el personaje muerto.
    */

    showMessage(
        "💀 Has muerto... revivirás en 3 segundos"
    );

    /*
       No guardamos hp 0.
       Esto evita que una recarga deje al jugador muerto.
    */
}

/* =========================================================
   ✨ RESPAWN
   ========================================================= */

function updateRespawn(dt) {

    if (!player.dead) return;

    player.respawnTimer -= dt;

    if (
        player.respawnTimer <= 0
    ) {

        respawnPlayer();
    }
}

function respawnPlayer() {

    player.dead = false;

    player.hp =
        player.maxHp;

    player.mana =
        player.maxMana;

    player.x =
        respawnPoint.x;

    player.y =
        respawnPoint.y;

    player.directionX = 0;
    player.directionY = 1;

    player.respawnTimer = 0;

    showMessage(
        "✨ Has vuelto a la vida"
    );

    saveGame();
}

/* =========================================================
   🪓⛏️ RECOLECCIÓN
   ========================================================= */

function gatherResource() {

    if (player.dead) return;

    let target = null;

    let nearest = 75;

    for (const resource of resources) {

        if (
            resource.hp <= 0
        ) continue;

        const d =
            distance(
                player,
                resource
            );

        if (d < nearest) {

            nearest = d;

            target = resource;
        }
    }

    if (!target) {

        floatingText(
            "Acércate a un recurso",
            player.x,
            player.y - 40,
            "#ffff00"
        );

        return;
    }

    /*
       Buscar la herramienta necesaria
    */

    const requiredTool =
        resourceTools[
            target.type
        ];

    /*
       Si el recurso necesita herramienta
       y no está equipada, no se puede recoger.
    */

    if (
        requiredTool &&
        !tools[requiredTool].equipped
    ) {

        floatingText(
            "Necesitas " +
            tools[requiredTool].name,
            target.x,
            target.y - 35,
            "#ffcc00"
        );

        showMessage(
            "🛠️ Necesitas equipar " +
            tools[requiredTool].name
        );

        return;
    }

    target.hp--;

    let text = "";

    switch (target.type) {

        case "tree":

            inventory.wood++;

            text =
                "+1 🌲 Madera";

            break;

        case "rock":

            inventory.stone++;

            text =
                "+1 🪨 Piedra";

            break;

        case "copper":

            inventory.copper++;

            text =
                "+1 🔩 Cobre";

            break;

        case "iron":

            inventory.iron++;

            text =
                "+1 ⚙️ Hierro";

            break;
    }

    floatingText(
        text,
        target.x,
        target.y - 30,
        "#fff"
    );

    /*
       Recurso agotado
    */

    if (target.hp <= 0) {

        target.hp = 0;

        target.respawnTimer =
            10;

        showMessage(
            "Recurso agotado. Volverá en 10 segundos."
        );
    }

    saveGame();
}

/* =========================================================
   🔄 REGENERACIÓN DE RECURSOS
   ========================================================= */

function updateResources(dt) {

    for (const resource of resources) {

        if (
            resource.hp > 0
        ) continue;

        resource.respawnTimer -= dt;

        if (
            resource.respawnTimer <= 0
        ) {

            resource.hp =
                resource.maxHp;

            resource.respawnTimer =
                0;
        }
    }
}

/* =========================================================
   DOBLE TOQUE PARA RECOGER
   ========================================================= */

canvas.addEventListener(
    "dblclick",
    gatherResource
);

let lastTap = 0;

canvas.addEventListener(
    "touchend",
    e => {

        const now =
            Date.now();

        if (
            now - lastTap < 300
        ) {

            gatherResource();
        }

        lastTap = now;
    }
);

/* =========================================================
   📷 CÁMARA
   ========================================================= */

function updateCamera() {

    camera.x =
        player.x -
        screenWidth / 2;

    camera.y =
        player.y -
        screenHeight / 2;

    camera.x =
        clamp(
            camera.x,
            0,
            WORLD_WIDTH - screenWidth
        );

    camera.y =
        clamp(
            camera.y,
            0,
            WORLD_HEIGHT - screenHeight
        );
}

/* =========================================================
   🌎 TERRENO
   ========================================================= */

function drawTerrain() {

    const startX =
        Math.floor(
            camera.x / TILE
        ) * TILE;

    const startY =
        Math.floor(
            camera.y / TILE
        ) * TILE;

    const endX =
        camera.x +
        screenWidth +
        TILE;

    const endY =
        camera.y +
        screenHeight +
        TILE;

    const columns =
        Math.floor(
            WORLD_WIDTH / TILE
        );

    for (
        let y = startY;
        y <= endY;
        y += TILE
    ) {

        for (
            let x = startX;
            x <= endX;
            x += TILE
        ) {

            if (
                x < 0 ||
                y < 0 ||
                x >= WORLD_WIDTH ||
                y >= WORLD_HEIGHT
            ) continue;

            const index =
                Math.floor(y / TILE) *
                columns +
                Math.floor(x / TILE);

            const tile =
                terrain[index];

            if (!tile) continue;

            const sx =
                x - camera.x;

            const sy =
                y - camera.y;

            switch (tile.type) {

                case TILE_TYPES.GRASS:

                    ctx.fillStyle =
                        "#3d6b3d";

                    break;

                case TILE_TYPES.WATER:

                    ctx.fillStyle =
                        "#286080";

                    break;

                case TILE_TYPES.SAND:

                    ctx.fillStyle =
                        "#b9a45c";

                    break;

                case TILE_TYPES.FOREST:

                    ctx.fillStyle =
                        "#315b35";

                    break;

                case TILE_TYPES.ROCK:

                    ctx.fillStyle =
                        "#555";

                    break;
            }

            ctx.fillRect(
                sx,
                sy,
                TILE + 1,
                TILE + 1
            );
        }
    }
}

/* =========================================================
   🌲 RECURSOS
   ========================================================= */

function drawResources() {

    for (const resource of resources) {

        if (
            resource.hp <= 0
        ) continue;

        const x =
            resource.x -
            camera.x;

        const y =
            resource.y -
            camera.y;

        if (
            x < -50 ||
            y < -50 ||
            x > screenWidth + 50 ||
            y > screenHeight + 50
        ) continue;

        if (
            resource.type === "tree"
        ) {

            ctx.fillStyle =
                "#68452a";

            ctx.fillRect(
                x - 7,
                y,
                14,
                30
            );

            ctx.fillStyle =
                "#174d28";

            ctx.beginPath();

            ctx.arc(
                x,
                y - 10,
                27,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
        else if (
            resource.type === "rock"
        ) {

            ctx.fillStyle =
                "#888";

            ctx.beginPath();

            ctx.moveTo(
                x - 20,
                y + 12
            );

            ctx.lineTo(
                x - 12,
                y - 14
            );

            ctx.lineTo(
                x + 12,
                y - 20
            );

            ctx.lineTo(
                x + 23,
                y + 8
            );

            ctx.lineTo(
                x + 8,
                y + 20
            );

            ctx.closePath();

            ctx.fill();

        }
        else if (
            resource.type === "copper"
        ) {

            ctx.fillStyle =
                "#b86f3d";

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                18,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle =
                "#e6a06a";

            ctx.beginPath();

            ctx.arc(
                x - 5,
                y - 5,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
        else if (
            resource.type === "iron"
        ) {

            ctx.fillStyle =
                "#555";

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                19,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle =
                "#bbb";

            ctx.beginPath();

            ctx.arc(
                x - 6,
                y - 5,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }
}

/* =========================================================
   👹 DIBUJAR ENEMIGOS
   ========================================================= */

function drawEnemies() {

    for (const enemy of enemies) {

        if (enemy.dead) continue;

        const x =
            enemy.x -
            camera.x;

        const y =
            enemy.y -
            camera.y;

        if (
            x < -60 ||
            y < -60 ||
            x > screenWidth + 60 ||
            y > screenHeight + 60
        ) continue;

        ctx.fillStyle =
            "rgba(0,0,0,.3)";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y + 20,
            enemy.radius,
            8,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        if (
            enemy.hitFlash > 0
        ) {

            ctx.fillStyle =
                "#fff";

        }
        else if (
            enemy.type === "wolf"
        ) {

            ctx.fillStyle =
                "#777";

        }
        else if (
            enemy.type === "boar"
        ) {

            ctx.fillStyle =
                "#70452c";

        }
        else {

            ctx.fillStyle =
                "#529447";
        }

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            enemy.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#111";

        ctx.beginPath();

        ctx.arc(
            x - 7,
            y - 5,
            3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 7,
            y - 5,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        const barWidth = 45;

        const hpPercent =
            enemy.hp /
            enemy.maxHp;

        ctx.fillStyle =
            "#222";

        ctx.fillRect(
            x - barWidth / 2,
            y - enemy.radius - 12,
            barWidth,
            5
        );

        ctx.fillStyle =
            "#e53935";

        ctx.fillRect(
            x - barWidth / 2,
            y - enemy.radius - 12,
            barWidth * hpPercent,
            5
        );

        ctx.font =
            "11px Arial";

        ctx.textAlign =
            "center";

        ctx.fillStyle =
            "#fff";

        ctx.fillText(
            enemy.name,
            x,
            y - enemy.radius - 17
        );
    }
}

/* =========================================================
   👤 DIBUJAR PLAYER
   ========================================================= */

function drawPlayer() {

    const x =
        player.x -
        camera.x;

    const y =
        player.y -
        camera.y;

    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.beginPath();

    ctx.ellipse(
        x,
        y + 20,
        24,
        9,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    if (player.dead) {

        ctx.globalAlpha =
            0.45;
    }

    ctx.fillStyle =
        "#263238";

    ctx.beginPath();

    ctx.arc(
        x,
        y + 7,
        23,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#795548";

    ctx.fillRect(
        x - 14,
        y - 8,
        28,
        30
    );

    ctx.fillStyle =
        "#d6a77a";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 16,
        15,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#37474f";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 19,
        16,
        Math.PI,
        0
    );

    ctx.fill();

    ctx.fillStyle =
        "#111";

    ctx.beginPath();

    ctx.arc(
        x - 5,
        y - 16,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 5,
        y - 16,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* espada */

    ctx.save();

    ctx.translate(
        x,
        y
    );

    const angle =
        Math.atan2(
            player.directionY,
            player.directionX
        );

    ctx.rotate(angle);

    ctx.fillStyle =
        "#ddd";

    ctx.fillRect(
        15,
        -3,
        32,
        6
    );

    ctx.fillStyle =
        "#795548";

    ctx.fillRect(
        8,
        -3,
        10,
        6
    );

    ctx.restore();

    ctx.globalAlpha = 1;

    ctx.font =
        "bold 12px Arial";

    ctx.textAlign =
        "center";

    ctx.fillStyle =
        "#fff";

    ctx.fillText(
        "Aventurero",
        x,
        y - 43
    );

    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        x - 25,
        y - 38,
        50,
        5
    );

    ctx.fillStyle =
        "#e53935";

    ctx.fillRect(
        x - 25,
        y - 38,
        50 *
        clamp(
            player.hp /
            player.maxHp,
            0,
            1
        ),
        5
    );
}

/* =========================================================
   💬 TEXTOS
   ========================================================= */

function updateFloatingTexts(dt) {

    for (
        let i = floatingTexts.length - 1;
        i >= 0;
        i--
    ) {

        const effect =
            floatingTexts[i];

        effect.life -= dt;

        effect.y -=
            30 * dt;

        if (
            effect.life <= 0
        ) {

            floatingTexts.splice(
                i,
                1
            );
        }
    }
}

function drawFloatingTexts() {

    ctx.textAlign =
        "center";

    ctx.font =
        "bold 14px Arial";

    for (
        const effect of floatingTexts
    ) {

        ctx.globalAlpha =
            clamp(
                effect.life,
                0,
                1
            );

        ctx.fillStyle =
            effect.color;

        ctx.fillText(
            effect.text,
            effect.x - camera.x,
            effect.y - camera.y
        );
    }

    ctx.globalAlpha = 1;
}

/* =========================================================
   HUD
   ========================================================= */

function updateHUD() {

    const hpBar =
        document.getElementById(
            "hpBar"
        );

    const xpBar =
        document.getElementById(
            "xpBar"
        );

    const hudText =
        document.getElementById(
            "hudText"
        );

    hpBar.style.width =
        `${clamp(
            player.hp /
            player.maxHp *
            100,
            0,
            100
        )}%`;

    xpBar.style.width =
        `${clamp(
            player.xp /
            player.xpNeeded *
            100,
            0,
            100
        )}%`;

    hudText.textContent =
        `Nivel ${player.level} · ❤️ ${Math.ceil(player.hp)}/${player.maxHp} · ⭐ ${player.xp}/${player.xpNeeded}`;

    document.getElementById(
        "gold"
    ).textContent =
        inventory.gold;

    document.getElementById(
        "wood"
    ).textContent =
        inventory.wood;

    document.getElementById(
        "stone"
    ).textContent =
        inventory.stone;

    document.getElementById(
        "copper"
    ).textContent =
        inventory.copper;

    document.getElementById(
        "iron"
    ).textContent =
        inventory.iron;

    document.getElementById(
        "fish"
    ).textContent =
        inventory.fish;
}

/* =========================================================
   💾 GUARDADO SEGURO
   ========================================================= */

function saveGame() {

    /*
       MUY IMPORTANTE:

       Si el jugador está muerto o tiene 0 HP,
       NO guardamos esos valores.

       Así una recarga nunca deja al personaje
       muerto con 0 de vida.
    */

    if (
        player.dead ||
        player.hp <= 0
    ) {

        return;
    }

    const data = {

        player: {

            x: player.x,

            y: player.y,

            level: player.level,

            xp: player.xp,

            xpNeeded:
                player.xpNeeded,

            hp: player.hp,

            maxHp:
                player.maxHp,

            mana:
                player.mana,

            maxMana:
                player.maxMana,

            damage:
                player.damage
        },

        inventory: {

            gold:
                inventory.gold,

            wood:
                inventory.wood,

            stone:
                inventory.stone,

            copper:
                inventory.copper,

            iron:
                inventory.iron,

            fish:
                inventory.fish
        }
    };

    try {

        localStorage.setItem(
            "reinosDeCenizaSave",
            JSON.stringify(data)
        );

    } catch (error) {

        console.log(
            "No se pudo guardar",
            error
        );
    }
}

/* =========================================================
   📂 CARGAR PARTIDA
   ========================================================= */

function loadGame() {

    try {

        const saved =
            localStorage.getItem(
                "reinosDeCenizaSave"
            );

        if (!saved) return;

        const data =
            JSON.parse(saved);

        if (data.player) {

            Object.assign(
                player,
                data.player
            );
        }

        if (data.inventory) {

            Object.assign(
                inventory,
                data.inventory
            );
        }

        /*
           SEGURIDAD EXTRA:

           Si por alguna razón una partida vieja
           tiene 0 HP, la recuperamos.
        */

        if (
            !Number.isFinite(player.hp) ||
            player.hp <= 0
        ) {

            player.hp =
                player.maxHp;
        }

        if (
            !Number.isFinite(player.mana) ||
            player.mana <= 0
        ) {

            player.mana =
                player.maxMana;
        }

        player.dead = false;

        player.respawnTimer = 0;

    } catch (error) {

        console.log(
            "Error cargando partida",
            error
        );

        /*
           Si el guardado está corrupto,
           empezamos con una partida segura.
        */

        player.x =
            respawnPoint.x;

        player.y =
            respawnPoint.y;

        player.hp =
            player.maxHp;

        player.mana =
            player.maxMana;

        player.dead = false;
    }
}

loadGame();

/* =========================================================
   MENSAJES
   ========================================================= */

function updateMessage(dt) {

    if (
        messageTimer <= 0
    ) return;

    messageTimer -= dt;

    if (
        messageTimer <= 0
    ) {

        document.getElementById(
            "message"
        ).style.opacity = "0";
    }
}

/* =========================================================
   UPDATE
   ========================================================= */

function update(dt) {

    if (
        player.attackCooldown > 0
    ) {

        player.attackCooldown -= dt;
    }

    updateMovement(dt);

    updateEnemies(dt);

    updateRespawn(dt);

    updateResources(dt);

    updateFloatingTexts(dt);

    updateCamera();

    updateMessage(dt);

    updateHUD();
}

/* =========================================================
   DRAW
   ========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        screenWidth,
        screenHeight
    );

    drawTerrain();

    drawResources();

    drawEnemies();

    drawPlayer();

    drawFloatingTexts();
}

/* =========================================================
   GAME LOOP
   ========================================================= */

function gameLoop(now) {

    let dt =
        (now - lastTime) /
        1000;

    lastTime = now;

    /*
       Evitar saltos grandes cuando
       el navegador se pausa.
    */

    dt =
        Math.min(
            dt,
            0.05
        );

    update(dt);

    draw();

    requestAnimationFrame(
        gameLoop
    );
}

/* =========================================================
   AUTOGUARDADO
   ========================================================= */

setInterval(() => {

    saveGame();

}, 10000);

/* =========================================================
   INICIO
   ========================================================= */

updateCamera();

updateHUD();

showMessage(
    "⚔️ Bienvenido a Reinos de Ceniza"
);

requestAnimationFrame(
    gameLoop
);
```

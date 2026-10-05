"use strict";

/* =========================================================
   ⚔️ REINOS DE CENIZA
   GAME.JS - VERSIÓN LIMPIA
   ========================================================= */

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const WORLD_WIDTH = 5000;
const WORLD_HEIGHT = 5000;
const TILE = 64;

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

const camera = {
    x: 0,
    y: 0
};

const respawnPoint = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2
};

/* =========================================================
   UTILIDADES
   ========================================================= */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);
}

/* =========================================================
   CANVAS
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
   JUGADOR
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

    attackRange: 100,

    attackCooldown: 0,
    attackDelay: 0.55,

    directionX: 0,
    directionY: 1,

    dead: false,
    respawnTimer: 0
};

/* =========================================================
   HERRAMIENTAS
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

    const length = Math.sqrt(
        dx * dx +
        dy * dy
    );

    if (length > joystickRadius) {

        dx =
            dx /
            length *
            joystickRadius;

        dy =
            dy /
            length *
            joystickRadius;
    }

    joystickX =
        dx /
        joystickRadius;

    joystickY =
        dy /
        joystickRadius;

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

/* =========================================================
   TOUCH JOYSTICK
   ========================================================= */

joystick.addEventListener(
    "touchstart",
    function(e) {

        e.preventDefault();

        joystickActive = true;

        const touch = e.touches[0];

        updateJoystick(
            touch.clientX,
            touch.clientY
        );

    },
    {
        passive: false
    }
);

joystick.addEventListener(
    "touchmove",
    function(e) {

        e.preventDefault();

        if (!joystickActive) return;

        const touch = e.touches[0];

        updateJoystick(
            touch.clientX,
            touch.clientY
        );

    },
    {
        passive: false
    }
);

joystick.addEventListener(
    "touchend",
    function(e) {

        e.preventDefault();

        resetJoystick();

    },
    {
        passive: false
    }
);

joystick.addEventListener(
    "touchcancel",
    resetJoystick
);

/* =========================================================
   MOUSE JOYSTICK
   ========================================================= */

joystick.addEventListener(
    "mousedown",
    function(e) {

        joystickActive = true;

        updateJoystick(
            e.clientX,
            e.clientY
        );
    }
);

window.addEventListener(
    "mousemove",
    function(e) {

        if (!joystickActive) return;

        updateJoystick(
            e.clientX,
            e.clientY
        );
    }
);

window.addEventListener(
    "mouseup",
    resetJoystick
);

/* =========================================================
   TECLADO
   ========================================================= */

const keys = {};

window.addEventListener(
    "keydown",
    function(e) {

        keys[e.key.toLowerCase()] = true;

        if (e.key === " ") {

            e.preventDefault();

            attack();
        }
    }
);

window.addEventListener(
    "keyup",
    function(e) {

        keys[e.key.toLowerCase()] = false;
    }
);

/* =========================================================
   TERRENO
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
        Math.ceil(WORLD_WIDTH / TILE);

    const rows =
        Math.ceil(WORLD_HEIGHT / TILE);

    for (let y = 0; y < rows; y++) {

        for (let x = 0; x < columns; x++) {

            let type =
                TILE_TYPES.GRASS;

            const nx =
                x / columns;

            const ny =
                y / rows;

            const noise =
                Math.sin(nx * 12) +
                Math.cos(ny * 9);

            if (noise < -1.65) {

                type =
                    TILE_TYPES.WATER;

            } else {

                const r =
                    Math.random();

                if (r < 0.08) {

                    type =
                        TILE_TYPES.FOREST;

                } else if (r < 0.12) {

                    type =
                        TILE_TYPES.ROCK;

                } else if (r < 0.16) {

                    type =
                        TILE_TYPES.SAND;
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
        type === "tree"
            ? 3
            : 2;

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
            random(
                100,
                WORLD_WIDTH - 100
            );

        const y =
            random(
                100,
                WORLD_HEIGHT - 100
            );

        const roll =
            Math.random();

        let type;

        if (roll < 0.45) {

            type = "tree";

        } else if (roll < 0.70) {

            type = "rock";

        } else if (roll < 0.85) {

            type = "copper";

        } else {

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

    const data =
        enemyTypes[type];

    let x;
    let y;

    let attempts = 0;

    do {

        x =
            random(
                200,
                WORLD_WIDTH - 200
            );

        y =
            random(
                200,
                WORLD_HEIGHT - 200
            );

        attempts++;

        if (attempts > 100) break;

    } while (
        Math.abs(x - player.x) < 500 &&
        Math.abs(y - player.y) < 500
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

        attackCooldown:
            random(0, 1),

        hitFlash: 0,

        dead: false
    });
}

function generateEnemies() {

    enemies.length = 0;

    for (let i = 0; i < 25; i++) {

        const r =
            Math.random();

        if (r < 0.45) {

            spawnEnemy("wolf");

        } else if (r < 0.75) {

            spawnEnemy("boar");

        } else {

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
        document.getElementById(
            "message"
        );

    if (!element) return;

    element.textContent = text;

    element.style.opacity = "1";

    messageTimer = 2;
}

/* =========================================================
   ATAQUE
   ========================================================= */

function attack() {

    if (player.dead) return;

    if (player.attackCooldown > 0) return;

    player.attackCooldown =
        player.attackDelay;

    let target = null;

    let nearest =
        player.attackRange;

    for (const enemy of enemies) {

        if (enemy.dead) continue;

        const d =
            distance(
                player,
                enemy
            );

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
            Math.floor(
                player.damage * 0.8
            ),
            Math.floor(
                player.damage * 1.2
            )
        );

    target.hp -= damage;

    target.hitFlash =
        0.15;

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

        gainXP(
            target.xp
        );

        inventory.gold +=
            target.gold;

        showMessage(
            `${target.name} derrotado +${target.gold} oro`
        );

        saveGame();
    }
}

/* =========================================================
   BOTÓN ATAQUE
   ========================================================= */

const attackButton =
    document.getElementById(
        "attackButton"
    );

if (attackButton) {

    attackButton.addEventListener(
        "touchstart",
        function(e) {

            e.preventDefault();

            attack();

        },
        {
            passive: false
        }
    );

    attackButton.addEventListener(
        "mousedown",
        function(e) {

            e.preventDefault();

            attack();
        }
    );
}

/* =========================================================
   EXPERIENCIA
   ========================================================= */

function gainXP(amount) {

    player.xp += amount;

    while (
        player.xp >=
        player.xpNeeded
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
   MOVIMIENTO
   ========================================================= */

function updateMovement(dt) {

    if (player.dead) return;

    let moveX =
        joystickX;

    let moveY =
        joystickY;

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
   ENEMIGOS
   ========================================================= */

function updateEnemies(dt) {

    for (const enemy of enemies) {

        if (enemy.dead) continue;

        if (enemy.hitFlash > 0) {

            enemy.hitFlash -= dt;
        }

        enemy.attackCooldown -= dt;

        if (player.dead) continue;

        const dx =
            player.x -
            enemy.x;

        const dy =
            player.y -
            enemy.y;

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

                player.hp -=
                    damage;

                floatingText(
                    "-" + damage,
                    player.x,
                    player.y - 40,
                    "#ff4444"
                );

                if (
                    player.hp <= 0
                ) {

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
            let i =
                enemies.length - 1;
            i >= 0;
            i--
        ) {

            if (
                enemies[i].dead
            ) {

                enemies.splice(
                    i,
                    1
                );
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

        } else if (r < 0.75) {

            spawnEnemy("boar");

        } else {

            spawnEnemy("goblin");
        }
    }
}

/* =========================================================
   MUERTE
   ========================================================= */

function die() {

    if (player.dead) return;

    player.hp = 0;

    player.mana = 0;

    player.dead = true;

    player.respawnTimer = 3;

    showMessage(
        "💀 Has muerto... revives en 3 segundos"
    );
}

/* =========================================================
   RESPAWN
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
   RECOLECCIÓN
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

        if (
            d <= nearest
        ) {

            nearest = d;

            target = resource;
        }
    }

    if (!target) {

        showMessage(
            "No hay recursos cerca"
        );

        return;
    }

    const requiredTool =
        resourceTools[
            target.type
        ];

    if (
        !requiredTool ||
        !tools[
            requiredTool
        ].equipped
    ) {

        showMessage(
            "❌ Necesitas: " +
            tools[
                requiredTool
            ].name
        );

        return;
    }

    target.hp--;

    let amount = 1;

    if (
        target.hp <= 0
    ) {

        target.respawnTimer =
            random(
                20,
                40
            );

        if (
            target.type ===
            "tree"
        ) {

            amount =
                randomInt(2, 5);

            inventory.wood +=
                amount;

            showMessage(
                "🌲 +" +
                amount +
                " madera"
            );

        } else if (
            target.type ===
            "rock"
        ) {

            amount =
                randomInt(2, 4);

            inventory.stone +=
                amount;

            showMessage(
                "🪨 +" +
                amount +
                " piedra"
            );

        } else if (
            target.type ===
            "copper"
        ) {

            amount =
                randomInt(1, 3);

            inventory.copper +=
                amount;

            showMessage(
                "🟠 +" +
                amount +
                " cobre"
            );

        } else if (
            target.type ===
            "iron"
        ) {

            amount =
                randomInt(1, 3);

            inventory.iron +=
                amount;

            showMessage(
                "⚙️ +" +
                amount +
                " hierro"
            );
        }

        saveGame();
    } else {

        showMessage(
            "⛏️ Golpe al recurso"
        );
    }
}

/* =========================================================
   DOBLE TOQUE PARA RECOLECTAR
   ========================================================= */

let lastTap = 0;

canvas.addEventListener(
    "touchend",
    function(e) {

        const now =
            Date.now();

        if (
            now - lastTap <
            350
        ) {

            gatherResource();
        }

        lastTap = now;
    },
    {
        passive: true
    }
);

/* =========================================================
   RECURSOS: RESPAWN
   ========================================================= */

function updateResources(dt) {

    for (const resource of resources) {

        if (
            resource.hp <= 0
        ) {

            resource.respawnTimer -= dt;

            if (
                resource.respawnTimer <= 0
            ) {

                resource.hp =
                    resource.maxHp;
            }
        }
    }
}

/* =========================================================
   GUARDADO
   ========================================================= */

function saveGame() {

    if (
        player.dead ||
        player.hp <= 0
    ) {

        return;
    }

    const save = {

        player: {

            x: player.x,
            y: player.y,

            level: player.level,

            xp: player.xp,
            xpNeeded: player.xpNeeded,

            hp: player.hp,
            maxHp: player.maxHp,

            mana: player.mana,
            maxMana: player.maxMana,

            damage: player.damage
        },

        inventory: {
            ...inventory
        },

        tools: {

            axe:
                tools.axe.equipped,

            pickaxe:
                tools.pickaxe.equipped,

            fishingRod:
                tools.fishingRod.equipped
        }
    };

    try {

        localStorage.setItem(
            "reinosDeCenizaSave",
            JSON.stringify(save)
        );

    } catch (error) {

        console.warn(
            "No se pudo guardar:",
            error
        );
    }
}

/* =========================================================
   CARGAR PARTIDA
   ========================================================= */

function loadGame() {

    try {

        const raw =
            localStorage.getItem(
                "reinosDeCenizaSave"
            );

        if (!raw) return;

        const save =
            JSON.parse(raw);

        if (save.player) {

            player.x =
                Number.isFinite(
                    save.player.x
                )
                    ? save.player.x
                    : respawnPoint.x;

            player.y =
                Number.isFinite(
                    save.player.y
                )
                    ? save.player.y
                    : respawnPoint.y;

            player.level =
                save.player.level || 1;

            player.xp =
                save.player.xp || 0;

            player.xpNeeded =
                save.player.xpNeeded || 100;

            player.maxHp =
                save.player.maxHp || 100;

            player.maxMana =
                save.player.maxMana || 50;

            player.damage =
                save.player.damage || 25;

            /*
             * Si una versión anterior
             * guardó al jugador muerto,
             * lo reparamos automáticamente.
             */

            if (
                !save.player.hp ||
                save.player.hp <= 0
            ) {

                player.hp =
                    player.maxHp;

                player.mana =
                    player.maxMana;

                player.x =
                    respawnPoint.x;

                player.y =
                    respawnPoint.y;

            } else {

                player.hp =
                    clamp(
                        save.player.hp,
                        1,
                        player.maxHp
                    );

                player.mana =
                    clamp(
                        save.player.mana || 0,
                        0,
                        player.maxMana
                    );
            }
        }

        if (save.inventory) {

            inventory.gold =
                save.inventory.gold || 0;

            inventory.wood =
                save.inventory.wood || 0;

            inventory.stone =
                save.inventory.stone || 0;

            inventory.copper =
                save.inventory.copper || 0;

            inventory.iron =
                save.inventory.iron || 0;

            inventory.fish =
                save.inventory.fish || 0;
        }

        if (save.tools) {

            if (
                typeof save.tools.axe ===
                "boolean"
            ) {

                tools.axe.equipped =
                    save.tools.axe;
            }

            if (
                typeof save.tools.pickaxe ===
                "boolean"
            ) {

                tools.pickaxe.equipped =
                    save.tools.pickaxe;
            }

            if (
                typeof save.tools.fishingRod ===
                "boolean"
            ) {

                tools.fishingRod.equipped =
                    save.tools.fishingRod;
            }
        }

        player.dead = false;
        player.respawnTimer = 0;

    } catch (error) {

        console.warn(
            "Partida dañada. Se iniciará una nueva.",
            error
        );
    }
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

    const gold =
        document.getElementById(
            "gold"
        );

    const wood =
        document.getElementById(
            "wood"
        );

    const stone =
        document.getElementById(
            "stone"
        );

    const copper =
        document.getElementById(
            "copper"
        );

    const iron =
        document.getElementById(
            "iron"
        );

    const fish =
        document.getElementById(
            "fish"
        );

    if (hpBar) {

        hpBar.style.width =
            (
                player.hp /
                player.maxHp *
                100
            ) + "%";
    }

    if (xpBar) {

        xpBar.style.width =
            (
                player.xp /
                player.xpNeeded *
                100
            ) + "%";
    }

    if (hudText) {

        if (player.dead) {

            hudText.textContent =
                "💀 Muerto - " +
                Math.ceil(
                    player.respawnTimer
                ) +
                "s";

        } else {

            hudText.textContent =
                "Nivel " +
                player.level +
                " | HP " +
                Math.ceil(player.hp) +
                "/" +
                player.maxHp;
        }
    }

    if (gold)
        gold.textContent =
            inventory.gold;

    if (wood)
        wood.textContent =
            inventory.wood;

    if (stone)
        stone.textContent =
            inventory.stone;

    if (copper)
        copper.textContent =
            inventory.copper;

    if (iron)
        iron.textContent =
            inventory.iron;

    if (fish)
        fish.textContent =
            inventory.fish;
}

/* =========================================================
   MENSAJE
   ========================================================= */

function updateMessage(dt) {

    if (messageTimer <= 0) return;

    messageTimer -= dt;

    if (
        messageTimer <= 0
    ) {

        const element =
            document.getElementById(
                "message"
            );

        if (element) {

            element.style.opacity =
                "0";
        }
    }
}

/* =========================================================
   CÁMARA
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
            Math.max(
                0,
                WORLD_WIDTH -
                screenWidth
            )
        );

    camera.y =
        clamp(
            camera.y,
            0,
            Math.max(
                0,
                WORLD_HEIGHT -
                screenHeight
            )
        );
}

/* =========================================================
   DIBUJAR TERRENO
   ========================================================= */

function drawTerrain() {

    const startX =
        Math.max(
            0,
            Math.floor(
                camera.x / TILE
            ) - 1
        );

    const endX =
        Math.min(
            Math.ceil(
                WORLD_WIDTH / TILE
            ),
            Math.ceil(
                (
                    camera.x +
                    screenWidth
                ) / TILE
            ) + 1
        );

    const startY =
        Math.max(
            0,
            Math.floor(
                camera.y / TILE
            ) - 1
        );

    const endY =
        Math.min(
            Math.ceil(
                WORLD_HEIGHT / TILE
            ),
            Math.ceil(
                (
                    camera.y +
                    screenHeight
                ) / TILE
            ) + 1
        );

    for (
        let y = startY;
        y < endY;
        y++
    ) {

        for (
            let x = startX;
            x < endX;
            x++
        ) {

            const index =
                y *
                Math.ceil(
                    WORLD_WIDTH / TILE
                ) +
                x;

            const tile =
                terrain[index];

            if (!tile) continue;

            const sx =
                tile.x -
                camera.x;

            const sy =
                tile.y -
                camera.y;

            if (
                tile.type ===
                TILE_TYPES.GRASS
            ) {

                ctx.fillStyle =
                    "#39733b";

            } else if (
                tile.type ===
                TILE_TYPES.WATER
            ) {

                ctx.fillStyle =
                    "#236b91";

            } else if (
                tile.type ===
                TILE_TYPES.SAND
            ) {

                ctx.fillStyle =
                    "#b89b58";

            } else if (
                tile.type ===
                TILE_TYPES.FOREST
            ) {

                ctx.fillStyle =
                    "#28552d";

            } else {

                ctx.fillStyle =
                    "#555";
            }

            ctx.fillRect(
                sx,
                sy,
                TILE + 1,
                TILE + 1
            );

            /*
             * Detalles ligeros del terreno
             */

            if (
                tile.type ===
                TILE_TYPES.GRASS
            ) {

                ctx.fillStyle =
                    "rgba(255,255,255,.025)";

                ctx.fillRect(
                    sx,
                    sy,
                    TILE,
                    2
                );
            }
        }
    }
}

/* =========================================================
   DIBUJAR RECURSOS
   ========================================================= */

function drawResource(resource) {

    if (
        resource.hp <= 0
    ) return;

    const sx =
        resource.x -
        camera.x;

    const sy =
        resource.y -
        camera.y;

    if (
        sx < -60 ||
        sy < -60 ||
        sx > screenWidth + 60 ||
        sy > screenHeight + 60
    ) {

        return;
    }

    ctx.save();

    if (
        resource.type ===
        "tree"
    ) {

        /* Tronco */

        ctx.fillStyle =
            "#70452a";

        ctx.fillRect(
            sx - 7,
            sy,
            14,
            30
        );

        /* Copa */

        ctx.fillStyle =
            "#185c28";

        ctx.beginPath();

        ctx.arc(
            sx,
            sy - 12,
            25,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#287b36";

        ctx.beginPath();

        ctx.arc(
            sx - 9,
            sy - 18,
            15,
            0,
            Math.PI * 2
        );

        ctx.fill();

    } else if (
        resource.type ===
        "rock"
    ) {

        ctx.fillStyle =
            "#777";

        ctx.beginPath();

        ctx.moveTo(
            sx - 23,
            sy + 15
        );

        ctx.lineTo(
            sx - 15,
            sy - 12
        );

        ctx.lineTo(
            sx + 8,
            sy - 20
        );

        ctx.lineTo(
            sx + 24,
            sy + 5
        );

        ctx.lineTo(
            sx + 10,
            sy + 20
        );

        ctx.closePath();

        ctx.fill();

    } else if (
        resource.type ===
        "copper"
    ) {

        ctx.fillStyle =
            "#b76532";

        ctx.beginPath();

        ctx.arc(
            sx,
            sy,
            20,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#e49a55";

        ctx.beginPath();

        ctx.arc(
            sx - 6,
            sy - 6,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();

    } else if (
        resource.type ===
        "iron"
    ) {

        ctx.fillStyle =
            "#42484d";

        ctx.beginPath();

        ctx.arc(
            sx,
            sy,
            21,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#8e969c";

        ctx.beginPath();

        ctx.arc(
            sx - 6,
            sy - 6,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.restore();
}

/* =========================================================
   DIBUJAR ENEMIGO
   ========================================================= */

function drawEnemy(enemy) {

    if (enemy.dead) return;

    const sx =
        enemy.x -
        camera.x;

    const sy =
        enemy.y -
        camera.y;

    if (
        sx < -70 ||
        sy < -70 ||
        sx > screenWidth + 70 ||
        sy > screenHeight + 70
    ) {

        return;
    }

    ctx.save();

    if (
        enemy.hitFlash > 0
    ) {

        ctx.globalAlpha = 0.55;
    }

    if (
        enemy.type ===
        "wolf"
    ) {

        ctx.fillStyle =
            "#6d747b";

    } else if (
        enemy.type ===
        "boar"
    ) {

        ctx.fillStyle =
            "#7b4a2e";

    } else {

        ctx.fillStyle =
            "#4f8f45";
    }

    ctx.beginPath();

    ctx.arc(
        sx,
        sy,
        enemy.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
     * Ojos
     */

    ctx.fillStyle =
        "#fff";

    ctx.beginPath();

    ctx.arc(
        sx - 7,
        sy - 5,
        4,
        0,
        Math.PI * 2
    );

    ctx.arc(
        sx + 7,
        sy - 5,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#111";

    ctx.beginPath();

    ctx.arc(
        sx - 7,
        sy - 5,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        sx + 7,
        sy - 5,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
     * Barra de vida
     */

    const barWidth = 50;
    const barHeight = 6;

    ctx.fillStyle =
        "rgba(0,0,0,.7)";

    ctx.fillRect(
        sx - barWidth / 2,
        sy - enemy.radius - 13,
        barWidth,
        barHeight
    );

    ctx.fillStyle =
        "#e53935";

    ctx.fillRect(
        sx - barWidth / 2,
        sy - enemy.radius - 13,
        barWidth *
        Math.max(
            0,
            enemy.hp /
            enemy.maxHp
        ),
        barHeight
    );

    ctx.restore();
}

/* =========================================================
   DIBUJAR JUGADOR
   ========================================================= */

function drawPlayer() {

    const sx =
        player.x -
        camera.x;

    const sy =
        player.y -
        camera.y;

    ctx.save();

    /*
     * Sombra
     */

    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.beginPath();

    ctx.ellipse(
        sx,
        sy + 20,
        24,
        9,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    if (
        player.dead
    ) {

        ctx.globalAlpha =
            0.55;
    }

    /*
     * Cuerpo
     */

    ctx.fillStyle =
        "#2464c0";

    ctx.beginPath();

    ctx.arc(
        sx,
        sy,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
     * Armadura
     */

    ctx.fillStyle =
        "#9aa4ad";

    ctx.beginPath();

    ctx.arc(
        sx,
        sy - 7,
        13,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
     * Visor
     */

    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        sx - 11,
        sy - 9,
        22,
        7
    );

    /*
     * Dirección
     */

    ctx.strokeStyle =
        "#fff";

    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(
        sx,
        sy
    );

    ctx.lineTo(
        sx +
        player.directionX *
        26,
        sy +
        player.directionY *
        26
    );

    ctx.stroke();

    /*
     * Nombre
     */

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 12px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "Aventurero",
        sx,
        sy - 38
    );

    ctx.restore();
}

/* =========================================================
   DIBUJAR TEXTOS FLOTANTES
   ========================================================= */

function drawFloatingTexts(dt) {

    for (
        let i =
            floatingTexts.length - 1;
        i >= 0;
        i--
    ) {

        const text =
            floatingTexts[i];

        text.life -= dt;

        text.y -=
            35 * dt;

        if (
            text.life <= 0
        ) {

            floatingTexts.splice(
                i,
                1
            );

            continue;
        }

        const sx =
            text.x -
            camera.x;

        const sy =
            text.y -
            camera.y;

        ctx.save();

        ctx.globalAlpha =
            Math.max(
                0,
                text.life
            );

        ctx.fillStyle =
            text.color;

        ctx.font =
            "bold 16px Arial";

        ctx.textAlign =
            "center";

        ctx.strokeStyle =
            "#000";

        ctx.lineWidth = 3;

        ctx.strokeText(
            text.text,
            sx,
            sy
        );

        ctx.fillText(
            text.text,
            sx,
            sy
        );

        ctx.restore();
    }
}

/* =========================================================
   DIBUJAR TODO
   ========================================================= */

function render(dt) {

    ctx.clearRect(
        0,
        0,
        screenWidth,
        screenHeight
    );

    updateCamera();

    drawTerrain();

    for (
        const resource of resources
    ) {

        drawResource(
            resource
        );
    }

    for (
        const enemy of enemies
    ) {

        drawEnemy(
            enemy
        );
    }

    drawPlayer();

    drawFloatingTexts(dt);

    /*
     * Efecto de muerte
     */

    if (player.dead) {

        ctx.fillStyle =
            "rgba(0,0,0,.35)";

        ctx.fillRect(
            0,
            0,
            screenWidth,
            screenHeight
        );

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "bold 28px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "💀 HAS MUERTO",
            screenWidth / 2,
            screenHeight / 2
        );

        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "Reapareciendo...",
            screenWidth / 2,
            screenHeight / 2 + 35
        );
    }
}

/* =========================================================
   ACTUALIZACIÓN
   ========================================================= */

function update(dt) {

    if (
        dt > 0.05
    ) {

        dt = 0.05;
    }

    if (
        player.attackCooldown > 0
    ) {

        player.attackCooldown -=
            dt;
    }

    updateMovement(dt);

    updateEnemies(dt);

    updateResources(dt);

    updateRespawn(dt);

    updateMessage(dt);

    updateHUD();
}

/* =========================================================
   LOOP PRINCIPAL
   ========================================================= */

let lastTime =
    performance.now();

function gameLoop(now) {

    let dt =
        (now - lastTime) /
        1000;

    lastTime = now;

    if (
        !Number.isFinite(dt) ||
        dt < 0
    ) {

        dt = 0;
    }

    update(dt);

    render(dt);

    requestAnimationFrame(
        gameLoop
    );
}

/* =========================================================
   INICIAR
   ========================================================= */

loadGame();

updateHUD();

updateCamera();

showMessage(
    "⚔️ ¡Bienvenido a Reinos de Ceniza!"
);

requestAnimationFrame(
    gameLoop
);

/* =========================================================
   AUTOGUARDADO
   ========================================================= */

setInterval(
    function() {

        saveGame();

    },
    10000
);

console.log(
    "⚔️ Reinos de Ceniza iniciado correctamente."
);

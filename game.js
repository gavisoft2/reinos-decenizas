```javascript
// ============================================================
// REINOS DE CENIZA
// GAME.JS - VERSION 0.5
// DEMO MMORPG 2D MOBILE
// ============================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ============================================================
// ESTADO DEL JUGADOR
// ============================================================

const state = {
    level: 1,
    xp: 0,
    xpNext: 100,

    hp: 100,
    maxHp: 100,

    mana: 50,
    maxMana: 50,

    attack: 15,
    defense: 5,

    gold: 0,

    wood: 0,
    stone: 0,
    copper: 0,
    iron: 0,
    fish: 0,

    potion: 3,

    dead: false
};

// ============================================================
// JUGADOR
// ============================================================

const player = {
    x: 500,
    y: 350,

    spawnX: 500,
    spawnY: 350,

    speed: 3.2,
    radius: 17,

    direction: 1,

    attackTimer: 0,

    gathering: false
};

// ============================================================
// MUNDO
// ============================================================

const world = {
    width: 2400,
    height: 1600
};

// ============================================================
// CAMARA
// ============================================================

const camera = {
    zoom: 0.72
};

// ============================================================
// TECLADO
// ============================================================

const keys = {};

window.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

    if (e.key === " ") {
        e.preventDefault();
        basicAttack();
    }

    if (e.key.toLowerCase() === "e") {
        interact();
    }

    if (e.key.toLowerCase() === "1") {
        useSkill(0);
    }

    if (e.key.toLowerCase() === "2") {
        useSkill(1);
    }

    if (e.key.toLowerCase() === "3") {
        useSkill(2);
    }

    if (e.key.toLowerCase() === "4") {
        useSkill(3);
    }
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

// ============================================================
// JOYSTICK
// ============================================================

const joystick = {
    active: false,
    pointerId: null,

    centerX: 0,
    centerY: 0,

    dx: 0,
    dy: 0,

    max: 50
};

const joystickBase = document.createElement("div");

joystickBase.style.position = "fixed";
joystickBase.style.left = "22px";
joystickBase.style.bottom = "22px";
joystickBase.style.width = "125px";
joystickBase.style.height = "125px";
joystickBase.style.borderRadius = "50%";
joystickBase.style.background = "rgba(255,255,255,.12)";
joystickBase.style.border = "2px solid rgba(255,255,255,.25)";
joystickBase.style.zIndex = "1000";
joystickBase.style.touchAction = "none";

document.body.appendChild(joystickBase);

const joystickKnob = document.createElement("div");

joystickKnob.style.position = "absolute";
joystickKnob.style.width = "58px";
joystickKnob.style.height = "58px";
joystickKnob.style.left = "31px";
joystickKnob.style.top = "31px";
joystickKnob.style.borderRadius = "50%";
joystickKnob.style.background = "rgba(255,255,255,.35)";
joystickKnob.style.border = "2px solid rgba(255,255,255,.5)";
joystickKnob.style.pointerEvents = "none";

joystickBase.appendChild(joystickKnob);

function resetJoystick() {

    joystick.active = false;
    joystick.dx = 0;
    joystick.dy = 0;

    joystickKnob.style.transform =
        "translate(0px,0px)";
}

function moveJoystick(x, y) {

    let dx = x - joystick.centerX;
    let dy = y - joystick.centerY;

    const distance = Math.hypot(dx, dy);

    if (distance > joystick.max) {

        dx =
            dx / distance *
            joystick.max;

        dy =
            dy / distance *
            joystick.max;
    }

    joystick.dx =
        dx / joystick.max;

    joystick.dy =
        dy / joystick.max;

    joystickKnob.style.transform =
        `translate(${dx}px,${dy}px)`;

    if (Math.abs(joystick.dx) > .1) {

        player.direction =
            joystick.dx >= 0 ? 1 : -1;
    }
}

joystickBase.addEventListener("pointerdown", e => {

    joystick.active = true;
    joystick.pointerId = e.pointerId;

    const rect =
        joystickBase.getBoundingClientRect();

    joystick.centerX =
        rect.left +
        rect.width / 2;

    joystick.centerY =
        rect.top +
        rect.height / 2;

    joystickBase.setPointerCapture(
        e.pointerId
    );

    moveJoystick(
        e.clientX,
        e.clientY
    );
});

joystickBase.addEventListener("pointermove", e => {

    if (!joystick.active) return;

    if (e.pointerId !== joystick.pointerId) return;

    moveJoystick(
        e.clientX,
        e.clientY
    );
});

joystickBase.addEventListener(
    "pointerup",
    resetJoystick
);

joystickBase.addEventListener(
    "pointercancel",
    resetJoystick
);

// ============================================================
// MENSAJES
// ============================================================

let message = "";
let messageTime = 0;

function showMessage(text) {

    message = text;
    messageTime = 1800;
}

// ============================================================
// HABILIDADES
// ============================================================

const skills = [

    {
        name: "Golpe Poderoso",
        icon: "⚔️",
        level: 1,
        damage: 25,
        mana: 0,
        cooldown: 700,
        last: 0
    },

    {
        name: "Golpe de Fuego",
        icon: "🔥",
        level: 3,
        damage: 45,
        mana: 10,
        cooldown: 1800,
        last: 0
    },

    {
        name: "Escudo",
        icon: "🛡️",
        level: 5,
        damage: 0,
        mana: 15,
        cooldown: 8000,
        last: 0
    },

    {
        name: "Ataque Rápido",
        icon: "💨",
        level: 8,
        damage: 65,
        mana: 20,
        cooldown: 3000,
        last: 0
    }
];

// ============================================================
// ENEMIGOS
// ============================================================

const mobs = [

    {
        name: "Lobo",
        x: 900,
        y: 600,
        spawnX: 900,
        spawnY: 600,

        hp: 35,
        maxHp: 35,

        speed: 1.45,

        aggro: 230,
        attackRange: 42,

        damage: 5,
        attackCooldown: 1200,

        lastAttack: 0,
        respawnAt: 0
    },

    {
        name: "Jabalí",
        x: 1120,
        y: 760,
        spawnX: 1120,
        spawnY: 760,

        hp: 55,
        maxHp: 55,

        speed: 1.05,

        aggro: 230,
        attackRange: 45,

        damage: 8,
        attackCooldown: 1400,

        lastAttack: 0,
        respawnAt: 0
    },

    {
        name: "Goblin",
        x: 1400,
        y: 620,
        spawnX: 1400,
        spawnY: 620,

        hp: 75,
        maxHp: 75,

        speed: .9,

        aggro: 250,
        attackRange: 46,

        damage: 10,
        attackCooldown: 1600,

        lastAttack: 0,
        respawnAt: 0
    }
];

// ============================================================
// RECURSOS
// ============================================================

const resources = [

    // ARBOLES

    {
        type: "tree",
        name: "Árbol",
        x: 300,
        y: 250,
        amount: 5,
        max: 5,
        respawn: 8000,
        respawnAt: 0
    },

    {
        type: "tree",
        name: "Árbol",
        x: 420,
        y: 800,
        amount: 5,
        max: 5,
        respawn: 8000,
        respawnAt: 0
    },

    {
        type: "tree",
        name: "Árbol",
        x: 750,
        y: 300,
        amount: 5,
        max: 5,
        respawn: 8000,
        respawnAt: 0
    },

    {
        type: "tree",
        name: "Árbol",
        x: 1600,
        y: 400,
        amount: 5,
        max: 5,
        respawn: 8000,
        respawnAt: 0
    },

    // PIEDRA

    {
        type: "stone",
        name: "Piedra",
        x: 650,
        y: 900,
        amount: 5,
        max: 5,
        respawn: 7000,
        respawnAt: 0
    },

    {
        type: "stone",
        name: "Piedra",
        x: 1500,
        y: 900,
        amount: 5,
        max: 5,
        respawn: 7000,
        respawnAt: 0
    },

    // COBRE

    {
        type: "copper",
        name: "Cobre",
        x: 1800,
        y: 700,
        amount: 4,
        max: 4,
        respawn: 10000,
        respawnAt: 0
    },

    // HIERRO

    {
        type: "iron",
        name: "Hierro",
        x: 1950,
        y: 1050,
        amount: 3,
        max: 3,
        respawn: 12000,
        respawnAt: 0
    }
];

// ============================================================
// LOOT
// ============================================================

const loot = [];

// ============================================================
// INVENTARIO
// ============================================================

const inventory = {
    items: []
};

function addItem(name, amount) {

    const existing =
        inventory.items.find(
            item => item.name === name
        );

    if (existing) {

        existing.amount += amount;

    } else {

        inventory.items.push({
            name: name,
            amount: amount
        });
    }
}

// ============================================================
// EXPERIENCIA
// ============================================================

function gainXP(amount) {

    state.xp += amount;

    while (
        state.xp >= state.xpNext
    ) {

        state.xp -= state.xpNext;

        state.level++;

        state.xpNext =
            Math.floor(
                state.xpNext * 1.35
            );

        state.maxHp += 15;
        state.hp = state.maxHp;

        state.maxMana += 5;
        state.mana = state.maxMana;

        state.attack += 3;
        state.defense += 1;

        showMessage(
            "🎉 ¡Nivel " +
            state.level +
            "!"
        );
    }
}

// ============================================================
// MOVIMIENTO
// ============================================================

function updateMovement(dt) {

    if (state.dead) return;

    let dx = 0;
    let dy = 0;

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        dy--;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        dy++;
    }

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        dx--;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        dx++;
    }

    if (
        joystick.active ||
        Math.abs(joystick.dx) > .05 ||
        Math.abs(joystick.dy) > .05
    ) {

        dx = joystick.dx;
        dy = joystick.dy;
    }

    const length =
        Math.hypot(dx, dy);

    if (length > 1) {

        dx /= length;
        dy /= length;
    }

    if (dx !== 0) {

        player.direction =
            dx > 0 ? 1 : -1;
    }

    player.x +=
        dx *
        player.speed *
        dt / 16;

    player.y +=
        dy *
        player.speed *
        dt / 16;

    player.x =
        Math.max(
            25,
            Math.min(
                world.width - 25,
                player.x
            )
        );

    player.y =
        Math.max(
            25,
            Math.min(
                world.height - 25,
                player.y
            )
        );
}

// ============================================================
// IA DE ENEMIGOS
// ============================================================

function updateMobs(dt, now) {

    for (const mob of mobs) {

        // ------------------------------
        // MUERTO
        // ------------------------------

        if (mob.hp <= 0) {

            if (
                now >= mob.respawnAt
            ) {

                mob.hp =
                    mob.maxHp;

                mob.x =
                    mob.spawnX;

                mob.y =
                    mob.spawnY;

                mob.lastAttack = 0;

                mob.respawnAt = 0;

                showMessage(
                    "🔄 " +
                    mob.name +
                    " reapareció"
                );
            }

            continue;
        }

        if (state.dead) continue;

        const dx =
            player.x - mob.x;

        const dy =
            player.y - mob.y;

        const distance =
            Math.hypot(dx, dy);

        // ------------------------------
        // PERSEGUIR
        // ------------------------------

        if (
            distance <= mob.aggro &&
            distance > mob.attackRange
        ) {

            mob.x +=
                dx / distance *
                mob.speed *
                dt / 16;

            mob.y +=
                dy / distance *
                mob.speed *
                dt / 16;
        }

        // ------------------------------
        // ATAQUE
        // ------------------------------

        if (
            distance <= mob.attackRange
        ) {

            if (
                now -
                mob.lastAttack >=
                mob.attackCooldown
            ) {

                mob.lastAttack = now;

                const damage =
                    Math.max(
                        1,
                        mob.damage -
                        state.defense
                    );

                state.hp -= damage;

                showMessage(
                    "💥 " +
                    mob.name +
                    " te golpeó -" +
                    damage
                );

                if (
                    state.hp <= 0
                ) {

                    playerDeath();
                }
            }
        }

        // ------------------------------
        // VOLVER A SU ZONA
        // ------------------------------

        const returnDx =
            mob.spawnX - mob.x;

        const returnDy =
            mob.spawnY - mob.y;

        const spawnDistance =
            Math.hypot(
                returnDx,
                returnDy
            );

        if (
            distance > mob.aggro &&
            spawnDistance > 280
        ) {

            mob.x +=
                returnDx /
                spawnDistance *
                mob.speed *
                dt / 16;

            mob.y +=
                returnDy /
                spawnDistance *
                mob.speed *
                dt / 16;
        }
    }
}

// ============================================================
// ATAQUE BÁSICO
// ============================================================

function nearestMob(range = 125) {

    let target = null;
    let best = range;

    for (const mob of mobs) {

        if (mob.hp <= 0) continue;

        const distance =
            Math.hypot(
                player.x - mob.x,
                player.y - mob.y
            );

        if (
            distance < best
        ) {

            best = distance;
            target = mob;
        }
    }

    return target;
}

function basicAttack() {

    if (state.dead) return;

    const target =
        nearestMob();

    if (!target) {

        showMessage(
            "🎯 No hay enemigo cerca"
        );

        return;
    }

    const damage =
        state.attack + 10;

    target.hp -= damage;

    showMessage(
        "⚔️ Golpe -" +
        damage
    );

    if (
        target.hp <= 0
    ) {

        killMob(target);
    }
}

// ============================================================
// HABILIDADES
// ============================================================

function useSkill(index) {

    if (state.dead) return;

    const skill =
        skills[index];

    if (!skill) return;

    const now =
        performance.now();

    if (
        state.level <
        skill.level
    ) {

        showMessage(
            "🔒 Nivel " +
            skill.level
        );

        return;
    }

    if (
        now -
        skill.last <
        skill.cooldown
    ) {

        return;
    }

    if (
        state.mana <
        skill.mana
    ) {

        showMessage(
            "💧 Falta maná"
        );

        return;
    }

    skill.last = now;

    state.mana -=
        skill.mana;

    // ESCUDO

    if (
        skill.name ===
        "Escudo"
    ) {

        state.hp =
            Math.min(
                state.maxHp,
                state.hp + 30
            );

        showMessage(
            "🛡️ Escudo: +30 vida"
        );

        return;
    }

    const target =
        nearestMob();

    if (!target) {

        showMessage(
            "🎯 No hay enemigo"
        );

        return;
    }

    const damage =
        skill.damage +
        state.attack;

    target.hp -= damage;

    showMessage(
        skill.icon +
        " " +
        skill.name +
        " -" +
        damage
    );

    if (
        target.hp <= 0
    ) {

        killMob(target);
    }
}

// ============================================================
// MATAR MOB
// ============================================================

function killMob(mob) {

    mob.hp = 0;

    mob.respawnAt =
        performance.now() +
        15000;

    mob.lastAttack = 0;

    state.gold += 10;

    gainXP(35);

    // LOOT

    const roll =
        Math.random();

    if (
        roll < .45
    ) {

        loot.push({
            x: mob.x,
            y: mob.y,
            name: "Piel",
            amount: 1
        });

    } else if (
        roll < .75
    ) {

        loot.push({
            x: mob.x,
            y: mob.y,
            name: "Carne",
            amount: 1
        });

    } else {

        loot.push({
            x: mob.x,
            y: mob.y,
            name: "Colmillo",
            amount: 1
        });
    }

    showMessage(
        "☠️ " +
        mob.name +
        " derrotado +10 oro"
    );
}

// ============================================================
// INTERACCIÓN
// ============================================================

function interact() {

    if (state.dead) return;

    // ------------------------------
    // LOOT
    // ------------------------------

    for (
        let i = loot.length - 1;
        i >= 0;
        i--
    ) {

        const item =
            loot[i];

        const distance =
            Math.hypot(
                player.x - item.x,
                player.y - item.y
            );

        if (
            distance <= 60
        ) {

            addItem(
                item.name,
                item.amount
            );

            showMessage(
                "🎒 Recogiste " +
                item.name
            );

            loot.splice(i, 1);

            return;
        }
    }

    // ------------------------------
    // RECURSOS
    // ------------------------------

    for (const resource of resources) {

        if (
            resource.amount <= 0
        ) continue;

        const distance =
            Math.hypot(
                player.x -
                resource.x,

                player.y -
                resource.y
            );

        if (
            distance <= 70
        ) {

            gatherResource(
                resource
            );

            return;
        }
    }
}

// ============================================================
// RECOLECTAR
// ============================================================

function gatherResource(resource) {

    resource.amount--;

    if (
        resource.type ===
        "tree"
    ) {

        state.wood++;

        addItem(
            "Madera",
            1
        );

        showMessage(
            "🌲 +1 Madera"
        );
    }

    if (
        resource.type ===
        "stone"
    ) {

        state.stone++;

        addItem(
            "Piedra",
            1
        );

        showMessage(
            "🪨 +1 Piedra"
        );
    }

    if (
        resource.type ===
        "copper"
    ) {

        state.copper++;

        addItem(
            "Cobre",
            1
        );

        showMessage(
            "🟠 +1 Cobre"
        );
    }

    if (
        resource.type ===
        "iron"
    ) {

        state.iron++;

        addItem(
            "Hierro",
            1
        );

        showMessage(
            "⚙️ +1 Hierro"
        );
    }

    if (
        resource.amount <= 0
    ) {

        resource.respawnAt =
            performance.now() +
            resource.respawn;
    }
}

// ============================================================
// ACTUALIZAR RECURSOS
// ============================================================

function updateResources(now) {

    for (const resource of resources) {

        if (
            resource.amount <= 0 &&
            now >= resource.respawnAt
        ) {

            resource.amount =
                resource.max;

            resource.respawnAt = 0;
        }
    }
}

// ============================================================
// RECOGER LOOT AUTOMATICAMENTE
// ============================================================

function updateLoot() {

    for (
        let i = loot.length - 1;
        i >= 0;
        i--
    ) {

        const item =
            loot[i];

        const distance =
            Math.hypot(
                player.x - item.x,
                player.y - item.y
            );

        if (
            distance <= 42
        ) {

            addItem(
                item.name,
                item.amount
            );

            showMessage(
                "🎒 +" +
                item.amount +
                " " +
                item.name
            );

            loot.splice(i, 1);
        }
    }
}

// ============================================================
// MUERTE
// ============================================================

function playerDeath() {

    if (state.dead) return;

    state.dead = true;

    state.hp = 0;

    resetJoystick();

    showMessage(
        "💀 Has muerto..."
    );

    setTimeout(() => {

        player.x =
            player.spawnX;

        player.y =
            player.spawnY;

        state.hp =
            state.maxHp;

        state.mana =
            state.maxMana;

        state.dead = false;

        showMessage(
            "✨ Has revivido"
        );

    }, 5000);
}

// ============================================================
// GUARDAR
// ============================================================

function saveGame() {

    const save = {

        state: state,

        player: {
            x: player.x,
            y: player.y
        },

        inventory: inventory
    };

    localStorage.setItem(
        "reinos_ceniza_save",
        JSON.stringify(save)
    );
}

// ============================================================
// CARGAR
// ============================================================

function loadGame() {

    const saved =
        localStorage.getItem(
            "reinos_ceniza_save"
        );

    if (!saved) return;

    try {

        const data =
            JSON.parse(saved);

        Object.assign(
            state,
            data.state
        );

        player.x =
            data.player.x;

        player.y =
            data.player.y;

        inventory.items =
            data.inventory.items || [];

    } catch (error) {

        console.log(
            "No se pudo cargar la partida"
        );
    }
}

// ============================================================
// HUD
// ============================================================

function createHUD() {

    let hud =
        document.getElementById(
            "gameHUD"
        );

    if (hud) return hud;

    hud =
        document.createElement("div");

    hud.id =
        "gameHUD";

    hud.style.position =
        "fixed";

    hud.style.left =
        "10px";

    hud.style.top =
        "10px";

    hud.style.zIndex =
        "1000";

    hud.style.color =
        "white";

    hud.style.background =
        "rgba(0,0,0,.65)";

    hud.style.padding =
        "10px";

    hud.style.borderRadius =
        "10px";

    hud.style.fontFamily =
        "Arial";

    hud.style.fontSize =
        "12px";

    hud.style.minWidth =
        "150px";

    document.body.appendChild(hud);

    return hud;
}

function updateHUD() {

    const hud =
        createHUD();

    hud.innerHTML = `

        <b>🔥 REINOS DE CENIZA</b>

        <br><br>

        ⚔️ Nivel:
        ${state.level}

        <br>

        ❤️ Vida:
        ${Math.floor(state.hp)}
        /
        ${state.maxHp}

        <br>

        💧 Maná:
        ${Math.floor(state.mana)}
        /
        ${state.maxMana}

        <br>

        ⭐ XP:
        ${state.xp}
        /
        ${state.xpNext}

        <br>

        🪙 Oro:
        ${state.gold}

        <br>

        🌲 Madera:
        ${state.wood}

        <br>

        🪨 Piedra:
        ${state.stone}

        <br>

        🟠 Cobre:
        ${state.copper}

        <br>

        ⚙️ Hierro:
        ${state.iron}

    `;

    // MENSAJE

    if (
        messageTime > 0
    ) {

        let box =
            document.getElementById(
                "messageBox"
            );

        if (!box) {

            box =
                document.createElement(
                    "div"
                );

            box.id =
                "messageBox";

            box.style.position =
                "fixed";

            box.style.top =
                "18%";

            box.style.left =
                "50%";

            box.style.transform =
                "translateX(-50%)";

            box.style.zIndex =
                "1200";

            box.style.color =
                "white";

            box.style.background =
                "rgba(0,0,0,.75)";

            box.style.padding =
                "10px 18px";

            box.style.borderRadius =
                "10px";

            box.style.fontFamily =
                "Arial";

            box.style.fontWeight =
                "bold";

            box.style.pointerEvents =
                "none";

            document.body.appendChild(
                box
            );
        }

        box.textContent =
            message;

        box.style.display =
            "block";

    } else {

        const box =
            document.getElementById(
                "messageBox"
            );

        if (box) {

            box.style.display =
                "none";
        }
    }
}

// ============================================================
// BOTONES DE COMBATE
// ============================================================

function createCombatButtons() {

    const container =
        document.createElement(
            "div"
        );

    container.id =
        "combatButtons";

    container.style.position =
        "fixed";

    container.style.right =
        "12px";

    container.style.bottom =
        "18px";

    container.style.zIndex =
        "1000";

    container.style.display =
        "flex";

    container.style.flexDirection =
        "column";

    container.style.gap =
        "8px";

    document.body.appendChild(
        container
    );

    skills.forEach(
        (skill, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.innerHTML =
                skill.icon;

            button.style.width =
                "56px";

            button.style.height =
                "56px";

            button.style.borderRadius =
                "50%";

            button.style.border =
                "2px solid rgba(255,255,255,.5)";

            button.style.background =
                "rgba(0,0,0,.7)";

            button.style.color =
                "white";

            button.style.fontSize =
                "23px";

            button.style.touchAction =
                "manipulation";

            button.addEventListener(
                "pointerdown",
                e => {

                    e.preventDefault();

                    useSkill(index);
                }
            );

            container.appendChild(
                button
            );
        }
    );
}

// ============================================================
// BOTON ATAQUE
// ============================================================

function createAttackButton() {

    const button =
        document.createElement(
            "button"
        );

    button.innerHTML =
        "⚔️";

    button.style.position =
        "fixed";

    button.style.right =
        "85px";

    button.style.bottom =
        "25px";

    button.style.width =
        "70px";

    button.style.height =
        "70px";

    button.style.borderRadius =
        "50%";

    button.style.zIndex =
        "1000";

    button.style.background =
        "rgba(150,20,20,.8)";

    button.style.border =
        "3px solid rgba(255,255,255,.5)";

    button.style.color =
        "white";

    button.style.fontSize =
        "28px";

    button.style.touchAction =
        "manipulation";

    button.addEventListener(
        "pointerdown",
        e => {

            e.preventDefault();

            basicAttack();
        }
    );

    document.body.appendChild(
        button
    );
}

// ============================================================
// BOTON INTERACTUAR
// ============================================================

function createInteractButton() {

    const button =
        document.createElement(
            "button"
        );

    button.innerHTML =
        "✋";

    button.style.position =
        "fixed";

    button.style.right =
        "160px";

    button.style.bottom =
        "30px";

    button.style.width =
        "52px";

    button.style.height =
        "52px";

    button.style.borderRadius =
        "50%";

    button.style.zIndex =
        "1000";

    button.style.background =
        "rgba(20,100,70,.8)";

    button.style.border =
        "2px solid rgba(255,255,255,.5)";

    button.style.color =
        "white";

    button.style.fontSize =
        "22px";

    button.style.touchAction =
        "manipulation";

    button.addEventListener(
        "pointerdown",
        e => {

            e.preventDefault();

            interact();
        }
    );

    document.body.appendChild(
        button
    );
}

// ============================================================
// DIBUJAR MUNDO
// ============================================================

function drawWorld() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.save();

    ctx.translate(
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.scale(
        camera.zoom,
        camera.zoom
    );

    ctx.translate(
        -player.x,
        -player.y
    );

    // ========================================================
    // TERRENO
    // ========================================================

    ctx.fillStyle =
        "#243b25";

    ctx.fillRect(
        0,
        0,
        world.width,
        world.height
    );

    // GRID

    ctx.strokeStyle =
        "rgba(255,255,255,.035)";

    ctx.lineWidth = 1;

    for (
        let x = 0;
        x <= world.width;
        x += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            world.height
        );

        ctx.stroke();
    }

    for (
        let y = 0;
        y <= world.height;
        y += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            world.width,
            y
        );

        ctx.stroke();
    }

    // ========================================================
    // RECURSOS
    // ========================================================

    drawResources();

    // ========================================================
    // LOOT
    // ========================================================

    drawLoot();

    // ========================================================
    // MOBS
    // ========================================================

    drawMobs();

    // ========================================================
    // JUGADOR
    // ========================================================

    drawPlayer();

    ctx.restore();
}

// ============================================================
// RECURSOS VISUALES
// ============================================================

function drawResources() {

    for (const resource of resources) {

        if (
            resource.amount <= 0
        ) continue;

        if (
            resource.type ===
            "tree"
        ) {

            // TRONCO

            ctx.fillStyle =
                "#654321";

            ctx.fillRect(
                resource.x - 7,
                resource.y,
                14,
                35
            );

            // COPA

            ctx.beginPath();

            ctx.fillStyle =
                "#27783a";

            ctx.arc(
                resource.x,
                resource.y - 5,
                28,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.beginPath();

            ctx.fillStyle =
                "#379b4b";

            ctx.arc(
                resource.x - 10,
                resource.y - 12,
                17,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        if (
            resource.type ===
            "stone"
        ) {

            ctx.beginPath();

            ctx.fillStyle =
                "#888";

            ctx.moveTo(
                resource.x - 25,
                resource.y + 15
            );

            ctx.lineTo(
                resource.x - 10,
                resource.y - 18
            );

            ctx.lineTo(
                resource.x + 25,
                resource.y - 8
            );

            ctx.lineTo(
                resource.x + 18,
                resource.y + 20
            );

            ctx.closePath();

            ctx.fill();
        }

        if (
            resource.type ===
            "copper"
        ) {

            ctx.beginPath();

            ctx.fillStyle =
                "#c87532";

            ctx.arc(
                resource.x,
                resource.y,
                22,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle =
                "#ffd08a";

            ctx.font =
                "12px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "Cu",
                resource.x,
                resource.y + 4
            );
        }

        if (
            resource.type ===
            "iron"
        ) {

            ctx.beginPath();

            ctx.fillStyle =
                "#626a73";

            ctx.arc(
                resource.x,
                resource.y,
                24,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle =
                "#fff";

            ctx.font =
                "12px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "Fe",
                resource.x,
                resource.y + 4
            );
        }
    }
}

// ============================================================
// LOOT VISUAL
// ============================================================

function drawLoot() {

    for (const item of loot) {

        ctx.beginPath();

        ctx.fillStyle =
            "#ffd700";

        ctx.arc(
            item.x,
            item.y,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "white";

        ctx.font =
            "11px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            item.name,
            item.x,
            item.y - 14
        );
    }
}

// ============================================================
// DIBUJAR MOBS
// ============================================================

function drawMobs() {

    for (const mob of mobs) {

        if (
            mob.hp <= 0
        ) continue;

        const distance =
            Math.hypot(
                player.x - mob.x,
                player.y - mob.y
            );

        // CUERPO

        ctx.beginPath();

        if (
            mob.name === "Lobo"
        ) {

            ctx.fillStyle =
                "#777";

        } else if (
            mob.name === "Jabalí"
        ) {

            ctx.fillStyle =
                "#70452d";

        } else {

            ctx.fillStyle =
                "#4b9b45";
        }

        ctx.arc(
            mob.x,
            mob.y,
            21,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // OJOS

        ctx.fillStyle =
            "white";

        ctx.beginPath();

        ctx.arc(
            mob.x - 6,
            mob.y - 4,
            3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            mob.x + 6,
            mob.y - 4,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // AGRESIVO

        if (
            distance <= mob.aggro
        ) {

            ctx.strokeStyle =
                "#ff3333";

            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.arc(
                mob.x,
                mob.y,
                27,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }

        // NOMBRE

        ctx.fillStyle =
            "white";

        ctx.font =
            "12px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            mob.name,
            mob.x,
            mob.y - 38
        );

        // BARRA

        const width = 52;

        ctx.fillStyle =
            "#331515";

        ctx.fillRect(
            mob.x - width / 2,
            mob.y - 30,
            width,
            6
        );

        ctx.fillStyle =
            "#e33";

        ctx.fillRect(
            mob.x - width / 2,
            mob.y - 30,
            width *
            (mob.hp / mob.maxHp),
            6
        );
    }
}

// ============================================================
// DIBUJAR JUGADOR
// ============================================================

function drawPlayer() {

    ctx.save();

    if (
        state.dead
    ) {

        ctx.globalAlpha =
            .35;
    }

    // SOMBRA

    ctx.beginPath();

    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.ellipse(
        player.x,
        player.y + 19,
        17,
        7,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // CUERPO

    ctx.beginPath();

    ctx.fillStyle =
        "#2875d7";

    ctx.arc(
        player.x,
        player.y,
        17,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // BORDE

    ctx.strokeStyle =
        "#b9dcff";

    ctx.lineWidth = 3;

    ctx.stroke();

    // CABEZA

    ctx.beginPath();

    ctx.fillStyle =
        "#f1c27d";

    ctx.arc(
        player.x,
        player.y - 18,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // PELO

    ctx.fillStyle =
        "#3a2415";

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y - 21,
        9,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();

    // ESPADA

    ctx.strokeStyle =
        "#eeeeee";

    ctx.lineWidth = 5;

    ctx.beginPath();

    const swordX =
        player.x +
        player.direction *
        12;

    ctx.moveTo(
        swordX,
        player.y + 4
    );

    ctx.lineTo(
        swordX +
        player.direction *
        20,
        player.y - 17
    );

    ctx.stroke();

    // VIDA

    ctx.fillStyle =
        "#301414";

    ctx.fillRect(
        player.x - 25,
        player.y + 27,
        50,
        6
    );

    ctx.fillStyle =
        "#28d35f";

    ctx.fillRect(
        player.x - 25,
        player.y + 27,
        50 *
        Math.max(
            0,
            state.hp /
            state.maxHp
        ),
        6
    );

    ctx.restore();
}

// ============================================================
// REGENERAR MANÁ
// ============================================================

let manaTimer = 0;

function regenerateMana(dt) {

    manaTimer += dt;

    if (
        manaTimer >= 1000
    ) {

        manaTimer = 0;

        if (
            !state.dead
        ) {

            state.mana =
                Math.min(
                    state.maxMana,
                    state.mana + 2
                );
        }
    }
}

// ============================================================
// AUTOGUARDADO
// ============================================================

let saveTimer = 0;

function autoSave(dt) {

    saveTimer += dt;

    if (
        saveTimer >= 5000
    ) {

        saveTimer = 0;

        saveGame();
    }
}

// ============================================================
// GAME LOOP
// ============================================================

let lastTime =
    performance.now();

function gameLoop(now) {

    const dt =
        Math.min(
            40,
            now - lastTime
        );

    lastTime = now;

    updateMovement(dt);

    updateMobs(
        dt,
        now
    );

    updateResources(now);

    updateLoot();

    regenerateMana(dt);

    autoSave(dt);

    if (
        messageTime > 0
    ) {

        messageTime -= dt;
    }

    drawWorld();

    updateHUD();

    requestAnimationFrame(
        gameLoop
    );
}

// ============================================================
// INICIAR
// ============================================================

loadGame();

createCombatButtons();

createAttackButton();

createInteractButton();

requestAnimationFrame(
    gameLoop
);
```

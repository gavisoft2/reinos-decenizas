// ============================================================
// REINOS DE CENIZA - GAME.JS
// Versión 0.4 - IA DE MOBS + COMBATE + RESPAWN
// ============================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ============================================================
// AJUSTE DEL CANVAS
// ============================================================

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

    gold: 0,

    wood: 0,
    stone: 0,
    copper: 0,
    iron: 0,
    fish: 0,

    attack: 15,
    defense: 5,

    dead: false
};


// ============================================================
// JUGADOR
// ============================================================

const player = {
    x: 500,
    y: 350,

    speed: 3.2,

    r: 16
};


// ============================================================
// MUNDO
// ============================================================

const world = {
    w: 1800,
    h: 1200
};


// ============================================================
// CÁMARA
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
        attackWithSkill(skills[0]);
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

    id: null,

    centerX: 0,
    centerY: 0,

    x: 0,
    y: 0,

    dx: 0,
    dy: 0,

    maxDistance: 50
};


// ============================================================
// CREAR JOYSTICK
// ============================================================

const joystickBase = document.createElement("div");

joystickBase.id = "joystickBase";

joystickBase.style.position = "fixed";
joystickBase.style.left = "25px";
joystickBase.style.bottom = "25px";

joystickBase.style.width = "120px";
joystickBase.style.height = "120px";

joystickBase.style.borderRadius = "50%";

joystickBase.style.background = "rgba(255,255,255,0.12)";
joystickBase.style.border = "2px solid rgba(255,255,255,0.25)";

joystickBase.style.zIndex = "1000";

joystickBase.style.touchAction = "none";

document.body.appendChild(joystickBase);


// ============================================================
// JOYSTICK CONTROL
// ============================================================

const joystickKnob = document.createElement("div");

joystickKnob.style.position = "absolute";

joystickKnob.style.width = "55px";
joystickKnob.style.height = "55px";

joystickKnob.style.left = "32px";
joystickKnob.style.top = "32px";

joystickKnob.style.borderRadius = "50%";

joystickKnob.style.background = "rgba(255,255,255,0.35)";

joystickKnob.style.border = "2px solid rgba(255,255,255,0.5)";

joystickKnob.style.pointerEvents = "none";

joystickBase.appendChild(joystickKnob);


function resetJoystick() {

    joystick.active = false;

    joystick.dx = 0;
    joystick.dy = 0;

    joystickKnob.style.transform = "translate(0px,0px)";
}


function updateJoystick(clientX, clientY) {

    let dx = clientX - joystick.centerX;
    let dy = clientY - joystick.centerY;

    const distance = Math.hypot(dx, dy);

    if (distance > joystick.maxDistance) {

        dx = dx / distance * joystick.maxDistance;
        dy = dy / distance * joystick.maxDistance;

    }

    joystick.x = dx;
    joystick.y = dy;

    joystick.dx = dx / joystick.maxDistance;
    joystick.dy = dy / joystick.maxDistance;

    joystickKnob.style.transform =
        `translate(${dx}px, ${dy}px)`;
}


joystickBase.addEventListener("pointerdown", e => {

    joystick.active = true;

    joystick.id = e.pointerId;

    const rect = joystickBase.getBoundingClientRect();

    joystick.centerX = rect.left + rect.width / 2;
    joystick.centerY = rect.top + rect.height / 2;

    joystickBase.setPointerCapture(e.pointerId);

    updateJoystick(e.clientX, e.clientY);
});


joystickBase.addEventListener("pointermove", e => {

    if (!joystick.active) return;

    if (e.pointerId !== joystick.id) return;

    updateJoystick(e.clientX, e.clientY);
});


joystickBase.addEventListener("pointerup", resetJoystick);

joystickBase.addEventListener("pointercancel", resetJoystick);


// ============================================================
// MENSAJES
// ============================================================

let messageText = "";
let messageTimer = 0;


function msg(text) {

    messageText = text;

    messageTimer = 1800;
}


// ============================================================
// MOBS
// ============================================================

const mobs = [

    {
        name: "Lobo",

        x: 900,
        y: 650,

        spawnX: 900,
        spawnY: 650,

        hp: 30,
        maxHp: 30,

        speed: 1.45,

        aggroRange: 230,

        attackRange: 42,

        attackDamage: 4,

        attackCooldown: 1100,

        lastAttack: 0,

        respawnAt: 0
    },


    {
        name: "Jabalí",

        x: 1040,
        y: 760,

        spawnX: 1040,
        spawnY: 760,

        hp: 45,
        maxHp: 45,

        speed: 1.05,

        aggroRange: 230,

        attackRange: 44,

        attackDamage: 7,

        attackCooldown: 1400,

        lastAttack: 0,

        respawnAt: 0
    },


    {
        name: "Goblin",

        x: 1220,
        y: 680,

        spawnX: 1220,
        spawnY: 680,

        hp: 60,
        maxHp: 60,

        speed: 0.9,

        aggroRange: 250,

        attackRange: 46,

        attackDamage: 9,

        attackCooldown: 1600,

        lastAttack: 0,

        respawnAt: 0
    }

];


// ============================================================
// HABILIDADES
// ============================================================

const skills = [

    {
        id: "golpe",

        name: "Golpe Poderoso",

        icon: "⚔️",

        level: 1,

        damage: 25,

        mana: 0,

        cooldown: 700,

        last: 0
    },


    {
        id: "fuego",

        name: "Golpe de Fuego",

        icon: "🔥",

        level: 3,

        damage: 45,

        mana: 10,

        cooldown: 1800,

        last: 0
    },


    {
        id: "escudo",

        name: "Escudo",

        icon: "🛡️",

        level: 5,

        damage: 0,

        mana: 15,

        cooldown: 8000,

        last: 0
    },


    {
        id: "rapido",

        name: "Ataque Rápido",

        icon: "💨",

        level: 8,

        damage: 65,

        mana: 20,

        cooldown: 3000,

        last: 0
    },


    {
        id: "torbellino",

        name: "Torbellino",

        icon: "🌪️",

        level: 15,

        damage: 90,

        mana: 30,

        cooldown: 5000,

        last: 0
    },


    {
        id: "ejecucion",

        name: "Ejecución",

        icon: "☠️",

        level: 20,

        damage: 150,

        mana: 40,

        cooldown: 10000,

        last: 0
    }

];


// ============================================================
// ENCONTRAR MOB CERCANO
// ============================================================

function getNearestMob(maxDistance = 130) {

    let target = null;

    let best = maxDistance;

    for (const mob of mobs) {

        if (mob.hp <= 0) continue;

        const distance = Math.hypot(
            player.x - mob.x,
            player.y - mob.y
        );

        if (distance < best) {

            best = distance;

            target = mob;
        }
    }

    return target;
}


// ============================================================
// ATAQUE DEL JUGADOR
// ============================================================

function attackWithSkill(skill) {

    if (state.dead) return;

    const now = performance.now();

    if (now - skill.last < skill.cooldown) return;

    if (state.level < skill.level) {

        msg("🔒 Se desbloquea en nivel " + skill.level);

        return;
    }


    if (state.mana < skill.mana) {

        msg("💧 No tienes suficiente maná");

        return;
    }


    skill.last = now;

    state.mana -= skill.mana;


    // ESCUDO

    if (skill.id === "escudo") {

        state.hp = Math.min(
            state.maxHp,
            state.hp + 25
        );

        msg("🛡️ Escudo activado");

        return;
    }


    const target = getNearestMob();


    if (!target) {

        msg("🎯 No hay enemigo cerca");

        return;
    }


    const damage =
        skill.damage +
        state.attack;


    target.hp -= damage;


    msg(
        skill.icon +
        " " +
        skill.name +
        " -" +
        damage +
        " HP"
    );


    // MOB MUERTO

    if (target.hp <= 0) {

        target.hp = 0;

        target.respawnAt =
            performance.now() + 15000;

        target.lastAttack = 0;


        state.gold += 10;

        gainXP(35);


        msg(
            "☠️ " +
            target.name +
            " derrotado: +10 oro"
        );
    }
}


// ============================================================
// IA DE LOS MOBS
// ============================================================

function updateMobs(dt, now) {

    for (const mob of mobs) {


        // ====================================================
        // MOB MUERTO
        // ====================================================

        if (mob.hp <= 0) {

            if (
                mob.respawnAt > 0 &&
                now >= mob.respawnAt
            ) {

                // VIDA COMPLETA

                mob.hp = mob.maxHp;

                // VOLVER AL SPAWN

                mob.x = mob.spawnX;

                mob.y = mob.spawnY;

                mob.lastAttack = 0;

                mob.respawnAt = 0;

                msg(
                    "🔄 " +
                    mob.name +
                    " ha reaparecido con toda su vida"
                );
            }

            continue;
        }


        if (state.dead) continue;


        // ====================================================
        // DISTANCIA AL JUGADOR
        // ====================================================

        const dx =
            player.x - mob.x;

        const dy =
            player.y - mob.y;

        const distance =
            Math.hypot(dx, dy);


        // ====================================================
        // DISTANCIA AL PUNTO DE SPAWN
        // ====================================================

        const spawnDx =
            mob.spawnX - mob.x;

        const spawnDy =
            mob.spawnY - mob.y;

        const spawnDistance =
            Math.hypot(
                spawnDx,
                spawnDy
            );


        // ====================================================
        // PERSEGUIR AL JUGADOR
        // ====================================================

        if (
            distance <= mob.aggroRange &&
            distance > mob.attackRange
        ) {

            const directionX =
                dx / distance;

            const directionY =
                dy / distance;


            mob.x +=
                directionX *
                mob.speed *
                dt / 16;


            mob.y +=
                directionY *
                mob.speed *
                dt / 16;
        }


        // ====================================================
        // ATACAR AL JUGADOR
        // ====================================================

        if (
            distance <= mob.attackRange
        ) {

            if (
                now - mob.lastAttack >=
                mob.attackCooldown
            ) {

                mob.lastAttack = now;


                // DEFENSA DEL JUGADOR

                const damage =
                    Math.max(
                        1,
                        mob.attackDamage -
                        state.defense
                    );


                state.hp -= damage;


                msg(
                    "💥 " +
                    mob.name +
                    " te golpeó (-" +
                    damage +
                    " HP)"
                );


                // MUERTE

                if (state.hp <= 0) {

                    playerDeath();
                }
            }
        }


        // ====================================================
        // VOLVER A SU ZONA
        // ====================================================

        if (
            distance > mob.aggroRange &&
            spawnDistance > 280
        ) {

            const returnX =
                spawnDx /
                spawnDistance;

            const returnY =
                spawnDy /
                spawnDistance;


            mob.x +=
                returnX *
                mob.speed *
                dt / 16;


            mob.y +=
                returnY *
                mob.speed *
                dt / 16;
        }


        // ====================================================
        // LIMITAR AL MAPA
        // ====================================================

        mob.x =
            Math.max(
                30,
                Math.min(
                    world.w - 30,
                    mob.x
                )
            );


        mob.y =
            Math.max(
                30,
                Math.min(
                    world.h - 30,
                    mob.y
                )
            );
    }
}


// ============================================================
// MUERTE DEL JUGADOR
// ============================================================

function playerDeath() {

    if (state.dead) return;


    state.dead = true;

    state.hp = 0;

    resetJoystick();


    msg(
        "💀 Has muerto. Revives en 5 segundos..."
    );


    setTimeout(() => {

        player.x = 500;

        player.y = 350;


        state.hp =
            state.maxHp;

        state.mana =
            state.maxMana;


        state.dead = false;


        msg(
            "✨ Has revivido con toda tu vida"
        );

    }, 5000);
}


// ============================================================
// EXPERIENCIA
// ============================================================

function gainXP(amount) {

    state.xp += amount;


    while (
        state.xp >= state.xpNext
    ) {

        state.xp -=
            state.xpNext;


        state.level++;


        state.xpNext =
            Math.floor(
                state.xpNext * 1.35
            );


        state.maxHp += 15;

        state.hp =
            state.maxHp;


        state.maxMana += 5;

        state.mana =
            state.maxMana;


        state.attack += 3;

        state.defense += 1;


        msg(
            "🎉 ¡Subiste a nivel " +
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


    // TECLADO

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        dy -= 1;
    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        dy += 1;
    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        dx -= 1;
    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        dx += 1;
    }


    // JOYSTICK

    if (
        joystick.active ||
        Math.abs(joystick.dx) > 0 ||
        Math.abs(joystick.dy) > 0
    ) {

        dx = joystick.dx;

        dy = joystick.dy;
    }


    // NORMALIZAR

    const length =
        Math.hypot(dx, dy);


    if (length > 1) {

        dx /= length;

        dy /= length;
    }


    // MOVER

    player.x +=
        dx *
        player.speed *
        dt / 16;


    player.y +=
        dy *
        player.speed *
        dt / 16;


    // LIMITES

    player.x =
        Math.max(
            20,
            Math.min(
                world.w - 20,
                player.x
            )
        );


    player.y =
        Math.max(
            20,
            Math.min(
                world.h - 20,
                player.y
            )
        );
}


// ============================================================
// REGENERACIÓN DE MANÁ
// ============================================================

let manaTimer = 0;


function regenerate(dt) {

    manaTimer += dt;


    if (manaTimer >= 1000) {

        manaTimer = 0;


        if (!state.dead) {

            state.mana =
                Math.min(
                    state.maxMana,
                    state.mana + 2
                );
        }
    }
}


// ============================================================
// DIBUJAR MAPA
// ============================================================

function drawWorld() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.save();


    // ========================================================
    // CÁMARA
    // ========================================================

    const screenCenterX =
        canvas.width / 2;

    const screenCenterY =
        canvas.height / 2;


    ctx.translate(
        screenCenterX,
        screenCenterY
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
    // FONDO
    // ========================================================

    ctx.fillStyle = "#263b25";

    ctx.fillRect(
        0,
        0,
        world.w,
        world.h
    );


    // ========================================================
    // PASTO / TERRENO
    // ========================================================

    ctx.strokeStyle =
        "rgba(255,255,255,0.04)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < world.w;
        x += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
            x,
            world.h
        );

        ctx.stroke();
    }


    for (
        let y = 0;
        y < world.h;
        y += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            world.w,
            y
        );

        ctx.stroke();
    }


    // ========================================================
    // ÁRBOLES
    // ========================================================

    const trees = [

        [250, 250],
        [400, 700],
        [700, 250],
        [1400, 300],
        [1550, 850],
        [300, 1000],
        [1450, 1050]

    ];


    for (const tree of trees) {

        ctx.fillStyle = "#593c24";

        ctx.fillRect(
            tree[0] - 8,
            tree[1],
            16,
            35
        );


        ctx.beginPath();

        ctx.fillStyle = "#1d6b35";

        ctx.arc(
            tree[0],
            tree[1],
            28,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.beginPath();

        ctx.fillStyle = "#2d8a43";

        ctx.arc(
            tree[0] - 10,
            tree[1] - 8,
            18,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    // ========================================================
    // MOBS
    // ========================================================

    for (const mob of mobs) {

        if (mob.hp <= 0) continue;


        const distance =
            Math.hypot(
                player.x - mob.x,
                player.y - mob.y
            );


        // CUERPO

        ctx.beginPath();

        if (mob.name === "Lobo") {

            ctx.fillStyle = "#777";

        } else if (
            mob.name === "Jabalí"
        ) {

            ctx.fillStyle = "#70452d";

        } else {

            ctx.fillStyle = "#4c9b45";
        }


        ctx.arc(
            mob.x,
            mob.y,
            20,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // OJOS

        ctx.fillStyle = "#fff";

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


        // ====================================================
        // INDICADOR DE AGRESIÓN
        // ====================================================

        if (
            distance <= mob.aggroRange
        ) {

            ctx.strokeStyle = "#ff4444";

            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.arc(
                mob.x,
                mob.y,
                25,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }


        // ====================================================
        // BARRA DE VIDA
        // ====================================================

        const barWidth = 50;

        const barHeight = 6;

        const hpPercent =
            Math.max(
                0,
                mob.hp / mob.maxHp
            );


        ctx.fillStyle = "#351515";

        ctx.fillRect(
            mob.x - barWidth / 2,
            mob.y - 34,
            barWidth,
            barHeight
        );


        ctx.fillStyle = "#e33";

        ctx.fillRect(
            mob.x - barWidth / 2,
            mob.y - 34,
            barWidth * hpPercent,
            barHeight
        );


        // NOMBRE

        ctx.fillStyle = "#fff";

        ctx.font =
            "12px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            mob.name,
            mob.x,
            mob.y - 42
        );
    }


    // ========================================================
    // JUGADOR
    // ========================================================

    drawPlayer();


    ctx.restore();
}


// ============================================================
// DIBUJAR JUGADOR
// ============================================================

function drawPlayer() {

    if (state.dead) {

        ctx.globalAlpha = 0.35;
    }


    // CUERPO

    ctx.beginPath();

    ctx.fillStyle = "#3b82f6";

    ctx.arc(
        player.x,
        player.y,
        player.r,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // ARMADURA

    ctx.strokeStyle = "#dbeafe";

    ctx.lineWidth = 3;

    ctx.stroke();


    // CABEZA

    ctx.beginPath();

    ctx.fillStyle = "#f1c27d";

    ctx.arc(
        player.x,
        player.y - 18,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // ESPADA

    ctx.strokeStyle = "#e5e7eb";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
        player.x + 10,
        player.y + 4
    );

    ctx.lineTo(
        player.x + 26,
        player.y - 12
    );

    ctx.stroke();


    // ========================================================
    // CÍRCULO DE VIDA
    // ========================================================

    ctx.globalAlpha = 1;


    const hpPercent =
        Math.max(
            0,
            state.hp / state.maxHp
        );


    ctx.fillStyle = "#321";

    ctx.fillRect(
        player.x - 25,
        player.y + 25,
        50,
        6
    );


    ctx.fillStyle = "#2ecc71";

    ctx.fillRect(
        player.x - 25,
        player.y + 25,
        50 * hpPercent,
        6
    );
}


// ============================================================
// HUD
// ============================================================

function updateHUD() {

    let hud =
        document.getElementById("gameHUD");


    if (!hud) {

        hud =
            document.createElement("div");

        hud.id = "gameHUD";


        hud.style.position =
            "fixed";

        hud.style.top =
            "10px";

        hud.style.left =
            "10px";

        hud.style.zIndex =
            "1000";

        hud.style.color =
            "white";

        hud.style.fontFamily =
            "Arial";

        hud.style.background =
            "rgba(0,0,0,0.55)";

        hud.style.padding =
            "10px";

        hud.style.borderRadius =
            "10px";

        hud.style.fontSize =
            "13px";

        hud.style.minWidth =
            "145px";


        document.body.appendChild(hud);
    }


    hud.innerHTML = `

        <b>🔥 REINOS DE CENIZA</b>

        <br><br>

        ⚔️ Nivel: ${state.level}

        <br>

        ❤️ ${Math.floor(state.hp)}
        / ${state.maxHp}

        <br>

        💧 ${Math.floor(state.mana)}
        / ${state.maxMana}

        <br>

        ⭐ XP: ${state.xp}
        / ${state.xpNext}

        <br>

        🪙 Oro: ${state.gold}

        <br>

        ⚔️ Ataque: ${state.attack}

        <br>

        🛡️ Defensa: ${state.defense}

    `;


    // ========================================================
    // MENSAJE
    // ========================================================

    if (messageTimer > 0) {

        let message =
            document.getElementById(
                "gameMessage"
            );


        if (!message) {

            message =
                document.createElement("div");

            message.id =
                "gameMessage";


            message.style.position =
                "fixed";

            message.style.left =
                "50%";

            message.style.top =
                "18%";

            message.style.transform =
                "translateX(-50%)";

            message.style.zIndex =
                "1100";

            message.style.color =
                "white";

            message.style.background =
                "rgba(0,0,0,0.7)";

            message.style.padding =
                "10px 18px";

            message.style.borderRadius =
                "10px";

            message.style.fontFamily =
                "Arial";

            message.style.fontWeight =
                "bold";

            message.style.textAlign =
                "center";

            message.style.pointerEvents =
                "none";


            document.body.appendChild(
                message
            );
        }


        message.textContent =
            messageText;

        message.style.display =
            "block";

    } else {

        const message =
            document.getElementById(
                "gameMessage"
            );

        if (message) {

            message.style.display =
                "none";
        }
    }
}


// ============================================================
// BOTONES DE HABILIDADES
// ============================================================

function createSkillButtons() {

    let container =
        document.getElementById(
            "skillContainer"
        );


    if (container) return;


    container =
        document.createElement("div");


    container.id =
        "skillContainer";


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
        "7px";


    document.body.appendChild(
        container
    );


    skills.forEach(skill => {

        const button =
            document.createElement("button");


        button.innerHTML =
            skill.icon;


        button.title =
            skill.name;


        button.style.width =
            "55px";

        button.style.height =
            "55px";


        button.style.borderRadius =
            "50%";


        button.style.border =
            "2px solid rgba(255,255,255,0.5)";


        button.style.background =
            "rgba(0,0,0,0.65)";


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

                attackWithSkill(
                    skill
                );
            }
        );


        container.appendChild(
            button
        );
    });
}


// ============================================================
// RELOJ
// ============================================================

let last = performance.now();


// ============================================================
// GAME LOOP
// ============================================================

function gameLoop(now) {

    const dt =
        Math.min(
            40,
            now - last
        );


    last = now;


    updateMovement(dt);

    updateMobs(
        dt,
        now
    );

    regenerate(dt);


    if (messageTimer > 0) {

        messageTimer -= dt;
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

createSkillButtons();

requestAnimationFrame(
    gameLoop
);

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

const state = {
    level: 1,
    xp: 0,
    xpNext: 100,

    hp: 100,
    maxHp: 100,

    gold: 0,

    wood: 0,
    stone: 0,
    copper: 0,
    iron: 0,
    fish: 0,

    attack: 15,
    defense: 2,

    dead: false
};

const player = {
    x: 500,
    y: 350,
    r: 14,
    speed: 3.2,

    attackCooldown: 0,
    hurtCooldown: 0
};

const keys = {};
let last = 0;

const world = {
    w: 1800,
    h: 1200
};

const trees = [
    {x:250,y:260},
    {x:340,y:180},
    {x:470,y:250},
    {x:1400,y:250},
    {x:1510,y:340},
    {x:1300,y:430},
    {x:280,y:850},
    {x:410,y:930},
    {x:1500,y:850}
];

const rocks = [
    {x:720,y:220,type:"copper"},
    {x:820,y:300,type:"iron"},
    {x:950,y:180,type:"stone"},
    {x:1080,y:270,type:"copper"},
    {x:1200,y:190,type:"iron"}
];

const fishSpots = [
    {x:350,y:520},
    {x:500,y:540},
    {x:650,y:500},
    {x:1420,y:620}
];

const mobs = [
    {
        x:900,
        y:650,
        hp:30,
        max:30,
        name:"Lobo",
        damage:5,
        xp:30,
        gold:10,
        alive:true,
        respawn:0
    },

    {
        x:1040,
        y:760,
        hp:45,
        max:45,
        name:"Jabalí",
        damage:8,
        xp:45,
        gold:15,
        alive:true,
        respawn:0
    },

    {
        x:1220,
        y:680,
        hp:60,
        max:60,
        name:"Goblin",
        damage:12,
        xp:70,
        gold:25,
        alive:true,
        respawn:0
    }
];

function resize() {

    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;

    ctx.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0
    );
}

addEventListener("resize", resize);
resize();

addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;
    keys[e.key] = true;

    if (
        e.key === " " ||
        e.key === "e" ||
        e.key === "E"
    ) {

        interact();

        e.preventDefault();
    }
});

addEventListener("keyup", e => {

    keys[e.key.toLowerCase()] = false;
    keys[e.key] = false;
});

document.querySelectorAll("button[data-key]").forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", e => {

        e.preventDefault();

        keys[key] = true;

        if (
            key === "e" ||
            key === " "
        ) {
            interact();
        }
    });

    button.addEventListener("pointerup", () => {
        keys[key] = false;
    });

    button.addEventListener("pointercancel", () => {
        keys[key] = false;
    });

    button.addEventListener("pointerleave", () => {
        keys[key] = false;
    });
});

function near(a, b, distance = 45) {

    return Math.hypot(
        a.x - b.x,
        a.y - b.y
    ) < distance;
}

function msg(text) {

    const element = document.getElementById("message");

    if (element) {
        element.textContent = text;
    }
}

/* =========================
   EXPERIENCIA Y NIVEL
========================= */

function gainXP(amount) {

    state.xp += amount;

    msg(
        "⭐ +" +
        amount +
        " XP"
    );

    while (state.xp >= state.xpNext) {

        state.xp -= state.xpNext;

        levelUp();
    }
}

function levelUp() {

    state.level++;

    state.xpNext =
        Math.floor(
            state.xpNext * 1.35
        );

    state.maxHp += 20;

    state.hp =
        state.maxHp;

    state.attack += 3;

    state.defense += 1;

    msg(
        "🎉 ¡SUBISTE AL NIVEL " +
        state.level +
        "! Vida y ataque aumentados."
    );
}

/* =========================
   COMBATE
========================= */

function attackMob(mob) {

    if (!mob.alive) return;

    if (player.attackCooldown > 0) {

        msg("⚔️ Espera para atacar otra vez.");

        return;
    }

    if (!near(player, mob, 60)) {

        msg(
            "⚔️ Acércate al " +
            mob.name +
            " para atacar."
        );

        return;
    }

    const damage =
        state.attack +
        Math.floor(Math.random() * 6);

    mob.hp -= damage;

    player.attackCooldown = 450;

    if (mob.hp <= 0) {

        mob.hp = 0;

        mob.alive = false;

        mob.respawn = 8000;

        state.gold += mob.gold;

        gainXP(mob.xp);

        msg(
            "☠️ Derrotaste al " +
            mob.name +
            "! +" +
            mob.gold +
            " oro"
        );

        return;
    }

    msg(
        "⚔️ Golpeaste al " +
        mob.name +
        " (-" +
        damage +
        " HP)"
    );
}

/* =========================
   INTERACCIONES
========================= */

function interact() {

    if (state.dead) {

        respawnPlayer();

        return;
    }

    /* Árboles */

    for (const tree of trees) {

        if (near(player, tree, 42)) {

            state.wood++;

            msg(
                "🪓 Talaste un árbol: +1 madera"
            );

            return;
        }
    }

    /* Minerales */

    for (const rock of rocks) {

        if (near(player, rock, 42)) {

            if (rock.type === "copper") {

                state.copper++;
            }

            else if (rock.type === "iron") {

                state.iron++;
            }

            else {

                state.stone++;
            }

            const name =
                rock.type === "copper"
                ? "cobre"
                : rock.type === "iron"
                ? "hierro"
                : "piedra";

            msg(
                "⛏️ Minería: +1 " +
                name
            );

            return;
        }
    }

    /* Pesca */

    for (const fish of fishSpots) {

        if (near(player, fish, 48)) {

            state.fish++;

            msg(
                "🎣 Pescaste: +1 pez"
            );

            return;
        }
    }

    /* Combate */

    let closestMob = null;
    let closestDistance = Infinity;

    for (const mob of mobs) {

        if (!mob.alive) continue;

        const distance =
            Math.hypot(
                player.x - mob.x,
                player.y - mob.y
            );

        if (
            distance < 60 &&
            distance < closestDistance
        ) {

            closestMob = mob;
            closestDistance = distance;
        }
    }

    if (closestMob) {

        attackMob(
            closestMob
        );

        return;
    }

    msg(
        "No hay nada con lo que interactuar aquí."
    );
}

/* =========================
   DAÑO AL JUGADOR
========================= */

function damagePlayer(amount, mobName) {

    if (state.dead) return;

    if (player.hurtCooldown > 0) return;

    const finalDamage =
        Math.max(
            1,
            amount - state.defense
        );

    state.hp -= finalDamage;

    player.hurtCooldown = 800;

    if (state.hp <= 0) {

        state.hp = 0;

        playerDeath();

        return;
    }

    msg(
        "💥 " +
        mobName +
        " te golpeó: -" +
        finalDamage +
        " HP"
    );
}

/* =========================
   MUERTE
========================= */

function playerDeath() {

    state.dead = true;

    msg(
        "☠️ Has muerto. Pulsa E o ESPACIO para reaparecer."
    );
}

function respawnPlayer() {

    state.dead = false;

    state.hp =
        state.maxHp;

    player.x = 500;
    player.y = 350;

    state.gold =
        Math.max(
            0,
            Math.floor(
                state.gold * 0.9
            )
        );

    msg(
        "✨ Has reaparecido. Perdiste el 10% de tu oro."
    );
}

/* =========================
   IA DE MONSTRUOS
========================= */

function updateMobs(dt) {

    for (const mob of mobs) {

        /* Respawn */

        if (!mob.alive) {

            mob.respawn -= dt;

            if (mob.respawn <= 0) {

                mob.hp =
                    mob.max;

                mob.alive = true;

                msg(
                    "👹 Un " +
                    mob.name +
                    " ha reaparecido."
                );
            }

            continue;
        }

        if (state.dead) continue;

        const distance =
            Math.hypot(
                player.x - mob.x,
                player.y - mob.y
            );

        /*
        Los monstruos solamente
        persiguen al jugador
        cuando está cerca.
        */

        if (
            distance < 180 &&
            distance > 42
        ) {

            const dx =
                player.x - mob.x;

            const dy =
                player.y - mob.y;

            const length =
                Math.hypot(
                    dx,
                    dy
                );

            mob.x +=
                dx / length *
                0.75 *
                (dt / 16);

            mob.y +=
                dy / length *
                0.75 *
                (dt / 16);
        }

        /* Ataque */

        if (
            distance <= 45
        ) {

            if (
                Math.random() <
                0.025 *
                (dt / 16)
            ) {

                damagePlayer(
                    mob.damage,
                    mob.name
                );
            }
        }
    }
}

/* =========================
   MUNDO
========================= */

function drawWorld(camX, camY) {

    ctx.fillStyle =
        "#4d8a49";

    ctx.fillRect(
        0,
        0,
        innerWidth,
        innerHeight
    );

    /* Agua */

    ctx.fillStyle =
        "#2d72a8";

    ctx.fillRect(
        -camX,
        480 - camY,
        760,
        190
    );

    ctx.fillRect(
        1260 - camX,
        540 - camY,
        540,
        180
    );

    /* Camino */

    ctx.fillStyle =
        "#b99b67";

    ctx.fillRect(
        -camX,
        600 - camY,
        1800,
        55
    );

    /* Árboles */

    for (const tree of trees) {

        const x =
            tree.x - camX;

        const y =
            tree.y - camY;

        ctx.fillStyle =
            "#65432d";

        ctx.fillRect(
            x - 5,
            y + 8,
            10,
            22
        );

        ctx.fillStyle =
            "#246b32";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            25,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#34853f";

        ctx.beginPath();

        ctx.arc(
            x - 12,
            y - 8,
            15,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    /* Minerales */

    for (const rock of rocks) {

        const x =
            rock.x - camX;

        const y =
            rock.y - camY;

        ctx.fillStyle =
            rock.type === "copper"
            ? "#a76538"
            : rock.type === "iron"
            ? "#6f747b"
            : "#888";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            22,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "11px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            rock.type === "copper"
            ? "Cobre"
            : rock.type === "iron"
            ? "Hierro"
            : "Piedra",
            x,
            y + 4
        );
    }

    /* Pesca */

    for (const fish of fishSpots) {

        const x =
            fish.x - camX;

        const y =
            fish.y - camY;

        ctx.font =
            "22px Arial";

        ctx.fillText(
            "🐟",
            x,
            y
        );
    }

    /* Monstruos */

    for (const mob of mobs) {

        if (!mob.alive) continue;

        const x =
            mob.x - camX;

        const y =
            mob.y - camY;

        ctx.font =
            "28px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(

            mob.name === "Lobo"
            ? "🐺"
            : mob.name === "Jabalí"
            ? "🐗"
            : "👹",

            x,
            y
        );

        /* Barra de vida */

        ctx.fillStyle =
            "#222";

        ctx.fillRect(
            x - 25,
            y - 35,
            50,
            6
        );

        ctx.fillStyle =
            "#e44";

        ctx.fillRect(
            x - 25,
            y - 35,
            50 *
            (mob.hp / mob.max),
            6
        );

        /* Nombre */

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "12px Arial";

        ctx.fillText(
            mob.name,
            x,
            y - 42
        );
    }

    /* Jugador */

    const px =
        player.x - camX;

    const py =
        player.y - camY;

    ctx.font =
        "30px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "🧙",
        px,
        py + 10
    );

    /* Barra de vida */

    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        px - 30,
        py - 32,
        60,
        7
    );

    ctx.fillStyle =
        "#31d158";

    ctx.fillRect(
        px - 30,
        py - 32,
        60 *
        (state.hp / state.maxHp),
        7
    );

    /* Barra de experiencia */

    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        px - 30,
        py - 23,
        60,
        5
    );

    ctx.fillStyle =
        "#4da6ff";

    ctx.fillRect(
        px - 30,
        py - 23,
        60 *
        (state.xp / state.xpNext),
        5
    );

    /* Pantalla de muerte */

    if (state.dead) {

        ctx.fillStyle =
            "rgba(0,0,0,0.65)";

        ctx.fillRect(
            0,
            0,
            innerWidth,
            innerHeight
        );

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "32px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "☠️ HAS MUERTO",
            innerWidth / 2,
            innerHeight / 2 - 20
        );

        ctx.font =
            "18px Arial";

        ctx.fillText(
            "Pulsa E o ESPACIO para reaparecer",
            innerWidth / 2,
            innerHeight / 2 + 25
        );
    }
}

/* =========================
   ACTUALIZACIÓN
========================= */

function update(time) {

    const dt =
        Math.min(
            32,
            time - last || 16
        );

    last = time;

    /* Cooldowns */

    if (player.attackCooldown > 0) {

        player.attackCooldown -= dt;

        if (
            player.attackCooldown < 0
        ) {

            player.attackCooldown = 0;
        }
    }

    if (player.hurtCooldown > 0) {

        player.hurtCooldown -= dt;

        if (
            player.hurtCooldown < 0
        ) {

            player.hurtCooldown = 0;
        }
    }

    /* Movimiento */

    let dx = 0;
    let dy = 0;

    if (!state.dead) {

        if (
            keys["w"] ||
            keys["ArrowUp"]
        )
            dy--;

        if (
            keys["s"] ||
            keys["ArrowDown"]
        )
            dy++;

        if (
            keys["a"] ||
            keys["ArrowLeft"]
        )
            dx--;

        if (
            keys["d"] ||
            keys["ArrowRight"]
        )
            dx++;
    }

    if (dx || dy) {

        const length =
            Math.hypot(
                dx,
                dy
            );

        player.x +=
            dx / length *
            player.speed *
            (dt / 16);

        player.y +=
            dy / length *
            player.speed *
            (dt / 16);
    }

    /* Límites */

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

    /* Monstruos */

    updateMobs(dt);

    /* Cámara */

    const camX =
        Math.max(
            0,
            Math.min(
                world.w - innerWidth,
                player.x -
                innerWidth / 2
            )
        );

    const camY =
        Math.max(
            0,
            Math.min(
                world.h - innerHeight,
                player.y -
                innerHeight / 2
            )
        );

    drawWorld(
        camX,
        camY
    );

    /* Interfaz */

    const level =
        document.getElementById("level");

    const hp =
        document.getElementById("hp");

    const gold =
        document.getElementById("gold");

    const wood =
        document.getElementById("wood");

    const stone =
        document.getElementById("stone");

    const copper =
        document.getElementById("copper");

    const iron =
        document.getElementById("iron");

    const fish =
        document.getElementById("fish");

    if (level)
        level.textContent =
            state.level;

    if (hp)
        hp.textContent =
            state.hp + "/" + state.maxHp;

    if (gold)
        gold.textContent =
            state.gold;

    if (wood)
        wood.textContent =
            state.wood;

    if (stone)
        stone.textContent =
            state.stone;

    if (copper)
        copper.textContent =
            state.copper;

    if (iron)
        iron.textContent =
            state.iron;

    if (fish)
        fish.textContent =
            state.fish;

    requestAnimationFrame(
        update
    );
}

msg(
    "Muévete con WASD, flechas o los botones táctiles. Pulsa E o ESPACIO para recolectar o atacar."
);

requestAnimationFrame(
    update
);

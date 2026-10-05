const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

const state = {
    level: 1,
    hp: 100,
    gold: 0,
    wood: 0,
    stone: 0,
    copper: 0,
    iron: 0,
    fish: 0
};

const player = {
    x: 500,
    y: 350,
    r: 14,
    speed: 3.2
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
    {x:900,y:650,hp:30,max:30,name:"Lobo"},
    {x:1040,y:760,hp:45,max:45,name:"Jabalí"},
    {x:1220,y:680,hp:60,max:60,name:"Goblin"}
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
    return Math.hypot(a.x - b.x, a.y - b.y) < distance;
}

function msg(text) {
    document.getElementById("message").textContent = text;
}

function interact() {

    for (const tree of trees) {

        if (near(player, tree, 42)) {

            state.wood++;

            msg("🪓 Talaste un árbol: +1 madera");

            return;
        }
    }

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

            msg(
                "⛏️ Minería: +1 " +
                (
                    rock.type === "copper"
                    ? "cobre"
                    : rock.type === "iron"
                    ? "hierro"
                    : "piedra"
                )
            );

            return;
        }
    }

    for (const fish of fishSpots) {

        if (near(player, fish, 48)) {

            state.fish++;

            msg("🎣 Pescaste: +1 pez");

            return;
        }
    }

    for (const mob of mobs) {

        if (mob.hp > 0 && near(player, mob, 48)) {

            mob.hp -= 15;

            if (mob.hp <= 0) {

                state.gold += 10;
                state.level++;

                msg(
                    "⚔️ " +
                    mob.name +
                    " derrotado: +10 oro y +1 nivel"
                );

            } else {

                msg(
                    "⚔️ Golpeaste al " +
                    mob.name +
                    " (-15 HP)"
                );
            }

            return;
        }
    }
}

addEventListener("keydown", e => {

    if (
        e.key === " " ||
        e.key === "e" ||
        e.key === "E"
    ) {

        interact();

        e.preventDefault();
    }
});

function drawWorld(camX, camY) {

    ctx.fillStyle = "#4d8a49";

    ctx.fillRect(
        0,
        0,
        innerWidth,
        innerHeight
    );

    // Agua

    ctx.fillStyle = "#2d72a8";

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

    // Camino

    ctx.fillStyle = "#b99b67";

    ctx.fillRect(
        -camX,
        600 - camY,
        1800,
        55
    );

    // Árboles

    for (const tree of trees) {

        const x = tree.x - camX;
        const y = tree.y - camY;

        ctx.fillStyle = "#65432d";

        ctx.fillRect(
            x - 5,
            y + 8,
            10,
            22
        );

        ctx.fillStyle = "#246b32";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            25,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#34853f";

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

    // Minerales

    for (const rock of rocks) {

        const x = rock.x - camX;
        const y = rock.y - camY;

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

        ctx.fillStyle = "#fff";
        ctx.font = "11px Arial";
        ctx.textAlign = "center";

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

    // Pesca

    for (const fish of fishSpots) {

        const x = fish.x - camX;
        const y = fish.y - camY;

        ctx.font = "22px Arial";
        ctx.fillText("🐟", x, y);
    }

    // Monstruos

    for (const mob of mobs) {

        if (mob.hp <= 0) continue;

        const x = mob.x - camX;
        const y = mob.y - camY;

        ctx.font = "28px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            mob.name === "Lobo"
            ? "🐺"
            : mob.name === "Jabalí"
            ? "🐗"
            : "👹",
            x,
            y
        );

        ctx.fillStyle = "#222";

        ctx.fillRect(
            x - 22,
            y - 32,
            44,
            5
        );

        ctx.fillStyle = "#e44";

        ctx.fillRect(
            x - 22,
            y - 32,
            44 * (mob.hp / mob.max),
            5
        );
    }

    // Jugador

    const px = player.x - camX;
    const py = player.y - camY;

    ctx.font = "30px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "🧙",
        px,
        py + 10
    );
}

function update(time) {

    const dt = Math.min(
        32,
        time - last || 16
    );

    last = time;

    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["ArrowUp"])
        dy--;

    if (keys["s"] || keys["ArrowDown"])
        dy++;

    if (keys["a"] || keys["ArrowLeft"])
        dx--;

    if (keys["d"] || keys["ArrowRight"])
        dx++;

    if (dx || dy) {

        const length = Math.hypot(dx, dy);

        player.x +=
            dx / length *
            player.speed *
            (dt / 16);

        player.y +=
            dy / length *
            player.speed *
            (dt / 16);
    }

    player.x = Math.max(
        20,
        Math.min(
            world.w - 20,
            player.x
        )
    );

    player.y = Math.max(
        20,
        Math.min(
            world.h - 20,
            player.y
        )
    );

    const camX = Math.max(
        0,
        Math.min(
            world.w - innerWidth,
            player.x - innerWidth / 2
        )
    );

    const camY = Math.max(
        0,
        Math.min(
            world.h - innerHeight,
            player.y - innerHeight / 2
        )
    );

    drawWorld(
        camX,
        camY
    );

    document.getElementById("level").textContent =
        state.level;

    document.getElementById("hp").textContent =
        state.hp;

    document.getElementById("gold").textContent =
        state.gold;

    document.getElementById("wood").textContent =
        state.wood;

    document.getElementById("stone").textContent =
        state.stone;

    document.getElementById("copper").textContent =
        state.copper;

    document.getElementById("iron").textContent =
        state.iron;

    document.getElementById("fish").textContent =
        state.fish;

    requestAnimationFrame(update);
}

msg(
    "Muévete con WASD, flechas o los botones táctiles. Pulsa E o ESPACIO cerca de un recurso o monstruo."
);

requestAnimationFrame(update);

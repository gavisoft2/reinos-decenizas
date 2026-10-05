const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

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


/* =========================
   MUNDO
========================= */

const world = {
    w: 1800,
    h: 1200
};


/* =========================
   ÁRBOLES
========================= */

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


/* =========================
   MINERALES
========================= */

const rocks = [
    {x:720,y:220,type:"copper"},
    {x:820,y:300,type:"iron"},
    {x:950,y:180,type:"stone"},
    {x:1080,y:270,type:"copper"},
    {x:1200,y:190,type:"iron"}
];


/* =========================
   PESCA
========================= */

const fishSpots = [
    {x:350,y:520},
    {x:500,y:540},
    {x:650,y:500},
    {x:1420,y:620}
];


/* =========================
   MONSTRUOS
========================= */

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


/* =========================
   HABILIDADES
========================= */

const skills = [

    {
        id:"golpe",
        name:"⚔️",
        title:"Golpe Poderoso",
        level:1,
        damage:25,
        mana:0,
        cooldown:700,
        current:0
    },

    {
        id:"fuego",
        name:"🔥",
        title:"Golpe de Fuego",
        level:3,
        damage:45,
        mana:10,
        cooldown:1800,
        current:0
    },

    {
        id:"escudo",
        name:"🛡️",
        title:"Escudo",
        level:5,
        damage:0,
        mana:15,
        cooldown:8000,
        current:0
    },

    {
        id:"rapido",
        name:"💨",
        title:"Ataque Rápido",
        level:8,
        damage:65,
        mana:20,
        cooldown:3000,
        current:0
    },

    {
        id:"torbellino",
        name:"🌪️",
        title:"Torbellino",
        level:15,
        damage:90,
        mana:30,
        cooldown:5000,
        current:0
    },

    {
        id:"ejecucion",
        name:"☠️",
        title:"Ejecución",
        level:20,
        damage:150,
        mana:40,
        cooldown:10000,
        current:0
    }

];


/* =========================
   INTERFAZ DE COMBATE
========================= */

function createCombatUI() {

    let old = document.getElementById("combatUI");

    if (old) {
        old.remove();
    }

    const ui = document.createElement("div");

    ui.id = "combatUI";

    ui.style.position = "fixed";
    ui.style.right = "15px";
    ui.style.bottom = "20px";
    ui.style.display = "flex";
    ui.style.flexDirection = "column";
    ui.style.alignItems = "center";
    ui.style.gap = "8px";
    ui.style.zIndex = "9999";
    ui.style.userSelect = "none";

    const attack = document.createElement("button");

    attack.id = "attackButton";

    attack.textContent = "⚔️";

    attack.style.width = "85px";
    attack.style.height = "85px";
    attack.style.borderRadius = "50%";
    attack.style.border = "3px solid white";
    attack.style.background = "#b52b2b";
    attack.style.color = "white";
    attack.style.fontSize = "36px";
    attack.style.fontWeight = "bold";

    attack.addEventListener("pointerdown", function(e) {

        e.preventDefault();

        useBasicAttack();

    });

    ui.appendChild(attack);


    const skillRow = document.createElement("div");

    skillRow.id = "skillRow";

    skillRow.style.display = "flex";
    skillRow.style.gap = "7px";
    skillRow.style.justifyContent = "center";

    ui.appendChild(skillRow);


    document.body.appendChild(ui);

    updateSkillButtons();

}


/* =========================
   BOTONES DE HABILIDADES
========================= */

function updateSkillButtons() {

    const row =
        document.getElementById("skillRow");

    if (!row) return;

    row.innerHTML = "";

    for (const skill of skills) {

        if (state.level < skill.level) {

            continue;
        }

        const button =
            document.createElement("button");

        button.textContent =
            skill.name;

        button.title =
            skill.title;

        button.style.width = "55px";
        button.style.height = "55px";
        button.style.borderRadius = "12px";
        button.style.border = "2px solid white";
        button.style.background = "#333";
        button.style.color = "white";
        button.style.fontSize = "25px";
        button.style.position = "relative";

        button.addEventListener(
            "pointerdown",
            function(e) {

                e.preventDefault();

                useSkill(skill);

            }
        );

        row.appendChild(button);
    }
}


/* =========================
   ATAQUE BÁSICO
========================= */

function useBasicAttack() {

    if (state.dead) return;

    if (player.attackCooldown > 0) {

        return;
    }

    const mob =
        getClosestMob(65);

    if (!mob) {

        msg(
            "⚔️ Acércate a un enemigo."
        );

        return;
    }

    const damage =
        state.attack +
        Math.floor(
            Math.random() * 6
        );

    damageMob(
        mob,
        damage,
        "⚔️ Ataque"
    );

    player.attackCooldown = 500;
}


/* =========================
   HABILIDADES
========================= */

function useSkill(skill) {

    if (state.dead) return;

    if (skill.current > 0) {

        msg(
            "⏳ " +
            skill.title +
            " todavía está en cooldown."
        );

        return;
    }

    if (state.level < skill.level) {

        msg(
            "🔒 Necesitas nivel " +
            skill.level
        );

        return;
    }

    if (state.mana < skill.mana) {

        msg(
            "🔵 No tienes suficiente maná."
        );

        return;
    }


    /* ESCUDO */

    if (skill.id === "escudo") {

        state.mana -= skill.mana;

        state.hp += 35;

        if (state.hp > state.maxHp) {
            state.hp = state.maxHp;
        }

        skill.current =
            skill.cooldown;

        msg(
            "🛡️ Usaste Escudo. +35 vida."
        );

        return;
    }


    const mob =
        getClosestMob(85);

    if (!mob) {

        msg(
            "⚔️ Acércate a un enemigo."
        );

        return;
    }


    state.mana -= skill.mana;

    let damage =
        skill.damage +
        state.attack;


    /* TORBELLINO */

    if (skill.id === "torbellino") {

        let hitCount = 0;

        for (const enemy of mobs) {

            if (!enemy.alive) continue;

            const distance =
                Math.hypot(
                    player.x - enemy.x,
                    player.y - enemy.y
                );

            if (distance <= 120) {

                damageMob(
                    enemy,
                    damage,
                    "🌪️ Torbellino"
                );

                hitCount++;
            }
        }

        if (hitCount === 0) {

            msg(
                "🌪️ No alcanzaste ningún enemigo."
            );
        }

        skill.current =
            skill.cooldown;

        return;
    }


    /* EJECUCIÓN */

    if (skill.id === "ejecucion") {

        if (
            mob.hp <=
            mob.max * 0.30
        ) {

            damageMob(
                mob,
                mob.hp + 999,
                "☠️ EJECUCIÓN"
            );

        } else {

            damageMob(
                mob,
                damage,
                "☠️ Ejecución"
            );
        }

    } else {

        damageMob(
            mob,
            damage,
            skill.name +
            " " +
            skill.title
        );
    }


    skill.current =
        skill.cooldown;
}


/* =========================
   ENEMIGO MÁS CERCANO
========================= */

function getClosestMob(distanceLimit) {

    let closest = null;

    let closestDistance =
        Infinity;

    for (const mob of mobs) {

        if (!mob.alive) continue;

        const distance =
            Math.hypot(
                player.x - mob.x,
                player.y - mob.y
            );

        if (
            distance <= distanceLimit &&
            distance < closestDistance
        ) {

            closest = mob;

            closestDistance =
                distance;
        }
    }

    return closest;
}


/* =========================
   DAÑO A MONSTRUO
========================= */

function damageMob(
    mob,
    damage,
    attackName
) {

    if (!mob.alive) return;

    mob.hp -= damage;

    if (mob.hp <= 0) {

        mob.hp = 0;

        mob.alive = false;

        mob.respawn = 8000;

        state.gold += mob.gold;

        gainXP(mob.xp);

        msg(
            "☠️ " +
            mob.name +
            " derrotado. +" +
            mob.gold +
            " oro."
        );

        return;
    }

    msg(
        attackName +
        " -" +
        damage +
        " HP"
    );
}


/* =========================
   EXPERIENCIA
========================= */

function gainXP(amount) {

    state.xp += amount;

    while (
        state.xp >=
        state.xpNext
    ) {

        state.xp -=
            state.xpNext;

        levelUp();
    }
}


/* =========================
   SUBIR NIVEL
========================= */

function levelUp() {

    state.level++;

    state.xpNext =
        Math.floor(
            state.xpNext * 1.35
        );

    state.maxHp += 20;

    state.hp =
        state.maxHp;

    state.maxMana += 10;

    state.mana =
        state.maxMana;

    state.attack += 3;

    state.defense += 1;


    msg(
        "🎉 ¡NIVEL " +
        state.level +
        "!"
    );


    for (const skill of skills) {

        if (
            skill.level ===
            state.level
        ) {

            setTimeout(
                function() {

                    msg(
                        "🔥 ¡Nueva habilidad: " +
                        skill.title +
                        "!"
                    );

                },
                300
            );
        }
    }

    updateSkillButtons();
}


/* =========================
   DAÑO AL JUGADOR
========================= */

function damagePlayer(
    amount,
    mobName
) {

    if (state.dead) return;

    if (player.hurtCooldown > 0) return;

    const damage =
        Math.max(
            1,
            amount -
            state.defense
        );

    state.hp -= damage;

    player.hurtCooldown =
        800;

    if (state.hp <= 0) {

        state.hp = 0;

        playerDeath();

        return;
    }

    msg(
        "💥 " +
        mobName +
        " te golpeó -" +
        damage +
        " HP"
    );
}


/* =========================
   MUERTE
========================= */

function playerDeath() {

    state.dead = true;

    msg(
        "☠️ Has muerto. Pulsa ⚔️ para reaparecer."
    );
}


/* =========================
   RESPAWN
========================= */

function respawnPlayer() {

    state.dead = false;

    state.hp =
        state.maxHp;

    state.mana =
        state.maxMana;

    player.x = 500;
    player.y = 350;

    state.gold =
        Math.floor(
            state.gold * 0.9
        );

    msg(
        "✨ Has reaparecido. Perdiste 10% del oro."
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


    /* ÁRBOL */

    for (const tree of trees) {

        if (
            near(
                player,
                tree,
                42
            )
        ) {

            state.wood++;

            msg(
                "🪓 Talaste un árbol: +1 madera"
            );

            return;
        }
    }


    /* MINERAL */

    for (const rock of rocks) {

        if (
            near(
                player,
                rock,
                42
            )
        ) {

            if (
                rock.type ===
                "copper"
            ) {

                state.copper++;

            } else if (
                rock.type ===
                "iron"
            ) {

                state.iron++;

            } else {

                state.stone++;
            }

            const name =
                rock.type ===
                "copper"
                ? "cobre"
                : rock.type ===
                "iron"
                ? "hierro"
                : "piedra";

            msg(
                "⛏️ +1 " +
                name
            );

            return;
        }
    }


    /* PESCA */

    for (
        const fish of fishSpots
    ) {

        if (
            near(
                player,
                fish,
                48
            )
        ) {

            state.fish++;

            msg(
                "🎣 +1 pez"
            );

            return;
        }
    }


    /* ATAQUE */

    const mob =
        getClosestMob(65);

    if (mob) {

        useBasicAttack();

        return;
    }


    msg(
        "No hay nada con lo que interactuar."
    );
}


/* =========================
   DISTANCIA
========================= */

function near(
    a,
    b,
    distance = 45
) {

    return Math.hypot(
        a.x - b.x,
        a.y - b.y
    ) < distance;
}


/* =========================
   MENSAJES
========================= */

function msg(text) {

    const element =
        document.getElementById(
            "message"
        );

    if (element) {

        element.textContent =
            text;
    }
}


/* =========================
   CONTROLES TECLADO
========================= */

addEventListener(
    "keydown",
    e => {

        keys[
            e.key.toLowerCase()
        ] = true;

        keys[e.key] = true;


        if (
            e.key === "e" ||
            e.key === "E"
        ) {

            interact();

            e.preventDefault();
        }


        if (
            e.key === " "
        ) {

            useBasicAttack();

            e.preventDefault();
        }

    }
);


addEventListener(
    "keyup",
    e => {

        keys[
            e.key.toLowerCase()
        ] = false;

        keys[e.key] = false;

    }
);


/* =========================
   BOTONES EXISTENTES
========================= */

document
.querySelectorAll(
    "button[data-key]"
)
.forEach(
    button => {

        const key =
            button.dataset.key;

        button.addEventListener(
            "pointerdown",
            e => {

                e.preventDefault();

                keys[key] = true;

                if (
                    key === "e" ||
                    key === " "
                ) {

                    interact();
                }

            }
        );


        button.addEventListener(
            "pointerup",
            () => {

                keys[key] = false;

            }
        );


        button.addEventListener(
            "pointercancel",
            () => {

                keys[key] = false;

            }
        );


        button.addEventListener(
            "pointerleave",
            () => {

                keys[key] = false;

            }
        );

    }
);


/* =========================
   MONSTRUOS
========================= */

function updateMobs(dt) {

    for (
        const mob of mobs
    ) {


        /* RESPAWN */

        if (!mob.alive) {

            mob.respawn -= dt;

            if (
                mob.respawn <= 0
            ) {

                mob.hp =
                    mob.max;

                mob.alive =
                    true;

                msg(
                    "👹 Un " +
                    mob.name +
                    " reapareció."
                );
            }

            continue;
        }


        if (state.dead)
            continue;


        const distance =
            Math.hypot(
                player.x -
                mob.x,

                player.y -
                mob.y
            );


        /* PERSEGUIR */

        if (
            distance < 180 &&
            distance > 42
        ) {

            const dx =
                player.x -
                mob.x;

            const dy =
                player.y -
                mob.y;

            const length =
                Math.hypot(
                    dx,
                    dy
                );


            mob.x +=
                dx /
                length *
                0.75 *
                (dt / 16);


            mob.y +=
                dy /
                length *
                0.75 *
                (dt / 16);
        }


        /* ATAQUE */

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
   DIBUJAR MUNDO
========================= */

function drawWorld(
    camX,
    camY
) {

    /* PASTO */

    ctx.fillStyle =
        "#4d8a49";

    ctx.fillRect(
        0,
        0,
        innerWidth,
        innerHeight
    );


    /* AGUA */

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


    /* CAMINO */

    ctx.fillStyle =
        "#b99b67";

    ctx.fillRect(
        -camX,
        600 - camY,
        1800,
        55
    );


    /* ÁRBOLES */

    for (
        const tree of trees
    ) {

        const x =
            tree.x -
            camX;

        const y =
            tree.y -
            camY;


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


    /* MINERALES */

    for (
        const rock of rocks
    ) {

        const x =
            rock.x -
            camX;

        const y =
            rock.y -
            camY;


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


    /* PESCA */

    for (
        const fish of fishSpots
    ) {

        const x =
            fish.x -
            camX;

        const y =
            fish.y -
            camY;


        ctx.font =
            "22px Arial";


        ctx.fillText(
            "🐟",
            x,
            y
        );

    }


    /* MONSTRUOS */

    for (
        const mob of mobs
    ) {

        if (!mob.alive)
            continue;


        const x =
            mob.x -
            camX;

        const y =
            mob.y -
            camY;


        ctx.font =
            "28px Arial";

        ctx.textAlign =
            "center";


        ctx.fillText(

            mob.name ===
            "Lobo"

            ? "🐺"

            : mob.name ===
            "Jabalí"

            ? "🐗"

            : "👹",

            x,
            y
        );


        /* BARRA DE VIDA */

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
            (
                mob.hp /
                mob.max
            ),
            6
        );


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


    /* JUGADOR */

    const px =
        player.x -
        camX;

    const py =
        player.y -
        camY;


    ctx.font =
        "30px Arial";

    ctx.textAlign =
        "center";


    ctx.fillText(
        "🧙",
        px,
        py + 10
    );


    /* VIDA */

    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        px - 35,
        py - 38,
        70,
        7
    );


    ctx.fillStyle =
        "#31d158";

    ctx.fillRect(
        px - 35,
        py - 38,
        70 *
        (
            state.hp /
            state.maxHp
        ),
        7
    );


    /* MANÁ */

    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        px - 35,
        py - 29,
        70,
        6
    );


    ctx.fillStyle =
        "#3288ff";

    ctx.fillRect(
        px - 35,
        py - 29,
        70 *
        (
            state.mana /
            state.maxMana
        ),
        6
    );


    /* XP */

    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        px - 35,
        py - 21,
        70,
        5
    );


    ctx.fillStyle =
        "#c83cff";

    ctx.fillRect(
        px - 35,
        py - 21,
        70 *
        (
            state.xp /
            state.xpNext
        ),
        5
    );


    /* NIVEL */

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "13px Arial";


    ctx.fillText(
        "Nivel " +
        state.level,
        px,
        py - 48
    );


    /* MUERTE */

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
            "Pulsa ⚔️ para reaparecer",
            innerWidth / 2,
            innerHeight / 2 + 25
        );

    }

}


/* =========================
   ACTUALIZAR
========================= */

function update(time) {

    const dt =
        Math.min(
            32,
            time -
            last ||
            16
        );

    last = time;


    /* COOLDOWNS */

    if (
        player.attackCooldown > 0
    ) {

        player.attackCooldown -=
            dt;

        if (
            player.attackCooldown <
            0
        ) {

            player.attackCooldown =
                0;
        }
    }


    if (
        player.hurtCooldown > 0
    ) {

        player.hurtCooldown -=
            dt;

        if (
            player.hurtCooldown <
            0
        ) {

            player.hurtCooldown =
                0;
        }
    }


    /* HABILIDADES */

    for (
        const skill of skills
    ) {

        if (
            skill.current > 0
        ) {

            skill.current -=
                dt;

            if (
                skill.current < 0
            ) {

                skill.current = 0;
            }
        }

    }


    /* REGENERACIÓN DE MANÁ */

    if (!state.dead) {

        state.mana +=
            0.02 *
            (dt / 16);

        if (
            state.mana >
            state.maxMana
        ) {

            state.mana =
                state.maxMana;
        }
    }


    /* MOVIMIENTO */

    let dx = 0;
    let dy = 0;


    if (!state.dead) {

        if (
            keys["w"] ||
            keys["ArrowUp"]
        ) {

            dy--;
        }


        if (
            keys["s"] ||
            keys["ArrowDown"]
        ) {

            dy++;
        }


        if (
            keys["a"] ||
            keys["ArrowLeft"]
        ) {

            dx--;
        }


        if (
            keys["d"] ||
            keys["ArrowRight"]
        ) {

            dx++;
        }

    }


    if (
        dx ||
        dy
    ) {

        const length =
            Math.hypot(
                dx,
                dy
            );


        player.x +=
            dx /
            length *
            player.speed *
            (dt / 16);


        player.y +=
            dy /
            length *
            player.speed *
            (dt / 16);
    }


    /* LÍMITES */

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


    /* MONSTRUOS */

    updateMobs(dt);


    /* CÁMARA */

    const camX =
        Math.max(
            0,
            Math.min(
                world.w -
                innerWidth,

                player.x -
                innerWidth / 2
            )
        );


    const camY =
        Math.max(
            0,
            Math.min(
                world.h -
                innerHeight,

                player.y -
                innerHeight / 2
            )
        );


    drawWorld(
        camX,
        camY
    );


    /* INTERFAZ EXISTENTE */

    const level =
        document.getElementById(
            "level"
        );

    const hp =
        document.getElementById(
            "hp"
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


    if (level)
        level.textContent =
            state.level;


    if (hp)
        hp.textContent =
            Math.floor(
                state.hp
            ) +
            "/" +
            state.maxHp;


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


/* =========================
   INICIO
========================= */

createCombatUI();


msg(
    "📱 Usa el botón ⚔️ para atacar. Las habilidades aparecerán al subir de nivel."
);


requestAnimationFrame(
    update
);

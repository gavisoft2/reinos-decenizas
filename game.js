const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "#111";
document.body.style.touchAction = "none";
document.body.style.userSelect = "none";

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

const player = {
    x: 500,
    y: 350,
    speed: 3.2,
    r: 16
};

const world = {
    w: 1800,
    h: 1200
};

const camera = {
    zoom: 0.72
};

const keys = {};

let last = 0;


/* =====================================================
   JOYSTICK
===================================================== */

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


/* =====================================================
   MUNDO
===================================================== */

const trees = [

    { x: 250, y: 260 },
    { x: 340, y: 180 },
    { x: 470, y: 250 },

    { x: 1400, y: 250 },
    { x: 1510, y: 340 },
    { x: 1300, y: 430 },

    { x: 280, y: 850 },
    { x: 410, y: 930 },
    { x: 1500, y: 850 }

];


const rocks = [

    {
        x: 720,
        y: 220,
        type: "copper"
    },

    {
        x: 820,
        y: 300,
        type: "iron"
    },

    {
        x: 950,
        y: 180,
        type: "stone"
    },

    {
        x: 1080,
        y: 270,
        type: "copper"
    },

    {
        x: 1200,
        y: 190,
        type: "iron"
    }

];


const fishSpots = [

    {
        x: 350,
        y: 520
    },

    {
        x: 500,
        y: 540
    },

    {
        x: 650,
        y: 500
    },

    {
        x: 1420,
        y: 620
    }

];


const mobs = [

    {
        x: 900,
        y: 650,
        hp: 30,
        max: 30,
        name: "Lobo"
    },

    {
        x: 1040,
        y: 760,
        hp: 45,
        max: 45,
        name: "Jabalí"
    },

    {
        x: 1220,
        y: 680,
        hp: 60,
        max: 60,
        name: "Goblin"
    }

];


/* =====================================================
   HABILIDADES
===================================================== */

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


/* =====================================================
   RESIZE
===================================================== */

function resize() {

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        window.innerWidth * dpr;

    canvas.height =
        window.innerHeight * dpr;

    canvas.style.width =
        window.innerWidth + "px";

    canvas.style.height =
        window.innerHeight + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    createJoystick();
}


window.addEventListener(
    "resize",
    resize
);


/* =====================================================
   MENSAJE
===================================================== */

function msg(text) {

    const message =
        document.getElementById(
            "message"
        );

    if (message) {

        message.textContent =
            text;
    }
}


/* =====================================================
   JOYSTICK
===================================================== */

function createJoystick() {

    const old =
        document.getElementById(
            "virtualJoystick"
        );

    if (old) {

        old.remove();
    }


    const base =
        document.createElement(
            "div"
        );

    base.id =
        "virtualJoystick";


    const size =
        window.innerWidth < 500
        ? 130
        : 150;


    base.style.position =
        "fixed";

    base.style.left =
        "22px";

    base.style.bottom =
        "22px";

    base.style.width =
        size + "px";

    base.style.height =
        size + "px";

    base.style.borderRadius =
        "50%";

    base.style.background =
        "rgba(20,20,25,0.60)";

    base.style.border =
        "3px solid rgba(255,255,255,0.35)";

    base.style.boxShadow =
        "0 5px 20px rgba(0,0,0,0.5)";

    base.style.zIndex =
        "9999";

    base.style.touchAction =
        "none";

    base.style.display =
        "flex";

    base.style.alignItems =
        "center";

    base.style.justifyContent =
        "center";


    const knob =
        document.createElement(
            "div"
        );

    knob.id =
        "joystickKnob";


    knob.style.width =
        "58px";

    knob.style.height =
        "58px";

    knob.style.borderRadius =
        "50%";

    knob.style.background =
        "rgba(255,255,255,0.82)";

    knob.style.border =
        "3px solid rgba(255,255,255,0.95)";

    knob.style.boxShadow =
        "0 3px 12px rgba(0,0,0,0.5)";

    knob.style.pointerEvents =
        "none";


    base.appendChild(
        knob
    );

    document.body.appendChild(
        base
    );


    base.addEventListener(
        "pointerdown",
        joystickStart
    );

    base.addEventListener(
        "pointermove",
        joystickMove
    );

    base.addEventListener(
        "pointerup",
        joystickEnd
    );

    base.addEventListener(
        "pointercancel",
        joystickEnd
    );
}


function joystickStart(e) {

    e.preventDefault();

    joystick.active =
        true;

    joystick.id =
        e.pointerId;


    const rect =
        e.currentTarget.getBoundingClientRect();


    joystick.centerX =
        rect.left +
        rect.width / 2;

    joystick.centerY =
        rect.top +
        rect.height / 2;


    e.currentTarget.setPointerCapture(
        e.pointerId
    );


    joystickMove(e);
}


function joystickMove(e) {

    if (
        !joystick.active ||
        e.pointerId !== joystick.id
    ) {

        return;
    }


    e.preventDefault();


    let dx =
        e.clientX -
        joystick.centerX;

    let dy =
        e.clientY -
        joystick.centerY;


    const distance =
        Math.hypot(
            dx,
            dy
        );


    if (
        distance >
        joystick.maxDistance
    ) {

        dx =
            dx /
            distance *
            joystick.maxDistance;

        dy =
            dy /
            distance *
            joystick.maxDistance;
    }


    joystick.dx =
        dx /
        joystick.maxDistance;

    joystick.dy =
        dy /
        joystick.maxDistance;


    joystick.x =
        joystick.centerX +
        dx;

    joystick.y =
        joystick.centerY +
        dy;


    const knob =
        document.getElementById(
            "joystickKnob"
        );


    if (knob) {

        knob.style.transform =
            `translate(${dx}px, ${dy}px)`;
    }
}


function joystickEnd(e) {

    if (
        e.pointerId !==
        joystick.id
    ) {

        return;
    }


    joystick.active =
        false;

    joystick.dx =
        0;

    joystick.dy =
        0;


    const knob =
        document.getElementById(
            "joystickKnob"
        );


    if (knob) {

        knob.style.transform =
            "translate(0px, 0px)";
    }
}


/* =====================================================
   TECLADO
===================================================== */

window.addEventListener(
    "keydown",
    e => {

        keys[
            e.key.toLowerCase()
        ] = true;

        keys[
            e.key
        ] = true;


        if (
            e.key === " " ||
            e.key.toLowerCase() === "e"
        ) {

            interact();

            e.preventDefault();
        }
    }
);


window.addEventListener(
    "keyup",
    e => {

        keys[
            e.key.toLowerCase()
        ] = false;

        keys[
            e.key
        ] = false;
    }
);


/* =====================================================
   DISTANCIA
===================================================== */

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


/* =====================================================
   EXPERIENCIA
===================================================== */

function gainXP(amount) {

    state.xp +=
        amount;


    while (
        state.xp >=
        state.xpNext
    ) {

        state.xp -=
            state.xpNext;


        state.level++;


        state.xpNext =
            Math.floor(
                state.xpNext *
                1.35
            );


        state.maxHp +=
            10;

        state.hp =
            state.maxHp;


        state.maxMana +=
            5;

        state.mana =
            state.maxMana;


        state.attack +=
            3;

        state.defense +=
            1;


        msg(
            "🎉 ¡SUBISTE A NIVEL " +
            state.level +
            "!"
        );


        const unlocked =
            skills.filter(
                skill =>
                    skill.level ===
                    state.level
            );


        if (
            unlocked.length
        ) {

            msg(
                "🔓 Nueva habilidad: " +
                unlocked[0].icon +
                " " +
                unlocked[0].name
            );
        }
    }
}


/* =====================================================
   RECURSOS
===================================================== */

function interact() {

    if (
        state.dead
    ) {

        return;
    }


    for (
        const tree of trees
    ) {

        if (
            near(
                player,
                tree,
                45
            )
        ) {

            state.wood++;

            msg(
                "🪓 Talaste un árbol: +1 madera"
            );

            return;
        }
    }


    for (
        const rock of rocks
    ) {

        if (
            near(
                player,
                rock,
                45
            )
        ) {

            if (
                rock.type ===
                "copper"
            ) {

                state.copper++;
            }

            else if (
                rock.type ===
                "iron"
            ) {

                state.iron++;
            }

            else {

                state.stone++;
            }


            const resourceName =
                rock.type === "copper"
                ? "cobre"
                : rock.type === "iron"
                ? "hierro"
                : "piedra";


            msg(
                "⛏️ Minería: +1 " +
                resourceName
            );

            return;
        }
    }


    for (
        const fish of fishSpots
    ) {

        if (
            near(
                player,
                fish,
                50
            )
        ) {

            state.fish++;

            msg(
                "🎣 Pescaste: +1 pez"
            );

            return;
        }
    }
}


/* =====================================================
   ENEMIGO CERCANO
===================================================== */

function getNearestMob(
    maxDistance = 130
) {

    let target =
        null;

    let best =
        maxDistance;


    for (
        const mob of mobs
    ) {

        if (
            mob.hp <= 0
        ) {

            continue;
        }


        const distance =
            Math.hypot(
                player.x -
                mob.x,

                player.y -
                mob.y
            );


        if (
            distance <
            best
        ) {

            best =
                distance;

            target =
                mob;
        }
    }


    return target;
}


/* =====================================================
   ATAQUE
===================================================== */

function attackWithSkill(
    skill
) {

    if (
        state.dead
    ) {

        return;
    }


    const now =
        performance.now();


    if (
        now -
        skill.last <
        skill.cooldown
    ) {

        return;
    }


    if (
        state.level <
        skill.level
    ) {

        msg(
            "🔒 Se desbloquea en nivel " +
            skill.level
        );

        return;
    }


    if (
        state.mana <
        skill.mana
    ) {

        msg(
            "💧 No tienes suficiente maná"
        );

        return;
    }


    skill.last =
        now;


    state.mana -=
        skill.mana;


    if (
        skill.id ===
        "escudo"
    ) {

        state.hp =
            Math.min(
                state.maxHp,
                state.hp + 25
            );


        msg(
            "🛡️ Escudo activado"
        );

        return;
    }


    const target =
        getNearestMob();


    if (!target) {

        msg(
            "🎯 No hay enemigo cerca"
        );

        return;
    }


    const damage =
        skill.damage +
        state.attack;


    target.hp -=
        damage;


    msg(
        skill.icon +
        " " +
        skill.name +
        " -" +
        damage +
        " HP"
    );


    if (
        target.hp <=
        0
    ) {

        target.hp =
            0;


        state.gold +=
            10;


        gainXP(
            35
        );


        msg(
            "☠️ " +
            target.name +
            " derrotado: +10 oro"
        );


        setTimeout(
            () => {

                target.hp =
                    target.maxHp;

            },
            5000
        );
    }
}


/* =====================================================
   INTERFAZ DE COMBATE
===================================================== */

function createCombatUI() {

    const old =
        document.getElementById(
            "combatUI"
        );


    if (old) {

        old.remove();
    }


    const ui =
        document.createElement(
            "div"
        );


    ui.id =
        "combatUI";


    ui.style.position =
        "fixed";

    ui.style.right =
        "12px";

    ui.style.bottom =
        "18px";

    ui.style.zIndex =
        "9999";

    ui.style.display =
        "flex";

    ui.style.flexDirection =
        "column";

    ui.style.alignItems =
        "flex-end";

    ui.style.gap =
        "7px";

    ui.style.maxWidth =
        "48vw";


    /* ATAQUE */

    const attack =
        document.createElement(
            "button"
        );


    attack.textContent =
        "⚔️";


    attack.style.width =
        "76px";

    attack.style.height =
        "76px";

    attack.style.borderRadius =
        "50%";

    attack.style.fontSize =
        "35px";

    attack.style.border =
        "3px solid white";

    attack.style.background =
        "rgba(190,40,40,0.88)";

    attack.style.color =
        "white";

    attack.style.boxShadow =
        "0 4px 12px rgba(0,0,0,0.5)";

    attack.style.touchAction =
        "none";


    attack.addEventListener(
        "pointerdown",
        e => {

            e.preventDefault();

            attackWithSkill(
                skills[0]
            );
        }
    );


    ui.appendChild(
        attack
    );


    /* HABILIDADES */

    const skillRow =
        document.createElement(
            "div"
        );


    skillRow.style.display =
        "flex";

    skillRow.style.gap =
        "6px";

    skillRow.style.flexWrap =
        "wrap";

    skillRow.style.justifyContent =
        "flex-end";


    for (
        let i = 1;
        i < skills.length;
        i++
    ) {

        const skill =
            skills[i];


        const button =
            document.createElement(
                "button"
            );


        button.textContent =
            skill.icon;


        button.style.width =
            "50px";

        button.style.height =
            "50px";

        button.style.borderRadius =
            "50%";

        button.style.fontSize =
            "23px";

        button.style.border =
            "2px solid white";

        button.style.background =
            "rgba(25,25,35,0.85)";

        button.style.color =
            "white";

        button.style.touchAction =
            "none";


        button.addEventListener(
            "pointerdown",
            e => {

                e.preventDefault();

                attackWithSkill(
                    skill
                );
            }
        );


        skillRow.appendChild(
            button
        );
    }


    ui.appendChild(
        skillRow
    );


    document.body.appendChild(
        ui
    );
}


/* =====================================================
   HUD EXTRA
===================================================== */

function createExtraHUD() {

    const old =
        document.getElementById(
            "extraHUD"
        );


    if (old) {

        old.remove();
    }


    const hud =
        document.createElement(
            "div"
        );


    hud.id =
        "extraHUD";


    hud.style.position =
        "fixed";

    hud.style.left =
        "50%";

    hud.style.top =
        "70px";

    hud.style.transform =
        "translateX(-50%)";

    hud.style.zIndex =
        "9998";

    hud.style.width =
        "180px";

    hud.style.pointerEvents =
        "none";


    /* HP */

    const hpBack =
        document.createElement(
            "div"
        );


    hpBack.style.height =
        "12px";

    hpBack.style.background =
        "rgba(0,0,0,0.65)";

    hpBack.style.border =
        "1px solid white";

    hpBack.style.borderRadius =
        "8px";

    hpBack.style.overflow =
        "hidden";


    const hpBar =
        document.createElement(
            "div"
        );


    hpBar.id =
        "customHP";


    hpBar.style.height =
        "100%";

    hpBar.style.width =
        "100%";

    hpBar.style.background =
        "#d83232";


    hpBack.appendChild(
        hpBar
    );


    /* MANA */

    const manaBack =
        document.createElement(
            "div"
        );


    manaBack.style.height =
        "9px";

    manaBack.style.marginTop =
        "4px";

    manaBack.style.background =
        "rgba(0,0,0,0.65)";

    manaBack.style.border =
        "1px solid white";

    manaBack.style.borderRadius =
        "8px";

    manaBack.style.overflow =
        "hidden";


    const manaBar =
        document.createElement(
            "div"
        );


    manaBar.id =
        "customMana";


    manaBar.style.height =
        "100%";

    manaBar.style.width =
        "100%";

    manaBar.style.background =
        "#3584e4";


    manaBack.appendChild(
        manaBar
    );


    /* XP */

    const xpBack =
        document.createElement(
            "div"
        );


    xpBack.style.height =
        "7px";

    xpBack.style.marginTop =
        "4px";

    xpBack.style.background =
        "rgba(0,0,0,0.65)";

    xpBack.style.border =
        "1px solid white";

    xpBack.style.borderRadius =
        "8px";

    xpBack.style.overflow =
        "hidden";


    const xpBar =
        document.createElement(
            "div"
        );


    xpBar.id =
        "customXP";


    xpBar.style.height =
        "100%";

    xpBar.style.width =
        "0%";

    xpBar.style.background =
        "#e7c93d";


    xpBack.appendChild(
        xpBar
    );


    hud.appendChild(
        hpBack
    );

    hud.appendChild(
        manaBack
    );

    hud.appendChild(
        xpBack
    );


    document.body.appendChild(
        hud
    );
}


/* =====================================================
   DIBUJAR MUNDO
===================================================== */

function drawWorld() {

    /* FONDO */

    ctx.fillStyle =
        "#4d8a49";

    ctx.fillRect(
        0,
        0,
        innerWidth,
        innerHeight
    );


    /*
       CÁMARA

       El jugador queda siempre
       en el centro de la pantalla.
    */

    ctx.save();


    ctx.translate(
        innerWidth / 2,
        innerHeight / 2
    );


    ctx.scale(
        camera.zoom,
        camera.zoom
    );


    ctx.translate(
        -player.x,
        -player.y
    );


    /* AGUA */

    ctx.fillStyle =
        "#2d72a8";


    ctx.fillRect(
        0,
        480,
        760,
        190
    );


    ctx.fillRect(
        1260,
        540,
        540,
        180
    );


    /* CAMINO */

    ctx.fillStyle =
        "#b99b67";


    ctx.fillRect(
        0,
        600,
        world.w,
        55
    );


    /* ÁRBOLES */

    for (
        const tree of trees
    ) {

        /* tronco */

        ctx.fillStyle =
            "#65432d";


        ctx.fillRect(
            tree.x - 6,
            tree.y + 10,
            12,
            25
        );


        /* copa */

        ctx.fillStyle =
            "#246b32";


        ctx.beginPath();

        ctx.arc(
            tree.x,
            tree.y,
            28,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#34853f";


        ctx.beginPath();

        ctx.arc(
            tree.x - 12,
            tree.y - 10,
            16,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    /* MINERALES */

    for (
        const rock of rocks
    ) {

        ctx.fillStyle =
            rock.type === "copper"
            ? "#a76538"
            : rock.type === "iron"
            ? "#6f747b"
            : "#888";


        ctx.beginPath();

        ctx.arc(
            rock.x,
            rock.y,
            23,
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
            rock.x,
            rock.y + 4
        );
    }


    /* PESCA */

    for (
        const fish of fishSpots
    ) {

        ctx.font =
            "24px Arial";

        ctx.textAlign =
            "center";


        ctx.fillText(
            "🐟",
            fish.x,
            fish.y
        );
    }


    /* MONSTRUOS */

    for (
        const mob of mobs
    ) {

        if (
            mob.hp <= 0
        ) {

            continue;
        }


        ctx.font =
            "30px Arial";

        ctx.textAlign =
            "center";


        ctx.fillText(
            mob.name === "Lobo"
            ? "🐺"
            : mob.name === "Jabalí"
            ? "🐗"
            : "👹",
            mob.x,
            mob.y
        );


        /* barra negra */

        ctx.fillStyle =
            "#222";


        ctx.fillRect(
            mob.x - 24,
            mob.y - 35,
            48,
            6
        );


        /* vida */

        ctx.fillStyle =
            "#e33";


        ctx.fillRect(
            mob.x - 24,
            mob.y - 35,
            48 *
            (
                mob.hp /
                mob.max
            ),
            6
        );
    }


    /* JUGADOR */

    drawPlayer();


    ctx.restore();
}


/* =====================================================
   PERSONAJE
===================================================== */

function drawPlayer() {

    const x =
        player.x;

    const y =
        player.y;


    /* SOMBRA */

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";


    ctx.beginPath();

    ctx.ellipse(
        x,
        y + 19,
        19,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* CUERPO */

    ctx.fillStyle =
        "#263d91";


    ctx.beginPath();

    ctx.arc(
        x,
        y + 7,
        15,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* BORDE */

    ctx.strokeStyle =
        "#111";

    ctx.lineWidth =
        2;


    ctx.beginPath();

    ctx.arc(
        x,
        y + 7,
        15,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    /* CABEZA */

    ctx.fillStyle =
        "#f0c39b";


    ctx.beginPath();

    ctx.arc(
        x,
        y - 10,
        11,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* PELO */

    ctx.fillStyle =
        "#252525";


    ctx.beginPath();

    ctx.arc(
        x,
        y - 13,
        11,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    /* OJOS */

    ctx.fillStyle =
        "#111";


    ctx.beginPath();

    ctx.arc(
        x - 4,
        y - 9,
        1.5,
        0,
        Math.PI * 2
    );


    ctx.arc(
        x + 4,
        y - 9,
        1.5,
        0,
        Math.PI * 2
    );


    ctx.fill();


    /* ESPADA */

    ctx.strokeStyle =
        "#eee";

    ctx.lineWidth =
        4;


    ctx.beginPath();

    ctx.moveTo(
        x + 10,
        y + 2
    );


    ctx.lineTo(
        x + 23,
        y - 16
    );


    ctx.stroke();


    /* NIVEL ENCIMA */

    ctx.fillStyle =
        "white";

    ctx.font =
        "bold 12px Arial";

    ctx.textAlign =
        "center";


    ctx.fillText(
        "Nv. " +
        state.level,
        x,
        y - 29
    );
}


/* =====================================================
   MOVIMIENTO
===================================================== */

function updateMovement(dt) {

    if (
        state.dead
    ) {

        return;
    }


    let dx =
        0;

    let dy =
        0;


    /* JOYSTICK */

    if (
        joystick.active
    ) {

        dx +=
            joystick.dx;

        dy +=
            joystick.dy;
    }


    /* TECLADO */

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


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const length =
            Math.hypot(
                dx,
                dy
            );


        dx /=
            length;

        dy /=
            length;


        player.x +=
            dx *
            player.speed *
            (dt / 16);


        player.y +=
            dy *
            player.speed *
            (dt / 16);
    }


    /* LIMITES */

    player.x =
        Math.max(
            25,
            Math.min(
                world.w - 25,
                player.x
            )
        );


    player.y =
        Math.max(
            25,
            Math.min(
                world.h - 25,
                player.y
            )
        );
}


/* =====================================================
   REGENERACIÓN
===================================================== */

let regenTimer =
    0;


function regenerate(dt) {

    regenTimer +=
        dt;


    if (
        regenTimer <
        1000
    ) {

        return;
    }


    regenTimer =
        0;


    if (
        state.hp <
        state.maxHp
    ) {

        state.hp =
            Math.min(
                state.maxHp,
                state.hp + 1
            );
    }


    if (
        state.mana <
        state.maxMana
    ) {

        state.mana =
            Math.min(
                state.maxMana,
                state.mana + 2
            );
    }
}


/* =====================================================
   HUD
===================================================== */

function updateHUD() {

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


    if (level) {

        level.textContent =
            state.level;
    }


    if (hp) {

        hp.textContent =
            state.hp +
            "/" +
            state.maxHp;
    }


    if (gold) {

        gold.textContent =
            state.gold;
    }


    if (wood) {

        wood.textContent =
            state.wood;
    }


    if (stone) {

        stone.textContent =
            state.stone;
    }


    if (copper) {

        copper.textContent =
            state.copper;
    }


    if (iron) {

        iron.textContent =
            state.iron;
    }


    if (fish) {

        fish.textContent =
            state.fish;
    }


    /* BARRAS NUEVAS */

    const hpBar =
        document.getElementById(
            "customHP"
        );

    const manaBar =
        document.getElementById(
            "customMana"
        );

    const xpBar =
        document.getElementById(
            "customXP"
        );


    if (hpBar) {

        hpBar.style.width =
            (
                state.hp /
                state.maxHp *
                100
            ) + "%";
    }


    if (manaBar) {

        manaBar.style.width =
            (
                state.mana /
                state.maxMana *
                100
            ) + "%";
    }


    if (xpBar) {

        xpBar.style.width =
            (
                state.xp /
                state.xpNext *
                100
            ) + "%";
    }
}


/* =====================================================
   GAME LOOP
===================================================== */

function update(time) {

    const dt =
        Math.min(
            32,
            time - last || 16
        );


    last =
        time;


    updateMovement(
        dt
    );


    regenerate(
        dt
    );


    drawWorld();


    updateHUD();


    requestAnimationFrame(
        update
    );
}


/* =====================================================
   INICIO
===================================================== */

createJoystick();

createCombatUI();

createExtraHUD();


msg(
    "🕹️ Mueve el joystick con el dedo. Acércate a recursos o enemigos."
);


requestAnimationFrame(
    update
);

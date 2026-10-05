/* =========================================================
   ⚔️ REINOS DE CENIZA
   GAME.JS - VERSIÓN FINAL 1.0
   ========================================================= */

"use strict";

/* =========================================================
   CANVAS
   ========================================================= */

const canvas =
    document.getElementById("world") ||
    document.getElementById("gameCanvas");

if (!canvas) {
    throw new Error("No se encontró el canvas #world");
}

const ctx = canvas.getContext("2d");

if (!ctx) {
    throw new Error("No se pudo obtener el contexto del canvas");
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* =========================================================
   MUNDO
   ========================================================= */

const WORLD_WIDTH = 5000;
const WORLD_HEIGHT = 5000;
const TILE = 64;

const CITY_X = WORLD_WIDTH / 2;
const CITY_Y = WORLD_HEIGHT / 2;
const CITY_RADIUS = 520;

/* =========================================================
   GUARDADO
   ========================================================= */

const SAVE_KEY = "reinosDeCenizaRPG";
const CHARACTERS_KEY = "reinosDeCenizaCharacters";

let currentCharacterId = null;

/* =========================================================
   PERSONAJE
   ========================================================= */

const player = {
    x: CITY_X,
    y: CITY_Y,

    radius: 22,

    name: "Aventurero",
    gender: "Guerrero",
    classId: "warrior",

    level: 1,
    xp: 0,
    xpNeeded: 100,

    hp: 100,
    maxHp: 100,

    mana: 50,
    maxMana: 50,

    baseDamage: 25,
    baseDefense: 5,

    damage: 25,
    defense: 5,

    attackRange: 105,
    attackCooldown: 0,
    attackDelay: 0.55,

    speed: 260,

    directionX: 0,
    directionY: 1,

    dead: false,
    respawnTimer: 0,

    attackAnimation: 0,
    skillAnimation: 0,

    rageTimer: 0,

    criticalChance: 0.05,
    criticalDamage: 1.5,

    color: "#d9b38c",
    hair: "cabello1"
};

/* =========================================================
   CLASES
   ========================================================= */

const classes = {

    warrior: {
        id: "warrior",
        name: "Guerrero",
        icon: "⚔️",

        description:
            "Especialista en combate cuerpo a cuerpo. Mucha vida y defensa.",

        hp: 140,
        mana: 40,

        damage: 30,
        defense: 10,

        speed: 245,

        weapon: "ironSword",
        skill: "powerStrike"
    },

    hunter: {
        id: "hunter",
        name: "Cazador",
        icon: "🏹",

        description:
            "Rápido combatiente a distancia con gran movilidad.",

        hp: 100,
        mana: 70,

        damage: 27,
        defense: 6,

        speed: 290,

        weapon: "apprenticeSword",
        skill: "rapidShot"
    },

    mage: {
        id: "mage",
        name: "Mago",
        icon: "🔮",

        description:
            "Domina la magia y posee una gran reserva de maná.",

        hp: 80,
        mana: 150,

        damage: 38,
        defense: 3,

        speed: 235,

        weapon: "apprenticeSword",
        skill: "fireball"
    },

    assassin: {
        id: "assassin",
        name: "Asesino",
        icon: "🗡️",

        description:
            "Especialista en velocidad y golpes críticos.",

        hp: 95,
        mana: 70,

        damage: 36,
        defense: 4,

        speed: 310,

        weapon: "apprenticeSword",
        skill: "shadowStrike"
    },

    explorer: {
        id: "explorer",
        name: "Explorador",
        icon: "🧭",

        description:
            "Aventurero equilibrado con bonificaciones de recolección.",

        hp: 115,
        mana: 70,

        damage: 25,
        defense: 7,

        speed: 275,

        weapon: "ironSword",
        skill: "survival"
    }
};

/* =========================================================
   RAREZAS
   ========================================================= */

const rarityInfo = {

    common: {
        name: "Común",
        multiplier: 1,
        icon: "⚪"
    },

    uncommon: {
        name: "Poco común",
        multiplier: 1.15,
        icon: "🟢"
    },

    rare: {
        name: "Raro",
        multiplier: 1.3,
        icon: "🔵"
    },

    epic: {
        name: "Épico",
        multiplier: 1.5,
        icon: "🟣"
    },

    legendary: {
        name: "Legendario",
        multiplier: 2,
        icon: "🟠"
    }
};

/* =========================================================
   OBJETOS
   ========================================================= */

const itemDefinitions = {

    ironSword: {
        id: "ironSword",
        name: "Espada de Hierro",
        type: "weapon",
        slot: "weapon",
        level: 1,
        rarity: "common",
        damage: 10,
        defense: 0,
        icon: "⚔️",
        description: "Una espada sencilla de hierro."
    },

    apprenticeSword: {
        id: "apprenticeSword",
        name: "Espada de Aprendiz",
        type: "weapon",
        slot: "weapon",
        level: 1,
        rarity: "common",
        damage: 8,
        defense: 0,
        icon: "🗡️",
        description: "Arma utilizada por jóvenes aventureros."
    },

    steelSword: {
        id: "steelSword",
        name: "Espada de Acero",
        type: "weapon",
        slot: "weapon",
        level: 5,
        rarity: "uncommon",
        damage: 20,
        defense: 0,
        icon: "⚔️",
        description: "Una espada mucho más resistente."
    },

    leatherHelmet: {
        id: "leatherHelmet",
        name: "Casco de Cuero",
        type: "armor",
        slot: "helmet",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 3,
        icon: "🪖",
        description: "Protección ligera."
    },

    ironHelmet: {
        id: "ironHelmet",
        name: "Casco de Hierro",
        type: "armor",
        slot: "helmet",
        level: 3,
        rarity: "uncommon",
        damage: 0,
        defense: 7,
        icon: "🪖",
        description: "Casco fabricado con hierro."
    },

    goblinHelmet: {
        id: "goblinHelmet",
        name: "Casco de Goblin",
        type: "armor",
        slot: "helmet",
        level: 5,
        rarity: "rare",
        damage: 0,
        defense: 10,
        icon: "👺",
        description: "Un casco tomado de un goblin."
    },

    leatherArmor: {
        id: "leatherArmor",
        name: "Armadura de Cuero",
        type: "armor",
        slot: "armor",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 5,
        icon: "🥋",
        description: "Armadura flexible de cuero."
    },

    ironArmor: {
        id: "ironArmor",
        name: "Armadura de Hierro",
        type: "armor",
        slot: "armor",
        level: 5,
        rarity: "uncommon",
        damage: 0,
        defense: 12,
        icon: "🛡️",
        description: "Pesada armadura de hierro."
    },

    leatherBoots: {
        id: "leatherBoots",
        name: "Botas de Cuero",
        type: "armor",
        slot: "boots",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 2,
        icon: "🥾",
        description: "Botas cómodas para viajar."
    },

    goblinBoots: {
        id: "goblinBoots",
        name: "Botas de Goblin",
        type: "armor",
        slot: "boots",
        level: 5,
        rarity: "rare",
        damage: 0,
        defense: 6,
        icon: "🥾",
        description: "Botas tomadas de un goblin."
    },

    woodenShield: {
        id: "woodenShield",
        name: "Escudo de Madera",
        type: "armor",
        slot: "shield",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 5,
        icon: "🛡️",
        description: "Un escudo sencillo de madera."
    },

    ironShield: {
        id: "ironShield",
        name: "Escudo de Hierro",
        type: "armor",
        slot: "shield",
        level: 5,
        rarity: "uncommon",
        damage: 0,
        defense: 12,
        icon: "🛡️",
        description: "Un resistente escudo de hierro."
    }
};

/* =========================================================
   EQUIPAMIENTO
   ========================================================= */

let equipment = {

    weapon: cloneItem("ironSword"),
    helmet: cloneItem("ironHelmet"),
    armor: cloneItem("ironArmor"),
    boots: cloneItem("leatherBoots"),
    shield: cloneItem("woodenShield")
};

function cloneItem(id) {

    const def = itemDefinitions[id];

    if (!def) return null;

    return {
        uid:
            "equip_" +
            id +
            "_" +
            Math.random().toString(36).slice(2),

        itemId: id,

        ...def
    };
}

/* =========================================================
   INVENTARIO
   ========================================================= */

let inventorySlots = 30;

const INVENTORY_EXPANSION_COST = 500;
const INVENTORY_EXPANSION_AMOUNT = 5;

let itemInventory = [];

/* =========================================================
   RECURSOS
   ========================================================= */

const inventory = {

    gold: 150,

    wood: 0,
    stone: 0,
    copper: 0,
    iron: 0,

    fish: 0,

    potions: 3,

    meat: 0,

    wolfFang: 0,
    goblinEar: 0,
    leather: 0,

    bait: 0
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
   ESTADÍSTICAS
   ========================================================= */

function recalculatePlayerStats() {

    const cls = classes[player.classId] || classes.warrior;

    player.maxHp = cls.hp;
    player.maxMana = cls.mana;

    player.baseDamage = cls.damage;
    player.baseDefense = cls.defense;
    player.speed = cls.speed;

    let damage = player.baseDamage;
    let defense = player.baseDefense;

    Object.values(equipment).forEach(item => {

        if (!item) return;

        const rarity =
            rarityInfo[item.rarity] ||
            rarityInfo.common;

        damage += (item.damage || 0) * rarity.multiplier;
        defense += (item.defense || 0) * rarity.multiplier;
    });

    player.damage = Math.round(damage);
    player.defense = Math.round(defense);

    if (player.hp > player.maxHp) {
        player.hp = player.maxHp;
    }

    if (player.mana > player.maxMana) {
        player.mana = player.maxMana;
    }
}

/* =========================================================
   INVENTARIO FUNCIONES
   ========================================================= */

function inventoryUsedSlots() {

    return itemInventory.reduce(
        (total, item) =>
            total + (item.quantity || 1),
        0
    );
}

function inventoryHasSpace(amount = 1) {

    return (
        inventoryUsedSlots() + amount <=
        inventorySlots
    );
}

function addItem(itemId, amount = 1, rarity = null) {

    if (!itemDefinitions[itemId]) {
        return false;
    }

    if (!inventoryHasSpace(amount)) {

        showMessage(
            "🎒 Inventario lleno"
        );

        return false;
    }

    for (let i = 0; i < amount; i++) {

        const def = itemDefinitions[itemId];

        itemInventory.push({

            uid:
                "item_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .slice(2),

            itemId,

            ...def,

            rarity:
                rarity ||
                def.rarity
        });
    }

    saveGame();

    return true;
}

function removeItemByUid(uid) {

    const index =
        itemInventory.findIndex(
            item => item.uid === uid
        );

    if (index === -1) return null;

    return itemInventory.splice(index, 1)[0];
}

function expandInventory() {

    if (
        inventory.gold <
        INVENTORY_EXPANSION_COST
    ) {

        showMessage(
            "❌ Necesitas 500 monedas."
        );

        return;
    }

    inventory.gold -=
        INVENTORY_EXPANSION_COST;

    inventorySlots +=
        INVENTORY_EXPANSION_AMOUNT;

    showMessage(
        "🎒 Inventario ampliado a " +
        inventorySlots +
        " espacios."
    );

    saveGame();

    renderInventoryPanel();
    updateUI();
}

/* =========================================================
   POTIONES
   ========================================================= */

function usePotion() {

    if (inventory.potions <= 0) {

        showMessage(
            "No tienes pociones."
        );

        return;
    }

    if (player.hp >= player.maxHp) {

        showMessage(
            "Tu vida ya está completa."
        );

        return;
    }

    inventory.potions--;

    player.hp = Math.min(
        player.maxHp,
        player.hp + 60
    );

    showMessage(
        "🧪 Has recuperado vida."
    );

    saveGame();
}

/* =========================================================
   EQUIPAR
   ========================================================= */

function equipItem(uid) {

    const item =
        itemInventory.find(
            x => x.uid === uid
        );

    if (!item) return;

    if (player.level < item.level) {

        showMessage(
            "🔒 Necesitas nivel " +
            item.level +
            "."
        );

        return;
    }

    const slot = item.slot;

    if (!slot) {

        showMessage(
            "Este objeto no se puede equipar."
        );

        return;
    }

    const oldItem =
        equipment[slot];

    /*
       Si hay objeto equipado, necesitamos
       espacio antes de reemplazarlo.
    */

    if (oldItem && !inventoryHasSpace(1)) {

        showMessage(
            "🎒 Necesitas espacio para guardar el objeto equipado."
        );

        return;
    }

    const index =
        itemInventory.findIndex(
            x => x.uid === uid
        );

    if (index === -1) return;

    itemInventory.splice(index, 1);

    if (oldItem) {

        itemInventory.push({
            ...oldItem,
            uid:
                "item_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .slice(2)
        });
    }

    equipment[slot] = {
        ...item
    };

    recalculatePlayerStats();

    showMessage(
        "⚔️ Equipaste " +
        item.name
    );

    saveGame();

    closeItemDetails();
    renderInventoryPanel();
    updateUI();
}

/* =========================================================
   DESEQUIPAR
   ========================================================= */

function unequipItem(slot) {

    const item =
        equipment[slot];

    if (!item) return;

    if (!inventoryHasSpace()) {

        showMessage(
            "🎒 Inventario lleno."
        );

        return;
    }

    itemInventory.push({

        ...item,

        uid:
            "item_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .slice(2)
    });

    equipment[slot] = null;

    recalculatePlayerStats();

    saveGame();

    renderInventoryPanel();
    updateUI();

    showMessage(
        "Desequipaste " +
        item.name
    );
}

/* =========================================================
   DETALLES DEL OBJETO
   ========================================================= */

function openItemDetails(uid) {

    const item =
        itemInventory.find(
            x => x.uid === uid
        );

    if (!item) return;

    closeItemDetails();

    const panel =
        document.createElement("div");

    panel.id =
        "itemDetailsPanel";

    panel.style.cssText = `
        position:fixed;
        left:50%;
        top:50%;
        transform:translate(-50%,-50%);
        width:min(90vw,380px);
        max-height:85vh;
        overflow:auto;
        background:rgba(12,15,22,.98);
        border:2px solid #8c6b35;
        border-radius:18px;
        padding:20px;
        z-index:99999;
        color:white;
        text-align:center;
        box-shadow:0 15px 50px rgba(0,0,0,.8);
        font-family:Arial,sans-serif;
    `;

    const rarity =
        rarityInfo[item.rarity] ||
        rarityInfo.common;

    const canEquip =
        player.level >= item.level;

    panel.innerHTML = `

        <div style="
            font-size:64px;
            margin-bottom:8px;
        ">
            ${item.icon}
        </div>

        <h2 style="
            margin:5px 0;
        ">
            ${item.name}
        </h2>

        <div style="
            color:#d9b56d;
            margin-bottom:12px;
        ">
            ${rarity.icon}
            ${rarity.name}
        </div>

        <div style="
            background:#1b2029;
            border-radius:12px;
            padding:12px;
            text-align:left;
            line-height:1.7;
        ">

            <div>
                📦 Tipo:
                ${item.type}
            </div>

            <div>
                ⭐ Nivel requerido:
                ${item.level}
            </div>

            ${
                item.damage
                    ? `
                    <div>
                        ⚔️ Ataque:
                        ${Math.round(
                            item.damage *
                            rarity.multiplier
                        )}
                    </div>
                    `
                    : ""
            }

            ${
                item.defense
                    ? `
                    <div>
                        🛡️ Defensa:
                        ${Math.round(
                            item.defense *
                            rarity.multiplier
                        )}
                    </div>
                    `
                    : ""
            }

        </div>

        <p style="
            margin:15px 5px;
            color:#c9c9c9;
        ">
            ${item.description}
        </p>

        <button
            id="itemActionButton"
            style="
                width:100%;
                padding:14px;
                border:0;
                border-radius:10px;
                background:${
                    canEquip
                    ? "#7b5cff"
                    : "#555"
                };
                color:white;
                font-size:16px;
                font-weight:bold;
                margin-top:8px;
            "
            ${canEquip ? "" : "disabled"}
        >
            ⚔️ EQUIPAR
        </button>

        <button
            id="itemCloseButton"
            style="
                width:100%;
                padding:12px;
                border:0;
                border-radius:10px;
                background:#292f39;
                color:white;
                font-size:15px;
                margin-top:8px;
            "
        >
            CERRAR
        </button>
    `;

    document.body.appendChild(panel);

    document
        .getElementById(
            "itemActionButton"
        )
        ?.addEventListener(
            "click",
            () => equipItem(uid)
        );

    document
        .getElementById(
            "itemCloseButton"
        )
        ?.addEventListener(
            "click",
            closeItemDetails
        );
}

function closeItemDetails() {

    const panel =
        document.getElementById(
            "itemDetailsPanel"
        );

    if (panel) {
        panel.remove();
    }
}

/* =========================================================
   INVENTARIO UI
   ========================================================= */

function renderInventoryPanel() {

    let panel =
        document.getElementById(
            "inventoryPanel"
        );

    if (!panel) {

        panel =
            document.createElement("div");

        panel.id =
            "inventoryPanel";

        panel.style.cssText = `
            position:fixed;
            left:50%;
            top:50%;
            transform:translate(-50%,-50%);
            width:min(94vw,520px);
            max-height:88vh;
            overflow:auto;
            background:rgba(10,13,18,.97);
            border:2px solid #80652e;
            border-radius:18px;
            padding:14px;
            z-index:5000;
            color:white;
            display:none;
            font-family:Arial,sans-serif;
        `;

        document.body.appendChild(panel);
    }

    if (
        panel.style.display === "none"
    ) {
        return;
    }

    panel.innerHTML = "";

    const title =
        document.createElement("h2");

    title.textContent =
        "🎒 Inventario " +
        inventoryUsedSlots() +
        "/" +
        inventorySlots;

    title.style.textAlign = "center";

    panel.appendChild(title);

    const equipmentTitle =
        document.createElement("div");

    equipmentTitle.innerHTML = `
        <div style="
            text-align:center;
            margin:10px 0;
            color:#d8b86a;
            font-weight:bold;
        ">
            ⚔️ EQUIPAMIENTO
        </div>
    `;

    panel.appendChild(
        equipmentTitle
    );

    const equipGrid =
        document.createElement("div");

    equipGrid.style.cssText = `
        display:grid;
        grid-template-columns:repeat(5,1fr);
        gap:6px;
    `;

    const slots = [
        ["weapon", "⚔️"],
        ["helmet", "🪖"],
        ["armor", "🥋"],
        ["boots", "🥾"],
        ["shield", "🛡️"]
    ];

    slots.forEach(([slot, icon]) => {

        const item =
            equipment[slot];

        const button =
            document.createElement("button");

        button.style.cssText = `
            min-height:64px;
            background:#202631;
            border:1px solid #65522d;
            border-radius:10px;
            color:white;
            font-size:24px;
        `;

        button.innerHTML =
            item
                ? item.icon
                : icon;

        if (item) {

            button.title =
                item.name;

            button.onclick =
                () => {

                    if (
                        confirm(
                            "¿Desequipar " +
                            item.name +
                            "?"
                        )
                    ) {

                        unequipItem(slot);
                    }
                };
        }

        equipGrid.appendChild(
            button
        );
    });

    panel.appendChild(
        equipGrid
    );

    const divider =
        document.createElement("div");

    divider.style.cssText = `
        height:1px;
        background:#383f4b;
        margin:14px 0;
    `;

    panel.appendChild(divider);

    const grid =
        document.createElement("div");

    grid.style.cssText = `
        display:grid;
        grid-template-columns:repeat(5,1fr);
        gap:6px;
    `;

    for (
        let i = 0;
        i < inventorySlots;
        i++
    ) {

        const item =
            itemInventory[i];

        const cell =
            document.createElement("button");

        cell.style.cssText = `
            min-height:70px;
            background:#181d25;
            border:1px solid #343b48;
            border-radius:9px;
            color:white;
            position:relative;
        `;

        if (item) {

            const rarity =
                rarityInfo[item.rarity] ||
                rarityInfo.common;

            cell.innerHTML = `
                <div style="
                    font-size:27px;
                ">
                    ${item.icon}
                </div>

                <div style="
                    font-size:10px;
                    white-space:nowrap;
                    overflow:hidden;
                ">
                    ${item.name}
                </div>

                <div style="
                    font-size:10px;
                    color:#d5b66d;
                ">
                    ${rarity.name}
                </div>
            `;

            cell.onclick =
                () =>
                    openItemDetails(
                        item.uid
                    );
        }

        grid.appendChild(cell);
    }

    panel.appendChild(grid);

    const expand =
        document.createElement("button");

    expand.textContent =
        "➕ AMPLIAR INVENTARIO (+5) — 500 🪙";

    expand.style.cssText = `
        width:100%;
        margin-top:12px;
        padding:13px;
        background:#76572c;
        border:0;
        border-radius:10px;
        color:white;
        font-weight:bold;
    `;

    expand.onclick =
        expandInventory;

    panel.appendChild(
        expand
    );

    const close =
        document.createElement("button");

    close.textContent =
        "CERRAR";

    close.style.cssText = `
        width:100%;
        margin-top:7px;
        padding:11px;
        background:#292f39;
        border:0;
        border-radius:10px;
        color:white;
    `;

    close.onclick =
        closeInventory;

    panel.appendChild(close);
}

function openInventory() {

    let panel =
        document.getElementById(
            "inventoryPanel"
        );

    if (!panel) {

        renderInventoryPanel();

        panel =
            document.getElementById(
                "inventoryPanel"
            );
    }

    panel.style.display =
        "block";

    renderInventoryPanel();
}

function closeInventory() {

    const panel =
        document.getElementById(
            "inventoryPanel"
        );

    if (panel) {

        panel.style.display =
            "none";
    }

    closeItemDetails();
}

/* =========================================================
   HABILIDADES
   ========================================================= */

const skills = {

    powerStrike: {
        name: "Golpe Poderoso",
        icon: "💥",
        level: 2,
        mana: 10,
        multiplier: 2
    },

    rapidShot: {
        name: "Disparo Rápido",
        icon: "🏹",
        level: 2,
        mana: 12,
        multiplier: 1.8
    },

    fireball: {
        name: "Bola de Fuego",
        icon: "🔥",
        level: 2,
        mana: 20,
        multiplier: 2.5
    },

    shadowStrike: {
        name: "Golpe Sombrío",
        icon: "🌑",
        level: 2,
        mana: 15,
        multiplier: 2.8
    },

    survival: {
        name: "Supervivencia",
        icon: "🌿",
        level: 2,
        mana: 10,
        multiplier: 1.5
    },

    heal: {
        name: "Curación",
        icon: "💚",
        level: 3,
        mana: 25,
        heal: 80
    },

    whirlwind: {
        name: "Torbellino",
        icon: "🌪️",
        level: 5,
        mana: 30,
        multiplier: 2.2,
        area: true
    },

    rage: {
        name: "Furia",
        icon: "😡",
        level: 8,
        mana: 35
    },

    execution: {
        name: "Ejecución",
        icon: "☠️",
        level: 10,
        mana: 45,
        multiplier: 3.5
    },

    swordRain: {
        name: "Lluvia de Espadas",
        icon: "⚔️",
        level: 15,
        mana: 60,
        multiplier: 3,
        area: true
    },

    ashWrath: {
        name: "Ira de Ceniza",
        icon: "🔥",
        level: 20,
        mana: 80,
        multiplier: 5,
        area: true
    }
};

function isSkillUnlocked(skillId) {

    const skill =
        skills[skillId];

    return (
        skill &&
        player.level >= skill.level
    );
}

function useSkill(skillId) {

    const skill =
        skills[skillId];

    if (!skill) return;

    if (
        player.level <
        skill.level
    ) {

        showMessage(
            "🔒 Se desbloquea en nivel " +
            skill.level
        );

        return;
    }

    if (
        player.mana <
        skill.mana
    ) {

        showMessage(
            "💧 No tienes suficiente maná."
        );

        return;
    }

    player.mana -=
        skill.mana;

    player.skillAnimation =
        0.35;

    if (skill.heal) {

        player.hp =
            Math.min(
                player.maxHp,
                player.hp +
                skill.heal
            );

        showMessage(
            "💚 Curación restauró " +
            skill.heal +
            " HP."
        );

        saveGame();
        return;
    }

    if (skill.rage) {

        player.rageTimer =
            10;

        showMessage(
            "😡 ¡Furia activada!"
        );

        saveGame();
        return;
    }

    let damage =
        Math.round(
            player.damage *
            (skill.multiplier || 1)
        );

    if (skill.area) {

        enemies.forEach(enemy => {

            if (
                enemy.dead ||
                distance(
                    player,
                    enemy
                ) > 190
            ) return;

            damageEnemy(
                enemy,
                damage
            );
        });

    } else {

        const target =
            getNearestEnemy(
                player.attackRange +
                80
            );

        if (!target) {

            showMessage(
                "No hay enemigo cerca."
            );

            return;
        }

        damageEnemy(
            target,
            damage
        );
    }

    showMessage(
        skill.icon +
        " " +
        skill.name +
        "!"
    );

    saveGame();
}

/* =========================================================
   ENEMIGOS
   ========================================================= */

const enemyTypes = {

    wolf: {
        name: "Lobo",
        icon: "🐺",
        hp: 70,
        damage: 12,
        speed: 110,
        radius: 23,
        xp: 30,
        gold: 5
    },

    boar: {
        name: "Jabalí",
        icon: "🐗",
        hp: 100,
        damage: 15,
        speed: 80,
        radius: 25,
        xp: 40,
        gold: 8
    },

    goblin: {
        name: "Goblin",
        icon: "👺",
        hp: 130,
        damage: 20,
        speed: 65,
        radius: 25,
        xp: 60,
        gold: 15
    },

    orc: {
        name: "Orco",
        icon: "👹",
        hp: 220,
        damage: 28,
        speed: 55,
        radius: 30,
        xp: 110,
        gold: 30
    }
};

let enemies = [];

/* =========================================================
   RECURSOS
   ========================================================= */

let resources = [];

function randomWorldPosition() {

    let x, y;

    do {

        x =
            150 +
            Math.random() *
            (WORLD_WIDTH - 300);

        y =
            150 +
            Math.random() *
            (WORLD_HEIGHT - 300);

    } while (
        distance(
            {
                x,
                y
            },
            {
                x: CITY_X,
                y: CITY_Y
            }
        ) <
        CITY_RADIUS + 100
    );

    return {
        x,
        y
    };
}

function createResources() {

    resources = [];

    const types = [
        "tree",
        "rock",
        "copper",
        "iron"
    ];

    for (
        let i = 0;
        i < 300;
        i++
    ) {

        const pos =
            randomWorldPosition();

        resources.push({

            x: pos.x,
            y: pos.y,

            type:
                types[
                    Math.floor(
                        Math.random() *
                        types.length
                    )
                ],

            hp: 1,

            collected: false,

            respawn: 0
        });
    }
}

/* =========================================================
   ENEMIGOS CREAR
   ========================================================= */

function spawnEnemy(type) {

    const data =
        enemyTypes[type];

    if (!data) return;

    const pos =
        randomWorldPosition();

    enemies.push({

        type,

        x: pos.x,
        y: pos.y,

        hp: data.hp,
        maxHp: data.hp,

        radius: data.radius,

        damage: data.damage,

        speed: data.speed,

        xp: data.xp,

        gold: data.gold,

        attackCooldown: 0,

        dead: false,

        respawn: 0,

        hitFlash: 0
    });
}

function maintainEnemies() {

    const alive =
        enemies.filter(
            e => !e.dead
        ).length;

    const desired = 30;

    if (alive >= desired) {
        return;
    }

    const types = [
        "wolf",
        "boar",
        "goblin",
        "orc"
    ];

    spawnEnemy(
        types[
            Math.floor(
                Math.random() *
                types.length
            )
        ]
    );
}

for (
    let i = 0;
    i < 30;
    i++
) {

    const types = [
        "wolf",
        "boar",
        "goblin",
        "orc"
    ];

    spawnEnemy(
        types[
            Math.floor(
                Math.random() *
                types.length
            )
        ]
    );
}

/* =========================================================
   LOOT
   ========================================================= */

const lootTables = {

    wolf: [
        {
            item: "wolfFang",
            chance: 0.75
        },
        {
            item: "leather",
            chance: 0.55
        },
        {
            item: "leatherHelmet",
            chance: 0.08
        },
        {
            item: "leatherBoots",
            chance: 0.07
        },
        {
            item: "apprenticeSword",
            chance: 0.04
        },
        {
            item: "potion",
            chance: 0.04
        }
    ],

    boar: [
        {
            item: "meat",
            chance: 0.8
        },
        {
            item: "leather",
            chance: 0.6
        },
        {
            item: "leatherArmor",
            chance: 0.08
        },
        {
            item: "woodenShield",
            chance: 0.07
        },
        {
            item: "leatherBoots",
            chance: 0.05
        },
        {
            item: "potion",
            chance: 0.05
        }
    ],

    goblin: [
        {
            item: "goblinEar",
            chance: 0.75
        },
        {
            item: "iron",
            chance: 0.45
        },
        {
            item: "ironSword",
            chance: 0.07
        },
        {
            item: "goblinHelmet",
            chance: 0.07
        },
        {
            item: "ironShield",
            chance: 0.04
        },
        {
            item: "goblinBoots",
            chance: 0.05
        }
    ],

    orc: [
        {
            item: "iron",
            chance: 0.7
        },
        {
            item: "leather",
            chance: 0.6
        },
        {
            item: "steelSword",
            chance: 0.06
        },
        {
            item: "ironArmor",
            chance: 0.06
        },
        {
            item: "ironShield",
            chance: 0.07
        },
        {
            item: "goblinHelmet",
            chance: 0.08
        },
        {
            item: "potion",
            chance: 0.12
        }
    ]
};

function processEnemyLoot(type) {

    const table =
        lootTables[type] || [];

    table.forEach(drop => {

        if (
            Math.random() >
            drop.chance
        ) {
            return;
        }

        switch (drop.item) {

            case "wolfFang":
                inventory.wolfFang++;
                break;

            case "goblinEar":
                inventory.goblinEar++;
                break;

            case "leather":
                inventory.leather++;
                break;

            case "meat":
                inventory.meat++;
                break;

            case "iron":
                inventory.iron++;
                break;

            case "potion":
                inventory.potions++;
                break;

            default:

                if (
                    itemDefinitions[
                        drop.item
                    ]
                ) {

                    addItem(
                        drop.item
                    );
                }

                break;
        }
    });
}

/* =========================================================
   COMBATE
   ========================================================= */

function distance(a, b) {

    return Math.hypot(
        a.x - b.x,
        a.y - b.y
    );
}

function getNearestEnemy(range) {

    let nearest = null;
    let best = Infinity;

    enemies.forEach(enemy => {

        if (enemy.dead) return;

        const d =
            distance(
                player,
                enemy
            );

        if (
            d <= range &&
            d < best
        ) {

            best = d;
            nearest = enemy;
        }
    });

    return nearest;
}

function attack() {

    if (player.dead) return;

    if (
        player.attackCooldown >
        0
    ) {
        return;
    }

    player.attackCooldown =
        player.attackDelay;

    player.attackAnimation =
        0.18;

    const target =
        getNearestEnemy(
            player.attackRange
        );

    if (!target) {

        showMessage(
            "⚔️ No hay enemigo en alcance."
        );

        return;
    }

    let damage =
        player.damage;

    if (
        Math.random() <
        player.criticalChance
    ) {

        damage =
            Math.round(
                damage *
                player.criticalDamage
            );

        showMessage(
            "💥 ¡GOLPE CRÍTICO!"
        );
    }

    if (
        player.rageTimer >
        0
    ) {

        damage =
            Math.round(
                damage * 1.5
            );
    }

    damageEnemy(
        target,
        damage
    );
}

function damageEnemy(
    enemy,
    damage
) {

    if (
        !enemy ||
        enemy.dead
    ) {
        return;
    }

    enemy.hp -= damage;
    enemy.hitFlash = 0.12;

    if (enemy.hp <= 0) {

        enemy.hp = 0;

        killEnemy(enemy);
    }
}

function killEnemy(enemy) {

    if (enemy.dead) return;

    enemy.dead = true;

    const data =
        enemyTypes[
            enemy.type
        ];

    inventory.gold +=
        data.gold;

    gainXP(
        data.xp
    );

    processEnemyLoot(
        enemy.type
    );

    updateQuest(
        "kill",
        enemy.type
    );

    showMessage(
        "☠️ Derrotaste un " +
        data.name +
        " +" +
        data.gold +
        " 🪙"
    );

    enemy.respawn =
        5;

    saveGame();
}

/* =========================================================
   XP
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
        Math.round(
            100 *
            Math.pow(
                1.22,
                player.level - 1
            )
        );

    const hpBonus = 8;

    player.maxHp +=
        hpBonus;

    player.hp =
        player.maxHp;

    player.maxMana +=
        5;

    player.mana =
        player.maxMana;

    recalculatePlayerStats();

    showMessage(
        "🎉 ¡SUBISTE A NIVEL " +
        player.level +
        "!"
    );

    saveGame();
}

/* =========================================================
   MOVIMIENTO
   ========================================================= */

let keys = {};

let joyX = 0;
let joyY = 0;

window.addEventListener(
    "keydown",
    e => {

        keys[e.key.toLowerCase()] =
            true;

        if (
            e.key.toLowerCase() ===
            "p"
        ) {
            usePotion();
        }

        if (
            e.key.toLowerCase() ===
            "i"
        ) {

            const panel =
                document.getElementById(
                    "inventoryPanel"
                );

            if (
                panel &&
                panel.style.display !==
                    "none"
            ) {

                closeInventory();

            } else {

                openInventory();
            }
        }
    }
);

window.addEventListener(
    "keyup",
    e => {

        keys[e.key.toLowerCase()] =
            false;
    }
);

function setupJoystick() {

    const joystick =
        document.getElementById(
            "joystick"
        );

    const knob =
        document.getElementById(
            "joystickKnob"
        );

    if (!joystick) return;

    function updateJoystick(
        clientX,
        clientY
    ) {

        const rect =
            joystick.getBoundingClientRect();

        const centerX =
            rect.left +
            rect.width / 2;

        const centerY =
            rect.top +
            rect.height / 2;

        let dx =
            clientX -
            centerX;

        let dy =
            clientY -
            centerY;

        const max =
            rect.width / 2;

        const length =
            Math.hypot(dx, dy);

        if (
            length >
            max
        ) {

            dx =
                dx / length *
                max;

            dy =
                dy / length *
                max;
        }

        joyX =
            dx / max;

        joyY =
            dy / max;

        if (knob) {

            knob.style.transform =
                `translate(${dx}px,${dy}px)`;
        }
    }

    function resetJoystick() {

        joyX = 0;
        joyY = 0;

        if (knob) {

            knob.style.transform =
                "translate(0,0)";
        }
    }

    joystick.addEventListener(
        "pointerdown",
        e => {

            joystick.setPointerCapture(
                e.pointerId
            );

            updateJoystick(
                e.clientX,
                e.clientY
            );
        }
    );

    joystick.addEventListener(
        "pointermove",
        e => {

            if (
                e.pressure === 0
            ) {
                return;
            }

            updateJoystick(
                e.clientX,
                e.clientY
            );
        }
    );

    joystick.addEventListener(
        "pointerup",
        resetJoystick
    );

    joystick.addEventListener(
        "pointercancel",
        resetJoystick
    );
}

setupJoystick();

/* =========================================================
   ACTUALIZAR
   ========================================================= */

function update(dt) {

    if (player.dead) {

        player.respawnTimer -= dt;

        if (
            player.respawnTimer <= 0
        ) {

            respawnPlayer();
        }

        return;
    }

    if (
        player.attackCooldown >
        0
    ) {

        player.attackCooldown -= dt;
    }

    if (
        player.attackAnimation >
        0
    ) {

        player.attackAnimation -= dt;
    }

    if (
        player.skillAnimation >
        0
    ) {

        player.skillAnimation -= dt;
    }

    if (
        player.rageTimer >
        0
    ) {

        player.rageTimer -= dt;
    }

    let dx = 0;
    let dy = 0;

    if (
        keys["w"] ||
        keys["arrowup"]
    ) dy--;

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) dy++;

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) dx--;

    if (
        keys["d"] ||
        keys["arrowright"]
    ) dx++;

    if (
        Math.abs(joyX) >
        0.05 ||
        Math.abs(joyY) >
        0.05
    ) {

        dx = joyX;
        dy = joyY;
    }

    const length =
        Math.hypot(dx, dy);

    if (length > 0) {

        dx /= length;
        dy /= length;

        player.x +=
            dx *
            player.speed *
            dt;

        player.y +=
            dy *
            player.speed *
            dt;

        player.directionX =
            dx;

        player.directionY =
            dy;
    }

    player.x =
        Math.max(
            player.radius,
            Math.min(
                WORLD_WIDTH -
                player.radius,
                player.x
            )
        );

    player.y =
        Math.max(
            player.radius,
            Math.min(
                WORLD_HEIGHT -
                player.radius,
                player.y
            )
        );

    updateEnemies(dt);
    updateResources(dt);

    maintainEnemies();

    updateUI();
}

/* =========================================================
   ENEMIGOS UPDATE
   ========================================================= */

function updateEnemies(dt) {

    enemies.forEach(enemy => {

        if (enemy.dead) {

            enemy.respawn -= dt;

            if (
                enemy.respawn <= 0
            ) {

                const pos =
                    randomWorldPosition();

                enemy.x = pos.x;
                enemy.y = pos.y;

                const data =
                    enemyTypes[
                        enemy.type
                    ];

                enemy.hp =
                    data.hp;

                enemy.maxHp =
                    data.hp;

                enemy.dead = false;
            }

            return;
        }

        if (
            enemy.hitFlash >
            0
        ) {

            enemy.hitFlash -= dt;
        }

        const d =
            distance(
                enemy,
                player
            );

        if (
            d <
            500
        ) {

            let dx =
                player.x -
                enemy.x;

            let dy =
                player.y -
                enemy.y;

            const len =
                Math.hypot(dx, dy);

            if (
                len >
                enemy.radius +
                player.radius +
                5
            ) {

                dx /= len;
                dy /= len;

                enemy.x +=
                    dx *
                    enemy.speed *
                    dt;

                enemy.y +=
                    dy *
                    enemy.speed *
                    dt;

            } else {

                enemy.attackCooldown -=
                    dt;

                if (
                    enemy.attackCooldown <=
                    0
                ) {

                    enemy.attackCooldown =
                        1.2;

                    const damage =
                        Math.max(
                            1,
                            enemy.damage -
                            player.defense
                        );

                    player.hp -=
                        damage;

                    if (
                        player.hp <=
                        0
                    ) {

                        player.hp = 0;

                        killPlayer();
                    }
                }
            }
        }
    });
}

/* =========================================================
   RECURSOS UPDATE
   ========================================================= */

function updateResources(dt) {

    resources.forEach(resource => {

        if (
            !resource.collected
        ) {
            return;
        }

        resource.respawn -=
            dt;

        if (
            resource.respawn <=
            0
        ) {

            resource.collected =
                false;
        }
    });
}

/* =========================================================
   RECOLECCIÓN
   ========================================================= */

function collectNearestResource() {

    let nearest = null;
    let best = 80;

    resources.forEach(resource => {

        if (
            resource.collected
        ) return;

        const d =
            distance(
                player,
                resource
            );

        if (
            d <
            best
        ) {

            best = d;
            nearest = resource;
        }
    });

    if (!nearest) {

        showMessage(
            "No hay recursos cerca."
        );

        return;
    }

    const tool =
        resourceTools[
            nearest.type
        ];

    if (
        tool &&
        !tools[tool].equipped
    ) {

        showMessage(
            "Necesitas " +
            tools[tool].name
        );

        return;
    }

    nearest.collected =
        true;

    nearest.respawn =
        20;

    switch (
        nearest.type
    ) {

        case "tree":

            inventory.wood++;
            break;

        case "rock":

            inventory.stone++;
            break;

        case "copper":

            inventory.copper++;
            break;

        case "iron":

            inventory.iron++;
            break;
    }

    updateQuest(
        "gather",
        nearest.type
    );

    showMessage(
        "⛏️ Recurso obtenido: " +
        nearest.type
    );

    saveGame();
}

/* =========================================================
   DOBLE TOQUE PARA RECOGER
   ========================================================= */

let lastTap = 0;

canvas.addEventListener(
    "pointerdown",
    () => {

        const now =
            Date.now();

        if (
            now -
            lastTap <
            350
        ) {

            collectNearestResource();
        }

        lastTap = now;
    }
);

/* =========================================================
   MUERTE
   ========================================================= */

function killPlayer() {

    player.dead = true;

    player.respawnTimer = 3;

    showMessage(
        "☠️ Has muerto..."
    );

    saveGame();
}

function respawnPlayer() {

    player.dead = false;

    player.x = CITY_X;
    player.y = CITY_Y;

    player.hp =
        player.maxHp;

    player.mana =
        player.maxMana;

    showMessage(
        "✨ Has regresado a la ciudad."
    );

    saveGame();
}

/* =========================================================
   QUESTS
   ========================================================= */

const questDefinitions = {

    firstSteps: {

        id: "firstSteps",

        name: "Primeros pasos",

        description:
            "Derrota 3 enemigos.",

        type: "killAny",

        target: 3,

        rewardXP: 100,

        rewardGold: 50
    },

    wolves: {

        id: "wolves",

        name: "Amenaza de los lobos",

        description:
            "Derrota 5 lobos.",

        type: "kill",

        targetType: "wolf",

        target: 5,

        rewardXP: 180,

        rewardGold: 100
    },

    resources: {

        id: "resources",

        name: "Recursos para la ciudad",

        description:
            "Recolecta 10 recursos.",

        type: "gatherAny",

        target: 10,

        rewardXP: 150,

        rewardGold: 80
    }
};

let quests = {

    firstSteps: {
        progress: 0,
        completed: false
    },

    wolves: {
        progress: 0,
        completed: false
    },

    resources: {
        progress: 0,
        completed: false
    }
};

function updateQuest(
    action,
    type
) {

    Object.values(
        questDefinitions
    ).forEach(def => {

        const q =
            quests[def.id];

        if (
            !q ||
            q.completed
        ) {
            return;
        }

        if (
            def.type ===
            "killAny" &&
            action === "kill"
        ) {

            q.progress++;
        }

        if (
            def.type ===
            "kill" &&
            action === "kill" &&
            def.targetType === type
        ) {

            q.progress++;
        }

        if (
            def.type ===
            "gatherAny" &&
            action === "gather"
        ) {

            q.progress++;
        }

        if (
            q.progress >=
            def.target
        ) {

            q.progress =
                def.target;

            q.completed =
                true;

            inventory.gold +=
                def.rewardGold;

            gainXP(
                def.rewardXP
            );

            showMessage(
                "📜 Misión completada: " +
                def.name
            );
        }
    });

    saveGame();
}

/* =========================================================
   HERRERO
   ========================================================= */

function blacksmithUpgrade() {

    if (
        inventory.gold <
        100
    ) {

        showMessage(
            "Necesitas 100 monedas."
        );

        return;
    }

    if (
        inventory.iron <
        5
    ) {

        showMessage(
            "Necesitas 5 de hierro."
        );

        return;
    }

    inventory.gold -=
        100;

    inventory.iron -=
        5;

    const weapon =
        equipment.weapon;

    if (!weapon) {

        showMessage(
            "No tienes arma equipada."
        );

        return;
    }

    weapon.damage =
        (weapon.damage || 0) +
        5;

    showMessage(
        "🔨 ¡Tu arma fue mejorada!"
    );

    recalculatePlayerStats();

    saveGame();
}

/* =========================================================
   CÁMARA
   ========================================================= */

const camera = {

    x: 0,
    y: 0
};

function updateCamera() {

    camera.x =
        player.x -
        canvas.width / 2;

    camera.y =
        player.y -
        canvas.height / 2;

    camera.x =
        Math.max(
            0,
            Math.min(
                WORLD_WIDTH -
                canvas.width,
                camera.x
            )
        );

    camera.y =
        Math.max(
            0,
            Math.min(
                WORLD_HEIGHT -
                canvas.height,
                camera.y
            )
        );
}

/* =========================================================
   TERRENO
   ========================================================= */

const TERRAIN = {

    GRASS: 0,
    WATER: 1,
    SAND: 2,
    FOREST: 3,
    ROCK: 4
};

function terrainAt(x, y) {

    const wave =
        Math.sin(
            x * 0.002
        ) +
        Math.cos(
            y * 0.002
        );

    const wave2 =
        Math.sin(
            (x + y) *
            0.0013
        );

    if (
        Math.abs(wave) >
        1.65
    ) {

        return TERRAIN.WATER;
    }

    if (
        wave2 >
        0.9
    ) {

        return TERRAIN.ROCK;
    }

    if (
        wave2 <
        -0.9
    ) {

        return TERRAIN.FOREST;
    }

    return TERRAIN.GRASS;
}

/* =========================================================
   DIBUJAR TERRENO
   ========================================================= */

function drawTerrain() {

    const startX =
        Math.floor(
            camera.x / TILE
        ) - 1;

    const endX =
        Math.ceil(
            (
                camera.x +
                canvas.width
            ) / TILE
        ) + 1;

    const startY =
        Math.floor(
            camera.y / TILE
        ) - 1;

    const endY =
        Math.ceil(
            (
                camera.y +
                canvas.height
            ) / TILE
        ) + 1;

    for (
        let ty = startY;
        ty <= endY;
        ty++
    ) {

        for (
            let tx = startX;
            tx <= endX;
            tx++
        ) {

            if (
                tx < 0 ||
                ty < 0
            ) {
                continue;
            }

            const wx =
                tx * TILE;

            const wy =
                ty * TILE;

            const terrain =
                terrainAt(
                    wx,
                    wy
                );

            switch (
                terrain
            ) {

                case TERRAIN.WATER:

                    ctx.fillStyle =
                        "#245b7a";

                    break;

                case TERRAIN.FOREST:

                    ctx.fillStyle =
                        "#24462c";

                    break;

                case TERRAIN.ROCK:

                    ctx.fillStyle =
                        "#555a60";

                    break;

                default:

                    ctx.fillStyle =
                        "#315b35";
            }

            ctx.fillRect(
                wx -
                camera.x,
                wy -
                camera.y,
                TILE + 1,
                TILE + 1
            );

            if (
                terrain ===
                TERRAIN.GRASS
            ) {

                ctx.fillStyle =
                    "rgba(255,255,255,.035)";

                ctx.fillRect(
                    wx -
                    camera.x +
                    10,
                    wy -
                    camera.y +
                    12,
                    2,
                    9
                );

                ctx.fillRect(
                    wx -
                    camera.x +
                    35,
                    wy -
                    camera.y +
                    28,
                    2,
                    7
                );
            }
        }
    }
}

/* =========================================================
   CIUDAD
   ========================================================= */

function drawCity() {

    const x =
        CITY_X -
        camera.x;

    const y =
        CITY_Y -
        camera.y;

    ctx.save();

    ctx.fillStyle =
        "#70614b";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        430,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#91806a";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        300,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       Plaza
    */

    ctx.fillStyle =
        "#b4a17e";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        115,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       Fuente
    */

    ctx.fillStyle =
        "#4c9bc0";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        42,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.strokeStyle =
        "#d8c59a";

    ctx.lineWidth = 8;

    ctx.stroke();

    /*
       Casas
    */

    const houses = [

        [-230, -180],
        [180, -180],
        [-230, 130],
        [180, 130]
    ];

    houses.forEach(
        ([hx, hy]) => {

            const px =
                x + hx;

            const py =
                y + hy;

            ctx.fillStyle =
                "#59483a";

            ctx.fillRect(
                px - 55,
                py - 45,
                110,
                90
            );

            ctx.fillStyle =
                "#8b3e35";

            ctx.beginPath();

            ctx.moveTo(
                px - 70,
                py - 45
            );

            ctx.lineTo(
                px,
                py - 100
            );

            ctx.lineTo(
                px + 70,
                py - 45
            );

            ctx.closePath();

            ctx.fill();
        }
    );

    ctx.restore();
}

/* =========================================================
   RECURSOS DIBUJAR
   ========================================================= */

function drawResources() {

    resources.forEach(resource => {

        if (
            resource.collected
        ) {
            return;
        }

        const sx =
            resource.x -
            camera.x;

        const sy =
            resource.y -
            camera.y;

        if (
            sx < -80 ||
            sy < -80 ||
            sx >
                canvas.width +
                80 ||
            sy >
                canvas.height +
                80
        ) {

            return;
        }

        ctx.save();

        switch (
            resource.type
        ) {

            case "tree":

                ctx.fillStyle =
                    "#70482d";

                ctx.fillRect(
                    sx - 7,
                    sy,
                    14,
                    35
                );

                ctx.fillStyle =
                    "#1c672f";

                ctx.beginPath();

                ctx.arc(
                    sx,
                    sy - 12,
                    32,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                break;

            case "rock":

                ctx.fillStyle =
                    "#85898c";

                ctx.beginPath();

                ctx.arc(
                    sx,
                    sy,
                    24,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                break;

            case "copper":

                ctx.fillStyle =
                    "#b86c42";

                ctx.beginPath();

                ctx.arc(
                    sx,
                    sy,
                    24,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                break;

            case "iron":

                ctx.fillStyle =
                    "#b9c0c5";

                ctx.beginPath();

                ctx.arc(
                    sx,
                    sy,
                    24,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                break;
        }

        ctx.restore();
    });
}

/* =========================================================
   ENEMIGOS DIBUJAR
   ========================================================= */

function drawEnemies() {

    enemies.forEach(enemy => {

        if (enemy.dead) return;

        const sx =
            enemy.x -
            camera.x;

        const sy =
            enemy.y -
            camera.y;

        if (
            sx < -100 ||
            sy < -100 ||
            sx >
                canvas.width +
                100 ||
            sy >
                canvas.height +
                100
        ) {

            return;
        }

        const data =
            enemyTypes[
                enemy.type
            ];

        ctx.save();

        ctx.font =
            "32px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        if (
            enemy.hitFlash >
            0
        ) {

            ctx.globalAlpha =
                0.55;
        }

        ctx.fillText(
            data.icon,
            sx,
            sy
        );

        /*
           barra de vida
        */

        ctx.fillStyle =
            "#401515";

        ctx.fillRect(
            sx - 28,
            sy - 34,
            56,
            6
        );

        ctx.fillStyle =
            "#d33";

        ctx.fillRect(
            sx - 28,
            sy - 34,
            56 *
            (
                enemy.hp /
                enemy.maxHp
            ),
            6
        );

        ctx.restore();
    });
}

/* =========================================================
   JUGADOR DIBUJAR
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
       sombra
    */

    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.beginPath();

    ctx.ellipse(
        sx,
        sy + 18,
        22,
        9,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       cuerpo
    */

    ctx.fillStyle =
        player.color;

    ctx.beginPath();

    ctx.arc(
        sx,
        sy,
        20,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       armadura
    */

    ctx.fillStyle =
        "#596675";

    ctx.beginPath();

    ctx.arc(
        sx,
        sy + 4,
        16,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       cabeza
    */

    ctx.fillStyle =
        "#d9b38c";

    ctx.beginPath();

    ctx.arc(
        sx,
        sy - 17,
        11,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       casco
    */

    ctx.fillStyle =
        "#a8afb8";

    ctx.beginPath();

    ctx.arc(
        sx,
        sy - 20,
        12,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();

    /*
       espada
    */

    const swordX =
        sx +
        player.directionX *
        28;

    const swordY =
        sy +
        player.directionY *
        28;

    ctx.strokeStyle =
        "#e4e9ee";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
        sx,
        sy
    );

    ctx.lineTo(
        swordX,
        swordY
    );

    ctx.stroke();

    /*
       ataque
    */

    if (
        player.attackAnimation >
        0
    ) {

        ctx.strokeStyle =
            "rgba(255,255,255,.8)";

        ctx.lineWidth = 5;

        ctx.beginPath();

        ctx.arc(
            sx,
            sy,
            player.attackRange,
            -1,
            1
        );

        ctx.stroke();
    }

    /*
       nombre
    */

    ctx.font =
        "bold 13px Arial";

    ctx.textAlign =
        "center";

    ctx.fillStyle =
        "#fff";

    ctx.fillText(
        player.name,
        sx,
        sy - 48
    );

    ctx.restore();
}

/* =========================================================
   NPC
   ========================================================= */

const npcs = [

    {
        name: "Guardián de Ceniza",
        icon: "🛡️",
        x: CITY_X - 180,
        y: CITY_Y
    },

    {
        name: "Herrero Aldric",
        icon: "🔨",
        x: CITY_X + 180,
        y: CITY_Y - 100
    },

    {
        name: "Mercader Lina",
        icon: "🛒",
        x: CITY_X + 180,
        y: CITY_Y + 100
    },

    {
        name: "Maestro Rokan",
        icon: "📜",
        x: CITY_X - 180,
        y: CITY_Y + 100
    }
];

function drawNPCs() {

    npcs.forEach(npc => {

        const sx =
            npc.x -
            camera.x;

        const sy =
            npc.y -
            camera.y;

        ctx.save();

        ctx.font =
            "32px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            npc.icon,
            sx,
            sy
        );

        ctx.font =
            "12px Arial";

        ctx.fillStyle =
            "#fff";

        ctx.fillText(
            npc.name,
            sx,
            sy + 30
        );

        ctx.restore();
    });
}

/* =========================================================
   MINIMAPA
   ========================================================= */

function drawMinimap() {

    const size = 130;

    const x =
        canvas.width -
        size -
        15;

    const y = 15;

    ctx.save();

    ctx.fillStyle =
        "rgba(0,0,0,.65)";

    ctx.fillRect(
        x,
        y,
        size,
        size
    );

    ctx.strokeStyle =
        "#c8a85d";

    ctx.strokeRect(
        x,
        y,
        size,
        size
    );

    const px =
        x +
        (
            player.x /
            WORLD_WIDTH
        ) *
        size;

    const py =
        y +
        (
            player.y /
            WORLD_HEIGHT
        ) *
        size;

    ctx.fillStyle =
        "#fff";

    ctx.beginPath();

    ctx.arc(
        px,
        py,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();

    enemies.forEach(enemy => {

        if (enemy.dead) return;

        ctx.fillStyle =
            "#d33";

        ctx.fillRect(
            x +
            (
                enemy.x /
                WORLD_WIDTH
            ) *
            size -
            1,
            y +
            (
                enemy.y /
                WORLD_HEIGHT
            ) *
            size -
            1,
            3,
            3
        );
    });

    ctx.restore();
}

/* =========================================================
   DRAW
   ========================================================= */

function draw() {

    try {

        updateCamera();

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#101820";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        drawTerrain();

        drawCity();

        drawResources();

        drawNPCs();

        drawEnemies();

        drawPlayer();

        drawMinimap();

    } catch (error) {

        console.error(
            "Error de render:",
            error
        );

        /*
           Evita que un error de dibujo
           deje el juego completamente muerto.
        */
    }
}

/* =========================================================
   HUD
   ========================================================= */

let lastUIUpdate = 0;

function updateUI() {

    const now =
        performance.now();

    /*
       Evitamos reconstruir el inventario
       10 veces por segundo.
    */

    if (
        now -
        lastUIUpdate <
        250
    ) {

        return;
    }

    lastUIUpdate = now;

    const hpBar =
        document.getElementById(
            "hpBar"
        );

    if (hpBar) {

        hpBar.style.width =
            (
                player.hp /
                player.maxHp *
                100
            ) +
            "%";
    }

    const xpBar =
        document.getElementById(
            "xpBar"
        );

    if (xpBar) {

        xpBar.style.width =
            (
                player.xp /
                player.xpNeeded *
                100
            ) +
            "%";
    }

    const hp =
        document.getElementById(
            "hp"
        );

    if (hp) {

        hp.textContent =
            Math.round(
                player.hp
            ) +
            "/" +
            player.maxHp;
    }

    const level =
        document.getElementById(
            "level"
        );

    if (level) {

        level.textContent =
            "Nivel " +
            player.level;
    }

    const gold =
        document.getElementById(
            "gold"
        );

    if (gold) {

        gold.textContent =
            inventory.gold;
    }

    const wood =
        document.getElementById(
            "wood"
        );

    if (wood) {

        wood.textContent =
            inventory.wood;
    }

    const stone =
        document.getElementById(
            "stone"
        );

    if (stone) {

        stone.textContent =
            inventory.stone;
    }

    const copper =
        document.getElementById(
            "copper"
        );

    if (copper) {

        copper.textContent =
            inventory.copper;
    }

    const iron =
        document.getElementById(
            "iron"
        );

    if (iron) {

        iron.textContent =
            inventory.iron;
    }

    const fish =
        document.getElementById(
            "fish"
        );

    if (fish) {

        fish.textContent =
            inventory.fish;
    }

    const playerName =
        document.getElementById(
            "playerName"
        );

    if (playerName) {

        playerName.textContent =
            player.name;
    }

    const hudText =
        document.getElementById(
            "hudText"
        );

    if (hudText) {

        hudText.textContent =
            player.classId +
            " • Nivel " +
            player.level +
            " • ⚔️ " +
            player.damage +
            " • 🛡️ " +
            player.defense;
    }

    const manaBar =
        document.getElementById(
            "manaBar"
        );

    if (manaBar) {

        manaBar.style.width =
            (
                player.mana /
                player.maxMana *
                100
            ) +
            "%";
    }
}

/* =========================================================
   MENSAJES
   ========================================================= */

let messageTimer = 0;

function showMessage(text) {

    const message =
        document.getElementById(
            "message"
        );

    if (message) {

        message.textContent =
            text;

        messageTimer = 3;
    }

    console.log(text);
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
        "pointerdown",
        e => {

            e.preventDefault();

            attack();
        }
    );
}

/* =========================================================
   BOTONES DINÁMICOS
   ========================================================= */

function createMobileButtons() {

    /*
       Inventario
    */

    if (
        !document.getElementById(
            "openInventoryButton"
        )
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.id =
            "openInventoryButton";

        button.textContent =
            "🎒";

        button.style.cssText = `
            position:fixed;
            right:18px;
            bottom:145px;
            width:58px;
            height:58px;
            border-radius:50%;
            border:2px solid #b99650;
            background:rgba(20,24,30,.9);
            color:white;
            font-size:27px;
            z-index:3000;
        `;

        button.onclick =
            openInventory;

        document.body.appendChild(
            button
        );
    }

    /*
       Poción
    */

    if (
        !document.getElementById(
            "potionButton"
        )
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.id =
            "potionButton";

        button.textContent =
            "🧪";

        button.style.cssText = `
            position:fixed;
            right:88px;
            bottom:145px;
            width:58px;
            height:58px;
            border-radius:50%;
            border:2px solid #b34d4d;
            background:rgba(20,24,30,.9);
            color:white;
            font-size:25px;
            z-index:3000;
        `;

        button.onclick =
            usePotion;

        document.body.appendChild(
            button
        );
    }

    /*
       Recolectar
    */

    if (
        !document.getElementById(
            "gatherButton"
        )
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.id =
            "gatherButton";

        button.textContent =
            "⛏️";

        button.style.cssText = `
            position:fixed;
            right:158px;
            bottom:145px;
            width:58px;
            height:58px;
            border-radius:50%;
            border:2px solid #7893a8;
            background:rgba(20,24,30,.9);
            color:white;
            font-size:25px;
            z-index:3000;
        `;

        button.onclick =
            collectNearestResource;

        document.body.appendChild(
            button
        );
    }
}

/* =========================================================
   MENÚ DE HABILIDADES
   ========================================================= */

function createSkillBar() {

    let bar =
        document.getElementById(
            "skillBarDynamic"
        );

    if (!bar) {

        bar =
            document.createElement(
                "div"
            );

        bar.id =
            "skillBarDynamic";

        bar.style.cssText = `
            position:fixed;
            left:50%;
            transform:translateX(-50%);
            bottom:15px;
            display:flex;
            gap:6px;
            z-index:2500;
            background:rgba(10,12,17,.72);
            padding:7px;
            border-radius:14px;
        `;

        document.body.appendChild(
            bar
        );
    }

    bar.innerHTML = "";

    const skillIds = [
        "powerStrike",
        "rapidShot",
        "fireball",
        "shadowStrike",
        "survival",
        "heal",
        "whirlwind",
        "rage",
        "execution",
        "swordRain"
    ];

    skillIds.forEach(
        skillId => {

            const skill =
                skills[skillId];

            if (!skill) return;

            const button =
                document.createElement(
                    "button"
                );

            const unlocked =
                player.level >=
                skill.level;

            button.textContent =
                skill.icon;

            button.title =
                skill.name +
                " — Nivel " +
                skill.level;

            button.style.cssText = `
                width:48px;
                height:48px;
                border-radius:10px;
                border:1px solid #78643b;
                background:${
                    unlocked
                    ? "#202936"
                    : "#11151a"
                };
                opacity:${
                    unlocked
                    ? "1"
                    : ".45"
                };
                color:white;
                font-size:22px;
            `;

            button.onclick =
                () =>
                    useSkill(
                        skillId
                    );

            bar.appendChild(
                button
            );
        }
    );
}

/* =========================================================
   CREACIÓN DE PERSONAJES
   ========================================================= */

function getCharacters() {

    try {

        return JSON.parse(
            localStorage.getItem(
                CHARACTERS_KEY
            )
        ) || [];

    } catch {

        return [];
    }
}

function saveCharacters(
    characters
) {

    localStorage.setItem(
        CHARACTERS_KEY,
        JSON.stringify(
            characters
        )
    );
}

/* =========================================================
   CREAR PERSONAJE UI
   ========================================================= */

function showCharacterCreation() {

    removeCharacterScreens();

    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "characterCreationScreen";

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:100000;
        overflow:auto;
        background:
            radial-gradient(
                circle at center,
                #28394b,
                #0b0f15 70%
            );
        color:white;
        font-family:Arial,sans-serif;
        padding:25px 15px;
    `;

    overlay.innerHTML = `

        <div style="
            width:min(600px,100%);
            margin:auto;
            text-align:center;
        ">

            <div style="
                font-size:42px;
                font-weight:bold;
                margin-top:10px;
            ">
                ⚔️ REINOS DE CENIZA
            </div>

            <div style="
                color:#d3b467;
                margin:8px;
                font-size:18px;
            ">
                CREAR PERSONAJE
            </div>

            <div style="
                background:rgba(10,13,18,.9);
                border:2px solid #796035;
                border-radius:18px;
                padding:20px;
                margin-top:20px;
            ">

                <div style="
                    font-size:70px;
                    margin-bottom:10px;
                " id="creationAvatar">
                    🧙
                </div>

                <input
                    id="characterNameInput"
                    maxlength="16"
                    placeholder="Nombre del personaje"
                    style="
                        width:100%;
                        padding:14px;
                        border-radius:10px;
                        border:1px solid #666;
                        background:#171d25;
                        color:white;
                        font-size:17px;
                        text-align:center;
                    "
                >

                <h3>
                    Apariencia
                </h3>

                <div style="
                    display:flex;
                    gap:8px;
                    justify-content:center;
                    flex-wrap:wrap;
                ">

                    <button
                        class="appearanceButton"
                        data-color="#d9b38c"
                    >
                        🧑
                    </button>

                    <button
                        class="appearanceButton"
                        data-color="#a86f55"
                    >
                        🧑🏽
                    </button>

                    <button
                        class="appearanceButton"
                        data-color="#704936"
                    >
                        🧑🏿
                    </button>

                </div>

                <h3>
                    Elige tu clase
                </h3>

                <div
                    id="classSelection"
                    style="
                        display:grid;
                        grid-template-columns:
                        repeat(
                            auto-fit,
                            minmax(130px,1fr)
                        );
                        gap:8px;
                    "
                ></div>

                <button
                    id="createCharacterConfirm"
                    style="
                        width:100%;
                        margin-top:18px;
                        padding:15px;
                        border:0;
                        border-radius:12px;
                        background:#80632e;
                        color:white;
                        font-size:18px;
                        font-weight:bold;
                    "
                >
                    ⚔️ CREAR PERSONAJE
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(
        overlay
    );

    let selectedClass =
        "warrior";

    let selectedColor =
        "#d9b38c";

    const classContainer =
        document.getElementById(
            "classSelection"
        );

    Object.values(
        classes
    ).forEach(cls => {

        const button =
            document.createElement(
                "button"
            );

        button.style.cssText = `
            padding:12px;
            border-radius:12px;
            border:2px solid ${
                cls.id ===
                selectedClass
                    ? "#e0b85c"
                    : "#343b46"
            };
            background:#171d25;
            color:white;
        `;

        button.innerHTML = `
            <div style="
                font-size:30px;
            ">
                ${cls.icon}
            </div>

            <b>
                ${cls.name}
            </b>

            <div style="
                font-size:11px;
                margin-top:5px;
                color:#bbb;
            ">
                ${cls.description}
            </div>
        `;

        button.onclick =
            () => {

                selectedClass =
                    cls.id;

                Array.from(
                    classContainer
                        .children
                ).forEach(
                    b =>
                        b.style.borderColor =
                            "#343b46"
                );

                button.style.borderColor =
                    "#e0b85c";

                document.getElementById(
                    "creationAvatar"
                ).textContent =
                    cls.icon;
            };

        classContainer.appendChild(
            button
        );
    });

    document
        .querySelectorAll(
            ".appearanceButton"
        )
        .forEach(button => {

            button.style.cssText = `
                width:55px;
                height:55px;
                font-size:28px;
                border-radius:50%;
                border:2px solid #444;
                background:#222;
            `;

            button.onclick =
                () => {

                    selectedColor =
                        button.dataset.color;

                    document.getElementById(
                        "creationAvatar"
                    ).style.color =
                        selectedColor;
                };
        });

    document
        .getElementById(
            "createCharacterConfirm"
        )
        .onclick =
        () => {

            const name =
                document
                    .getElementById(
                        "characterNameInput"
                    )
                    .value
                    .trim();

            if (
                name.length <
                3
            ) {

                alert(
                    "El nombre debe tener al menos 3 caracteres."
                );

                return;
            }

            createNewCharacter(
                name,
                selectedClass,
                selectedColor
            );
        };
}

/* =========================================================
   CREAR PERSONAJE
   ========================================================= */

function createNewCharacter(
    name,
    classId,
    color
) {

    const characters =
        getCharacters();

    if (
        characters.length >= 5
    ) {

        alert(
            "Ya tienes 5 personajes."
        );

        return;
    }

    const cls =
        classes[classId];

    const character = {

        id:
            "char_" +
            Date.now(),

        name,

        classId,

        color,

        created:
            Date.now(),

        level: 1,

        xp: 0,

        gold: 150,

        position: {
            x: CITY_X,
            y: CITY_Y
        }
    };

    characters.push(
        character
    );

    saveCharacters(
        characters
    );

    loadCharacter(
        character.id
    );
}

/* =========================================================
   SELECCIÓN DE PERSONAJES
   ========================================================= */

function showCharacterSelection() {

    removeCharacterScreens();

    const characters =
        getCharacters();

    if (
        characters.length === 0
    ) {

        showCharacterCreation();

        return;
    }

    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "characterSelectionScreen";

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:100000;
        overflow:auto;
        background:
            radial-gradient(
                circle at center,
                #28394b,
                #090d13 70%
            );
        color:white;
        font-family:Arial,sans-serif;
        padding:25px 15px;
    `;

    overlay.innerHTML = `

        <div style="
            width:min(650px,100%);
            margin:auto;
            text-align:center;
        ">

            <div style="
                font-size:38px;
                font-weight:bold;
                margin:20px 0;
            ">
                ⚔️ REINOS DE CENIZA
            </div>

            <div style="
                color:#d6b563;
                font-size:18px;
                margin-bottom:20px;
            ">
                SELECCIONA TU PERSONAJE
            </div>

            <div
                id="charactersList"
                style="
                    display:grid;
                    gap:12px;
                "
            ></div>

            ${
                characters.length < 5
                ? `
                    <button
                        id="newCharacterButton"
                        style="
                            width:100%;
                            margin-top:15px;
                            padding:15px;
                            border:0;
                            border-radius:12px;
                            background:#80632e;
                            color:white;
                            font-size:17px;
                            font-weight:bold;
                        "
                    >
                        ➕ CREAR PERSONAJE
                    </button>
                `
                : ""
            }

        </div>
    `;

    document.body.appendChild(
        overlay
    );

    const list =
        document.getElementById(
            "charactersList"
        );

    characters.forEach(
        character => {

            const cls =
                classes[
                    character.classId
                ] ||
                classes.warrior;

            const card =
                document.createElement(
                    "button"
                );

            card.style.cssText = `
                width:100%;
                padding:18px;
                border-radius:15px;
                border:2px solid #5c4b2c;
                background:#151b23;
                color:white;
                text-align:left;
            `;

            card.innerHTML = `

                <div style="
                    display:flex;
                    align-items:center;
                    gap:15px;
                ">

                    <div style="
                        font-size:55px;
                    ">
                        ${cls.icon}
                    </div>

                    <div>

                        <div style="
                            font-size:21px;
                            font-weight:bold;
                        ">
                            ${character.name}
                        </div>

                        <div style="
                            color:#d7b566;
                        ">
                            ${cls.name}
                        </div>

                        <div style="
                            color:#aaa;
                            margin-top:4px;
                        ">
                            Nivel ${character.level}
                        </div>

                    </div>

                </div>
            `;

            card.onclick =
                () =>
                    loadCharacter(
                        character.id
                    );

            list.appendChild(
                card
            );
        }
    );

    const newButton =
        document.getElementById(
            "newCharacterButton"
        );

    if (newButton) {

        newButton.onclick =
            showCharacterCreation;
    }
}

/* =========================================================
   CARGAR PERSONAJE
   ========================================================= */

function loadCharacter(
    characterId
) {

    const characters =
        getCharacters();

    const saved =
        characters.find(
            c =>
                c.id ===
                characterId
        );

    if (!saved) return;

    currentCharacterId =
        characterId;

    player.name =
        saved.name;

    player.classId =
        saved.classId;

    player.color =
        saved.color ||
        "#d9b38c";

    player.level =
        saved.level ||
        1;

    player.xp =
        saved.xp ||
        0;

    player.x =
        saved.position?.x ||
        CITY_X;

    player.y =
        saved.position?.y ||
        CITY_Y;

    const cls =
        classes[
            player.classId
        ] ||
        classes.warrior;

    player.maxHp =
        cls.hp;

    player.hp =
        player.maxHp;

    player.maxMana =
        cls.mana;

    player.mana =
        player.maxMana;

    inventory.gold =
        saved.gold ??
        150;

    recalculatePlayerStats();

    removeCharacterScreens();

    startGame();

    saveGame();
}

/* =========================================================
   BORRAR PANTALLAS
   ========================================================= */

function removeCharacterScreens() {

    [
        "characterCreationScreen",
        "characterSelectionScreen"
    ].forEach(id => {

        const el =
            document.getElementById(
                id
            );

        if (el) {
            el.remove();
        }
    });
}

/* =========================================================
   GUARDAR PARTIDA
   ========================================================= */

function saveGame() {

    try {

        const save = {

            version: 1000,

            player: {
                ...player
            },

            inventory: {
                ...inventory
            },

            inventorySlots,

            itemInventory: [
                ...itemInventory
            ],

            equipment: {
                ...equipment
            },

            quests: {
                ...quests
            },

            tools: {
                ...tools
            }
        };

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(
                save
            )
        );

        /*
           Actualizar personaje
        */

        if (
            currentCharacterId
        ) {

            const characters =
                getCharacters();

            const index =
                characters.findIndex(
                    c =>
                        c.id ===
                        currentCharacterId
                );

            if (
                index !== -1
            ) {

                characters[index]
                    .name =
                    player.name;

                characters[index]
                    .classId =
                    player.classId;

                characters[index]
                    .color =
                    player.color;

                characters[index]
                    .level =
                    player.level;

                characters[index]
                    .xp =
                    player.xp;

                characters[index]
                    .gold =
                    inventory.gold;

                characters[index]
                    .position = {
                        x: player.x,
                        y: player.y
                    };

                saveCharacters(
                    characters
                );
            }
        }

    } catch (error) {

        console.error(
            "Error guardando:",
            error
        );
    }
}

/* =========================================================
   CARGAR SAVE
   ========================================================= */

function loadSave() {

    try {

        const raw =
            localStorage.getItem(
                SAVE_KEY
            );

        if (!raw) {

            return false;
        }

        const save =
            JSON.parse(raw);

        if (
            save.player
        ) {

            Object.assign(
                player,
                save.player
            );
        }

        if (
            save.inventory
        ) {

            Object.assign(
                inventory,
                save.inventory
            );
        }

        if (
            save.inventorySlots
        ) {

            inventorySlots =
                Math.max(
                    30,
                    save.inventorySlots
                );
        }

        if (
            Array.isArray(
                save.itemInventory
            )
        ) {

            itemInventory =
                save.itemInventory;
        }

        if (
            save.equipment
        ) {

            Object.assign(
                equipment,
                save.equipment
            );
        }

        if (
            save.quests
        ) {

            Object.assign(
                quests,
                save.quests
            );
        }

        if (
            save.tools
        ) {

            Object.assign(
                tools,
                save.tools
            );
        }

        recalculatePlayerStats();

        return true;

    } catch (error) {

        console.warn(
            "Guardado antiguo incompatible:",
            error
        );

        return false;
    }
}

/* =========================================================
   INICIALIZAR INVENTARIO DE PERSONAJE
   ========================================================= */

function createStartingInventory() {

    itemInventory = [];

    inventorySlots = 30;

    Object.keys(
        inventory
    ).forEach(key => {

        if (
            key === "gold"
        ) return;

        inventory[key] = 0;
    });

    inventory.gold = 150;
    inventory.potions = 3;

    equipment = {

        weapon:
            cloneItem(
                classes[
                    player.classId
                ]?.weapon ||
                "ironSword"
            ),

        helmet:
            cloneItem(
                "ironHelmet"
            ),

        armor:
            cloneItem(
                "ironArmor"
            ),

        boots:
            cloneItem(
                "leatherBoots"
            ),

        shield:
            cloneItem(
                "woodenShield"
            )
    };

    /*
       Material inicial
    */

    inventory.wood = 0;
    inventory.stone = 0;
    inventory.copper = 0;
    inventory.iron = 0;

    inventory.meat = 0;
    inventory.leather = 0;
    inventory.wolfFang = 0;
    inventory.goblinEar = 0;
    inventory.bait = 0;
    inventory.fish = 0;

    quests = {

        firstSteps: {
            progress: 0,
            completed: false
        },

        wolves: {
            progress: 0,
            completed: false
        },

        resources: {
            progress: 0,
            completed: false
        }
    };

    recalculatePlayerStats();
}

/* =========================================================
   INICIAR GAME
   ========================================================= */

let gameStarted = false;

function startGame() {

    gameStarted = true;

    /*
       Si no existe inventario válido,
       crear el inicial.
    */

    if (
        !equipment.weapon
    ) {

        createStartingInventory();
    }

    createResources();

    if (
        enemies.length === 0
    ) {

        for (
            let i = 0;
            i < 30;
            i++
        ) {

            const types = [
                "wolf",
                "boar",
                "goblin",
                "orc"
            ];

            spawnEnemy(
                types[
                    Math.floor(
                        Math.random() *
                        types.length
                    )
                ]
            );
        }
    }

    createMobileButtons();

    createSkillBar();

    updateUI();

    showMessage(
        "⚔️ Bienvenido a Reinos de Ceniza, " +
        player.name
    );
}

/* =========================================================
   NUEVO JUGADOR
   ========================================================= */

function firstLaunch() {

    const characters =
        getCharacters();

    if (
        characters.length === 0
    ) {

        showCharacterCreation();

        return;
    }

    /*
       Intentamos cargar la última partida
    */

    const loaded =
        loadSave();

    if (
        loaded &&
        player.name
    ) {

        startGame();

        return;
    }

    showCharacterSelection();
}

/* =========================================================
   BOTÓN PARA CAMBIAR PERSONAJE
   ========================================================= */

function createCharacterMenuButton() {

    if (
        document.getElementById(
            "characterButton"
        )
    ) {
        return;
    }

    const button =
        document.createElement(
            "button"
        );

    button.id =
        "characterButton";

    button.textContent =
        "👤";

    button.title =
        "Cambiar personaje";

    button.style.cssText = `
        position:fixed;
        top:15px;
        left:15px;
        width:48px;
        height:48px;
        border-radius:50%;
        border:2px solid #9c7b3b;
        background:rgba(15,18,24,.9);
        color:white;
        font-size:22px;
        z-index:4000;
    `;

    button.onclick =
        () => {

            saveGame();

            showCharacterSelection();
        };

    document.body.appendChild(
        button
    );
}

/* =========================================================
   AUTO GUARDADO
   ========================================================= */

setInterval(
    () => {

        if (gameStarted) {

            saveGame();
        }

    },
    5000
);

/* =========================================================
   LOOP PRINCIPAL
   ========================================================= */

let lastTime =
    performance.now();

function gameLoop(now) {

    try {

        const dt =
            Math.min(
                0.05,
                (
                    now -
                    lastTime
                ) / 1000
            );

        lastTime = now;

        if (gameStarted) {

            update(dt);
            draw();
        } else {

            /*
               Incluso antes de entrar
               dejamos un fondo visible.
            */

            ctx.fillStyle =
                "#101820";

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
        }

    } catch (error) {

        /*
           Protección del loop.
           Un error aislado no mata
           completamente el render.
        */

        console.error(
            "Error Game Loop:",
            error
        );
    }

    requestAnimationFrame(
        gameLoop
    );
}

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

window.addEventListener(
    "load",
    () => {

        try {

            createCharacterMenuButton();

            firstLaunch();

        } catch (error) {

            console.error(
                "Error inicializando juego:",
                error
            );

            /*
               Si existe un save corrupto,
               permitimos entrar al creador.
            */

            showCharacterCreation();
        }
    }
);

requestAnimationFrame(
    gameLoop
);

/* =========================================================
   FIN
   ========================================================= */
/* =========================================================
   ⚔️ REINOS DE CENIZA
   ACTUALIZACIÓN 1.1
   CLASES + ARMAS + HERRAMIENTAS EQUIPABLES
   ========================================================= */

(function () {

    if (window.__RC_UPDATE_11__) return;
    window.__RC_UPDATE_11__ = true;

    console.log("⚔️ Reinos de Ceniza - Actualización 1.1");

    /* =====================================================
       🏹 ARMAS PRINCIPALES POR CLASE
       ===================================================== */

    itemDefinitions.apprenticeBow = {
        id: "apprenticeBow",
        name: "Arco de Aprendiz",
        type: "weapon",
        slot: "weapon",
        level: 1,
        rarity: "common",
        damage: 9,
        defense: 0,
        icon: "🏹",
        ranged: true,
        projectile: "arrow",
        range: 430,
        projectileSpeed: 720,
        description:
            "Un arco sencillo utilizado por jóvenes cazadores."
    };

    itemDefinitions.apprenticeStaff = {
        id: "apprenticeStaff",
        name: "Bastón de Aprendiz",
        type: "weapon",
        slot: "weapon",
        level: 1,
        rarity: "common",
        damage: 11,
        defense: 0,
        icon: "🔮",
        ranged: true,
        projectile: "fireball",
        range: 380,
        projectileSpeed: 520,
        description:
            "Un bastón básico capaz de canalizar energía mágica."
    };

    itemDefinitions.apprenticeDagger = {
        id: "apprenticeDagger",
        name: "Daga de Aprendiz",
        type: "weapon",
        slot: "weapon",
        level: 1,
        rarity: "common",
        damage: 12,
        defense: 0,
        icon: "🗡️",
        ranged: false,
        description:
            "Una daga ligera perfecta para ataques rápidos."
    };

    /* =====================================================
       🛠️ HERRAMIENTAS COMO OBJETOS REALES
       ===================================================== */

    itemDefinitions.axeTool = {
        id: "axeTool",
        name: "Hacha",
        type: "tool",
        slot: "tool",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 0,
        icon: "🪓",
        toolType: "axe",
        description:
            "Herramienta necesaria para talar árboles."
    };

    itemDefinitions.pickaxeTool = {
        id: "pickaxeTool",
        name: "Pico",
        type: "tool",
        slot: "tool",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 0,
        icon: "⛏️",
        toolType: "pickaxe",
        description:
            "Herramienta necesaria para extraer piedra, cobre y hierro."
    };

    itemDefinitions.fishingRodTool = {
        id: "fishingRodTool",
        name: "Caña de Pescar",
        type: "tool",
        slot: "tool",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 0,
        icon: "🎣",
        toolType: "fishingRod",
        description:
            "Herramienta necesaria para pescar en el agua."
    };

    /* =====================================================
       ⚔️ CAMBIAR ARMAS DE LAS CLASES
       ===================================================== */

    classes.warrior.weapon = "ironSword";

    classes.hunter.weapon = "apprenticeBow";
    classes.hunter.attackRange = 430;

    classes.mage.weapon = "apprenticeStaff";
    classes.mage.attackRange = 380;

    classes.assassin.weapon = "apprenticeDagger";
    classes.assassin.attackRange = 115;

    classes.explorer.weapon = "ironSword";
    classes.explorer.attackRange = 115;

    /* =====================================================
       🔧 HERRAMIENTA ACTIVA
       ===================================================== */

    if (!equipment) {
        equipment = {};
    }

    if (!Object.prototype.hasOwnProperty.call(equipment, "tool")) {
        equipment.tool = null;
    }

    function syncToolState() {

        tools.axe.equipped = false;
        tools.pickaxe.equipped = false;
        tools.fishingRod.equipped = false;

        const activeTool = equipment.tool;

        if (!activeTool) return;

        if (activeTool.toolType === "axe") {
            tools.axe.equipped = true;
        }

        if (activeTool.toolType === "pickaxe") {
            tools.pickaxe.equipped = true;
        }

        if (activeTool.toolType === "fishingRod") {
            tools.fishingRod.equipped = true;
        }
    }

    /* =====================================================
       📊 ESTADÍSTICAS
       ===================================================== */

    const oldRecalculatePlayerStats =
        recalculatePlayerStats;

    recalculatePlayerStats = function () {

        oldRecalculatePlayerStats();

        const cls =
            classes[player.classId] ||
            classes.warrior;

        if (cls.attackRange) {
            player.attackRange =
                cls.attackRange;
        }

        const weapon =
            equipment.weapon;

        if (weapon && weapon.range) {
            player.attackRange =
                weapon.range;
        }

        syncToolState();
    };

    /* =====================================================
       🧰 CREAR OBJETO DE HERRAMIENTA
       ===================================================== */

    function makeTool(itemId) {

        const def =
            itemDefinitions[itemId];

        if (!def) return null;

        return {
            uid:
                "tool_" +
                itemId +
                "_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .slice(2),

            itemId,

            ...def
        };
    }

    /* =====================================================
       🎒 COMPROBAR SI YA EXISTE UNA HERRAMIENTA
       ===================================================== */

    function hasTool(toolType) {

        if (
            equipment.tool &&
            equipment.tool.toolType === toolType
        ) {
            return true;
        }

        return itemInventory.some(
            item =>
                item.type === "tool" &&
                item.toolType === toolType
        );
    }

    /* =====================================================
       🧰 ASEGURAR HERRAMIENTAS
       ===================================================== */

    function ensureStartingTools() {

        const starterTools = [
            ["axe", "axeTool"],
            ["pickaxe", "pickaxeTool"],
            ["fishingRod", "fishingRodTool"]
        ];

        starterTools.forEach(
            ([toolType, itemId]) => {

                if (hasTool(toolType)) {
                    return;
                }

                if (!inventoryHasSpace(1)) {
                    return;
                }

                const item =
                    makeTool(itemId);

                if (item) {
                    itemInventory.push(item);
                }
            }
        );

        syncToolState();
    }

    /* =====================================================
       ⚔️ EQUIPAR
       ===================================================== */

    const oldEquipItem =
        equipItem;

    equipItem = function (uid) {

        const item =
            itemInventory.find(
                x => x.uid === uid
            );

        if (!item) return;

        /* ---------------------------------------------
           HERRAMIENTA
           --------------------------------------------- */

        if (item.type === "tool") {

            if (
                player.level <
                item.level
            ) {

                showMessage(
                    "🔒 Necesitas nivel " +
                    item.level +
                    "."
                );

                return;
            }

            const oldTool =
                equipment.tool;

            const index =
                itemInventory.findIndex(
                    x => x.uid === uid
                );

            if (index === -1) {
                return;
            }

            /*
             * Quitamos primero la herramienta
             * seleccionada del inventario.
             */
            itemInventory.splice(
                index,
                1
            );

            /*
             * La herramienta anterior
             * vuelve al inventario.
             */
            if (oldTool) {

                itemInventory.push({
                    ...oldTool,

                    uid:
                        "item_" +
                        Date.now() +
                        "_" +
                        Math.random()
                            .toString(36)
                            .slice(2)
                });
            }

            equipment.tool = {
                ...item
            };

            syncToolState();

            recalculatePlayerStats();

            showMessage(
                "🛠️ Equipaste " +
                item.name
            );

            saveGame();

            closeItemDetails();
            renderInventoryPanel();
            updateUI();

            return;
        }

        /*
         * Armas y armaduras continúan utilizando
         * el sistema original.
         */

        oldEquipItem(uid);
    };

    /* =====================================================
       🔓 DESEQUIPAR HERRAMIENTA
       ===================================================== */

    const oldUnequipItem =
        unequipItem;

    unequipItem = function (slot) {

        if (slot !== "tool") {
            oldUnequipItem(slot);
            return;
        }

        const item =
            equipment.tool;

        if (!item) return;

        if (!inventoryHasSpace()) {

            showMessage(
                "🎒 Inventario lleno."
            );

            return;
        }

        itemInventory.push({
            ...item,

            uid:
                "item_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .slice(2)
        });

        equipment.tool = null;

        syncToolState();

        recalculatePlayerStats();

        saveGame();

        renderInventoryPanel();
        updateUI();

        showMessage(
            "Desequipaste " +
            item.name
        );
    };

    /* =====================================================
       🎒 INVENTARIO
       ===================================================== */

    const oldRenderInventoryPanel =
        renderInventoryPanel;

    renderInventoryPanel = function () {

        oldRenderInventoryPanel();

        const panel =
            document.getElementById(
                "inventoryPanel"
            );

        if (!panel) return;

        const oldBadge =
            document.getElementById(
                "activeToolBadge"
            );

        if (oldBadge) {
            oldBadge.remove();
        }

        const badge =
            document.createElement(
                "div"
            );

        badge.id =
            "activeToolBadge";

        const active =
            equipment.tool;

        badge.style.cssText = `
            margin:8px 0;
            padding:10px;
            border-radius:10px;
            background:#171d25;
            border:1px solid #80652e;
            text-align:center;
            color:white;
            font-size:14px;
        `;

        badge.innerHTML = active
            ? "🛠️ Herramienta equipada: <b>" +
              active.icon +
              " " +
              active.name +
              "</b>"
            : "🛠️ Herramienta equipada: <b>Ninguna</b>";

        const title =
            panel.querySelector("h2");

        if (title) {
            title.insertAdjacentElement(
                "afterend",
                badge
            );
        } else {
            panel.prepend(badge);
        }
    };

    /* =====================================================
       🌲 RECOLECCIÓN
       ===================================================== */

    function getRequiredToolForResource(type) {

        if (type === "tree") {
            return "axe";
        }

        if (type === "rock") {
            return "pickaxe";
        }

        if (type === "copper") {
            return "pickaxe";
        }

        if (type === "iron") {
            return "pickaxe";
        }

        return null;
    }

    function getActiveToolType() {

        if (
            !equipment.tool
        ) {
            return null;
        }

        return equipment.tool.toolType ||
            null;
    }

    function playerHasRequiredTool(type) {

        const required =
            getRequiredToolForResource(
                type
            );

        if (!required) {
            return true;
        }

        return (
            getActiveToolType() ===
            required
        );
    }

    /* =====================================================
       🎣 PESCA
       ===================================================== */

    function isNearWater() {

        const checks = [
            [0, 0],
            [45, 0],
            [-45, 0],
            [0, 45],
            [0, -45],
            [80, 0],
            [-80, 0],
            [0, 80],
            [0, -80]
        ];

        return checks.some(
            ([ox, oy]) =>
                terrainAt(
                    player.x + ox,
                    player.y + oy
                ) === TERRAIN.WATER
        );
    }

    function tryFishing() {

        if (
            getActiveToolType() !==
            "fishingRod"
        ) {
            return false;
        }

        if (!isNearWater()) {
            return false;
        }

        inventory.fish++;

        /*
         * Algunas veces obtenemos cebo.
         */
        if (
            Math.random() < 0.25
        ) {
            inventory.bait++;
        }

        updateQuest(
            "gather",
            "fish"
        );

        showMessage(
            "🎣 ¡Has pescado un pez!"
        );

        saveGame();

        return true;
    }

    /* =====================================================
       ⛏️ RECOLECTAR
       ===================================================== */

    collectNearestResource =
        function () {

            /*
             * Primero intentamos pescar.
             */
            if (tryFishing()) {
                return;
            }

            let nearest = null;

            let best = 80;

            resources.forEach(
                resource => {

                    if (
                        resource.collected
                    ) {
                        return;
                    }

                    const d =
                        distance(
                            player,
                            resource
                        );

                    if (
                        d < best
                    ) {

                        best = d;
                        nearest =
                            resource;
                    }
                }
            );

            if (!nearest) {

                showMessage(
                    "No hay recursos cerca."
                );

                return;
            }

            const required =
                getRequiredToolForResource(
                    nearest.type
                );

            if (
                required &&
                getActiveToolType() !==
                required
            ) {

                const names = {
                    axe:
                        "🪓 un hacha",
                    pickaxe:
                        "⛏️ un pico",
                    fishingRod:
                        "🎣 una caña de pescar"
                };

                showMessage(
                    "❌ Necesitas equipar " +
                    names[required] +
                    "."
                );

                return;
            }

            nearest.collected =
                true;

            nearest.respawn =
                20;

            switch (
                nearest.type
            ) {

                case "tree":

                    inventory.wood++;
                    showMessage(
                        "🪓 Madera obtenida."
                    );

                    break;

                case "rock":

                    inventory.stone++;
                    showMessage(
                        "⛏️ Piedra obtenida."
                    );

                    break;

                case "copper":

                    inventory.copper++;
                    showMessage(
                        "⛏️ Cobre obtenido."
                    );

                    break;

                case "iron":

                    inventory.iron++;
                    showMessage(
                        "⛏️ Hierro obtenido."
                    );

                    break;
            }

            updateQuest(
                "gather",
                nearest.type
            );

            saveGame();
        };

    /* =====================================================
       🏹 PROYECTILES
       ===================================================== */

    let rangedProjectiles = [];

    function createProjectile(
        target,
        damage,
        kind
    ) {

        if (!target) return;

        rangedProjectiles.push({

            x: player.x,

            y: player.y,

            target,

            damage,

            kind,

            speed:
                kind === "arrow"
                    ? 720
                    : 520,

            life: 3
        });
    }

    function updateProjectiles(dt) {

        rangedProjectiles =
            rangedProjectiles.filter(
                projectile => {

                    if (
                        !projectile.target ||
                        projectile.target.dead
                    ) {
                        return false;
                    }

                    const target =
                        projectile.target;

                    const dx =
                        target.x -
                        projectile.x;

                    const dy =
                        target.y -
                        projectile.y;

                    const dist =
                        Math.hypot(
                            dx,
                            dy
                        );

                    if (
                        dist < 18
                    ) {

                        damageEnemy(
                            target,
                            projectile.damage
                        );

                        return false;
                    }

                    const step =
                        Math.min(
                            dist,
                            projectile.speed *
                            dt
                        );

                    projectile.x +=
                        dx /
                        dist *
                        step;

                    projectile.y +=
                        dy /
                        dist *
                        step;

                    projectile.life -=
                        dt;

                    return (
                        projectile.life >
                        0
                    );
                }
            );
    }

    function drawProjectiles() {

        rangedProjectiles.forEach(
            projectile => {

                const sx =
                    projectile.x -
                    camera.x;

                const sy =
                    projectile.y -
                    camera.y;

                ctx.save();

                ctx.textAlign =
                    "center";

                ctx.textBaseline =
                    "middle";

                ctx.font =
                    "22px Arial";

                if (
                    projectile.kind ===
                    "arrow"
                ) {

                    ctx.fillText(
                        "➶",
                        sx,
                        sy
                    );

                } else {

                    ctx.fillText(
                        "🔥",
                        sx,
                        sy
                    );
                }

                ctx.restore();
            }
        );
    }

    /* =====================================================
       ⚔️ ATAQUE NUEVO
       ===================================================== */

    attack =
        function () {

            if (player.dead) {
                return;
            }

            if (
                player.attackCooldown >
                0
            ) {
                return;
            }

            player.attackCooldown =
                player.attackDelay;

            player.attackAnimation =
                0.18;

            const weapon =
                equipment.weapon;

            const isRanged =
                weapon &&
                weapon.ranged;

            const range =
                isRanged
                    ? (
                        weapon.range ||
                        player.attackRange
                    )
                    : player.attackRange;

            const target =
                getNearestEnemy(
                    range
                );

            if (!target) {

                showMessage(
                    isRanged
                        ? "🏹 No hay enemigo a distancia."
                        : "⚔️ No hay enemigo en alcance."
                );

                return;
            }

            let damage =
                player.damage;

            if (
                Math.random() <
                player.criticalChance
            ) {

                damage =
                    Math.round(
                        damage *
                        player.criticalDamage
                    );

                showMessage(
                    "💥 ¡GOLPE CRÍTICO!"
                );
            }

            if (
                player.rageTimer >
                0
            ) {

                damage =
                    Math.round(
                        damage *
                        1.5
                    );
            }

            if (isRanged) {

                createProjectile(
                    target,
                    damage,
                    weapon.projectile ||
                    "arrow"
                );

                if (
                    weapon.projectile ===
                    "fireball"
                ) {

                    showMessage(
                        "🔥 ¡Bola de fuego!"
                    );

                } else {

                    showMessage(
                        "🏹 ¡Disparo!"
                    );
                }

            } else {

                damageEnemy(
                    target,
                    damage
                );
            }
        };

    /* =====================================================
       🎨 DIBUJAR PROYECTILES
       ===================================================== */

    const oldDraw =
        draw;

    draw = function () {

        oldDraw();

        drawProjectiles();
    };

    /* =====================================================
       🔄 ACTUALIZAR PROYECTILES
       ===================================================== */

    const oldUpdate =
        update;

    update = function (dt) {

        oldUpdate(dt);

        updateProjectiles(dt);
    };

    /* =====================================================
       🛠️ QUITAR BOTÓN DE PICO
       ===================================================== */

    const oldCreateMobileButtons =
        createMobileButtons;

    createMobileButtons =
        function () {

            oldCreateMobileButtons();

            const gatherButton =
                document.getElementById(
                    "gatherButton"
                );

            if (gatherButton) {
                gatherButton.remove();
            }
        };

    /* =====================================================
       🎒 INICIO DE PERSONAJE
       ===================================================== */

    const oldCreateStartingInventory =
        createStartingInventory;

    createStartingInventory =
        function () {

            oldCreateStartingInventory();

            equipment.tool =
                null;

            /*
             * Las herramientas empiezan
             * dentro del inventario.
             */
            ensureStartingTools();

            syncToolState();

            recalculatePlayerStats();
        };

    /* =====================================================
       👤 ARMAMENTO AUTOMÁTICO POR CLASE
       ===================================================== */

    function applyClassWeapon() {

        const cls =
            classes[player.classId] ||
            classes.warrior;

        const desiredId =
            cls.weapon ||
            "ironSword";

        const current =
            equipment.weapon;

        if (
            current &&
            current.itemId ===
            desiredId
        ) {
            return;
        }

        /*
         * Buscamos el arma de clase
         * dentro del inventario.
         */
        const inventoryIndex =
            itemInventory.findIndex(
                item =>
                    item.itemId ===
                    desiredId
            );

        if (
            inventoryIndex !==
            -1
        ) {

            const newWeapon =
                itemInventory.splice(
                    inventoryIndex,
                    1
                )[0];

            if (current) {

                if (
                    inventoryHasSpace(
                        1
                    )
                ) {

                    itemInventory.push({
                        ...current,

                        uid:
                            "item_" +
                            Date.now() +
                            "_" +
                            Math.random()
                                .toString(36)
                                .slice(2)
                    });

                } else {

                    showMessage(
                        "🎒 No hay espacio para guardar tu arma anterior."
                    );

                    return;
                }
            }

            equipment.weapon =
                newWeapon;

            return;
        }

        /*
         * Si es un personaje nuevo
         * creamos directamente el arma.
         */
        const newWeapon =
            cloneItem(
                desiredId
            );

        if (!newWeapon) {
            return;
        }

        if (current) {

            if (
                inventoryHasSpace(
                    1
                )
            ) {

                itemInventory.push({
                    ...current,

                    uid:
                        "item_" +
                        Date.now() +
                        "_" +
                        Math.random()
                            .toString(36)
                            .slice(2)
                });

            } else {

                showMessage(
                    "🎒 No hay espacio para guardar el arma anterior."
                );

                return;
            }
        }

        equipment.weapon =
            newWeapon;
    }

    /* =====================================================
       🔄 INICIAR PARTIDA
       ===================================================== */

    const oldStartGame =
        startGame;

    startGame =
        function () {

            /*
             * Primero garantizamos
             * arma correcta y herramientas.
             */
            applyClassWeapon();

            if (
                !equipment.tool
            ) {
                ensureStartingTools();
            }

            syncToolState();

            recalculatePlayerStats();

            oldStartGame();

            /*
             * Eliminamos cualquier botón
             * antiguo que haya sido creado.
             */
            const gatherButton =
                document.getElementById(
                    "gatherButton"
                );

            if (gatherButton) {
                gatherButton.remove();
            }
        };

    /* =====================================================
       🧙 CREAR PERSONAJE
       ===================================================== */

    createNewCharacter =
        function (
            name,
            classId,
            color
        ) {

            const characters =
                getCharacters();

            if (
                characters.length >=
                5
            ) {

                alert(
                    "Ya tienes 5 personajes."
                );

                return;
            }

            const cls =
                classes[classId] ||
                classes.warrior;

            const character = {

                id:
                    "char_" +
                    Date.now(),

                name,

                classId,

                color,

                created:
                    Date.now(),

                level: 1,

                xp: 0,

                gold: 150,

                position: {
                    x: CITY_X,
                    y: CITY_Y
                }
            };

            characters.push(
                character
            );

            saveCharacters(
                characters
            );

            /*
             * NUEVO PERSONAJE:
             * reiniciamos su inventario
             * y equipo correctamente.
             */
            currentCharacterId =
                character.id;

            player.name =
                name;

            player.classId =
                classId;

            player.color =
                color;

            player.level = 1;
            player.xp = 0;

            player.x =
                CITY_X;

            player.y =
                CITY_Y;

            createStartingInventory();

            recalculatePlayerStats();

            removeCharacterScreens();

            startGame();

            saveGame();

            showMessage(
                cls.icon +
                " " +
                cls.name +
                " creado. " +
                itemDefinitions[
                    cls.weapon
                ].name +
                " equipado."
            );
        };

    /* =====================================================
       💾 NORMALIZAR PARTIDAS ANTIGUAS
       ===================================================== */

    const oldLoadSave =
        loadSave;

    loadSave =
        function () {

            const loaded =
                oldLoadSave();

            if (!loaded) {
                return false;
            }

            if (
                !equipment
            ) {
                equipment = {};
            }

            if (
                !Object.prototype.hasOwnProperty.call(
                    equipment,
                    "tool"
                )
            ) {

                equipment.tool =
                    null;
            }

            /*
             * Las partidas antiguas
             * tenían todas las herramientas
             * como equipadas.
             *
             * Ahora solo se considera
             * equipada la herramienta
             * que esté en equipment.tool.
             */
            tools.axe.equipped =
                false;

            tools.pickaxe.equipped =
                false;

            tools.fishingRod.equipped =
                false;

            syncToolState();

            /*
             * Actualizamos el arma según
             * la clase del personaje.
             */
            applyClassWeapon();

            ensureStartingTools();

            recalculatePlayerStats();

            return true;
        };

    /* =====================================================
       🎣 BOTÓN DE RECOLECCIÓN ANTIGUO
       ===================================================== */

    const oldGather =
        document.getElementById(
            "gatherButton"
        );

    if (oldGather) {
        oldGather.remove();
    }

    /* =====================================================
       🔄 INICIALIZAR
       ===================================================== */

    syncToolState();

    recalculatePlayerStats();

    console.log(
        "✅ Actualización 1.1 cargada."
    );

})();

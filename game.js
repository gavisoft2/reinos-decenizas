/* =========================================================
   ⚔️ REINOS DE CENIZA
   GAME.JS - INVENTARIO + LOOT + EQUIPAMIENTO
   VERSION 300
   ========================================================= */

"use strict";

/* =========================================================
   CANVAS
   ========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const miniCanvas = document.getElementById("miniCanvas");
const miniCtx = miniCanvas ? miniCanvas.getContext("2d") : null;

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

function resizeCanvas() {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;

    canvas.width = screenWidth;
    canvas.height = screenHeight;

    if (miniCanvas) {
        miniCanvas.width = 150;
        miniCanvas.height = 150;
    }
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* =========================================================
   MUNDO
   ========================================================= */

const WORLD_WIDTH = 5000;
const WORLD_HEIGHT = 5000;
const TILE = 64;

const respawnPoint = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2
};

const CITY_RADIUS = 520;

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

    baseDamage: 25,
    baseDefense: 5,

    damage: 25,
    defense: 5,

    attackRange: 105,
    attackCooldown: 0,
    attackDelay: 0.55,

    directionX: 0,
    directionY: 1,

    dead: false,
    respawnTimer: 0,

    attackAnimation: 0,
    skillAnimation: 0,

    rageTimer: 0
};

/* =========================================================
   MONEDAS / INVENTARIO
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

/*
    Inventario RPG real.

    30 espacios iniciales.
    Cada objeto se guarda como una entrada.
*/

let inventorySlots = 30;
const INVENTORY_EXPANSION_COST = 500;
const INVENTORY_EXPANSION_AMOUNT = 5;

let itemInventory = [];

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
   SISTEMA DE EQUIPAMIENTO
   ========================================================= */

const equipment = {
    weapon: {
        id: "iron_sword",
        name: "Espada de Hierro",
        type: "weapon",
        level: 1,
        rarity: "common",
        damage: 8,
        defense: 0,
        icon: "⚔️",
        description: "Una espada sencilla de hierro utilizada por los soldados de la ciudad."
    },

    helmet: {
        id: "iron_helmet",
        name: "Casco de Hierro",
        type: "helmet",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 3,
        icon: "🪖",
        description: "Un casco básico que protege la cabeza del guerrero."
    },

    armor: {
        id: "iron_armor",
        name: "Armadura de Hierro",
        type: "armor",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 5,
        icon: "🛡️",
        description: "Una armadura sencilla fabricada por el herrero de la ciudad."
    },

    boots: {
        id: "leather_boots",
        name: "Botas de Cuero",
        type: "boots",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 2,
        icon: "🥾",
        description: "Botas resistentes de cuero."
    },

    shield: {
        id: "wood_shield",
        name: "Escudo de Madera",
        type: "shield",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 2,
        icon: "🛡️",
        description: "Un escudo sencillo construido con madera."
    }
};

/* =========================================================
   DEFINICIÓN DE OBJETOS
   ========================================================= */

const itemDefinitions = {

    /* ---------------- ARMAS ---------------- */

    iron_sword: {
        id: "iron_sword",
        name: "Espada de Hierro",
        type: "weapon",
        level: 1,
        rarity: "common",
        damage: 8,
        defense: 0,
        icon: "⚔️",
        description: "Una espada sencilla de hierro utilizada por los soldados."
    },

    apprentice_sword: {
        id: "apprentice_sword",
        name: "Espada de Aprendiz",
        type: "weapon",
        level: 1,
        rarity: "common",
        damage: 5,
        defense: 0,
        icon: "🗡️",
        description: "Una espada ligera para guerreros que comienzan su aventura."
    },

    steel_sword: {
        id: "steel_sword",
        name: "Espada de Acero",
        type: "weapon",
        level: 2,
        rarity: "uncommon",
        damage: 14,
        defense: 0,
        icon: "⚔️",
        description: "Una espada de acero más resistente y afilada."
    },

    /* ---------------- CASCOS ---------------- */

    leather_helmet: {
        id: "leather_helmet",
        name: "Casco de Cuero",
        type: "helmet",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 2,
        icon: "🪖",
        description: "Un casco ligero fabricado con cuero."
    },

    iron_helmet: {
        id: "iron_helmet",
        name: "Casco de Hierro",
        type: "helmet",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 3,
        icon: "🪖",
        description: "Un casco básico de hierro."
    },

    goblin_helmet: {
        id: "goblin_helmet",
        name: "Casco de Goblin",
        type: "helmet",
        level: 2,
        rarity: "uncommon",
        damage: 0,
        defense: 5,
        icon: "⛑️",
        description: "Un casco recuperado de un guerrero goblin."
    },

    /* ---------------- ARMADURAS ---------------- */

    leather_armor: {
        id: "leather_armor",
        name: "Armadura de Cuero",
        type: "armor",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 4,
        icon: "🥋",
        description: "Protección ligera fabricada con cuero."
    },

    iron_armor: {
        id: "iron_armor",
        name: "Armadura de Hierro",
        type: "armor",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 5,
        icon: "🛡️",
        description: "Armadura de hierro fabricada por el herrero."
    },

    /* ---------------- BOTAS ---------------- */

    leather_boots: {
        id: "leather_boots",
        name: "Botas de Cuero",
        type: "boots",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 2,
        icon: "🥾",
        description: "Botas resistentes de cuero."
    },

    goblin_boots: {
        id: "goblin_boots",
        name: "Botas de Goblin",
        type: "boots",
        level: 2,
        rarity: "uncommon",
        damage: 0,
        defense: 4,
        icon: "🥾",
        description: "Botas ligeras utilizadas por exploradores goblin."
    },

    /* ---------------- ESCUDOS ---------------- */

    wood_shield: {
        id: "wood_shield",
        name: "Escudo de Madera",
        type: "shield",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 2,
        icon: "🛡️",
        description: "Un escudo sencillo construido con madera."
    },

    iron_shield: {
        id: "iron_shield",
        name: "Escudo de Hierro",
        type: "shield",
        level: 2,
        rarity: "uncommon",
        damage: 0,
        defense: 7,
        icon: "🛡️",
        description: "Un resistente escudo de hierro."
    }
};

/* =========================================================
   RAREZAS
   ========================================================= */

const rarityInfo = {
    common: {
        name: "Común",
        multiplier: 1
    },

    uncommon: {
        name: "Poco común",
        multiplier: 1.15
    },

    rare: {
        name: "Raro",
        multiplier: 1.3
    },

    epic: {
        name: "Épico",
        multiplier: 1.5
    },

    legendary: {
        name: "Legendario",
        multiplier: 2
    }
};

/* =========================================================
   AGREGAR OBJETOS
   ========================================================= */

function inventoryUsedSlots() {
    return itemInventory.length;
}

function inventoryHasSpace() {
    return inventoryUsedSlots() < inventorySlots;
}

function addItem(itemId, amount = 1) {

    const definition = itemDefinitions[itemId];

    if (!definition) {
        console.warn("Objeto desconocido:", itemId);
        return false;
    }

    /*
        Los equipamientos no se apilan.
    */

    for (let i = 0; i < amount; i++) {

        if (!inventoryHasSpace()) {
            showMessage("🎒 ¡Inventario lleno!");
            addFloatingText(
                player.x,
                player.y - 45,
                "Inventario lleno",
                "#ff5555"
            );
            return false;
        }

        const item = JSON.parse(JSON.stringify(definition));

        item.uid =
            Date.now().toString(36) +
            Math.random().toString(36).substring(2);

        itemInventory.push(item);

        showMessage(
            `${item.icon} Has obtenido ${item.name}`
        );

        addFloatingText(
            player.x,
            player.y - 45,
            `+ ${item.name}`,
            "#ffe082"
        );
    }

    saveGame();

    return true;
}

/* =========================================================
   ELIMINAR OBJETO
   ========================================================= */

function removeItemByUid(uid) {

    const index = itemInventory.findIndex(
        item => item.uid === uid
    );

    if (index === -1) return false;

    itemInventory.splice(index, 1);

    saveGame();

    return true;
}

/* =========================================================
   EQUIPAR
   ========================================================= */

function getEquipmentSlot(type) {

    switch (type) {

        case "weapon":
            return "weapon";

        case "helmet":
            return "helmet";

        case "armor":
            return "armor";

        case "boots":
            return "boots";

        case "shield":
            return "shield";

        default:
            return null;
    }
}

function recalculatePlayerStats() {

    player.damage = player.baseDamage;
    player.defense = player.baseDefense;

    Object.values(equipment).forEach(item => {

        if (!item) return;

        player.damage += item.damage || 0;
        player.defense += item.defense || 0;
    });

    if (player.rageTimer > 0) {
        player.damage =
            Math.floor(player.damage * 1.7);
    }
}

function equipItem(uid) {

    const item = itemInventory.find(
        x => x.uid === uid
    );

    if (!item) return;

    const slot = getEquipmentSlot(item.type);

    if (!slot) {
        showMessage("Este objeto no se puede equipar.");
        return;
    }

    /*
        Si ya existe un objeto en ese espacio,
        lo devolvemos al inventario.
    */

    if (equipment[slot]) {

        const oldItem =
            JSON.parse(JSON.stringify(equipment[slot]));

        oldItem.uid =
            Date.now().toString(36) +
            Math.random().toString(36).substring(2);

        if (inventoryHasSpace()) {
            itemInventory.push(oldItem);
        }
    }

    equipment[slot] =
        JSON.parse(JSON.stringify(item));

    removeItemByUid(uid);

    recalculatePlayerStats();

    showMessage(
        `${item.icon} ${item.name} equipado`
    );

    addFloatingText(
        player.x,
        player.y - 45,
        `${item.name} equipado`,
        "#6cff7a"
    );

    saveGame();

    closeItemDetails();

    updateUI();
}

/* =========================================================
   DESEQUIPAR
   ========================================================= */

function unequipItem(slot) {

    if (!equipment[slot]) return;

    if (!inventoryHasSpace()) {
        showMessage("🎒 No tienes espacio.");
        return;
    }

    const item =
        JSON.parse(JSON.stringify(equipment[slot]));

    item.uid =
        Date.now().toString(36) +
        Math.random().toString(36).substring(2);

    itemInventory.push(item);

    equipment[slot] = null;

    recalculatePlayerStats();

    showMessage(
        `${item.icon} ${item.name} desequipado`
    );

    saveGame();

    closeItemDetails();

    updateUI();
}

/* =========================================================
   INVENTARIO - DETALLES
   ========================================================= */

let selectedInventoryItem = null;

function openItemDetails(uid) {

    const item = itemInventory.find(
        x => x.uid === uid
    );

    if (!item) return;

    selectedInventoryItem = uid;

    let panel =
        document.getElementById("itemDetailsPanel");

    if (!panel) {

        panel = document.createElement("div");

        panel.id = "itemDetailsPanel";

        panel.style.position = "fixed";
        panel.style.left = "50%";
        panel.style.top = "50%";
        panel.style.transform =
            "translate(-50%,-50%)";

        panel.style.width = "min(92vw,380px)";
        panel.style.background =
            "linear-gradient(180deg,#171a24,#0b0d13)";

        panel.style.border =
            "2px solid rgba(255,215,100,.55)";

        panel.style.borderRadius = "18px";

        panel.style.padding = "20px";

        panel.style.zIndex = "9999";

        panel.style.color = "#fff";

        panel.style.boxShadow =
            "0 20px 60px rgba(0,0,0,.75)";

        document.body.appendChild(panel);
    }

    const rarity =
        rarityInfo[item.rarity] ||
        rarityInfo.common;

    panel.innerHTML = `
        <div style="text-align:center">

            <div style="font-size:55px">
                ${item.icon}
            </div>

            <h2 style="margin:5px 0">
                ${item.name}
            </h2>

            <div style="
                color:#ffd86b;
                font-weight:bold;
                margin-bottom:12px;
            ">
                ${rarity.name}
            </div>

            <div style="
                text-align:left;
                background:rgba(255,255,255,.06);
                border-radius:12px;
                padding:12px;
                margin-bottom:14px;
            ">

                <div>📜 Tipo: ${getItemTypeName(item.type)}</div>

                <div>⭐ Nivel: ${item.level}</div>

                ${
                    item.damage > 0
                    ? `<div>⚔️ Ataque: +${item.damage}</div>`
                    : ""
                }

                ${
                    item.defense > 0
                    ? `<div>🛡️ Defensa: +${item.defense}</div>`
                    : ""
                }

                <div style="
                    margin-top:10px;
                    color:#c9c9c9;
                    font-size:14px;
                ">
                    ${item.description}
                </div>

            </div>

            <button
                id="itemEquipButton"
                style="
                    width:100%;
                    padding:13px;
                    border:0;
                    border-radius:10px;
                    background:#bd8b27;
                    color:white;
                    font-size:16px;
                    font-weight:bold;
                    margin-bottom:8px;
                "
            >
                ${isItemEquipped(item)
                    ? "❌ DESEQUIPAR"
                    : "⚔️ EQUIPAR"}
            </button>

            <button
                id="itemCloseButton"
                style="
                    width:100%;
                    padding:12px;
                    border:0;
                    border-radius:10px;
                    background:#333947;
                    color:white;
                    font-size:15px;
                "
            >
                CERRAR
            </button>

        </div>
    `;

    panel.style.display = "block";

    document
        .getElementById("itemEquipButton")
        .onclick = () => {

            if (isItemEquipped(item)) {

                const slot =
                    getEquipmentSlot(item.type);

                unequipItem(slot);

            } else {

                equipItem(item.uid);
            }

            renderInventoryPanel();
        };

    document
        .getElementById("itemCloseButton")
        .onclick = closeItemDetails;
}

function closeItemDetails() {

    const panel =
        document.getElementById("itemDetailsPanel");

    if (panel) {
        panel.style.display = "none";
    }

    selectedInventoryItem = null;
}

function isItemEquipped(item) {

    return Object.values(equipment).some(
        equipped =>
            equipped &&
            equipped.id === item.id &&
            equipped.uid === item.uid
    );
}

function getItemTypeName(type) {

    const names = {
        weapon: "Arma",
        helmet: "Casco",
        armor: "Armadura",
        boots: "Botas",
        shield: "Escudo"
    };

    return names[type] || "Objeto";
}

/* =========================================================
   INVENTARIO UI
   ========================================================= */

function renderInventoryPanel() {

    let panel =
        document.getElementById("inventoryPanel");

    if (!panel) return;

    let html = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:12px;
        ">

            <strong>🎒 INVENTARIO</strong>

            <span>
                ${inventoryUsedSlots()} / ${inventorySlots}
            </span>

        </div>

        <div style="
            display:grid;
            grid-template-columns:repeat(5,1fr);
            gap:7px;
        ">
    `;

    for (let i = 0; i < inventorySlots; i++) {

        const item = itemInventory[i];

        if (item) {

            const rarity =
                rarityInfo[item.rarity] ||
                rarityInfo.common;

            html += `

                <button
                    class="inventory-slot"
                    data-item-uid="${item.uid}"
                    style="
                        aspect-ratio:1;
                        position:relative;
                        border-radius:8px;
                        border:1px solid rgba(255,255,255,.2);
                        background:rgba(255,255,255,.08);
                        color:white;
                        font-size:26px;
                    "
                >

                    ${item.icon}

                    <span style="
                        position:absolute;
                        bottom:2px;
                        right:4px;
                        font-size:9px;
                    ">
                        ${item.level}
                    </span>

                </button>
            `;

        } else {

            html += `

                <div
                    class="inventory-slot-empty"
                    style="
                        aspect-ratio:1;
                        border-radius:8px;
                        border:1px dashed rgba(255,255,255,.12);
                        background:rgba(0,0,0,.15);
                    "
                ></div>

            `;
        }
    }

    html += `
        </div>

        <button
            id="expandInventoryButton"
            style="
                width:100%;
                margin-top:14px;
                padding:12px;
                border:0;
                border-radius:10px;
                background:#72531e;
                color:white;
                font-weight:bold;
            "
        >
            🎒 AMPLIAR INVENTARIO
            <br>
            <small>
                +${INVENTORY_EXPANSION_AMOUNT} espacios
                · ${INVENTORY_EXPANSION_COST} 💰
            </small>
        </button>
    `;

    panel.innerHTML = html;

    panel
        .querySelectorAll(".inventory-slot")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openItemDetails(
                        button.dataset.itemUid
                    );
                }
            );
        });

    const expand =
        document.getElementById(
            "expandInventoryButton"
        );

    if (expand) {
        expand.onclick =
            expandInventory;
    }
}

/* =========================================================
   AMPLIAR INVENTARIO
   ========================================================= */

function expandInventory() {

    if (inventory.gold < INVENTORY_EXPANSION_COST) {

        showMessage(
            `💰 Necesitas ${INVENTORY_EXPANSION_COST} monedas.`
        );

        return;
    }

    inventory.gold -=
        INVENTORY_EXPANSION_COST;

    inventorySlots +=
        INVENTORY_EXPANSION_AMOUNT;

    showMessage(
        `🎒 Inventario ampliado a ${inventorySlots} espacios`
    );

    addFloatingText(
        player.x,
        player.y - 45,
        `+${INVENTORY_EXPANSION_AMOUNT} ESPACIOS`,
        "#6cff7a"
    );

    saveGame();

    renderInventoryPanel();
    updateUI();
}

/* =========================================================
   SKILLS
   ========================================================= */

const skills = [
    {
        id: "power",
        name: "Golpe Poderoso",
        icon: "⚔️",
        level: 2,
        mana: 8,
        cooldown: 8,
        damage: 2,
        description: "Golpe que causa daño aumentado."
    },

    {
        id: "heal",
        name: "Curación",
        icon: "💚",
        level: 3,
        mana: 15,
        cooldown: 12,
        heal: 0.35,
        description: "Recupera parte de tu vida."
    },

    {
        id: "whirlwind",
        name: "Torbellino",
        icon: "🌀",
        level: 5,
        mana: 20,
        cooldown: 20,
        damage: 1.5,
        radius: 170,
        description: "Golpea a todos los enemigos cercanos."
    },

    {
        id: "rage",
        name: "Furia",
        icon: "🔥",
        level: 8,
        mana: 20,
        cooldown: 30,
        duration: 8,
        damage: 1.7,
        description: "Aumenta temporalmente el daño."
    },

    {
        id: "execution",
        name: "Ejecución",
        icon: "💀",
        level: 10,
        mana: 25,
        cooldown: 25,
        damage: 3,
        description: "Devastador contra enemigos heridos."
    },

    {
        id: "rain",
        name: "Lluvia de Espadas",
        icon: "⚔️",
        level: 15,
        mana: 35,
        cooldown: 35,
        damage: 2.5,
        radius: 240,
        description: "Una lluvia de ataques golpea la zona."
    },

    {
        id: "ash",
        name: "Ira de Ceniza",
        icon: "🔥",
        level: 20,
        mana: 50,
        cooldown: 60,
        damage: 4,
        radius: 300,
        description: "Tu ataque definitivo."
    }
];

const skillCooldowns = {};

skills.forEach(skill => {
    skillCooldowns[skill.id] = 0;
});

/* =========================================================
   ENEMIGOS
   ========================================================= */

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
    },

    orc: {
        name: "Orco",
        hp: 220,
        damage: 28,
        speed: 55,
        radius: 30,
        xp: 110,
        gold: 30
    }
};

const enemies = [];

/* =========================================================
   LOOT DE ENEMIGOS
   ========================================================= */

const enemyLoot = {

    wolf: [
        {
            type: "currency",
            chance: 0.80,
            amount: 5
        },

        {
            type: "counter",
            key: "wolfFang",
            chance: 0.55,
            amount: 1
        },

        {
            type: "counter",
            key: "leather",
            chance: 0.35,
            amount: 1
        },

        {
            type: "item",
            itemId: "leather_helmet",
            chance: 0.08
        },

        {
            type: "item",
            itemId: "leather_boots",
            chance: 0.07
        },

        {
            type: "item",
            itemId: "apprentice_sword",
            chance: 0.04
        },

        {
            type: "counter",
            key: "potions",
            chance: 0.04,
            amount: 1
        }
    ],

    boar: [

        {
            type: "currency",
            chance: 0.90,
            amount: 8
        },

        {
            type: "counter",
            key: "meat",
            chance: 0.75,
            amount: 1
        },

        {
            type: "counter",
            key: "leather",
            chance: 0.45,
            amount: 1
        },

        {
            type: "item",
            itemId: "leather_armor",
            chance: 0.08
        },

        {
            type: "item",
            itemId: "wood_shield",
            chance: 0.07
        },

        {
            type: "item",
            itemId: "leather_boots",
            chance: 0.05
        },

        {
            type: "counter",
            key: "potions",
            chance: 0.05,
            amount: 1
        }
    ],

    goblin: [

        {
            type: "currency",
            chance: 1,
            amount: 15
        },

        {
            type: "counter",
            key: "goblinEar",
            chance: 0.75,
            amount: 1
        },

        {
            type: "counter",
            key: "iron",
            chance: 0.30,
            amount: 1
        },

        {
            type: "item",
            itemId: "iron_sword",
            chance: 0.07
        },

        {
            type: "item",
            itemId: "goblin_helmet",
            chance: 0.07
        },

        {
            type: "item",
            itemId: "iron_shield",
            chance: 0.04
        },

        {
            type: "item",
            itemId: "goblin_boots",
            chance: 0.05
        }
    ],

    orc: [

        {
            type: "currency",
            chance: 1,
            amount: 30
        },

        {
            type: "counter",
            key: "iron",
            chance: 0.55,
            amount: 1
        },

        {
            type: "counter",
            key: "leather",
            chance: 0.65,
            amount: 1
        },

        {
            type: "item",
            itemId: "steel_sword",
            chance: 0.06
        },

        {
            type: "item",
            itemId: "iron_armor",
            chance: 0.06
        },

        {
            type: "item",
            itemId: "iron_shield",
            chance: 0.07
        },

        {
            type: "item",
            itemId: "goblin_helmet",
            chance: 0.08
        },

        {
            type: "counter",
            key: "potions",
            chance: 0.12,
            amount: 1
        }
    ]
};

/* =========================================================
   CREAR ENEMIGO
   ========================================================= */

function createEnemy(type) {

    const data = enemyTypes[type];

    let x;
    let y;

    let attempts = 0;

    do {

        x = 200 + Math.random() *
            (WORLD_WIDTH - 400);

        y = 200 + Math.random() *
            (WORLD_HEIGHT - 400);

        attempts++;

    } while (
        distance(
            x,
            y,
            respawnPoint.x,
            respawnPoint.y
        ) < 650 &&
        attempts < 100
    );

    return {

        type,

        x,
        y,

        radius: data.radius,

        hp: data.hp,
        maxHp: data.hp,

        damage: data.damage,
        speed: data.speed,

        xp: data.xp,
        gold: data.gold,

        attackCooldown: 0,

        dead: false,

        deathTimer: 0
    };
}

/* =========================================================
   MANTENER ENEMIGOS
   ========================================================= */

function maintainEnemies() {

    /*
        Eliminamos enemigos muertos
        después de terminar su animación.
    */

    for (let i = enemies.length - 1; i >= 0; i--) {

        if (
            enemies[i].dead &&
            enemies[i].deathTimer <= 0
        ) {
            enemies.splice(i, 1);
        }
    }

    while (enemies.length < 30) {

        const types = [
            "wolf",
            "boar",
            "goblin",
            "orc"
        ];

        const roll = Math.random();

        let type;

        if (roll < 0.40) {
            type = "wolf";
        }
        else if (roll < 0.70) {
            type = "boar";
        }
        else if (roll < 0.92) {
            type = "goblin";
        }
        else {
            type = "orc";
        }

        enemies.push(
            createEnemy(type)
        );
    }
}

for (let i = 0; i < 30; i++) {
    maintainEnemies();
}

/* =========================================================
   RECURSOS
   ========================================================= */

const resources = [];

const resourceTypes = [
    "tree",
    "rock",
    "copper",
    "iron"
];

function createResource(type) {

    let x;
    let y;

    do {

        x = Math.random() *
            WORLD_WIDTH;

        y = Math.random() *
            WORLD_HEIGHT;

    } while (
        distance(
            x,
            y,
            respawnPoint.x,
            respawnPoint.y
        ) < 600
    );

    return {

        type,

        x,
        y,

        radius:
            type === "tree"
                ? 30
                : 25,

        hp:
            type === "tree"
                ? 3
                : 2,

        maxHp:
            type === "tree"
                ? 3
                : 2,

        respawnTimer: 0
    };
}

for (let i = 0; i < 300; i++) {

    const type =
        resourceTypes[
            Math.floor(
                Math.random() *
                resourceTypes.length
            )
        ];

    resources.push(
        createResource(type)
    );
}

/* =========================================================
   NPC
   ========================================================= */

const npcs = [

    {
        id: "guardian",
        name: "Guardián de Ceniza",
        x: respawnPoint.x,
        y: respawnPoint.y - 160,
        icon: "🛡️"
    },

    {
        id: "blacksmith",
        name: "Herrero Aldric",
        x: respawnPoint.x + 180,
        y: respawnPoint.y + 40,
        icon: "🔨"
    },

    {
        id: "merchant",
        name: "Mercader Lina",
        x: respawnPoint.x - 180,
        y: respawnPoint.y + 40,
        icon: "🛒"
    },

    {
        id: "trainer",
        name: "Maestro Rokan",
        x: respawnPoint.x,
        y: respawnPoint.y + 180,
        icon: "⚔️"
    }
];

/* =========================================================
   MISIONES
   ========================================================= */

const quests = {

    firstSteps: {
        id: "firstSteps",
        name: "Primeros pasos",
        description: "Derrota 3 enemigos.",
        target: 3,
        progress: 0,
        rewardGold: 50,
        rewardXP: 50,
        completed: false,
        claimed: false
    },

    wolves: {
        id: "wolves",
        name: "Amenaza de los lobos",
        description: "Derrota 5 lobos.",
        target: 5,
        progress: 0,
        rewardGold: 100,
        rewardXP: 100,
        completed: false,
        claimed: false
    },

    resources: {
        id: "resources",
        name: "Recursos para la ciudad",
        description: "Recolecta 10 recursos.",
        target: 10,
        progress: 0,
        rewardGold: 75,
        rewardXP: 75,
        completed: false,
        claimed: false
    }
};

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
        screenWidth / 2;

    camera.y =
        player.y -
        screenHeight / 2;

    camera.x =
        Math.max(
            0,
            Math.min(
                camera.x,
                WORLD_WIDTH - screenWidth
            )
        );

    camera.y =
        Math.max(
            0,
            Math.min(
                camera.y,
                WORLD_HEIGHT - screenHeight
            )
        );
}

/* =========================================================
   JOYSTICK
   ========================================================= */

let joyX = 0;
let joyY = 0;

let joystickActive = false;

const joystick =
    document.getElementById("joystick");

const joystickKnob =
    document.getElementById("joystickKnob");

if (joystick) {

    joystick.addEventListener(
        "pointerdown",
        e => {

            joystickActive = true;

            joystick.setPointerCapture(
                e.pointerId
            );

            updateJoystick(e);
        }
    );

    joystick.addEventListener(
        "pointermove",
        e => {

            if (!joystickActive) return;

            updateJoystick(e);
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

function updateJoystick(e) {

    const rect =
        joystick.getBoundingClientRect();

    const centerX =
        rect.left + rect.width / 2;

    const centerY =
        rect.top + rect.height / 2;

    let dx =
        e.clientX - centerX;

    let dy =
        e.clientY - centerY;

    const max =
        rect.width * 0.34;

    const len =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    if (len > max) {

        dx =
            dx / len * max;

        dy =
            dy / len * max;
    }

    joyX = dx / max;
    joyY = dy / max;

    if (joystickKnob) {

        joystickKnob.style.transform =
            `translate(${dx}px,${dy}px)`;
    }
}

function resetJoystick() {

    joystickActive = false;

    joyX = 0;
    joyY = 0;

    if (joystickKnob) {
        joystickKnob.style.transform =
            "translate(0,0)";
    }
}

/* =========================================================
   TECLADO
   ========================================================= */

const keys = {};

window.addEventListener(
    "keydown",
    e => {

        keys[e.key.toLowerCase()] = true;

        if (
            e.key.toLowerCase() === "p"
        ) {
            usePotion();
        }
    }
);

window.addEventListener(
    "keyup",
    e => {

        keys[e.key.toLowerCase()] = false;
    }
);

/* =========================================================
   UTILIDADES
   ========================================================= */

function distance(
    x1,
    y1,
    x2,
    y2
) {

    return Math.sqrt(
        (x2 - x1) ** 2 +
        (y2 - y1) ** 2
    );
}

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
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

    const tx =
        Math.floor(x / TILE);

    const ty =
        Math.floor(y / TILE);

    const d =
        distance(
            x,
            y,
            respawnPoint.x,
            respawnPoint.y
        );

    if (d < CITY_RADIUS) {
        return TERRAIN.GRASS;
    }

    const noise =
        Math.sin(tx * 0.35) *
        0.5 +
        Math.cos(ty * 0.27) *
        0.5;

    if (
        noise > 0.82
    ) {
        return TERRAIN.WATER;
    }

    if (
        noise > 0.60
    ) {
        return TERRAIN.SAND;
    }

    if (
        noise < -0.70
    ) {
        return TERRAIN.ROCK;
    }

    if (
        noise < -0.35
    ) {
        return TERRAIN.FOREST;
    }

    return TERRAIN.GRASS;
}

/* =========================================================
   MOVIMIENTO
   ========================================================= */

function updateMovement(dt) {

    if (player.dead) return;

    let dx = joyX;
    let dy = joyY;

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

    const len =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    if (len > 0) {

        dx /= len;
        dy /= len;

        player.x +=
            dx *
            player.speed *
            dt;

        player.y +=
            dy *
            player.speed *
            dt;

        player.directionX = dx;
        player.directionY = dy;
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
   ATAQUE
   ========================================================= */

function findNearestEnemy(range = player.attackRange) {

    let nearest = null;
    let bestDistance = Infinity;

    enemies.forEach(enemy => {

        if (
            enemy.dead ||
            enemy.hp <= 0
        ) return;

        const d =
            distance(
                player.x,
                player.y,
                enemy.x,
                enemy.y
            );

        if (
            d <= range &&
            d < bestDistance
        ) {

            bestDistance = d;
            nearest = enemy;
        }
    });

    return nearest;
}

function attack() {

    if (
        player.dead ||
        player.attackCooldown > 0
    ) {
        return;
    }

    const enemy =
        findNearestEnemy();

    if (!enemy) {

        showMessage(
            "No hay enemigos cerca."
        );

        return;
    }

    let damage =
        player.damage;

    if (
        player.rageTimer > 0
    ) {
        damage *= 1.7;
    }

    damage =
        Math.floor(damage);

    enemy.hp -= damage;

    player.attackCooldown =
        player.attackDelay;

    player.attackAnimation =
        0.18;

    addFloatingText(
        enemy.x,
        enemy.y - 30,
        `-${damage}`,
        "#ff5c5c"
    );

    if (enemy.hp <= 0) {

        killEnemy(enemy);
    }
}

/* =========================================================
   MATAR ENEMIGO
   ========================================================= */

function killEnemy(enemy) {

    if (enemy.dead) return;

    enemy.dead = true;
    enemy.deathTimer = 0.6;

    gainXP(enemy.xp);

    inventory.gold += enemy.gold;

    addFloatingText(
        enemy.x,
        enemy.y - 55,
        `+${enemy.gold} 💰`,
        "#ffd45a"
    );

    processEnemyLoot(enemy.type);

    updateQuestEnemy(enemy.type);

    saveGame();

    showMessage(
        `💀 ${enemyTypes[enemy.type].name} derrotado`
    );
}

/* =========================================================
   LOOT
   ========================================================= */

function processEnemyLoot(type) {

    const lootTable =
        enemyLoot[type];

    if (!lootTable) return;

    lootTable.forEach(drop => {

        if (
            Math.random() >
            drop.chance
        ) {
            return;
        }

        if (
            drop.type ===
            "currency"
        ) {

            const amount =
                drop.amount;

            inventory.gold += amount;

            addFloatingText(
                player.x,
                player.y - 65,
                `+${amount} 💰`,
                "#ffd45a"
            );
        }

        else if (
            drop.type ===
            "counter"
        ) {

            inventory[drop.key] =
                (inventory[drop.key] || 0) +
                drop.amount;

            showMessage(
                `📦 +${drop.amount} ${counterName(drop.key)}`
            );
        }

        else if (
            drop.type ===
            "item"
        ) {

            addItem(
                drop.itemId,
                1
            );
        }
    });
}

function counterName(key) {

    const names = {

        wolfFang: "Colmillo de lobo",

        goblinEar: "Oreja de goblin",

        leather: "Cuero",

        meat: "Carne",

        iron: "Hierro",

        potions: "Poción"

    };

    return names[key] || key;
}

/* =========================================================
   XP / NIVEL
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

    player.maxHp += 25;
    player.maxMana += 12;

    player.baseDamage += 6;
    player.baseDefense += 2;

    player.hp =
        player.maxHp;

    player.mana =
        player.maxMana;

    recalculatePlayerStats();

    showMessage(
        `🎉 ¡NIVEL ${player.level}!`
    );

    addFloatingText(
        player.x,
        player.y - 70,
        `NIVEL ${player.level}`,
        "#ffe066"
    );

    checkSkillUnlocks();

    saveGame();
}

function checkSkillUnlocks() {

    skills.forEach(skill => {

        if (
            player.level === skill.level
        ) {

            showMessage(
                `${skill.icon} ¡Nueva habilidad: ${skill.name}!`
            );
        }
    });
}

/* =========================================================
   HABILIDADES
   ========================================================= */

function useSkill(index) {

    const skill =
        skills[index];

    if (!skill) return;

    if (
        player.level <
        skill.level
    ) {

        showMessage(
            `🔒 Se desbloquea en nivel ${skill.level}`
        );

        return;
    }

    if (
        skillCooldowns[skill.id] >
        0
    ) {

        showMessage(
            "⏳ Habilidad en enfriamiento."
        );

        return;
    }

    if (
        player.mana <
        skill.mana
    ) {

        showMessage(
            "💙 No tienes suficiente maná."
        );

        return;
    }

    player.mana -=
        skill.mana;

    skillCooldowns[skill.id] =
        skill.cooldown;

    player.skillAnimation =
        0.5;

    switch (skill.id) {

        case "power":
            powerStrike();
            break;

        case "heal":
            healSkill();
            break;

        case "whirlwind":
            whirlwind();
            break;

        case "rage":
            rageSkill();
            break;

        case "execution":
            execution();
            break;

        case "rain":
            rainSkill();
            break;

        case "ash":
            ashSkill();
            break;
    }
}

function powerStrike() {

    const enemy =
        findNearestEnemy(150);

    if (!enemy) return;

    const damage =
        Math.floor(
            player.damage * 2
        );

    enemy.hp -= damage;

    addFloatingText(
        enemy.x,
        enemy.y - 40,
        `-${damage}`,
        "#ffb347"
    );

    if (enemy.hp <= 0) {
        killEnemy(enemy);
    }
}

function healSkill() {

    const heal =
        Math.floor(
            player.maxHp * 0.35
        );

    player.hp =
        Math.min(
            player.maxHp,
            player.hp + heal
        );

    addFloatingText(
        player.x,
        player.y - 45,
        `+${heal} ❤️`,
        "#62ff8c"
    );
}

function whirlwind() {

    enemies.forEach(enemy => {

        if (enemy.dead) return;

        const d =
            distance(
                player.x,
                player.y,
                enemy.x,
                enemy.y
            );

        if (
            d <= 170
        ) {

            const damage =
                Math.floor(
                    player.damage * 1.5
                );

            enemy.hp -= damage;

            addFloatingText(
                enemy.x,
                enemy.y - 30,
                `-${damage}`,
                "#d87cff"
            );

            if (enemy.hp <= 0) {
                killEnemy(enemy);
            }
        }
    });
}

function rageSkill() {

    player.rageTimer = 8;

    showMessage(
        "🔥 ¡FURIA ACTIVADA!"
    );
}

function execution() {

    const enemy =
        findNearestEnemy(170);

    if (!enemy) return;

    let multiplier = 3;

    if (
        enemy.hp <
        enemy.maxHp * 0.40
    ) {
        multiplier *= 1.5;
    }

    const damage =
        Math.floor(
            player.damage *
            multiplier
        );

    enemy.hp -= damage;

    addFloatingText(
        enemy.x,
        enemy.y - 40,
        `-${damage}`,
        "#ff3b3b"
    );

    if (enemy.hp <= 0) {
        killEnemy(enemy);
    }
}

function rainSkill() {

    enemies.forEach(enemy => {

        if (enemy.dead) return;

        const d =
            distance(
                player.x,
                player.y,
                enemy.x,
                enemy.y
            );

        if (
            d <= 240
        ) {

            const damage =
                Math.floor(
                    player.damage * 2.5
                );

            enemy.hp -= damage;

            if (enemy.hp <= 0) {
                killEnemy(enemy);
            }
        }
    });
}

function ashSkill() {

    enemies.forEach(enemy => {

        if (enemy.dead) return;

        const d =
            distance(
                player.x,
                player.y,
                enemy.x,
                enemy.y
            );

        if (
            d <= 300
        ) {

            const damage =
                Math.floor(
                    player.damage * 4
                );

            enemy.hp -= damage;

            addFloatingText(
                enemy.x,
                enemy.y - 30,
                `-${damage}`,
                "#ff7043"
            );

            if (enemy.hp <= 0) {
                killEnemy(enemy);
            }
        }
    });
}

/* =========================================================
   POCIONES
   ========================================================= */

function usePotion() {

    if (inventory.potions <= 0) {

        showMessage(
            "🧪 No tienes pociones."
        );

        return;
    }

    if (
        player.hp >=
        player.maxHp
    ) {

        showMessage(
            "❤️ Ya tienes la vida llena."
        );

        return;
    }

    inventory.potions--;

    const heal = 50;

    player.hp =
        Math.min(
            player.maxHp,
            player.hp + heal
        );

    addFloatingText(
        player.x,
        player.y - 45,
        `+${heal} ❤️`,
        "#63ff8b"
    );

    showMessage(
        "🧪 Has usado una poción."
    );

    saveGame();
}

/* =========================================================
   RECURSOS
   ========================================================= */

let lastGatherTap = 0;

function gatherResource() {

    const now =
        Date.now();

    if (
        now - lastGatherTap <
        250
    ) {
        return;
    }

    lastGatherTap = now;

    let nearest = null;
    let best = 75;

    resources.forEach(resource => {

        if (
            resource.hp <= 0
        ) return;

        const d =
            distance(
                player.x,
                player.y,
                resource.x,
                resource.y
            );

        if (
            d < best
        ) {

            best = d;
            nearest = resource;
        }
    });

    if (!nearest) return;

    const tool =
        resourceTools[
            nearest.type
        ];

    if (
        !tools[tool] ||
        !tools[tool].equipped
    ) {

        showMessage(
            "Necesitas la herramienta adecuada."
        );

        return;
    }

    nearest.hp--;

    if (
        nearest.hp <= 0
    ) {

        collectResource(
            nearest
        );

        nearest.respawnTimer =
            15 +
            Math.random() * 20;
    }
}

function collectResource(resource) {

    let key;
    let amount = 1;

    switch (
        resource.type
    ) {

        case "tree":
            key = "wood";
            amount = 2;
            break;

        case "rock":
            key = "stone";
            amount = 2;
            break;

        case "copper":
            key = "copper";
            amount = 1;
            break;

        case "iron":
            key = "iron";
            amount = 1;
            break;
    }

    inventory[key] += amount;

    gainXP(5);

    quests.resources.progress++;

    if (
        quests.resources.progress >=
        quests.resources.target
    ) {
        quests.resources.completed =
            true;
    }

    showMessage(
        `⛏️ +${amount} ${counterName(key)}`
    );

    addFloatingText(
        resource.x,
        resource.y - 35,
        `+${amount}`,
        "#9eff72"
    );

    saveGame();
}

/* =========================================================
   ACTUALIZAR RECURSOS
   ========================================================= */

function updateResources(dt) {

    resources.forEach(resource => {

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
    });
}

/* =========================================================
   ENEMIGOS IA
   ========================================================= */

function updateEnemies(dt) {

    enemies.forEach(enemy => {

        if (enemy.dead) {

            enemy.deathTimer -= dt;

            return;
        }

        const d =
            distance(
                enemy.x,
                enemy.y,
                player.x,
                player.y
            );

        if (
            d < 500 &&
            !player.dead
        ) {

            const dx =
                player.x -
                enemy.x;

            const dy =
                player.y -
                enemy.y;

            const len =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                d > 58 &&
                len > 0
            ) {

                enemy.x +=
                    dx / len *
                    enemy.speed *
                    dt;

                enemy.y +=
                    dy / len *
                    enemy.speed *
                    dt;
            }

            if (
                d <= 58
            ) {

                enemy.attackCooldown -=
                    dt;

                if (
                    enemy.attackCooldown <= 0
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

                    addFloatingText(
                        player.x,
                        player.y - 35,
                        `-${damage}`,
                        "#ff4f4f"
                    );

                    if (
                        player.hp <= 0
                    ) {
                        playerDeath();
                    }
                }
            }
        }
    });
}

/* =========================================================
   MUERTE
   ========================================================= */

function playerDeath() {

    if (player.dead) return;

    player.dead = true;
    player.hp = 0;
    player.respawnTimer = 3;

    showMessage(
        "💀 Has muerto..."
    );
}

function updateDeath(dt) {

    if (!player.dead) return;

    player.respawnTimer -= dt;

    if (
        player.respawnTimer <= 0
    ) {

        player.dead = false;

        player.x =
            respawnPoint.x;

        player.y =
            respawnPoint.y;

        player.hp =
            player.maxHp;

        player.mana =
            player.maxMana;

        showMessage(
            "✨ Has regresado a la ciudad."
        );
    }
}

/* =========================================================
   NPC
   ========================================================= */

function interactNPC() {

    let nearest = null;
    let best = 90;

    npcs.forEach(npc => {

        const d =
            distance(
                player.x,
                player.y,
                npc.x,
                npc.y
            );

        if (
            d < best
        ) {

            best = d;
            nearest = npc;
        }
    });

    if (!nearest) return;

    openNPC(nearest.id);
}

function openNPC(id) {

    if (id === "blacksmith") {

        openBlacksmith();

    } else if (
        id === "merchant"
    ) {

        openMerchant();

    } else if (
        id === "trainer"
    ) {

        openTrainer();

    } else if (
        id === "guardian"
    ) {

        openGuardian();
    }
}

/* =========================================================
   HERRERO
   ========================================================= */

function openBlacksmith() {

    let panel =
        document.getElementById(
            "npcPanel"
        );

    if (!panel) return;

    panel.style.display =
        "block";

    panel.innerHTML = `

        <h2>🔨 Herrero Aldric</h2>

        <p>
            Puedo mejorar tu espada y tu armadura.
        </p>

        <button
            id="upgradeWeapon"
        >
            ⚔️ Mejorar espada
            <br>
            100 💰 + 5 ⚙️ Hierro
        </button>

        <button
            id="upgradeArmor"
        >
            🛡️ Mejorar armadura
            <br>
            100 💰 + 5 ⚙️ Hierro
        </button>

        <button
            onclick="closePanels()"
        >
            Cerrar
        </button>
    `;

    document
        .getElementById(
            "upgradeWeapon"
        )
        .onclick =
            upgradeWeapon;

    document
        .getElementById(
            "upgradeArmor"
        )
        .onclick =
            upgradeArmor;
}

function upgradeWeapon() {

    if (
        inventory.gold < 100 ||
        inventory.iron < 5
    ) {

        showMessage(
            "Necesitas 100 💰 y 5 ⚙️ Hierro."
        );

        return;
    }

    inventory.gold -= 100;
    inventory.iron -= 5;

    if (
        equipment.weapon
    ) {

        equipment.weapon.damage += 5;

        player.baseDamage =
            Math.max(
                player.baseDamage,
                25
            );
    }

    recalculatePlayerStats();

    showMessage(
        "⚔️ ¡Espada mejorada!"
    );

    saveGame();

    updateUI();
}

function upgradeArmor() {

    if (
        inventory.gold < 100 ||
        inventory.iron < 5
    ) {

        showMessage(
            "Necesitas 100 💰 y 5 ⚙️ Hierro."
        );

        return;
    }

    inventory.gold -= 100;
    inventory.iron -= 5;

    if (
        equipment.armor
    ) {

        equipment.armor.defense += 3;
    }

    recalculatePlayerStats();

    showMessage(
        "🛡️ ¡Armadura mejorada!"
    );

    saveGame();

    updateUI();
}

/* =========================================================
   MERCADER
   ========================================================= */

function openMerchant() {

    let panel =
        document.getElementById(
            "npcPanel"
        );

    if (!panel) return;

    panel.style.display =
        "block";

    panel.innerHTML = `

        <h2>🛒 Mercader Lina</h2>

        <p>
            Oro disponible:
            ${inventory.gold} 💰
        </p>

        <button id="buyPotion">
            🧪 Poción - 25 💰
        </button>

        <button id="buyBait">
            🎣 Cebo - 5 💰
        </button>

        <button onclick="closePanels()">
            Cerrar
        </button>
    `;

    document
        .getElementById(
            "buyPotion"
        )
        .onclick = () => {

            if (
                inventory.gold < 25
            ) {

                showMessage(
                    "No tienes suficiente oro."
                );

                return;
            }

            inventory.gold -= 25;
            inventory.potions++;

            saveGame();

            showMessage(
                "🧪 Poción comprada."
            );

            openMerchant();
        };

    document
        .getElementById(
            "buyBait"
        )
        .onclick = () => {

            if (
                inventory.gold < 5
            ) {

                showMessage(
                    "No tienes suficiente oro."
                );

                return;
            }

            inventory.gold -= 5;
            inventory.bait++;

            saveGame();

            showMessage(
                "🎣 Cebo comprado."
            );

            openMerchant();
        };
}

/* =========================================================
   ENTRENADOR
   ========================================================= */

function openTrainer() {

    let panel =
        document.getElementById(
            "npcPanel"
        );

    if (!panel) return;

    panel.style.display =
        "block";

    panel.innerHTML = `

        <h2>⚔️ Maestro Rokan</h2>

        <p>
            Nivel actual:
            ${player.level}
        </p>

        <p>
            Aprende habilidades mientras subes de nivel.
        </p>

        <div>
            ${skills.map(skill => `
                <div style="
                    padding:6px;
                    margin:3px;
                    background:rgba(255,255,255,.05);
                    border-radius:6px;
                ">
                    ${skill.icon}
                    ${skill.name}
                    -
                    ${
                        player.level >= skill.level
                        ? "✅ Desbloqueada"
                        : "🔒 Nivel " + skill.level
                    }
                </div>
            `).join("")}
        </div>

        <button onclick="closePanels()">
            Cerrar
        </button>
    `;
}

/* =========================================================
   GUARDIÁN / MISIONES
   ========================================================= */

function openGuardian() {

    let panel =
        document.getElementById(
            "npcPanel"
        );

    if (!panel) return;

    panel.style.display =
        "block";

    panel.innerHTML = `
        <h2>🛡️ Guardián de Ceniza</h2>

        <p>
            Estas son las misiones disponibles.
        </p>

        ${Object.values(quests).map(
            quest => `

            <div style="
                padding:10px;
                margin:6px 0;
                background:rgba(255,255,255,.05);
                border-radius:8px;
            ">

                <strong>
                    ${quest.name}
                </strong>

                <div>
                    ${quest.description}
                </div>

                <div>
                    ${quest.progress}/${quest.target}
                </div>

                ${
                    quest.completed &&
                    !quest.claimed
                    ?
                    `
                    <button
                        onclick="claimQuest('${quest.id}')"
                    >
                        🎁 RECLAMAR
                    </button>
                    `
                    :
                    ""
                }

            </div>
        `
        ).join("")}

        <button onclick="closePanels()">
            Cerrar
        </button>
    `;
}

function updateQuestEnemy(type) {

    quests.firstSteps.progress++;

    if (
        quests.firstSteps.progress >=
        quests.firstSteps.target
    ) {
        quests.firstSteps.completed = true;
    }

    if (
        type === "wolf"
    ) {

        quests.wolves.progress++;

        if (
            quests.wolves.progress >=
            quests.wolves.target
        ) {
            quests.wolves.completed =
                true;
        }
    }
}

function claimQuest(id) {

    const quest =
        quests[id];

    if (
        !quest ||
        !quest.completed ||
        quest.claimed
    ) {
        return;
    }

    quest.claimed = true;

    inventory.gold +=
        quest.rewardGold;

    gainXP(
        quest.rewardXP
    );

    showMessage(
        `🎁 Misión completada: ${quest.name}`
    );

    saveGame();

    openGuardian();
}

/* =========================================================
   CERRAR PANELES
   ========================================================= */

function closePanels() {

    [
        "npcPanel",
        "inventoryPanel",
        "characterPanel",
        "questsPanel",
        "shopPanel"
    ].forEach(id => {

        const el =
            document.getElementById(id);

        if (el) {
            el.style.display =
                "none";
        }
    });

    closeItemDetails();
}

/* =========================================================
   EFECTOS / TEXTO FLOTANTE
   ========================================================= */

const floatingTexts = [];

function addFloatingText(
    x,
    y,
    text,
    color = "#ffffff"
) {

    floatingTexts.push({

        x,
        y,
        text,
        color,

        life: 1
    });
}

function updateFloatingTexts(dt) {

    for (
        let i = floatingTexts.length - 1;
        i >= 0;
        i--
    ) {

        const f =
            floatingTexts[i];

        f.life -= dt;

        f.y -=
            25 * dt;

        if (
            f.life <= 0
        ) {

            floatingTexts.splice(
                i,
                1
            );
        }
    }
}

function drawFloatingTexts() {

    ctx.save();

    floatingTexts.forEach(f => {

        const alpha =
            Math.max(
                0,
                f.life
            );

        ctx.globalAlpha =
            alpha;

        ctx.fillStyle =
            f.color;

        ctx.font =
            "bold 16px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            f.text,
            f.x - camera.x,
            f.y - camera.y
        );
    });

    ctx.restore();
}

/* =========================================================
   MENSAJES
   ========================================================= */

let messageTimer = 0;

function showMessage(text) {

    messageTimer = 3;

    const el =
        document.getElementById(
            "message"
        );

    if (el) {
        el.textContent = text;
        el.style.display = "block";
    }
}

function updateMessage(dt) {

    if (
        messageTimer > 0
    ) {

        messageTimer -= dt;

        if (
            messageTimer <= 0
        ) {

            const el =
                document.getElementById(
                    "message"
                );

            if (el) {
                el.style.display =
                    "none";
            }
        }
    }
}

/* =========================================================
   ACTUALIZAR HABILIDADES
   ========================================================= */

function updateSkills(dt) {

    skills.forEach(skill => {

        if (
            skillCooldowns[skill.id] >
            0
        ) {

            skillCooldowns[skill.id] -= dt;

            if (
                skillCooldowns[skill.id] < 0
            ) {
                skillCooldowns[skill.id] = 0;
            }
        }
    });
}

/* =========================================================
   ACTUALIZAR PLAYER
   ========================================================= */

function updatePlayer(dt) {

    if (
        player.attackCooldown > 0
    ) {

        player.attackCooldown -=
            dt;
    }

    if (
        player.attackAnimation > 0
    ) {

        player.attackAnimation -=
            dt;
    }

    if (
        player.skillAnimation > 0
    ) {

        player.skillAnimation -=
            dt;
    }

    if (
        player.rageTimer > 0
    ) {

        player.rageTimer -= dt;

        if (
            player.rageTimer <= 0
        ) {

            player.rageTimer = 0;

            recalculatePlayerStats();
        }
    }

    /*
        Regeneración pequeña de maná.
    */

    player.mana =
        Math.min(
            player.maxMana,
            player.mana +
            dt * 2
        );
}

/* =========================================================
   UPDATE
   ========================================================= */

function update(dt) {

    updateMovement(dt);

    updatePlayer(dt);

    updateEnemies(dt);

    updateResources(dt);

    updateDeath(dt);

    updateSkills(dt);

    updateFloatingTexts(dt);

    updateMessage(dt);

    maintainEnemies();

    updateCamera();

    updateUI();
}

/* =========================================================
   DIBUJAR TERRENO
   ========================================================= */

function drawTerrain() {

    const startX =
        Math.floor(
            camera.x / TILE
        ) - 1;

    const startY =
        Math.floor(
            camera.y / TILE
        ) - 1;

    const endX =
        startX +
        Math.ceil(
            screenWidth / TILE
        ) + 2;

    const endY =
        startY +
        Math.ceil(
            screenHeight / TILE
        ) + 2;

    for (
        let ty = startY;
        ty < endY;
        ty++
    ) {

        for (
            let tx = startX;
            tx < endX;
            tx++
        ) {

            const x =
                tx * TILE;

            const y =
                ty * TILE;

            const terrain =
                terrainAt(
                    x + TILE / 2,
                    y + TILE / 2
                );

            switch (terrain) {

                case TERRAIN.GRASS:
                    ctx.fillStyle =
                        "#315b35";
                    break;

                case TERRAIN.WATER:
                    ctx.fillStyle =
                        "#245b7a";
                    break;

                case TERRAIN.SAND:
                    ctx.fillStyle =
                        "#b99a62";
                    break;

                case TERRAIN.FOREST:
                    ctx.fillStyle =
                        "#24462c";
                    break;

                case TERRAIN.ROCK:
                    ctx.fillStyle =
                        "#555a60";
                    break;
            }

            ctx.fillRect(
                x - camera.x,
                y - camera.y,
                TILE + 1,
                TILE + 1
            );

            /*
                Detalle determinista para evitar
                que el césped parpadee.
            */

            const seed =
                Math.abs(
                    (
                        tx * 928371 +
                        ty * 523241
                    ) %
                    100
                );

            if (
                terrain === TERRAIN.GRASS &&
                seed < 18
            ) {

                ctx.fillStyle =
                    "#477b45";

                ctx.fillRect(
                    x - camera.x + 12,
                    y - camera.y + 16,
                    3,
                    9
                );
            }
        }
    }
}

/* =========================================================
   DIBUJAR CIUDAD
   ========================================================= */

function drawCity() {

    const cx =
        respawnPoint.x -
        camera.x;

    const cy =
        respawnPoint.y -
        camera.y;

    /*
        Plaza
    */

    ctx.fillStyle =
        "#8b7049";

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        250,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
        Fuente
    */

    ctx.fillStyle =
        "#777";

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        60,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#3c8fb8";

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        45,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
        Casas
    */

    const houses = [

        {
            x: -350,
            y: -260
        },

        {
            x: 350,
            y: -260
        },

        {
            x: -350,
            y: 260
        },

        {
            x: 350,
            y: 260
        }
    ];

    houses.forEach(house => {

        const x =
            respawnPoint.x +
            house.x -
            camera.x;

        const y =
            respawnPoint.y +
            house.y -
            camera.y;

        ctx.fillStyle =
            "#72513a";

        ctx.fillRect(
            x - 55,
            y - 45,
            110,
            90
        );

        ctx.fillStyle =
            "#49352b";

        ctx.beginPath();

        ctx.moveTo(
            x - 70,
            y - 45
        );

        ctx.lineTo(
            x,
            y - 100
        );

        ctx.lineTo(
            x + 70,
            y - 45
        );

        ctx.closePath();

        ctx.fill();
    });

    /*
        Bandera
    */

    ctx.strokeStyle =
        "#3b3028";

    ctx.lineWidth = 6;

    ctx.beginPath();

    ctx.moveTo(
        cx,
        cy - 230
    );

    ctx.lineTo(
        cx,
        cy - 350
    );

    ctx.stroke();

    ctx.fillStyle =
        "#8d3030";

    ctx.beginPath();

    ctx.moveTo(
        cx,
        cy - 345
    );

    ctx.lineTo(
        cx + 80,
        cy - 320
    );

    ctx.lineTo(
        cx,
        cy - 295
    );

    ctx.closePath();

    ctx.fill();
}

/* =========================================================
   DIBUJAR RECURSOS
   ========================================================= */

function drawResources() {

    resources.forEach(resource => {

        if (
            resource.hp <= 0
        ) return;

        const x =
            resource.x -
            camera.x;

        const y =
            resource.y -
            camera.y;

        if (
            x < -60 ||
            y < -60 ||
            x > screenWidth + 60 ||
            y > screenHeight + 60
        ) {
            return;
        }

        if (
            resource.type === "tree"
        ) {

            ctx.fillStyle =
                "#5b3b25";

            ctx.fillRect(
                x - 7,
                y - 5,
                14,
                40
            );

            ctx.fillStyle =
                "#2e7d32";

            ctx.beginPath();

            ctx.arc(
                x,
                y - 20,
                30,
                0,
                Math.PI * 2
            );

            ctx.fill();

        } else if (
            resource.type === "rock"
        ) {

            ctx.fillStyle =
                "#858b8f";

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                25,
                0,
                Math.PI * 2
            );

            ctx.fill();

        } else if (
            resource.type === "copper"
        ) {

            ctx.fillStyle =
                "#c77c45";

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                23,
                0,
                Math.PI * 2
            );

            ctx.fill();

        } else if (
            resource.type === "iron"
        ) {

            ctx.fillStyle =
                "#9da4aa";

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                23,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle =
                "#444";

            ctx.beginPath();

            ctx.arc(
                x + 5,
                y - 4,
                7,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    });
}

/* =========================================================
   DIBUJAR NPC
   ========================================================= */

function drawNPCs() {

    npcs.forEach(npc => {

        const x =
            npc.x -
            camera.x;

        const y =
            npc.y -
            camera.y;

        ctx.font =
            "30px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            npc.icon,
            x,
            y
        );

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "bold 12px Arial";

        ctx.fillText(
            npc.name,
            x,
            y + 35
        );
    });
}

/* =========================================================
   DIBUJAR ENEMIGOS
   ========================================================= */

function drawEnemies() {

    enemies.forEach(enemy => {

        if (enemy.dead) {

            ctx.globalAlpha =
                Math.max(
                    0,
                    enemy.deathTimer /
                    0.6
                );
        }

        const x =
            enemy.x -
            camera.x;

        const y =
            enemy.y -
            camera.y;

        let icon = "🐺";

        if (
            enemy.type === "boar"
        ) {
            icon = "🐗";
        }

        if (
            enemy.type === "goblin"
        ) {
            icon = "👺";
        }

        if (
            enemy.type === "orc"
        ) {
            icon = "👹";
        }

        ctx.font =
            "34px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            icon,
            x,
            y + 10
        );

        if (!enemy.dead) {

            const barWidth = 48;

            ctx.fillStyle =
                "#3b1b1b";

            ctx.fillRect(
                x - barWidth / 2,
                y - 32,
                barWidth,
                6
            );

            ctx.fillStyle =
                "#e53935";

            ctx.fillRect(
                x - barWidth / 2,
                y - 32,
                barWidth *
                (enemy.hp /
                    enemy.maxHp),
                6
            );
        }

        ctx.globalAlpha = 1;
    });
}

/* =========================================================
   DIBUJAR PLAYER
   ========================================================= */

function drawPlayer() {

    if (player.dead) return;

    const x =
        player.x -
        camera.x;

    const y =
        player.y -
        camera.y;

    ctx.save();

    /*
        Sombra
    */

    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.beginPath();

    ctx.ellipse(
        x,
        y + 20,
        25,
        10,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
        Cuerpo
    */

    ctx.fillStyle =
        "#3e6ea5";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        21,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
        Casco
    */

    ctx.fillStyle =
        "#b9bdc2";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 8,
        14,
        Math.PI,
        0
    );

    ctx.fill();

    /*
        Espada
    */

    ctx.strokeStyle =
        "#e7e9ec";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
        x + 12,
        y - 5
    );

    ctx.lineTo(
        x + 38 *
        player.directionX,
        y + 38 *
        player.directionY
    );

    ctx.stroke();

    ctx.restore();
}

/* =========================================================
   MINIMAPA
   ========================================================= */

function drawMinimap() {

    if (
        !miniCanvas ||
        !miniCtx
    ) {
        return;
    }

    const w =
        miniCanvas.width;

    const h =
        miniCanvas.height;

    miniCtx.clearRect(
        0,
        0,
        w,
        h
    );

    miniCtx.fillStyle =
        "#17251c";

    miniCtx.fillRect(
        0,
        0,
        w,
        h
    );

    /*
        Terreno simplificado.
    */

    for (
        let y = 0;
        y < h;
        y += 5
    ) {

        for (
            let x = 0;
            x < w;
            x += 5
        ) {

            const worldX =
                x / w *
                WORLD_WIDTH;

            const worldY =
                y / h *
                WORLD_HEIGHT;

            const terrain =
                terrainAt(
                    worldX,
                    worldY
                );

            if (
                terrain === TERRAIN.WATER
            ) {
                miniCtx.fillStyle =
                    "#245b7a";
            }
            else if (
                terrain === TERRAIN.SAND
            ) {
                miniCtx.fillStyle =
                    "#b99a62";
            }
            else if (
                terrain === TERRAIN.FOREST
            ) {
                miniCtx.fillStyle =
                    "#24462c";
            }
            else {
                miniCtx.fillStyle =
                    "#315b35";
            }

            miniCtx.fillRect(
                x,
                y,
                5,
                5
            );
        }
    }

    /*
        Ciudad
    */

    miniCtx.fillStyle =
        "#d5b04d";

    miniCtx.beginPath();

    miniCtx.arc(
        w / 2,
        h / 2,
        9,
        0,
        Math.PI * 2
    );

    miniCtx.fill();

    /*
        Player
    */

    const px =
        player.x /
        WORLD_WIDTH *
        w;

    const py =
        player.y /
        WORLD_HEIGHT *
        h;

    miniCtx.fillStyle =
        "#ffffff";

    miniCtx.beginPath();

    miniCtx.arc(
        px,
        py,
        3,
        0,
        Math.PI * 2
    );

    miniCtx.fill();
}

/* =========================================================
   DRAW
   ========================================================= */

function draw() {

    ctx.clearRect(
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

    drawFloatingTexts();

    drawMinimap();
}

/* =========================================================
   UI
   ========================================================= */

let lastUIUpdate = 0;

function updateUI() {

    /*
        Evita actualizar demasiado el DOM.
    */

    const now =
        performance.now();

    if (
        now - lastUIUpdate <
        100
    ) {
        return;
    }

    lastUIUpdate = now;

    setText(
        "level",
        `Nivel ${player.level}`
    );

    setText(
        "gold",
        `💰 Oro: ${inventory.gold}`
    );

    setText(
        "wood",
        `🎒 Madera: ${inventory.wood}`
    );

    setText(
        "stone",
        `⛏️ Piedra: ${inventory.stone}`
    );

    setText(
        "copper",
        `🔩 Cobre: ${inventory.copper}`
    );

    setText(
        "iron",
        `⚙️ Hierro: ${inventory.iron}`
    );

    setText(
        "fish",
        `🎣 Peces: ${inventory.fish}`
    );

    setText(
        "hp",
        `${Math.ceil(player.hp)} / ${player.maxHp}`
    );

    setText(
        "mana",
        `${Math.ceil(player.mana)} / ${player.maxMana}`
    );

    setText(
        "inventoryCount",
        `${inventoryUsedSlots()} / ${inventorySlots}`
    );

    /*
        Barras
    */

    const hpBar =
        document.getElementById(
            "hpBar"
        );

    if (hpBar) {

        hpBar.style.width =
            `${
                player.hp /
                player.maxHp *
                100
            }%`;
    }

    const xpBar =
        document.getElementById(
            "xpBar"
        );

    if (xpBar) {

        xpBar.style.width =
            `${
                player.xp /
                player.xpNeeded *
                100
            }%`;
    }

    const manaBar =
        document.getElementById(
            "manaBar"
        );

    if (manaBar) {

        manaBar.style.width =
            `${
                player.mana /
                player.maxMana *
                100
            }%`;
    }

    /*
        Actualizar panel de inventario
        si está abierto.
    */

    const inv =
        document.getElementById(
            "inventoryPanel"
        );

    if (
        inv &&
        inv.style.display !== "none"
    ) {
        renderInventoryPanel();
    }
}

function setText(id, text) {

    const el =
        document.getElementById(id);

    if (el) {
        el.textContent = text;
    }
}

/* =========================================================
   BOTONES
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

const skillButtons =
    document.querySelectorAll(
        ".skill-button"
    );

skillButtons.forEach(
    (button, index) => {

        button.addEventListener(
            "pointerdown",
            e => {

                e.preventDefault();

                useSkill(index);
            }
        );
    }
);

/* =========================================================
   DOBLE TOQUE
   ========================================================= */

let lastPointerTime = 0;

canvas.addEventListener(
    "pointerdown",
    e => {

        const now =
            Date.now();

        if (
            now - lastPointerTime <
            350
        ) {

            /*
                Primero intentamos NPC.
            */

            const oldX =
                player.x;

            const oldY =
                player.y;

            /*
                El doble toque sirve para
                interactuar con lo más cercano.
            */

            let npcNear = false;

            npcs.forEach(npc => {

                if (
                    distance(
                        player.x,
                        player.y,
                        npc.x,
                        npc.y
                    ) < 90
                ) {
                    npcNear = true;
                }
            });

            if (npcNear) {
                interactNPC();
            } else {
                gatherResource();
            }

            /*
                Evitar seleccionar texto.
            */

            e.preventDefault();
        }

        lastPointerTime = now;
    }
);

/* =========================================================
   BOTONES DE INVENTARIO / UI
   ========================================================= */

function connectUIButtons() {

    const inventoryButton =
        document.getElementById(
            "inventoryButton"
        );

    if (inventoryButton) {

        inventoryButton.onclick = () => {

            closePanels();

            const panel =
                document.getElementById(
                    "inventoryPanel"
                );

            if (!panel) return;

            panel.style.display =
                "block";

            renderInventoryPanel();
        };
    }

    const characterButton =
        document.getElementById(
            "characterButton"
        );

    if (characterButton) {

        characterButton.onclick =
            openCharacterPanel;
    }

    const questsButton =
        document.getElementById(
            "questsButton"
        );

    if (questsButton) {

        questsButton.onclick =
            openQuestsPanel;
    }

    const shopButton =
        document.getElementById(
            "shopButton"
        );

    if (shopButton) {

        shopButton.onclick =
            openMerchant;
    }
}

connectUIButtons();

/* =========================================================
   PERSONAJE
   ========================================================= */

function openCharacterPanel() {

    closePanels();

    const panel =
        document.getElementById(
            "characterPanel"
        );

    if (!panel) return;

    panel.style.display =
        "block";

    panel.innerHTML = `

        <h2>⚔️ Personaje</h2>

        <div>
            Nivel:
            <strong>
                ${player.level}
            </strong>
        </div>

        <div>
            ❤️ Vida:
            ${player.hp}/${player.maxHp}
        </div>

        <div>
            💙 Maná:
            ${player.mana}/${player.maxMana}
        </div>

        <div>
            ⚔️ Ataque:
            ${player.damage}
        </div>

        <div>
            🛡️ Defensa:
            ${player.defense}
        </div>

        <hr>

        <h3>Equipamiento</h3>

        ${equipmentRow(
            "weapon",
            "⚔️"
        )}

        ${equipmentRow(
            "helmet",
            "🪖"
        )}

        ${equipmentRow(
            "armor",
            "🛡️"
        )}

        ${equipmentRow(
            "boots",
            "🥾"
        )}

        ${equipmentRow(
            "shield",
            "🛡️"
        )}

        <button
            onclick="closePanels()"
        >
            Cerrar
        </button>
    `;
}

function equipmentRow(
    slot,
    icon
) {

    const item =
        equipment[slot];

    if (!item) {

        return `
            <div style="
                padding:8px;
                margin:4px 0;
                background:rgba(255,255,255,.04);
            ">
                ${icon}
                Vacío
            </div>
        `;
    }

    return `
        <div style="
            padding:8px;
            margin:4px 0;
            background:rgba(255,255,255,.06);
            border-radius:8px;
        ">

            ${item.icon}
            ${item.name}

            <div style="
                font-size:12px;
                color:#ccc;
            ">

                ${
                    item.damage
                    ? `⚔️ +${item.damage}`
                    : ""
                }

                ${
                    item.defense
                    ? ` 🛡️ +${item.defense}`
                    : ""
                }

            </div>

            <button
                onclick="unequipItem('${slot}')"
            >
                Desequipar
            </button>

        </div>
    `;
}

/* =========================================================
   PANEL MISIONES
   ========================================================= */

function openQuestsPanel() {

    closePanels();

    const panel =
        document.getElementById(
            "questsPanel"
        );

    if (!panel) return;

    panel.style.display =
        "block";

    panel.innerHTML = `

        <h2>📜 Misiones</h2>

        ${Object.values(quests).map(
            quest => `

            <div style="
                padding:10px;
                margin:7px 0;
                border-radius:9px;
                background:rgba(255,255,255,.06);
            ">

                <strong>
                    ${quest.name}
                </strong>

                <div>
                    ${quest.description}
                </div>

                <div>
                    Progreso:
                    ${quest.progress}/${quest.target}
                </div>

                ${
                    quest.claimed
                    ? "✅ Recompensa reclamada"
                    :
                    quest.completed
                    ? "🎁 Lista para reclamar"
                    : "⏳ En progreso"
                }

            </div>
        `
        ).join("")}

        <button
            onclick="closePanels()"
        >
            Cerrar
        </button>
    `;
}

/* =========================================================
   GUARDADO
   ========================================================= */

function saveGame() {

    try {

        const save = {

            version: 300,

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

                baseDamage:
                    player.baseDamage,

                baseDefense:
                    player.baseDefense
            },

            inventory: {
                ...inventory
            },

            inventorySlots,

            itemInventory:
                itemInventory.map(
                    item =>
                        JSON.parse(
                            JSON.stringify(item)
                        )
                ),

            equipment:
                JSON.parse(
                    JSON.stringify(
                        equipment
                    )
                ),

            quests:
                JSON.parse(
                    JSON.stringify(
                        quests
                    )
                ),

            tools:
                JSON.parse(
                    JSON.stringify(
                        tools
                    )
                )
        };

        localStorage.setItem(
            "reinosDeCenizaRPG",
            JSON.stringify(save)
        );

    } catch (error) {

        console.error(
            "Error guardando:",
            error
        );
    }
}

/* =========================================================
   CARGAR
   ========================================================= */

function loadGame() {

    try {

        const raw =
            localStorage.getItem(
                "reinosDeCenizaRPG"
            );

        if (!raw) {

            /*
                Primera partida:
                metemos el equipamiento inicial
                en el personaje.
            */

            recalculatePlayerStats();

            return;
        }

        const save =
            JSON.parse(raw);

        if (save.player) {

            Object.assign(
                player,
                save.player
            );
        }

        if (save.inventory) {

            Object.assign(
                inventory,
                save.inventory
            );
        }

        if (
            typeof save.inventorySlots ===
            "number"
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

        if (save.equipment) {

            Object.keys(
                equipment
            ).forEach(slot => {

                if (
                    Object.prototype.hasOwnProperty.call(
                        save.equipment,
                        slot
                    )
                ) {

                    equipment[slot] =
                        save.equipment[slot];
                }
            });
        }

        if (save.quests) {

            Object.keys(
                quests
            ).forEach(id => {

                if (
                    save.quests[id]
                ) {

                    Object.assign(
                        quests[id],
                        save.quests[id]
                    );
                }
            });
        }

        if (save.tools) {

            Object.keys(
                tools
            ).forEach(id => {

                if (
                    save.tools[id]
                ) {

                    Object.assign(
                        tools[id],
                        save.tools[id]
                    );
                }
            });
        }

        /*
            Reparación de partidas antiguas.
        */

        if (
            player.hp <= 0
        ) {

            player.hp =
                player.maxHp;
        }

        /*
            Si una partida antigua no tenía
            inventorySlots.
        */

        if (
            !inventorySlots ||
            inventorySlots < 30
        ) {

            inventorySlots = 30;
        }

        /*
            Si la partida antigua no tenía
            itemInventory.
        */

        if (
            !Array.isArray(
                itemInventory
            )
        ) {

            itemInventory = [];
        }

        recalculatePlayerStats();

    } catch (error) {

        console.error(
            "Error cargando partida:",
            error
        );

        recalculatePlayerStats();
    }
}

/* =========================================================
   CARGAR PARTIDA
   ========================================================= */

loadGame();

/* =========================================================
   AUTOGUARDADO
   ========================================================= */

setInterval(
    saveGame,
    10000
);

/* =========================================================
   LOOP PRINCIPAL
   ========================================================= */

let lastTime =
    performance.now();

function gameLoop(now) {

    const dt =
        Math.min(
            0.05,
            (now - lastTime) /
            1000
        );

    lastTime = now;

    update(dt);

    draw();

    requestAnimationFrame(
        gameLoop
    );
}

requestAnimationFrame(
    gameLoop
);

/* =========================================================
   ATAJOS
   ========================================================= */

window.attack = attack;

window.usePotion = usePotion;

window.useSkill = useSkill;

window.openItemDetails =
    openItemDetails;

window.closeItemDetails =
    closeItemDetails;

window.equipItem =
    equipItem;

window.unequipItem =
    unequipItem;

window.expandInventory =
    expandInventory;

window.openBlacksmith =
    openBlacksmith;

window.openMerchant =
    openMerchant;

window.openTrainer =
    openTrainer;

window.openGuardian =
    openGuardian;

window.claimQuest =
    claimQuest;

window.closePanels =
    closePanels;

window.openCharacterPanel =
    openCharacterPanel;

window.openQuestsPanel =
    openQuestsPanel;

/* =========================================================
   MENSAJE INICIAL
   ========================================================= */

setTimeout(() => {

    showMessage(
        `⚔️ Bienvenido a Reinos de Ceniza — ${inventorySlots} espacios disponibles`
    );

}, 1000);

console.log(
    "⚔️ Reinos de Ceniza v300 cargado correctamente."
);

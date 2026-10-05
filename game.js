/* ============================================================
   ⚔️ REINOS DE CENIZA
   GAME.JS — VERSION 301
   ============================================================ */

"use strict";

/* ============================================================
   CANVAS
   ============================================================ */

const canvas =
    document.getElementById("gameCanvas") ||
    document.getElementById("game") ||
    document.querySelector("canvas");

if (!canvas) {
    console.error("❌ No se encontró el canvas del juego.");
}

const ctx = canvas ? canvas.getContext("2d") : null;

if (ctx) {
    ctx.imageSmoothingEnabled = true;
}

/* ============================================================
   MINIMAPA
   ============================================================ */

const miniCanvas =
    document.getElementById("miniCanvas") ||
    document.getElementById("minimapCanvas") ||
    document.getElementById("miniMap");

const miniCtx = miniCanvas ? miniCanvas.getContext("2d") : null;

/* ============================================================
   MUNDO
   ============================================================ */

const WORLD_WIDTH = 5000;
const WORLD_HEIGHT = 5000;
const TILE = 64;

const respawnPoint = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2
};

const CITY_RADIUS = 520;

/* ============================================================
   TERRAIN
   ============================================================ */

const TERRAIN = {
    GRASS: 0,
    WATER: 1,
    SAND: 2,
    FOREST: 3,
    ROCK: 4
};

/* ============================================================
   UTILIDADES
   ============================================================ */

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

function normalize(x, y) {
    const len = Math.sqrt(x * x + y * y);

    if (len <= 0.0001) {
        return {
            x: 0,
            y: 0
        };
    }

    return {
        x: x / len,
        y: y / len
    };
}

function randomChoice(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

function formatNumber(number) {
    return Math.floor(number || 0).toLocaleString("es-ES");
}

function safeNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

/* ============================================================
   JUGADOR
   ============================================================ */

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

    rageTimer: 0,

    kills: 0
};

/* ============================================================
   HERRAMIENTAS
   ============================================================ */

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

/* ============================================================
   INVENTARIO ANTIGUO
   ============================================================ */

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

/* ============================================================
   INVENTARIO NUEVO
   ============================================================ */

let inventorySlots = 30;

const INVENTORY_EXPANSION_COST = 500;
const INVENTORY_EXPANSION_AMOUNT = 5;

let itemInventory = [];

/* ============================================================
   RAREZAS
   ============================================================ */

const rarityInfo = {

    common: {
        name: "Común",
        multiplier: 1,
        color: "#d0d0d0"
    },

    uncommon: {
        name: "Poco común",
        multiplier: 1.15,
        color: "#55d66b"
    },

    rare: {
        name: "Raro",
        multiplier: 1.30,
        color: "#4fa8ff"
    },

    epic: {
        name: "Épico",
        multiplier: 1.50,
        color: "#b86cff"
    },

    legendary: {
        name: "Legendario",
        multiplier: 2,
        color: "#ffad3d"
    }
};

/* ============================================================
   GENERADOR DE UID
   ============================================================ */

function createUID() {
    return (
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).slice(2, 10)
    );
}

/* ============================================================
   DEFINICIONES DE OBJETOS
   ============================================================ */

const itemDefinitions = {

    espadaHierro: {
        id: "espadaHierro",
        name: "Espada de Hierro",
        type: "weapon",
        level: 1,
        rarity: "common",
        damage: 8,
        defense: 0,
        icon: "⚔️",
        description: "Una espada sencilla de hierro."
    },

    espadaAprendiz: {
        id: "espadaAprendiz",
        name: "Espada de Aprendiz",
        type: "weapon",
        level: 1,
        rarity: "uncommon",
        damage: 12,
        defense: 0,
        icon: "🗡️",
        description: "Una espada utilizada por jóvenes guerreros."
    },

    espadaAcero: {
        id: "espadaAcero",
        name: "Espada de Acero",
        type: "weapon",
        level: 3,
        rarity: "rare",
        damage: 20,
        defense: 0,
        icon: "⚔️",
        description: "Una espada fabricada con acero resistente."
    },

    cascoCuero: {
        id: "cascoCuero",
        name: "Casco de Cuero",
        type: "helmet",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 3,
        icon: "🪖",
        description: "Protección ligera de cuero."
    },

    cascoHierro: {
        id: "cascoHierro",
        name: "Casco de Hierro",
        type: "helmet",
        level: 1,
        rarity: "uncommon",
        damage: 0,
        defense: 7,
        icon: "⛑️",
        description: "Un casco de hierro básico."
    },

    cascoGoblin: {
        id: "cascoGoblin",
        name: "Casco de Goblin",
        type: "helmet",
        level: 3,
        rarity: "rare",
        damage: 0,
        defense: 11,
        icon: "👹",
        description: "Un casco recuperado de un goblin."
    },

    armaduraCuero: {
        id: "armaduraCuero",
        name: "Armadura de Cuero",
        type: "armor",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 6,
        icon: "🥋",
        description: "Armadura ligera de cuero."
    },

    armaduraHierro: {
        id: "armaduraHierro",
        name: "Armadura de Hierro",
        type: "armor",
        level: 2,
        rarity: "uncommon",
        damage: 0,
        defense: 12,
        icon: "🛡️",
        description: "Una sólida armadura de hierro."
    },

    botasCuero: {
        id: "botasCuero",
        name: "Botas de Cuero",
        type: "boots",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 3,
        icon: "🥾",
        description: "Botas resistentes para viajar."
    },

    botasGoblin: {
        id: "botasGoblin",
        name: "Botas de Goblin",
        type: "boots",
        level: 3,
        rarity: "rare",
        damage: 0,
        defense: 7,
        icon: "🥾",
        description: "Botas extrañas fabricadas por goblins."
    },

    escudoMadera: {
        id: "escudoMadera",
        name: "Escudo de Madera",
        type: "shield",
        level: 1,
        rarity: "common",
        damage: 0,
        defense: 5,
        icon: "🛡️",
        description: "Un pequeño escudo de madera."
    },

    escudoHierro: {
        id: "escudoHierro",
        name: "Escudo de Hierro",
        type: "shield",
        level: 3,
        rarity: "rare",
        damage: 0,
        defense: 13,
        icon: "🛡️",
        description: "Un escudo pesado de hierro."
    }
};

/* ============================================================
   EQUIPO
   ============================================================ */

const equipment = {
    weapon: {
        itemId: "espadaHierro",
        uid: "equipped_weapon"
    },

    helmet: {
        itemId: "cascoHierro",
        uid: "equipped_helmet"
    },

    armor: {
        itemId: "armaduraHierro",
        uid: "equipped_armor"
    },

    boots: {
        itemId: "botasCuero",
        uid: "equipped_boots"
    },

    shield: {
        itemId: "escudoMadera",
        uid: "equipped_shield"
    }
};

/* ============================================================
   NOMBRES DE SLOTS
   ============================================================ */

const equipmentSlotNames = {
    weapon: "Arma",
    helmet: "Casco",
    armor: "Armadura",
    boots: "Botas",
    shield: "Escudo"
};

/* ============================================================
   ESTADÍSTICAS DE OBJETO
   ============================================================ */

function getItemStats(definition) {

    if (!definition) {
        return {
            damage: 0,
            defense: 0
        };
    }

    const rarity =
        rarityInfo[definition.rarity] ||
        rarityInfo.common;

    return {
        damage: Math.round(
            safeNumber(definition.damage) *
            rarity.multiplier
        ),

        defense: Math.round(
            safeNumber(definition.defense) *
            rarity.multiplier
        )
    };
}

/* ============================================================
   CREAR OBJETO
   ============================================================ */

function createItem(itemId, rarityOverride = null) {

    const definition = itemDefinitions[itemId];

    if (!definition) {
        return null;
    }

    const item = {
        uid: createUID(),
        itemId: definition.id,
        name: definition.name,
        type: definition.type,
        level: definition.level,
        rarity: rarityOverride || definition.rarity,
        damage: definition.damage,
        defense: definition.defense,
        icon: definition.icon,
        description: definition.description
    };

    return item;
}

/* ============================================================
   INVENTARIO
   ============================================================ */

function inventoryUsedSlots() {
    return itemInventory.length;
}

function inventoryHasSpace(amount = 1) {
    return inventoryUsedSlots() + amount <= inventorySlots;
}

function addItem(itemId, amount = 1, rarityOverride = null) {

    amount = Math.max(1, Math.floor(amount));

    if (!inventoryHasSpace(amount)) {
        showMessage("🎒 Inventario lleno");
        return false;
    }

    for (let i = 0; i < amount; i++) {

        const item = createItem(
            itemId,
            rarityOverride
        );

        if (item) {
            itemInventory.push(item);
        }
    }

    markInventoryDirty();

    return true;
}

function addExistingItem(item) {

    if (!item) return false;

    if (!inventoryHasSpace(1)) {
        showMessage("🎒 Inventario lleno");
        return false;
    }

    if (!item.uid) {
        item.uid = createUID();
    }

    itemInventory.push(item);

    markInventoryDirty();

    return true;
}

function removeItemByUid(uid) {

    const index = itemInventory.findIndex(
        item => item.uid === uid
    );

    if (index === -1) {
        return null;
    }

    const removed = itemInventory.splice(index, 1)[0];

    markInventoryDirty();

    return removed;
}

/* ============================================================
   EXPANDIR INVENTARIO
   ============================================================ */

function expandInventory() {

    if (inventory.gold < INVENTORY_EXPANSION_COST) {

        showMessage(
            `❌ Necesitas ${INVENTORY_EXPANSION_COST} monedas`
        );

        return false;
    }

    inventory.gold -= INVENTORY_EXPANSION_COST;

    inventorySlots += INVENTORY_EXPANSION_AMOUNT;

    showMessage(
        `🎒 Inventario ampliado a ${inventorySlots} espacios`
    );

    markInventoryDirty();

    saveGame();

    return true;
}

/* ============================================================
   INVENTARIO DIRTY
   ============================================================ */

let inventoryDirty = true;

function markInventoryDirty() {
    inventoryDirty = true;
}

/* ============================================================
   EQUIPAMIENTO
   ============================================================ */

function getEquipmentDefinition(slot) {

    const equipped = equipment[slot];

    if (!equipped) {
        return null;
    }

    return itemDefinitions[equipped.itemId] || null;
}

function getEquipmentItem(slot) {

    const equipped = equipment[slot];

    if (!equipped) {
        return null;
    }

    const definition =
        itemDefinitions[equipped.itemId];

    if (!definition) {
        return null;
    }

    return {
        uid: equipped.uid,
        itemId: definition.id,
        name: definition.name,
        type: definition.type,
        level: definition.level,
        rarity: equipped.rarity || definition.rarity,
        damage: definition.damage,
        defense: definition.defense,
        icon: definition.icon,
        description: definition.description
    };
}

/* ============================================================
   ESTADÍSTICAS
   ============================================================ */

function recalculatePlayerStats() {

    player.damage = player.baseDamage;
    player.defense = player.baseDefense;

    for (const slot in equipment) {

        const item = getEquipmentItem(slot);

        if (!item) continue;

        const definition =
            itemDefinitions[item.itemId];

        if (!definition) continue;

        const stats = getItemStats({
            ...definition,
            rarity: item.rarity || definition.rarity
        });

        player.damage += stats.damage;
        player.defense += stats.defense;
    }

    player.damage = Math.round(player.damage);
    player.defense = Math.round(player.defense);

    player.hp = clamp(
        player.hp,
        0,
        player.maxHp
    );

    player.mana = clamp(
        player.mana,
        0,
        player.maxMana
    );
}

/* ============================================================
   EQUIPAR
   ============================================================ */

function equipItem(uid) {

    const index = itemInventory.findIndex(
        item => item.uid === uid
    );

    if (index === -1) {
        showMessage("❌ Objeto no encontrado");
        return false;
    }

    const item = itemInventory[index];

    const definition =
        itemDefinitions[item.itemId];

    if (!definition) {
        showMessage("❌ Objeto inválido");
        return false;
    }

    if (player.level < definition.level) {

        showMessage(
            `🔒 Necesitas nivel ${definition.level}`
        );

        return false;
    }

    const slot = definition.type;

    if (!equipment[slot]) {

        showMessage(
            "❌ Este objeto no puede equiparse"
        );

        return false;
    }

    const oldEquipment =
        getEquipmentItem(slot);

    /*
       Si existe equipo anterior necesitamos espacio
       antes de reemplazarlo.
    */

    if (oldEquipment && !inventoryHasSpace(1)) {

        showMessage(
            "🎒 Necesitas un espacio libre para cambiar el equipo"
        );

        return false;
    }

    /*
       Quitamos el nuevo objeto del inventario.
    */

    itemInventory.splice(index, 1);

    /*
       El equipo anterior vuelve al inventario.
    */

    if (oldEquipment) {

        itemInventory.push({
            ...oldEquipment,
            uid: createUID()
        });
    }

    equipment[slot] = {
        itemId: item.itemId,
        uid: item.uid,
        rarity: item.rarity
    };

    recalculatePlayerStats();

    showMessage(
        `⚔️ Equipaste ${definition.name}`
    );

    markInventoryDirty();

    saveGame();

    closeItemDetails();

    return true;
}

/* ============================================================
   DESEQUIPAR
   ============================================================ */

function unequipItem(slot) {

    if (!equipment[slot]) {
        return false;
    }

    if (!inventoryHasSpace(1)) {

        showMessage(
            "🎒 Inventario lleno"
        );

        return false;
    }

    const item = getEquipmentItem(slot);

    if (!item) {
        equipment[slot] = null;
        recalculatePlayerStats();
        saveGame();
        return true;
    }

    itemInventory.push({
        ...item,
        uid: createUID()
    });

    equipment[slot] = null;

    recalculatePlayerStats();

    showMessage(
        `🛡️ Desequipaste ${item.name}`
    );

    markInventoryDirty();

    saveGame();

    closeItemDetails();

    return true;
}

/* ============================================================
   DETALLES DEL OBJETO
   ============================================================ */

function openItemDetails(uid) {

    const item = itemInventory.find(
        item => item.uid === uid
    );

    if (!item) return;

    let panel =
        document.getElementById("itemDetailsPanel");

    if (!panel) {

        panel = document.createElement("div");

        panel.id = "itemDetailsPanel";

        Object.assign(panel.style, {
            position: "fixed",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(92vw, 390px)",
            maxHeight: "85vh",
            overflowY: "auto",
            background: "rgba(15,18,25,0.97)",
            border: "2px solid #8f6b32",
            borderRadius: "16px",
            padding: "18px",
            zIndex: "99999",
            color: "#fff",
            boxShadow: "0 10px 40px rgba(0,0,0,.7)",
            fontFamily: "Arial, sans-serif"
        });

        document.body.appendChild(panel);
    }

    const definition =
        itemDefinitions[item.itemId];

    if (!definition) return;

    const rarity =
        rarityInfo[item.rarity] ||
        rarityInfo.common;

    const stats = getItemStats({
        ...definition,
        rarity: item.rarity
    });

    const isEquipped =
        Object.values(equipment)
            .some(
                e =>
                    e &&
                    e.uid === item.uid
            );

    panel.innerHTML = `
        <div style="text-align:center">

            <div style="
                font-size:58px;
                margin-bottom:8px;
            ">
                ${item.icon}
            </div>

            <div style="
                font-size:23px;
                font-weight:bold;
                color:${rarity.color};
            ">
                ${item.name}
            </div>

            <div style="
                margin-top:5px;
                color:${rarity.color};
                font-weight:bold;
            ">
                ${rarity.name}
            </div>

            <div style="
                margin-top:10px;
                opacity:.85;
            ">
                Nivel requerido: ${item.level}
            </div>

            <div style="
                margin-top:4px;
                opacity:.85;
            ">
                Tipo: ${equipmentSlotNames[item.type] || item.type}
            </div>

            <div style="
                margin-top:16px;
                padding:12px;
                background:rgba(255,255,255,.06);
                border-radius:10px;
                text-align:left;
            ">

                ${
                    stats.damage > 0
                        ? `<div>⚔️ Ataque: <b>+${stats.damage}</b></div>`
                        : ""
                }

                ${
                    stats.defense > 0
                        ? `<div style="margin-top:6px">
                            🛡️ Defensa:
                            <b>+${stats.defense}</b>
                           </div>`
                        : ""
                }

                <div style="
                    margin-top:12px;
                    line-height:1.5;
                    opacity:.85;
                ">
                    ${item.description}
                </div>

            </div>

            <div style="
                display:flex;
                gap:8px;
                margin-top:15px;
            ">

                ${
                    isEquipped
                        ? `
                            <button
                                onclick="unequipItem('${item.type}')"
                                style="
                                    flex:1;
                                    padding:12px;
                                    border:0;
                                    border-radius:10px;
                                    background:#7b2525;
                                    color:white;
                                    font-weight:bold;
                                "
                            >
                                DESEQUIPAR
                            </button>
                        `
                        : `
                            <button
                                onclick="equipItem('${item.uid}')"
                                style="
                                    flex:1;
                                    padding:12px;
                                    border:0;
                                    border-radius:10px;
                                    background:#9b742e;
                                    color:white;
                                    font-weight:bold;
                                "
                            >
                                EQUIPAR
                            </button>
                        `
                }

                <button
                    onclick="closeItemDetails()"
                    style="
                        flex:1;
                        padding:12px;
                        border:0;
                        border-radius:10px;
                        background:#333;
                        color:white;
                        font-weight:bold;
                    "
                >
                    CERRAR
                </button>

            </div>

        </div>
    `;

    panel.style.display = "block";
}

function closeItemDetails() {

    const panel =
        document.getElementById(
            "itemDetailsPanel"
        );

    if (panel) {
        panel.style.display = "none";
    }
}

/* ============================================================
   INVENTARIO PANEL
   ============================================================ */

function getInventoryPanel() {

    return (
        document.getElementById("inventoryPanel") ||
        document.getElementById("inventory")
    );
}

function renderInventoryPanel() {

    const panel = getInventoryPanel();

    if (!panel) return;

    panel.innerHTML = "";

    const title = document.createElement("div");

    title.style.cssText = `
        text-align:center;
        font-size:20px;
        font-weight:bold;
        margin-bottom:10px;
    `;

    title.innerHTML =
        `🎒 Inventario ${inventoryUsedSlots()}/${inventorySlots}`;

    panel.appendChild(title);

    const gold = document.createElement("div");

    gold.style.cssText = `
        text-align:center;
        margin-bottom:10px;
        color:#ffd45c;
        font-weight:bold;
    `;

    gold.textContent =
        `🪙 ${formatNumber(inventory.gold)} monedas`;

    panel.appendChild(gold);

    const grid = document.createElement("div");

    grid.style.cssText = `
        display:grid;
        grid-template-columns:repeat(5, 1fr);
        gap:6px;
        width:100%;
    `;

    for (let i = 0; i < inventorySlots; i++) {

        const slot =
            document.createElement("div");

        slot.style.cssText = `
            aspect-ratio:1/1;
            min-width:0;
            position:relative;
            display:flex;
            align-items:center;
            justify-content:center;
            border:1px solid rgba(255,255,255,.16);
            border-radius:8px;
            background:rgba(0,0,0,.28);
            cursor:pointer;
            user-select:none;
        `;

        const item = itemInventory[i];

        if (item) {

            const rarity =
                rarityInfo[item.rarity] ||
                rarityInfo.common;

            slot.style.border =
                `2px solid ${rarity.color}`;

            slot.innerHTML = `
                <div style="
                    font-size:28px;
                ">
                    ${item.icon}
                </div>

                <div style="
                    position:absolute;
                    right:3px;
                    bottom:2px;
                    font-size:10px;
                    font-weight:bold;
                    color:${rarity.color};
                ">
                    N${item.level}
                </div>
            `;

            slot.addEventListener(
                "click",
                () => openItemDetails(item.uid)
            );

        } else {

            slot.innerHTML = `
                <div style="
                    opacity:.15;
                    font-size:16px;
                ">
                    +
                </div>
            `;
        }

        grid.appendChild(slot);
    }

    panel.appendChild(grid);

    const expandButton =
        document.createElement("button");

    expandButton.textContent =
        `➕ AMPLIAR +5 ESPACIOS — ${INVENTORY_EXPANSION_COST} 🪙`;

    expandButton.style.cssText = `
        width:100%;
        margin-top:12px;
        padding:11px;
        border:0;
        border-radius:9px;
        background:#765622;
        color:white;
        font-weight:bold;
        cursor:pointer;
    `;

    expandButton.addEventListener(
        "click",
        expandInventory
    );

    panel.appendChild(expandButton);

    inventoryDirty = false;
}

/* ============================================================
   ITEMS INICIALES
   ============================================================ */

function initializeStarterInventory() {

    if (itemInventory.length > 0) {
        return;
    }

    /*
       Dejamos algunos objetos iniciales.
    */

    addItem("espadaAprendiz");
    addItem("cascoCuero");
    addItem("botasCuero");

    markInventoryDirty();
}

/* ============================================================
   ENEMIGOS
   ============================================================ */

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

let enemies = [];

/* ============================================================
   CREAR ENEMIGO
   ============================================================ */

function createEnemy(type) {

    const data = enemyTypes[type];

    if (!data) return null;

    let x;
    let y;

    let tries = 0;

    do {

        x = random(150, WORLD_WIDTH - 150);
        y = random(150, WORLD_HEIGHT - 150);

        tries++;

    } while (
        Math.hypot(
            x - player.x,
            y - player.y
        ) < 500 &&
        tries < 30
    );

    return {

        id: createUID(),

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

        attackCooldown: random(0, 1),

        hitFlash: 0,

        dead: false
    };
}

/* ============================================================
   MANTENER ENEMIGOS
   ============================================================ */

function maintainEnemies() {

    const targetCount = 30;

    if (enemies.length >= targetCount) {
        return;
    }

    const types = [
        "wolf",
        "wolf",
        "wolf",
        "boar",
        "boar",
        "goblin",
        "goblin",
        "orc"
    ];

    while (enemies.length < targetCount) {

        const type = randomChoice(types);

        const enemy =
            createEnemy(type);

        if (enemy) {
            enemies.push(enemy);
        }
    }
}

/* ============================================================
   LOOT
   ============================================================ */

const enemyLootTables = {

    wolf: [

        {
            type: "gold",
            min: 3,
            max: 8,
            chance: 1
        },

        {
            type: "counter",
            key: "wolfFang",
            min: 1,
            max: 2,
            chance: 0.65
        },

        {
            type: "counter",
            key: "leather",
            min: 1,
            max: 2,
            chance: 0.35
        },

        {
            type: "item",
            itemId: "cascoCuero",
            chance: 0.08
        },

        {
            type: "item",
            itemId: "botasCuero",
            chance: 0.07
        },

        {
            type: "item",
            itemId: "espadaAprendiz",
            chance: 0.04
        },

        {
            type: "potion",
            chance: 0.04
        }
    ],

    boar: [

        {
            type: "gold",
            min: 4,
            max: 12,
            chance: 1
        },

        {
            type: "counter",
            key: "meat",
            min: 1,
            max: 3,
            chance: 0.9
        },

        {
            type: "counter",
            key: "leather",
            min: 1,
            max: 2,
            chance: 0.45
        },

        {
            type: "item",
            itemId: "armaduraCuero",
            chance: 0.08
        },

        {
            type: "item",
            itemId: "escudoMadera",
            chance: 0.07
        },

        {
            type: "item",
            itemId: "botasCuero",
            chance: 0.05
        },

        {
            type: "potion",
            chance: 0.05
        }
    ],

    goblin: [

        {
            type: "gold",
            min: 8,
            max: 20,
            chance: 1
        },

        {
            type: "counter",
            key: "goblinEar",
            min: 1,
            max: 2,
            chance: 0.7
        },

        {
            type: "counter",
            key: "iron",
            min: 1,
            max: 2,
            chance: 0.4
        },

        {
            type: "item",
            itemId: "espadaHierro",
            chance: 0.07
        },

        {
            type: "item",
            itemId: "cascoGoblin",
            chance: 0.07
        },

        {
            type: "item",
            itemId: "escudoHierro",
            chance: 0.04
        },

        {
            type: "item",
            itemId: "botasGoblin",
            chance: 0.05
        }
    ],

    orc: [

        {
            type: "gold",
            min: 15,
            max: 40,
            chance: 1
        },

        {
            type: "counter",
            key: "iron",
            min: 1,
            max: 4,
            chance: 0.7
        },

        {
            type: "counter",
            key: "leather",
            min: 1,
            max: 3,
            chance: 0.55
        },

        {
            type: "item",
            itemId: "espadaAcero",
            chance: 0.06
        },

        {
            type: "item",
            itemId: "armaduraHierro",
            chance: 0.06
        },

        {
            type: "item",
            itemId: "escudoHierro",
            chance: 0.07
        },

        {
            type: "item",
            itemId: "cascoGoblin",
            chance: 0.08
        },

        {
            type: "potion",
            chance: 0.12
        }
    ]
};

/* ============================================================
   PROBABILIDAD DE RAREZA
   ============================================================ */

function rollLootRarity(itemId) {

    const roll = Math.random();

    /*
       Equipo de nivel bajo:
       mayormente común.
    */

    if (roll < 0.015) {
        return "legendary";
    }

    if (roll < 0.045) {
        return "epic";
    }

    if (roll < 0.12) {
        return "rare";
    }

    if (roll < 0.28) {
        return "uncommon";
    }

    return itemDefinitions[itemId]?.rarity || "common";
}

/* ============================================================
   PROCESAR LOOT
   ============================================================ */

function processEnemyLoot(type) {

    const table =
        enemyLootTables[type];

    if (!table) return;

    let lootMessage = [];

    for (const loot of table) {

        if (Math.random() > loot.chance) {
            continue;
        }

        if (loot.type === "gold") {

            const amount =
                randomInt(
                    loot.min,
                    loot.max
                );

            inventory.gold += amount;

            lootMessage.push(
                `+${amount} 🪙`
            );
        }

        else if (loot.type === "counter") {

            const amount =
                randomInt(
                    loot.min,
                    loot.max
                );

            inventory[loot.key] =
                safeNumber(
                    inventory[loot.key]
                ) + amount;

            lootMessage.push(
                `+${amount} ${counterName(loot.key)}`
            );
        }

        else if (loot.type === "potion") {

            inventory.potions++;

            lootMessage.push(
                "+1 🧪 Poción"
            );
        }

        else if (loot.type === "item") {

            if (inventoryHasSpace()) {

                const rarity =
                    rollLootRarity(
                        loot.itemId
                    );

                const item =
                    createItem(
                        loot.itemId,
                        rarity
                    );

                if (item) {

                    itemInventory.push(item);

                    lootMessage.push(
                        `${item.icon} ${item.name}`
                    );
                }

            } else {

                showMessage(
                    "🎒 Inventario lleno: objeto perdido"
                );
            }
        }
    }

    if (lootMessage.length > 0) {

        showMessage(
            "🎁 Botín: " +
            lootMessage.join(", ")
        );
    }

    markInventoryDirty();
}

/* ============================================================
   NOMBRES DE RECURSOS
   ============================================================ */

function counterName(key) {

    const names = {

        wood: "Madera",

        stone: "Piedra",

        copper: "Cobre",

        iron: "Hierro",

        fish: "Pez",

        meat: "Carne",

        wolfFang: "Colmillo de lobo",

        goblinEar: "Oreja de goblin",

        leather: "Cuero",

        bait: "Cebo"
    };

    return names[key] || key;
}

/* ============================================================
   RECURSOS
   ============================================================ */

let resources = [];

function createResource(type) {

    let x;
    let y;

    let tries = 0;

    do {

        x = random(100, WORLD_WIDTH - 100);
        y = random(100, WORLD_HEIGHT - 100);

        tries++;

    } while (
        Math.hypot(
            x - respawnPoint.x,
            y - respawnPoint.y
        ) < CITY_RADIUS + 100 &&
        tries < 30
    );

    return {

        id: createUID(),

        type,

        x,
        y,

        radius:
            type === "tree"
                ? 24
                : 20,

        amount:
            randomInt(1, 3),

        respawnTimer: 0
    };
}

function initializeResources() {

    if (resources.length > 0) {
        return;
    }

    const types = [
        "tree",
        "tree",
        "tree",
        "rock",
        "rock",
        "copper",
        "iron"
    ];

    for (let i = 0; i < 300; i++) {

        const type =
            randomChoice(types);

        resources.push(
            createResource(type)
        );
    }
}

/* ============================================================
   RECOLECCIÓN
   ============================================================ */

function gatherResource(resource) {

    if (!resource) return;

    const tool =
        resourceTools[resource.type];

    if (!tool) return;

    if (!tools[tool]?.equipped) {

        showMessage(
            `Necesitas ${tools[tool].name}`
        );

        return;
    }

    const amount =
        resource.amount || 1;

    let name = "";

    if (resource.type === "tree") {

        inventory.wood += amount;

        name = "Madera";
    }

    else if (resource.type === "rock") {

        inventory.stone += amount;

        name = "Piedra";
    }

    else if (resource.type === "copper") {

        inventory.copper += amount;

        name = "Cobre";
    }

    else if (resource.type === "iron") {

        inventory.iron += amount;

        name = "Hierro";
    }

    resource.respawnTimer = 25;

    showMessage(
        `⛏️ +${amount} ${name}`
    );

    updateQuestProgress(
        "gather",
        amount
    );

    markInventoryDirty();

    saveGame();
}

/* ============================================================
   NOMBRES DE TERRENO
   ============================================================ */

function terrainAt(tx, ty) {

    const x = tx * TILE;
    const y = ty * TILE;

    const dx =
        x - respawnPoint.x;

    const dy =
        y - respawnPoint.y;

    const dist =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    /*
       Agua en zonas exteriores.
    */

    const noise =
        Math.sin(tx * 0.73) *
        Math.cos(ty * 0.51);

    if (
        dist > 1500 &&
        noise > 0.45
    ) {
        return TERRAIN.WATER;
    }

    if (noise < -0.65) {
        return TERRAIN.ROCK;
    }

    if (noise > 0.62) {
        return TERRAIN.FOREST;
    }

    if (
        noise > 0.28 &&
        noise <= 0.62
    ) {
        return TERRAIN.SAND;
    }

    return TERRAIN.GRASS;
}

/* ============================================================
   CÁMARA
   ============================================================ */

const camera = {
    x: respawnPoint.x,
    y: respawnPoint.y
};

function updateCamera() {

    if (!canvas) return;

    const halfW =
        canvas.width / 2;

    const halfH =
        canvas.height / 2;

    camera.x =
        clamp(
            player.x,
            halfW,
            WORLD_WIDTH - halfW
        );

    camera.y =
        clamp(
            player.y,
            halfH,
            WORLD_HEIGHT - halfH
        );
}

/* ============================================================
   JOYSTICK
   ============================================================ */

let joyX = 0;
let joyY = 0;

let joystickPointerId = null;

function setupJoystick() {

    const joystick =
        document.getElementById("joystick");

    if (!joystick) return;

    function updateJoystick(clientX, clientY) {

        const rect =
            joystick.getBoundingClientRect();

        const centerX =
            rect.left + rect.width / 2;

        const centerY =
            rect.top + rect.height / 2;

        let dx =
            clientX - centerX;

        let dy =
            clientY - centerY;

        const radius =
            Math.min(
                rect.width,
                rect.height
            ) / 2;

        const len =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (len > radius) {

            dx =
                dx / len * radius;

            dy =
                dy / len * radius;
        }

        joyX =
            clamp(
                dx / radius,
                -1,
                1
            );

        joyY =
            clamp(
                dy / radius,
                -1,
                1
            );

        const knob =
            joystick.querySelector(
                ".joystick-knob"
            ) ||
            joystick.querySelector(
                ".stick"
            );

        if (knob) {

            knob.style.transform =
                `translate(${dx}px, ${dy}px)`;
        }
    }

    joystick.addEventListener(
        "pointerdown",
        event => {

            joystickPointerId =
                event.pointerId;

            try {
                joystick.setPointerCapture(
                    event.pointerId
                );
            } catch (_) {}

            updateJoystick(
                event.clientX,
                event.clientY
            );
        }
    );

    joystick.addEventListener(
        "pointermove",
        event => {

            if (
                joystickPointerId !==
                event.pointerId
            ) {
                return;
            }

            updateJoystick(
                event.clientX,
                event.clientY
            );
        }
    );

    function releaseJoystick(event) {

        if (
            joystickPointerId !==
            event.pointerId
        ) {
            return;
        }

        joystickPointerId = null;

        joyX = 0;
        joyY = 0;

        const knob =
            joystick.querySelector(
                ".joystick-knob"
            ) ||
            joystick.querySelector(
                ".stick"
            );

        if (knob) {
            knob.style.transform =
                "translate(0px, 0px)";
        }
    }

    joystick.addEventListener(
        "pointerup",
        releaseJoystick
    );

    joystick.addEventListener(
        "pointercancel",
        releaseJoystick
    );
}

/* ============================================================
   TECLADO
   ============================================================ */

const keys = {};

window.addEventListener(
    "keydown",
    event => {

        keys[event.key.toLowerCase()] = true;

        if (
            event.key.toLowerCase() === "e"
        ) {
            interact();
        }

        if (
            event.key.toLowerCase() === "p"
        ) {
            usePotion();
        }

        if (
            event.key === " "
        ) {
            event.preventDefault();
            attack();
        }
    }
);

window.addEventListener(
    "keyup",
    event => {

        keys[event.key.toLowerCase()] = false;
    }
);

/* ============================================================
   MOVIMIENTO
   ============================================================ */

function updateMovement(dt) {

    if (player.dead) return;

    let x = joyX;
    let y = joyY;

    if (keys["w"] || keys["arrowup"]) {
        y -= 1;
    }

    if (keys["s"] || keys["arrowdown"]) {
        y += 1;
    }

    if (keys["a"] || keys["arrowleft"]) {
        x -= 1;
    }

    if (keys["d"] || keys["arrowright"]) {
        x += 1;
    }

    const dir =
        normalize(x, y);

    if (
        Math.abs(dir.x) > 0 ||
        Math.abs(dir.y) > 0
    ) {

        player.directionX = dir.x;
        player.directionY = dir.y;

        player.x +=
            dir.x *
            player.speed *
            dt;

        player.y +=
            dir.y *
            player.speed *
            dt;
    }

    player.x =
        clamp(
            player.x,
            player.radius,
            WORLD_WIDTH - player.radius
        );

    player.y =
        clamp(
            player.y,
            player.radius,
            WORLD_HEIGHT - player.radius
        );
}

/* ============================================================
   ATAQUE
   ============================================================ */

function attack() {

    if (player.dead) return;

    if (player.attackCooldown > 0) {
        return;
    }

    player.attackCooldown =
        player.attackDelay;

    player.attackAnimation = 0.18;

    let closest = null;
    let closestDistance = Infinity;

    for (const enemy of enemies) {

        if (enemy.dead) continue;

        const d =
            distance(
                player,
                enemy
            );

        if (
            d <= player.attackRange &&
            d < closestDistance
        ) {

            closest = enemy;
            closestDistance = d;
        }
    }

    if (!closest) {

        showMessage("⚔️");

        return;
    }

    const damage =
        Math.max(
            1,
            Math.round(
                player.damage *
                random(0.85, 1.15)
            )
        );

    closest.hp -= damage;
    closest.hitFlash = 0.12;

    addFloatingText(
        closest.x,
        closest.y - 35,
        `-${damage}`,
        "#ff5d5d"
    );

    if (closest.hp <= 0) {

        killEnemy(closest);
    }
}

/* ============================================================
   MATAR ENEMIGO
   ============================================================ */

function killEnemy(enemy) {

    if (enemy.dead) return;

    enemy.dead = true;

    player.kills++;

    inventory.gold +=
        enemy.gold;

    gainXP(enemy.xp);

    processEnemyLoot(
        enemy.type
    );

    updateQuestProgress(
        "kill",
        1
    );

    updateQuestProgress(
        "kill_" + enemy.type,
        1
    );

    addFloatingText(
        enemy.x,
        enemy.y - 40,
        `+${enemy.xp} XP`,
        "#ffe16b"
    );

    setTimeout(
        () => {

            const index =
                enemies.indexOf(enemy);

            if (index !== -1) {
                enemies.splice(
                    index,
                    1
                );
            }

        },
        100
    );

    markInventoryDirty();

    saveGame();
}

/* ============================================================
   EXPERIENCIA
   ============================================================ */

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
            100 *
            Math.pow(
                1.25,
                player.level - 1
            )
        );

    player.maxHp += 15;
    player.maxMana += 5;

    player.hp =
        player.maxHp;

    player.mana =
        player.maxMana;

    showMessage(
        `🎉 ¡NIVEL ${player.level}!`
    );

    addFloatingText(
        player.x,
        player.y - 55,
        `NIVEL ${player.level}`,
        "#ffe76a"
    );

    unlockSkills();

    saveGame();
}

/* ============================================================
   HABILIDADES
   ============================================================ */

const skills = [

    {
        id: "golpePoderoso",
        name: "Golpe Poderoso",
        level: 2,
        mana: 10,
        cooldown: 4
    },

    {
        id: "curacion",
        name: "Curación",
        level: 3,
        mana: 15,
        cooldown: 8
    },

    {
        id: "torbellino",
        name: "Torbellino",
        level: 5,
        mana: 20,
        cooldown: 8
    },

    {
        id: "furia",
        name: "Furia",
        level: 8,
        mana: 20,
        cooldown: 15
    },

    {
        id: "ejecucion",
        name: "Ejecución",
        level: 10,
        mana: 30,
        cooldown: 15
    },

    {
        id: "lluviaEspadas",
        name: "Lluvia de Espadas",
        level: 15,
        mana: 40,
        cooldown: 20
    },

    {
        id: "iraCeniza",
        name: "Ira de Ceniza",
        level: 20,
        mana: 50,
        cooldown: 30
    }
];

const skillCooldowns = {};

function unlockSkills() {

    for (const skill of skills) {

        if (
            player.level >= skill.level &&
            !skillCooldowns[skill.id]
        ) {

            skillCooldowns[skill.id] = 0;

            if (
                player.level ===
                skill.level
            ) {

                showMessage(
                    `✨ Nueva habilidad: ${skill.name}`
                );
            }
        }
    }
}

/* ============================================================
   USAR HABILIDAD
   ============================================================ */

function useSkill(skillId) {

    if (player.dead) return;

    const skill =
        skills.find(
            s => s.id === skillId
        );

    if (!skill) return;

    if (
        player.level <
        skill.level
    ) {

        showMessage(
            `🔒 Nivel ${skill.level} requerido`
        );

        return;
    }

    const cooldown =
        skillCooldowns[skill.id] || 0;

    if (cooldown > 0) {

        showMessage(
            `⏳ ${cooldown.toFixed(1)}s`
        );

        return;
    }

    if (
        player.mana <
        skill.mana
    ) {

        showMessage(
            "💧 No tienes suficiente maná"
        );

        return;
    }

    player.mana -=
        skill.mana;

    skillCooldowns[skill.id] =
        skill.cooldown;

    player.skillAnimation =
        0.4;

    if (skill.id === "golpePoderoso") {

        damageClosestEnemy(
            player.damage * 2.2
        );
    }

    else if (skill.id === "curacion") {

        player.hp =
            Math.min(
                player.maxHp,
                player.hp + 45
            );

        addFloatingText(
            player.x,
            player.y - 50,
            "+45 HP",
            "#63ff82"
        );
    }

    else if (skill.id === "torbellino") {

        damageArea(
            170,
            player.damage * 1.5
        );
    }

    else if (skill.id === "furia") {

        player.rageTimer = 12;

        showMessage(
            "🔥 ¡Furia activada!"
        );
    }

    else if (skill.id === "ejecucion") {

        damageClosestEnemy(
            player.damage * 3.2
        );
    }

    else if (
        skill.id === "lluviaEspadas"
    ) {

        damageArea(
            280,
            player.damage * 2
        );
    }

    else if (
        skill.id === "iraCeniza"
    ) {

        damageArea(
            420,
            player.damage * 3
        );
    }

    saveGame();
}

/* ============================================================
   DAÑO ENEMIGO CERCANO
   ============================================================ */

function damageClosestEnemy(amount) {

    let closest = null;
    let closestDistance = Infinity;

    for (const enemy of enemies) {

        if (enemy.dead) continue;

        const d =
            distance(
                player,
                enemy
            );

        if (
            d <=
            player.attackRange * 1.8 &&
            d < closestDistance
        ) {

            closest =
                enemy;

            closestDistance =
                d;
        }
    }

    if (!closest) {

        showMessage(
            "No hay enemigos cerca"
        );

        return;
    }

    let finalDamage =
        Math.round(amount);

    if (player.rageTimer > 0) {
        finalDamage *= 2;
    }

    closest.hp -=
        finalDamage;

    closest.hitFlash =
        0.25;

    addFloatingText(
        closest.x,
        closest.y - 40,
        `-${finalDamage}`,
        "#ffb347"
    );

    if (closest.hp <= 0) {
        killEnemy(closest);
    }
}

/* ============================================================
   DAÑO DE ÁREA
   ============================================================ */

function damageArea(radius, amount) {

    let hits = 0;

    for (const enemy of enemies) {

        if (enemy.dead) continue;

        if (
            distance(
                player,
                enemy
            ) <= radius
        ) {

            let finalDamage =
                Math.round(amount);

            if (player.rageTimer > 0) {
                finalDamage *= 2;
            }

            enemy.hp -=
                finalDamage;

            enemy.hitFlash =
                0.2;

            addFloatingText(
                enemy.x,
                enemy.y - 40,
                `-${finalDamage}`,
                "#ff8d4d"
            );

            hits++;

            if (enemy.hp <= 0) {
                killEnemy(enemy);
            }
        }
    }

    if (hits === 0) {
        showMessage(
            "No hay enemigos en el área"
        );
    }
}

/* ============================================================
   POCIONES
   ============================================================ */

function usePotion() {

    if (
        inventory.potions <= 0
    ) {

        showMessage(
            "🧪 No tienes pociones"
        );

        return;
    }

    if (
        player.hp >=
        player.maxHp
    ) {

        showMessage(
            "❤️ Tu vida ya está llena"
        );

        return;
    }

    inventory.potions--;

    const amount = 50;

    player.hp =
        Math.min(
            player.maxHp,
            player.hp + amount
        );

    addFloatingText(
        player.x,
        player.y - 50,
        `+${amount} HP`,
        "#66ff80"
    );

    markInventoryDirty();

    saveGame();
}

/* ============================================================
   ACTUALIZAR JUGADOR
   ============================================================ */

function updatePlayer(dt) {

    if (
        player.attackCooldown > 0
    ) {
        player.attackCooldown -= dt;
    }

    if (
        player.attackAnimation > 0
    ) {
        player.attackAnimation -= dt;
    }

    if (
        player.skillAnimation > 0
    ) {
        player.skillAnimation -= dt;
    }

    if (
        player.rageTimer > 0
    ) {
        player.rageTimer -= dt;
    }

    for (const skill of skills) {

        if (
            skillCooldowns[skill.id] > 0
        ) {

            skillCooldowns[skill.id] =
                Math.max(
                    0,
                    skillCooldowns[skill.id] - dt
                );
        }
    }

    /*
       Regeneración suave de maná.
    */

    player.mana =
        Math.min(
            player.maxMana,
            player.mana +
            dt * 2
        );
}

/* ============================================================
   ACTUALIZAR ENEMIGOS
   ============================================================ */

function updateEnemies(dt) {

    for (const enemy of enemies) {

        if (enemy.dead) continue;

        if (
            enemy.hitFlash > 0
        ) {
            enemy.hitFlash -= dt;
        }

        const d =
            distance(
                enemy,
                player
            );

        if (
            d < 650 &&
            d > player.radius + enemy.radius
        ) {

            const dir =
                normalize(
                    player.x - enemy.x,
                    player.y - enemy.y
                );

            enemy.x +=
                dir.x *
                enemy.speed *
                dt;

            enemy.y +=
                dir.y *
                enemy.speed *
                dt;
        }

        enemy.attackCooldown -= dt;

        if (
            d <=
            player.radius +
            enemy.radius +
            8 &&
            enemy.attackCooldown <= 0
        ) {

            enemy.attackCooldown =
                1.1;

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
                player.y - 40,
                `-${damage}`,
                "#ff5252"
            );

            if (
                player.hp <= 0
            ) {

                player.hp = 0;

                player.dead = true;

                player.respawnTimer = 4;

                showMessage(
                    "💀 Has muerto"
                );
            }
        }

        enemy.x =
            clamp(
                enemy.x,
                enemy.radius,
                WORLD_WIDTH - enemy.radius
            );

        enemy.y =
            clamp(
                enemy.y,
                enemy.radius,
                WORLD_HEIGHT - enemy.radius
            );
    }
}

/* ============================================================
   MUERTE
   ============================================================ */

function updateDeath(dt) {

    if (!player.dead) {
        return;
    }

    player.respawnTimer -= dt;

    if (
        player.respawnTimer <= 0
    ) {

        player.dead = false;

        player.hp =
            player.maxHp;

        player.mana =
            player.maxMana;

        player.x =
            respawnPoint.x;

        player.y =
            respawnPoint.y;

        showMessage(
            "✨ Has regresado a la ciudad"
        );
    }
}

/* ============================================================
   ACTUALIZAR RECURSOS
   ============================================================ */

function updateResources(dt) {

    for (const resource of resources) {

        if (
            resource.respawnTimer > 0
        ) {

            resource.respawnTimer -= dt;

            if (
                resource.respawnTimer <= 0
            ) {

                resource.amount =
                    randomInt(1, 3);

                resource.respawnTimer = 0;
            }
        }
    }
}

/* ============================================================
   INTERACCIÓN
   ============================================================ */

function interact() {

    /*
       Recolección cercana.
    */

    for (const resource of resources) {

        if (
            resource.respawnTimer <= 0 &&
            distance(
                player,
                resource
            ) <= 65
        ) {

            gatherResource(
                resource
            );

            return;
        }
    }

    /*
       NPC.
    */

    const npc =
        getNearbyNPC();

    if (npc) {

        interactNPC(npc);

        return;
    }
}

/* ============================================================
   NPC
   ============================================================ */

const npcs = [

    {
        id: "guardian",
        name: "Guardián de Ceniza",
        x: respawnPoint.x,
        y: respawnPoint.y - 170,
        color: "#d8d8d8"
    },

    {
        id: "blacksmith",
        name: "Herrero Aldric",
        x: respawnPoint.x + 170,
        y: respawnPoint.y + 30,
        color: "#ff8b45"
    },

    {
        id: "merchant",
        name: "Mercader Lina",
        x: respawnPoint.x - 170,
        y: respawnPoint.y + 30,
        color: "#ffd45c"
    },

    {
        id: "master",
        name: "Maestro Rokan",
        x: respawnPoint.x,
        y: respawnPoint.y + 170,
        color: "#8db8ff"
    }
];

function getNearbyNPC() {

    for (const npc of npcs) {

        if (
            distance(
                player,
                npc
            ) <= 90
        ) {

            return npc;
        }
    }

    return null;
}

/* ============================================================
   NPC INTERACCIÓN
   ============================================================ */

function interactNPC(npc) {

    if (npc.id === "blacksmith") {

        openBlacksmith();

        return;
    }

    if (npc.id === "merchant") {

        showMessage(
            "🛒 Mercader Lina: ¡Bienvenido!"
        );

        return;
    }

    if (npc.id === "guardian") {

        showMessage(
            "🛡️ Guardián: Protege la ciudad."
        );

        return;
    }

    if (npc.id === "master") {

        showMessage(
            `✨ Maestro Rokan: Nivel ${player.level}`
        );

        return;
    }
}

/* ============================================================
   HERRERO
   ============================================================ */

function openBlacksmith() {

    let panel =
        document.getElementById(
            "blacksmithPanel"
        );

    if (!panel) {

        panel =
            document.createElement("div");

        panel.id =
            "blacksmithPanel";

        Object.assign(
            panel.style,
            {
                position: "fixed",
                left: "50%",
                top: "50%",
                transform:
                    "translate(-50%,-50%)",
                width:
                    "min(90vw,380px)",
                background:
                    "rgba(20,15,12,.97)",
                border:
                    "2px solid #b27a38",
                borderRadius:
                    "15px",
                padding:
                    "18px",
                zIndex:
                    "99998",
                color:
                    "white",
                textAlign:
                    "center"
            }
        );

        document.body.appendChild(
            panel
        );
    }

    panel.innerHTML = `

        <h2>🔨 Herrero Aldric</h2>

        <p>
            Mejorar espada
        </p>

        <p>
            🪙 100 monedas
            <br>
            ⛏️ 5 Hierro
        </p>

        <button
            id="upgradeSwordButton"
            style="
                width:100%;
                padding:12px;
                margin-top:10px;
                border:0;
                border-radius:10px;
                background:#9b6d2d;
                color:white;
                font-weight:bold;
            "
        >
            MEJORAR ESPADA
        </button>

        <button
            id="closeBlacksmithButton"
            style="
                width:100%;
                padding:12px;
                margin-top:8px;
                border:0;
                border-radius:10px;
                background:#333;
                color:white;
            "
        >
            CERRAR
        </button>
    `;

    panel.style.display = "block";

    const upgrade =
        document.getElementById(
            "upgradeSwordButton"
        );

    const close =
        document.getElementById(
            "closeBlacksmithButton"
        );

    if (upgrade) {

        upgrade.onclick =
            upgradeSword;
    }

    if (close) {

        close.onclick = () => {

            panel.style.display =
                "none";
        };
    }
}

function upgradeSword() {

    if (
        inventory.gold < 100
    ) {

        showMessage(
            "❌ Necesitas 100 monedas"
        );

        return;
    }

    if (
        inventory.iron < 5
    ) {

        showMessage(
            "❌ Necesitas 5 Hierro"
        );

        return;
    }

    inventory.gold -= 100;
    inventory.iron -= 5;

    player.baseDamage += 5;

    recalculatePlayerStats();

    showMessage(
        "⚔️ ¡Espada mejorada!"
    );

    saveGame();
}

/* ============================================================
   MISIONES
   ============================================================ */

const quests = [

    {
        id: "primerosPasos",
        name: "Primeros pasos",
        description: "Derrota 3 enemigos.",
        type: "kill",
        target: 3,
        progress: 0,
        rewardGold: 100,
        rewardXP: 50,
        completed: false,
        claimed: false
    },

    {
        id: "lobos",
        name: "Amenaza de los lobos",
        description: "Derrota 5 lobos.",
        type: "kill_wolf",
        target: 5,
        progress: 0,
        rewardGold: 200,
        rewardXP: 100,
        completed: false,
        claimed: false
    },

    {
        id: "recursos",
        name: "Recursos para la ciudad",
        description: "Recolecta 10 recursos.",
        type: "gather",
        target: 10,
        progress: 0,
        rewardGold: 150,
        rewardXP: 75,
        completed: false,
        claimed: false
    }
];

/* ============================================================
   PROGRESO MISIONES
   ============================================================ */

function updateQuestProgress(
    type,
    amount
) {

    for (const quest of quests) {

        if (
            quest.completed ||
            quest.claimed
        ) {
            continue;
        }

        if (
            quest.type === type
        ) {

            quest.progress =
                Math.min(
                    quest.target,
                    quest.progress + amount
                );

            if (
                quest.progress >=
                quest.target
            ) {

                quest.completed = true;

                showMessage(
                    `📜 Misión completada: ${quest.name}`
                );
            }
        }
    }
}

/* ============================================================
   RECOMPENSA MISIÓN
   ============================================================ */

function claimQuest(questId) {

    const quest =
        quests.find(
            q => q.id === questId
        );

    if (!quest) return;

    if (
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
        `🎁 Recompensa: ${quest.rewardGold} monedas`
    );

    markInventoryDirty();

    saveGame();
}

/* ============================================================
   TEXTOS FLOTANTES
   ============================================================ */

let floatingTexts = [];

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

    for (const item of floatingTexts) {

        item.y -=
            35 * dt;

        item.life -=
            dt;
    }

    floatingTexts =
        floatingTexts.filter(
            item => item.life > 0
        );
}

/* ============================================================
   MENSAJES
   ============================================================ */

let messageText = "";
let messageTimer = 0;

function showMessage(message) {

    messageText = message;
    messageTimer = 2.4;
}

function updateMessage(dt) {

    if (
        messageTimer > 0
    ) {

        messageTimer -= dt;

        if (
            messageTimer <= 0
        ) {

            messageText = "";
        }
    }
}

/* ============================================================
   DIBUJO DEL TERRENO
   ============================================================ */

function drawTerrain() {

    if (!ctx || !canvas) return;

    const startX =
        Math.floor(
            (camera.x -
                canvas.width / 2) /
            TILE
        ) - 1;

    const endX =
        Math.ceil(
            (camera.x +
                canvas.width / 2) /
            TILE
        ) + 1;

    const startY =
        Math.floor(
            (camera.y -
                canvas.height / 2) /
            TILE
        ) - 1;

    const endY =
        Math.ceil(
            (camera.y +
                canvas.height / 2) /
            TILE
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

            const terrain =
                terrainAt(
                    tx,
                    ty
                );

            let color =
                "#315b35";

            if (
                terrain === TERRAIN.WATER
            ) {

                color =
                    "#245b7a";
            }

            else if (
                terrain === TERRAIN.SAND
            ) {

                color =
                    "#b99a62";
            }

            else if (
                terrain === TERRAIN.FOREST
            ) {

                color =
                    "#24462c";
            }

            else if (
                terrain === TERRAIN.ROCK
            ) {

                color =
                    "#555a60";
            }

            const sx =
                tx * TILE -
                camera.x +
                canvas.width / 2;

            const sy =
                ty * TILE -
                camera.y +
                canvas.height / 2;

            ctx.fillStyle = color;

            ctx.fillRect(
                sx,
                sy,
                TILE + 1,
                TILE + 1
            );

            /*
               Detalles del terreno.
            */

            const seed =
                Math.sin(
                    tx * 12.9898 +
                    ty * 78.233
                ) *
                43758.5453;

            const frac =
                seed -
                Math.floor(seed);

            if (
                terrain === TERRAIN.GRASS &&
                frac > 0.65
            ) {

                ctx.fillStyle =
                    "rgba(120,170,90,.22)";

                ctx.fillRect(
                    sx + 15,
                    sy + 18,
                    3,
                    12
                );

                ctx.fillRect(
                    sx + 21,
                    sy + 12,
                    3,
                    16
                );
            }

            if (
                terrain === TERRAIN.WATER
            ) {

                ctx.strokeStyle =
                    "rgba(160,220,255,.18)";

                ctx.lineWidth = 2;

                ctx.beginPath();

                ctx.moveTo(
                    sx + 8,
                    sy + 25
                );

                ctx.lineTo(
                    sx + 35,
                    sy + 25
                );

                ctx.stroke();
            }
        }
    }
}

/* ============================================================
   CIUDAD
   ============================================================ */

function drawCity() {

    if (!ctx || !canvas) return;

    const sx =
        respawnPoint.x -
        camera.x +
        canvas.width / 2;

    const sy =
        respawnPoint.y -
        camera.y +
        canvas.height / 2;

    /*
       Plaza.
    */

    ctx.beginPath();

    ctx.arc(
        sx,
        sy,
        250,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#8d7654";

    ctx.fill();

    /*
       Camino.
    */

    ctx.strokeStyle =
        "#c4a26a";

    ctx.lineWidth = 90;

    ctx.beginPath();

    ctx.moveTo(
        sx - 600,
        sy
    );

    ctx.lineTo(
        sx + 600,
        sy
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        sx,
        sy - 600
    );

    ctx.lineTo(
        sx,
        sy + 600
    );

    ctx.stroke();

    /*
       Fuente.
    */

    ctx.beginPath();

    ctx.arc(
        sx,
        sy,
        55,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#4f687a";

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        sx,
        sy,
        38,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#3f88aa";

    ctx.fill();

    /*
       Casas.
    */

    drawHouse(
        sx - 270,
        sy - 230
    );

    drawHouse(
        sx + 270,
        sy - 230
    );

    drawHouse(
        sx - 270,
        sy + 230
    );

    drawHouse(
        sx + 270,
        sy + 230
    );

    /*
       Bandera.
    */

    ctx.strokeStyle =
        "#35251a";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
        sx,
        sy - 120
    );

    ctx.lineTo(
        sx,
        sy - 190
    );

    ctx.stroke();

    ctx.fillStyle =
        "#b62d2d";

    ctx.beginPath();

    ctx.moveTo(
        sx,
        sy - 188
    );

    ctx.lineTo(
        sx + 55,
        sy - 172
    );

    ctx.lineTo(
        sx,
        sy - 156
    );

    ctx.closePath();

    ctx.fill();
}

function drawHouse(x, y) {

    ctx.fillStyle =
        "#6c4b35";

    ctx.fillRect(
        x - 55,
        y - 45,
        110,
        90
    );

    ctx.fillStyle =
        "#39261f";

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

    ctx.fillStyle =
        "#263d4a";

    ctx.fillRect(
        x - 16,
        y - 2,
        32,
        47
    );
}

/* ============================================================
   RECURSOS
   ============================================================ */

function drawResources() {

    if (!ctx || !canvas) return;

    for (const resource of resources) {

        if (
            resource.respawnTimer > 0
        ) {
            continue;
        }

        const sx =
            resource.x -
            camera.x +
            canvas.width / 2;

        const sy =
            resource.y -
            camera.y +
            canvas.height / 2;

        if (
            sx < -80 ||
            sx > canvas.width + 80 ||
            sy < -80 ||
            sy > canvas.height + 80
        ) {
            continue;
        }

        if (
            resource.type === "tree"
        ) {

            ctx.fillStyle =
                "#5a3823";

            ctx.fillRect(
                sx - 6,
                sy - 5,
                12,
                35
            );

            ctx.fillStyle =
                "#2c6d35";

            ctx.beginPath();

            ctx.arc(
                sx,
                sy - 25,
                28,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        else if (
            resource.type === "rock"
        ) {

            ctx.fillStyle =
                "#777b80";

            ctx.beginPath();

            ctx.moveTo(
                sx - 22,
                sy + 12
            );

            ctx.lineTo(
                sx - 15,
                sy - 16
            );

            ctx.lineTo(
                sx + 10,
                sy - 23
            );

            ctx.lineTo(
                sx + 25,
                sy
            );

            ctx.lineTo(
                sx + 12,
                sy + 20
            );

            ctx.closePath();

            ctx.fill();
        }

        else if (
            resource.type === "copper"
        ) {

            ctx.fillStyle =
                "#b86a3b";

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
                "#e2a071";

            ctx.fillRect(
                sx - 5,
                sy - 8,
                7,
                14
            );
        }

        else if (
            resource.type === "iron"
        ) {

            ctx.fillStyle =
                "#a6adb5";

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
                "#e7edf2";

            ctx.fillRect(
                sx - 7,
                sy - 9,
                8,
                14
            );
        }
    }
}

/* ============================================================
   NPCs
   ============================================================ */

function drawNPCs() {

    if (!ctx || !canvas) return;

    for (const npc of npcs) {

        const sx =
            npc.x -
            camera.x +
            canvas.width / 2;

        const sy =
            npc.y -
            camera.y +
            canvas.height / 2;

        ctx.fillStyle =
            npc.color;

        ctx.beginPath();

        ctx.arc(
            sx,
            sy,
            18,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#222";

        ctx.font =
            "bold 12px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            npc.name,
            sx,
            sy - 28
        );

        ctx.textAlign =
            "left";
    }
}

/* ============================================================
   ENEMIGOS
   ============================================================ */

function drawEnemies() {

    if (!ctx || !canvas) return;

    for (const enemy of enemies) {

        if (enemy.dead) continue;

        const sx =
            enemy.x -
            camera.x +
            canvas.width / 2;

        const sy =
            enemy.y -
            camera.y +
            canvas.height / 2;

        if (
            sx < -100 ||
            sx > canvas.width + 100 ||
            sy < -100 ||
            sy > canvas.height + 100
        ) {
            continue;
        }

        let color =
            "#8c8c8c";

        if (
            enemy.type === "wolf"
        ) {
            color = "#777b80";
        }

        else if (
            enemy.type === "boar"
        ) {
            color = "#76503c";
        }

        else if (
            enemy.type === "goblin"
        ) {
            color = "#4e9b4e";
        }

        else if (
            enemy.type === "orc"
        ) {
            color = "#70483c";
        }

        if (
            enemy.hitFlash > 0
        ) {
            color = "#ffffff";
        }

        ctx.fillStyle =
            color;

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
           Ojos.
        */

        ctx.fillStyle =
            "#111";

        ctx.beginPath();

        ctx.arc(
            sx - 7,
            sy - 4,
            3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            sx + 7,
            sy - 4,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /*
           Barra de vida.
        */

        const barWidth =
            enemy.radius * 2;

        ctx.fillStyle =
            "rgba(0,0,0,.65)";

        ctx.fillRect(
            sx - barWidth / 2,
            sy - enemy.radius - 12,
            barWidth,
            5
        );

        ctx.fillStyle =
            "#e84949";

        ctx.fillRect(
            sx - barWidth / 2,
            sy - enemy.radius - 12,
            barWidth *
                clamp(
                    enemy.hp /
                    enemy.maxHp,
                    0,
                    1
                ),
            5
        );
    }
}

/* ============================================================
   JUGADOR
   ============================================================ */

function drawPlayer() {

    if (!ctx || !canvas) return;

    const sx =
        player.x -
        camera.x +
        canvas.width / 2;

    const sy =
        player.y -
        camera.y +
        canvas.height / 2;

    /*
       Sombra.
    */

    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.beginPath();

    ctx.ellipse(
        sx,
        sy + 18,
        25,
        10,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       Cuerpo.
    */

    ctx.fillStyle =
        "#344c69";

    ctx.beginPath();

    ctx.arc(
        sx,
        sy,
        21,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       Armadura.
    */

    ctx.strokeStyle =
        "#d3d8df";

    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.arc(
        sx,
        sy - 4,
        13,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    /*
       Cabeza.
    */

    ctx.fillStyle =
        "#d2a07c";

    ctx.beginPath();

    ctx.arc(
        sx,
        sy - 18,
        10,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       Casco.
    */

    ctx.fillStyle =
        "#626c79";

    ctx.beginPath();

    ctx.arc(
        sx,
        sy - 21,
        12,
        Math.PI,
        0
    );

    ctx.fill();

    /*
       Espada.
    */

    let dx =
        player.directionX;

    let dy =
        player.directionY;

    if (
        Math.abs(dx) +
        Math.abs(dy) < 0.1
    ) {

        dx = 0;
        dy = 1;
    }

    const swordX =
        sx +
        dx * 32;

    const swordY =
        sy +
        dy * 32;

    ctx.strokeStyle =
        "#e7e9ee";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
        sx + dx * 12,
        sy + dy * 12
    );

    ctx.lineTo(
        swordX,
        swordY
    );

    ctx.stroke();

    ctx.strokeStyle =
        "#a8793c";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        sx + dx * 5 - dy * 8,
        sy + dy * 5 + dx * 8
    );

    ctx.lineTo(
        sx + dx * 5 + dy * 8,
        sy + dy * 5 - dx * 8
    );

    ctx.stroke();

    /*
       Ataque.
    */

    if (
        player.attackAnimation > 0
    ) {

        ctx.strokeStyle =
            "rgba(255,255,255,.75)";

        ctx.lineWidth = 5;

        ctx.beginPath();

        ctx.arc(
            sx,
            sy,
            65,
            -1.2,
            1.2
        );

        ctx.stroke();
    }

    /*
       Furia.
    */

    if (
        player.rageTimer > 0
    ) {

        ctx.strokeStyle =
            "rgba(255,100,30,.8)";

        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.arc(
            sx,
            sy,
            32 +
            Math.sin(
                performance.now() / 100
            ) * 4,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }
}

/* ============================================================
   FLOATING TEXT
   ============================================================ */

function drawFloatingTexts() {

    if (!ctx || !canvas) return;

    ctx.font =
        "bold 15px Arial";

    ctx.textAlign =
        "center";

    for (const item of floatingTexts) {

        const sx =
            item.x -
            camera.x +
            canvas.width / 2;

        const sy =
            item.y -
            camera.y +
            canvas.height / 2;

        ctx.globalAlpha =
            clamp(
                item.life,
                0,
                1
            );

        ctx.fillStyle =
            item.color;

        ctx.fillText(
            item.text,
            sx,
            sy
        );
    }

    ctx.globalAlpha = 1;

    ctx.textAlign =
        "left";
}

/* ============================================================
   MINIMAPA
   ============================================================ */

function drawMinimap() {

    if (!miniCtx || !miniCanvas) {
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
        "#25352a";

    miniCtx.fillRect(
        0,
        0,
        w,
        h
    );

    const sx =
        w / WORLD_WIDTH;

    const sy =
        h / WORLD_HEIGHT;

    /*
       Recursos.
    */

    for (const resource of resources) {

        if (
            resource.respawnTimer > 0
        ) {
            continue;
        }

        let color =
            "#4c9c54";

        if (
            resource.type === "iron"
        ) {
            color = "#b5b8bf";
        }

        else if (
            resource.type === "copper"
        ) {
            color = "#b76e45";
        }

        else if (
            resource.type === "rock"
        ) {
            color = "#777";
        }

        miniCtx.fillStyle =
            color;

        miniCtx.fillRect(
            resource.x * sx,
            resource.y * sy,
            2,
            2
        );
    }

    /*
       Enemigos.
    */

    miniCtx.fillStyle =
        "#e94b4b";

    for (const enemy of enemies) {

        if (enemy.dead) continue;

        miniCtx.fillRect(
            enemy.x * sx,
            enemy.y * sy,
            3,
            3
        );
    }

    /*
       Ciudad.
    */

    miniCtx.fillStyle =
        "#d0a654";

    miniCtx.beginPath();

    miniCtx.arc(
        respawnPoint.x * sx,
        respawnPoint.y * sy,
        CITY_RADIUS * sx,
        0,
        Math.PI * 2
    );

    miniCtx.fill();

    /*
       Jugador.
    */

    miniCtx.fillStyle =
        "#ffffff";

    miniCtx.beginPath();

    miniCtx.arc(
        player.x * sx,
        player.y * sy,
        4,
        0,
        Math.PI * 2
    );

    miniCtx.fill();
}

/* ============================================================
   HUD
   ============================================================ */

function setTextByIds(
    ids,
    value
) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent =
                value;

            return;
        }
    }
}

function setBarByIds(
    ids,
    percent
) {

    const value =
        clamp(
            percent,
            0,
            1
        ) * 100;

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {

            element.style.width =
                `${value}%`;

            return;
        }
    }
}

/* ============================================================
   ACTUALIZAR HUD
   ============================================================ */

function updateUI() {

    setTextByIds(
        [
            "levelText",
            "playerLevel",
            "level"
        ],
        `Nivel ${player.level}`
    );

    setTextByIds(
        [
            "goldText",
            "gold",
            "playerGold"
        ],
        `🪙 ${formatNumber(inventory.gold)}`
    );

    setTextByIds(
        [
            "hpText",
            "playerHp"
        ],
        `${Math.ceil(player.hp)} / ${player.maxHp}`
    );

    setTextByIds(
        [
            "manaText",
            "playerMana"
        ],
        `${Math.ceil(player.mana)} / ${player.maxMana}`
    );

    setTextByIds(
        [
            "xpText",
            "playerXP"
        ],
        `${Math.floor(player.xp)} / ${player.xpNeeded}`
    );

    setBarByIds(
        [
            "hpBar",
            "healthBar",
            "playerHpBar"
        ],
        player.hp /
        player.maxHp
    );

    setBarByIds(
        [
            "manaBar",
            "playerManaBar"
        ],
        player.mana /
        player.maxMana
    );

    setBarByIds(
        [
            "xpBar",
            "experienceBar",
            "playerXpBar"
        ],
        player.xp /
        player.xpNeeded
    );

    /*
       Inventario:
       Solo se reconstruye cuando cambió.
    */

    const panel =
        getInventoryPanel();

    if (
        panel &&
        panel.style.display !== "none" &&
        inventoryDirty
    ) {

        renderInventoryPanel();
    }

    /*
       Mensaje.
    */

    setTextByIds(
        [
            "messageText",
            "gameMessage",
            "notification"
        ],
        messageText
    );
}

/* ============================================================
   BOTÓN DE ATAQUE
   ============================================================ */

function setupAttackButton() {

    const candidates = [
        "attackButton",
        "attackBtn",
        "btnAttack",
        "attack"
    ];

    let button = null;

    for (const id of candidates) {

        const el =
            document.getElementById(id);

        if (el) {
            button = el;
            break;
        }
    }

    if (!button) return;

    button.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            attack();
        }
    );
}

/* ============================================================
   BOTONES DE HABILIDADES
   ============================================================ */

function setupSkillButtons() {

    for (const skill of skills) {

        const ids = [
            skill.id,
            "skill_" + skill.id,
            "skill-" + skill.id
        ];

        for (const id of ids) {

            const button =
                document.getElementById(id);

            if (!button) continue;

            button.addEventListener(
                "pointerdown",
                event => {

                    event.preventDefault();

                    useSkill(
                        skill.id
                    );
                }
            );

            break;
        }
    }
}

/* ============================================================
   BOTÓN INVENTARIO
   ============================================================ */

function setupInventoryButton() {

    const candidates = [
        "inventoryButton",
        "inventoryBtn",
        "btnInventory",
        "openInventory"
    ];

    let button = null;

    for (const id of candidates) {

        const el =
            document.getElementById(id);

        if (el) {

            button = el;
            break;
        }
    }

    if (!button) return;

    button.addEventListener(
        "click",
        () => {

            const panel =
                getInventoryPanel();

            if (!panel) return;

            const hidden =
                panel.style.display === "none" ||
                getComputedStyle(panel).display === "none";

            panel.style.display =
                hidden
                    ? "block"
                    : "none";

            if (hidden) {

                inventoryDirty = true;

                renderInventoryPanel();
            }
        }
    );
}

/* ============================================================
   BOTÓN DE POCIÓN
   ============================================================ */

function setupPotionButton() {

    const candidates = [
        "potionButton",
        "potionBtn",
        "btnPotion",
        "usePotionButton"
    ];

    let button = null;

    for (const id of candidates) {

        const el =
            document.getElementById(id);

        if (el) {

            button = el;
            break;
        }
    }

    if (!button) return;

    button.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            usePotion();
        }
    );
}

/* ============================================================
   RESIZE
   ============================================================ */

function resizeCanvas() {

    if (!canvas) return;

    const rect =
        canvas.getBoundingClientRect();

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    const width =
        Math.max(
            1,
            Math.floor(rect.width * dpr)
        );

    const height =
        Math.max(
            1,
            Math.floor(rect.height * dpr)
        );

    if (
        canvas.width !== width ||
        canvas.height !== height
    ) {

        canvas.width =
            width;

        canvas.height =
            height;
    }

    /*
       Dibujamos usando píxeles CSS.
    */

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}

window.addEventListener(
    "resize",
    resizeCanvas
);

/* ============================================================
   DIBUJAR
   ============================================================ */

function draw() {

    if (!ctx || !canvas) {
        return;
    }

    /*
       IMPORTANTE:
       resetTransform evita que un cambio de escala
       anterior destruya el render.
    */

    ctx.save();

    const dpr =
        window.devicePixelRatio || 1;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    const width =
        canvas.width / dpr;

    const height =
        canvas.height / dpr;

    /*
       Fondo de seguridad.
       Incluso si el terreno falla, no queda negro.
    */

    ctx.fillStyle =
        "#315b35";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    drawTerrain();

    drawCity();

    drawResources();

    drawNPCs();

    drawEnemies();

    drawPlayer();

    drawFloatingTexts();

    /*
       Mensaje central.
    */

    if (
        messageText &&
        messageTimer > 0
    ) {

        ctx.font =
            "bold 16px Arial";

        ctx.textAlign =
            "center";

        const boxWidth =
            Math.min(
                width - 30,
                380
            );

        const boxX =
            width / 2 -
            boxWidth / 2;

        const boxY =
            height - 85;

        ctx.fillStyle =
            "rgba(0,0,0,.72)";

        ctx.fillRect(
            boxX,
            boxY,
            boxWidth,
            42
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.fillText(
            messageText,
            width / 2,
            boxY + 27
        );

        ctx.textAlign =
            "left";
    }

    /*
       Pantalla de muerte.
    */

    if (player.dead) {

        ctx.fillStyle =
            "rgba(0,0,0,.58)";

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 30px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "💀 HAS MUERTO",
            width / 2,
            height / 2
        );

        ctx.font =
            "18px Arial";

        ctx.fillText(
            `Regresando en ${Math.ceil(
                player.respawnTimer
            )}`,
            width / 2,
            height / 2 + 35
        );

        ctx.textAlign =
            "left";
    }

    ctx.restore();

    drawMinimap();
}

/* ============================================================
   SAVE
   ============================================================ */

const SAVE_KEY =
    "reinosDeCenizaRPG";

const SAVE_VERSION =
    301;

function saveGame() {

    try {

        const save = {

            version:
                SAVE_VERSION,

            player: {
                ...player
            },

            inventory: {
                ...inventory
            },

            inventorySlots,

            itemInventory:
                JSON.parse(
                    JSON.stringify(
                        itemInventory
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
            SAVE_KEY,
            JSON.stringify(save)
        );

    } catch (error) {

        console.error(
            "❌ Error guardando partida:",
            error
        );
    }
}

/* ============================================================
   LOAD
   ============================================================ */

function loadGame() {

    try {

        const raw =
            localStorage.getItem(
                SAVE_KEY
            );

        if (!raw) {

            initializeStarterInventory();

            recalculatePlayerStats();

            return;
        }

        const save =
            JSON.parse(raw);

        /*
           Jugador.
        */

        if (save.player) {

            Object.assign(
                player,
                save.player
            );
        }

        /*
           Inventario antiguo.
        */

        if (save.inventory) {

            Object.assign(
                inventory,
                save.inventory
            );
        }

        /*
           Slots.
        */

        if (
            Number.isFinite(
                Number(
                    save.inventorySlots
                )
            )
        ) {

            inventorySlots =
                Math.max(
                    30,
                    Number(
                        save.inventorySlots
                    )
                );
        }

        /*
           Inventario de objetos.
        */

        if (
            Array.isArray(
                save.itemInventory
            )
        ) {

            itemInventory =
                save.itemInventory
                    .filter(Boolean)
                    .map(item => {

                        if (!item.uid) {
                            item.uid =
                                createUID();
                        }

                        if (
                            !item.itemId &&
                            item.id
                        ) {
                            item.itemId =
                                item.id;
                        }

                        const def =
                            itemDefinitions[
                                item.itemId
                            ];

                        if (def) {

                            item.name =
                                item.name ||
                                def.name;

                            item.type =
                                item.type ||
                                def.type;

                            item.level =
                                safeNumber(
                                    item.level,
                                    def.level
                                );

                            item.rarity =
                                item.rarity ||
                                def.rarity;

                            item.damage =
                                safeNumber(
                                    item.damage,
                                    def.damage
                                );

                            item.defense =
                                safeNumber(
                                    item.defense,
                                    def.defense
                                );

                            item.icon =
                                item.icon ||
                                def.icon;

                            item.description =
                                item.description ||
                                def.description;
                        }

                        return item;
                    });

        }

        /*
           Compatibilidad con partidas viejas
           que todavía no tenían inventario de objetos.
        */

        if (
            itemInventory.length === 0
        ) {

            initializeStarterInventory();
        }

        /*
           Equipment.
        */

        if (save.equipment) {

            for (
                const slot in equipment
            ) {

                if (
                    Object.prototype.hasOwnProperty.call(
                        save.equipment,
                        slot
                    )
                ) {

                    equipment[slot] =
                        save.equipment[slot];
                }
            }
        }

        /*
           Reparar equipment antiguo.
        */

        for (
            const slot in equipment
        ) {

            const equipped =
                equipment[slot];

            if (!equipped) continue;

            if (
                typeof equipped ===
                "string"
            ) {

                equipment[slot] = {
                    itemId: equipped,
                    uid:
                        "equipped_" +
                        slot,
                    rarity:
                        itemDefinitions[
                            equipped
                        ]?.rarity ||
                        "common"
                };
            }

            if (!equipped.uid) {

                equipped.uid =
                    "equipped_" +
                    slot;
            }

            if (!equipped.rarity) {

                equipped.rarity =
                    itemDefinitions[
                        equipped.itemId
                    ]?.rarity ||
                    "common";
            }
        }

        /*
           Misiones.
        */

        if (
            Array.isArray(
                save.quests
            )
        ) {

            for (
                const savedQuest
                of save.quests
            ) {

                const currentQuest =
                    quests.find(
                        q =>
                            q.id ===
                            savedQuest.id
                    );

                if (currentQuest) {

                    Object.assign(
                        currentQuest,
                        savedQuest
                    );
                }
            }
        }

        /*
           Herramientas.
        */

        if (save.tools) {

            Object.assign(
                tools,
                save.tools
            );
        }

        recalculatePlayerStats();

        inventoryDirty = true;

    } catch (error) {

        console.error(
            "❌ Error cargando partida:",
            error
        );

        /*
           No dejamos que una partida corrupta
           destruya el render del juego.
        */

        initializeStarterInventory();

        recalculatePlayerStats();
    }
}

/* ============================================================
   AUTOSAVE
   ============================================================ */

let autoSaveTimer = 0;

function updateAutoSave(dt) {

    autoSaveTimer += dt;

    if (
        autoSaveTimer >= 10
    ) {

        autoSaveTimer = 0;

        saveGame();
    }
}

/* ============================================================
   ACTUALIZACIÓN SEGURA
   ============================================================ */

function update(dt) {

    updateMovement(dt);

    updatePlayer(dt);

    updateEnemies(dt);

    updateResources(dt);

    updateDeath(dt);

    updateFloatingTexts(dt);

    updateMessage(dt);

    updateAutoSave(dt);

    maintainEnemies();

    updateCamera();

    updateUI();
}

/* ============================================================
   LOOP SEGURO
   ============================================================ */

let lastTime =
    performance.now();

let engineErrorShown = false;

function gameLoop(now) {

    try {

        const dt =
            Math.min(
                0.05,
                Math.max(
                    0,
                    (now - lastTime) /
                    1000
                )
            );

        lastTime = now;

        update(dt);

        draw();

    } catch (error) {

        /*
           ESTE BLOQUE ES UNA DE LAS CORRECCIONES
           PRINCIPALES DE LA V301.

           Si algo falla en una función secundaria,
           no dejamos el canvas completamente negro.
        */

        console.error(
            "❌ Error del motor:",
            error
        );

        if (!engineErrorShown) {

            engineErrorShown = true;

            try {

                if (ctx && canvas) {

                    const dpr =
                        window.devicePixelRatio ||
                        1;

                    const width =
                        canvas.width / dpr;

                    const height =
                        canvas.height / dpr;

                    ctx.setTransform(
                        dpr,
                        0,
                        0,
                        dpr,
                        0,
                        0
                    );

                    ctx.fillStyle =
                        "#315b35";

                    ctx.fillRect(
                        0,
                        0,
                        width,
                        height
                    );

                    ctx.fillStyle =
                        "#ffffff";

                    ctx.font =
                        "bold 18px Arial";

                    ctx.textAlign =
                        "center";

                    ctx.fillText(
                        "⚔️ Reinos de Ceniza",
                        width / 2,
                        height / 2
                    );

                    ctx.font =
                        "14px Arial";

                    ctx.fillText(
                        "El motor continúa ejecutándose...",
                        width / 2,
                        height / 2 + 30
                    );

                    ctx.textAlign =
                        "left";
                }

            } catch (_) {}
        }
    }

    requestAnimationFrame(
        gameLoop
    );
}

/* ============================================================
   CLICK / TOUCH SOBRE CANVAS
   ============================================================ */

function setupCanvasInteraction() {

    if (!canvas) return;

    canvas.addEventListener(
        "pointerdown",
        event => {

            /*
               En ordenador:
               click cerca de recurso = recoger.
            */

            if (
                event.pointerType ===
                "mouse"
            ) {

                interact();
            }
        }
    );
}

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */

function initializeGame() {

    if (!canvas || !ctx) {

        console.error(
            "❌ No se puede iniciar: canvas/contexto no disponible."
        );

        return;
    }

    resizeCanvas();

    loadGame();

    initializeResources();

    maintainEnemies();

    recalculatePlayerStats();

    setupJoystick();

    setupAttackButton();

    setupSkillButtons();

    setupInventoryButton();

    setupPotionButton();

    setupCanvasInteraction();

    updateCamera();

    updateUI();

    /*
       Guardado inicial.
    */

    saveGame();

    /*
       Primer dibujo inmediato.
       Esto evita que el canvas permanezca negro
       mientras espera al primer frame.
    */

    draw();

    /*
       Iniciar motor.
    */

    requestAnimationFrame(
        gameLoop
    );

    console.log(
        "⚔️ Reinos de Ceniza v301 iniciado correctamente."
    );
}

/* ============================================================
   INICIAR CUANDO EL DOM ESTÉ LISTO
   ============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeGame,
        {
            once: true
        }
    );

} else {

    initializeGame();
}

/* ============================================================
   EXPONER FUNCIONES
   Para botones HTML existentes.
   ============================================================ */

window.attack =
    attack;

window.usePotion =
    usePotion;

window.useSkill =
    useSkill;

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

window.claimQuest =
    claimQuest;

window.openBlacksmith =
    openBlacksmith;

window.saveGame =
    saveGame;

window.loadGame =
    loadGame;

window.gatherResource =
    gatherResource;

window.interact =
    interact;

/* ============================================================
   FIN GAME.JS V301
   ============================================================ */

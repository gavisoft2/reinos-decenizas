"use strict";

/* =========================================================
   ⚔️ REINOS DE CENIZA
   RPG 2D MOBILE
   VERSION 300
   ========================================================= */

/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

const miniCanvas = document.getElementById("miniCanvas");
const miniCtx = miniCanvas ? miniCanvas.getContext("2d") : null;

let W = innerWidth;
let H = innerHeight;

function resize(){

    W = innerWidth;
    H = innerHeight;

    canvas.width = W;
    canvas.height = H;

}

addEventListener("resize", resize);
resize();

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
    defense: 5,

    attackRange: 105,
    attackCooldown: 0,
    attackDelay: .55,

    directionX: 0,
    directionY: 1,

    dead: false,
    respawnTimer: 0,

    attackAnimation: 0,
    skillAnimation: 0

};

/* =========================================================
   INVENTARIO
========================================================= */

const inventory = {

    gold: 150,

    wood: 0,
    stone: 0,
    copper: 0,
    iron: 0,

    fish: 0,
    bait: 0,

    potions: 3,

    meat: 0,

    wolfFang: 0,
    goblinEar: 0,
    leather: 0,

    boarTusk: 0,
    orcTooth: 0,

    magicAsh: 0,

    herbs: 0

};

/* =========================================================
   ESTADÍSTICAS DE JUEGO
========================================================= */

const gameStats = {

    kills: 0,
    wolvesKilled: 0,
    boarsKilled: 0,
    goblinsKilled: 0,
    orcsKilled: 0,
    elitesKilled: 0,

    treesCollected: 0,
    rocksCollected: 0,
    copperCollected: 0,
    ironCollected: 0,

    fishCaught: 0,

    totalGoldEarned: 0

};

/* =========================================================
   HERRAMIENTAS
========================================================= */

const tools = {

    axe:{
        name:"Hacha",
        equipped:true
    },

    pickaxe:{
        name:"Pico",
        equipped:true
    },

    fishingRod:{
        name:"Caña de pescar",
        equipped:true
    }

};

const resourceTools = {

    tree:"axe",
    rock:"pickaxe",
    copper:"pickaxe",
    iron:"pickaxe"

};

/* =========================================================
   EQUIPAMIENTO
========================================================= */

const equipment = {

    weapon:{
        id:"starterSword",
        name:"Espada de Hierro",
        icon:"🗡️",
        rarity:"common",
        damage:10,
        defense:0,
        upgrade:0
    },

    helmet:{
        id:"starterHelmet",
        name:"Casco de Hierro",
        icon:"🪖",
        rarity:"common",
        damage:0,
        defense:3,
        upgrade:0
    },

    armor:{
        id:"starterArmor",
        name:"Armadura de Hierro",
        icon:"🥋",
        rarity:"common",
        damage:0,
        defense:7,
        upgrade:0
    },

    boots:{
        id:"starterBoots",
        name:"Botas de Cuero",
        icon:"👢",
        rarity:"common",
        damage:0,
        defense:2,
        upgrade:0
    },

    shield:{
        id:"starterShield",
        name:"Escudo de Madera",
        icon:"🛡️",
        rarity:"common",
        damage:0,
        defense:5,
        upgrade:0
    }

};

/* =========================================================
   OBJETOS CONSEGUIDOS
========================================================= */

const itemInventory = [

    equipment.weapon,
    equipment.helmet,
    equipment.armor,
    equipment.boots,
    equipment.shield

];

/* =========================================================
   HABILIDADES
========================================================= */

const skills = [

    {
        id:"power",
        name:"Golpe Poderoso",
        icon:"⚔️",
        level:2,
        mana:8,
        cooldown:8,
        damage:2,
        description:"Golpe que causa daño aumentado."
    },

    {
        id:"heal",
        name:"Curación",
        icon:"💚",
        level:3,
        mana:15,
        cooldown:12,
        heal:.35,
        description:"Recupera parte de tu vida."
    },

    {
        id:"whirlwind",
        name:"Torbellino",
        icon:"🌀",
        level:5,
        mana:20,
        cooldown:20,
        damage:1.5,
        radius:170,
        description:"Golpea a todos los enemigos cercanos."
    },

    {
        id:"rage",
        name:"Furia",
        icon:"🔥",
        level:8,
        mana:20,
        cooldown:30,
        duration:8,
        damage:1.7,
        description:"Aumenta temporalmente el daño."
    },

    {
        id:"execution",
        name:"Ejecución",
        icon:"💀",
        level:10,
        mana:25,
        cooldown:25,
        damage:3,
        description:"Devastador contra enemigos heridos."
    },

    {
        id:"rain",
        name:"Lluvia de Espadas",
        icon:"⚔️",
        level:15,
        mana:35,
        cooldown:35,
        damage:2.5,
        radius:240,
        description:"Una lluvia de ataques golpea la zona."
    },

    {
        id:"ash",
        name:"Ira de Ceniza",
        icon:"🔥",
        level:20,
        mana:50,
        cooldown:60,
        damage:4,
        radius:300,
        description:"Tu ataque definitivo."
    }

];

const skillCooldowns = {};

let rageTimer = 0;

/* =========================================================
   TERRENO
========================================================= */

const TERRAIN = {

    GRASS:0,
    WATER:1,
    SAND:2,
    FOREST:3,
    ROCK:4

};

function terrainAt(x,y){

    const nx = x / WORLD_WIDTH;
    const ny = y / WORLD_HEIGHT;

    const wave =
        Math.sin(nx * 17) +
        Math.cos(ny * 13) +
        Math.sin((nx + ny) * 22);

    if(
        x > WORLD_WIDTH/2-420 &&
        x < WORLD_WIDTH/2+420 &&
        y > WORLD_HEIGHT/2-420 &&
        y < WORLD_HEIGHT/2+420
    ){

        return TERRAIN.GRASS;

    }

    if(wave < -1.8){

        return TERRAIN.WATER;

    }

    if(wave < -1){

        return TERRAIN.SAND;

    }

    if(wave > 1.8){

        return TERRAIN.ROCK;

    }

    if(wave > 1){

        return TERRAIN.FOREST;

    }

    return TERRAIN.GRASS;

}

/* =========================================================
   UTILIDADES
========================================================= */

function rand(min,max){

    return Math.random() * (max-min) + min;

}

function distance(a,b){

    return Math.hypot(
        a.x-b.x,
        a.y-b.y
    );

}

function clamp(value,min,max){

    return Math.max(
        min,
        Math.min(max,value)
    );

}

/* =========================================================
   ZONAS
========================================================= */

const zones = [

    {
        id:"city",
        name:"Ciudad de Ceniza",
        x:WORLD_WIDTH/2,
        y:WORLD_HEIGHT/2,
        radius:420
    },

    {
        id:"forest",
        name:"Bosque Sombrío",
        x:1300,
        y:1200,
        radius:750
    },

    {
        id:"mines",
        name:"Minas Antiguas",
        x:3900,
        y:1200,
        radius:700
    },

    {
        id:"marsh",
        name:"Pantano de Ceniza",
        x:1200,
        y:3900,
        radius:700
    },

    {
        id:"mountain",
        name:"Montañas Negras",
        x:3900,
        y:3900,
        radius:800
    }

];

function getCurrentZone(){

    let closest = zones[0];
    let best = Infinity;

    for(const zone of zones){

        const d = Math.hypot(
            player.x-zone.x,
            player.y-zone.y
        );

        if(d<best){

            best=d;
            closest=zone;

        }

    }

    return closest;

}

/* =========================================================
   RECURSOS
========================================================= */

const resources = [];

function createResources(){

    resources.length=0;

    for(let i=0;i<340;i++){

        const x=rand(
            100,
            WORLD_WIDTH-100
        );

        const y=rand(
            100,
            WORLD_HEIGHT-100
        );

        const t=terrainAt(x,y);

        let type=null;

        if(t===TERRAIN.FOREST){

            type="tree";

        }
        else if(t===TERRAIN.ROCK){

            type=
                Math.random()<.5
                ?"iron"
                :"rock";

        }
        else if(t===TERRAIN.GRASS){

            if(Math.random()<.16){

                type="copper";

            }

        }

        if(type){

            resources.push({

                x,
                y,

                type,

                hp:type==="tree"?3:2,
                maxHp:type==="tree"?3:2,

                alive:true,

                respawn:0

            });

        }

    }

}

createResources();

/* =========================================================
   ENEMIGOS
========================================================= */

const enemyTypes = {

    wolf:{
        name:"Lobo",
        hp:70,
        damage:12,
        speed:110,
        radius:23,
        xp:30,
        gold:5
    },

    boar:{
        name:"Jabalí",
        hp:100,
        damage:15,
        speed:80,
        radius:25,
        xp:40,
        gold:8
    },

    goblin:{
        name:"Goblin",
        hp:130,
        damage:20,
        speed:65,
        radius:25,
        xp:60,
        gold:15
    },

    orc:{
        name:"Orco",
        hp:220,
        damage:28,
        speed:55,
        radius:30,
        xp:110,
        gold:30
    },

    skeleton:{
        name:"Esqueleto",
        hp:180,
        damage:24,
        speed:70,
        radius:26,
        xp:90,
        gold:22
    },

    spider:{
        name:"Araña",
        hp:115,
        damage:18,
        speed:100,
        radius:22,
        xp:55,
        gold:12
    },

    eliteOrc:{
        name:"Orco Élite",
        hp:600,
        damage:42,
        speed:48,
        radius:40,
        xp:300,
        gold:100,
        elite:true
    }

};

const enemies=[];

function chooseEnemyType(){

    const r=Math.random();

    if(r<.25)return "wolf";

    if(r<.43)return "boar";

    if(r<.62)return "goblin";

    if(r<.77)return "spider";

    if(r<.91)return "skeleton";

    if(r<.98)return "orc";

    return "eliteOrc";

}

function spawnEnemy(){

    let x;
    let y;

    let attempts=0;

    do{

        x=rand(
            300,
            WORLD_WIDTH-300
        );

        y=rand(
            300,
            WORLD_HEIGHT-300
        );

        attempts++;

        if(attempts>50)break;

    }
    while(
        Math.hypot(
            x-player.x,
            y-player.y
        )<650
    );

    const type=chooseEnemyType();

    const base=enemyTypes[type];

    enemies.push({

        type,

        name:base.name,

        x,
        y,

        hp:base.hp,
        maxHp:base.hp,

        damage:base.damage,
        speed:base.speed,
        radius:base.radius,

        xp:base.xp,
        gold:base.gold,

        elite:!!base.elite,

        attackCooldown:0,

        hitFlash:0

    });

}

function maintainEnemies(){

    while(enemies.length<32){

        spawnEnemy();

    }

}

/* =========================================================
   NPC
========================================================= */

const npcs=[

    {
        id:"guardian",
        name:"Guardián de Ceniza",
        type:"guardian",
        x:respawnPoint.x,
        y:respawnPoint.y-145,
        icon:"🧙"
    },

    {
        id:"blacksmith",
        name:"Herrero Aldric",
        type:"blacksmith",
        x:respawnPoint.x+150,
        y:respawnPoint.y-40,
        icon:"⚒️"
    },

    {
        id:"merchant",
        name:"Mercader Lina",
        type:"merchant",
        x:respawnPoint.x-150,
        y:respawnPoint.y-40,
        icon:"🛒"
    },

    {
        id:"trainer",
        name:"Maestro Rokan",
        type:"trainer",
        x:respawnPoint.x,
        y:respawnPoint.y+150,
        icon:"⚔️"
    }

];

/* =========================================================
   MISIONES
========================================================= */

const quests=[

    {
        id:"first",
        title:"Primeros pasos",
        description:"Habla con el Guardián de Ceniza.",
        type:"talk",
        target:"guardian",
        progress:0,
        needed:1,
        rewardGold:50,
        rewardXP:40,
        accepted:false,
        completed:false
    },

    {
        id:"wolves",
        title:"Amenaza de los lobos",
        description:"Derrota 5 lobos.",
        type:"kill",
        target:"wolf",
        progress:0,
        needed:5,
        rewardGold:100,
        rewardXP:100,
        accepted:false,
        completed:false
    },

    {
        id:"resources",
        title:"Recursos para la ciudad",
        description:"Recolecta 10 unidades de madera.",
        type:"wood",
        target:"wood",
        progress:0,
        needed:10,
        rewardGold:120,
        rewardXP:120,
        accepted:false,
        completed:false
    },

    {
        id:"goblins",
        title:"Problemas en el bosque",
        description:"Derrota 5 goblins.",
        type:"kill",
        target:"goblin",
        progress:0,
        needed:5,
        rewardGold:180,
        rewardXP:180,
        accepted:false,
        completed:false
    },

    {
        id:"miner",
        title:"Minería para Aldric",
        description:"Recolecta 10 unidades de hierro.",
        type:"iron",
        target:"iron",
        progress:0,
        needed:10,
        rewardGold:220,
        rewardXP:200,
        accepted:false,
        completed:false
    }

];

/* =========================================================
   CÁMARA
========================================================= */

const camera={

    x:0,
    y:0

};

function updateCamera(){

    camera.x=
        player.x-W/2;

    camera.y=
        player.y-H/2;

    camera.x=clamp(
        camera.x,
        0,
        Math.max(0,WORLD_WIDTH-W)
    );

    camera.y=clamp(
        camera.y,
        0,
        Math.max(0,WORLD_HEIGHT-H)
    );

}

/* =========================================================
   JOYSTICK
========================================================= */

const joystick=
    document.getElementById("joystick");

const joystickKnob=
    document.getElementById("joystickKnob");

let joyX=0;
let joyY=0;
let joyPointer=null;

function updateJoystick(clientX,clientY){

    if(!joystick)return;

    const rect=
        joystick.getBoundingClientRect();

    const cx=
        rect.left+rect.width/2;

    const cy=
        rect.top+rect.height/2;

    let dx=
        clientX-cx;

    let dy=
        clientY-cy;

    const max=
        rect.width/2-32;

    const len=
        Math.hypot(dx,dy);

    if(len>max){

        dx=dx/len*max;
        dy=dy/len*max;

    }

    joyX=dx/max;
    joyY=dy/max;

    if(joystickKnob){

        joystickKnob.style.transform=
            `translate(${dx}px,${dy}px)`;

    }

}

function resetJoystick(){

    joyX=0;
    joyY=0;

    if(joystickKnob){

        joystickKnob.style.transform=
            "translate(0,0)";

    }

    joyPointer=null;

}

if(joystick){

    joystick.addEventListener(
        "pointerdown",
        e=>{

            joyPointer=e.pointerId;

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
        e=>{

            if(e.pointerId!==joyPointer)return;

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

/* =========================================================
   TECLADO
========================================================= */

const keys={};

addEventListener(
    "keydown",
    e=>{

        keys[e.key.toLowerCase()]=true;

        /* P = usar poción */

        if(
            e.key.toLowerCase()==="p"
        ){

            usePotion();

        }

    }
);

addEventListener(
    "keyup",
    e=>{

        keys[e.key.toLowerCase()]=false;

    }
);

/* =========================================================
   MOVIMIENTO
========================================================= */

function updateMovement(dt){

    if(player.dead)return;

    let dx=joyX;
    let dy=joyY;

    if(keys.w || keys.arrowup)
        dy-=1;

    if(keys.s || keys.arrowdown)
        dy+=1;

    if(keys.a || keys.arrowleft)
        dx-=1;

    if(keys.d || keys.arrowright)
        dx+=1;

    const len=Math.hypot(dx,dy);

    if(len>1){

        dx/=len;
        dy/=len;

    }

    if(
        Math.abs(dx)+
        Math.abs(dy)>.05
    ){

        player.directionX=dx;
        player.directionY=dy;

        player.x+=
            dx*
            player.speed*
            dt;

        player.y+=
            dy*
            player.speed*
            dt;

    }

    player.x=clamp(
        player.x,
        player.radius,
        WORLD_WIDTH-player.radius
    );

    player.y=clamp(
        player.y,
        player.radius,
        WORLD_HEIGHT-player.radius
    );

}

/* =========================================================
   RECOLECCIÓN
========================================================= */

let lastTap=0;

canvas.addEventListener(
    "pointerdown",
    e=>{

        const now=Date.now();

        if(
            now-lastTap<350
        ){

            interactWorld();

        }

        lastTap=now;

    }
);

function interactWorld(){

    if(player.dead)return;

    const npc=findNearestNPC(105);

    if(npc){

        openNPC(npc);
        return;

    }

    gatherResource();

}

function findNearestNPC(range){

    let nearest=null;
    let best=range;

    for(const npc of npcs){

        const d=distance(
            player,
            npc
        );

        if(d<best){

            best=d;
            nearest=npc;

        }

    }

    return nearest;

}

function gatherResource(){

    if(player.dead)return;

    let nearest=null;
    let best=85;

    for(const r of resources){

        if(!r.alive)continue;

        const d=
            Math.hypot(
                player.x-r.x,
                player.y-r.y
            );

        if(d<best){

            best=d;
            nearest=r;

        }

    }

    if(!nearest){

        showMessage(
            "No hay recursos cerca"
        );

        return;

    }

    const required=
        resourceTools[nearest.type];

    if(
        required &&
        !tools[required].equipped
    ){

        showMessage(
            "Necesitas equipar: "+
            tools[required].name
        );

        return;

    }

    nearest.hp--;

    floatingText(
        nearest.x,
        nearest.y,
        "⛏️"
    );

    if(nearest.hp<=0){

        nearest.alive=false;

        nearest.respawn=
            rand(15,35);

        let amount=1;

        if(nearest.type==="tree"){

            inventory.wood+=amount;

            gameStats.treesCollected+=amount;

            questProgress(
                "wood",
                amount,
                "wood"
            );

        }

        if(nearest.type==="rock"){

            inventory.stone+=amount;

            gameStats.rocksCollected+=amount;

        }

        if(nearest.type==="copper"){

            inventory.copper+=amount;

            gameStats.copperCollected+=amount;

        }

        if(nearest.type==="iron"){

            inventory.iron+=amount;

            gameStats.ironCollected+=amount;

            questProgress(
                "iron",
                amount,
                "iron"
            );

        }

        player.xp+=5;

        showMessage(
            "Recolectaste "+
            resourceName(
                nearest.type
            )
        );

        checkLevelUp();

        updateUI();
        saveGame();

    }

}

function resourceName(type){

    const names={

        tree:"madera 🪵",
        rock:"piedra 🪨",
        copper:"cobre 🟠",
        iron:"hierro ⚙️"

    };

    return names[type]||type;

}

/* =========================================================
   PESCA
========================================================= */

function tryFishing(){

    if(player.dead)return;

    if(!tools.fishingRod.equipped){

        showMessage(
            "Necesitas equipar la caña de pescar"
        );

        return;

    }

    if(inventory.bait<=0){

        showMessage(
            "Necesitas cebo para pescar"
        );

        return;

    }

    const terrain=
        terrainAt(
            player.x,
            player.y
        );

    if(
        terrain!==TERRAIN.WATER &&
        terrain!==TERRAIN.SAND
    ){

        showMessage(
            "Debes acercarte al agua para pescar"
        );

        return;

    }

    inventory.bait--;

    if(Math.random()<.75){

        inventory.fish++;

        gameStats.fishCaught++;

        player.xp+=10;

        floatingText(
            player.x,
            player.y-45,
            "🐟 +1 Pescado"
        );

        showMessage(
            "🎣 ¡Has pescado un pez!"
        );

        checkLevelUp();

    }
    else{

        showMessage(
            "🎣 El pez escapó..."

        );

    }

    updateUI();
    saveGame();

}

/* tecla F */

addEventListener(
    "keydown",
    e=>{

        if(
            e.key.toLowerCase()==="f"
        ){

            tryFishing();

        }

    }
);

/* =========================================================
   ENEMIGOS
========================================================= */

function updateEnemies(dt){

    for(
        let i=enemies.length-1;
        i>=0;
        i--
    ){

        const e=enemies[i];

        if(e.hp<=0)continue;

        const dx=
            player.x-e.x;

        const dy=
            player.y-e.y;

        const dist=
            Math.hypot(dx,dy);

        if(
            dist<620 &&
            !player.dead
        ){

            if(dist>58){

                e.x+=
                    dx/dist*
                    e.speed*
                    dt;

                e.y+=
                    dy/dist*
                    e.speed*
                    dt;

            }
            else{

                e.attackCooldown-=dt;

                if(
                    e.attackCooldown<=0
                ){

                    enemyAttack(e);

                    e.attackCooldown=
                        e.elite
                        ?1
                        :1.2;

                }

            }

        }

        e.hitFlash=Math.max(
            0,
            e.hitFlash-dt
        );

    }

}

function enemyAttack(e){

    const reduced=Math.max(
        1,
        e.damage-
        player.defense*.35
    );

    const damage=Math.round(
        reduced*
        rand(.8,1.1)
    );

    player.hp-=damage;

    floatingText(
        player.x,
        player.y-30,
        "-"+damage
    );

    if(player.hp<=0){

        player.hp=0;

        die();

    }

}

/* =========================================================
   ATAQUE
========================================================= */

const attackButton=
    document.getElementById(
        "attackButton"
    );

if(attackButton){

    attackButton.addEventListener(
        "pointerdown",
        normalAttack
    );

}

function findNearestEnemy(range){

    let nearest=null;
    let best=range;

    for(const e of enemies){

        if(e.hp<=0)continue;

        const d=
            distance(player,e);

        if(d<best){

            best=d;
            nearest=e;

        }

    }

    return nearest;

}

function normalAttack(){

    if(player.dead)return;

    if(player.attackCooldown>0)return;

    const enemy=
        findNearestEnemy(
            player.attackRange
        );

    if(!enemy){

        showMessage(
            "No hay enemigo cerca"
        );

        return;

    }

    let damage=
        player.damage*
        rand(.8,1.2);

    if(rageTimer>0){

        damage*=1.7;

    }

    damage=Math.round(damage);

    enemy.hp-=damage;

    enemy.hitFlash=.15;

    player.attackCooldown=
        player.attackDelay;

    player.attackAnimation=.18;

    floatingText(
        enemy.x,
        enemy.y-enemy.radius-10,
        "-"+damage
    );

    if(enemy.hp<=0){

        killEnemy(enemy);

    }

}

/* =========================================================
   MUERTE ENEMIGO / LOOT
========================================================= */

function killEnemy(enemy){

    const data=
        enemyTypes[enemy.type];

    player.xp+=data.xp;

    inventory.gold+=data.gold;

    gameStats.kills++;
    gameStats.totalGoldEarned+=data.gold;

    if(enemy.type==="wolf")
        gameStats.wolvesKilled++;

    if(enemy.type==="boar")
        gameStats.boarsKilled++;

    if(enemy.type==="goblin")
        gameStats.goblinsKilled++;

    if(enemy.type==="orc")
        gameStats.orcsKilled++;

    if(enemy.elite)
        gameStats.elitesKilled++;

    questProgress(
        "kill",
        1,
        enemy.type
    );

    /* =====================================================
       LOOT
    ===================================================== */

    const roll=Math.random();

    if(enemy.type==="wolf"){

        inventory.wolfFang++;

        floatingText(
            enemy.x,
            enemy.y-40,
            "🐺 Colmillo"
        );

        if(roll<.30){

            inventory.leather++;

            floatingText(
                enemy.x,
                enemy.y-60,
                "🟤 Cuero"
            );

        }

        if(roll<.15){

            inventory.meat++;

        }

    }

    if(enemy.type==="boar"){

        inventory.meat++;

        inventory.boarTusk++;

        floatingText(
            enemy.x,
            enemy.y-40,
            "🥩 Carne"
        );

        if(roll<.20){

            inventory.leather++;

        }

    }

    if(enemy.type==="goblin"){

        inventory.goblinEar++;

        floatingText(
            enemy.x,
            enemy.y-40,
            "👂 Oreja"
        );

        if(roll<.25){

            inventory.copper++;

        }

    }

    if(enemy.type==="skeleton"){

        if(roll<.35){

            inventory.iron++;

            floatingText(
                enemy.x,
                enemy.y-40,
                "⚙️ Hierro"
            );

        }

    }

    if(enemy.type==="spider"){

        inventory.leather++;

        if(roll<.25){

            inventory.meat++;

        }

    }

    if(enemy.type==="orc"){

        inventory.orcTooth++;

        floatingText(
            enemy.x,
            enemy.y-45,
            "🦷 Diente de Orco"
        );

        if(roll<.30){

            inventory.iron++;

        }

        if(roll<.10){

            inventory.magicAsh++;

        }

    }

    if(enemy.type==="eliteOrc"){

        inventory.magicAsh+=2;

        inventory.iron+=3;

        inventory.gold+=50;

        floatingText(
            enemy.x,
            enemy.y-60,
            "👑 LOOT ÉLITE"
        );

        showMessage(
            "🔥 ¡Has derrotado un ORCO ÉLITE!"
        );

    }

    if(roll<.08){

        inventory.potions++;

        floatingText(
            enemy.x,
            enemy.y-80,
            "🧪 Poción"
        );

    }

    floatingText(
        enemy.x,
        enemy.y,
        "+"+data.xp+" XP"
    );

    enemy.hp=0;

    checkLevelUp();

    updateUI();
    saveGame();

}

/* =========================================================
   POCIONES
========================================================= */

function usePotion(){

    if(player.dead)return;

    if(inventory.potions<=0){

        showMessage(
            "No tienes pociones"
        );

        return;

    }

    if(
        player.hp>=
        player.maxHp
    ){

        showMessage(
            "Tu vida ya está completa"
        );

        return;

    }

    inventory.potions--;

    const heal=
        Math.round(
            player.maxHp*.40
        );

    player.hp=
        Math.min(
            player.maxHp,
            player.hp+heal
        );

    floatingText(
        player.x,
        player.y-45,
        "🧪 +"+heal
    );

    showMessage(
        "Has usado una poción"
    );

    updateUI();
    saveGame();

}

/* =========================================================
   SKILLS
========================================================= */

function renderSkills(){

    const container=
        document.getElementById(
            "skills"
        );

    if(!container)return;

    container.innerHTML="";

    for(const skill of skills){

        const el=
            document.createElement(
                "button"
            );

        el.className="skill";

        el.dataset.id=
            skill.id;

        el.innerHTML=`

            <div class="skillIcon">
                ${skill.icon}
            </div>

            <div class="skillLevel">
                ${skill.level}
            </div>

            <div class="skillName">
                ${skill.name}
            </div>

            <div class="cooldown"></div>

        `;

        el.addEventListener(
            "pointerdown",
            ()=>useSkill(skill.id)
        );

        container.appendChild(el);

    }

}

renderSkills();

function useSkill(id){

    if(player.dead)return;

    const skill=
        skills.find(
            s=>s.id===id
        );

    if(!skill)return;

    if(
        player.level<
        skill.level
    ){

        showMessage(
            "Desbloqueas esta habilidad en nivel "+
            skill.level
        );

        return;

    }

    if(
        (skillCooldowns[id]||0)>0
    ){

        return;

    }

    if(
        player.mana<
        skill.mana
    ){

        showMessage(
            "No tienes suficiente maná"
        );

        return;

    }

    player.mana-=skill.mana;

    skillCooldowns[id]=
        skill.cooldown;

    player.skillAnimation=.5;

    if(id==="power")
        powerStrike();

    if(id==="heal")
        healSkill(skill);

    if(id==="whirlwind")
        whirlwind(skill);

    if(id==="rage")
        rageSkill(skill);

    if(id==="execution")
        execution(skill);

    if(id==="rain")
        rainSkill(skill);

    if(id==="ash")
        ashSkill(skill);

    updateUI();

}

/* =========================================================
   SKILL - GOLPE PODEROSO
========================================================= */

function powerStrike(){

    const e=
        findNearestEnemy(150);

    if(!e){

        showMessage(
            "No hay enemigo cerca"
        );

        return;

    }

    const damage=
        Math.round(
            player.damage*2
        );

    e.hp-=damage;

    floatingText(
        e.x,
        e.y-40,
        "⚔️ -"+damage
    );

    if(e.hp<=0){

        killEnemy(e);

    }

}

/* =========================================================
   CURACIÓN
========================================================= */

function healSkill(skill){

    const heal=
        Math.round(
            player.maxHp*
            skill.heal
        );

    player.hp=
        Math.min(
            player.maxHp,
            player.hp+heal
        );

    floatingText(
        player.x,
        player.y-45,
        "💚 +"+heal
    );

}

/* =========================================================
   TORBELLINO
========================================================= */

function whirlwind(skill){

    effectCircle(
        player.x,
        player.y,
        skill.radius
    );

    for(const e of enemies){

        if(e.hp<=0)continue;

        if(
            distance(player,e)<=
            skill.radius
        ){

            const damage=
                Math.round(
                    player.damage*
                    skill.damage
                );

            e.hp-=damage;

            floatingText(
                e.x,
                e.y-35,
                "-"+damage
            );

            if(e.hp<=0){

                killEnemy(e);

            }

        }

    }

}

/* =========================================================
   FURIA
========================================================= */

function rageSkill(skill){

    rageTimer=
        skill.duration;

    floatingText(
        player.x,
        player.y-45,
        "🔥 FURIA"
    );

}

/* =========================================================
   EJECUCIÓN
========================================================= */

function execution(skill){

    const e=
        findNearestEnemy(160);

    if(!e){

        showMessage(
            "No hay enemigo cerca"
        );

        return;

    }

    let damage=
        player.damage*
        skill.damage;

    if(
        e.hp/e.maxHp<.4
    ){

        damage*=1.5;

    }

    damage=Math.round(damage);

    e.hp-=damage;

    floatingText(
        e.x,
        e.y-40,
        "💀 -"+damage
    );

    if(e.hp<=0){

        killEnemy(e);

    }

}

/* =========================================================
   LLUVIA DE ESPADAS
========================================================= */

function rainSkill(skill){

    effectCircle(
        player.x,
        player.y,
        skill.radius
    );

    for(const e of enemies){

        if(e.hp<=0)continue;

        if(
            distance(player,e)<=
            skill.radius
        ){

            const damage=
                Math.round(
                    player.damage*
                    skill.damage
                );

            e.hp-=damage;

            floatingText(
                e.x,
                e.y-35,
                "-"+damage
            );

            if(e.hp<=0){

                killEnemy(e);

            }

        }

    }

}

/* =========================================================
   IRA DE CENIZA
========================================================= */

function ashSkill(skill){

    effectCircle(
        player.x,
        player.y,
        skill.radius
    );

    for(const e of enemies){

        if(e.hp<=0)continue;

        if(
            distance(player,e)<=
            skill.radius
        ){

            const damage=
                Math.round(
                    player.damage*
                    skill.damage
                );

            e.hp-=damage;

            floatingText(
                e.x,
                e.y-35,
                "🔥 -"+damage
            );

            if(e.hp<=0){

                killEnemy(e);

            }

        }

    }

}

/* =========================================================
   EFECTOS
========================================================= */

const effects=[];

function effectCircle(
    x,
    y,
    radius
){

    effects.push({

        x,
        y,
        radius,

        life:.4,
        maxLife:.4

    });

}

function updateEffects(dt){

    for(
        let i=effects.length-1;
        i>=0;
        i--
    ){

        effects[i].life-=dt;

        if(
            effects[i].life<=0
        ){

            effects.splice(i,1);

        }

    }

}

/* =========================================================
   TEXTO FLOTANTE
========================================================= */

const floatingTexts=[];

function floatingText(
    x,
    y,
    text
){

    floatingTexts.push({

        x,
        y,

        text,

        life:1

    });

}

function updateFloatingTexts(dt){

    for(
        let i=floatingTexts.length-1;
        i>=0;
        i--
    ){

        const f=
            floatingTexts[i];

        f.life-=dt;

        f.y-=25*dt;

        if(f.life<=0){

            floatingTexts.splice(
                i,
                1
            );

        }

    }

}

/* =========================================================
   NPC INTERACCIÓN
========================================================= */

function interactNPC(){

    const nearest=
        findNearestNPC(105);

    if(!nearest){

        showMessage(
            "No hay NPC cerca"
        );

        return;

    }

    openNPC(nearest);

}

canvas.addEventListener(
    "dblclick",
    e=>{

        e.preventDefault();

        interactNPC();

    }
);

function openNPC(npc){

    const panel=
        document.getElementById(
            "npcPanel"
        );

    const title=
        document.getElementById(
            "npcTitle"
        );

    const content=
        document.getElementById(
            "npcContent"
        );

    if(!panel || !title || !content)
        return;

    title.textContent=
        npc.icon+
        " "+
        npc.name;

    content.innerHTML="";

    if(npc.type==="guardian"){

        content.innerHTML=`

        <div class="npcDialogue">

        Bienvenido, guerrero.
        Las criaturas de las tierras exteriores
        se están volviendo cada vez más agresivas.

        </div>

        <button class="itemButton"
        onclick="acceptQuest('first')">

        📜 Aceptar misión: Primeros pasos

        </button>

        <button class="itemButton"
        onclick="acceptQuest('wolves')">

        🐺 Aceptar misión: Amenaza de los lobos

        </button>

        <button class="itemButton"
        onclick="acceptQuest('goblins')">

        👺 Aceptar misión: Problemas en el bosque

        </button>

        <button class="itemButton"
        onclick="acceptQuest('miner')">

        ⛏️ Aceptar misión: Minería para Aldric

        </button>

        `;

        questProgress(
            "talk",
            1,
            "guardian"
        );

    }

    if(npc.type==="blacksmith"){

        content.innerHTML=`

        <div class="npcDialogue">

        Soy Aldric, el herrero.
        Puedo mejorar tu equipo cuando consigas
        suficientes materiales.

        <br><br>

        Mejora actual de espada:
        +${equipment.weapon.upgrade}

        <br>

        Daño del arma:
        ${equipment.weapon.damage}

        </div>

        <button class="itemButton"
        onclick="upgradeWeapon()">

        🗡️ Mejorar espada — 100 oro + 5 hierro

        </button>

        <button class="itemButton"
        onclick="upgradeArmor()">

        🛡️ Mejorar armadura — 100 oro + 5 hierro

        </button>

        `;

    }

    if(npc.type==="merchant"){

        renderMerchant(content);

    }

    if(npc.type==="trainer"){

        content.innerHTML=`

        <div class="npcDialogue">

        Entrena duro y desbloquearás
        habilidades más poderosas.

        </div>

        <button class="itemButton"
        onclick="showSkillsInfo()">

        ✨ Ver habilidades

        </button>

        `;

    }

    panel.classList.add("open");

}

/* =========================================================
   MISIONES
========================================================= */

function acceptQuest(id){

    const q=
        quests.find(
            x=>x.id===id
        );

    if(!q)return;

    if(q.completed){

        showMessage(
            "Esta misión ya fue completada"
        );

        return;

    }

    if(q.accepted){

        showMessage(
            "Ya aceptaste esta misión"
        );

        return;

    }

    q.accepted=true;

    showMessage(
        "📜 Misión aceptada: "+
        q.title
    );

    updateQuestUI();
    saveGame();

}

function questProgress(
    type,
    amount,
    target
){

    for(const q of quests){

        if(
            !q.accepted ||
            q.completed
        )continue;

        if(q.type!==type)continue;

        if(
            !q.target ||
            q.target===target
        ){

            q.progress+=amount;

            if(
                q.progress>=q.needed
            ){

                q.progress=
                    q.needed;

                completeQuest(q);

            }

        }

    }

    updateQuestUI();

}

function completeQuest(q){

    q.completed=true;

    inventory.gold+=
        q.rewardGold;

    player.xp+=
        q.rewardXP;

    floatingText(
        player.x,
        player.y-60,
        "📜 MISIÓN COMPLETADA"
    );

    showMessage(
        "🎉 "+
        q.title+
        " +"+
        q.rewardGold+
        " oro +"+
        q.rewardXP+
        " XP"
    );

    checkLevelUp();

    updateUI();
    saveGame();

}

function updateQuestUI(){

    const active=
        quests.find(
            q=>
                q.accepted &&
                !q.completed
        );

    const text=
        document.getElementById(
            "questText"
        );

    if(!text)return;

    if(!active){

        text.textContent=
            "Busca al Guardián de Ceniza.";

        return;

    }

    text.textContent=
        active.title+
        " — "+
        active.progress+
        "/"+
        active.needed;

}

/* =========================================================
   TIENDA
========================================================= */

function renderMerchant(container){

    container.innerHTML=`

    <div class="npcDialogue">

    Tengo objetos útiles para aventureros.

    </div>

    <button class="itemButton"
    onclick="buyPotion()">

    🧪 Poción de vida — 25 oro

    </button>

    <button class="itemButton"
    onclick="buyBait()">

    🪱 Cebo — 5 oro

    </button>

    `;

}

function buyPotion(){

    if(inventory.gold<25){

        showMessage(
            "No tienes suficiente oro"
        );

        return;

    }

    inventory.gold-=25;

    inventory.potions++;

    showMessage(
        "🧪 Compraste una poción"
    );

    updateUI();
    saveGame();

}

function buyBait(){

    if(inventory.gold<5){

        showMessage(
            "No tienes suficiente oro"
        );

        return;

    }

    inventory.gold-=5;

    inventory.bait++;

    showMessage(
        "🪱 Compraste cebo"
    );

    updateUI();
    saveGame();

}

/* =========================================================
   MEJORAS DEL HERRERO
========================================================= */

function upgradeWeapon(){

    if(
        inventory.gold<100 ||
        inventory.iron<5
    ){

        showMessage(
            "Necesitas 100 oro y 5 hierro"
        );

        return;

    }

    inventory.gold-=100;
    inventory.iron-=5;

    equipment.weapon.damage+=5;

    equipment.weapon.upgrade++;

    player.damage+=5;

    showMessage(
        "🗡️ ¡Espada mejorada! +5 daño"
    );

    updateUI();
    saveGame();

}

function upgradeArmor(){

    if(
        inventory.gold<100 ||
        inventory.iron<5
    ){

        showMessage(
            "Necesitas 100 oro y 5 hierro"
        );

        return;

    }

    inventory.gold-=100;
    inventory.iron-=5;

    equipment.armor.defense+=3;

    equipment.armor.upgrade++;

    player.defense+=3;

    showMessage(
        "🛡️ ¡Armadura mejorada! +3 defensa"
    );

    updateUI();
    saveGame();

}

/* =========================================================
   INFO HABILIDADES
========================================================= */

function showSkillsInfo(){

    const content=
        document.getElementById(
            "npcContent"
        );

    if(!content)return;

    content.innerHTML=`

    <div>

    ${skills.map(
        s=>`

        <div class="questItem">

        ${s.icon}
        <b>${s.name}</b>

        <br>

        Nivel requerido:
        ${s.level}

        <br>

        ${s.description}

        </div>

        `
    ).join("")}

    </div>

    `;

}

/* =========================================================
   INVENTARIO UI
========================================================= */

function renderInventory(){

    const content=
        document.getElementById(
            "inventoryContent"
        );

    if(!content)return;

    const items=[

        ["🪵","Madera",inventory.wood],
        ["🪨","Piedra",inventory.stone],
        ["🟠","Cobre",inventory.copper],
        ["⚙️","Hierro",inventory.iron],

        ["🐟","Pescado",inventory.fish],
        ["🪱","Cebo",inventory.bait],

        ["🧪","Poción",inventory.potions],
        ["🥩","Carne",inventory.meat],

        ["🐺","Colmillo de lobo",inventory.wolfFang],
        ["👂","Oreja de goblin",inventory.goblinEar],

        ["🟤","Cuero",inventory.leather],
        ["🐗","Colmillo de jabalí",inventory.boarTusk],

        ["🦷","Diente de orco",inventory.orcTooth],
        ["🔥","Ceniza mágica",inventory.magicAsh],

        ["🌿","Hierbas",inventory.herbs]

    ];

    content.innerHTML=`

        <div class="goldText">

        💰 Oro:
        ${inventory.gold}

        </div>

        <br>

        <div class="inventoryGrid">

        ${items.map(
            item=>`

            <div class="slot">

                ${item[0]}

                <div class="slotName">
                    ${item[1]}
                </div>

                <div class="slotQty">
                    ${item[2]}
                </div>

            </div>

        `
        ).join("")}

        </div>

        <br>

        <button class="itemButton"
        onclick="usePotion()">

        🧪 Usar poción

        </button>

        <button class="itemButton"
        onclick="tryFishing()">

        🎣 Pescar

        </button>

    `;

}

/* =========================================================
   PERSONAJE UI
========================================================= */

function renderCharacter(){

    const level=
        document.getElementById(
            "panelLevel"
        );

    if(level)
        level.textContent=
            player.level;

    const hp=
        document.getElementById(
            "panelHp"
        );

    if(hp)
        hp.textContent=
            Math.round(player.maxHp);

    const mana=
        document.getElementById(
            "panelMana"
        );

    if(mana)
        mana.textContent=
            Math.round(player.maxMana);

    const damage=
        document.getElementById(
            "panelDamage"
        );

    if(damage)
        damage.textContent=
            Math.round(player.damage);

    const defense=
        document.getElementById(
            "panelDefense"
        );

    if(defense)
        defense.textContent=
            Math.round(player.defense);

    const speed=
        document.getElementById(
            "panelSpeed"
        );

    if(speed)
        speed.textContent=
            Math.round(player.speed);

    const content=
        document.getElementById(
            "equipmentContent"
        );

    if(!content)return;

    const slots=[

        ["🗡️","Arma","weapon"],
        ["🪖","Casco","helmet"],
        ["🥋","Armadura","armor"],
        ["👢","Botas","boots"],
        ["🛡️","Escudo","shield"]

    ];

    content.innerHTML=

        slots.map(
            s=>{

                const item=
                    equipment[s[2]];

                return `

                <div class="itemButton">

                ${s[0]}

                <b>${s[1]}:</b>

                ${item.name}

                <br>

                ⚔️ ${item.damage}

                🛡️ ${item.defense}

                <br>

                Mejora:
                +${item.upgrade||0}

                </div>

                `;

            }
        ).join("");

}

/* =========================================================
   QUEST UI
========================================================= */

function renderQuests(){

    const content=
        document.getElementById(
            "questsContent"
        );

    if(!content)return;

    content.innerHTML=

        quests.map(
            q=>`

            <div class="questItem ${
                q.completed
                ?"done"
                :""
            }">

            <b>${q.title}</b>

            <br>

            ${q.description}

            <br>

            Progreso:
            ${q.progress}/${q.needed}

            <br>

            Recompensa:

            💰 ${q.rewardGold}

            ⭐ ${q.rewardXP}

            <br>

            ${
                q.completed
                ?"✅ COMPLETADA"
                :
                q.accepted
                ?"🟡 ACTIVA"
                :
                "⚪ NO ACEPTADA"
            }

            </div>

            `
        ).join("");

}

/* =========================================================
   BOTONES UI
========================================================= */

const inventoryButton=
    document.getElementById(
        "inventoryButton"
    );

if(inventoryButton){

    inventoryButton.addEventListener(
        "pointerdown",
        ()=>{

            renderInventory();

            const panel=
                document.getElementById(
                    "inventoryPanel"
                );

            if(panel)
                panel.classList.add("open");

        }
    );

}

const characterButton=
    document.getElementById(
        "characterButton"
    );

if(characterButton){

    characterButton.addEventListener(
        "pointerdown",
        ()=>{

            renderCharacter();

            const panel=
                document.getElementById(
                    "characterPanel"
                );

            if(panel)
                panel.classList.add("open");

        }
    );

}

const questsButton=
    document.getElementById(
        "questsButton"
    );

if(questsButton){

    questsButton.addEventListener(
        "pointerdown",
        ()=>{

            renderQuests();

            const panel=
                document.getElementById(
                    "questsPanel"
                );

            if(panel)
                panel.classList.add("open");

        }
    );

}

const shopButton=
    document.getElementById(
        "shopButton"
    );

if(shopButton){

    shopButton.addEventListener(
        "pointerdown",
        ()=>{

            const npc=
                npcs.find(
                    n=>
                        n.type==="merchant"
                );

            if(npc)
                openNPC(npc);

        }
    );

}

/* =========================================================
   CERRAR PANELES
========================================================= */

document
.querySelectorAll(".closePanel")
.forEach(btn=>{

    btn.addEventListener(
        "pointerdown",
        ()=>{

            const parent=
                btn.parentElement;

            if(parent)
                parent.classList.remove(
                    "open"
                );

        }
    );

});

/* =========================================================
   SUBIR DE NIVEL
========================================================= */

function checkLevelUp(){

    while(
        player.xp>=
        player.xpNeeded
    ){

        player.xp-=
            player.xpNeeded;

        player.level++;

        player.xpNeeded=
            Math.floor(
                player.xpNeeded*1.35
            );

        player.maxHp+=25;
        player.maxMana+=12;

        player.damage+=6;
        player.defense+=2;

        player.hp=
            player.maxHp;

        player.mana=
            player.maxMana;

        showMessage(
            "🎉 ¡SUBISTE A NIVEL "+
            player.level+
            "!"
        );

        floatingText(
            player.x,
            player.y-70,
            "⭐ NIVEL "+player.level
        );

        const unlocked=
            skills.find(
                s=>
                    s.level===
                    player.level
            );

        if(unlocked){

            setTimeout(
                ()=>{

                    showMessage(
                        "✨ Nueva habilidad: "+
                        unlocked.name
                    );

                },
                900
            );

        }

    }

    updateSkills();

}

/* =========================================================
   ACTUALIZAR SKILLS
========================================================= */

function updateSkills(){

    document
    .querySelectorAll(".skill")
    .forEach(el=>{

        const id=
            el.dataset.id;

        const skill=
            skills.find(
                s=>s.id===id
            );

        if(!skill)return;

        const locked=
            player.level<
            skill.level;

        el.classList.toggle(
            "locked",
            locked
        );

        const cd=
            el.querySelector(
                ".cooldown"
            );

        if(!cd)return;

        const remaining=
            skillCooldowns[id]||0;

        if(remaining>0){

            cd.textContent=
                Math.ceil(
                    remaining
                );

            cd.style.display=
                "flex";

        }
        else{

            cd.textContent="";

            cd.style.display=
                "none";

        }

    });

}

/* =========================================================
   MUERTE / RESPAWN
========================================================= */

function die(){

    if(player.dead)return;

    player.dead=true;

    player.hp=0;

    player.respawnTimer=3;

    const screen=
        document.getElementById(
            "deathScreen"
        );

    if(screen)
        screen.style.display=
            "flex";

}

function respawn(){

    player.dead=false;

    player.x=
        respawnPoint.x;

    player.y=
        respawnPoint.y;

    player.hp=
        player.maxHp;

    player.mana=
        player.maxMana;

    player.respawnTimer=0;

    const screen=
        document.getElementById(
            "deathScreen"
        );

    if(screen)
        screen.style.display=
            "none";

    showMessage(
        "🏰 Has regresado a la ciudad"
    );

}

/* =========================================================
   UI
========================================================= */

function updateUI(){

    const hpPercent=
        Math.max(
            0,
            player.hp/
            player.maxHp*100
        );

    const manaPercent=
        player.mana/
        player.maxMana*100;

    const xpPercent=
        player.xp/
        player.xpNeeded*100;

    const hpBar=
        document.getElementById(
            "hpBar"
        );

    if(hpBar)
        hpBar.style.width=
            hpPercent+"%";

    const manaBar=
        document.getElementById(
            "manaBar"
        );

    if(manaBar)
        manaBar.style.width=
            manaPercent+"%";

    const xpBar=
        document.getElementById(
            "xpBar"
        );

    if(xpBar)
        xpBar.style.width=
            xpPercent+"%";

    const hpText=
        document.getElementById(
            "hpText"
        );

    if(hpText)
        hpText.textContent=
            Math.round(player.hp)+
            " / "+
            Math.round(player.maxHp);

    const manaText=
        document.getElementById(
            "manaText"
        );

    if(manaText)
        manaText.textContent=
            Math.round(player.mana)+
            " / "+
            Math.round(player.maxMana);

    const xpText=
        document.getElementById(
            "xpText"
        );

    if(xpText)
        xpText.textContent=
            Math.round(player.xp)+
            " / "+
            Math.round(player.xpNeeded);

    const level=
        document.getElementById(
            "level"
        );

    if(level)
        level.textContent=
            "Nv. "+player.level;

    const gold=
        document.getElementById(
            "gold"
        );

    if(gold)
        gold.textContent=
            inventory.gold;

    const wood=
        document.getElementById(
            "wood"
        );

    if(wood)
        wood.textContent=
            inventory.wood;

    const stone=
        document.getElementById(
            "stone"
        );

    if(stone)
        stone.textContent=
            inventory.stone;

    const copper=
        document.getElementById(
            "copper"
        );

    if(copper)
        copper.textContent=
            inventory.copper;

    const iron=
        document.getElementById(
            "iron"
        );

    if(iron)
        iron.textContent=
            inventory.iron;

    const fish=
        document.getElementById(
            "fish"
        );

    if(fish)
        fish.textContent=
            inventory.fish;

    updateSkills();

}

/* =========================================================
   MENSAJES
========================================================= */

let messageTimer=null;

function showMessage(text){

    const el=
        document.getElementById(
            "message"
        );

    if(!el){

        console.log(text);
        return;

    }

    el.textContent=text;

    el.style.display=
        "block";

    clearTimeout(
        messageTimer
    );

    messageTimer=
        setTimeout(
            ()=>{

                el.style.display=
                    "none";

            },
            2200
        );

}

/* =========================================================
   TERRENO
========================================================= */

function drawTerrain(){

    const startX=
        Math.floor(
            camera.x/TILE
        )-1;

    const startY=
        Math.floor(
            camera.y/TILE
        )-1;

    const endX=
        Math.ceil(
            (camera.x+W)/TILE
        )+1;

    const endY=
        Math.ceil(
            (camera.y+H)/TILE
        )+1;

    for(
        let ty=startY;
        ty<endY;
        ty++
    ){

        for(
            let tx=startX;
            tx<endX;
            tx++
        ){

            if(
                tx<0 ||
                ty<0
            )continue;

            const x=
                tx*TILE;

            const y=
                ty*TILE;

            const t=
                terrainAt(
                    x+TILE/2,
                    y+TILE/2
                );

            if(t===TERRAIN.GRASS)
                ctx.fillStyle="#476c3d";

            if(t===TERRAIN.WATER)
                ctx.fillStyle="#24577a";

            if(t===TERRAIN.SAND)
                ctx.fillStyle="#a99458";

            if(t===TERRAIN.FOREST)
                ctx.fillStyle="#315638";

            if(t===TERRAIN.ROCK)
                ctx.fillStyle="#5c5c58";

            ctx.fillRect(
                x-camera.x,
                y-camera.y,
                TILE+1,
                TILE+1
            );

            /* detalles deterministas */

            if(
                t===TERRAIN.GRASS
            ){

                ctx.fillStyle=
                    "rgba(30,70,30,.20)";

                const seed=
                    Math.abs(
                        (
                            tx*928371+
                            ty*492781
                        )%100
                    );

                if(seed<55){

                    ctx.fillRect(
                        x-camera.x+
                        12+
                        seed%25,

                        y-camera.y+
                        12+
                        (seed*3)%30,

                        3,
                        8
                    );

                }

            }

            if(
                t===TERRAIN.WATER
            ){

                ctx.strokeStyle=
                    "rgba(150,220,255,.25)";

                ctx.beginPath();

                ctx.moveTo(
                    x-camera.x+10,
                    y-camera.y+32
                );

                ctx.lineTo(
                    x-camera.x+52,
                    y-camera.y+32
                );

                ctx.stroke();

            }

        }

    }

}

/* =========================================================
   CIUDAD
========================================================= */

function drawCity(){

    const cx=
        respawnPoint.x-
        camera.x;

    const cy=
        respawnPoint.y-
        camera.y;

    ctx.fillStyle="#8a7651";

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        270,
        0,
        Math.PI*2
    );

    ctx.fill();

    ctx.fillStyle="#a99168";

    ctx.fillRect(
        cx-35,
        cy-300,
        70,
        600
    );

    ctx.fillRect(
        cx-300,
        cy-35,
        600,
        70
    );

    drawHouse(
        cx-210,
        cy-180
    );

    drawHouse(
        cx+150,
        cy-180
    );

    drawHouse(
        cx-210,
        cy+100
    );

    drawHouse(
        cx+150,
        cy+100
    );

    ctx.fillStyle="#6d8190";

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        55,
        0,
        Math.PI*2
    );

    ctx.fill();

    ctx.fillStyle="#4d9ed0";

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        38,
        0,
        Math.PI*2
    );

    ctx.fill();

    ctx.fillStyle="#493421";

    ctx.fillRect(
        cx-3,
        cy-115,
        6,
        65
    );

    ctx.fillStyle="#b62c2c";

    ctx.beginPath();

    ctx.moveTo(
        cx,
        cy-115
    );

    ctx.lineTo(
        cx+45,
        cy-100
    );

    ctx.lineTo(
        cx,
        cy-85
    );

    ctx.closePath();

    ctx.fill();

}

function drawHouse(x,y){

    ctx.fillStyle="#7a4930";

    ctx.fillRect(
        x-55,
        y-40,
        110,
        80
    );

    ctx.fillStyle="#4b2920";

    ctx.beginPath();

    ctx.moveTo(
        x-70,
        y-40
    );

    ctx.lineTo(
        x,
        y-100
    );

    ctx.lineTo(
        x+70,
        y-40
    );

    ctx.closePath();

    ctx.fill();

    ctx.fillStyle="#30221c";

    ctx.fillRect(
        x-14,
        y,
        28,
        40
    );

    ctx.fillStyle="#89b2b8";

    ctx.fillRect(
        x-40,
        y-20,
        22,
        20
    );

    ctx.fillRect(
        x+18,
        y-20,
        22,
        20
    );

}

/* =========================================================
   RECURSOS
========================================================= */

function drawResources(){

    for(const r of resources){

        if(!r.alive)continue;

        const sx=
            r.x-camera.x;

        const sy=
            r.y-camera.y;

        if(
            sx<-80 ||
            sx>W+80 ||
            sy<-80 ||
            sy>H+80
        )continue;

        if(r.type==="tree"){

            ctx.fillStyle="#59351e";

            ctx.fillRect(
                sx-7,
                sy,
                14,
                35
            );

            ctx.fillStyle="#285b31";

            ctx.beginPath();

            ctx.arc(
                sx,
                sy-12,
                30,
                0,
                Math.PI*2
            );

            ctx.fill();

            ctx.fillStyle="#39733d";

            ctx.beginPath();

            ctx.arc(
                sx-17,
                sy-25,
                18,
                0,
                Math.PI*2
            );

            ctx.fill();

        }

        if(r.type==="rock"){

            ctx.fillStyle="#767979";

            ctx.beginPath();

            ctx.moveTo(
                sx-25,
                sy+20
            );

            ctx.lineTo(
                sx-18,
                sy-15
            );

            ctx.lineTo(
                sx+4,
                sy-28
            );

            ctx.lineTo(
                sx+28,
                sy-8
            );

            ctx.lineTo(
                sx+20,
                sy+25
            );

            ctx.closePath();

            ctx.fill();

        }

        if(r.type==="copper"){

            ctx.fillStyle="#b96b35";

            ctx.beginPath();

            ctx.arc(
                sx,
                sy,
                23,
                0,
                Math.PI*2
            );

            ctx.fill();

            ctx.fillStyle="#ed9a52";

            ctx.beginPath();

            ctx.arc(
                sx-7,
                sy-7,
                7,
                0,
                Math.PI*2
            );

            ctx.fill();

        }

        if(r.type==="iron"){

            ctx.fillStyle="#88939b";

            ctx.beginPath();

            ctx.moveTo(
                sx-22,
                sy+20
            );

            ctx.lineTo(
                sx-18,
                sy-20
            );

            ctx.lineTo(
                sx+10,
                sy-27
            );

            ctx.lineTo(
                sx+27,
                sy+7
            );

            ctx.lineTo(
                sx+10,
                sy+25
            );

            ctx.closePath();

            ctx.fill();

            ctx.fillStyle="#d0d8dd";

            ctx.fillRect(
                sx-5,
                sy-12,
                9,
                15
            );

        }

    }

}

/* =========================================================
   NPC
========================================================= */

function drawNPCs(){

    for(const npc of npcs){

        const sx=
            npc.x-camera.x;

        const sy=
            npc.y-camera.y;

        ctx.fillStyle="#1d2330";

        ctx.beginPath();

        ctx.arc(
            sx,
            sy,
            22,
            0,
            Math.PI*2
        );

        ctx.fill();

        ctx.font="25px Arial";

        ctx.textAlign="center";

        ctx.fillText(
            npc.icon,
            sx,
            sy+8
        );

        ctx.fillStyle="#fff";

        ctx.font="11px Arial";

        ctx.fillText(
            npc.name,
            sx,
            sy-30
        );

    }

}

/* =========================================================
   ENEMIGOS
========================================================= */

function drawEnemies(){

    for(const e of enemies){

        if(e.hp<=0)continue;

        const sx=
            e.x-camera.x;

        const sy=
            e.y-camera.y;

        if(
            sx<-80 ||
            sx>W+80 ||
            sy<-80 ||
            sy>H+80
        )continue;

        let color="#7d4735";

        if(e.type==="wolf")
            color="#8d8d8d";

        if(e.type==="boar")
            color="#75452f";

        if(e.type==="goblin")
            color="#4d8a43";

        if(e.type==="orc")
            color="#657f3f";

        if(e.type==="skeleton")
            color="#d0c9b4";

        if(e.type==="spider")
            color="#39252d";

        if(e.type==="eliteOrc")
            color="#9b2e32";

        ctx.fillStyle=
            e.hitFlash>0
            ?"white"
            :color;

        ctx.beginPath();

        ctx.arc(
            sx,
            sy,
            e.radius,
            0,
            Math.PI*2
        );

        ctx.fill();

        if(e.elite){

            ctx.strokeStyle="#ffd447";

            ctx.lineWidth=3;

            ctx.beginPath();

            ctx.arc(
                sx,
                sy,
                e.radius+5,
                0,
                Math.PI*2
            );

            ctx.stroke();

        }

        ctx.fillStyle="#111";

        ctx.beginPath();

        ctx.arc(
            sx-7,
            sy-5,
            3,
            0,
            Math.PI*2
        );

        ctx.arc(
            sx+7,
            sy-5,
            3,
            0,
            Math.PI*2
        );

        ctx.fill();

        /* barra vida */

        ctx.fillStyle="#220b0b";

        ctx.fillRect(
            sx-28,
            sy-e.radius-12,
            56,
            6
        );

        ctx.fillStyle=
            e.elite
            ?"gold"
            :"#e22";

        ctx.fillRect(
            sx-28,
            sy-e.radius-12,
            56*
            Math.max(
                0,
                e.hp/e.maxHp
            ),
            6
        );

    }

}

/* =========================================================
   JUGADOR
========================================================= */

function drawPlayer(){

    const sx=
        player.x-camera.x;

    const sy=
        player.y-camera.y;

    ctx.save();

    ctx.translate(
        sx,
        sy
    );

    if(player.dead){

        ctx.globalAlpha=.4;

    }

    ctx.fillStyle=
        "rgba(0,0,0,.35)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        18,
        25,
        10,
        0,
        0,
        Math.PI*2
    );

    ctx.fill();

    ctx.fillStyle="#6b1e25";

    ctx.beginPath();

    ctx.moveTo(-17,5);
    ctx.lineTo(17,5);
    ctx.lineTo(25,38);
    ctx.lineTo(-25,38);

    ctx.closePath();

    ctx.fill();

    ctx.fillStyle="#596673";

    ctx.fillRect(
        -17,
        -5,
        34,
        38
    );

    ctx.fillStyle="#9ba7af";

    ctx.fillRect(
        -13,
        -3,
        26,
        28
    );

    ctx.fillStyle="#d8aa82";

    ctx.beginPath();

    ctx.arc(
        0,
        -22,
        15,
        0,
        Math.PI*2
    );

    ctx.fill();

    ctx.fillStyle="#596875";

    ctx.beginPath();

    ctx.arc(
        0,
        -25,
        17,
        Math.PI,
        0
    );

    ctx.fill();

    ctx.fillRect(
        -17,
        -25,
        34,
        9
    );

    ctx.fillStyle="#20252b";

    ctx.fillRect(
        -8,
        -22,
        5,
        3
    );

    ctx.fillRect(
        3,
        -22,
        5,
        3
    );

    const swordX=
        player.directionX>=0
        ?22
        :-22;

    ctx.strokeStyle="#dfe8ed";

    ctx.lineWidth=6;

    ctx.beginPath();

    ctx.moveTo(
        swordX,
        5
    );

    ctx.lineTo(
        swordX+
        player.directionX*35,
        5+
        player.directionY*35
    );

    ctx.stroke();

    ctx.strokeStyle="#b68c42";

    ctx.lineWidth=4;

    ctx.beginPath();

    ctx.moveTo(
        swordX-8,
        3
    );

    ctx.lineTo(
        swordX+8,
        3
    );

    ctx.stroke();

    if(player.attackAnimation>0){

        ctx.strokeStyle="#fff";

        ctx.lineWidth=4;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            55,
            -1,
            1
        );

        ctx.stroke();

    }

    ctx.restore();

}

/* =========================================================
   EFECTOS
========================================================= */

function drawEffects(){

    for(const e of effects){

        const sx=
            e.x-camera.x;

        const sy=
            e.y-camera.y;

        const alpha=
            e.life/e.maxLife;

        ctx.strokeStyle=
            `rgba(255,220,80,${alpha})`;

        ctx.lineWidth=6;

        ctx.beginPath();

        ctx.arc(
            sx,
            sy,
            e.radius*
            (1-alpha*.15),
            0,
            Math.PI*2
        );

        ctx.stroke();

    }

}

/* =========================================================
   FLOATING TEXT
========================================================= */

function drawFloatingTexts(){

    for(const f of floatingTexts){

        const sx=
            f.x-camera.x;

        const sy=
            f.y-camera.y;

        ctx.globalAlpha=
            Math.max(
                0,
                f.life
            );

        ctx.fillStyle="#fff";

        ctx.font=
            "bold 14px Arial";

        ctx.textAlign=
            "center";

        ctx.fillText(
            f.text,
            sx,
            sy
        );

        ctx.globalAlpha=1;

    }

}

/* =========================================================
   MINIMAPA
========================================================= */

function drawMinimap(){

    if(!miniCtx)return;

    const size=180;

    miniCtx.clearRect(
        0,
        0,
        size,
        size
    );

    miniCtx.fillStyle="#273b29";

    miniCtx.fillRect(
        0,
        0,
        size,
        size
    );

    const scale=
        size/WORLD_WIDTH;

    for(
        let y=0;
        y<size;
        y+=5
    ){

        for(
            let x=0;
            x<size;
            x+=5
        ){

            const wx=x/scale;
            const wy=y/scale;

            const t=
                terrainAt(
                    wx,
                    wy
                );

            if(t===TERRAIN.WATER)
                miniCtx.fillStyle="#24577a";

            else if(t===TERRAIN.SAND)
                miniCtx.fillStyle="#a99458";

            else if(t===TERRAIN.ROCK)
                miniCtx.fillStyle="#5c5c58";

            else if(t===TERRAIN.FOREST)
                miniCtx.fillStyle="#315638";

            else
                miniCtx.fillStyle="#476c3d";

            miniCtx.fillRect(
                x,
                y,
                5,
                5
            );

        }

    }

    /* ciudad */

    miniCtx.fillStyle="#d6b15b";

    miniCtx.beginPath();

    miniCtx.arc(
        respawnPoint.x*scale,
        respawnPoint.y*scale,
        5,
        0,
        Math.PI*2
    );

    miniCtx.fill();

    /* jugador */

    miniCtx.fillStyle="#fff";

    miniCtx.beginPath();

    miniCtx.arc(
        player.x*scale,
        player.y*scale,
        3,
        0,
        Math.PI*2
    );

    miniCtx.fill();

}

/* =========================================================
   GUARDAR
========================================================= */

function saveGame(){

    const save={

        version:300,

        player:{

            x:player.x,
            y:player.y,

            level:player.level,

            xp:player.xp,
            xpNeeded:player.xpNeeded,

            hp:player.hp,
            maxHp:player.maxHp,

            mana:player.mana,
            maxMana:player.maxMana,

            damage:player.damage,
            defense:player.defense

        },

        inventory,

        equipment,

        quests,

        gameStats

    };

    try{

        localStorage.setItem(
            "reinosDeCenizaRPG",
            JSON.stringify(save)
        );

    }
    catch(error){

        console.error(
            "Error guardando partida",
            error
        );

    }

}

/* =========================================================
   CARGAR
========================================================= */

function loadGame(){

    const raw=
        localStorage.getItem(
            "reinosDeCenizaRPG"
        );

    if(!raw)return;

    try{

        const save=
            JSON.parse(raw);

        if(save.player){

            Object.assign(
                player,
                save.player
            );

        }

        if(save.inventory){

            Object.assign(
                inventory,
                save.inventory
            );

        }

        if(save.equipment){

            for(
                const slot
                in save.equipment
            ){

                if(
                    equipment[slot]
                ){

                    Object.assign(
                        equipment[slot],
                        save.equipment[slot]
                    );

                }

            }

        }

        if(
            Array.isArray(
                save.quests
            )
        ){

            for(
                const oldQuest
                of save.quests
            ){

                const q=
                    quests.find(
                        x=>
                            x.id===
                            oldQuest.id
                    );

                if(q){

                    Object.assign(
                        q,
                        oldQuest
                    );

                }

            }

        }

        if(save.gameStats){

            Object.assign(
                gameStats,
                save.gameStats
            );

        }

        /*
           COMPATIBILIDAD:
           partidas anteriores usaban fish
           como cebo.
        */

        if(
            typeof inventory.bait!=="number"
        ){

            inventory.bait=
                0;

        }

        if(
            typeof equipment.weapon.upgrade!=="number"
        ){

            equipment.weapon.upgrade=0;

        }

        if(
            typeof equipment.armor.upgrade!=="number"
        ){

            equipment.armor.upgrade=0;

        }

        /*
           Evitar partidas corruptas
        */

        if(
            !Number.isFinite(
                player.level
            )
        ){

            player.level=1;

        }

        if(
            !Number.isFinite(
                player.xp
            )
        ){

            player.xp=0;

        }

        if(
            !Number.isFinite(
                player.xpNeeded
            )
        ){

            player.xpNeeded=100;

        }

        if(
            player.hp<=0
        ){

            player.hp=
                player.maxHp;

            player.mana=
                player.maxMana;

            player.x=
                respawnPoint.x;

            player.y=
                respawnPoint.y;

            player.dead=false;

        }

    }
    catch(error){

        console.error(
            "Error cargando partida",
            error
        );

    }

}

/* =========================================================
   ACTUALIZACIÓN
========================================================= */

function update(dt){

    if(player.dead){

        player.respawnTimer-=dt;

        const timer=
            document.getElementById(
                "deathTimer"
            );

        if(timer){

            timer.textContent=
                "Regresando en "+
                Math.ceil(
                    player.respawnTimer
                )+
                "...";

        }

        if(
            player.respawnTimer<=0
        ){

            respawn();

        }

    }

    updateMovement(dt);

    player.attackCooldown=
        Math.max(
            0,
            player.attackCooldown-dt
        );

    player.attackAnimation=
        Math.max(
            0,
            player.attackAnimation-dt
        );

    player.skillAnimation=
        Math.max(
            0,
            player.skillAnimation-dt
        );

    rageTimer=
        Math.max(
            0,
            rageTimer-dt
        );

    for(
        const skill of skills
    ){

        if(
            skillCooldowns[
                skill.id
            ]
        ){

            skillCooldowns[
                skill.id
            ]=
                Math.max(
                    0,
                    skillCooldowns[
                        skill.id
                    ]-dt
                );

        }

    }

    updateEnemies(dt);

    updateEffects(dt);

    updateFloatingTexts(dt);

    for(
        const r of resources
    ){

        if(!r.alive){

            r.respawn-=dt;

            if(
                r.respawn<=0
            ){

                r.alive=true;

                r.hp=
                    r.maxHp;

            }

        }

    }

    maintainEnemies();

    updateCamera();

    updateUI();

}

/* =========================================================
   DIBUJAR
========================================================= */

function draw(){

    ctx.clearRect(
        0,
        0,
        W,
        H
    );

    drawTerrain();

    drawCity();

    drawResources();

    drawNPCs();

    drawEnemies();

    drawEffects();

    drawPlayer();

    drawFloatingTexts();

    drawMinimap();

}

/* =========================================================
   LOOP
========================================================= */

let lastTime=
    performance.now();

function gameLoop(now){

    const dt=
        Math.min(
            .05,
            (now-lastTime)/1000
        );

    lastTime=now;

    update(dt);

    draw();

    requestAnimationFrame(
        gameLoop
    );

}

/* =========================================================
   INICIO
========================================================= */

loadGame();

maintainEnemies();

updateQuestUI();

updateUI();

setInterval(
    saveGame,
    10000
);

requestAnimationFrame(
    gameLoop
);

setTimeout(
    ()=>{

        showMessage(
            "🏰 Bienvenido a Reinos de Ceniza"
        );

    },
    800
);

/* =========================================================
   ATAJOS DE PRUEBA
=========================================================

   P = usar poción
   F = pescar cerca del agua

========================================================= */

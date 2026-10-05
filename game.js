"use strict";

/* =========================================================
   REINOS DE CENIZA
   RPG 2D MOBILE
   VERSION 200
========================================================= */

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

const miniCanvas = document.getElementById("miniCanvas");
const miniCtx = miniCanvas.getContext("2d");

let W = innerWidth;
let H = innerHeight;

function resize(){

    W = innerWidth;
    H = innerHeight;

    canvas.width = W;
    canvas.height = H;

}

addEventListener("resize",resize);

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

    potions: 3,

    meat: 0,

    wolfFang: 0,

    goblinEar: 0,

    leather: 0

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
        defense:0
    },

    helmet:{
        id:"starterHelmet",
        name:"Casco de Hierro",
        icon:"🪖",
        rarity:"common",
        damage:0,
        defense:3
    },

    armor:{
        id:"starterArmor",
        name:"Armadura de Hierro",
        icon:"🥋",
        rarity:"common",
        damage:0,
        defense:7
    },

    boots:{
        id:"starterBoots",
        name:"Botas de Cuero",
        icon:"👢",
        rarity:"common",
        damage:0,
        defense:2
    },

    shield:{
        id:"starterShield",
        name:"Escudo de Madera",
        icon:"🛡️",
        rarity:"common",
        damage:0,
        defense:5
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
        Math.sin(nx*17) +
        Math.cos(ny*13) +
        Math.sin((nx+ny)*22);

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
   ALEATORIO
========================================================= */

function rand(min,max){

    return Math.random()*(max-min)+min;

}

function distance(a,b){

    return Math.hypot(
        a.x-b.x,
        a.y-b.y
    );

}

/* =========================================================
   RECURSOS
========================================================= */

const resources = [];

function createResources(){

    resources.length = 0;

    for(let i=0;i<320;i++){

        const x = rand(100,WORLD_WIDTH-100);
        const y = rand(100,WORLD_HEIGHT-100);

        const t = terrainAt(x,y);

        let type = null;

        if(t === TERRAIN.FOREST){

            type = "tree";

        }
        else if(t === TERRAIN.ROCK){

            type = Math.random()<.5 ? "iron":"rock";

        }
        else if(t === TERRAIN.GRASS){

            if(Math.random()<.15){

                type = "copper";

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
    }

};

const enemies = [];

function spawnEnemy(){

    let x;
    let y;

    do{

        x = rand(300,WORLD_WIDTH-300);
        y = rand(300,WORLD_HEIGHT-300);

    }while(
        Math.hypot(
            x-player.x,
            y-player.y
        ) < 600
    );

    const r = Math.random();

    let type;

    if(r<.45){

        type="wolf";

    }
    else if(r<.72){

        type="boar";

    }
    else if(r<.93){

        type="goblin";

    }
    else{

        type="orc";

    }

    const base = enemyTypes[type];

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

        attackCooldown:0,

        hitFlash:0

    });

}

function maintainEnemies(){

    while(enemies.length<30){

        spawnEnemy();

    }

}

/* =========================================================
   NPC
========================================================= */

const npcs = [

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

const quests = [

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
    }

];

/* =========================================================
   CÁMARA
========================================================= */

const camera = {

    x:0,
    y:0

};

function updateCamera(){

    camera.x = player.x - W/2;
    camera.y = player.y - H/2;

    camera.x = Math.max(
        0,
        Math.min(
            WORLD_WIDTH-W,
            camera.x
        )
    );

    camera.y = Math.max(
        0,
        Math.min(
            WORLD_HEIGHT-H,
            camera.y
        )
    );

}

/* =========================================================
   JOYSTICK
========================================================= */

const joystick = document.getElementById("joystick");
const joystickKnob = document.getElementById("joystickKnob");

let joyX=0;
let joyY=0;
let joyPointer=null;

function updateJoystick(clientX,clientY){

    const rect = joystick.getBoundingClientRect();

    const cx = rect.left+rect.width/2;
    const cy = rect.top+rect.height/2;

    let dx = clientX-cx;
    let dy = clientY-cy;

    const max = rect.width/2-32;

    const len = Math.hypot(dx,dy);

    if(len>max){

        dx = dx/len*max;
        dy = dy/len*max;

    }

    joyX = dx/max;
    joyY = dy/max;

    joystickKnob.style.transform =
        `translate(${dx}px,${dy}px)`;

}

joystick.addEventListener("pointerdown",e=>{

    joyPointer=e.pointerId;

    joystick.setPointerCapture(e.pointerId);

    updateJoystick(
        e.clientX,
        e.clientY
    );

});

joystick.addEventListener("pointermove",e=>{

    if(e.pointerId!==joyPointer)return;

    updateJoystick(
        e.clientX,
        e.clientY
    );

});

function resetJoystick(){

    joyX=0;
    joyY=0;

    joystickKnob.style.transform=
        "translate(0,0)";

    joyPointer=null;

}

joystick.addEventListener("pointerup",resetJoystick);
joystick.addEventListener("pointercancel",resetJoystick);

/* =========================================================
   TECLADO
========================================================= */

const keys={};

addEventListener("keydown",e=>{

    keys[e.key.toLowerCase()]=true;

});

addEventListener("keyup",e=>{

    keys[e.key.toLowerCase()]=false;

});

/* =========================================================
   MOVIMIENTO
========================================================= */

function updateMovement(dt){

    if(player.dead)return;

    let dx=joyX;
    let dy=joyY;

    if(keys.w || keys.arrowup)dy-=1;
    if(keys.s || keys.arrowdown)dy+=1;
    if(keys.a || keys.arrowleft)dx-=1;
    if(keys.d || keys.arrowright)dx+=1;

    const len=Math.hypot(dx,dy);

    if(len>1){

        dx/=len;
        dy/=len;

    }

    if(Math.abs(dx)+Math.abs(dy)>.05){

        player.directionX=dx;
        player.directionY=dy;

        player.x+=dx*player.speed*dt;
        player.y+=dy*player.speed*dt;

    }

    player.x=Math.max(
        player.radius,
        Math.min(
            WORLD_WIDTH-player.radius,
            player.x
        )
    );

    player.y=Math.max(
        player.radius,
        Math.min(
            WORLD_HEIGHT-player.radius,
            player.y
        )
    );

}

/* =========================================================
   RECOLECCIÓN
========================================================= */

let lastTap=0;

canvas.addEventListener("pointerdown",e=>{

    const now=Date.now();

    if(now-lastTap<350){

        gatherResource();

    }

    lastTap=now;

});

function gatherResource(){

    if(player.dead)return;

    let nearest=null;
    let best=85;

    for(const r of resources){

        if(!r.alive)continue;

        const d=Math.hypot(
            player.x-r.x,
            player.y-r.y
        );

        if(d<best){

            best=d;
            nearest=r;

        }

    }

    if(!nearest){

        return;

    }

    const required=resourceTools[nearest.type];

    if(required && !tools[required].equipped){

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

        nearest.respawn=rand(15,35);

        let amount=1;

        if(nearest.type==="tree"){

            inventory.wood+=amount;

            questProgress("wood",amount);

        }

        if(nearest.type==="rock"){

            inventory.stone+=amount;

        }

        if(nearest.type==="copper"){

            inventory.copper+=amount;

        }

        if(nearest.type==="iron"){

            inventory.iron+=amount;

        }

        player.xp+=5;

        showMessage(
            "Recolectaste "+
            resourceName(nearest.type)
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
   ENEMIGOS
========================================================= */

function updateEnemies(dt){

    for(let i=enemies.length-1;i>=0;i--){

        const e=enemies[i];

        if(e.hp<=0)continue;

        const dx=player.x-e.x;
        const dy=player.y-e.y;

        const dist=Math.hypot(dx,dy);

        if(dist<520 && !player.dead){

            if(dist>58){

                e.x += dx/dist*e.speed*dt;
                e.y += dy/dist*e.speed*dt;

            }
            else{

                e.attackCooldown-=dt;

                if(e.attackCooldown<=0){

                    enemyAttack(e);

                    e.attackCooldown=1.2;

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
        e.damage-player.defense*.35
    );

    const damage=Math.round(
        reduced*rand(.8,1.1)
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

document.getElementById("attackButton")
.addEventListener("pointerdown",()=>{

    normalAttack();

});

function findNearestEnemy(range){

    let nearest=null;
    let best=range;

    for(const e of enemies){

        if(e.hp<=0)continue;

        const d=distance(player,e);

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

    const enemy=findNearestEnemy(
        player.attackRange
    );

    if(!enemy){

        showMessage("No hay enemigo cerca");

        return;

    }

    let damage =
        player.damage*rand(.8,1.2);

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
   MUERTE ENEMIGO
========================================================= */

function killEnemy(enemy){

    const data=enemyTypes[enemy.type];

    player.xp+=data.xp;

    inventory.gold+=data.gold;

    questProgress(
        "kill",
        1,
        enemy.type
    );

    /* LOOT */

    const roll=Math.random();

    if(enemy.type==="wolf"){

        inventory.wolfFang++;

        if(roll<.25){

            inventory.leather++;

            floatingText(
                enemy.x,
                enemy.y-40,
                "🟤 Cuero"
            );

        }

    }

    if(enemy.type==="goblin"){

        inventory.goblinEar++;

    }

    if(roll<.08){

        const potion=1;

        inventory.potions+=potion;

        floatingText(
            enemy.x,
            enemy.y-50,
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
   SKILLS
========================================================= */

function renderSkills(){

    const container=
        document.getElementById("skills");

    container.innerHTML="";

    for(const skill of skills){

        const el=document.createElement("button");

        el.className="skill";

        el.dataset.id=skill.id;

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

        el.addEventListener("pointerdown",()=>{

            useSkill(skill.id);

        });

        container.appendChild(el);

    }

}

renderSkills();

function useSkill(id){

    if(player.dead)return;

    const skill=
        skills.find(s=>s.id===id);

    if(!skill)return;

    if(player.level<skill.level){

        showMessage(
            "Desbloqueas esta habilidad en nivel "+
            skill.level
        );

        return;

    }

    if((skillCooldowns[id]||0)>0){

        return;

    }

    if(player.mana<skill.mana){

        showMessage("No tienes suficiente maná");

        return;

    }

    player.mana-=skill.mana;

    skillCooldowns[id]=skill.cooldown;

    player.skillAnimation=.5;

    if(id==="power"){

        powerStrike();

    }

    if(id==="heal"){

        healSkill(skill);

    }

    if(id==="whirlwind"){

        whirlwind(skill);

    }

    if(id==="rage"){

        rageSkill(skill);

    }

    if(id==="execution"){

        execution(skill);

    }

    if(id==="rain"){

        rainSkill(skill);

    }

    if(id==="ash"){

        ashSkill(skill);

    }

    updateUI();

}

function powerStrike(){

    const e=findNearestEnemy(150);

    if(!e){

        showMessage("No hay enemigo cerca");

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

function healSkill(skill){

    const heal=
        Math.round(
            player.maxHp*skill.heal
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

function whirlwind(skill){

    effectCircle(
        player.x,
        player.y,
        skill.radius
    );

    for(const e of enemies){

        if(e.hp<=0)continue;

        const d=distance(player,e);

        if(d<=skill.radius){

            const damage=
                Math.round(
                    player.damage*skill.damage
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

function rageSkill(skill){

    rageTimer=skill.duration;

    floatingText(
        player.x,
        player.y-45,
        "🔥 FURIA"
    );

}

function execution(skill){

    const e=findNearestEnemy(160);

    if(!e){

        showMessage("No hay enemigo cerca");

        return;

    }

    let damage=
        player.damage*skill.damage;

    if(e.hp/e.maxHp<.4){

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

function rainSkill(skill){

    effectCircle(
        player.x,
        player.y,
        skill.radius
    );

    for(const e of enemies){

        if(e.hp<=0)continue;

        if(distance(player,e)<=skill.radius){

            const damage=
                Math.round(
                    player.damage*skill.damage
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

function ashSkill(skill){

    effectCircle(
        player.x,
        player.y,
        skill.radius
    );

    for(const e of enemies){

        if(e.hp<=0)continue;

        if(distance(player,e)<=skill.radius){

            const damage=
                Math.round(
                    player.damage*skill.damage
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

function effectCircle(x,y,radius){

    effects.push({

        x,
        y,
        radius,
        life:.4,
        maxLife:.4

    });

}

function updateEffects(dt){

    for(let i=effects.length-1;i>=0;i--){

        effects[i].life-=dt;

        if(effects[i].life<=0){

            effects.splice(i,1);

        }

    }

}

/* =========================================================
   FLOATING TEXT
========================================================= */

const floatingTexts=[];

function floatingText(x,y,text){

    floatingTexts.push({

        x,
        y,
        text,
        life:1

    });

}

/* =========================================================
   NPC INTERACCIÓN
========================================================= */

canvas.addEventListener("dblclick",()=>{

    interactNPC();

});

function interactNPC(){

    let nearest=null;
    let best=95;

    for(const npc of npcs){

        const d=distance(player,npc);

        if(d<best){

            best=d;
            nearest=npc;

        }

    }

    if(!nearest)return;

    openNPC(nearest);

}

function openNPC(npc){

    const panel=
        document.getElementById("npcPanel");

    const title=
        document.getElementById("npcTitle");

    const content=
        document.getElementById("npcContent");

    title.textContent=
        npc.icon+" "+npc.name;

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

        `;

        questProgress("talk",1,"guardian");

    }

    if(npc.type==="blacksmith"){

        content.innerHTML=`

        <div class="npcDialogue">

        Soy Aldric, el herrero.
        Puedo mejorar tu equipo cuando consigas
        suficientes materiales.

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

    const q=quests.find(x=>x.id===id);

    if(!q)return;

    if(q.accepted){

        showMessage("Ya aceptaste esta misión");

        return;

    }

    q.accepted=true;

    showMessage(
        "Misión aceptada: "+q.title
    );

    updateQuestUI();

    saveGame();

}

function questProgress(type,amount,target){

    for(const q of quests){

        if(!q.accepted || q.completed)continue;

        if(q.type===type){

            if(
                !q.target ||
                q.target===target
            ){

                q.progress+=amount;

                if(q.progress>=q.needed){

                    q.progress=q.needed;

                    completeQuest(q);

                }

            }

        }

    }

    updateQuestUI();

}

function completeQuest(q){

    q.completed=true;

    inventory.gold+=q.rewardGold;

    player.xp+=q.rewardXP;

    showMessage(
        "🎉 Misión completada: "+
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
            q=>q.accepted&&!q.completed
        );

    const text=
        document.getElementById("questText");

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

        showMessage("No tienes suficiente oro");

        return;

    }

    inventory.gold-=25;

    inventory.potions++;

    showMessage("Compraste una poción");

    updateUI();

    saveGame();

}

function buyBait(){

    if(inventory.gold<5){

        showMessage("No tienes suficiente oro");

        return;

    }

    inventory.gold-=5;

    inventory.fish++;

    showMessage("Compraste cebo");

    updateUI();

    saveGame();

}

/* =========================================================
   MEJORAS
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

    player.damage+=5;

    showMessage(
        "🗡️ Espada mejorada"
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

    player.defense+=3;

    showMessage(
        "🛡️ Armadura mejorada"
    );

    updateUI();
    saveGame();

}

/* =========================================================
   INFO HABILIDADES
========================================================= */

function showSkillsInfo(){

    const content=
        document.getElementById("npcContent");

    content.innerHTML=`

    <div>

    ${skills.map(s=>`

        <div class="questItem">

        ${s.icon}
        <b>${s.name}</b>

        <br>

        Nivel requerido:
        ${s.level}

        <br>

        ${s.description}

        </div>

    `).join("")}

    </div>

    `;

}

/* =========================================================
   INVENTARIO UI
========================================================= */

function renderInventory(){

    const content=
        document.getElementById("inventoryContent");

    const items=[

        ["🪵","Madera",inventory.wood],
        ["🪨","Piedra",inventory.stone],
        ["🟠","Cobre",inventory.copper],
        ["⚙️","Hierro",inventory.iron],
        ["🐟","Pescado",inventory.fish],
        ["🧪","Poción",inventory.potions],
        ["🥩","Carne",inventory.meat],
        ["🐺","Colmillo de lobo",inventory.wolfFang],
        ["👂","Oreja de goblin",inventory.goblinEar],
        ["🟤","Cuero",inventory.leather]

    ];

    content.innerHTML=`

        <div class="goldText">
        💰 Oro: ${inventory.gold}
        </div>

        <br>

        <div class="inventoryGrid">

        ${items.map(item=>`

            <div class="slot">

                ${item[0]}

                <div class="slotName">
                    ${item[1]}
                </div>

                <div class="slotQty">
                    ${item[2]}
                </div>

            </div>

        `).join("")}

        </div>

    `;

}

/* =========================================================
   PERSONAJE UI
========================================================= */

function renderCharacter(){

    document.getElementById("panelLevel")
    .textContent=player.level;

    document.getElementById("panelHp")
    .textContent=
        Math.round(player.maxHp);

    document.getElementById("panelMana")
    .textContent=
        Math.round(player.maxMana);

    document.getElementById("panelDamage")
    .textContent=
        Math.round(player.damage);

    document.getElementById("panelDefense")
    .textContent=
        Math.round(player.defense);

    document.getElementById("panelSpeed")
    .textContent=
        Math.round(player.speed);

    const content=
        document.getElementById("equipmentContent");

    const slots=[

        ["🗡️","Arma","weapon"],
        ["🪖","Casco","helmet"],
        ["🥋","Armadura","armor"],
        ["👢","Botas","boots"],
        ["🛡️","Escudo","shield"]

    ];

    content.innerHTML=

        slots.map(s=>{

            const item=equipment[s[2]];

            return `

            <div class="itemButton">

            ${s[0]}
            <b>${s[1]}:</b>
            ${item.name}

            <br>

            ⚔️ ${item.damage}
            🛡️ ${item.defense}

            </div>

            `;

        }).join("");

}

/* =========================================================
   QUEST UI
========================================================= */

function renderQuests(){

    const content=
        document.getElementById("questsContent");

    content.innerHTML=
        quests.map(q=>`

        <div class="questItem ${q.completed?"done":""}">

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
            :q.accepted
            ?"🟡 ACTIVA"
            :"⚪ NO ACEPTADA"
        }

        </div>

        `).join("");

}

/* =========================================================
   BOTONES UI
========================================================= */

document.getElementById("inventoryButton")
.addEventListener("pointerdown",()=>{

    renderInventory();

    document
        .getElementById("inventoryPanel")
        .classList.add("open");

});

document.getElementById("characterButton")
.addEventListener("pointerdown",()=>{

    renderCharacter();

    document
        .getElementById("characterPanel")
        .classList.add("open");

});

document.getElementById("questsButton")
.addEventListener("pointerdown",()=>{

    renderQuests();

    document
        .getElementById("questsPanel")
        .classList.add("open");

});

document.getElementById("shopButton")
.addEventListener("pointerdown",()=>{

    const npc=npcs.find(
        n=>n.type==="merchant"
    );

    openNPC(npc);

});

/* cerrar paneles */

document.querySelectorAll(".closePanel")
.forEach(btn=>{

    btn.addEventListener("pointerdown",()=>{

        btn.parentElement
            .classList.remove("open");

    });

});

/* =========================================================
   SUBIR DE NIVEL
========================================================= */

function checkLevelUp(){

    while(player.xp>=player.xpNeeded){

        player.xp-=player.xpNeeded;

        player.level++;

        player.xpNeeded=
            Math.floor(
                player.xpNeeded*1.35
            );

        player.maxHp+=25;

        player.maxMana+=12;

        player.damage+=6;

        player.defense+=2;

        player.hp=player.maxHp;

        player.mana=player.maxMana;

        showMessage(
            "🎉 ¡SUBISTE A NIVEL "+
            player.level+
            "!"
        );

        const unlocked=
            skills.find(
                s=>s.level===player.level
            );

        if(unlocked){

            setTimeout(()=>{

                showMessage(
                    "✨ Nueva habilidad: "+
                    unlocked.name
                );

            },900);

        }

    }

    updateSkills();

}

/* =========================================================
   ACTUALIZAR SKILLS
========================================================= */

function updateSkills(){

    document.querySelectorAll(".skill")
    .forEach(el=>{

        const id=el.dataset.id;

        const skill=
            skills.find(
                s=>s.id===id
            );

        const locked=
            player.level<skill.level;

        el.classList.toggle(
            "locked",
            locked
        );

        const cd=
            el.querySelector(".cooldown");

        const remaining=
            skillCooldowns[id]||0;

        if(remaining>0){

            cd.textContent=
                Math.ceil(remaining);

            cd.style.display="flex";

        }
        else{

            cd.textContent="";

            cd.style.display="none";

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

    document
        .getElementById("deathScreen")
        .style.display="flex";

}

function respawn(){

    player.dead=false;

    player.x=respawnPoint.x;
    player.y=respawnPoint.y;

    player.hp=player.maxHp;
    player.mana=player.maxMana;

    player.respawnTimer=0;

    document
        .getElementById("deathScreen")
        .style.display="none";

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
            player.hp/player.maxHp*100
        );

    const manaPercent=
        player.mana/player.maxMana*100;

    const xpPercent=
        player.xp/player.xpNeeded*100;

    document.getElementById("hpBar")
        .style.width=hpPercent+"%";

    document.getElementById("manaBar")
        .style.width=manaPercent+"%";

    document.getElementById("xpBar")
        .style.width=xpPercent+"%";

    document.getElementById("hpText")
        .textContent=
        Math.round(player.hp)+
        " / "+
        Math.round(player.maxHp);

    document.getElementById("manaText")
        .textContent=
        Math.round(player.mana)+
        " / "+
        Math.round(player.maxMana);

    document.getElementById("xpText")
        .textContent=
        Math.round(player.xp)+
        " / "+
        Math.round(player.xpNeeded);

    document.getElementById("level")
        .textContent=
        "Nv. "+player.level;

    document.getElementById("gold")
        .textContent=inventory.gold;

    document.getElementById("wood")
        .textContent=inventory.wood;

    document.getElementById("stone")
        .textContent=inventory.stone;

    document.getElementById("copper")
        .textContent=inventory.copper;

    document.getElementById("iron")
        .textContent=inventory.iron;

    document.getElementById("fish")
        .textContent=inventory.fish;

    updateSkills();

}

/* =========================================================
   MENSAJES
========================================================= */

let messageTimer=null;

function showMessage(text){

    const el=
        document.getElementById("message");

    el.textContent=text;

    el.style.display="block";

    clearTimeout(messageTimer);

    messageTimer=
        setTimeout(()=>{

            el.style.display="none";

        },2200);

}

/* =========================================================
   DIBUJO DEL TERRENO
========================================================= */

function drawTerrain(){

    const startX=
        Math.floor(camera.x/TILE)-1;

    const startY=
        Math.floor(camera.y/TILE)-1;

    const endX=
        Math.ceil(
            (camera.x+W)/TILE
        )+1;

    const endY=
        Math.ceil(
            (camera.y+H)/TILE
        )+1;

    for(let ty=startY;ty<endY;ty++){

        for(let tx=startX;tx<endX;tx++){

            if(tx<0||ty<0)continue;

            const x=tx*TILE;
            const y=ty*TILE;

            const t=
                terrainAt(
                    x+TILE/2,
                    y+TILE/2
                );

            if(t===TERRAIN.GRASS){

                ctx.fillStyle="#476c3d";

            }

            if(t===TERRAIN.WATER){

                ctx.fillStyle="#24577a";

            }

            if(t===TERRAIN.SAND){

                ctx.fillStyle="#a99458";

            }

            if(t===TERRAIN.FOREST){

                ctx.fillStyle="#315638";

            }

            if(t===TERRAIN.ROCK){

                ctx.fillStyle="#5c5c58";

            }

            ctx.fillRect(
                x-camera.x,
                y-camera.y,
                TILE+1,
                TILE+1
            );

            /* detalles */

            if(t===TERRAIN.GRASS){

                ctx.fillStyle="rgba(30,70,30,.22)";

                for(let i=0;i<3;i++){

                    const gx=
                        x+rand(8,56)-camera.x;

                    const gy=
                        y+rand(8,56)-camera.y;

                    ctx.fillRect(
                        gx,
                        gy,
                        3,
                        8
                    );

                }

            }

            if(t===TERRAIN.WATER){

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
        respawnPoint.x-camera.x;

    const cy=
        respawnPoint.y-camera.y;

    /* plaza */

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

    /* caminos */

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

    /* casas */

    drawHouse(cx-210,cy-180);
    drawHouse(cx+150,cy-180);
    drawHouse(cx-210,cy+100);
    drawHouse(cx+150,cy+100);

    /* fuente */

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

    /* bandera */

    ctx.fillStyle="#493421";

    ctx.fillRect(
        cx-3,
        cy-115,
        6,
        65
    );

    ctx.fillStyle="#b62c2c";

    ctx.beginPath();

    ctx.moveTo(cx,cy-115);
    ctx.lineTo(cx+45,cy-100);
    ctx.lineTo(cx,cy-85);
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

    ctx.moveTo(x-70,y-40);
    ctx.lineTo(x,y-100);
    ctx.lineTo(x+70,y-40);

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
   RECURSOS DIBUJADOS
========================================================= */

function drawResources(){

    for(const r of resources){

        if(!r.alive)continue;

        const sx=r.x-camera.x;
        const sy=r.y-camera.y;

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

            ctx.moveTo(sx-25,sy+20);
            ctx.lineTo(sx-18,sy-15);
            ctx.lineTo(sx+4,sy-28);
            ctx.lineTo(sx+28,sy-8);
            ctx.lineTo(sx+20,sy+25);

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

            ctx.moveTo(sx-22,sy+20);
            ctx.lineTo(sx-18,sy-20);
            ctx.lineTo(sx+10,sy-27);
            ctx.lineTo(sx+27,sy+7);
            ctx.lineTo(sx+10,sy+25);

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
   NPC DIBUJO
========================================================= */

function drawNPCs(){

    for(const npc of npcs){

        const sx=npc.x-camera.x;
        const sy=npc.y-camera.y;

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
   ENEMIGO DIBUJO
========================================================= */

function drawEnemies(){

    for(const e of enemies){

        if(e.hp<=0)continue;

        const sx=e.x-camera.x;
        const sy=e.y-camera.y;

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

        /* ojos */

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

        ctx.fillStyle="#e22";

        ctx.fillRect(
            sx-28,
            sy-e.radius-12,
            56*Math.max(
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

    /* sombra */

    ctx.fillStyle="rgba(0,0,0,.35)";

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

    /* capa */

    ctx.fillStyle="#6b1e25";

    ctx.beginPath();

    ctx.moveTo(-17,5);
    ctx.lineTo(17,5);
    ctx.lineTo(25,38);
    ctx.lineTo(-25,38);

    ctx.closePath();

    ctx.fill();

    /* cuerpo */

    ctx.fillStyle="#596673";

    ctx.fillRect(
        -17,
        -5,
        34,
        38
    );

    /* armadura */

    ctx.fillStyle="#9ba7af";

    ctx.fillRect(
        -13,
        -3,
        26,
        28
    );

    /* cabeza */

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

    /* casco */

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

    /* ojos */

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

    /* espada */

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

    /* animación ataque */

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

        const sx=e.x-camera.x;
        const sy=e.y-camera.y;

        const alpha=
            e.life/e.maxLife;

        ctx.strokeStyle=
            `rgba(255,220,80,${alpha})`;

        ctx.lineWidth=6;

        ctx.beginPath();

        ctx.arc(
            sx,
            sy,
            e.radius*(1-alpha*.15),
            0,
            Math.PI*2
        );

        ctx.stroke();

    }

}

/* =========================================================
   FLOATING TEXT DIBUJO
========================================================= */

function drawFloatingTexts(dt){

    for(let i=floatingTexts.length-1;i>=0;i--){

        const f=floatingTexts[i];

        f.life-=dt;
        f.y-=25*dt;

        const sx=f.x-camera.x;
        const sy=f.y-camera.y;

        ctx.globalAlpha=
            Math.max(
                0,
                f.life
            );

        ctx.fillStyle="#fff";

        ctx.font="bold 14px Arial";

        ctx.textAlign="center";

        ctx.fillText(
            f.text,
            sx,
            sy
        );

        ctx.globalAlpha=1;

        if(f.life<=0){

            floatingTexts.splice(i,1);

        }

    }

}

/* =========================================================
   MINIMAPA
========================================================= */

function drawMinimap(){

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

    for(let y=0;y<size;y+=5){

        for(let x=0;x<size;x+=5){

            const wx=x/scale;
            const wy=y/scale;

            const t=
                terrainAt(wx,wy);

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

        quests

    };

    localStorage.setItem(
        "reinosDeCenizaRPG",
        JSON.stringify(save)
    );

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

        const save=JSON.parse(raw);

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

            for(const slot in save.equipment){

                if(equipment[slot]){

                    Object.assign(
                        equipment[slot],
                        save.equipment[slot]
                    );

                }

            }

        }

        if(Array.isArray(save.quests)){

            for(const oldQuest of save.quests){

                const q=
                    quests.find(
                        x=>x.id===oldQuest.id
                    );

                if(q){

                    Object.assign(
                        q,
                        oldQuest
                    );

                }

            }

        }

        if(player.hp<=0){

            player.hp=player.maxHp;
            player.mana=player.maxMana;

            player.x=respawnPoint.x;
            player.y=respawnPoint.y;

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
            document.getElementById("deathTimer");

        timer.textContent=
            "Regresando en "+
            Math.ceil(
                player.respawnTimer
            )+
            "...";

        if(player.respawnTimer<=0){

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

    for(const skill of skills){

        if(skillCooldowns[skill.id]){

            skillCooldowns[skill.id]=
                Math.max(
                    0,
                    skillCooldowns[skill.id]-dt
                );

        }

    }

    updateEnemies(dt);

    updateEffects(dt);

    drawFloatingTexts(dt);

    for(const r of resources){

        if(!r.alive){

            r.respawn-=dt;

            if(r.respawn<=0){

                r.alive=true;
                r.hp=r.maxHp;

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

let lastTime=performance.now();

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

/* =========================================================
   MENSAJE INICIAL
========================================================= */

setTimeout(()=>{

    showMessage(
        "🏰 Bienvenido a Reinos de Ceniza"
    );

},800);


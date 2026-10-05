"use strict";

/* =========================================================
   ⚔️ REINOS DE CENIZA
   BASE RPG PRINCIPAL
   ========================================================= */

const canvas =
document.getElementById("world");

const ctx =
canvas.getContext("2d");

const miniCanvas =
document.getElementById("miniCanvas");

const miniCtx =
miniCanvas.getContext("2d");

ctx.imageSmoothingEnabled = true;

const WORLD_WIDTH = 5000;
const WORLD_HEIGHT = 5000;
const TILE = 64;

let screenWidth =
window.innerWidth;

let screenHeight =
window.innerHeight;

let dpr =
Math.min(
window.devicePixelRatio || 1,
2
);

const respawnPoint = {

x: WORLD_WIDTH / 2,

y: WORLD_HEIGHT / 2

};

const camera = {

x: 0,

y: 0

};

/* =========================================================
 UTILIDADES
 ========================================================= */

function clamp(v,min,max){

return Math.max(
min,
Math.min(max,v)
);

}

function random(min,max){

return Math.random() *
(max-min) + min;

}

function randomInt(min,max){

return Math.floor(
random(min,max+1)
);

}

function dist(a,b){

return Math.hypot(
a.x-b.x,
a.y-b.y
);

}

/* =========================================================
 CANVAS
 ========================================================= */

function resize(){

screenWidth =
window.innerWidth;

screenHeight =
window.innerHeight;

dpr =
Math.min(
window.devicePixelRatio || 1,
2
);

canvas.width =
screenWidth*dpr;

canvas.height =
screenHeight*dpr;

canvas.style.width =
screenWidth+"px";

canvas.style.height =
screenHeight+"px";

ctx.setTransform(
dpr,
0,
0,
dpr,
0,
0
);

miniCanvas.width=220;
miniCanvas.height=220;

}

window.addEventListener(
"resize",
resize
);

resize();

/* =========================================================
 JUGADOR RPG
 ========================================================= */

const player={

x:respawnPoint.x,

y:respawnPoint.y,

radius:22,

speed:260,

level:1,

xp:0,

xpNeeded:100,

hp:100,

maxHp:100,

mana:50,

maxMana:50,

damage:25,

defense:5,

attackRange:105,

attackCooldown:0,

attackDelay:.55,

directionX:0,

directionY:1,

dead:false,

respawnTimer:0,

attackAnimation:0,

skillAnimation:0

};

/* =========================================================
 HERRAMIENTAS
 ========================================================= */

const tools={

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

const resourceTools={

tree:"axe",

rock:"pickaxe",

copper:"pickaxe",

iron:"pickaxe"

};

/* =========================================================
 INVENTARIO
 ========================================================= */

const inventory={

gold:0,

wood:0,

stone:0,

copper:0,

iron:0,

fish:0

};

/* =========================================================
 HABILIDADES
 ========================================================= */

const skills=[

{

id:"power",

name:"Golpe Poderoso",

icon:"⚔️",

level:2,

mana:8,

cooldown:8,

damage:2,

description:
"Golpe que causa daño aumentado."

},

{

id:"heal",

name:"Curación",

icon:"💚",

level:3,

mana:15,

cooldown:12,

heal:.35,

description:
"Recupera parte de tu vida."

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

description:
"Golpea a todos los enemigos cercanos."

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

description:
"Aumenta temporalmente el daño."

},

{

id:"execution",

name:"Ejecución",

icon:"💀",

level:10,

mana:25,

cooldown:25,

damage:3,

description:
"Devastador contra enemigos heridos."

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

description:
"Una lluvia de ataques golpea la zona."

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

description:
"Tu ataque definitivo."

}

];

const skillCooldowns={};

let rageTimer=0;

/* =========================================================
 CREAR BARRA HABILIDADES
 ========================================================= */

function createSkillBar(){

const container =
document.getElementById(
"skills"
);

container.innerHTML="";

skills.forEach(
(skill,index)=>{

const button =
document.createElement("div");

button.className=
"skill";

button.id=
"skill-"+skill.id;

button.innerHTML=`

<div class="skill-icon">
${skill.icon}
</div>

<div class="skill-name">
${skill.name}
</div>

<div class="skill-level">
Nv. ${skill.level}
</div>

<div class="skill-cooldown">
<span>0</span>
</div>

`;

button.addEventListener(
"touchstart",
function(e){

e.preventDefault();

useSkill(skill.id);

},
{passive:false}
);

button.addEventListener(
"mousedown",
function(e){

e.preventDefault();

useSkill(skill.id);

}
);

container.appendChild(
button
);

}
);

updateSkills();

}

function updateSkills(){

skills.forEach(
skill=>{

const el =
document.getElementById(
"skill-"+skill.id
);

if(!el) return;

if(
player.level >=
skill.level
){

el.classList.add(
"unlocked"
);

el.classList.remove(
"locked"
);

}else{

el.classList.add(
"locked"
);

el.classList.remove(
"unlocked"
);

}

const cd =
skillCooldowns[
skill.id
] || 0;

if(cd>0){

el.classList.add(
"on-cooldown"
);

const number =
el.querySelector(
".skill-cooldown span"
);

if(number){

number.textContent=
Math.ceil(cd);

}

}else{

el.classList.remove(
"on-cooldown"
);

}

}
);

}

/* =========================================================
 USAR HABILIDAD
 ========================================================= */

function useSkill(id){

if(player.dead)
return;

const skill =
skills.find(
s=>s.id===id
);

if(!skill)
return;

if(
player.level <
skill.level
){

showMessage(
"🔒 Desbloqueas "+skill.name+
" en nivel "+skill.level
);

return;

}

const cd =
skillCooldowns[id] || 0;

if(cd>0){

showMessage(
"⏳ Habilidad en enfriamiento"
);

return;

}

if(
player.mana <
skill.mana
){

showMessage(
"💙 No tienes suficiente maná"
);

return;

}

player.mana -=
skill.mana;

skillCooldowns[id]=
skill.cooldown;

player.skillAnimation=.5;

if(id==="power"){

powerStrike(skill);

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

executionSkill(skill);

}

if(id==="rain"){

rainSkill(skill);

}

if(id==="ash"){

ashSkill(skill);

}

}

/* =========================================================
 GOLPE PODEROSO
 ========================================================= */

function powerStrike(skill){

let target =
nearestEnemy(
player.attackRange+30
);

if(!target){

showMessage(
"⚔️ No hay enemigo cerca"
);

return;

}

const damage =
Math.floor(
player.damage *
skill.damage
);

damageEnemy(
target,
damage
);

floatingText(
"⚔️ "+damage,
target.x,
target.y-35,
"#ffcc33"
);

player.attackAnimation=.25;

}

/* =========================================================
 CURACIÓN
 ========================================================= */

function healSkill(skill){

const amount =
Math.floor(
player.maxHp *
skill.heal
);

player.hp =
clamp(
player.hp+amount,
0,
player.maxHp
);

floatingText(
"💚 +"+amount,
player.x,
player.y-45,
"#5cff88"
);

showMessage(
"💚 Curación"
);

}

/* =========================================================
 TORBELLINO
 ========================================================= */

function whirlwind(skill){

let count=0;

for(
const enemy of enemies
){

if(enemy.dead)
continue;

if(
dist(player,enemy)
<=skill.radius
){

const damage =
Math.floor(
player.damage *
skill.damage
);

damageEnemy(
enemy,
damage
);

count++;

floatingText(
"🌀 "+damage,
enemy.x,
enemy.y-35,
"#62c8ff"
);

}

}

player.skillAnimation=.8;

showMessage(
"🌀 Torbellino golpeó "+
count+
" enemigos"
);

}

/* =========================================================
 FURIA
 ========================================================= */

function rageSkill(skill){

rageTimer=
skill.duration;

showMessage(
"🔥 ¡FURIA ACTIVADA!"
);

floatingText(
"🔥 FURIA",
player.x,
player.y-60,
"#ff7b22"
);

}

/* =========================================================
 EJECUCIÓN
 ========================================================= */

function executionSkill(skill){

let target=
nearestEnemy(
player.attackRange+20
);

if(!target){

showMessage(
"💀 No hay objetivo"
);

return;

}

let multiplier=
skill.damage;

if(
target.hp <
target.maxHp*.4
){

multiplier*=1.5;

}

const damage=
Math.floor(
player.damage *
multiplier
);

damageEnemy(
target,
damage
);

floatingText(
"💀 "+damage,
target.x,
target.y-40,
"#ff4040"
);

}

/* =========================================================
 LLUVIA DE ESPADAS
 ========================================================= */

function rainSkill(skill){

let count=0;

for(
const enemy of enemies
){

if(enemy.dead)
continue;

if(
dist(player,enemy)
<=skill.radius
){

const damage=
Math.floor(
player.damage*
skill.damage
);

damageEnemy(
enemy,
damage
);

floatingText(
"⚔️ "+damage,
enemy.x,
enemy.y-40,
"#ffdd55"
);

count++;

}

}

player.skillAnimation=1;

showMessage(
"⚔️ Lluvia de Espadas: "+
count+
" objetivos"
);

}

/* =========================================================
 IRA DE CENIZA
 ========================================================= */

function ashSkill(skill){

let count=0;

for(
const enemy of enemies
){

if(enemy.dead)
continue;

if(
dist(player,enemy)
<=skill.radius
){

const damage=
Math.floor(
player.damage*
skill.damage
);

damageEnemy(
enemy,
damage
);

floatingText(
"🔥 "+damage,
enemy.x,
enemy.y-45,
"#ff5722"
);

count++;

}

}

player.skillAnimation=1.5;

showMessage(
"🔥 ¡IRA DE CENIZA!"
);

}

/* =========================================================
 ENEMIGOS
 ========================================================= */

const enemyTypes={

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

const enemies=[];

function spawnEnemy(type){

const data=
enemyTypes[type];

let x,y;

let tries=0;

do{

x=random(
200,
WORLD_WIDTH-200
);

y=random(
200,
WORLD_HEIGHT-200
);

tries++;

}
while(
Math.hypot(
x-player.x,
y-player.y
)<550 &&
tries<100
);

enemies.push({

type,

name:data.name,

x,

y,

radius:data.radius,

hp:data.hp,

maxHp:data.hp,

damage:data.damage,

speed:data.speed,

xp:data.xp,

gold:data.gold,

attackCooldown:
random(0,1),

hitFlash:0,

dead:false

});

}

function generateEnemies(){

for(
let i=0;
i<30;
i++
){

const r=
Math.random();

if(r<.4)
spawnEnemy("wolf");

else if(r<.7)
spawnEnemy("boar");

else if(r<.94)
spawnEnemy("goblin");

else
spawnEnemy("orc");

}

}

/* =========================================================
 DAÑO
 ========================================================= */

function damageEnemy(
enemy,
damage
){

enemy.hp -=
damage;

enemy.hitFlash=.15;

if(
enemy.hp<=0
){

enemy.dead=true;

gainXP(
enemy.xp
);

inventory.gold +=
enemy.gold;

floatingText(
"💰 +"+enemy.gold,
enemy.x,
enemy.y-60,
"#ffd54f"
);

showMessage(
"👹 "+enemy.name+
" derrotado  +"+
enemy.xp+
" XP"
);

saveGame();

}

}

/* =========================================================
 ENEMIGO MÁS CERCANO
 ========================================================= */

function nearestEnemy(range){

let target=null;

let nearest=range;

for(
const enemy of enemies
){

if(enemy.dead)
continue;

const d=
dist(player,enemy);

if(
d<=nearest
){

nearest=d;

target=enemy;

}

}

return target;

}

/* =========================================================
 TERRENO
 ========================================================= */

const terrain=[];

const TYPES={
GRASS:0,
WATER:1,
SAND:2,
FOREST:3,
ROCK:4
};

function generateTerrain(){

const cols=
Math.ceil(
WORLD_WIDTH/TILE
);

const rows=
Math.ceil(
WORLD_HEIGHT/TILE
);

for(
let y=0;
y<rows;
y++
){

for(
let x=0;
x<cols;
x++
){

const n=
Math.sin(x*.45)+
Math.cos(y*.35);

let type=TYPES.GRASS;

if(n<-1.5){

type=TYPES.WATER;

}else if(n>1.6){

type=TYPES.FOREST;

}else{

const r=
Math.random();

if(r<.06)
type=TYPES.SAND;

else if(r<.10)
type=TYPES.ROCK;

}

terrain.push({
x:x*TILE,
y:y*TILE,
type
});

}

}

}

/* =========================================================
 RECURSOS
 ========================================================= */

const resources=[];

function addResource(
type,
x,
y
){

resources.push({

type,

x,

y,

radius:22,

hp:
type==="tree"?3:2,

maxHp:
type==="tree"?3:2,

respawnTimer:0

});

}

function generateResources(){

for(
let i=0;
i<300;
i++
){

const roll=
Math.random();

let type;

if(roll<.48)
type="tree";

else if(roll<.70)
type="rock";

else if(roll<.86)
type="copper";

else
type="iron";

addResource(
type,
random(100,WORLD_WIDTH-100),
random(100,WORLD_HEIGHT-100)
);

}

}

/* =========================================================
 JOYSTICK
 ========================================================= */

const joystick=
document.getElementById(
"joystick"
);

const knob=
document.getElementById(
"joystickKnob"
);

let joyX=0;
let joyY=0;
let joyActive=false;

function updateJoystick(
x,
y
){

const rect=
joystick.getBoundingClientRect();

const cx=
rect.left+
rect.width/2;

const cy=
rect.top+
rect.height/2;

let dx=x-cx;
let dy=y-cy;

const max=
48;

const len=
Math.hypot(dx,dy);

if(len>max){

dx=
dx/len*max;

dy=
dy/len*max;

}

joyX=
dx/max;

joyY=
dy/max;

knob.style.transform=
`translate(${dx}px,${dy}px)`;

}

function resetJoystick(){

joyX=0;
joyY=0;
joyActive=false;

knob.style.transform=
"translate(0,0)";

}

joystick.addEventListener(
"touchstart",
e=>{

e.preventDefault();

joyActive=true;

const t=e.touches[0];

updateJoystick(
t.clientX,
t.clientY
);

},
{passive:false}
);

joystick.addEventListener(
"touchmove",
e=>{

e.preventDefault();

if(!joyActive)
return;

const t=e.touches[0];

updateJoystick(
t.clientX,
t.clientY
);

},
{passive:false}
);

joystick.addEventListener(
"touchend",
resetJoystick
);

joystick.addEventListener(
"touchcancel",
resetJoystick
);

/* =========================================================
 TECLADO
 ========================================================= */

const keys={};

window.addEventListener(
"keydown",
e=>{

keys[
e.key.toLowerCase()
]=true;

if(e.key===" ")
attack();

}
);

window.addEventListener(
"keyup",
e=>{

keys[
e.key.toLowerCase()
]=false;

}
);

/* =========================================================
 MOVIMIENTO
 ========================================================= */

function updateMovement(dt){

if(player.dead)
return;

let x=joyX;
let y=joyY;

if(
keys["w"]||
keys["arrowup"]
)
y--;

if(
keys["s"]||
keys["arrowdown"]
)
y++;

if(
keys["a"]||
keys["arrowleft"]
)
x--;

if(
keys["d"]||
keys["arrowright"]
)
x++;

const len=
Math.hypot(x,y);

if(len>0){

x/=len;
y/=len;

player.directionX=x;
player.directionY=y;

player.x+=
x*player.speed*dt;

player.y+=
y*player.speed*dt;

}

player.x=
clamp(
player.x,
30,
WORLD_WIDTH-30
);

player.y=
clamp(
player.y,
30,
WORLD_HEIGHT-30
);

}

/* =========================================================
 ATAQUE
 ========================================================= */

function attack(){

if(player.dead)
return;

if(player.attackCooldown>0)
return;

player.attackCooldown=
player.attackDelay;

const target=
nearestEnemy(
player.attackRange
);

if(!target){

showMessage(
"⚔️ No hay enemigo cerca"
);

return;

}

let damage=
randomInt(
Math.floor(
player.damage*.8
),
Math.floor(
player.damage*1.2
)
);

if(rageTimer>0){

damage=
Math.floor(
damage*1.7
);

}

damageEnemy(
target,
damage
);

player.attackAnimation=.2;

floatingText(
"⚔️ "+damage,
target.x,
target.y-30,
"#fff"
);

}

/* =========================================================
 BOTÓN ATAQUE
 ========================================================= */

const attackButton=
document.getElementById(
"attackButton"
);

attackButton.addEventListener(
"touchstart",
e=>{

e.preventDefault();

attack();

},
{passive:false}
);

attackButton.addEventListener(
"mousedown",
attack
);

/* =========================================================
 DOBLE TOQUE RECURSOS
 ========================================================= */

let lastTap=0;

canvas.addEventListener(
"touchend",
e=>{

const now=
Date.now();

if(
now-lastTap<350
){

gatherResource();

}

lastTap=now;

},
{passive:true}
);

/* =========================================================
 RECOLECTAR
 ========================================================= */

function gatherResource(){

if(player.dead)
return;

let target=null;

let nearest=80;

for(
const r of resources
){

if(r.hp<=0)
continue;

const d=
dist(player,r);

if(
d<nearest
){

nearest=d;

target=r;

}

}

if(!target){

showMessage(
"Busca un recurso cercano"
);

return;

}

const tool=
resourceTools[
target.type
];

if(
!tools[tool]||
!tools[tool].equipped
){

showMessage(
"Necesitas "+tools[tool].name
);

return;

}

target.hp--;

if(target.hp<=0){

target.respawnTimer=
random(15,35);

let amount;

if(target.type==="tree"){

amount=
randomInt(2,5);

inventory.wood+=amount;

showMessage(
"🌲 +"+amount+
" madera"
);

}

else if(
target.type==="rock"
){

amount=
randomInt(2,4);

inventory.stone+=amount;

showMessage(
"🪨 +"+amount+
" piedra"
);

}

else if(
target.type==="copper"
){

amount=
randomInt(1,3);

inventory.copper+=amount;

showMessage(
"🟠 +"+amount+
" cobre"
);

}

else{

amount=
randomInt(1,3);

inventory.iron+=amount;

showMessage(
"⚙️ +"+amount+
" hierro"
);

}

saveGame();

}else{

showMessage(
"⛏️ Recolectando..."
);

}

}

/* =========================================================
 UPDATE ENEMIGOS
 ========================================================= */

function updateEnemies(dt){

for(
const enemy of enemies
){

if(enemy.dead)
continue;

enemy.attackCooldown-=dt;

if(enemy.hitFlash>0)
enemy.hitFlash-=dt;

if(player.dead)
continue;

const dx=
player.x-enemy.x;

const dy=
player.y-enemy.y;

const d=
Math.hypot(dx,dy);

if(d<500){

if(d>58){

enemy.x+=
dx/d*
enemy.speed*
dt;

enemy.y+=
dy/d*
enemy.speed*
dt;

}

if(
d<=58 &&
enemy.attackCooldown<=0
){

enemy.attackCooldown=1.2;

let damage=
randomInt(
Math.floor(
enemy.damage*.8
),
Math.floor(
enemy.damage*1.2
)
);

damage=
Math.max(
1,
damage-player.defense*.35
);

player.hp-=damage;

floatingText(
"-"+Math.floor(damage),
player.x,
player.y-35,
"#ff4444"
);

if(player.hp<=0){

die();

}

}

}

}

}

/* =========================================================
 RESPAWN ENEMIGOS
 ========================================================= */

function maintainEnemies(){

let alive=0;

for(
const e of enemies
){

if(!e.dead)
alive++;

}

while(alive<30){

const r=Math.random();

if(r<.4)
spawnEnemy("wolf");

else if(r<.7)
spawnEnemy("boar");

else if(r<.94)
spawnEnemy("goblin");

else
spawnEnemy("orc");

alive++;

}

}

/* =========================================================
 MUERTE
 ========================================================= */

function die(){

if(player.dead)
return;

player.hp=0;

player.dead=true;

player.respawnTimer=3;

showMessage(
"💀 Has muerto..."
);

}

function updateRespawn(dt){

if(!player.dead)
return;

player.respawnTimer-=dt;

if(
player.respawnTimer<=0
){

player.dead=false;

player.hp=
player.maxHp;

player.mana=
player.maxMana;

player.x=
respawnPoint.x;

player.y=
respawnPoint.y;

showMessage(
"✨ Has vuelto a la vida"
);

saveGame();

}

}

/* =========================================================
 EXPERIENCIA
 ========================================================= */

function gainXP(amount){

player.xp+=amount;

while(
player.xp>=
player.xpNeeded
){

player.xp-=
player.xpNeeded;

levelUp();

}

}

function levelUp(){

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

const unlocked=
skills.find(
s=>s.level===player.level
);

if(unlocked){

showMessage(
"🎉 NIVEL "+
player.level+
" — Nueva habilidad: "+
unlocked.name
);

floatingText(
unlocked.icon+
" NUEVA HABILIDAD",
player.x,
player.y-70,
"#ffd54f"
);

}else{

showMessage(
"🎉 ¡Nivel "+
player.level+
"!"
);

}

updateSkills();

saveGame();

}

/* =========================================================
 RECURSOS UPDATE
 ========================================================= */

function updateResources(dt){

for(
const r of resources
){

if(r.hp<=0){

r.respawnTimer-=dt;

if(
r.respawnTimer<=0
){

r.hp=
r.maxHp;

}

}

}

}

/* =========================================================
 RAGE
 ========================================================= */

function updateRage(dt){

if(rageTimer>0){

rageTimer-=dt;

if(rageTimer<=0){

showMessage(
"🔥 Furia terminó"
);

}

}

}

/* =========================================================
 COOLDOWNS
 ========================================================= */

function updateCooldowns(dt){

for(
const id in skillCooldowns
){

if(
skillCooldowns[id]>0
){

skillCooldowns[id]-=dt;

if(
skillCooldowns[id]<0
)
skillCooldowns[id]=0;

}

}

updateSkills();

}

/* =========================================================
 TEXTOS FLOTANTES
 ========================================================= */

const floatingTexts=[];

function floatingText(
text,
x,
y,
color
){

floatingTexts.push({

text,

x,

y,

color,

life:1

});

}

function updateFloating(dt){

for(
let i=
floatingTexts.length-1;
i>=0;
i--
){

const t=
floatingTexts[i];

t.life-=dt;

t.y-=35*dt;

if(t.life<=0){

floatingTexts.splice(
i,
1
);

}

}

}

/* =========================================================
 MENSAJES
 ========================================================= */

let messageTimer=0;

function showMessage(text){

const el=
document.getElementById(
"message"
);

el.textContent=text;

el.style.opacity=1;

messageTimer=2;

}

function updateMessage(dt){

if(messageTimer<=0)
return;

messageTimer-=dt;

if(messageTimer<=0){

document.getElementById(
"message"
).style.opacity=0;

}

}

/* =========================================================
 CÁMARA
 ========================================================= */

function updateCamera(){

camera.x=
clamp(
player.x-screenWidth/2,
0,
WORLD_WIDTH-screenWidth
);

camera.y=
clamp(
player.y-screenHeight/2,
0,
WORLD_HEIGHT-screenHeight
);

}

/* =========================================================
 DIBUJAR TERRENO
 ========================================================= */

function drawTerrain(){

const cols=
Math.ceil(
WORLD_WIDTH/TILE
);

const startX=
Math.max(
0,
Math.floor(
camera.x/TILE
)-1
);

const endX=
Math.min(
cols,
Math.ceil(
(camera.x+
screenWidth)/TILE
)+1
);

const startY=
Math.max(
0,
Math.floor(
camera.y/TILE
)-1
);

const endY=
Math.min(
cols,
Math.ceil(
(camera.y+
screenHeight)/TILE
)+1
);

for(
let y=startY;
y<endY;
y++
){

for(
let x=startX;
x<endX;
x++
){

const tile=
terrain[
y*cols+x
];

if(!tile)
continue;

const sx=
tile.x-camera.x;

const sy=
tile.y-camera.y;

if(
tile.type===TYPES.GRASS
){

ctx.fillStyle="#39743b";

}

else if(
tile.type===TYPES.WATER
){

ctx.fillStyle="#185e83";

}

else if(
tile.type===TYPES.SAND
){

ctx.fillStyle="#b79a59";

}

else if(
tile.type===TYPES.FOREST
){

ctx.fillStyle="#24552c";

}

else{

ctx.fillStyle="#575957";

}

ctx.fillRect(
sx,
sy,
TILE+1,
TILE+1
);

/* textura */

if(
tile.type===
TYPES.GRASS
){

ctx.fillStyle=
"rgba(255,255,255,.035)";

for(
let i=0;
i<3;
i++
){

ctx.fillRect(
sx+
randomInt(5,55),
sy+
randomInt(5,55),
2,
5
);

}

}

}

}

}

/* =========================================================
 DIBUJAR RECURSOS
 ========================================================= */

function drawResource(r){

if(r.hp<=0)
return;

const x=
r.x-camera.x;

const y=
r.y-camera.y;

if(
x<-60||
y<-60||
x>screenWidth+60||
y>screenHeight+60
)
return;

ctx.save();

if(r.type==="tree"){

/* sombra */

ctx.fillStyle=
"rgba(0,0,0,.3)";

ctx.beginPath();

ctx.ellipse(
x,
y+25,
28,
10,
0,
0,
Math.PI*2
);

ctx.fill();

/* tronco */

ctx.fillStyle="#684027";

ctx.fillRect(
x-8,
y-3,
16,
35
);

/* copa */

ctx.fillStyle="#123e20";

ctx.beginPath();

ctx.arc(
x,
y-17,
29,
0,
Math.PI*2
);

ctx.fill();

ctx.fillStyle="#276b32";

ctx.beginPath();

ctx.arc(
x-12,
y-24,
18,
0,
Math.PI*2
);

ctx.fill();

ctx.fillStyle="#398b3e";

ctx.beginPath();

ctx.arc(
x+11,
y-20,
15,
0,
Math.PI*2
);

ctx.fill();

}

else{

let color=
r.type==="rock"
?"#777":
r.type==="copper"
?"#a95b32":
"#4b555c";

ctx.fillStyle=color;

ctx.beginPath();

ctx.moveTo(
x-23,y+12
);

ctx.lineTo(
x-14,y-15
);

ctx.lineTo(
x+4,y-22
);

ctx.lineTo(
x+25,y-2
);

ctx.lineTo(
x+15,y+20
);

ctx.lineTo(
x-10,y+23
);

ctx.closePath();

ctx.fill();

ctx.fillStyle=
"rgba(255,255,255,.25)";

ctx.beginPath();

ctx.arc(
x-7,
y-7,
5,
0,
Math.PI*2
);

ctx.fill();

}

/* círculo de interacción */

ctx.strokeStyle=
r.type==="tree"
?"rgba(255,214,70,.55)"
:"rgba(255,180,40,.55)";

ctx.lineWidth=2;

ctx.beginPath();

ctx.arc(
x,
y+20,
27,
0,
Math.PI*2
);

ctx.stroke();

ctx.restore();

}

/* =========================================================
 DIBUJAR ENEMIGO
 ========================================================= */

function drawEnemy(e){

if(e.dead)
return;

const x=
e.x-camera.x;

const y=
e.y-camera.y;

if(
x<-70||
y<-70||
x>screenWidth+70||
y>screenHeight+70
)
return;

ctx.save();

if(e.hitFlash>0)
ctx.globalAlpha=.5;

ctx.fillStyle=
e.type==="wolf"
?"#505761":
e.type==="boar"
?"#75452c":
e.type==="goblin"
?"#4e9148":
"#713c32";

/* sombra */

ctx.fillStyle=
"rgba(0,0,0,.3)";

ctx.beginPath();

ctx.ellipse(
x,
y+e.radius*.7,
e.radius,
e.radius*.35,
0,
0,
Math.PI*2
);

ctx.fill();

/* cuerpo */

ctx.fillStyle=
e.type==="wolf"
?"#555d65":
e.type==="boar"
?"#75452c":
e.type==="goblin"
?"#4d8c46":
"#74392f";

ctx.beginPath();

ctx.ellipse(
x,
y,
e.radius,
e.radius*.75,
0,
0,
Math.PI*2
);

ctx.fill();

/* ojos */

ctx.fillStyle="#ffdd55";

ctx.beginPath();

ctx.arc(
x-7,
y-6,
3,
0,
Math.PI*2
);

ctx.arc(
x+7,
y-6,
3,
0,
Math.PI*2
);

ctx.fill();

/* barra vida */

ctx.fillStyle="#111";

ctx.fillRect(
x-28,
y-e.radius-15,
56,
6
);

ctx.fillStyle="#d62929";

ctx.fillRect(
x-28,
y-e.radius-15,
56*
Math.max(
0,
e.hp/e.maxHp
),
6
);

/* nombre */

ctx.fillStyle="#fff";

ctx.font=
"bold 11px Arial";

ctx.textAlign="center";

ctx.fillText(
e.name,
x,
y-e.radius-19
);

ctx.restore();

}

/* =========================================================
 DIBUJAR PERSONAJE RPG
 ========================================================= */

function drawPlayer(){

const x=
player.x-camera.x;

const y=
player.y-camera.y;

ctx.save();

/* sombra */

ctx.fillStyle=
"rgba(0,0,0,.4)";

ctx.beginPath();

ctx.ellipse(
x,
y+22,
25,
9,
0,
0,
Math.PI*2
);

ctx.fill();

/* aura de furia */

if(rageTimer>0){

ctx.strokeStyle=
"rgba(255,90,20,.7)";

ctx.lineWidth=4;

ctx.beginPath();

ctx.arc(
x,
y,
34+
Math.sin(
performance.now()/80
)*3,
0,
Math.PI*2
);

ctx.stroke();

}

/* capa */

ctx.fillStyle="#202b3a";

ctx.beginPath();

ctx.moveTo(
x-17,
y-4
);

ctx.lineTo(
x-31,
y+30
);

ctx.lineTo(
x+4,
y+20
);

ctx.closePath();

ctx.fill();

/* piernas */

ctx.fillStyle="#161b21";

ctx.fillRect(
x-13,
y+8,
9,
22
);

ctx.fillRect(
x+5,
y+8,
9,
22
);

/* botas */

ctx.fillStyle="#111";

ctx.fillRect(
x-16,
y+27,
13,
7
);

ctx.fillRect(
x+4,
y+27,
13,
7
);

/* cuerpo armadura */

ctx.fillStyle="#334657";

ctx.beginPath();

ctx.roundRect(
x-19,
y-14,
38,
31,
8
);

ctx.fill();

/* placas */

ctx.fillStyle="#71808c";

ctx.fillRect(
x-16,
y-10,
32,
7
);

ctx.fillStyle="#526471";

ctx.fillRect(
x-14,
y,
28,
5
);

/* cabeza */

ctx.fillStyle="#c78963";

ctx.beginPath();

ctx.arc(
x,
y-25,
13,
0,
Math.PI*2
);

ctx.fill();

/* cabello */

ctx.fillStyle="#16191d";

ctx.beginPath();

ctx.arc(
x,
y-29,
14,
Math.PI,
Math.PI*2
);

ctx.fill();

ctx.fillRect(
x-13,
y-31,
26,
8
);

/* casco */

ctx.fillStyle="#202c36";

ctx.beginPath();

ctx.arc(
x,
y-30,
16,
Math.PI,
Math.PI*2
);

ctx.fill();

ctx.fillStyle="#9ba7ad";

ctx.fillRect(
x-14,
y-30,
28,
6
);

/* espada */

const angle=
Math.atan2(
player.directionY,
player.directionX
);

ctx.save();

ctx.translate(
x,
y
);

ctx.rotate(
angle
);

ctx.strokeStyle="#dfe9ed";

ctx.lineWidth=6;

ctx.beginPath();

ctx.moveTo(
16,
-3
);

ctx.lineTo(
46,
-3
);

ctx.stroke();

ctx.strokeStyle="#8d5d2c";

ctx.lineWidth=5;

ctx.beginPath();

ctx.moveTo(
10,
-3
);

ctx.lineTo(
20,
-3
);

ctx.stroke();

ctx.restore();

/* ataque */

if(
player.attackAnimation>0
){

ctx.strokeStyle=
"rgba(255,255,255,.85)";

ctx.lineWidth=5;

ctx.beginPath();

ctx.arc(
x,
y,
47,
angle-.7,
angle+.7
);

ctx.stroke();

}

ctx.restore();

}

/* =========================================================
 EFECTOS DE HABILIDADES
 ========================================================= */

function drawSkillEffect(){

if(
player.skillAnimation<=0
)
return;

const x=
player.x-camera.x;

const y=
player.y-camera.y;

ctx.save();

ctx.globalAlpha=
player.skillAnimation;

ctx.strokeStyle=
rageTimer>0
?"#ff6b22"
:"#ffe16a";

ctx.lineWidth=5;

ctx.beginPath();

ctx.arc(
x,
y,
70+
(1-player.skillAnimation)*
160,
0,
Math.PI*2
);

ctx.stroke();

ctx.restore();

}

/* =========================================================
 TEXTOS
 ========================================================= */

function drawFloatingTexts(){

for(
const t of floatingTexts
){

ctx.save();

ctx.globalAlpha=
Math.max(
0,
t.life
);

ctx.font=
"bold 15px Arial";

ctx.textAlign="center";

ctx.strokeStyle="#000";

ctx.lineWidth=3;

ctx.strokeText(
t.text,
t.x-camera.x,
t.y-camera.y
);

ctx.fillStyle=t.color;

ctx.fillText(
t.text,
t.x-camera.x,
t.y-camera.y
);

ctx.restore();

}

}

/* =========================================================
 MINI MAPA
 ========================================================= */

function drawMinimap(){

const w=220;
const h=220;

miniCtx.clearRect(
0,
0,
w,
h
);

miniCtx.fillStyle="#173d22";

miniCtx.fillRect(
0,
0,
w,
h
);

/* agua */

miniCtx.fillStyle="#185c82";

miniCtx.fillRect(
0,
h*.72,
w,
h*.28
);

/* caminos */

miniCtx.strokeStyle="#a48751";

miniCtx.lineWidth=8;

miniCtx.beginPath();

miniCtx.moveTo(
0,
h*.52
);

miniCtx.lineTo(
w,
h*.48
);

miniCtx.stroke();

/* jugador */

const px=
player.x/
WORLD_WIDTH*
w;

const py=
player.y/
WORLD_HEIGHT*
h;

miniCtx.fillStyle="#fff";

miniCtx.beginPath();

miniCtx.arc(
px,
py,
5,
0,
Math.PI*2
);

miniCtx.fill();

/* enemigos */

miniCtx.fillStyle="#f33";

for(
const e of enemies
){

if(e.dead)
continue;

const ex=
e.x/
WORLD_WIDTH*
w;

const ey=
e.y/
WORLD_HEIGHT*
h;

miniCtx.beginPath();

miniCtx.arc(
ex,
ey,
2,
0,
Math.PI*2
);

miniCtx.fill();

}

}

/* =========================================================
 HUD
 ========================================================= */

function updateHUD(){

const hpBar=
document.getElementById(
"hpBar"
);

const manaBar=
document.getElementById(
"manaBar"
);

const xpBar=
document.getElementById(
"xpBar"
);

hpBar.style.width=
player.hp/
player.maxHp*
100+"%";

manaBar.style.width=
player.mana/
player.maxMana*
100+"%";

xpBar.style.width=
player.xp/
player.xpNeeded*
100+"%";

document.getElementById(
"level"
).textContent=
player.level;

document.getElementById(
"hpText"
).textContent=
Math.ceil(player.hp)+
" / "+
player.maxHp;

document.getElementById(
"manaText"
).textContent=
Math.ceil(player.mana)+
" / "+
player.maxMana;

document.getElementById(
"xpText"
).textContent=
Math.floor(player.xp)+
" / "+
player.xpNeeded+
" XP";

document.getElementById(
"gold"
).textContent=
inventory.gold;

document.getElementById(
"wood"
).textContent=
inventory.wood;

document.getElementById(
"stone"
).textContent=
inventory.stone;

document.getElementById(
"copper"
).textContent=
inventory.copper;

document.getElementById(
"iron"
).textContent=
inventory.iron;

document.getElementById(
"fish"
).textContent=
inventory.fish;

document.getElementById(
"panelLevel"
).textContent=
player.level;

document.getElementById(
"panelHp"
).textContent=
Math.floor(player.hp)+
" / "+
player.maxHp;

document.getElementById(
"panelMana"
).textContent=
Math.floor(player.mana)+
" / "+
player.maxMana;

document.getElementById(
"panelDamage"
).textContent=
player.damage;

document.getElementById(
"panelDefense"
).textContent=
player.defense;

document.getElementById(
"panelSpeed"
).textContent=
player.speed;

}

/* =========================================================
 PANELES
 ========================================================= */

function toggleCharacter(){

const p=
document.getElementById(
"characterPanel"
);

p.style.display=
p.style.display==="block"
?"none"
:"block";

updateHUD();

}

function toggleInventory(){

const p=
document.getElementById(
"inventoryPanel"
);

p.style.display=
p.style.display==="block"
?"none"
:"block";

}

function showQuest(){

showMessage(
"📜 Misión: explora, recolecta y derrota enemigos."
);

}

function showShop(){

showMessage(
"🏪 Tienda: próximamente"
);

}

/* =========================================================
 GUARDADO
 ========================================================= */

function saveGame(){

if(
player.dead||
player.hp<=0
)
return;

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

inventory:{
...inventory
}

};

try{

localStorage.setItem(
"reinosDeCenizaRPG",
JSON.stringify(save)
);

}catch(e){

console.warn(e);

}

}

/* =========================================================
 CARGAR
 ========================================================= */

function loadGame(){

try{

const raw=
localStorage.getItem(
"reinosDeCenizaRPG"
);

if(!raw)
return;

const save=
JSON.parse(raw);

if(save.player){

player.x=
save.player.x||
respawnPoint.x;

player.y=
save.player.y||
respawnPoint.y;

player.level=
save.player.level||
1;

player.xp=
save.player.xp||
0;

player.xpNeeded=
save.player.xpNeeded||
100;

player.maxHp=
save.player.maxHp||
100;

player.maxMana=
save.player.maxMana||
50;

player.damage=
save.player.damage||
25;

player.defense=
save.player.defense||
5;

if(
!save.player.hp||
save.player.hp<=0
){

player.hp=
player.maxHp;

player.mana=
player.maxMana;

player.x=
respawnPoint.x;

player.y=
respawnPoint.y;

}else{

player.hp=
clamp(
save.player.hp,
1,
player.maxHp
);

player.mana=
clamp(
save.player.mana||0,
0,
player.maxMana
);

}

}

if(save.inventory){

inventory.gold=
save.inventory.gold||0;

inventory.wood=
save.inventory.wood||0;

inventory.stone=
save.inventory.stone||0;

inventory.copper=
save.inventory.copper||0;

inventory.iron=
save.inventory.iron||0;

inventory.fish=
save.inventory.fish||0;

}

}catch(e){

console.warn(
"Error cargando partida",
e
);

}

}

/* =========================================================
 UPDATE
 ========================================================= */

function update(dt){

dt=
Math.min(
dt,
.05
);

if(
player.attackCooldown>0
)
player.attackCooldown-=dt;

if(
player.attackAnimation>0
)
player.attackAnimation-=dt;

if(
player.skillAnimation>0
)
player.skillAnimation-=dt;

updateMovement(dt);

updateEnemies(dt);

updateResources(dt);

updateRespawn(dt);

updateRage(dt);

updateCooldowns(dt);

updateFloating(dt);

updateMessage(dt);

maintainEnemies();

updateHUD();

}

/* =========================================================
 RENDER
 ========================================================= */

function render(){

ctx.clearRect(
0,
0,
screenWidth,
screenHeight
);

updateCamera();

drawTerrain();

for(
const r of resources
)
drawResource(r);

for(
const e of enemies
)
drawEnemy(e);

drawSkillEffect();

drawPlayer();

drawFloatingTexts();

if(player.dead){

ctx.fillStyle=
"rgba(0,0,0,.5)";

ctx.fillRect(
0,
0,
screenWidth,
screenHeight
);

ctx.fillStyle="#fff";

ctx.font=
"bold 28px Arial";

ctx.textAlign="center";

ctx.fillText(
"💀 HAS MUERTO",
screenWidth/2,
screenHeight/2
);

ctx.font=
"18px Arial";

ctx.fillText(
"Reviviendo en "+
Math.ceil(
player.respawnTimer
),
screenWidth/2,
screenHeight/2+35
);

}

drawMinimap();

}

/* =========================================================
 LOOP
 ========================================================= */

let lastTime=
performance.now();

function loop(now){

let dt=
(now-lastTime)/1000;

lastTime=now;

update(dt);

render();

requestAnimationFrame(
loop
);

}

/* =========================================================
 INICIO
 ========================================================= */

generateTerrain();

generateResources();

generateEnemies();

loadGame();

createSkillBar();

updateHUD();

showMessage(
"⚔️ Bienvenido a Reinos de Ceniza"
);

requestAnimationFrame(
loop
);

setInterval(
saveGame,
10000
);

console.log(
"⚔️ REINOS DE CENIZA RPG INICIADO"
);

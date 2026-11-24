// Druhy stromov pre 18-jamkové ihrisko a okolie areálu (2026-11-24): borovica, tuja, agát, javor, dub, lipa, ker, smrek (len pri Kaštieli).
// Generátor PT je kópia bloku PT z 3d/index.html (akadémia) + nové druhy (zdroj: project files for-app-nahlad/modely-stromov/zdroj/extra.js).
// Akadémia používa svoj vlastný PT v index.html – tento súbor ju neovplyvňuje.
import * as THREE from "three";
const PMOB=matchMedia("(pointer:coarse)").matches||/iPhone|iPad|Android/i.test(navigator.userAgent);
const PT=(()=>{const V3=THREE.Vector3,DEG=Math.PI/180;
/*GEN-START*/
function rng(a){
  return function(){
    a|=0;a=a+0x6D2B79F5|0;
    var t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return((t^t>>>14)>>>0)/4294967296;
  };
}
/* Parametre stromov. Jednotky sú metre, základ kmeňa je v bode (0,0,0).
   cx,cy,cz + rx,ry,rz: elipsoid, do ktorého sa koruna drží.
   Polia s indexom [0..5] sú úrovne konárov: 0 kmeň, 1 hlavné konáre, 2..5 stále jemnejšie. */
var PARAMS={
  t1:{
    cx:0.2,cy:5.7,cz:0,rx:4.9,ry:3.5,rz:4.5,
    maxLevel:5,maxSeg:40000,minR:0.007,pull:1.3,
    rad0:0.19,lean:[0.03,0.02],
    len:[2.3,4.9,2.7,1.5,0.85,0.5],
    seg:[5,8,5,4,3,3],
    taper:[0.55,0.3,0.25,0.25,0.3,0.4],
    wobble:[0.03,0.10,0.18,0.26,0.32,0.32],
    tropism:[0,0.05,0.03,0.0,-0.02,-0.04],
    spread:[0,0.05,0.05,0.04,0.02,0.0],
    kids:[5,6,5,4,3,0],
    kidStart:[0.8,0.35,0.3,0.25,0.2,0],
    angle:[0,42,52,55,55,60],
    radRatio:[0,0.52,0.62,0.65,0.68,0.7],
    tipShrink:0.4,leaderAng:8,leaderLen:0.9,leaderRad:0.8,
    extras:[{dir:[1,0.45,0.1],len:5.0}],
    barkColor:0x6e6154,twigColor:0x4f3f31,
    leafLevel:4,leafProb:0.5,maxLeaves:6000
  },
  t2:{
    cx:0.4,cy:8.8,cz:0,rx:3.9,ry:5.8,rz:3.7,
    maxLevel:5,maxSeg:40000,minR:0.007,pull:1.3,
    rad0:0.30,lean:[0.02,0.0],
    len:[3.5,5.8,3.0,1.7,0.9,0.5],
    seg:[6,8,5,4,3,3],
    taper:[0.6,0.35,0.28,0.28,0.3,0.4],
    wobble:[0.03,0.09,0.16,0.22,0.28,0.3],
    tropism:[0,0.09,0.06,0.03,0.0,-0.01],
    spread:[0,0.03,0.04,0.03,0.02,0.0],
    kids:[5,7,6,5,4,0],
    kidStart:[0.85,0.28,0.28,0.25,0.2,0],
    angle:[0,22,48,52,55,60],
    radRatio:[0,0.55,0.62,0.66,0.68,0.7],
    tipShrink:0.4,leaderAng:6,leaderLen:1.0,leaderRad:0.85,
    extras:[{dir:[-0.8,0.6,0.1],len:3.6}],
    barkColor:0x6a5f52,twigColor:0x55432f,
    leafLevel:4,leafProb:0.3,maxLeaves:6000
  },
  /* stromy vľavo od greenu 2 (podľa Martinovej zimnej fotky, listy doplnené) */
  t3:{ /* strom 15: vysoký štíhly listnáč, rovný kmeň až po vrchol, konáre šikmo nahor */
    cx:0,cy:8.6,cz:0,rx:3.3,ry:4.9,rz:3.1,
    maxLevel:5,maxSeg:40000,minR:0.007,pull:1.3,
    rad0:0.22,lean:[0.02,0.01],
    len:[5.6,4.6,2.4,1.4,0.8,0.45],
    seg:[7,8,5,4,3,3],
    taper:[0.5,0.3,0.25,0.25,0.3,0.4],
    wobble:[0.02,0.08,0.16,0.24,0.3,0.3],
    tropism:[0,0.1,0.06,0.03,0.0,-0.02],
    spread:[0,0.02,0.03,0.03,0.02,0.0],
    kids:[7,6,5,4,3,0],
    kidStart:[0.45,0.3,0.3,0.25,0.2,0],
    angle:[0,26,44,50,55,60],
    radRatio:[0,0.45,0.6,0.65,0.68,0.7],
    tipShrink:0.45,leaderAng:3,leaderLen:1.5,leaderRad:0.85,
    barkColor:0x6b6258,twigColor:0x4d3f33,
    leafLevel:4,leafProb:0.4,maxLeaves:6000
  },
  t4:{ /* strom 13: nízky strom v strede, krátky kmeň rozdelený na niekoľko kmeňov, okrúhla koruna */
    cx:0.1,cy:4.3,cz:0,rx:3.3,ry:2.7,rz:3.1,
    maxLevel:5,maxSeg:30000,minR:0.007,pull:1.3,
    rad0:0.13,lean:[0.04,0.0],
    len:[1.3,3.4,2.0,1.2,0.7,0.4],
    seg:[3,7,5,4,3,3],
    taper:[0.7,0.35,0.28,0.28,0.3,0.4],
    wobble:[0.03,0.14,0.22,0.28,0.32,0.32],
    tropism:[0,0.04,0.02,0.0,-0.02,-0.03],
    spread:[0,0.06,0.05,0.04,0.02,0.0],
    kids:[4,5,5,4,3,0],
    kidStart:[0.7,0.3,0.3,0.25,0.2,0],
    angle:[0,34,50,55,55,60],
    radRatio:[0,0.62,0.6,0.65,0.68,0.7],
    tipShrink:0.35,leaderAng:10,leaderLen:0.8,leaderRad:0.7,
    barkColor:0x5f564c,twigColor:0x4a3a2e,
    leafLevel:4,leafProb:0.5,maxLeaves:4000
  },
  t5:{ /* strom 14: vpravo, kmeň mierne naklonený a rozdvojený vo ~3 m, previsnuté vetvičky (lusky v zime) */
    cx:0.4,cy:7.0,cz:0,rx:3.8,ry:3.9,rz:3.5,
    maxLevel:5,maxSeg:40000,minR:0.007,pull:1.3,
    rad0:0.2,lean:[0.06,0.02],
    len:[3.1,4.6,2.6,1.5,0.85,0.5],
    seg:[5,8,5,4,3,3],
    taper:[0.55,0.3,0.25,0.25,0.3,0.4],
    wobble:[0.03,0.1,0.18,0.26,0.32,0.32],
    tropism:[0,0.06,0.02,-0.02,-0.05,-0.07],
    spread:[0,0.04,0.05,0.04,0.02,0.0],
    kids:[4,6,5,4,3,0],
    kidStart:[0.85,0.35,0.3,0.25,0.2,0],
    angle:[0,30,50,55,58,62],
    radRatio:[0,0.6,0.62,0.65,0.68,0.7],
    tipShrink:0.4,leaderAng:7,leaderLen:1.0,leaderRad:0.75,
    extras:[{dir:[0.9,0.7,0.2],len:4.2}],
    barkColor:0x6a5e52,twigColor:0x52412f,
    leafLevel:4,leafProb:0.5,maxLeaves:6000
  },
  t6:{ /* nový malý strom úplne vľavo (mladý, štíhly) */
    cx:0,cy:4.2,cz:0,rx:2.2,ry:2.4,rz:2.1,
    maxLevel:5,maxSeg:20000,minR:0.006,pull:1.3,
    rad0:0.09,lean:[-0.03,0.02],
    len:[2.4,2.6,1.5,0.9,0.55,0.35],
    seg:[4,6,4,4,3,3],
    taper:[0.55,0.3,0.25,0.25,0.3,0.4],
    wobble:[0.04,0.12,0.2,0.26,0.3,0.3],
    tropism:[0,0.06,0.03,0.0,-0.02,-0.03],
    spread:[0,0.04,0.04,0.03,0.02,0.0],
    kids:[5,5,4,4,3,0],
    kidStart:[0.55,0.3,0.3,0.25,0.2,0],
    angle:[0,32,48,52,55,60],
    radRatio:[0,0.5,0.6,0.65,0.68,0.7],
    tipShrink:0.4,leaderAng:6,leaderLen:1.0,leaderRad:0.8,
    barkColor:0x6b6258,twigColor:0x4f4035,
    leafLevel:4,leafProb:0.5,maxLeaves:2500
  },
  /* stromy medzi jamkou 1 a 3 – skupina pri jamke 1 vľavo (Martinova fotka 1, zimná, listy doplnené) */
  t7:{ /* vysoký strom vpravo: rovný kmeň až hore, konáre šikmo nahor, vyššia oválna koruna */
    cx:0.2,cy:9.0,cz:0,rx:3.7,ry:4.6,rz:3.5,
    maxLevel:5,maxSeg:40000,minR:0.007,pull:1.3,
    rad0:0.25,lean:[0.02,0.0],
    len:[6.2,4.8,2.5,1.4,0.8,0.45],
    seg:[7,8,5,4,3,3],
    taper:[0.5,0.3,0.25,0.25,0.3,0.4],
    wobble:[0.02,0.08,0.16,0.24,0.3,0.3],
    tropism:[0,0.09,0.05,0.02,0.0,-0.02],
    spread:[0,0.03,0.04,0.03,0.02,0.0],
    kids:[7,6,5,4,3,0],
    kidStart:[0.42,0.3,0.3,0.25,0.2,0],
    angle:[0,32,46,52,55,60],
    radRatio:[0,0.45,0.6,0.65,0.68,0.7],
    tipShrink:0.45,leaderAng:3,leaderLen:1.4,leaderRad:0.85,
    barkColor:0x6b6258,twigColor:0x4d3f33,
    leafLevel:4,leafProb:0.4,maxLeaves:6000
  },
  t8:{ /* stromček v strede (v zime oranžové listy): krátky kmeň, hustá vajcovitá koruna */
    cx:0,cy:5.4,cz:0,rx:2.7,ry:3.5,rz:2.6,
    maxLevel:5,maxSeg:30000,minR:0.007,pull:1.4,
    rad0:0.14,lean:[0.02,0.01],
    len:[2.6,3.2,1.8,1.1,0.65,0.4],
    seg:[4,7,5,4,3,3],
    taper:[0.55,0.32,0.26,0.26,0.3,0.4],
    wobble:[0.03,0.1,0.18,0.26,0.3,0.3],
    tropism:[0,0.08,0.04,0.01,-0.01,-0.02],
    spread:[0,0.03,0.04,0.03,0.02,0.0],
    kids:[6,6,5,4,3,0],
    kidStart:[0.5,0.3,0.3,0.25,0.2,0],
    angle:[0,30,46,52,55,60],
    radRatio:[0,0.55,0.6,0.65,0.68,0.7],
    tipShrink:0.4,leaderAng:4,leaderLen:1.5,leaderRad:0.85,
    barkColor:0x655a4f,twigColor:0x4d3e31,
    leafLevel:4,leafProb:0.6,maxLeaves:5000
  },
  t9:{ /* štíhly strom vľavo: kmeň ~2,5 m, potom veľa tenších konárov nahor, úzka oválna koruna */
    cx:0,cy:6.4,cz:0,rx:2.9,ry:3.8,rz:2.8,
    maxLevel:5,maxSeg:35000,minR:0.007,pull:1.3,
    rad0:0.16,lean:[-0.02,0.01],
    len:[2.6,4.2,2.2,1.3,0.75,0.42],
    seg:[4,8,5,4,3,3],
    taper:[0.6,0.32,0.26,0.26,0.3,0.4],
    wobble:[0.03,0.1,0.18,0.26,0.3,0.3],
    tropism:[0,0.1,0.05,0.02,0.0,-0.02],
    spread:[0,0.02,0.03,0.03,0.02,0.0],
    kids:[6,6,5,4,3,0],
    kidStart:[0.7,0.3,0.3,0.25,0.2,0],
    angle:[0,26,44,50,55,60],
    radRatio:[0,0.55,0.6,0.65,0.68,0.7],
    tipShrink:0.4,leaderAng:5,leaderLen:1.3,leaderRad:0.8,
    barkColor:0x6b6258,twigColor:0x4f4035,
    leafLevel:4,leafProb:0.45,maxLeaves:5000
  },
  /* skupinka vpravo na kopčeku pred greenom 1 (Martinova fotka 2) */
  t10:{ /* tenký šikmý kmeň vľavo, malá riedka koruna hore */
    cx:-1.0,cy:4.9,cz:0,rx:1.5,ry:1.6,rz:1.4,
    maxLevel:5,maxSeg:12000,minR:0.005,pull:1.3,
    rad0:0.07,lean:[-0.22,0.0],
    len:[3.6,1.8,1.1,0.7,0.45,0.3],
    seg:[6,5,4,3,3,3],
    taper:[0.5,0.3,0.25,0.25,0.3,0.4],
    wobble:[0.05,0.14,0.22,0.28,0.3,0.3],
    tropism:[0,0.06,0.03,0.0,-0.02,-0.03],
    spread:[0,0.04,0.04,0.03,0.02,0.0],
    kids:[3,4,4,3,3,0],
    kidStart:[0.65,0.3,0.3,0.25,0.2,0],
    angle:[0,34,48,52,55,60],
    radRatio:[0,0.55,0.6,0.65,0.68,0.7],
    tipShrink:0.4,leaderAng:8,leaderLen:1.0,leaderRad:0.8,
    barkColor:0x5e554b,twigColor:0x4a3c30,
    leafLevel:4,leafProb:0.5,maxLeaves:1100
  },
  t10b:{ /* druhý tenký kmeň, menej naklonený */
    cx:-0.5,cy:4.5,cz:0,rx:1.3,ry:1.4,rz:1.2,
    maxLevel:5,maxSeg:10000,minR:0.005,pull:1.3,
    rad0:0.055,lean:[-0.12,0.03],
    len:[3.3,1.6,1.0,0.65,0.42,0.3],
    seg:[5,5,4,3,3,3],
    taper:[0.5,0.3,0.25,0.25,0.3,0.4],
    wobble:[0.05,0.14,0.22,0.28,0.3,0.3],
    tropism:[0,0.06,0.03,0.0,-0.02,-0.03],
    spread:[0,0.04,0.04,0.03,0.02,0.0],
    kids:[3,4,3,3,3,0],
    kidStart:[0.65,0.3,0.3,0.25,0.2,0],
    angle:[0,34,48,52,55,60],
    radRatio:[0,0.55,0.6,0.65,0.68,0.7],
    tipShrink:0.4,leaderAng:8,leaderLen:1.0,leaderRad:0.8,
    barkColor:0x5e554b,twigColor:0x4a3c30,
    leafLevel:4,leafProb:0.5,maxLeaves:900
  },
  t11:{ /* stredný vyšší strom: krátky kmeň rozdelený na viac kmeňov nahor, hustá koruna */
    cx:0,cy:4.9,cz:0,rx:2.5,ry:3.0,rz:2.4,
    maxLevel:5,maxSeg:30000,minR:0.006,pull:1.4,
    rad0:0.13,lean:[0.02,0.0],
    len:[1.0,3.9,2.0,1.2,0.7,0.4],
    seg:[2,8,5,4,3,3],
    taper:[0.75,0.35,0.28,0.28,0.3,0.4],
    wobble:[0.03,0.1,0.2,0.26,0.3,0.3],
    tropism:[0,0.1,0.05,0.01,-0.01,-0.02],
    spread:[0,0.02,0.04,0.03,0.02,0.0],
    kids:[5,6,5,4,3,0],
    kidStart:[0.5,0.25,0.3,0.25,0.2,0],
    angle:[0,20,44,50,55,60],
    radRatio:[0,0.65,0.6,0.65,0.68,0.7],
    tipShrink:0.35,leaderAng:4,leaderLen:1.0,leaderRad:0.75,
    barkColor:0x5f564c,twigColor:0x4a3a2e,
    leafLevel:4,leafProb:0.55,maxLeaves:4500
  },
  t12:{ /* malý strom vpravo: mladý, niekoľko tenkých kmeňov nahor */
    cx:0,cy:3.7,cz:0,rx:1.7,ry:2.0,rz:1.6,
    maxLevel:5,maxSeg:15000,minR:0.005,pull:1.3,
    rad0:0.08,lean:[0.03,0.0],
    len:[1.2,2.8,1.4,0.85,0.5,0.32],
    seg:[2,6,4,4,3,3],
    taper:[0.7,0.32,0.26,0.26,0.3,0.4],
    wobble:[0.04,0.12,0.2,0.26,0.3,0.3],
    tropism:[0,0.08,0.04,0.0,-0.02,-0.03],
    spread:[0,0.03,0.04,0.03,0.02,0.0],
    kids:[4,5,4,4,3,0],
    kidStart:[0.5,0.3,0.3,0.25,0.2,0],
    angle:[0,22,46,52,55,60],
    radRatio:[0,0.6,0.6,0.65,0.68,0.7],
    tipShrink:0.4,leaderAng:6,leaderLen:0.9,leaderRad:0.75,
    barkColor:0x625a50,twigColor:0x4c3e32,
    leafLevel:4,leafProb:0.5,maxLeaves:2200
  },
  /* kríky živého plotu pri odpalisku 3: úzky vysoký stĺp, ~6 tenkých kmeňov od zeme (viditeľné dole), riedke lístie */
  h1:{
    cx:0,cy:2.1,cz:0,rx:0.72,ry:1.45,rz:0.55,
    maxLevel:4,maxSeg:8000,minR:0.005,pull:2.4,
    rad0:0.05,lean:[0,0],
    len:[0.08,3.1,0.75,0.42,0.26,0.2],
    seg:[1,8,4,3,3,3],
    taper:[0.9,0.4,0.3,0.3,0.35,0.4],
    wobble:[0.02,0.12,0.22,0.3,0.32,0.32],
    tropism:[0,0.08,0.03,0.0,-0.02,-0.02],
    spread:[0,0.03,0,0,0,0],
    kids:[6,9,5,3,0,0],
    kidStart:[0.5,0.12,0.3,0.3,0,0],
    angle:[0,30,48,52,55,60],
    radRatio:[0,0.6,0.45,0.6,0.65,0.7],
    tipShrink:0.3,leaderAng:4,leaderLen:1.0,leaderRad:0.75,
    barkColor:0x6a5a4c,twigColor:0x55463a,
    leafLevel:2,leafProb:0.33,maxLeaves:1500
  },
  /* nové typy podľa Martinových zimných fotiek z ihriska (22.11.) – náhodne na stromy, ktoré ešte nemali vlastný tvar */
  n1:{ /* jemný dvojkmeň (foto pri odpalisku): kmeň sa delí nízko na dva, koruna ako vejár do strán, veľa jemných vetvičiek */
    cx:0.3,cy:5.6,cz:0,rx:3.8,ry:3.5,rz:3.4,
    maxLevel:5,maxSeg:36000,minR:0.006,pull:1.3,
    rad0:0.15,lean:[0.05,0.02],
    len:[1.1,4.6,2.4,1.4,0.8,0.48],
    seg:[2,8,5,4,3,3],
    taper:[0.7,0.32,0.26,0.26,0.3,0.4],
    wobble:[0.03,0.1,0.2,0.28,0.34,0.34],
    tropism:[0,0.07,0.03,0.0,-0.02,-0.03],
    spread:[0,0.05,0.05,0.04,0.02,0.0],
    kids:[2,6,5,4,3,0],
    kidStart:[0.9,0.3,0.3,0.25,0.2,0],
    angle:[0,16,46,54,56,60],
    radRatio:[0,0.75,0.6,0.65,0.68,0.7],
    tipShrink:0.4,leaderAng:12,leaderLen:1.0,leaderRad:0.85,
    extras:[{dir:[-0.45,1,0.15],len:4.3}],
    barkColor:0x655b50,twigColor:0x4b3d31,
    leafLevel:4,leafProb:0.45,maxLeaves:5000
  },
  n2:{ /* viackmenný ker-strom (prúty zo zeme, ~5 m), široký hore */
    cx:0,cy:3.3,cz:0,rx:2.4,ry:2.1,rz:2.2,
    maxLevel:4,maxSeg:16000,minR:0.005,pull:1.6,
    rad0:0.06,lean:[0,0],
    len:[0.1,4.4,1.3,0.7,0.4,0.25],
    seg:[1,8,4,3,3,3],
    taper:[0.9,0.4,0.3,0.3,0.35,0.4],
    wobble:[0.02,0.1,0.22,0.3,0.32,0.32],
    tropism:[0,0.05,0.02,0.0,-0.02,-0.02],
    spread:[0,0.08,0.03,0,0,0],
    kids:[11,7,5,3,0,0],
    kidStart:[0.5,0.25,0.3,0.3,0,0],
    angle:[0,20,46,52,55,60],
    radRatio:[0,0.7,0.5,0.6,0.65,0.7],
    tipShrink:0.3,leaderAng:3,leaderLen:1.0,leaderRad:0.8,
    barkColor:0x7a6c5d,twigColor:0x5a4a3c,
    leafLevel:2,leafProb:0.4,maxLeaves:3000
  },
  n3:{ /* svetlý rovný kmeň, koruna sa rozkladá vysoko a široko (dva stromy pri greene) */
    cx:0,cy:7.2,cz:0,rx:4.2,ry:3.4,rz:3.9,
    maxLevel:5,maxSeg:40000,minR:0.007,pull:1.3,
    rad0:0.2,lean:[0.02,0.0],
    len:[3.6,4.8,2.6,1.5,0.85,0.5],
    seg:[5,8,5,4,3,3],
    taper:[0.55,0.3,0.25,0.25,0.3,0.4],
    wobble:[0.02,0.09,0.17,0.25,0.3,0.3],
    tropism:[0,0.05,0.03,0.0,-0.02,-0.03],
    spread:[0,0.06,0.05,0.04,0.02,0.0],
    kids:[5,6,5,4,3,0],
    kidStart:[0.75,0.3,0.3,0.25,0.2,0],
    angle:[0,40,50,54,56,60],
    radRatio:[0,0.55,0.62,0.65,0.68,0.7],
    tipShrink:0.4,leaderAng:6,leaderLen:0.9,leaderRad:0.8,
    barkColor:0x9a9286,twigColor:0x5c5045,
    leafLevel:4,leafProb:0.4,maxLeaves:6000
  },
  n4:{ /* osamelý štíhly strom pri greene: rovný kmeň, vajcovitá koruna, konáre šikmo nahor */
    cx:0,cy:7.0,cz:0,rx:2.8,ry:4.0,rz:2.6,
    maxLevel:5,maxSeg:36000,minR:0.007,pull:1.3,
    rad0:0.18,lean:[0.01,0.01],
    len:[4.4,4.0,2.1,1.25,0.72,0.42],
    seg:[6,8,5,4,3,3],
    taper:[0.5,0.3,0.25,0.25,0.3,0.4],
    wobble:[0.02,0.08,0.16,0.24,0.3,0.3],
    tropism:[0,0.11,0.06,0.03,0.0,-0.02],
    spread:[0,0.02,0.03,0.03,0.02,0.0],
    kids:[7,6,5,4,3,0],
    kidStart:[0.4,0.3,0.3,0.25,0.2,0],
    angle:[0,24,42,50,55,60],
    radRatio:[0,0.45,0.6,0.65,0.68,0.7],
    tipShrink:0.5,leaderAng:3,leaderLen:1.4,leaderRad:0.85,
    barkColor:0x6b6258,twigColor:0x4d3f33,
    leafLevel:4,leafProb:0.42,maxLeaves:5000
  },
  n5:{ /* agát so strukmi: kmeň rozdvojený vo ~2,5 m, previsnuté konce, listy agáta */
    cx:0.3,cy:6.4,cz:0,rx:3.6,ry:3.6,rz:3.3,
    maxLevel:5,maxSeg:36000,minR:0.007,pull:1.3,
    rad0:0.18,lean:[0.04,0.03],
    len:[2.5,4.4,2.5,1.45,0.82,0.5],
    seg:[4,8,5,4,3,3],
    taper:[0.55,0.3,0.25,0.25,0.3,0.4],
    wobble:[0.03,0.11,0.19,0.27,0.32,0.32],
    tropism:[0,0.05,0.0,-0.03,-0.06,-0.08],
    spread:[0,0.04,0.05,0.04,0.02,0.0],
    kids:[3,6,5,4,3,0],
    kidStart:[0.85,0.35,0.3,0.25,0.2,0],
    angle:[0,28,52,56,58,62],
    radRatio:[0,0.65,0.62,0.65,0.68,0.7],
    tipShrink:0.4,leaderAng:9,leaderLen:1.0,leaderRad:0.8,
    extras:[{dir:[-0.7,0.8,-0.2],len:3.8}],
    barkColor:0x5f554a,twigColor:0x4a3b2f,
    leafLevel:4,leafProb:0.5,maxLeaves:5500
  },
  n6:{ /* stredný strom s niekoľkými šikmými kmeňmi z nízka (vedľa kríka na fotke), riedka koruna */
    cx:0.2,cy:5.2,cz:0,rx:3.0,ry:3.0,rz:2.8,
    maxLevel:5,maxSeg:28000,minR:0.006,pull:1.3,
    rad0:0.12,lean:[0.03,0.0],
    len:[0.7,4.6,2.0,1.15,0.68,0.4],
    seg:[2,8,5,4,3,3],
    taper:[0.75,0.33,0.26,0.26,0.3,0.4],
    wobble:[0.03,0.12,0.2,0.28,0.32,0.32],
    tropism:[0,0.04,0.02,0.0,-0.02,-0.03],
    spread:[0,0.07,0.05,0.04,0.02,0.0],
    kids:[4,6,5,4,3,0],
    kidStart:[0.6,0.3,0.3,0.25,0.2,0],
    angle:[0,30,48,54,56,60],
    radRatio:[0,0.7,0.6,0.65,0.68,0.7],
    tipShrink:0.4,leaderAng:10,leaderLen:0.9,leaderRad:0.75,
    barkColor:0x6a5e52,twigColor:0x4f4034,
    leafLevel:4,leafProb:0.42,maxLeaves:4000
  }
};
PARAMS.h2=PARAMS.h1;PARAMS.h3=PARAMS.h1;
function generate(P,seed){
  var R=rng(seed);
  var pos=[],nor=[],uv=[],col=[],idx=[],sites=[];
  var segCount=0;
  var bark=new THREE.Color(P.barkColor),twig=new THREE.Color(P.twigColor),cc=new THREE.Color();
  var Nv=new V3(),Bv=new V3(),Tv=new V3(),tmpU=new V3(),tmpV=new V3();
  function envF(p){
    var a=(p.x-P.cx)/P.rx,b=(p.y-P.cy)/P.ry,c=(p.z-P.cz)/P.rz;
    return a*a+b*b+c*c;
  }
  function addTube(pts,radii,level){
    var n=pts.length,r0=radii[0];
    var sides=r0>0.14?10:r0>0.05?8:r0>0.018?6:4;
    if(P.lowPoly)sides=r0>0.14?8:r0>0.05?6:r0>0.018?4:3;
    var base=pos.length/3;
    cc.copy(bark).lerp(twig,Math.min(1,level/P.maxLevel*1.15));
    var v=0,haveN=false,i,j;
    for(i=0;i<n;i++){
      if(i===0)Tv.subVectors(pts[1],pts[0]);
      else if(i===n-1)Tv.subVectors(pts[i],pts[i-1]);
      else Tv.subVectors(pts[i+1],pts[i-1]);
      Tv.normalize();
      if(!haveN){Nv.set(0,0,1);if(Math.abs(Tv.z)>0.9)Nv.set(1,0,0);haveN=true;}
      Nv.addScaledVector(Tv,-Nv.dot(Tv)).normalize();
      Bv.crossVectors(Tv,Nv);
      if(i>0)v+=pts[i].distanceTo(pts[i-1]);
      var r=Math.max(radii[i],P.minR);
      for(j=0;j<=sides;j++){
        var a=j/sides*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);
        var nx=Nv.x*ca+Bv.x*sa,ny=Nv.y*ca+Bv.y*sa,nz=Nv.z*ca+Bv.z*sa;
        pos.push(pts[i].x+nx*r,pts[i].y+ny*r,pts[i].z+nz*r);
        nor.push(nx,ny,nz);
        uv.push(j/sides,v*1.6);
        col.push(cc.r,cc.g,cc.b);
      }
    }
    var row=sides+1;
    for(i=0;i<n-1;i++)for(j=0;j<sides;j++){
      var a0=base+i*row+j,b0=a0+1,c0=a0+row,d0=c0+1;
      idx.push(a0,b0,c0,b0,d0,c0);
    }
  }
  function childDir(T,ang,phi){
    tmpU.set(0,1,0);if(Math.abs(T.y)>0.95)tmpU.set(1,0,0);
    tmpU.crossVectors(T,tmpU).normalize();
    tmpV.crossVectors(T,tmpU);
    var c=Math.cos(ang),s=Math.sin(ang);
    return new V3().copy(T).multiplyScalar(c).addScaledVector(tmpU,s*Math.cos(phi)).addScaledVector(tmpV,s*Math.sin(phi)).normalize();
  }
  function branch(p0,d0,len,r0,level){
    if(segCount>P.maxSeg)return;
    var nSeg=P.seg[level],step=len/nSeg;
    var pts=[p0.clone()],dirs=[d0.clone()],radii=[level===0?r0*1.35:r0];
    var p=p0.clone(),d=d0.clone(),i;
    for(i=1;i<=nSeg;i++){
      var w=P.wobble[level];
      d.x+=(R()-.5)*w;d.y+=(R()-.5)*w;d.z+=(R()-.5)*w;
      d.y+=P.tropism[level];
      var hx=p.x-P.cx,hz=p.z-P.cz,hl=Math.hypot(hx,hz)||1;
      d.x+=hx/hl*P.spread[level];d.z+=hz/hl*P.spread[level];
      if(level>0){
        var f=envF(p);
        if(f>0.82){
          var k=Math.min(1.4,(f-0.82)*P.pull);
          var qx=P.cx-p.x,qy=P.cy-p.y,qz=P.cz-p.z,ql=Math.hypot(qx,qy,qz)||1;
          d.x+=qx/ql*k;d.y+=qy/ql*k;d.z+=qz/ql*k;
        }
      }
      d.normalize();
      p.addScaledVector(d,step);
      pts.push(p.clone());dirs.push(d.clone());
      radii.push(r0*(1-(1-P.taper[level])*i/nSeg));
    }
    segCount+=nSeg;
    if(!(P.skipTube&&level>=P.skipTube)&&!(P.woodMax!==undefined&&level>P.woodMax))addTube(pts,radii,level);   // telefón: najjemnejšie vetvičky sa nekreslia (listy na nich zostanú)
    if(level>=P.leafLevel){
      for(i=1;i<=nSeg;i++)if(R()<P.leafProb)sites.push(pts[i].x,pts[i].y,pts[i].z,dirs[i].x,dirs[i].y,dirs[i].z);
    }
    if(level<P.maxLevel){
      var nc=P.kids[level];
      var phi=R()*Math.PI*2;
      var start=Math.max(1,Math.min(nSeg,Math.round(P.kidStart[level]*nSeg)));
      if(level===0){
        var dl=childDir(dirs[nSeg],P.leaderAng*DEG,R()*Math.PI*2);
        branch(pts[nSeg],dl,P.len[1]*P.leaderLen,radii[nSeg]*P.leaderRad,1);
      }
      for(var kk=0;kk<nc;kk++){
        var nodes=nSeg-start+1;
        var ni=Math.min(nSeg,start+Math.floor(kk*nodes/nc));
        var t=ni/nSeg;
        phi+=(level===0&&!P.whorl?(Math.PI*2/nc):2.399963)+(R()-.5)*0.6;
        var ang=P.angle[level+1]*DEG*(0.75+0.5*R());
        var dir=childDir(dirs[ni],ang,phi);
        var lenC=P.len[level+1]*(0.7+0.6*R())*(1-P.tipShrink*(level===0?0:t));if(level===0&&P.cone)lenC*=Math.max(.06,1-P.cone*t);
        var rC=Math.max(P.minR,radii[ni]*P.radRatio[level+1]);
        branch(pts[ni],dir,lenC,rC,level+1);
      }
      if(level===0&&P.extras){
        var en=Math.max(1,nSeg-1);
        for(var e=0;e<P.extras.length;e++){
          var X=P.extras[e];
          branch(pts[en],new V3(X.dir[0],X.dir[1],X.dir[2]).normalize(),X.len,radii[en]*0.5,1);
        }
      }
    }
  }
  branch(new V3(0,-0.15,0),new V3(P.lean[0],1,P.lean[1]).normalize(),P.len[0],P.rad0,0);
  return {pos:pos,nor:nor,uv:uv,col:col,idx:idx,sites:sites,segCount:segCount};
}
/*GEN-END*/
function cnv(w,h){const c=document.createElement("canvas");c.width=w;c.height=h;return c}
function tex(c,rep){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
function barkTex(){const c=cnv(128,256),g=c.getContext("2d"),r=rng(7);
  g.fillStyle="rgb(190,190,190)";g.fillRect(0,0,128,256);
  for(let i=0;i<280;i++){const x=r()*128,w=1+r()*3,h=20+r()*110,y=r()*256,v=Math.floor(60+r()*130);
    g.fillStyle="rgba("+v+","+v+","+v+","+(0.35+r()*0.4)+")";g.fillRect(x,y,w,h);g.fillRect(x-128,y,w,h)}
  return tex(c,1)}
function locustTex(){const c=cnv(128,192),g=c.getContext("2d"),r=rng(3);
  g.strokeStyle="rgb(150,150,150)";g.lineWidth=2.2;g.beginPath();g.moveTo(64,190);g.quadraticCurveTo(67,100,64,10);g.stroke();
  function leaflet(x,y,theta,len,wid,shade){g.save();g.translate(x,y);g.rotate(theta);
    g.fillStyle="rgb("+shade+","+shade+","+shade+")";g.strokeStyle="rgb(140,140,140)";g.lineWidth=1;
    g.beginPath();g.ellipse(0,-len*0.95,wid,len,0,0,Math.PI*2);g.fill();g.stroke();g.restore()}
  const pairs=9;
  for(let i=0;i<pairs;i++){const t=i/(pairs-1),y=172-t*148,s=0.75+0.35*Math.sin(Math.PI*(0.15+0.7*t)),th=(70-30*t)*DEG;
    leaflet(64,y,th,21*s,9*s,Math.floor(215+r()*30));leaflet(64,y-3,-th,21*s,9*s,Math.floor(215+r()*30))}
  leaflet(64,34,0,18,8,235);return tex(c)}
function oakTex(){const c=cnv(128,128),g=c.getContext("2d"),r=rng(5);
  function lobed(len,wid){const N=26,pts=[];
    for(let k=0;k<=N;k++){const t=k/N,lob=0.62+0.38*Math.abs(Math.sin(t*Math.PI*3.5+0.5));pts.push([wid*Math.pow(Math.sin(Math.PI*Math.pow(t,0.75)),0.8)*lob,-t*len])}
    g.beginPath();g.moveTo(0,0);for(let k=0;k<=N;k++)g.lineTo(pts[k][0],pts[k][1]);for(let k=N;k>=0;k--)g.lineTo(-pts[k][0],pts[k][1]);
    g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(0,0);g.lineTo(0,-len*0.92);g.strokeStyle="rgb(120,120,120)";g.stroke()}
  const ang=[-75,-38,0,38,75],lens=[50,62,68,62,50];
  for(let i=0;i<5;i++){const v=Math.floor(195+r()*50);g.save();g.translate(64,118);g.rotate(ang[i]*DEG);
    g.fillStyle="rgb("+v+","+v+","+v+")";g.strokeStyle="rgb(150,150,150)";g.lineWidth=1;lobed(lens[i],lens[i]*0.42);g.restore()}
  return tex(c)}
const TX={bark:barkTex(),locust:locustTex(),oak:oakTex()};
const LEAF={
  t1:{tex:"locust",leafW:0.30,leafH:0.45,leafSpread:0.25,followDir:0.8,randDir:0.7,hang:0.35,faceUp:1.0,hue:0.27,hueVar:0.04,sat:0.92,lum:0.23,lumVar:0.08},
  t2:{tex:"oak",leafW:0.34,leafH:0.34,leafSpread:0.3,followDir:0.2,randDir:1.4,hang:0.0,faceUp:0.35,hue:0.275,hueVar:0.04,sat:0.92,lum:0.21,lumVar:0.08},
  t3:{tex:"oak",leafW:0.3,leafH:0.32,leafSpread:0.28,followDir:0.4,randDir:1.2,hang:0.0,faceUp:0.5,hue:0.265,hueVar:0.04,sat:0.9,lum:0.22,lumVar:0.08},
  t4:{tex:"oak",leafW:0.3,leafH:0.3,leafSpread:0.3,followDir:0.2,randDir:1.4,hang:0.0,faceUp:0.4,hue:0.28,hueVar:0.04,sat:0.92,lum:0.21,lumVar:0.08},
  t5:{tex:"locust",leafW:0.3,leafH:0.46,leafSpread:0.25,followDir:0.7,randDir:0.7,hang:0.55,faceUp:0.9,hue:0.26,hueVar:0.04,sat:0.9,lum:0.23,lumVar:0.08},
  t6:{tex:"oak",leafW:0.26,leafH:0.28,leafSpread:0.25,followDir:0.3,randDir:1.3,hang:0.0,faceUp:0.5,hue:0.255,hueVar:0.05,sat:0.88,lum:0.24,lumVar:0.08},
  t7:{tex:"oak",leafW:0.31,leafH:0.33,leafSpread:0.28,followDir:0.4,randDir:1.2,hang:0.0,faceUp:0.5,hue:0.27,hueVar:0.04,sat:0.9,lum:0.22,lumVar:0.08},
  t8:{tex:"oak",leafW:0.28,leafH:0.3,leafSpread:0.26,followDir:0.25,randDir:1.4,hang:0.0,faceUp:0.45,hue:0.26,hueVar:0.04,sat:0.9,lum:0.23,lumVar:0.08},
  t9:{tex:"oak",leafW:0.27,leafH:0.29,leafSpread:0.26,followDir:0.35,randDir:1.3,hang:0.0,faceUp:0.5,hue:0.265,hueVar:0.05,sat:0.88,lum:0.235,lumVar:0.08},
  t10:{tex:"oak",leafW:0.24,leafH:0.26,leafSpread:0.24,followDir:0.3,randDir:1.3,hang:0.0,faceUp:0.5,hue:0.26,hueVar:0.05,sat:0.88,lum:0.24,lumVar:0.08},
  t10b:{tex:"oak",leafW:0.24,leafH:0.26,leafSpread:0.24,followDir:0.3,randDir:1.3,hang:0.0,faceUp:0.5,hue:0.26,hueVar:0.05,sat:0.88,lum:0.24,lumVar:0.08},
  t11:{tex:"oak",leafW:0.28,leafH:0.3,leafSpread:0.28,followDir:0.2,randDir:1.4,hang:0.0,faceUp:0.4,hue:0.275,hueVar:0.04,sat:0.92,lum:0.215,lumVar:0.08},
  t12:{tex:"oak",leafW:0.25,leafH:0.27,leafSpread:0.25,followDir:0.3,randDir:1.3,hang:0.0,faceUp:0.5,hue:0.255,hueVar:0.05,sat:0.88,lum:0.24,lumVar:0.08},
  n1:{tex:"oak",leafW:0.27,leafH:0.29,leafSpread:0.26,followDir:0.3,randDir:1.3,hang:0.0,faceUp:0.5,hue:0.265,hueVar:0.05,sat:0.9,lum:0.225,lumVar:0.08},
  n2:{tex:"oak",leafW:0.28,leafH:0.31,leafSpread:0.24,followDir:0.4,randDir:1.2,hang:0.0,faceUp:0.4,hue:0.25,hueVar:0.05,sat:0.85,lum:0.23,lumVar:0.09},
  n3:{tex:"oak",leafW:0.31,leafH:0.33,leafSpread:0.28,followDir:0.3,randDir:1.3,hang:0.0,faceUp:0.45,hue:0.27,hueVar:0.04,sat:0.9,lum:0.22,lumVar:0.08},
  n4:{tex:"oak",leafW:0.29,leafH:0.31,leafSpread:0.27,followDir:0.4,randDir:1.2,hang:0.0,faceUp:0.5,hue:0.275,hueVar:0.04,sat:0.92,lum:0.215,lumVar:0.08},
  n5:{tex:"locust",leafW:0.3,leafH:0.46,leafSpread:0.25,followDir:0.7,randDir:0.7,hang:0.5,faceUp:0.9,hue:0.265,hueVar:0.04,sat:0.9,lum:0.23,lumVar:0.08},
  n6:{tex:"oak",leafW:0.27,leafH:0.29,leafSpread:0.26,followDir:0.3,randDir:1.3,hang:0.0,faceUp:0.45,hue:0.26,hueVar:0.05,sat:0.88,lum:0.235,lumVar:0.08},
  h1:{tex:"oak",leafW:0.3,leafH:0.34,leafSpread:0.22,followDir:0.5,randDir:1.1,hang:0.0,faceUp:0.3,hue:0.26,hueVar:0.05,sat:0.85,lum:0.22,lumVar:0.09},
  h2:{tex:"oak",leafW:0.3,leafH:0.34,leafSpread:0.22,followDir:0.5,randDir:1.1,hang:0.0,faceUp:0.3,hue:0.24,hueVar:0.05,sat:0.8,lum:0.23,lumVar:0.09},
  h3:{tex:"oak",leafW:0.3,leafH:0.34,leafSpread:0.22,followDir:0.5,randDir:1.1,hang:0.0,faceUp:0.3,hue:0.275,hueVar:0.05,sat:0.85,lum:0.21,lumVar:0.09}};
function makeLeaves(kind,sites,seed,maxL){const L=LEAF[kind],R=rng(seed+101);
  const nSites=sites.length/6,order=[];for(let i=0;i<nSites;i++)order.push(i);
  for(let i=nSites-1;i>0;i--){const j=Math.floor(R()*(i+1)),tmp=order[i];order[i]=order[j];order[j]=tmp}
  const count=Math.min(nSites,maxL),up=Math.sqrt(Math.max(1,Math.min(nSites,PARAMS[kind].maxLeaves)/count));   // menej listov → každý o toľko väčší, koruna rovnako hustá
  const mat=new THREE.MeshLambertMaterial({map:TX[L.tex],alphaTest:.5,side:THREE.DoubleSide});mat.userData.aT=.5;
  const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),mat,count);
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new V3(),pp=new V3(),X=new V3(),Y=new V3(),Z=new V3(),col=new THREE.Color();
  for(let k=0;k<count;k++){const o=order[k]*6;
    pp.set(sites[o]+(R()-.5)*L.leafSpread,sites[o+1]+(R()-.5)*L.leafSpread,sites[o+2]+(R()-.5)*L.leafSpread);
    Y.set(sites[o+3]*L.followDir+(R()-.5)*L.randDir,sites[o+4]*L.followDir+(R()-.5)*L.randDir-L.hang,sites[o+5]*L.followDir+(R()-.5)*L.randDir).normalize();
    Z.set((R()-.5)*1.2,L.faceUp+R()*0.4,(R()-.5)*1.2);Z.addScaledVector(Y,-Z.dot(Y));if(Z.lengthSq()<1e-4)Z.set(1,0,0);Z.normalize();
    X.crossVectors(Y,Z);m.makeBasis(X,Y,Z);q.setFromRotationMatrix(m);
    const sc=(0.8+0.45*R())*up;s.set(L.leafW*sc,L.leafH*sc,1);m.compose(pp,q,s);mesh.setMatrixAt(k,m);
    const Pk=PARAMS[kind],ex=(pp.x-Pk.cx)/Pk.rx,ey=(pp.y-Pk.cy)/Pk.ry,ez=(pp.z-Pk.cz)/Pk.rz,ed=Math.min(1,Math.sqrt(ex*ex+ey*ey+ez*ez)),upk=Math.max(0,Math.min(1,(ey+1)/2));
    col.setHSL(L.hue+(R()-.5)*L.hueVar,L.sat+(R()-.5)*0.1,(L.lum+(R()-.5)*L.lumVar)*(.62+.3*ed+.28*upk));mesh.setColorAt(k,col)}
  mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere&&mesh.computeBoundingSphere();return mesh}
function build(kind,lite){const P=Object.assign({},PARAMS[kind],PMOB?{lowPoly:1,skipTube:lite===2?2:lite===3?3:lite?4:5}:{lowPoly:1,skipTube:lite===2?3:lite===3?4:lite?5:0}),seed=1234+({t1:0,t2:77,t3:31,t4:58,t5:12,t6:91,t7:44,t8:63,t9:19,t10:7,t10b:83,t11:26,t12:52,h1:5,h2:39,h3:71,n1:17,n2:48,n3:66,n4:9,n5:35,n6:88}[kind]||0),g=generate(P,seed);
  const geo=new THREE.BufferGeometry();
  geo.setAttribute("position",new THREE.Float32BufferAttribute(g.pos,3));geo.setAttribute("normal",new THREE.Float32BufferAttribute(g.nor,3));
  geo.setAttribute("uv",new THREE.Float32BufferAttribute(g.uv,2));geo.setAttribute("color",new THREE.Float32BufferAttribute(g.col,3));geo.setIndex(g.idx);
  const wood=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:TX.bark,vertexColors:true}));wood.castShadow=true;wood.receiveShadow=true;
  const leaves=makeLeaves(kind,g.sites,seed,lite===2?Math.min(PMOB?380:600,P.maxLeaves):lite===3?Math.min(PMOB?900:2000,P.maxLeaves):PMOB?Math.min(lite?2000:3200,P.maxLeaves):lite?Math.min(4000,P.maxLeaves):P.maxLeaves);
  const grp=new THREE.Group();grp.add(wood,leaves);return{grp,wood,leaves,P}}
/* ---- doplnky pre export (nové druhy) ---- */
function leafCluster(w,h,seed,draw){const c=cnv(w,h),g=c.getContext("2d"),r=rng(seed);draw(g,r);return tex(c)}
TX.round=leafCluster(128,128,11,(g,r)=>{ /* lipa/javor/topoľ: oválne až srdcovité listy na vetvičke */
  g.strokeStyle="rgb(150,150,150)";g.lineWidth=2;g.beginPath();g.moveTo(64,126);g.lineTo(64,20);g.stroke();
  for(let i=0;i<9;i++){const t=i/8,y=112-t*90,side=i%2?1:-1,a=side*(55-20*t)*DEG,L=20+8*Math.sin(Math.PI*t);
    const v=Math.floor(200+r()*45);g.save();g.translate(64,y);g.rotate(a);g.fillStyle="rgb("+v+","+v+","+v+")";g.strokeStyle="rgb(140,140,140)";g.lineWidth=1;
    g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*.75,-L*.25,L*.65,-L*1.2,0,-L*1.55);g.bezierCurveTo(-L*.65,-L*1.2,-L*.75,-L*.25,0,0);g.fill();g.stroke();g.restore()}});
TX.willow=leafCluster(64,256,13,(g,r)=>{ /* vŕba: dlhý previsnutý prútik s úzkymi listami */
  g.strokeStyle="rgb(160,160,160)";g.lineWidth=1.5;g.beginPath();g.moveTo(32,2);g.quadraticCurveTo(36,128,30,254);g.stroke();
  for(let i=0;i<26;i++){const y=8+i*9.4,side=i%2?1:-1,v=Math.floor(205+r()*40);g.save();g.translate(32+side*1.5,y);g.rotate(side*(0.45+r()*.2));
    g.fillStyle="rgb("+v+","+v+","+v+")";g.beginPath();g.ellipse(side*9,6,3.2,13,side*-.2,0,Math.PI*2);g.fill();g.restore()}});
TX.needle=leafCluster(128,128,17,(g,r)=>{ /* ihličie: trsy ihlíc na vetvičke */
  g.strokeStyle="rgb(120,120,120)";g.lineWidth=2.5;g.beginPath();g.moveTo(64,124);g.lineTo(64,6);g.stroke();
  g.lineCap="round";for(let i=0;i<70;i++){const y=118-r()*110,s=r()<.5?-1:1,L=10+r()*16,a=s*(0.6+r()*0.7),v=Math.floor(185+r()*60);
    g.strokeStyle="rgb("+v+","+v+","+v+")";g.lineWidth=1.6;g.beginPath();g.moveTo(64,y);g.lineTo(64+Math.sin(a)*L,y-Math.cos(a)*L);g.stroke()}});
TX.scale=leafCluster(128,128,19,(g,r)=>{ /* tuja: ploché šupinaté vetvičky (vejáriky) */
  function fan(x,y,a,L,d){if(d>3)return;g.save();g.translate(x,y);g.rotate(a);const v=Math.floor(190+r()*55);g.strokeStyle="rgb("+v+","+v+","+v+")";g.lineWidth=6-d*1.3;g.lineCap="round";
    g.beginPath();g.moveTo(0,0);g.lineTo(0,-L);g.stroke();g.restore();const ex=x+Math.sin(a)*L,ey=y-Math.cos(a)*L;
    for(let k=1;k<=3;k++){const t=k/4,px=x+Math.sin(a)*L*t,py=y-Math.cos(a)*L*t;fan(px,py,a+(k%2?.7:-.7),L*.5,d+1)}}
  fan(64,124,0,96,0);fan(64,124,-.35,70,1);fan(64,124,.35,70,1)});
const pad=a=>{while(a.length<6)a.push(a[a.length-1]);return a};
function addKind(k,P,L){["len","seg","taper","wobble","tropism","spread","kids","kidStart","angle","radRatio"].forEach(n=>P[n]=pad(P[n]));PARAMS[k]=P;LEAF[k]=L}
addKind("smrek",{whorl:1,woodMax:0,cx:0,cy:8,cz:0,rx:3.3,ry:7.6,rz:3.3,maxLevel:2,maxSeg:40000,minR:.006,pull:0,rad0:.3,lean:[0,0],
  len:[14.6,3.3,1.2],seg:[14,4,2],taper:[.1,.4,.4],wobble:[.01,.05,.1],tropism:[0,-.04,-.03],spread:[0,0,0],
  kids:[44,4,0],kidStart:[.06,.3,0],angle:[0,96,40,40],radRatio:[0,.22,.5,.5],tipShrink:.3,cone:1.0,leaderAng:0,leaderLen:.25,leaderRad:.6,
  barkColor:0x6d5a4a,twigColor:0x55463a,leafLevel:1,leafProb:.95,maxLeaves:1100},
  {tex:"needle",leafW:2.4,leafH:2.1,leafSpread:.25,followDir:.7,randDir:.7,hang:.15,faceUp:.9,hue:.47,hueVar:.03,sat:.22,lum:.36,lumVar:.07});
addKind("borovica",{cx:0,cy:11,cz:0,rx:3.6,ry:2.6,rz:3.4,maxLevel:3,maxSeg:40000,minR:.006,pull:1.3,rad0:.26,lean:[.03,0],
  len:[9.6,3.6,1.6,.8],seg:[8,5,3,2],taper:[.5,.4,.4,.4],wobble:[.02,.1,.16,.2],tropism:[0,.05,.06,.04],spread:[0,.04,.04,.03],
  kids:[9,4,3,0],kidStart:[.7,.3,.3,0],angle:[0,62,45,40],radRatio:[0,.45,.55,.6],tipShrink:.35,leaderAng:6,leaderLen:.8,leaderRad:.7,
  barkColor:0x7a5a45,twigColor:0x5a4636,leafLevel:2,leafProb:.95,maxLeaves:700},
  {tex:"needle",leafW:1.6,leafH:1.4,leafSpread:.3,followDir:.6,randDir:.8,hang:0,faceUp:1.0,hue:.3,hueVar:.03,sat:.42,lum:.2,lumVar:.06});
addKind("topol",{woodMax:1,cx:0,cy:13.5,cz:0,rx:2.4,ry:11,rz:2.4,maxLevel:3,maxSeg:40000,minR:.006,pull:2.2,rad0:.36,lean:[0,0],
  len:[21,6.5,2.2,1],seg:[10,4,3,2],taper:[.12,.3,.35,.4],wobble:[.01,.06,.14,.2],tropism:[0,.12,.08,.05],spread:[0,0,0,0],
  kids:[22,3,3,0],kidStart:[.1,.3,.3,0],angle:[0,16,28,40],radRatio:[0,.3,.55,.6],tipShrink:.3,leaderAng:1,leaderLen:.6,leaderRad:.6,
  barkColor:0x6e675e,twigColor:0x55493d,leafLevel:2,leafProb:.95,maxLeaves:700},
  {tex:"round",leafW:.65,leafH:.75,leafSpread:.3,followDir:.6,randDir:1.0,hang:0,faceUp:.4,hue:.25,hueVar:.04,sat:.6,lum:.23,lumVar:.08});
addKind("vrba",{cx:0,cy:5,cz:0,rx:5.2,ry:5.2,rz:5.2,maxLevel:3,maxSeg:40000,minR:.006,pull:.6,rad0:.32,lean:[.05,0],
  len:[2.6,4.6,3.6,2.2],seg:[4,5,5,4],taper:[.6,.35,.3,.3],wobble:[.03,.08,.08,.06],tropism:[0,.05,-.14,-.3],spread:[0,.06,.05,0],
  kids:[5,4,4,0],kidStart:[.8,.35,.25,0],angle:[0,38,62,70],radRatio:[0,.55,.4,.5],tipShrink:.3,leaderAng:6,leaderLen:1,leaderRad:.75,
  barkColor:0x6a5f52,twigColor:0x8a7a4a,leafLevel:2,leafProb:.95,maxLeaves:800},
  {tex:"willow",leafW:.35,leafH:1.5,leafSpread:.25,followDir:.2,randDir:.3,hang:1.6,faceUp:.3,hue:.23,hueVar:.03,sat:.6,lum:.27,lumVar:.07});
addKind("tuja",{woodMax:0,cx:0,cy:2.7,cz:0,rx:.75,ry:2.55,rz:.75,maxLevel:2,maxSeg:40000,minR:.005,pull:3,rad0:.08,lean:[0,0],
  len:[4.9,1.0,.45],seg:[9,3,2],taper:[.2,.4,.4],wobble:[.01,.08,.12],tropism:[0,.16,.1],spread:[0,0,0],
  kids:[34,3,0],kidStart:[.04,.3,0],angle:[0,32,40,40],radRatio:[0,.45,.5,.5],tipShrink:.2,cone:.55,leaderAng:0,leaderLen:.3,leaderRad:.6,
  barkColor:0x6a5040,twigColor:0x5a4636,leafLevel:1,leafProb:.95,maxLeaves:700},
  {tex:"scale",leafW:.9,leafH:1.0,leafSpread:.15,followDir:.8,randDir:.6,hang:0,faceUp:.3,hue:.29,hueVar:.03,sat:.5,lum:.17,lumVar:.05});
addKind("lipa",{woodMax:2,cx:0,cy:11,cz:0,rx:6,ry:6.5,rz:5.8,maxLevel:4,maxSeg:40000,minR:.006,pull:1.3,rad0:.45,lean:[.02,0],
  len:[4.5,7,3.4,1.7,.9],seg:[5,6,4,3,2],taper:[.6,.35,.3,.3,.4],wobble:[.03,.08,.15,.22,.28],tropism:[0,.08,.04,.01,-.01],spread:[0,.03,.04,.03,.02],
  kids:[6,5,4,3,0],kidStart:[.75,.3,.3,.25,0],angle:[0,35,48,52,55],radRatio:[0,.55,.6,.65,.68],tipShrink:.4,leaderAng:5,leaderLen:1.2,leaderRad:.8,
  barkColor:0x6a6156,twigColor:0x4f4237,leafLevel:3,leafProb:.6,maxLeaves:700},
  {tex:"round",leafW:1.0,leafH:1.0,leafSpread:.35,followDir:.3,randDir:1.3,hang:0,faceUp:.45,hue:.24,hueVar:.04,sat:.62,lum:.24,lumVar:.08});
addKind("ker",{cx:0,cy:1.35,cz:0,rx:1.7,ry:1.25,rz:1.7,maxLevel:3,maxSeg:40000,minR:.005,pull:1.6,rad0:.05,lean:[0,0],
  len:[.25,1.7,.8,.4],seg:[1,4,3,2],taper:[.8,.4,.4,.4],wobble:[.02,.12,.2,.25],tropism:[0,.04,.02,0],spread:[0,.06,.04,.02],
  kids:[8,4,3,0],kidStart:[.9,.3,.3,0],angle:[0,32,45,50],radRatio:[0,.9,.6,.6],tipShrink:.3,leaderAng:4,leaderLen:1,leaderRad:.8,
  barkColor:0x6a5a4c,twigColor:0x55463a,leafLevel:2,leafProb:.8,maxLeaves:700},
  {tex:"round",leafW:.6,leafH:.6,leafSpread:.25,followDir:.4,randDir:1.2,hang:0,faceUp:.4,hue:.27,hueVar:.05,sat:.55,lum:.21,lumVar:.09});
addKind("dub",Object.assign({},PARAMS.t2,{maxSeg:2500,maxLeaves:700}),LEAF.t2);
addKind("agat",Object.assign({},PARAMS.n5,{maxSeg:2500,maxLeaves:700}),LEAF.n5);
/* javor: širšia, nižšia guľatá koruna, dlaňovité listy */
TX.maple=leafCluster(128,128,23,(g,r)=>{g.strokeStyle="rgb(150,150,150)";g.lineWidth=2.5;g.beginPath();g.moveTo(64,126);g.lineTo(64,30);g.stroke();
  const leaf=(x,y,a,L)=>{const v=Math.floor(195+r()*50);g.save();g.translate(x,y);g.rotate(a);g.fillStyle="rgb("+v+","+v+","+v+")";g.beginPath();g.moveTo(0,0);
    for(let k=0;k<5;k++){const b=(-90+(k-2)*38)*DEG,rr=k===2?L:k===1||k===3?L*.9:L*.62;g.lineTo(Math.cos(b-15*DEG)*rr*.55,Math.sin(b-15*DEG)*rr*.55-L*.35);g.lineTo(Math.cos(b)*rr,Math.sin(b)*rr-L*.35);g.lineTo(Math.cos(b+15*DEG)*rr*.55,Math.sin(b+15*DEG)*rr*.55-L*.35)}
    g.closePath();g.fill();g.strokeStyle="rgb(150,150,150)";g.lineWidth=1;g.stroke();g.restore()};
  leaf(64,34,0,30);for(let i=0;i<4;i++){const y=104-i*20,side=i%2?1:-1;leaf(64,y,side*(62-8*i)*DEG,26+r()*5)}});
addKind("javor",Object.assign({},PARAMS.lipa,{cy:8.5,rx:6.4,ry:5,rz:6.2,len:[3.6,6.2,3.2,1.6,.9],angle:[0,48,52,55,55]}),Object.assign({},LEAF.lipa,{tex:"maple",leafW:1.05,leafH:1.05,hue:.22,sat:.58,lum:.25}));
return{PARAMS,build,LEAF,TX}})();
// kód v dátach (apex.json trees[k][5]) → druh generátora
export const KIND={b:"borovica",t:"tuja",a:"agat",j:"javor",d:"dub",l:"lipa",k:"ker",s:"smrek"};
const KITS={};
// listy zďaleka: mipmapy rozmažú priehľadnosť a alphaTest drobné listy „zje“ (strom vyzerá holý) – alfu zväčšíme podľa úrovne mipmapy
export function leafMip(m){m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace("#include <alphatest_fragment>","#ifdef USE_MAP\n{vec2 _d=vec2(textureSize(map,0)),_x=dFdx(vMapUv*_d),_y=dFdy(vMapUv*_d);diffuseColor.a*=1.+.45*max(0.,.5*log2(max(dot(_x,_x),dot(_y,_y))));}\n#endif\n#include <alphatest_fragment>")};m.customProgramCacheKey=()=>"leafMip";return m}
// jeden druh = 2 geometrie (kmeň/konáre + všetky listy zlúčené do jednej), zdieľané všetkými inštanciami. lite: 2 = ďaleko (málo listov), 3 = blízko
export function kit(kind,lite){const key=kind+lite;if(KITS[key])return KITS[key];
  const t=PT.build(kind,lite),Lv=t.leaves,n=Lv.count,bg=Lv.geometry,bp=bg.attributes.position,bn=bg.attributes.normal,bu=bg.attributes.uv,bi=bg.index.array;
  const m=new THREE.Matrix4(),nm=new THREE.Matrix3(),v=new THREE.Vector3(),c=new THREE.Color(),P=new Float32Array(n*bp.count*3),N=new Float32Array(n*bp.count*3),U=new Float32Array(n*bp.count*2),C=new Float32Array(n*bp.count*3),I=new Uint32Array(n*bi.length);
  const LS=new THREE.Matrix4().makeScale(lite===2?1.45:1.15,lite===2?1.45:1.15,1);   // vzdialená verzia: menej, ale väčších listov (inak sa koruna zďaleka „rozpadne“)
  for(let i=0;i<n;i++){Lv.getMatrixAt(i,m);m.multiply(LS);nm.getNormalMatrix(m);Lv.instanceColor?Lv.getColorAt(i,c):c.set(1,1,1);const b=i*bp.count;
    for(let j=0;j<bp.count;j++){const o=b+j;v.fromBufferAttribute(bp,j).applyMatrix4(m);P[o*3]=v.x;P[o*3+1]=v.y;P[o*3+2]=v.z;v.fromBufferAttribute(bn,j).applyMatrix3(nm).normalize();N[o*3]=v.x;N[o*3+1]=v.y;N[o*3+2]=v.z;U[o*2]=bu.getX(j);U[o*2+1]=bu.getY(j);C[o*3]=c.r;C[o*3+1]=c.g;C[o*3+2]=c.b}
    for(let j=0;j<bi.length;j++)I[i*bi.length+j]=b+bi[j]}
  const lg=new THREE.BufferGeometry();lg.setAttribute("position",new THREE.BufferAttribute(P,3));lg.setAttribute("normal",new THREE.BufferAttribute(N,3));lg.setAttribute("uv",new THREE.BufferAttribute(U,2));lg.setAttribute("color",new THREE.BufferAttribute(C,3));lg.setIndex(new THREE.BufferAttribute(I,1));
  const aT=.5,mp=Lv.material.map;
  const lm=leafMip(new THREE.MeshLambertMaterial({map:mp,alphaTest:aT,side:THREE.DoubleSide,vertexColors:true}));lm.userData.aT=aT;
  Lv.dispose&&Lv.dispose();bg.dispose();
  lg.computeBoundingBox();t.wood.geometry.computeBoundingBox();const bb=lg.boundingBox.clone().union(t.wood.geometry.boundingBox);
  return KITS[key]={kind,wg:t.wood.geometry,wm:t.wood.material,lg,lm,P:t.P,H:bb.max.y,W:Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z)}}
export {PT,PMOB};

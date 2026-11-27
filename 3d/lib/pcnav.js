// Spoločné ovládanie kamery pre počítač aj dotyk – Akadémia (index.html) aj prehľad 18 jamiek (ihrisko.html) používajú presne toto isté.
// Koliesko myši / touchpad: priblíženie ku kurzoru, rovnaká rýchlosť; tlačidlá vľavo dole (podržaním sa pohyb opakuje), + − aj na klávesnici.
import * as THREE from "three";
export const NAV_CSS=`#nav3{position:fixed;left:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 74px);display:grid;grid-template-columns:repeat(4,38px);gap:5px;z-index:40}
#nav3 .sp{visibility:hidden;pointer-events:none}
#nav3 button{width:38px;height:38px;border:0;border-radius:10px;background:rgba(255,255,255,.88);color:#123;font:700 1.05rem system-ui;box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:pointer;user-select:none}#nav3 button:hover{background:#fff}
body.playing:not(.aimnav) #nav3{display:none}
body.playing #nav3{grid-template-columns:repeat(4,26px);gap:3px;bottom:calc(env(safe-area-inset-bottom,0px) + 134px);opacity:.85}
body.playing #nav3 button{width:26px;height:26px;border-radius:7px;font-size:.78rem;box-shadow:0 1px 3px rgba(0,0,0,.3)}`;
// v275: počas hry (pri mierení) sú tlačidlá malé; index.html nastaví nav3.before = prepnutie na voľnú kameru (orbOn)
export const nav3={before:null};
export function pcNav(controls,camera,dom){
  const fine=matchMedia("(pointer:fine)").matches;
  if(!document.getElementById("nav3css")){const s=document.createElement("style");s.id="nav3css";s.textContent=NAV_CSS;document.head.appendChild(s)}
  if(fine){controls.zoomToCursor=true;
    document.body.insertAdjacentHTML("beforeend",`<div id="nav3"><button data-a="rl" title="Otočiť doľava">⟲</button><button data-a="f" title="Dopredu">▲</button><button data-a="rr" title="Otočiť doprava">⟳</button><button data-a="zi" title="Priblížiť">＋</button><button data-a="l" title="Doľava (←)">◀</button><button data-a="b" title="Dozadu">▼</button><button data-a="r" title="Doprava (→)">▶</button><button data-a="zo" title="Oddialiť">－</button><button data-a="tu" title="Sklopiť pohľad">⤒</button><i class="sp"></i><button data-a="td" title="Pohľad zhora">⤓</button></div>`);
    const sph=new THREE.Spherical(),off=new THREE.Vector3();
    const act=a=>{if(nav3.before)nav3.before();if(!controls.enabled)return;const T=controls.target,cp=camera.position;off.copy(cp).sub(T);
      if(a==="zi"||a==="zo"){const k=a==="zi"?.9:1/.9;off.multiplyScalar(k);const L=off.length();if(L<controls.minDistance||L>controls.maxDistance)return;cp.copy(T).add(off)}
      else if(a==="rl"||a==="rr"||a==="tu"||a==="td"){sph.setFromVector3(off);if(a==="rl")sph.theta+=.04;if(a==="rr")sph.theta-=.04;if(a==="tu")sph.phi=Math.max(.05,sph.phi-.03);if(a==="td")sph.phi=Math.min(controls.maxPolarAngle,sph.phi+.03);off.setFromSpherical(sph);cp.copy(T).add(off)}
      else{const d=new THREE.Vector3(-off.x,0,-off.z).normalize(),k=Math.max(1.5,off.length()*.03);   // ▲▼ dopredu/dozadu, ◀ ▶ bokom (kolmo na smer pohľadu)
        if(a==="l"||a==="r")d.set(d.z,0,-d.x).multiplyScalar(a==="l"?k:-k);else d.multiplyScalar(a==="f"?k:-k);T.add(d);cp.add(d)}};
    let timer=null;const stop=()=>{clearInterval(timer);timer=null};const nav=document.getElementById("nav3");
    nav.addEventListener("pointerdown",e=>{const b=e.target.closest("button");if(!b)return;e.preventDefault();act(b.dataset.a);stop();timer=setInterval(()=>act(b.dataset.a),30)});
    addEventListener("pointerup",stop);addEventListener("pointercancel",stop);nav.addEventListener("pointerleave",stop);
    // klávesy + − a šípky (mimo hry; pri mierení ich obsluhuje hra sama)
    addEventListener("keydown",e=>{if(!controls.enabled||document.body.classList.contains("playing")||e.target.closest&&e.target.closest("input,textarea"))return;
      if(e.key==="+"||e.key==="=")act("zi");else if(e.key==="-"||e.key==="_")act("zo");
      else{const k={ArrowLeft:"l",ArrowRight:"r",ArrowUp:"f",ArrowDown:"b"}[e.key];if(k){e.preventDefault();act(k)}}})}
  // dotyk: 1 prst = posun po ihrisku (dopredu, dozadu, do strán), 2 prsty = sklon hore/dole, otáčanie a priblíženie
  controls.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE};controls.screenSpacePanning=false;controls.panXFactor=.6;
  // na telefóne pôvodná rýchlosť, s myšou na počítači pomalšie
  // zoom kolieskom/touchpadom (Martin 23.11. aj 24.11.: bol príliš pomalý; v200 2.8→7) – OrbitControls delí krok kolieska celým devicePixelRatio, na Retina Macu bol zoom polovičný; vyrovnáme to
  const ZW=7*Math.max(1,window.devicePixelRatio|0);
  if(fine){controls.rotateSpeed=.45;controls.panSpeed=1.1;controls.zoomSpeed=ZW}
  dom.addEventListener("pointerdown",e=>{const m=e.pointerType==="mouse";controls.rotateSpeed=m?.45:1;controls.panSpeed=m?1.1:2.6;controls.zoomSpeed=m?ZW:1},{capture:true});
  // koliesko/touchpad bez predchádzajúceho kliknutia (napr. pero/dotyk predtým nastavil 1) – pred zoomom vždy rýchlosť pre koliesko
  if(fine)dom.addEventListener("wheel",()=>{controls.zoomSpeed=ZW},{capture:true,passive:true});
}

// Spoločné ovládanie kamery pre počítač aj dotyk – Akadémia (index.html) aj prehľad 18 jamiek (ihrisko.html) používajú presne toto isté.
// Koliesko myši / touchpad: priblíženie ku kurzoru, rovnaká rýchlosť; tlačidlá vľavo dole (podržaním sa pohyb opakuje), + − aj na klávesnici.
import * as THREE from "three";
export const NAV_CSS=`#nav3{position:fixed;left:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 74px);display:grid;grid-template-columns:repeat(4,38px);gap:5px;z-index:40}
#nav3 button{width:38px;height:38px;border:0;border-radius:10px;background:rgba(255,255,255,.88);color:#123;font:700 1.05rem system-ui;box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:pointer;user-select:none}#nav3 button:hover{background:#fff}
body.playing #nav3{display:none}`;
export function pcNav(controls,camera,dom){
  const fine=matchMedia("(pointer:fine)").matches;
  if(!document.getElementById("nav3css")){const s=document.createElement("style");s.id="nav3css";s.textContent=NAV_CSS;document.head.appendChild(s)}
  if(fine){controls.zoomToCursor=true;
    document.body.insertAdjacentHTML("beforeend",`<div id="nav3"><button data-a="rl" title="Otočiť doľava">⟲</button><button data-a="f" title="Dopredu">▲</button><button data-a="rr" title="Otočiť doprava">⟳</button><button data-a="zi" title="Priblížiť">＋</button><button data-a="tu" title="Sklopiť pohľad">⤒</button><button data-a="b" title="Dozadu">▼</button><button data-a="td" title="Pohľad zhora">⤓</button><button data-a="zo" title="Oddialiť">－</button></div>`);
    const sph=new THREE.Spherical(),off=new THREE.Vector3();
    const act=a=>{if(!controls.enabled)return;const T=controls.target,cp=camera.position;off.copy(cp).sub(T);
      if(a==="zi"||a==="zo"){const k=a==="zi"?.94:1/.94;off.multiplyScalar(k);const L=off.length();if(L<controls.minDistance||L>controls.maxDistance)return;cp.copy(T).add(off)}
      else if(a==="rl"||a==="rr"||a==="tu"||a==="td"){sph.setFromVector3(off);if(a==="rl")sph.theta+=.04;if(a==="rr")sph.theta-=.04;if(a==="tu")sph.phi=Math.max(.05,sph.phi-.03);if(a==="td")sph.phi=Math.min(controls.maxPolarAngle,sph.phi+.03);off.setFromSpherical(sph);cp.copy(T).add(off)}
      else{const d=new THREE.Vector3(-off.x,0,-off.z).normalize().multiplyScalar((a==="f"?1:-1)*Math.max(1.5,off.length()*.03));T.add(d);cp.add(d)}};
    let timer=null;const stop=()=>{clearInterval(timer);timer=null};const nav=document.getElementById("nav3");
    nav.addEventListener("pointerdown",e=>{const b=e.target.closest("button");if(!b)return;e.preventDefault();act(b.dataset.a);stop();timer=setInterval(()=>act(b.dataset.a),30)});
    addEventListener("pointerup",stop);addEventListener("pointercancel",stop);nav.addEventListener("pointerleave",stop);
    // klávesy + − (mimo hry; pri mierení ich obsluhuje hra sama)
    addEventListener("keydown",e=>{if(!controls.enabled||document.body.classList.contains("playing")||e.target.closest&&e.target.closest("input,textarea"))return;
      if(e.key==="+"||e.key==="=")act("zi");else if(e.key==="-"||e.key==="_")act("zo")})}
  // dotyk: 1 prst = posun po ihrisku (dopredu, dozadu, do strán), 2 prsty = sklon hore/dole, otáčanie a priblíženie
  controls.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE};controls.screenSpacePanning=false;controls.panXFactor=.6;
  // na telefóne pôvodná rýchlosť, s myšou na počítači pomalšie
  if(fine){controls.rotateSpeed=.45;controls.panSpeed=1.1;controls.zoomSpeed=1.2}
  dom.addEventListener("pointerdown",e=>{const m=e.pointerType==="mouse";controls.rotateSpeed=m?.45:1;controls.panSpeed=m?1.1:2.6;controls.zoomSpeed=m?1.2:1},{capture:true});
}

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
      if(a==="zi"||a==="zo"){const k=a==="zi"?.9:1/.9;off.multiplyScalar(k);const L=off.length();if(L<controls.minDistance||L>controls.maxDistance)return;cp.copy(T).add(off)}
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
  // zoom kolieskom/touchpadom (Martin 23.11. aj 24.11.: bol príliš pomalý; v200 2.8→7) – OrbitControls delí krok kolieska celým devicePixelRatio, na Retina Macu bol zoom polovičný; vyrovnáme to
  const ZW=7*Math.max(1,window.devicePixelRatio|0);
  if(fine){controls.rotateSpeed=.45;controls.panSpeed=1.1;controls.zoomSpeed=ZW}
  dom.addEventListener("pointerdown",e=>{const m=e.pointerType==="mouse";controls.rotateSpeed=m?.45:1;controls.panSpeed=m?1.1:2.6;controls.zoomSpeed=m?ZW:1},{capture:true});
  // koliesko/touchpad bez predchádzajúceho kliknutia (napr. pero/dotyk predtým nastavil 1) – pred zoomom vždy rýchlosť pre koliesko
  if(fine)dom.addEventListener("wheel",()=>{controls.zoomSpeed=ZW},{capture:true,passive:true});
}
// Joystick (Martin 25.11.: „Aj do prehľadu daj joystick“) – palec ťahá páčku, kamera plynule letí po ihrisku:
// hore = dopredu v smere pohľadu, dole = dozadu, do strán = bokom. Rýchlosť podľa vychýlenia a výšky kamery (zhora rýchlejšie).
export function joystick(controls,camera,opt={}){
  const fine=matchMedia("(pointer:fine)").matches,R=48;
  const s=document.createElement("style");s.textContent=`#joy3{position:fixed;left:${fine?190:16}px;bottom:calc(env(safe-area-inset-bottom,0px) + 96px);width:${2*R+14}px;height:${2*R+14}px;border-radius:50%;background:rgba(15,40,28,.35);border:2px solid rgba(255,255,255,.75);box-shadow:0 2px 10px rgba(0,0,0,.3);z-index:25;touch-action:none;user-select:none;-webkit-user-select:none}
#joy3 i{position:absolute;left:50%;top:50%;width:50px;height:50px;margin:-25px 0 0 -25px;border-radius:50%;background:rgba(255,255,255,.92);box-shadow:0 2px 8px rgba(0,0,0,.4);pointer-events:none}
#joy3 b{position:absolute;left:0;right:0;text-align:center;color:#fff;font:700 11px system-ui;text-shadow:0 1px 2px #000;pointer-events:none}
body.playing #joy3{display:none}`;document.head.appendChild(s);
  const el=document.createElement("div");el.id="joy3";el.title="Joystick: ťahaj a leť po ihrisku";el.innerHTML='<b style="top:3px">▲</b><b style="bottom:3px">▼</b><b style="top:calc(50% - 7px);left:4px;right:auto">◀</b><b style="top:calc(50% - 7px);right:4px;left:auto">▶</b><i></i>';document.body.appendChild(el);
  const k=el.querySelector("i"),fw=new THREE.Vector3(),rt=new THREE.Vector3(),d=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
  let id=null,c0=null,jx=0,jy=0,last=0;
  const set=(x,y)=>{const L=Math.hypot(x,y);if(L>R){x*=R/L;y*=R/L}jx=x/R;jy=y/R;k.style.transform=`translate(${x}px,${y}px)`};
  const tick=t=>{if(id===null)return;const dt=Math.min(.05,(t-last)/1000);last=t;
    if(controls.enabled&&(jx||jy)){const T=controls.target,cp=camera.position;fw.set(T.x-cp.x,0,T.z-cp.z);if(fw.lengthSq()<1e-6)camera.getWorldDirection(fw).setY(0);fw.normalize();rt.crossVectors(fw,UP).normalize();
      // mŕtva zóna v strede, potom plynulo (kvadraticky) – jemný posun aj rýchly prelet
      const m=Math.hypot(jx,jy),g=m<.12?0:((m-.12)/.88)**2/m,sp=Math.max(25,cp.distanceTo(T)*(opt.speed||.35));
      d.copy(fw).multiplyScalar(-jy*g*sp*dt).addScaledVector(rt,jx*g*sp*dt);
      if(opt.clamp){const q=T.clone().add(d);opt.clamp(q);d.subVectors(q,T)}
      T.add(d);cp.add(d)}
    requestAnimationFrame(tick)};
  el.addEventListener("pointerdown",e=>{if(id!==null)return;e.preventDefault();e.stopPropagation();id=e.pointerId;el.setPointerCapture(id);const r=el.getBoundingClientRect();c0=[r.left+r.width/2,r.top+r.height/2];set(e.clientX-c0[0],e.clientY-c0[1]);last=performance.now();requestAnimationFrame(tick)});
  el.addEventListener("pointermove",e=>{if(e.pointerId!==id)return;e.preventDefault();set(e.clientX-c0[0],e.clientY-c0[1])});
  const up=e=>{if(e.pointerId!==id)return;id=null;set(0,0)};el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);
  ["touchstart","touchmove"].forEach(t=>el.addEventListener(t,e=>e.preventDefault(),{passive:false}));
  return el}

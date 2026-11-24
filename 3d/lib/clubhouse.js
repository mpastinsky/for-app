// Clubhouse Kaštieľ Báč + okolie (DATA.clubhouse v apex.json), zdieľané medzi 3d/index.html a 3d/ihrisko.html.
// pos(e,n) -> THREE.Vector3 na teréne (každá stránka má svoj prevod), ground(e,n) -> výška terénu.
// Vráti {group, hits:[meshe na klik], center:[e,n], top:výška} alebo null.
export function buildClubhouse(THREE, C, pos, ground, opt = {}) {
  if (!C) return null;
  const G = new THREE.Group(), hits = [];
  const v = C.v, u = [v[1], -v[0]];                       // v = hlavné krídlo (W→N roh), u = krídla smerom na JV
  const at = (a, b) => [C.o[0] + u[0] * a + v[0] * b, C.o[1] + u[1] * a + v[1] * b];   // lokálne (u,v) metre -> ENU
  // uhol rotácie (okolo Y), ktorý otočí lokálnu os x meshu do smeru (de,dn) v ENU – cez prevod stránky (každá má iný rámec)
  const ang = (e, n, de, dn) => { const a = pos(e, n, 0), b = pos(e + de, n + dn, 0); return Math.atan2(-(b.z - a.z), b.x - a.x) };
  const RU = ang(C.o[0], C.o[1], u[0], u[1]);              // lokálne x = smer krídel (u)
  const base = Math.min(...[[0, 0], [C.wing, 0], [0, C.L], [C.wing, C.L]].map(([a, b]) => ground(...at(a, b))));
  const M = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: .85 }, o));
  const cv = (w, h, f) => { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t };
  // fasáda: svetlá omietka, 2 rady okien s bielymi rámami, sokel
  const wallTex = cv(128, 128, (g, w, h) => { g.fillStyle = "#f3e3a2"; g.fillRect(0, 0, w, h); g.fillStyle = "#e9e4d6"; g.fillRect(0, h - 12, w, 12);
    for (const y of [22, 72]) { g.fillStyle = "#f8f6f0"; g.fillRect(40, y - 3, 48, 40); g.fillStyle = "#3d4a52"; g.fillRect(44, y, 40, 34); g.fillStyle = "#f8f6f0"; g.fillRect(62, y, 4, 34); g.fillRect(44, y + 14, 40, 3) } });
  const roofTex = cv(64, 64, (g, w, h) => { g.fillStyle = "#d9692f"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 6) { g.fillStyle = "rgba(120,40,10,.35)"; g.fillRect(0, y, w, 1.5) } for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? "255,170,110" : "150,60,25"},.25)`; g.fillRect(Math.random() * w, Math.random() * h, 6, 3) } });
  const glassTex = cv(64, 64, (g, w, h) => { g.fillStyle = "#9fb9c4"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(0, 0, w, h / 2); g.fillStyle = "#f4f4f0"; for (let x = 0; x < w; x += 16) g.fillRect(x, 0, 3, h); g.fillRect(0, 0, w, 3); g.fillRect(0, h / 2, w, 3) });
  const mGlass = M({ map: glassTex, roughness: .25, metalness: .2 });
  const mWall = M({ map: wallTex }), mRoof = M({ map: roofTex, roughness: .9 }), mRoofB = M({ map: roofTex, roughness: .9 }), mFlat = M({ color: 0x4d535b, roughness: .6 }), mCream = M({ color: 0xf1ead8, side: THREE.DoubleSide }), mPole = M({ color: 0x8a8a86 }), mWood = M({ color: 0x8a6a48 }), mDark = M({ color: 0x5b4a3c }), mWhite = M({ color: 0xfafafa, side: THREE.DoubleSide });
  // valbová strecha nad obdĺžnikom a×b (a pozdĺž lokálneho x), výška hr
  function hipRoof(a, b, hr, mat) {
    const r = Math.min(a, b) / 2, P = [[-a / 2, 0, -b / 2], [a / 2, 0, -b / 2], [a / 2, 0, b / 2], [-a / 2, 0, b / 2]];
    const R = a >= b ? [[-a / 2 + r, hr, 0], [a / 2 - r, hr, 0]] : [[0, hr, -b / 2 + r], [0, hr, b / 2 - r]];
    const pos = [], uv = [], tri = (p, q, s) => { pos.push(...p, ...q, ...s); uv.push(p[0] / 3 + p[2] / 3, p[1] / 1.2, q[0] / 3 + q[2] / 3, q[1] / 1.2, s[0] / 3 + s[2] / 3, s[1] / 1.2) };
    if (a >= b) { tri(P[0], R[0], P[1]); tri(P[1], R[0], R[1]); tri(P[1], R[1], P[2]); tri(P[2], R[1], P[3]); tri(P[3], R[1], R[0]); tri(P[3], R[0], P[0]) }
    else { tri(P[0], R[0], P[1]); tri(P[1], R[0], R[1]); tri(P[1], R[1], P[2]); tri(P[2], R[1], P[3]); tri(P[3], R[1], R[0]); tri(P[3], R[0], P[0]) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.material.side = THREE.DoubleSide; return m }
  // krídlo: kváder + valbová strecha; (a0..a1) v smere u, (b0..b1) v smere v
  function wing(a0, a1, b0, b1, eave, hr, wallM = mWall, roofM = mRoof) {
    const ca = (a0 + a1) / 2, cb = (b0 + b1) / 2, A = a1 - a0, B = b1 - b0, [e, n] = at(ca, cb), p = pos(e, n, base);
    const box = new THREE.BoxGeometry(A, eave, B); const uvA = box.attributes.uv;   // opakovanie textúry podľa rozmeru steny
    for (let i = 0; i < uvA.count; i++) { const f = Math.floor(i / 4); const sx = f < 2 ? B : A; uvA.setXY(i, uvA.getX(i) * sx / 4.2, uvA.getY(i) * eave / 3.6) }
    const body = new THREE.Mesh(box, wallM); body.position.set(p.x, p.y + eave / 2, p.z);
    const roof = hipRoof(A + .9, B + .9, hr, roofM); roof.position.set(p.x, p.y + eave, p.z);
    for (const m of [body, roof]) { m.rotation.y = RU; m.castShadow = m.receiveShadow = true; G.add(m); hits.push(m) }
    return body }
  const ww = C.ww, E = C.eave, H = C.roof;
  wing(0, ww, 0, C.L, E, H);                                   // hlavné krídlo (SZ fasáda k ihrisku, terasa)
  wing(ww - .01, C.wing, C.L - ww, C.L, E, H);                 // severné krídlo
  wing(ww - .01, C.wing, 0, ww, E, H);                         // južné krídlo
  wing(ww, ww + 4, ww, C.L - ww, 3.6, .25, mWall, mFlat);      // nízka spojovacia časť v nádvorí (plochá sivá strecha)
  wing(ww + 4, ww + 13, C.L / 2 - 6, C.L / 2 + 6, 5.2, 3.2, mGlass, mRoofB);   // presklená budova v nádvorí (reštaurácia, podľa fotky z dronu) s červenou strechou
  // terasa: biele stany (pyramídy)
  for (const [e, n] of C.tents || []) { const p = pos(e, n, ground(e, n)); const t = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.4, 4, 1, true), mWhite); t.position.set(p.x, p.y + 3.1, p.z); t.rotation.y = RU + Math.PI / 4; G.add(t);
    for (const [dx, dz] of [[-1.5, -1.5], [1.5, -1.5], [1.5, 1.5], [-1.5, 1.5]]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 2.4, 4), mPole); s.position.set(p.x + dx, p.y + 1.2, p.z + dz); G.add(s) } }
  // dva veľké slnečníky (dáždnik s rebrami)
  for (const [e, n, r] of C.umbrellas || []) { const p = pos(e, n, ground(e, n)), seg = 12, top = 4.6, rim = 3.1;
    const g = new THREE.ConeGeometry(r, top - rim, seg, 1, true); const um = new THREE.Mesh(g, mCream); um.position.set(p.x, p.y + rim + (top - rim) / 2, p.z); um.castShadow = true; G.add(um); hits.push(um);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.12, .15, top, 6), mPole); pole.position.set(p.x, p.y + top / 2, p.z); G.add(pole);
    const ribs = new THREE.Mesh(new THREE.ConeGeometry(r * 1.01, top - rim, seg, 1, true), new THREE.MeshBasicMaterial({ color: 0xb9ae95, wireframe: true })); ribs.position.copy(um.position); G.add(ribs) }
  // prístrešky so stolmi (štvorcové plachty na stĺpikoch)
  for (const [e, n, s] of C.pergolas || []) { const p = pos(e, n, ground(e, n)), h = 1.5, R = RU;
    const ag = new THREE.CylinderGeometry(s * .45, s * .45, s, 14, 1, true, -Math.PI / 2, Math.PI); ag.rotateX(-Math.PI / 2);
    const arc = new THREE.Mesh(ag, mCream); arc.scale.y = .62; arc.rotation.y = R; arc.position.set(p.x, p.y + 1.5, p.z); arc.castShadow = true; G.add(arc);
    const q = new THREE.Vector3(); for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { q.set(dx * s * .45, 0, dz * s * .45).applyAxisAngle(new THREE.Vector3(0, 1, 0), R); const c = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, h, 5), mWood); c.position.set(p.x + q.x, p.y + h / 2, p.z + q.z); G.add(c) }
    const tb = new THREE.Mesh(new THREE.BoxGeometry(s * .5, .75, s * .3), mWood); tb.position.set(p.x, p.y + .38, p.z); tb.rotation.y = R; G.add(tb) }
  // menšie budovy s tmavou sedlovou strechou
  for (const S of C.sheds || []) { const [e, n] = S.c, p = pos(e, n, ground(e, n)), eh = 3.4, rh = 2.6, R = ang(e, n, Math.cos(S.a), Math.sin(S.a));
    const body = new THREE.Mesh(new THREE.BoxGeometry(S.L, eh, S.W), M({ color: 0xf4f0e4 })); body.position.set(p.x, p.y + eh / 2, p.z); body.rotation.y = R; G.add(body); hits.push(body);
    const sh = new THREE.Shape([new THREE.Vector2(-S.W / 2 - .4, 0), new THREE.Vector2(S.W / 2 + .4, 0), new THREE.Vector2(0, rh)]);
    const rg = new THREE.ExtrudeGeometry(sh, { depth: S.L + .6, bevelEnabled: false }); rg.translate(0, 0, -(S.L + .6) / 2); rg.rotateY(Math.PI / 2);
    const roof = new THREE.Mesh(rg, mDark); roof.position.set(p.x, p.y + eh, p.z); roof.rotation.y = R; roof.castShadow = true; G.add(roof) }
  G.traverse(o => { if (o.isMesh) { o.castShadow = o.castShadow || false } });
  const center = at(C.wing / 2, C.L / 2);
  return { group: G, hits, center, top: base + E + H };
}

// panel s menu reštaurácie (DATA.clubhouse.menu; kým chýba, zobrazí sa info)
export function clubMenu(C) {
  let el = document.getElementById("clubmenu");
  if (!el) {
    const st = document.createElement("style");
    st.textContent = `#clubmenu{position:fixed;inset:0;z-index:5000;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.35)}
#clubmenu .cm{background:#fff;color:#1d2a1f;width:min(520px,100%);max-height:80vh;overflow:auto;border-radius:18px 18px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom));font:15px/1.45 system-ui,-apple-system,sans-serif;box-shadow:0 -6px 24px rgba(0,0,0,.25)}
#clubmenu h2{margin:0 0 2px;font-size:20px}#clubmenu .sub{color:#667;margin-bottom:12px}#clubmenu h3{margin:14px 0 4px;font-size:15px;color:#2f6b2c}
#clubmenu .it{display:flex;justify-content:space-between;gap:12px;padding:5px 0;border-bottom:1px solid #eee}#clubmenu .it b{font-weight:600}
#clubmenu .x{float:right;border:0;background:#eef2ee;border-radius:50%;width:34px;height:34px;font-size:18px;cursor:pointer}
#clubmenu .ph{background:#f5f7f2;border-radius:12px;padding:14px;color:#556}`;
    document.head.appendChild(st);
    el = document.createElement("div"); el.id = "clubmenu"; document.body.appendChild(el);
    el.addEventListener("click", e => { if (e.target === el || e.target.closest(".x")) el.remove() });
  }
  const m = C && C.menu, esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let body = "";
  if (m && m.sections) for (const s of m.sections) { body += `<h3>${esc(s.name)}</h3>`; for (const it of s.items || []) body += `<div class="it"><span><b>${esc(it.name)}</b>${it.desc ? `<br><small>${esc(it.desc)}</small>` : ""}</span><span>${it.price != null ? esc(it.price) : ""}</span></div>` }
  else body = `<div class="ph">🍽 Jedálny lístok reštaurácie sem doplníme čoskoro.</div>`;
  el.innerHTML = `<div class="cm"><button class="x" aria-label="Zavrieť">✕</button><h2>${esc((C && C.name) || "Clubhouse")}</h2><div class="sub">Clubhouse · reštaurácia${m && m.note ? " · " + esc(m.note) : ""}</div>${body}</div>`;
}

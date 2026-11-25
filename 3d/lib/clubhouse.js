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
  const wallTex = cv(128, 128, (g, w, h) => { g.fillStyle = "#faeca8"; g.fillRect(0, 0, w, h); g.fillStyle = "#e9e4d6"; g.fillRect(0, h - 12, w, 12);
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
  // nádvorie podľa fotky (Martin 24.11.): pri vnútornej fasáde hlavného krídla nízka prístavba cez celú šírku s tmavou pultovou strechou,
  // pred ňou presklená reštaurácia so špicatým (lomeným) čelom a červenou valbovou strechou so strešnými oknami; dlažba, trávniky, živé ploty, 2 smreky
  const P3 = (a, b, h) => pos(...at(a, b), base + h);
  const mesh = (tris, mat, uvs) => { const g = new THREE.BufferGeometry(), arr = []; for (const t of tris) for (const q of t) { const v3 = P3(...q); arr.push(v3.x, v3.y, v3.z) }
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3)); if (uvs) g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.material.side = THREE.DoubleSide; m.castShadow = m.receiveShadow = true; G.add(m); hits.push(m); return m };
  const walls = (poly, h0, h1, mat, rep = 3.2) => { const T = [], U = []; for (let i = 0; i < poly.length - 1; i++) { const [a, b] = [poly[i], poly[i + 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]) / rep;
      T.push([[a[0], a[1], h0], [b[0], b[1], h0], [b[0], b[1], h1]], [[a[0], a[1], h0], [b[0], b[1], h1], [a[0], a[1], h1]]); U.push(0, 0, L, 0, L, (h1 - h0) / 3.6, 0, 0, L, (h1 - h0) / 3.6, 0, (h1 - h0) / 3.6) } return mesh(T, mat, U) };
  const c = C.L / 2, b0 = ww, b1 = C.L - ww, d = 6.5, hl = 3.9, hh = 5.6;     // prístavba: hĺbka d, výška pri krajoch hl, pri fasáde hh
  walls([[ww, b0], [ww + d, b0], [ww + d, b1], [ww, b1]], 0, hl, mWall);
  mesh([[[ww, b0, hh], [ww + d, b0, hl], [ww + d, b1, hl]], [[ww, b0, hh], [ww + d, b1, hl], [ww, b1, hh]]], mFlat);
  const gw = 6.2, gH = 4.4, gR = 6.6, u0 = ww + 2, u1 = ww + d + 3, u2 = ww + d + 6.5;   // presklená časť: šírka 2·gw, bočné steny po u1, špic u2
  walls([[u0, c - gw], [u1, c - gw], [u2, c], [u1, c + gw], [u0, c + gw]], 0, gH, mGlass, 2.2);
  const R0 = [u0, c, gR], R1 = [u1 - .5, c, gR], A = [u0, c - gw - .3, gH], B = [u1 + .2, c - gw - .3, gH], Pk = [u2 + .45, c, gH], D = [u1 + .2, c + gw + .3, gH], F = [u0, c + gw + .3, gH];
  const roofUV = []; const rt = [[A, B, R1], [A, R1, R0], [B, Pk, R1], [Pk, D, R1], [D, F, R0], [D, R0, R1]]; for (const t of rt) for (const q of t) roofUV.push(q[0] / 3, q[1] / 3 + q[2] / 3);
  mesh(rt, mRoofB, roofUV);
  for (const s of [-1, 1]) for (const k of [0, 1]) { const sk = new THREE.Mesh(new THREE.BoxGeometry(.06, .9, 1.3), mGlass); const p = P3(u0 + 2.2 + k * 1.8, c + s * 3.2, gR - 1.2 - k * .55); sk.position.copy(p); sk.rotation.y = RU; G.add(sk) }   // strešné okná
  // dlažba a trávniky na nádvorí (tenká plocha nad terénom), živé ploty; dva smreky stoja PRED budovou, mimo nádvoria (Martin 24.11.)
  { const cvC = cv(128, 128, (g, w, h) => { g.fillStyle = "#b9b6ad"; g.fillRect(0, 0, w, h); g.fillStyle = "#6f9a46"; g.fillRect(8, 30, 40, 86); g.fillRect(80, 30, 40, 86); g.fillStyle = "#c9c6bd"; g.fillRect(56, 0, 16, h) });
    cvC.wrapS = cvC.wrapT = THREE.ClampToEdgeWrapping; const U0 = ww + d, U1 = C.wing, uv = [], T = [[[U0, b0, .06], [U1, b0, .06], [U1, b1, .06]], [[U0, b0, .06], [U1, b1, .06], [U0, b1, .06]]];
    for (const t of T) for (const q of t) uv.push((q[1] - b0) / (b1 - b0), 1 - (q[0] - U0) / (U1 - U0));
    mesh(T, M({ map: cvC, roughness: .95 }), uv);
    const mHedge = M({ color: 0x3f6a2c }); for (const s of [-1, 1]) { const hg = new THREE.Mesh(new THREE.BoxGeometry(C.wing - U0 - 4, .9, .7), mHedge); hg.position.copy(P3((U0 + C.wing) / 2 + 2, c + s * (b1 - b0) * .47, .45)); hg.rotation.y = RU; G.add(hg) }
    const mSpr = M({ color: 0x2c4a2a, flatShading: true }), mTr = M({ color: 0x5a3f28 });
    for (const s of [-1, 1]) { const p = P3(C.wing + 4, c + s * 4.5, 0); const tr = new THREE.Mesh(new THREE.CylinderGeometry(.18, .25, 2, 5), mTr); tr.position.set(p.x, p.y + 1, p.z); G.add(tr);
      for (let i = 0; i < 3; i++) { const cn = new THREE.Mesh(new THREE.ConeGeometry(2.4 - i * .6, 4.2 - i * .6, 8), mSpr); cn.position.set(p.x, p.y + 3 + i * 2.6, p.z); cn.castShadow = true; G.add(cn) } } }
  // ---- okolie podľa Martinových fotiek (25.11.2026; novšie než mapy.com) ----
  const grp = (e, n, rot = RU) => { const g = new THREE.Group(); g.position.copy(pos(e, n, ground(e, n))); g.rotation.y = rot; G.add(g); return g };
  const add = (g, geo, mat, x = 0, y = 0, z = 0, hit = false) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); if (hit) hits.push(m); return m };
  const mBlk = M({ color: 0x24211f, roughness: .55, side: THREE.DoubleSide }), mOch = M({ color: 0xd8a952, roughness: .7, side: THREE.DoubleSide }), mSteel = M({ color: 0xb4b6b8, metalness: .5, roughness: .4 });
  const mCable = new THREE.LineBasicMaterial({ color: 0x8f9396 });
  // štvorcové slnečníky: terasa pred kaštieľom béžové (foto 6), nádvorie čierne/krémové (foto 5)
  const sqUmb = (g, x, z, w, col) => { add(g, new THREE.CylinderGeometry(.05, .05, 2.7, 5), mPole, x, 1.35, z);
    const c = add(g, new THREE.ConeGeometry(w * .707, .55, 4, 1, true), M({ color: col, roughness: .9, side: THREE.DoubleSide }), x, 2.75, z); c.rotation.y = Math.PI / 4 };
  for (const [e, n] of C.tents || []) sqUmb(grp(e, n), 0, 0, 4.2, 0xa3988a);
  for (const [a, b, k] of C.cups || []) { const [e, n] = at(a, C.L / 2 + b), g = new THREE.Group(); g.position.copy(pos(e, n, base + .06)); g.rotation.y = RU; G.add(g); sqUmb(g, 0, 0, 3.6, k ? 0xe9e3cf : 0x262524) }
  // "hríby" (foto 1–3): lievikový stĺp z čiernych rebier so žltými klinmi, 6-ramenná strecha (hore čierna, spodok okrový), oceľový stožiar s lanami; pod severným okrúhly drevený bar
  const funTex = cv(256, 64, (g, w, h) => { g.fillStyle = "#1f1d1b"; g.fillRect(0, 0, w, h); g.fillStyle = "#d6a54e"; for (let i = 0; i < 6; i++) { const x0 = (i + .5) * w / 6, hw = w / 12 * .7; g.beginPath(); g.moveTo(x0 - 1, h); g.lineTo(x0 + 1, h); g.lineTo(x0 + hw, 0); g.lineTo(x0 - hw, 0); g.closePath(); g.fill() } });
  funTex.wrapT = THREE.ClampToEdgeWrapping;
  const woodTex = cv(128, 32, (g, w, h) => { g.fillStyle = "#6e4a33"; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 4) { g.fillStyle = x % 8 ? "#5a3a27" : "#7d5640"; g.fillRect(x, 0, 2, h) } g.fillStyle = "#3b2a20"; g.fillRect(0, 0, w, 3) });
  woodTex.repeat.set(6, 1);
  const mFun = M({ map: funTex, roughness: .6, side: THREE.DoubleSide }), mBar = M({ map: woodTex, roughness: .8 });
  C.umbrellas.forEach(([e, n, r], i) => { const g = grp(e, n, RU + Math.PI / 6), H0 = 3.75, rf = 3.0;
    const prof = []; for (let k = 0; k <= 10; k++) { const t = k / 10; prof.push(new THREE.Vector2(.75 + (rf - .75) * Math.pow(t, 2.4), H0 * t)) }
    add(g, new THREE.LatheGeometry(prof, 24), mFun, 0, 0, 0, true);
    const ring = [], N = 12; for (let k = 0; k < N; k++) { const t = k / N * Math.PI * 2, tip = k % 2 === 0, rr = tip ? r : r * .72; ring.push([Math.cos(t) * rr, tip ? H0 + .4 : H0 + .12, Math.sin(t) * rr]) }
    const top = [], bot = [], rim = [];
    for (let k = 0; k < N; k++) { const A = ring[k], B = ring[(k + 1) % N], c = [0, H0 - .05, 0];
      top.push(...c, ...A, ...B); bot.push(c[0], c[1] - .08, c[2], A[0], A[1] - .08, A[2], B[0], B[1] - .08, B[2]);
      rim.push(...A, ...B, B[0], B[1] - .28, B[2], ...A, B[0], B[1] - .28, B[2], A[0], A[1] - .28, A[2]) }
    for (const [arr, mat] of [[top, mBlk], [bot, mOch], [rim, mBlk]]) { const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3)); gg.computeVertexNormals(); add(g, gg, mat, 0, 0, 0, true) }
    for (let k = 0; k < 6; k++) { const t = k / 6 * Math.PI * 2, rb = add(g, new THREE.BoxGeometry(r - 1, .22, .16), mBlk, Math.cos(t) * (r + 1) / 2, H0 - .02, Math.sin(t) * (r + 1) / 2); rb.rotation.y = -t; rb.rotation.z = .08 }
    add(g, new THREE.CylinderGeometry(.09, .12, 3.2, 8), mSteel, 0, H0 + 1.5, 0);
    const L = []; for (let k = 0; k < 6; k++) { const t = k / 6 * Math.PI * 2; L.push(0, H0 + 3, 0, Math.cos(t) * r * .7, H0 + .25, Math.sin(t) * r * .7) }
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(L, 3)); g.add(new THREE.LineSegments(lg, mCable));
    if (i === (C.bar ?? 0)) { add(g, new THREE.CylinderGeometry(2.5, 2.5, 1.15, 28, 1, true), mBar, 0, .58, 0, true); add(g, new THREE.CylinderGeometry(2.55, 2.55, .06, 28), mDark, 0, 1.17, 0) } });
  // oblúkové prístrešky na vozíky (foto 2, 7, 8): tmavé zahnuté rebrá, béžová plachta, otvorené k ihrisku; dĺžka s pozdĺž hlavného krídla
  const mMem = M({ color: 0xe7c98c, roughness: .9, side: THREE.DoubleSide });
  const hood = (D, Hh) => { const P = []; for (let k = 0; k <= 12; k++) { const t = k / 12, ang2 = t * Math.PI / 2; P.push([D / 2 - D * (1 - Math.cos(ang2)) * .95, 1.7 + (Hh - 1.7) * Math.sin(ang2)]) } P.unshift([D / 2, 0]); return P };
  function shelter(g, len, D = 3.4, Hh = 3.0) { const P = hood(D, Hh), bays = Math.max(1, Math.round(len / 2.4)), arr = [];
    for (let k = 0; k < P.length - 1; k++) { const [x0, y0] = P[k], [x1, y1] = P[k + 1]; arr.push(x0, y0, -len / 2, x1, y1, -len / 2, x1, y1, len / 2, x0, y0, -len / 2, x1, y1, len / 2, x0, y0, len / 2) }
    const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3)); gg.computeVertexNormals(); add(g, gg, mMem, 0, 0, 0, true);
    const curve = new THREE.CatmullRomCurve3(P.map(([x, y]) => new THREE.Vector3(x + .03, y + .05, 0))), rg = new THREE.TubeGeometry(curve, 16, .09, 5, false);
    for (let b = 0; b <= bays; b++) add(g, rg, mBlk, 0, 0, -len / 2 + b * len / bays);
    add(g, new THREE.BoxGeometry(.5, .1, len + .3), mBlk, P[P.length - 1][0] + .2, Hh + .02, 0) }
  // [e, n, šírka, rot]: rot=1 → otočený o 90° (otvor k hríbom/terase, Martin 25.11.); každý prístrešok 2 rebrá-polia ≈ 2 vozíky
  for (const [e, n, s, r] of C.pergolas || []) shelter(grp(e, n, RU + (r ? Math.PI / 2 : 0)), s);
  // presklený obchod / pro shop (foto 7): sklenená kocka s tmavými rámami, plochá tmavá strecha, na konci oblúkové rebro s plachtou, stožiar s lanami
  if (C.shop) { const [e, n, s] = C.shop, g = grp(e, n), D = 4.6, hh = 2.7;
    const shopTex = cv(128, 64, (x, w, h) => { x.fillStyle = "#7f9a8a"; x.fillRect(0, 0, w, h); x.fillStyle = "rgba(255,255,255,.18)"; x.fillRect(0, 0, w, h * .45); x.fillStyle = "#26221f"; for (let i = 0; i <= 4; i++)x.fillRect(i * w / 4 - 2, 0, 4, h); x.fillRect(0, 0, w, 4); x.fillRect(0, h - 6, w, 6) });
    shopTex.repeat.set(s / 5, 1); const mSG = M({ map: shopTex, roughness: .2, metalness: .3 });
    add(g, new THREE.BoxGeometry(D, hh, s - 2.2), [mSG, mSG, mBlk, mBlk, mSG, mSG], 0, hh / 2, -1.1, true);
    add(g, new THREE.BoxGeometry(D + .8, .25, s - 1.8), mBlk, 0, hh + .12, -1.1);
    const eg = new THREE.Group(); eg.position.set(0, 0, s / 2 - 2.2 + 1.2); eg.rotation.y = Math.PI / 2; g.add(eg); shelter(eg, D + .3, 2.4, hh + .5);   // oblúkové čelo na konci (foto 7)
    add(g, new THREE.CylinderGeometry(.08, .1, 2.2, 8), mSteel, 0, hh + 1.1, s / 2 - 2.4);
    const L = []; for (const [x, z] of [[-D / 2, -s / 2], [D / 2, -s / 2], [-D / 2, s / 2 - 1], [D / 2, s / 2 - 1]]) L.push(0, hh + 2.1, s / 2 - 2.4, x, hh + .25, z);
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(L, 3)); g.add(new THREE.LineSegments(lg, mCable)) }
  // kamenná studňa (foto 2)
  if (C.well) { const g = grp(...C.well); add(g, new THREE.CylinderGeometry(.85, .9, .7, 14), M({ color: 0x9a948a, roughness: 1 }), 0, .35, 0); add(g, new THREE.CylinderGeometry(.62, .62, .05, 14), mDark, 0, .71, 0) }
  // menšie budovy (Garden room a sála): krémová omietka, oblúkové okná/dvere na dlhých stranách (foto 4, 6), tmavohnedá sedlová strecha
  const archTex = cv(128, 128, (g, w, h) => { g.fillStyle = "#f1e2b4"; g.fillRect(0, 0, w, h); g.fillStyle = "#e2d4a8"; g.fillRect(0, h - 8, w, 8);
    g.fillStyle = "#fbf6ea"; g.beginPath(); g.moveTo(36, h - 8); g.lineTo(36, 52); g.arc(64, 52, 28, Math.PI, 0); g.lineTo(92, h - 8); g.fill();
    g.fillStyle = "#5b2f1e"; g.beginPath(); g.moveTo(41, h - 8); g.lineTo(41, 54); g.arc(64, 54, 23, Math.PI, 0); g.lineTo(87, h - 8); g.fill();
    g.fillStyle = "#3b4c55"; g.beginPath(); g.moveTo(45, h - 10); g.lineTo(45, 55); g.arc(64, 55, 19, Math.PI, 0); g.lineTo(83, h - 10); g.fill();
    g.fillStyle = "#5b2f1e"; g.fillRect(62, 34, 4, h - 44); for (const y of [56, 78, 100]) g.fillRect(45, y, 38, 2) });
  const mShedEnd = M({ color: 0xf1e2b4 }), mShedRoof = M({ color: 0x4a4340, roughness: .9 });
  for (const S of C.sheds || []) { const [e, n] = S.c, p = pos(e, n, ground(e, n)), eh = 3.6, rh = 2.8, R = ang(e, n, Math.cos(S.a), Math.sin(S.a));
    const bg = new THREE.BoxGeometry(S.L, eh, S.W), uvA = bg.attributes.uv, nw = Math.max(2, Math.round(S.L / 5));
    for (let i = 16; i < 24; i++) uvA.setX(i, uvA.getX(i) * nw);
    const tx = archTex.clone(); tx.needsUpdate = true; const mA = M({ map: tx });
    const body = new THREE.Mesh(bg, [mShedEnd, mShedEnd, mShedEnd, mShedEnd, mA, mA]); body.position.set(p.x, p.y + eh / 2, p.z); body.rotation.y = R; body.castShadow = body.receiveShadow = true; G.add(body); hits.push(body);
    const sh = new THREE.Shape([new THREE.Vector2(-S.W / 2 - .5, 0), new THREE.Vector2(S.W / 2 + .5, 0), new THREE.Vector2(0, rh)]);
    const rg = new THREE.ExtrudeGeometry(sh, { depth: S.L + .6, bevelEnabled: false }); rg.translate(0, 0, -(S.L + .6) / 2); rg.rotateY(Math.PI / 2);
    const roof = new THREE.Mesh(rg, mShedRoof); roof.position.set(p.x, p.y + eh, p.z); roof.rotation.y = R; roof.castShadow = true; G.add(roof) }
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

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
  // fasáda podľa fotky vchodu (Martin 25.11.): žltkastá omietka, okná s hrubým bielym ostením a parapetom, 1 okno na podlažie v každej osi,
  // okná nad sebou v rovnakých osiach, nikdy cez seba (predtým sa 2-okenná dlaždica opakovala 2× na výšku -> 4 rady na 2 podlažia)
  const winDraw = (g, cx, y0, s) => {   // cx, y0 = stred a spodok okna v px, s = px na meter
    const ww2 = 1.12 * s, wh = 1.7 * s, fr = .24 * s, x = cx - ww2 / 2, y = y0 - wh;
    g.fillStyle = "#f7f5ee"; g.fillRect(x - fr, y - fr, ww2 + 2 * fr, wh + 2 * fr);                    // ostenie
    g.fillStyle = "#dcd6c6"; g.fillRect(x - fr * .35, y - fr * .35, ww2 + fr * .7, wh + fr * .7);     // tieň vnútornej hrany ostenia
    g.fillStyle = "#f7f5ee"; g.fillRect(x - fr * 1.25, y0 + fr * .6, ww2 + fr * 2.5, .1 * s);          // parapet
    g.fillStyle = "#3f4c55"; g.fillRect(x, y, ww2, wh);                                                // sklo
    g.fillStyle = "rgba(255,255,255,.16)"; g.fillRect(x, y, ww2, wh * .45);
    g.fillStyle = "#fbfbf8"; const b = Math.max(1, .07 * s); g.fillRect(x, y, ww2, b); g.fillRect(x, y0 - b, ww2, b); g.fillRect(x, y, b, wh); g.fillRect(x + ww2 - b, y, b, wh);
    g.fillRect(cx - b / 2, y, b, wh); g.fillRect(x, y + wh * .3, ww2, b) };                           // stredný stĺpik + priečka
  const wallTex = cv(128, 128, (g, w, h) => { g.fillStyle = "#f5e098"; g.fillRect(0, 0, w, h); g.fillStyle = "#e9e4d6"; g.fillRect(0, h - 12, w, 12); winDraw(g, 64, 92, 30) });
  // celá stena krídla ako jedna textúra: osi okien rovnomerne, alebo od vchodu (door = m od začiatku steny), nad vchodom len horné okno
  const facadeTex = (len, H, door) => { const s = Math.min(24, 2048 / len), W2 = Math.round(len * s), H2 = Math.round(H * s), BAY = 4.2;
    let xs = []; if (door != null) { for (let x = door; x > 1.7; x -= BAY) xs.push(x); for (let x = door + BAY; x < len - 1.7; x += BAY) xs.push(x) }
    else { const n = Math.max(1, Math.round(len / BAY)); for (let i = 0; i < n; i++) xs.push((i + .5) * len / n) }
    return cv(W2, H2, (g, w, h) => { g.fillStyle = "#f5e098"; g.fillRect(0, 0, w, h); g.fillStyle = "#e9e4d6"; g.fillRect(0, h - .45 * s, w, .45 * s);
      g.fillStyle = "#efe2a6"; g.fillRect(0, 0, w, .28 * s); g.fillStyle = "#f3e7b8"; g.fillRect(0, h - H / 2 * s - .12 * s, w, .16 * s);   // rímsa pod strechou, kordónová rímsa medzi podlažiami
      for (const x of xs) { if (door == null || Math.abs(x - door) > .5) winDraw(g, x * s, h - 1.0 * s, s); winDraw(g, x * s, h - (H / 2 + 1.25) * s, s) } }) };
  const roofTex = cv(64, 64, (g, w, h) => { g.fillStyle = "#d9692f"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 6) { g.fillStyle = "rgba(120,40,10,.35)"; g.fillRect(0, y, w, 1.5) } for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? "255,170,110" : "150,60,25"},.25)`; g.fillRect(Math.random() * w, Math.random() * h, 6, 3) } });
  const glassTex = cv(64, 64, (g, w, h) => { g.fillStyle = "#9fb9c4"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(0, 0, w, h / 2); g.fillStyle = "#f4f4f0"; for (let x = 0; x < w; x += 16) g.fillRect(x, 0, 3, h); g.fillRect(0, 0, w, 3); g.fillRect(0, h / 2, w, 3) });
  const mGlass = M({ map: glassTex, roughness: .25, metalness: .2 });
  const SHADE = 0x6a5622, mWall = M({ map: wallTex, emissive: SHADE }), mRoof = M({ map: roofTex, roughness: .9 }), mRoofB = M({ map: roofTex, roughness: .9 }), mFlat = M({ color: 0x4d535b, roughness: .6 }), mCream = M({ color: 0xf1ead8, side: THREE.DoubleSide }), mPole = M({ color: 0x8a8a86 }), mWood = M({ color: 0x8a6a48 }), mDark = M({ color: 0x5b4a3c }), mWhite = M({ color: 0xfafafa, side: THREE.DoubleSide });
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
  function wing(a0, a1, b0, b1, eave, hr, roofM = mRoof) {
    const ca = (a0 + a1) / 2, cb = (b0 + b1) / 2, A = a1 - a0, B = b1 - b0, [e, n] = at(ca, cb), p = pos(e, n, base);
    const box = new THREE.BoxGeometry(A, eave, B);
    const body = new THREE.Mesh(box, mWall); body.position.set(p.x, p.y + eave / 2, p.z);
    const roof = hipRoof(A + .9, B + .9, hr, roofM); roof.position.set(p.x, p.y + eave, p.z);
    for (const m of [body, roof]) { m.rotation.y = RU; m.castShadow = m.receiveShadow = true; G.add(m); hits.push(m) }
    // každá bočná stena vlastná textúra (UV 0..1 = celá stena); stena, pri ktorej je hlavný vchod (C.door), má osi okien od vchodu
    body.updateMatrix(); const P = box.attributes.position, UV = box.attributes.uv, dp = C.door != null ? pos(...at(0, C.door), base) : null, mats = [];
    for (let f = 0; f < 6; f++) { if (f === 2 || f === 3) { mats.push(mWall); continue }
      let pa, pb; for (let i = f * 4; i < f * 4 + 4; i++) { if (UV.getY(i) > .5) continue; const v3 = new THREE.Vector3().fromBufferAttribute(P, i).applyMatrix4(body.matrix); if (UV.getX(i) < .5) pa = v3; else pb = v3 }
      const dx = pb.x - pa.x, dz = pb.z - pa.z, len = Math.hypot(dx, dz); let door = null;
      if (dp) { const t = ((dp.x - pa.x) * dx + (dp.z - pa.z) * dz) / len, off = Math.abs((dp.x - pa.x) * dz - (dp.z - pa.z) * dx) / len; if (off < 1.5 && t > 0 && t < len) door = t }
      const nx = dz / len, nz = -dx / len, cx = (pa.x + pb.x) / 2 - body.position.x, cz = (pa.z + pb.z) / 2 - body.position.z, sg = nx * cx + nz * cz > 0 ? 1 : -1;   // vonkajšia normála steny
      mats.push(M({ map: facadeTex(len, eave, door), emissive: sg * (nx * -.8 + nz * -.6) < 0 ? SHADE : 0x2a2208 })) }   // stena odvrátená od slnka (SZ) – teplejší odtieň, inak v tieni olivovozelená (Martin 26.11.)
    body.material = mats;
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
  // v263 podľa fotiek nádvoria (Martin 26.11.: street view + foto 5): presklená sála má ROVNÉ čelo do nádvoria so štítom – strmý stredný štít so špicom,
  // po stranách miernejšie skosené strechy; žltá omietka, veľké sklá s bielymi rámami, stredný žltý pilier, vchod vpravo od neho; po bokoch nízke žlté spojovacie časti
  const c = C.L / 2, b0 = ww, b1 = C.L - ww, uF = ww + 9.5, d = uF - ww - .8, hl = 4.0, hh = 4.6;   // uF = čelo sály, d = hĺbka nízkej prístavby
  const mLow = M({ color: 0x8e8a82, roughness: .8 });
  walls([[ww, b0], [ww + d, b0], [ww + d, b1], [ww, b1]], 0, hl, mWall);
  mesh([[[ww, b0, hh], [ww + d, b0, hl], [ww + d, b1, hl]], [[ww, b0, hh], [ww + d, b1, hl], [ww, b1, hh]]], mLow);
  const gw = 6.6, PR = [[-gw, 4.6], [-2.4, 7.4], [0, 10.0], [2.4, 7.4], [gw, 4.6]], u0 = ww + 1.5;   // profil strechy (x od stredu, výška)
  const roofH = x => { for (let i = 0; i < PR.length - 1; i++) { const [x0, h0] = PR[i], [x1, h1] = PR[i + 1]; if (x <= x1) return h0 + (h1 - h0) * (x - x0) / (x1 - x0) } return PR[PR.length - 1][1] };
  const YEL = "#f3dc8c", S2 = 48, FW = Math.round(2 * gw * S2), FH = Math.round(10.2 * S2);
  const hallTex = cv(FW, FH, (g, w, h) => { const X = x => (x + gw) * S2, Y = y => h - y * S2;
    g.fillStyle = YEL; g.fillRect(0, 0, w, h); g.fillStyle = "#e4cf86"; g.fillRect(0, Y(.3), w, .3 * S2);   // sokel
    g.save(); g.beginPath(); g.moveTo(X(-gw), Y(0)); for (const [x, y] of PR) g.lineTo(X(x), Y(y - .55)); g.lineTo(X(gw), Y(0)); g.closePath(); g.clip();
    const pane = (x0, x1, y0, y1, nx, ny) => { g.fillStyle = "#fbfbf7"; g.fillRect(X(x0) - 3, Y(y1) - 3, X(x1) - X(x0) + 6, Y(y0) - Y(y1) + 6);
      const gr = g.createLinearGradient(0, Y(y1), 0, Y(y0)); gr.addColorStop(0, "#c3d6e0"); gr.addColorStop(.5, "#97acb8"); gr.addColorStop(1, "#6d7f88"); g.fillStyle = gr; g.fillRect(X(x0), Y(y1), X(x1) - X(x0), Y(y0) - Y(y1));
      g.fillStyle = "#fbfbf7"; for (let k = 1; k < nx; k++) g.fillRect(X(x0 + (x1 - x0) * k / nx) - 2, Y(y1), 4, Y(y0) - Y(y1)); for (const yy of ny) g.fillRect(X(x0), Y(yy) - 2, X(x1) - X(x0), 4) };
    for (const s of [-1, 1]) { const P = (a, b) => s < 0 ? [-b, -a] : [a, b];
      pane(...P(.85, 1.95), s > 0 ? 0 : .3, 9.6, 1, [2.4, 4.6, 6.8]);          // vysoké sklá pri strednom pilieri (vpravo dole vchod)
      pane(...P(2.35, 2.95), .3, 8.2, 1, [2.4, 4.6]);                           // úzke okno
      pane(...P(3.3, 6.15), .3, 6.6, 3, [2.5, 2.8]) }                           // veľké presklenie sály
    g.restore();
    g.fillStyle = "#fbfbf7"; g.fillRect(X(.85), Y(2.35), X(1.95) - X(.85), 5); g.fillRect(X(1.4) - 2, Y(2.35), 4, 2.35 * S2);   // dvere
    g.fillStyle = "#3a3a3a"; for (const x of [-.55, .55]) g.fillRect(X(x) - 4, Y(2.9), 8, 12) });                               // lampy pri vchode
  hallTex.wrapS = hallTex.wrapT = THREE.ClampToEdgeWrapping;
  const mYel = M({ color: 0xf3dc8c, emissive: SHADE, side: THREE.DoubleSide });
  { const T = [], U = [], uvOf = (x, y) => [(x + gw) / (2 * gw), y / 10.2];
    for (let i = 0; i < PR.length - 1; i++) { const [x0, h0] = PR[i], [x1, h1] = PR[i + 1], q = [[x0, 0], [x1, 0], [x1, h1], [x0, h0]];
      T.push([[uF, c + q[0][0], q[0][1]], [uF, c + q[1][0], q[1][1]], [uF, c + q[2][0], q[2][1]]], [[uF, c + q[0][0], q[0][1]], [uF, c + q[2][0], q[2][1]], [uF, c + q[3][0], q[3][1]]]);
      for (const k of [0, 1, 2, 0, 2, 3]) U.push(...uvOf(...q[k])) }
    mesh(T, M({ map: hallTex, roughness: .5, emissive: 0xffffff, emissiveMap: hallTex, emissiveIntensity: .32 }), U) }
  walls([[u0, c - gw], [uF, c - gw]], 0, 4.6, mYel); walls([[uF, c + gw], [u0, c + gw]], 0, 4.6, mYel);
  // strecha sály = profil štítu vytiahnutý dozadu ku krídlu, červená škridla; žltá atika (pás) pozdĺž čela
  { const T = [], U = [], F = [], ov = .35, ub = u0;
    for (let i = 0; i < PR.length - 1; i++) { const [x0, h0] = PR[i], [x1, h1] = PR[i + 1];
      T.push([[uF + ov, c + x0, h0], [uF + ov, c + x1, h1], [ub, c + x1, h1]], [[uF + ov, c + x0, h0], [ub, c + x1, h1], [ub, c + x0, h0]]);
      const sl = Math.hypot(x1 - x0, h1 - h0) / 3; U.push(0, 0, sl, 0, sl, (uF - ub) / 3, 0, 0, sl, (uF - ub) / 3, 0, (uF - ub) / 3);
      F.push([[uF + ov, c + x0, h0 + .05], [uF + ov, c + x1, h1 + .05], [uF + ov, c + x1, h1 - .5]], [[uF + ov, c + x0, h0 + .05], [uF + ov, c + x1, h1 - .5], [uF + ov, c + x0, h0 - .5]]) }
    mesh(T, mRoofB, U); mesh(F, mYel) }
  // stredný piliér mierne vystupuje pred sklo (tieň), končí v špici štítu
  { const pl = new THREE.Mesh(new THREE.BoxGeometry(.3, 9.0, 1.7), mYel); pl.position.copy(P3(uF + .15, c, 4.5)); pl.rotation.y = RU; G.add(pl); hits.push(pl) }
  // dlažba a trávniky na nádvorí (tenká plocha nad terénom), živé ploty; dva smreky stoja PRED budovou, mimo nádvoria (Martin 24.11.)
  { const cvC = cv(256, 256, (g, w, h) => { g.fillStyle = "#c4beb1"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(90,85,75,.25)"; g.lineWidth = 1; for (let k = 0; k <= w; k += 5) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, h); g.moveTo(0, k); g.lineTo(w, k); g.stroke() } g.fillStyle = "#6f9a46"; g.fillRect(0, 0, 16, h * .8); g.fillRect(w - 16, 0, 16, h * .8) });
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
  const mSteelD = M({ color: 0x3a3a3a, roughness: .5 }), mBlk = M({ color: 0x24211f, roughness: .55, side: THREE.DoubleSide }), mOch = M({ color: 0xd8a952, roughness: .7, side: THREE.DoubleSide }), mSteel = M({ color: 0xb4b6b8, metalness: .5, roughness: .4 });
  const mCable = new THREE.LineBasicMaterial({ color: 0x8f9396 });
  // štvorcové slnečníky: terasa pred kaštieľom béžové (foto 6), nádvorie čierne/krémové (foto 5)
  const sqUmb = (g, x, z, w, col) => { add(g, new THREE.CylinderGeometry(.05, .05, 2.7, 5), mPole, x, 1.35, z);
    const c = add(g, new THREE.ConeGeometry(w * .707, .55, 4, 1, true), M({ color: col, roughness: .9, side: THREE.DoubleSide }), x, 2.75, z); c.rotation.y = Math.PI / 4 };
  for (const [e, n] of C.tents || []) sqUmb(grp(e, n), 0, 0, 4.2, 0xa3988a);
  // stoly so stoličkami pod slnečníkmi na terase (Martin 25.11. + foto zo street view): okrúhly stôl, 4 ratanové stoličky
  const mRat = M({ color: 0x6f665c, roughness: .95 }), mTop = M({ color: 0x8b8378, roughness: .6 });
  const table = (g) => { add(g, new THREE.CylinderGeometry(.5, .5, .04, 16), mTop, 0, .74, 0); add(g, new THREE.CylinderGeometry(.04, .04, .72, 6), mSteelD, 0, .37, 0);
    for (let k = 0; k < 4; k++) { const t = k * Math.PI / 2 + Math.PI / 4, cg = new THREE.Group(); cg.position.set(Math.cos(t) * .85, 0, Math.sin(t) * .85); cg.rotation.y = -t - Math.PI / 2; g.add(cg);
      add(cg, new THREE.BoxGeometry(.5, .08, .5), mRat, 0, .45, 0); add(cg, new THREE.BoxGeometry(.5, .5, .07), mRat, 0, .72, -.24);
      for (const [x, z] of [[-.21, -.21], [.21, -.21], [-.21, .21], [.21, .21]]) add(cg, new THREE.BoxGeometry(.05, .42, .05), mRat, x, .21, z) } };
  for (const [e, n] of C.tents || []) table(grp(e, n));
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
  // [e, n, šírka, rot]: rot=1 → otvor k hríbom/terase, rot=2 → opačne; dvojice stoja chrbtami k sebe (Martin 25.11.); každý prístrešok 2 rebrá-polia ≈ 2 vozíky
  // golfové vozíky (Martin 25.11.): biele, strecha na 4 stĺpikoch, prídou čelom von z prístrešku; zopár miest voľných
  const mCart = M({ color: 0xf2f2ee, roughness: .5 }), mTyre = M({ color: 0x1d1d1d, roughness: .9 }), mSeat = M({ color: 0x3a3a3a, roughness: .8 });
  const cart = (g, x, z) => { const c = new THREE.Group(); c.position.set(x, 0, z); g.add(c);   // dĺžka pozdĺž x, predok k -x
    add(c, new THREE.BoxGeometry(2.3, .45, 1.15), mCart, 0, .55, 0); add(c, new THREE.BoxGeometry(.5, .35, 1.1), mCart, -.95, .9, 0);
    add(c, new THREE.BoxGeometry(.55, .45, 1.05), mSeat, .15, .98, 0); add(c, new THREE.BoxGeometry(.12, .5, 1.05), mSeat, .45, 1.2, 0);
    add(c, new THREE.BoxGeometry(1.6, .06, 1.2), mCart, -.05, 1.85, 0); for (const [px, pz] of [[-.75, -.5], [-.75, .5], [.65, -.5], [.65, .5]]) add(c, new THREE.BoxGeometry(.05, 1.0, .05), mSteelD, px, 1.33, pz);
    for (const [px, pz] of [[-.75, -.55], [-.75, .55], [.75, -.55], [.75, .55]]) { const w = add(c, new THREE.CylinderGeometry(.24, .24, .18, 12), mTyre, px, .24, pz); w.rotation.x = Math.PI / 2 } };
  (C.pergolas || []).forEach(([e, n, s, r], i) => { const g = grp(e, n, RU + (r === 1 ? Math.PI / 2 : r === 2 ? -Math.PI / 2 : 0)); shelter(g, s);
    for (const k of [0, 1]) if ((i * 2 + k) % 5 !== 3) cart(g, .1, (k ? 1 : -1) * s / 4) });
  // presklený obchod / pro shop (foto 7): sklenená kocka s tmavými rámami, plochá tmavá strecha, na konci oblúkové rebro s plachtou, stožiar s lanami
  if (C.shop) { const [e, n, s] = C.shop, g = grp(e, n), D = 4.6, hh = 2.7;
    const shopTex = cv(128, 64, (x, w, h) => { x.fillStyle = "#7f9a8a"; x.fillRect(0, 0, w, h); x.fillStyle = "rgba(255,255,255,.18)"; x.fillRect(0, 0, w, h * .45); x.fillStyle = "#26221f"; for (let i = 0; i <= 4; i++)x.fillRect(i * w / 4 - 2, 0, 4, h); x.fillRect(0, 0, w, 4); x.fillRect(0, h - 6, w, 6) });
    shopTex.repeat.set(s / 5, 1); const mSG = M({ map: shopTex, roughness: .2, metalness: .3 });
    add(g, new THREE.BoxGeometry(D, hh, s - 2.2), [mSG, mSG, mBlk, mBlk, mSG, mSG], 0, hh / 2, -1.1, true);
    // strecha (Martin 25.11. foto): drevená doska s trámami vo výške vrcholu oblúka, plynulo nadväzuje na oblúk na konci a kryje celé sklo
    const zb = s / 2 - 1.9, D2 = 2.4, Hr = hh + .5, z0 = -s / 2 - .4, z1 = zb - D2 * .95 + .05, mWoodD = M({ color: 0x4a3222, roughness: .8 });
    add(g, new THREE.BoxGeometry(D + .5, .14, z1 - z0), [mWoodD, mWoodD, mWoodD, mMem, mWoodD, mWoodD], 0, Hr + .03, (z0 + z1) / 2, true);
    for (let k = 0; k <= 4; k++) add(g, new THREE.BoxGeometry(D + .5, .16, .14), mWoodD, 0, Hr - .1, z0 + .1 + k * (z1 - z0 - .2) / 4);
    add(g, new THREE.BoxGeometry(D, Hr - hh, .12), mWoodD, 0, (hh + Hr) / 2, -s / 2 + .06);
    // na konci dva oblúkové prístrešky chrbtami k sebe (Martin 25.11. foto): prvý strechou nad sklom, druhý otvorený von
    for (const [r, dz, H2] of [[-Math.PI / 2, -D2 / 2, Hr], [Math.PI / 2, D2 / 2, hh + .1]]) { const eg = new THREE.Group(); eg.position.set(0, 0, zb + dz); eg.rotation.y = r; g.add(eg); shelter(eg, D + .3, D2, H2) }
    add(g, new THREE.CylinderGeometry(.08, .1, 2.2, 8), mSteel, 0, hh + 1.1, s / 2 - 2.4);
    const L = []; for (const [x, z] of [[-D / 2, -s / 2], [D / 2, -s / 2], [-D / 2, s / 2 - 1], [D / 2, s / 2 - 1]]) L.push(0, hh + 2.1, s / 2 - 2.4, x, Hr + .1, z);
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(L, 3)); g.add(new THREE.LineSegments(lg, mCable)) }
  // hlavný vstup (street view): kamenný oblúk okolo presklených dverí v strede SZ fasády, schodík; C.door = v (m od W rohu)
  if (C.door != null) { const g = new THREE.Group(); g.position.copy(P3(0, C.door, 0)); g.rotation.y = RU; G.add(g);
    const W2 = 1.75, Hs = 2.6, out = new THREE.Shape(); out.moveTo(-W2 - .35, 0); out.lineTo(-W2 - .35, Hs); out.absarc(0, Hs, W2 + .35, Math.PI, 0, true); out.lineTo(W2 + .35, 0); out.lineTo(-W2 - .35, 0);
    const hole = new THREE.Path(); hole.moveTo(-W2, 0); hole.lineTo(-W2, Hs); hole.absarc(0, Hs, W2, Math.PI, 0, true); hole.lineTo(W2, 0); hole.lineTo(-W2, 0); out.holes.push(hole);
    const fg = new THREE.ExtrudeGeometry(out, { depth: .25, bevelEnabled: false }); fg.rotateY(Math.PI / 2); add(g, fg, M({ color: 0xd9c9a0, roughness: .9 }), -.2, 0, 0, true);
    const gs = new THREE.Shape(); gs.moveTo(-W2, 0); gs.lineTo(-W2, Hs); gs.absarc(0, Hs, W2, Math.PI, 0, true); gs.lineTo(W2, 0); gs.lineTo(-W2, 0);
    const gg = new THREE.ShapeGeometry(gs, 16); gg.rotateY(Math.PI / 2); add(g, gg, M({ color: 0x3c4c55, roughness: .2, metalness: .3, side: THREE.DoubleSide }), -.06, 0, 0);
    for (const [z, y, w, h] of [[0, 1.2, .08, 2.4], [-.6, 1.2, .07, 2.4], [.6, 1.2, .07, 2.4], [0, 2.42, 1.3, .07], [0, Hs + .55, 2 * W2, .07]]) add(g, new THREE.BoxGeometry(.05, h, w), mWhite, -.1, y, z);
    add(g, new THREE.BoxGeometry(1.4, .16, 4.4), M({ color: 0xd6ccb5, roughness: .95 }), -.7, .08, 0) }
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

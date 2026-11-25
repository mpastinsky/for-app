// Okolie areálu v každej jamke (Martin 24.11.2026): hráč má mať pocit, že stojí na skutočnom ihrisku –
// z A3 vidno driving range, z 18-ky clubhouse, susedné jamky, ich stromy a vlajky, cesty.
// Všetko v nízkom detaile v ENU 18-ky (apex.json), akadémia posunutá o AKO. Detailná jamka (okno X0..X1, Y0..Y1)
// ostáva bez zmeny – zem okolia sa vo vnútri okna nekreslí (vyrezané trojuholníky + discard na hrane).

// posun akadémie (počiatok green 1) do ENU 18-ky – rovnaký ako v 3d/ihrisko.html
export const akoOf = AP => [(17.368905 - AP.origin[1]) * 111320 * Math.cos(AP.origin[0] * Math.PI / 180), (48.0007065 - AP.origin[0]) * 111200];

// načítanie dát druhého ihriska + nízkeho terénu celého areálu (3d/areal-ter.json, 6 m)
export async function loadAreal(CRS, DATA) {
  const j = f => fetch(f).then(r => r.ok ? r.json() : null).catch(() => null);
  const [AP, AK, TER] = await Promise.all([CRS === "apex" ? DATA : j("apex.json"), CRS === "apex" ? j("akademia.json") : DATA, j("areal-ter.json")]);
  if (!AP || !TER) return null;
  TER.H = new Int16Array(Uint8Array.from(atob(TER.cm), c => c.charCodeAt(0)).buffer);
  const AKO = akoOf(AP), off = CRS === "apex" ? [0, 0] : AKO;   // ENU tohto ihriska = ENU 18-ky − off
  return { AP, AK, TER, AKO, off, CRS };
}

const shR = (R, d) => {   // posun dát driving range o d (ENU)
  const s = p => [p[0] + d[0], p[1] + d[1], ...p.slice(2)], sP = P => (P || []).map(s);
  return Object.assign({}, R, { tee: sP(R.tee), fan: sP(R.fan), roof: R.roof && Object.assign({}, R.roof, { a: s(R.roof.a), b: s(R.roof.b) }), hut: R.hut && s(R.hut),
    circle: R.circle && s(R.circle), targets: sP(R.targets), rings: sP(R.rings), grassTee: sP(R.grassTee), grassTeeLine: sP(R.grassTeeLine) });
};
// akadémia: plochy 18-ky, ktoré zasahujú do okna jamky (spevnené plochy, cvičné greeny, cesty, bunkre, range, cesta Báč),
// pridáme do DATA v súradniciach akadémie, aby ich nakreslila detailná textúra jamky
export function injectForeign(DATA, A) {
  if (!A || A.CRS === "apex") return;
  const AP = A.AP, d = [-A.off[0], -A.off[1]], s = p => [p[0] + d[0], p[1] + d[1], ...p.slice(2)], sP = P => P.map(s);
  DATA.paved = [...(DATA.paved || []), ...(AP.paved || []).map(q => Object.assign({}, q, { p: sP(q.p) }))];
  DATA.practice = { greens: [...((DATA.practice && DATA.practice.greens) || []), ...((AP.practice && AP.practice.greens) || []).map(sP)] };
  DATA.paths = [...(DATA.paths || []), ...(AP.paths || []).map(q => Object.assign({}, q, { p: sP(q.p) }))];
  DATA.bunkers = [...DATA.bunkers, ...(AP.clubBunkers || []).map(sP), ...(AP.rangeBunkers || []).map(sP)];
  if (AP.range) DATA.range = shR(AP.range, d);
  if (AP.area) DATA.area = { roads: (AP.area.roads || []).map(r => Object.assign({}, r, { p: sP(r.p) })) };
}

// driving range na plátne (rovnaký vzhľad ako drawRange v 3d/ihrisko.html); tx,ty: ENU -> px, S: px/m
export function paintRange(g, R, tx, ty, S, fine) {
  const pth = P => { g.beginPath(); P.forEach(([e, n], i) => i ? g.lineTo(tx(e), ty(n)) : g.moveTo(tx(e), ty(n))); g.closePath() },
    line = P => { g.beginPath(); P.forEach(([e, n], i) => i ? g.lineTo(tx(e), ty(n)) : g.moveTo(tx(e), ty(n))) };
  for (const t of R.targets || []) { g.beginPath(); g.ellipse(tx(t[0]), ty(t[1]), t[2] * S, t[3] * S, 0, 0, 7); g.fillStyle = "#7fb653"; g.fill() }
  for (const r of R.rings || []) { g.beginPath(); g.arc(tx(r[0]), ty(r[1]), 1.6 * S, 0, 7); g.lineWidth = .35 * S; g.strokeStyle = "#e8efe0"; g.stroke() }
  if (R.grassTee && R.grassTee.length) { pth(R.grassTee); g.fillStyle = "#7cb84e"; g.fill() }
  if (R.grassTeeLine && R.grassTeeLine.length) { line(R.grassTeeLine); g.lineCap = g.lineJoin = "round"; g.lineWidth = 2 * S; g.strokeStyle = "#9a9f86"; g.stroke() }
  const T = R.tee, mc = R.fan.reduce((a, p) => [a[0] + p[0] / R.fan.length, a[1] + p[1] / R.fan.length], [0, 0]);
  const nrm = T.map((p, i) => { const a = T[Math.max(0, i - 1)], b = T[Math.min(T.length - 1, i + 1)], L = Math.hypot(b[0] - a[0], b[1] - a[1]); let n = [-(b[1] - a[1]) / L, (b[0] - a[0]) / L];
    const m = T[T.length >> 1]; if ((mc[0] - m[0]) * n[0] + (mc[1] - m[1]) * n[1] < 0) n = [-n[0], -n[1]]; return n });
  g.save(); pth(R.fan); g.fillStyle = "#6fab45"; g.fill(); g.clip(); g.lineCap = "butt";
  for (let k = 0; k < 12; k++) { const d = 2 + k * 6 + 3; line(T.map((p, i) => [p[0] + nrm[i][0] * d, p[1] + nrm[i][1] * d])); g.lineWidth = 6 * S; g.strokeStyle = k % 2 ? "#6aa443" : "#80bd52"; g.stroke() }
  if (fine) { let sd = 3; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647); g.fillStyle = "rgba(150,120,80,.35)";
    for (let k = 0; k < 900; k++) { const i = Math.floor(rr() * (T.length - 1)), f = rr(), d = 2.5 + rr() * 7, e = T[i][0] + (T[i + 1][0] - T[i][0]) * f + nrm[i][0] * d, n = T[i][1] + (T[i + 1][1] - T[i][1]) * f + nrm[i][1] * d; g.beginPath(); g.ellipse(tx(e), ty(n), .13 * S, .07 * S, 0, 0, 7); g.fill() } }
  g.restore();
  line(T); g.lineJoin = "round"; g.lineCap = "butt"; g.lineWidth = R.teeW * S; g.strokeStyle = "#4f9a82"; g.stroke();
  if (fine) { const cum = [0]; for (let i = 1; i < T.length; i++)cum.push(cum[i - 1] + Math.hypot(T[i][0] - T[i - 1][0], T[i][1] - T[i - 1][1])); const L = cum[cum.length - 1];
    const at = s => { let i = 1; while (i < T.length - 1 && cum[i] < s) i++; const f = (s - cum[i - 1]) / (cum[i] - cum[i - 1]); return [T[i - 1][0] + (T[i][0] - T[i - 1][0]) * f, T[i - 1][1] + (T[i][1] - T[i - 1][1]) * f, nrm[Math.min(i, nrm.length - 1)]] };
    for (let k = 0; k < R.mats; k++) { const s = (k + .5) * L / R.mats, [e, n, nn] = at(s), q = .8, w = .75, c2 = [e + nn[0] * .4, n + nn[1] * .4], t = [-nn[1], nn[0]];
      g.beginPath(); for (const [a, b] of [[-q, -w], [q, -w], [q, w], [-q, w]]) { const pe = c2[0] + nn[0] * a + t[0] * b, pn = c2[1] + nn[1] * a + t[1] * b; g.lineTo(tx(pe), ty(pn)) } g.closePath(); g.fillStyle = "#2f6f56"; g.fill();
      g.beginPath(); g.arc(tx(c2[0] - nn[0] * 1.3), ty(c2[1] - nn[1] * 1.3), .25 * S, 0, 7); g.fillStyle = "#f2f2ea"; g.fill();
      const [e2, n2, n3] = at(k * L / R.mats); g.beginPath(); g.moveTo(tx(e2 - n3[0] * R.teeW / 2), ty(n2 - n3[1] * R.teeW / 2)); g.lineTo(tx(e2 + n3[0] * R.teeW / 2), ty(n2 + n3[1] * R.teeW / 2)); g.lineWidth = .12 * S; g.strokeStyle = "rgba(255,255,255,.75)"; g.stroke() } }
  if (R.circle) { const c = R.circle; g.beginPath(); g.arc(tx(c[0]), ty(c[1]), c[2] * S, 0, 7); g.fillStyle = "#efede4"; g.fill();
    if (fine) { g.beginPath(); g.arc(tx(c[0]), ty(c[1]), c[2] * .35 * S, 0, 7); g.strokeStyle = "#c9c5b6"; g.lineWidth = .2 * S; g.stroke() } }
}
// hlavná cesta (asfalt) a príjazd ku clubhousu
export function paintRoads(g, roads, tx, ty, S) {
  for (const r of roads || []) { g.lineCap = g.lineJoin = "round"; g.beginPath(); r.p.forEach(([e, n], i) => i ? g.lineTo(tx(e), ty(n)) : g.moveTo(tx(e), ty(n)));
    g.lineWidth = (r.w + 1.2) * S; g.strokeStyle = "rgba(70,80,50,.45)"; g.stroke(); g.lineWidth = r.w * S; g.strokeStyle = r.t === "main" ? "#7d7f80" : "#a9a291"; g.stroke() }
}

// pomocník: zlúči statické meshe skupiny podľa materiálu (clubhouse ~100 objektov -> pár volaní kreslenia)
function mergeStatic(THREE, G) {
  G.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(G.matrixWorld).invert(), by = new Map(), m = new THREE.Matrix4();
  G.traverse(o => { if (!o.isMesh || o.isInstancedMesh) return; let gg = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); m.multiplyMatrices(inv, o.matrixWorld); gg.applyMatrix4(m);
    if (!gg.attributes.normal) gg.computeVertexNormals();
    const put = (mat, x) => { const k = mat.uuid; if (!by.has(k)) by.set(k, { mat, g: [] }); by.get(k).g.push(x) };
    if (!Array.isArray(o.material)) return put(o.material, gg);
    for (const gr of gg.groups) { const x = new THREE.BufferGeometry(); for (const nm of ["position", "normal", "uv"]) { const a = gg.attributes[nm]; if (a) x.setAttribute(nm, new THREE.BufferAttribute(a.array.slice(gr.start * a.itemSize, (gr.start + gr.count) * a.itemSize), a.itemSize)) } put(o.material[gr.materialIndex], x) }
    gg.dispose() });
  const out = new THREE.Group();
  for (const { mat, g } of by.values()) { let n = 0; for (const x of g) n += x.attributes.position.count; const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0;
    for (const x of g) { const c = x.attributes.position.count; P.set(x.attributes.position.array.subarray(0, c * 3), o * 3); N.set(x.attributes.normal.array.subarray(0, c * 3), o * 3); if (x.attributes.uv) U.set(x.attributes.uv.array.subarray(0, c * 2), o * 2); o += c; x.dispose() }
    const bg = new THREE.BufferGeometry(); bg.setAttribute("position", new THREE.BufferAttribute(P, 3)); bg.setAttribute("normal", new THREE.BufferAttribute(N, 3)); bg.setAttribute("uv", new THREE.BufferAttribute(U, 2));
    out.add(new THREE.Mesh(bg, mat)) }
  return out;
}

// okolie: zem (terén 6 m + namaľovaný povrch celého areálu), stromy, vlajky ostatných jamiek, clubhouse, driving range.
// o: {A, hNum, loc (ENU ihriska -> lokálne x,y), hL (lokálne -> výška od odpaliska), H0, win:[X0,X1,Y0,Y1], farY, mobile, club (true = clubhouse už kreslí jamka), groundFog}
export async function buildAreal(THREE, o) {
  const { A, loc, hL, H0, mobile } = o, [X0, X1, Y0, Y1] = o.win, AP = A.AP, AK = A.AK, TER = A.TER, AKO = A.AKO, off = A.off;
  const L = (e, n) => loc([e - off[0], n - off[1]]);                    // ENU 18-ky -> lokálne súradnice jamky
  const inWin = (x, y, m = 0) => x > X0 + m && x < X1 - m && y > Y0 + m && y < Y1 - m;
  const hT = (e, n) => { let c = (e - TER.e0) / TER.step, r = (n - TER.n0) / TER.step; c = Math.min(TER.w - 1.001, Math.max(0, c)); r = Math.min(TER.h - 1.001, Math.max(0, r));
    const c0 = c | 0, r0 = r | 0, fc = c - c0, fr = r - r0, i = r0 * TER.w + c0, H = TER.H; return TER.base + (H[i] * (1 - fc) * (1 - fr) + H[i + 1] * fc * (1 - fr) + H[i + TER.w] * (1 - fc) * fr + H[i + TER.w + 1] * fc * fr) / 100 };
  // výška (absolútna): v okne jamky jej vlastný terén (aby objekty sedeli na detailnej zemi), inak terén areálu
  const hA = (e, n) => { const [x, y] = L(e, n); return inWin(x, y, 1) ? hL(x, y) + H0 : hT(e, n) };
  const akp = p => [p[0] + AKO[0], p[1] + AKO[1], ...p.slice(2)];
  const G = new THREE.Group(); G.matrixAutoUpdate = false;
  // matica ENU 18-ky (x=e, y=h, z=−n) -> scéna jamky (x, h−H0, −y)
  { const [ax, ay] = L(0, 0), [bx, by] = L(1, 0), [cx, cy] = L(0, 1), r0 = bx - ax, r1 = cx - ax, u0 = by - ay, u1 = cy - ay;
    G.matrix.set(r0, 0, -r1, ax, 0, 1, 0, -H0, -u0, 0, u1, -ay, 0, 0, 0, 1); G.matrixWorldNeedsUpdate = true }
  const V = (e, n, h) => new THREE.Vector3(e, h, -n);
  // oblasť okolia: okno jamky + R metrov (viac nevidno cez hmlu)
  const R = mobile ? 520 : 700, cs = [[X0, Y0], [X1, Y0], [X0, Y1], [X1, Y1]].map(([x, y]) => { // lokálne -> ENU 18-ky (inverzia afinného L)
    const [ax, ay] = L(0, 0), [bx, by] = L(1, 0), [cx, cy] = L(0, 1), a = bx - ax, b = cx - ax, c = by - ay, d = cy - ay, D = a * d - b * c, X = x - ax, Y = y - ay; return [(d * X - b * Y) / D, (-c * X + a * Y) / D] });
  let e0 = Math.min(...cs.map(p => p[0])) - R, e1 = Math.max(...cs.map(p => p[0])) + R, n0 = Math.min(...cs.map(p => p[1])) - R, n1 = Math.max(...cs.map(p => p[1])) + R;
  const ST = TER.step; e0 = Math.max(TER.e0, Math.floor((e0 - TER.e0) / ST) * ST + TER.e0); n0 = Math.max(TER.n0, Math.floor((n0 - TER.n0) / ST) * ST + TER.n0);
  e1 = Math.min(TER.e0 + (TER.w - 1) * ST, e1); n1 = Math.min(TER.n0 + (TER.h - 1) * ST, n1);
  const near = (e, n, m = 0) => e > e0 - m && e < e1 + m && n > n0 - m && n < n1 + m;
  // --- textúra povrchu
  const PPM = Math.min(1.3, (mobile ? 1536 : 2048) / Math.max(e1 - e0, n1 - n0)), TW = Math.round((e1 - e0) * PPM), TH = Math.round((n1 - n0) * PPM);
  const cv = document.createElement("canvas"); cv.width = TW; cv.height = TH; const g = cv.getContext("2d"), tx = e => (e - e0) * PPM, ty = n => (n1 - n) * PPM;
  const path = P => { g.beginPath(); P.forEach(([e, n], i) => i ? g.lineTo(tx(e), ty(n)) : g.moveTo(tx(e), ty(n))); g.closePath() };
  let sd = 5; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  // mimo areálu: polia (pásy), v areáli rough rovnakej farby ako jamka
  g.fillStyle = "#6a8a3c"; g.fillRect(0, 0, TW, TH);
  for (let k = 0; k < 60; k++) { g.save(); g.translate(rnd() * TW, rnd() * TH); g.rotate(.35 + (rnd() < .5 ? 0 : Math.PI / 2)); g.fillStyle = ["rgba(150,140,70,.18)", "rgba(60,90,30,.18)", "rgba(120,150,60,.15)"][k % 3]; g.fillRect(-150 * PPM, -60 * PPM, (120 + rnd() * 200) * PPM, (40 + rnd() * 90) * PPM); g.restore() }
  const ar = AP.area || {}; g.fillStyle = "#86a352"; for (const k of ["south", "north", "akad"]) if (ar[k]) { path(ar[k]); g.fill() }
  for (let k = 0; k < 2500; k++) { g.fillStyle = rnd() < .5 ? "rgba(90,130,50,.10)" : "rgba(150,180,90,.10)"; g.beginPath(); g.arc(rnd() * TW, rnd() * TH, (4 + rnd() * 10) * PPM, 0, 7); g.fill() }
  const fl = (P, c) => { path(P); g.fillStyle = c; g.fill() };
  const READY = AP.ready || [];
  if (AK) { for (const P of [...(AK.woods || []), ...(AK.groves || []).map(G => G.p)]) fl(P.map(akp), "#55783a"); for (const P of AK.fairways || []) fl(P.map(akp), "#74b04a") }
  for (const h of READY) for (const P of (AP.mow && AP.mow[h]) || []) fl(P, "#74b04a");
  for (const P of AP.water || []) { path(P); g.lineWidth = 2.5 * PPM; g.strokeStyle = "#6f9a4a"; g.stroke(); g.fillStyle = "#3d7397"; g.fill() }
  for (const T of AP.teeboxes || []) fl(T.p, "#86c45a");
  for (const h of READY) for (const p of AP.pads[h] || []) { g.beginPath(); g.arc(tx(p[0]), ty(p[1]), 4.5 * PPM, 0, 7); g.fillStyle = "#86c45a"; g.fill() }
  if (AK) for (const h in AK.pads) for (const p of AK.pads[h].map(akp)) { g.beginPath(); g.arc(tx(p[0]), ty(p[1]), 4 * PPM, 0, 7); g.fillStyle = "#86c45a"; g.fill() }
  const grn = P => { path(P); g.lineJoin = "round"; g.lineWidth = 6 * PPM; g.strokeStyle = "#7cba4b"; g.stroke(); g.fillStyle = "#98c552"; g.fill() };
  for (const h of READY) if (AP.greens[h - 1]) grn(AP.greens[h - 1]);
  if (AK) for (const P of AK.greens) grn(P.map(akp));
  for (const Q of AP.paved || []) fl(Q.p, Q.t === "parking" ? "#8d8c86" : "#d6ccb5");
  for (const P of (AP.practice && AP.practice.greens) || []) grn(P);
  if (AP.range) paintRange(g, AP.range, tx, ty, PPM, false);
  for (const P of [...AP.bunkers, ...(AK ? AK.bunkers.map(B => B.map(akp)) : [])]) fl(P, "#eadcae");
  paintRoads(g, ar.roads, tx, ty, PPM);
  for (const Pp of AP.paths || []) { g.lineCap = g.lineJoin = "round"; g.beginPath(); Pp.p.forEach(([e, n], i) => i ? g.lineTo(tx(e), ty(n)) : g.moveTo(tx(e), ty(n))); g.lineWidth = Math.max(1, Pp.w * PPM); g.strokeStyle = "#c8c4b6"; g.stroke() }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  // --- zem: mriežka 6 m, trojuholníky celé v okne jamky vynecháme; okraj klesne k rovine okolia
  { const NX = Math.round((e1 - e0) / ST) + 1, NY = Math.round((n1 - n0) / ST) + 1, P = new Float32Array(NX * NY * 3), UV = new Float32Array(NX * NY * 2), IN = new Uint8Array(NX * NY), farA = o.farY + H0;
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const k = j * NX + i, e = e0 + i * ST, n = n0 + j * ST, ed = Math.min(i, j, NX - 1 - i, NY - 1 - j), ramp = Math.min(1, ed / 5);
      P[k * 3] = e; P[k * 3 + 1] = farA + (hT(e, n) - farA) * ramp * ramp * (3 - 2 * ramp); P[k * 3 + 2] = -n; UV[k * 2] = (e - e0) / (e1 - e0); UV[k * 2 + 1] = (n - n0) / (n1 - n0); const [x, y] = L(e, n); IN[k] = inWin(x, y, -.5) ? 1 : 0 }
    const idx = []; for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) { const a = j * NX + i, b = a + 1, c = a + NX, d = c + 1; if (IN[a] && IN[b] && IN[c] && IN[d]) continue; idx.push(a, c, b, b, c, d) }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(P, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(UV, 2));
    geo.setIndex(NX * NY > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1)); geo.computeVertexNormals();
    // okraj (posledných 5 riadkov) plynulo klesá k rovine okolia; normály tam smerom hore, inak by svah vyšiel ako tmavý pás na obzore (Martin 24.11.)
    { const Nn = geo.attributes.normal; for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) if (Math.min(i, j, NX - 1 - i, NY - 1 - j) < 6) Nn.setXYZ(j * NX + i, 0, 1, 0) }
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, fog: o.groundFog !== false });
    mat.onBeforeCompile = sh => { sh.uniforms.uWin = { value: new THREE.Vector4(X0 + .3, Y0 + .3, X1 - .3, Y1 - .3) };
      sh.vertexShader = "varying vec3 vAw;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvAw=(modelMatrix*vec4(transformed,1.)).xyz;");
      sh.fragmentShader = "uniform vec4 uWin;varying vec3 vAw;\n" + sh.fragmentShader.replace("void main() {", "void main() {\nif(vAw.x>uWin.x&&vAw.x<uWin.z&&-vAw.z>uWin.y&&-vAw.z<uWin.w)discard;") };
    const m = new THREE.Mesh(geo, mat); m.receiveShadow = !mobile; m.frustumCulled = false; G.add(m) }
  // --- stromy: jednoduché koruny (2 inštancované objekty pre všetky); vlastné stromy v okne už kreslí jamka
  const own = A.CRS, TR = [];
  // v239 (Martin: stromy pri clubhouse vyzerali inak než tie, ktoré hráme): cudzie stromy v okne jamky kreslí jamka svojím detailným generátorom (o.detail), tu ostanú len stromy mimo dosahu hry
  let nd = 0;
  const addT = (e, n, r, h, mine, kc) => { if (!near(e, n)) return; const [x, y] = L(e, n); if (inWin(x, y, 2)) { if (mine) return; if (o.detail && o.detail(x, y, r, h, kc, nd++, 0)) return }
    else if (o.detail && o.band && inWin(x, y, -o.band) && o.detail(x, y, r, h, kc, nd++, hA(e, n) - H0)) return;   // pás za oknom: rovnaký vzhľad, len bez kolízií (loptička tam nedoletí)
    TR.push([e, n, r, h, kc]) };
  for (const t of AP.trees || []) addT(t[0], t[1], t[2] || 3, t[3] || 10, own === "apex", t[5]);
  if (AK) { for (const t of AK.trees || []) { const [e, n] = akp(t); addT(e, n, t[2] || 3.5, t[3] || 10, own !== "apex") }
    for (const t of AK.row || []) { const [e, n] = akp(t); addT(e, n, 2.6, 8, own !== "apex") }
    let s2 = 7; const r2 = () => ((s2 = (s2 * 16807) % 2147483647) / 2147483647), pip = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++)if ((P[i][1] > y) !== (P[j][1] > y) && x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c };
    for (const P of [...(AK.woods || []), ...(AK.groves || []).map(G => G.p)]) { const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
      for (let x = Math.min(...xs); x < Math.max(...xs); x += 8) for (let y = Math.min(...ys); y < Math.max(...ys); y += 8) { const px = x + (r2() - .5) * 6, py = y + (r2() - .5) * 6; if (pip(P, px, py)) { const [e, n] = akp([px, py]); addT(e, n, 3 + r2() * 1.5, 9 + r2() * 4, own !== "apex") } } } }
  if (TR.length) { const { lowTrees } = await import("./treeshapes.js");   // tvar a farba podľa druhu (apex.json trees[k][5])
    for (const I of lowTrees(THREE, TR, V, hA)) G.add(I) }
  // --- vlajky na ostatných greenoch (18-ka červené, akadémia tmavomodré), aktuálna jamka má svoju
  { const F = []; for (const h of READY) if (AP.gc[h - 1] && !(own === "apex" && h === o.hNum)) F.push([...AP.gc[h - 1], 0xd8262a]);
    if (AK) AK.gc.forEach((p, i) => { if (!(own !== "apex" && i + 1 === o.hNum)) F.push([...akp(p), 0x16285a]) });
    if (AP.range) for (const t of AP.range.targets || []) F.push([t[0], t[1], 0xe0412b]);
    const Fs = F.filter(p => near(p[0], p[1])), N = Fs.length;
    if (N) { const pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(.06, .06, 2.1, 4), new THREE.MeshStandardMaterial({ color: 0xf4f4f0 }), N),
        cl = new THREE.InstancedMesh(new THREE.PlaneGeometry(.75, .5), new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }), N), m = new THREE.Matrix4(), c = new THREE.Color();
      Fs.forEach(([e, n, col], k) => { const z = hA(e, n); m.makeTranslation(e, z + 1.05, -n); pole.setMatrixAt(k, m); m.makeTranslation(e + .38, z + 1.8, -n); cl.setMatrixAt(k, m); cl.setColorAt(k, c.setHex(col)) });
      G.add(pole, cl) } }
  // --- driving range: búdka pri línii (strechu Martin zrušil v217 – podľa 3D záberov 2023 už nie je); strecha len ak je v dátach
  const Rg = AP.range;
  if (Rg && Rg.tee && near(Rg.tee[0][0], Rg.tee[0][1])) { const a = Rg.tee[0], b = Rg.tee[Rg.tee.length - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    if (Rg.roof) { const [ra, rb] = [Rg.roof.a, Rg.roof.b], Ln = Math.hypot(rb[0] - ra[0], rb[1] - ra[1]), mid = [(ra[0] + rb[0]) / 2, (ra[1] + rb[1]) / 2], an2 = Math.atan2(rb[1] - ra[1], rb[0] - ra[0]);
      const rg = new THREE.Group(); rg.position.copy(V(mid[0], mid[1], hA(...mid))); rg.rotation.y = an2;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(Ln, .18, Rg.roof.w), new THREE.MeshStandardMaterial({ color: 0xa5432f, roughness: .8 })); roof.position.y = Rg.roof.h; roof.rotation.x = -.1; rg.add(roof);
      const pm = new THREE.MeshStandardMaterial({ color: 0x5a4a3a }), pg = new THREE.CylinderGeometry(.09, .09, Rg.roof.h, 5);
      for (let k = 0; k <= 6; k++) for (const z of [-1, 1]) { const po = new THREE.Mesh(pg, pm); po.position.set(-Ln / 2 + k * Ln / 6, Rg.roof.h / 2, z * (Rg.roof.w / 2 - .2)); rg.add(po) }
      G.add(rg) }
    if (Rg.hut) { const hut = new THREE.Mesh(new THREE.BoxGeometry(3, 2.4, 2.2), new THREE.MeshStandardMaterial({ color: 0x8a8478 })); hut.position.copy(V(Rg.hut[0], Rg.hut[1], hA(...Rg.hut) + 1.2)); hut.rotation.y = ang; G.add(hut) } }
  // --- clubhouse (ak ho nekreslí jamka): zjednodušený na pár zlúčených objektov
  let CLB = null;
  if (!o.club && AP.clubhouse && near(AP.clubhouse.o[0], AP.clubhouse.o[1])) { const { buildClubhouse } = await import("./clubhouse.js");
    CLB = buildClubhouse(THREE, AP.clubhouse, V, hA); if (CLB) G.add(mergeStatic(THREE, CLB.group)) }
  // kolízie s budovami: pôvodné (nezlúčené) meshe clubhouse v ENU 18-ky + matica do scény jamky (G.matrix)
  return { group: G, clubhouse: CLB, coll: CLB ? { root: CLB.group, matrix: G.matrix } : null };
}

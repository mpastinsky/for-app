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
// hlavná cesta (asfalt) a príjazd ku clubhousu.
// v248 (Martin: cesta „kostrbatá, zubatá“): hlavnú cestu už nemaľujeme do textúry terénu (hrubé pixely, zuby na okrajoch),
// tu len mäkká krajnica pod ňou – samotnú vozovku kreslí 3D pás buildRoad (ostré okraje a čiary pri každom priblížení)
export function paintRoads(g, roads, tx, ty, S) {
  for (const r of roads || []) { g.lineCap = g.lineJoin = "round"; g.beginPath(); r.p.forEach(([e, n], i) => i ? g.lineTo(tx(e), ty(n)) : g.moveTo(tx(e), ty(n)));
    if (r.t === "main") { g.lineWidth = (r.w + 3) * S; g.strokeStyle = "rgba(96,104,70,.55)"; g.stroke(); g.lineWidth = (r.w + 1) * S; g.strokeStyle = "#8a887c"; g.stroke(); continue }
    g.lineWidth = (r.w + .8) * S; g.strokeStyle = "rgba(96,100,70,.35)"; g.stroke() }   // v250: príjazd a rampy kreslí 3D pás buildPaths
}
// pod 3D pásom chodníka len mäkká stopa v tráve (aby okraj pásu splynul s terénom)
export function paintPathVerge(g, paths, tx, ty, S) {
  for (const Pp of paths || []) { g.lineCap = g.lineJoin = "round"; g.beginPath(); Pp.p.forEach(([e, n], i) => i ? g.lineTo(tx(e), ty(n)) : g.moveTo(tx(e), ty(n))); g.lineWidth = ((Pp.w || 2.4) + .6) * S; g.strokeStyle = "rgba(110,110,84,.35)"; g.stroke() }
}
// textúra vozovky (zdieľaná): naprieč celý pás (krajnica + asfalt + krajnica), pozdĺž 18 m = dve prerušované čiary 3 m / 6 m medzera
const ROAD_SH = 1.1, ROAD_TL = 18; let ROADTEX = null;
function roadTex(THREE, w) {
  if (ROADTEX) return ROADTEX;
  const Wt = w + 2 * ROAD_SH, PX = 256 / Wt, cv = document.createElement("canvas"); cv.width = 256; cv.height = Math.round(ROAD_TL * PX); const g = cv.getContext("2d"), H = cv.height;
  const X = o => (o + Wt / 2) * PX;                       // o = vzdialenosť od osi (m)
  let sd = 9; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  // krajnica: štrk, na vonkajšom okraji plynulo do priehľadna (žiadna ostrá hrana na tráve)
  const gr = g.createLinearGradient(0, 0, 256, 0), f = ROAD_SH / Wt;
  gr.addColorStop(0, "rgba(128,126,110,0)"); gr.addColorStop(f * .55, "rgba(140,137,120,.9)"); gr.addColorStop(f, "#9a978a"); gr.addColorStop(1 - f, "#9a978a"); gr.addColorStop(1 - f * .55, "rgba(140,137,120,.9)"); gr.addColorStop(1, "rgba(128,126,110,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, H);
  g.fillStyle = "#6f7173"; g.fillRect(X(-w / 2), 0, w * PX, H);                                   // asfalt
  for (let k = 0; k < 2600; k++) { const v = r(); g.fillStyle = v < .5 ? "rgba(40,42,44,.16)" : "rgba(170,170,165,.13)"; g.fillRect(X(-w / 2) + r() * w * PX, r() * H, 1 + r() * 1.5, 1 + r() * 1.5) }
  g.fillStyle = "rgba(60,62,64,.25)"; for (const o of [-w / 4, w / 4]) g.fillRect(X(o) - .5 * PX, 0, 1 * PX, H);                 // vyjazdené stopy
  g.fillStyle = "rgba(246,246,240,.95)"; const lw = Math.max(2, .15 * PX);
  for (const s of [-1, 1]) g.fillRect(X(s * (w / 2 - .35)) - lw / 2, 0, lw, H);                 // okrajové plné čiary
  for (let d = 0; d < ROAD_TL; d += 9) g.fillRect(X(0) - lw / 2, H - (d + 3) * PX, lw, 3 * PX);    // stredová prerušovaná 3 m / 6 m
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; ROADTEX = t; return t;
}
// 3D pás hlavnej cesty: rovný priečny profil, pozdĺžny profil vyhladený (bez vĺn po mriežke terénu), cez tunel rovno (vozovka na strope tunela).
// r: {w, p:[[e,n],…]}; pos(e,n,h) -> Vector3; ground(e,n) -> výška; o: {off: nad terénom (m), clip(e,n) -> bool, tunnels:[O], step}
export function buildRoad(THREE, r, pos, ground, o = {}) {
  const w = r.w || 9, off = o.off ?? .06, step = o.step || 2, Wt = w + 2 * ROAD_SH, P = r.p, G = new THREE.Group();
  // vzorky pozdĺž osi (oblúkovou dĺžkou)
  const S = []; let acc = 0;
  for (let i = 1; i < P.length; i++) { const [a, b] = [P[i - 1], P[i]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
    for (let d = Math.ceil(acc / step - 1e-9) * step - acc; d <= L + 1e-6; d += step) S.push({ e: a[0] + ux * d, n: a[1] + uy * d, s: acc + d, ux, uy }); acc += L }
  // tunel: os pod cestou nevzorkujeme (DMR tam má otvorený priekop), výška sa preklene
  const tun = (o.tunnels || []).map(T => { const k = S.reduce((m, q, i) => { const d = Math.hypot(q.e - T.p[0], q.n - T.p[1]); return d < m[0] ? [d, i] : m }, [1e9, -1]); return { s: S[k[1]].s, ts: (T.ts || 7.5) + 3 } });
  const cl = S.map(q => !o.clip || o.clip(q.e, q.n));
  const hs = S.map((q, i) => cl[i] && !tun.some(T => Math.abs(q.s - T.s) < T.ts) ? ground(q.e, q.n) : NaN);
  const ok = hs.map(h => !isNaN(h)); if (!ok.some(x => x)) return G;
  for (let i = 0; i < hs.length; i++) if (!ok[i]) { let a = i - 1, b = i + 1; while (a >= 0 && !ok[a]) a--; while (b < hs.length && !ok[b]) b++;
    hs[i] = a < 0 ? hs[b] : b >= hs.length ? hs[a] : hs[a] + (hs[b] - hs[a]) * (i - a) / (b - a) }
  const K = Math.max(1, Math.round(6 / step)), hm = hs.map((_, i) => { let t = 0, n = 0; for (let j = i - K; j <= i + K; j++) if (j >= 0 && j < hs.length) { t += hs[j]; n++ } return t / n });
  // pás: 5 vrcholov naprieč (okraj, hrana asfaltu, os…), súvislé úseky len tam, kde je clip
  const xs = [-Wt / 2, -w / 2, 0, w / 2, Wt / 2], mat = new THREE.MeshLambertMaterial({ map: roadTex(THREE, w), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, fog: o.fog !== false });
  let run = [];
  const flush = () => { if (run.length < 2) { run = []; return } const V = [], U = [], I = [];
    run.forEach((i, k) => { const q = S[i], nx = -q.uy, ny = q.ux; for (const x of xs) { const v = pos(q.e + nx * x, q.n + ny * x, hm[i] + off); V.push(v.x, v.y, v.z); U.push((x + Wt / 2) / Wt, q.s / ROAD_TL) }
      if (k) { const b = (k - 1) * 5, c = k * 5; for (let j = 0; j < 4; j++) I.push(b + j, b + j + 1, c + j, b + j + 1, c + j + 1, c + j) } });
    const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.Float32BufferAttribute(V, 3)); gg.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2)); gg.setIndex(I); gg.computeVertexNormals();
    // prednou stranou nahor (poradie vrcholov závisí od pos(): prehľad vs. jamka)
    if (gg.attributes.normal.getY(0) < 0) { for (let i = 0; i < I.length; i += 3) { const t = I[i + 1]; I[i + 1] = I[i + 2]; I[i + 2] = t } gg.setIndex(I); gg.computeVertexNormals() }
    const m = new THREE.Mesh(gg, mat); m.receiveShadow = true; m.renderOrder = 1; G.add(m); run = [] };
  for (let i = 0; i < S.length; i++) { if (cl[i]) run.push(i); else flush() } flush();
  return G;
}
// --- chodníky pre vozíky, príjazd a rampy ako 3D pás (v250, Martin: chodníky „rozmazané a neostré“ – v textúre terénu mali hrubé pixely).
// Zdieľaná textúra (betón): naprieč pevné metrové zóny – mäkký okraj v tráve (F), tmavší lem (E), betón; pozdĺž dilatačné škáry každé 3 m.
// Farba typu (chodník / príjazd / rampa) cez farbu vrcholov – všetky chodníky = jeden mesh, jeden draw call.
const PATH_F = .3, PATH_E = .12, PATH_TL = 6, PU = [0, .125, .1875, .8125, .875, 1]; let PATHTEX = null;
function pathTex(THREE) {
  if (PATHTEX) return PATHTEX;
  const cv = document.createElement("canvas"); cv.width = 256; cv.height = 512; const g = cv.getContext("2d"), H = 512, PX = H / PATH_TL;
  let sd = 17; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const gr = g.createLinearGradient(0, 0, 32, 0); gr.addColorStop(0, "rgba(96,100,70,0)"); gr.addColorStop(1, "rgba(118,116,96,.55)");
  g.fillStyle = gr; g.fillRect(0, 0, 32, H); g.save(); g.translate(256, 0); g.scale(-1, 1); g.fillRect(0, 0, 32, H); g.restore();
  g.fillStyle = "#ebe8df"; g.fillRect(32, 0, 192, H);                                                    // betón (tón dodá farba vrcholov)
  for (let k = 0; k < 9000; k++) { const v = r(); g.fillStyle = v < .45 ? "rgba(90,88,80,.10)" : v < .8 ? "rgba(255,255,250,.16)" : "rgba(60,58,52,.15)"; g.fillRect(48 + r() * 160, r() * H, 1 + r() * 1.6, 1 + r() * 1.6) }
  for (let k = 0; k < 30; k++) { g.fillStyle = "rgba(120,116,100,.06)"; g.beginPath(); g.ellipse(48 + r() * 160, r() * H, 12 + r() * 24, 12 + r() * 30, 0, 0, 7); g.fill() }   // fľaky
  g.fillStyle = "rgba(70,70,64,.05)"; for (const x of [88, 168]) g.fillRect(x - 10, 0, 20, H);           // jemne vyjazdené stopy vozíkov
  g.fillStyle = "#c2beb3"; g.fillRect(32, 0, 16, H); g.fillRect(208, 0, 16, H);                            // lem (obrubník)
  g.fillStyle = "rgba(90,88,80,.35)"; g.fillRect(46, 0, 2, H); g.fillRect(208, 0, 2, H);
  g.fillStyle = "rgba(70,68,60,.4)"; for (let d = 0; d < PATH_TL; d += 3) g.fillRect(46, H - d * PX - 1, 164, 2);   // škáry
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; PATHTEX = t; return t;
}
export const PATHC = { path: 0xd9d5ca, access: 0xbdb6a4, ramp: 0xd2c8bc };
// oblúky v zalomeniach (polomer do 4 m) a rovnomerné vzorky po step m s plynulou normálou
function pathSamples(P, step) {
  const Q = [P[0]];
  for (let i = 1; i < P.length - 1; i++) { const [A, B, C] = [P[i - 1], P[i], P[i + 1]], la = Math.hypot(A[0] - B[0], A[1] - B[1]), lc = Math.hypot(C[0] - B[0], C[1] - B[1]);
    const d = Math.min(4, .45 * la, .45 * lc); if (!(d > .05)) { Q.push(B); continue }
    const p1 = [B[0] + (A[0] - B[0]) / la * d, B[1] + (A[1] - B[1]) / la * d], p2 = [B[0] + (C[0] - B[0]) / lc * d, B[1] + (C[1] - B[1]) / lc * d];
    for (let k = 0; k <= 6; k++) { const t = k / 6, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t; Q.push([a * p1[0] + b * B[0] + c * p2[0], a * p1[1] + b * B[1] + c * p2[1]]) } }
  Q.push(P[P.length - 1]);
  const S = []; let acc = 0;
  for (let i = 1; i < Q.length; i++) { const a = Q[i - 1], b = Q[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 1e-6) continue;
    for (let d = Math.ceil(acc / step - 1e-9) * step - acc; d < L - 1e-6; d += step) S.push({ e: a[0] + (b[0] - a[0]) * d / L, n: a[1] + (b[1] - a[1]) * d / L, s: acc + d }); acc += L }
  const z = Q[Q.length - 1]; S.push({ e: z[0], n: z[1], s: acc });
  S.forEach((q, i) => { const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)], L = Math.hypot(b.e - a.e, b.n - a.n) || 1; q.ux = (b.e - a.e) / L; q.uy = (b.n - a.n) / L });
  return S;
}
// paths: [{w, p:[[e,n],…], t?:"path"|"access"|"ramp"}]; pos(e,n,h) -> Vector3; ground(e,n) -> výška;
// o: {off, step, clip(e,n) -> bool, avoid:[polygóny bunkrov/greenov] (pás sa tam preruší), fog}
export function buildPaths(THREE, paths, pos, ground, o = {}) {
  const off = o.off ?? .06, step = o.step || 1, G = new THREE.Group(), V = [], U = [], C = [], I = [], col = new THREE.Color();
  const AV = (o.avoid || []).filter(P => P && P.length > 2).map(P => { const xs = P.map(p => p[0]), ys = P.map(p => p[1]); return { P, b: [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)] } });
  const sdP = (P, x, y) => { let m = 1e9, c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [a, b] = [P[j], P[i]];
      if ((b[1] > y) !== (a[1] > y) && x < (a[0] - b[0]) * (y - b[1]) / (a[1] - b[1]) + b[0]) c = !c;
      const vx = b[0] - a[0], vy = b[1] - a[1], l = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / l)); m = Math.min(m, Math.hypot(a[0] + vx * t - x, a[1] + vy * t - y)) } return c ? -m : m };
  const blocked = (e, n, r) => AV.some(A => e > A.b[0] - r && e < A.b[1] + r && n > A.b[2] - r && n < A.b[3] + r && sdP(A.P, e, n) < r);
  const vert = (e, n, u, v) => { const p = pos(e, n, ground(e, n) + off); V.push(p.x, p.y, p.z); U.push(u, v); C.push(col.r, col.g, col.b); return V.length / 3 - 1 };
  for (const Pp of paths || []) { if (!Pp.p || Pp.p.length < 2) continue;
    const w = Pp.w || 2.4, hw = w / 2, xs = [-hw - PATH_F, -hw, -hw + PATH_E, hw - PATH_E, hw, hw + PATH_F], S = pathSamples(Pp.p, step);
    col.setHex(PATHC[Pp.t] || PATHC.path);
    const ok = S.map(q => (!o.clip || o.clip(q.e, q.n)) && !blocked(q.e, q.n, hw + .25));
    let run = [];
    const cap = (q, dir, v0) => {   // polkruhové ukončenie (oblé ako reálny chodník)
      const c = vert(q.e, q.n, .5, v0), nx = -q.uy, ny = q.ux, R = [hw - PATH_E, hw, hw + PATH_F], UU = [PU[3], PU[4], PU[5]], NA = 8, ring = [];
      for (let k = 0; k <= NA; k++) { const a = Math.PI * k / NA, ca = Math.cos(a), sa = Math.sin(a) * dir;   // od pravej strany cez čelo k ľavej
        ring.push(R.map((r, j) => vert(q.e + (nx * ca + q.ux * sa) * r, q.n + (ny * ca + q.uy * sa) * r, UU[j], v0 + sa * r / PATH_TL))) }
      for (let k = 0; k < NA; k++) { const A = ring[k], B = ring[k + 1]; I.push(c, A[0], B[0]); for (let j = 0; j < 2; j++) I.push(A[j], A[j + 1], B[j + 1], A[j], B[j + 1], B[j]) } };
    const flush = () => { if (run.length < 3) { run = []; return } const base = [];
      for (const i of run) { const q = S[i], nx = -q.uy, ny = q.ux; base.push(xs.map((x, j) => vert(q.e + nx * x, q.n + ny * x, PU[j], q.s / PATH_TL))) }
      for (let k = 1; k < base.length; k++) for (let j = 0; j < 5; j++) { const a = base[k - 1][j], b = base[k - 1][j + 1], c = base[k][j], d = base[k][j + 1]; I.push(a, b, c, b, d, c) }
      const q0 = S[run[0]], q1 = S[run[run.length - 1]];
      if (run[0] === 0) cap(q0, -1, q0.s / PATH_TL); if (run[run.length - 1] === S.length - 1) cap(q1, 1, q1.s / PATH_TL); run = [] };
    for (let i = 0; i < S.length; i++) { if (ok[i]) run.push(i); else flush() } flush() }
  if (!I.length) return G;
  const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.Float32BufferAttribute(V, 3)); gg.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2)); gg.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
  gg.setIndex(V.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(I, 1) : new THREE.Uint16BufferAttribute(I, 1));
  const mat = new THREE.MeshLambertMaterial({ map: pathTex(THREE), vertexColors: true, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, fog: o.fog !== false });
  // každý trojuholník prednou stranou nahor (poradie vrcholov závisí od pos(): prehľad vs. jamka, a od strany ukončenia)
  for (let i = 0; i < I.length; i += 3) { const a = I[i] * 3, b = I[i + 1] * 3, c = I[i + 2] * 3, ux = V[b] - V[a], uz = V[b + 2] - V[a + 2], vx = V[c] - V[a], vz = V[c + 2] - V[a + 2];
    if (uz * vx - ux * vz < 0) { const t = I[i + 1]; I[i + 1] = I[i + 2]; I[i + 2] = t } }
  gg.setIndex(V.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(I, 1) : new THREE.Uint16BufferAttribute(I, 1)); gg.computeVertexNormals();
  const m = new THREE.Mesh(gg, mat); m.receiveShadow = true; m.renderOrder = 1; G.add(m); return G;
}
// polygóny, cez ktoré chodník nevedie (bunkre, greeny) – v ENU 18-ky
export function pathAvoid(AP, AK, AKO) {
  const ak = P => P.map(p => [p[0] + AKO[0], p[1] + AKO[1]]);
  return [...(AP.bunkers || []), ...(AP.clubBunkers || []), ...(AP.rangeBunkers || []), ...(AP.greens || []).filter(Boolean), ...((AP.practice && AP.practice.greens) || []),
    ...(AK ? [...(AK.bunkers || []).map(B => ak(B.p || B)), ...(AK.greens || []).map(ak)] : [])];
}
// typy pre buildPaths: chodníky + príjazd/rampy z area.roads (hlavnú cestu kreslí buildRoad)
export const pathList = AP => [...(AP.paths || []), ...(((AP.area && AP.area.roads) || []).filter(r => r.t !== "main"))];
// farby: asfalt, príjazd, betónové rampy k tunelu pod cestou (jamka 11, Martin 25.11.)
export const ROADC = { main: "#7d7f80", access: "#a9a291", ramp: "#c4b8ae" };
// tunel pod hlavnou cestou k jamke 11 (DATA.objects t:"tunnel", v246 – Martin: priechodný, nech je vidno skrz).
// Terén má pod cestou otvorený priekop; objekt = dno, bočné steny a strop s vozovkou (pruhy) navrchu.
// O: {p:[e,n] stred (os cesty), a: os tunela (° od východu, kolmo na cestu), len, w, h, ts: polovica dĺžky bloku pozdĺž cesty,
//     rw: šírka vozovky, r:[e,n] smer cesty, d0: vzdialenosť stredu od začiatku cesty (fáza prerušovanej čiary)}
// pos(e,n,h) -> THREE.Vector3, ground(e,n) -> výška
export function buildTunnel(THREE, O, pos, ground) {
  const ar = O.a * Math.PI / 180, d = [Math.cos(ar), Math.sin(ar)], r = O.r || [d[1], -d[0]], [e, n] = O.p;
  const Lt = O.len || 11, w = O.w || 4.2, ts = O.ts || 6.5, rw = O.rw || 9, P = (x, z) => [e + d[0] * x + r[0] * z, n + d[1] * x + r[1] * z];
  // úroveň cesty: terén na osi cesty kúsok za blokom (obe strany); dno: najvyšší terén v otvore, aby ho nič neprekrývalo
  const road = (ground(...P(0, ts + 2.5)) + ground(...P(0, -ts - 2.5))) / 2;
  let fl = -1e9; for (let x = -Lt / 2 - 1; x <= Lt / 2 + 1; x += 1) for (let z = -w / 2; z <= w / 2; z += w / 4) fl = Math.max(fl, ground(...P(x, z)));
  const h = Math.min(O.h || 2.7, Math.max(1.6, road - fl - .9)); fl = Math.min(fl, road - h - .9); const R = road - fl;
  const a = pos(e, n, 0), b = pos(e + d[0], n + d[1], 0), g = new THREE.Group(); g.position.copy(pos(e, n, fl)); g.userData = { floor: fl, road, h }; const th = Math.atan2(-(b.z - a.z), b.x - a.x); g.rotation.y = th;
  // lokálne: x = os tunela (kolmo na cestu), z = pozdĺž cesty; zs = znamienko smeru cesty v lokálnom z
  const c0 = pos(...P(0, 0), 0), c1 = pos(...P(0, 1), 0), zs = Math.sign((c1.x - c0.x) * Math.sin(th) + (c1.z - c0.z) * Math.cos(th)) || 1;
  const mC = new THREE.MeshLambertMaterial({ color: 0xb9b2a8 }), mI = new THREE.MeshLambertMaterial({ color: 0x8f8a82 }), mF = new THREE.MeshLambertMaterial({ color: 0xa69d93 }),
    mA = new THREE.MeshLambertMaterial({ color: 0x7d7f80 }), mW = new THREE.MeshLambertMaterial({ color: 0xf2f2ee }), mS = new THREE.MeshLambertMaterial({ color: 0x8f9a6a });
  const box = (sx, sy, sz, x, y, z, m = mC) => { const k = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); k.position.set(x, y, z); k.castShadow = k.receiveShadow = true; g.add(k); return k };
  const sw = ts - w / 2;
  box(Lt, 2, w + .2, 0, -.97, 0, mF);                                                                   // dno (betón, siaha pod terén)
  for (const s of [-1, 1]) {
    box(Lt, R + 1.5, sw, 0, (R - 1.5) / 2, s * (w / 2 + sw / 2), [mC, mC, mC, mC, s > 0 ? mC : mI, s > 0 ? mI : mC]); // bočné steny (vnútri tmavší betón)
    box(.35, .25, 2 * ts, s * (Lt / 2 - .1), R + .12, 0);                                               // rímsa na čele
    box(.06, .06, 2 * ts, s * (Lt / 2 - .45), R + .55, 0, mW);                                          // zábradlie (madlo)
    for (let z = -ts + .3; z <= ts; z += 2) box(.06, .5, .06, s * (Lt / 2 - .45), R + .28, z, mW);
  }
  box(Lt, R - h, w + .02, 0, h + (R - h) / 2, 0, mI);                                                   // strop
  // v248: vozovku navrchu kreslí pás buildRoad (rovnaká textúra ako celá cesta) – tu len betónová doska mosta
  box(Lt - .2, .06, 2 * ts, 0, R - .01, 0, mC);
  // krídla portálov (v248, Martin: podjazd „hrubý“): oporné múry pozdĺž priekopu, vrch kopíruje svah, šikmo klesá od portálu
  { const T = .4, zw = 2.9 - T;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const pts = []; let x = Lt / 2, top = R + .25;
      for (let k = 0; k <= 14; k++) { x = Lt / 2 + k; const gt = ground(...P(sx * x, sz * (zw + T + .9))) - fl + .25; top = Math.min(R + .25, Math.max(.35, gt)); pts.push([x - Lt / 2, top]); if (top <= .36 && k > 1) break }
      const sh = new THREE.Shape(); sh.moveTo(0, -1); for (const [x2, y2] of pts) sh.lineTo(x2, y2); sh.lineTo(pts[pts.length - 1][0], -1); sh.closePath();
      const gg = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: false }); const k2 = new THREE.Mesh(gg, mC); k2.castShadow = k2.receiveShadow = true;
      // tvar je v rovine x-y (x od portálu von), hrúbka pozdĺž z; zrkadlenie pre -x cez rotáciu
      k2.rotation.y = sx > 0 ? 0 : Math.PI; k2.position.set(sx * Lt / 2, 0, sx > 0 ? (sz > 0 ? zw : -zw - T) : (sz > 0 ? zw + T : -zw)); g.add(k2);}
  }
  return g;
}

// tabule vzdialeností na driving range (v246, Martin: namiesto vlajok čísla 50/100/150/200, žlto-čierne).
// Stoja na osi range: stred odpaliskovej línie + kolmica k lúke; čelom k línii. pos(e,n,h) -> Vector3, ground(e,n) -> výška
export const RANGE_DIST = [50, 100, 150, 200];
export function rangeSignSpots(R) {
  const a = R.tee[0], b = R.tee[R.tee.length - 1], lc = R.tee[R.tee.length >> 1]; let nn = [-(b[1] - a[1]), b[0] - a[0]]; const L = Math.hypot(...nn); nn = [nn[0] / L, nn[1] / L];
  const mc = R.fan.reduce((s, p) => [s[0] + p[0] / R.fan.length, s[1] + p[1] / R.fan.length], [0, 0]); if ((mc[0] - lc[0]) * nn[0] + (mc[1] - lc[1]) * nn[1] < 0) nn = [-nn[0], -nn[1]];
  return RANGE_DIST.map(d => ({ d, e: lc[0] + nn[0] * d, n: lc[1] + nn[1] * d, nn }));
}
export function buildRangeSigns(THREE, R, pos, ground, filter) {
  const G = new THREE.Group(), post = new THREE.MeshLambertMaterial({ color: 0x1b1b1b }), pg = new THREE.CylinderGeometry(.07, .07, 1.3, 6), bw = 3, bh = 2;
  for (const S of rangeSignSpots(R)) { if (filter && !filter(S.e, S.n)) continue;
    const cv = document.createElement("canvas"); cv.width = 384; cv.height = 256; const x = cv.getContext("2d");
    x.fillStyle = "#111"; x.fillRect(0, 0, 384, 256); x.fillStyle = "#ffd200"; x.fillRect(14, 14, 356, 228);
    x.fillStyle = "#111"; x.font = "900 170px Arial, Helvetica, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(String(S.d), 192, 136);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const face = new THREE.MeshLambertMaterial({ map: tex }), edge = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const g = new THREE.Group(), z = ground(S.e, S.n); g.position.copy(pos(S.e, S.n, z));
    const a = pos(S.e, S.n, 0), b = pos(S.e - S.nn[0], S.n - S.nn[1], 0); g.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);   // čelo (+z) k odpaliskovej línii
    const bd = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, .1), [edge, edge, edge, edge, face, face]); bd.position.y = 1.2 + bh / 2; bd.castShadow = true; g.add(bd);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(pg, post); p.position.set(s * bw * .32, .6, -.08); g.add(p) }
    G.add(g) }
  return G;
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
  paintPathVerge(g, AP.paths, tx, ty, PPM);
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
  // v241 (Martin: stromy pri clubhouse vyzerali inak než tie, ktoré hráme): cudzie stromy v okne jamky kreslí jamka svojím detailným generátorom (o.detail), tu ostanú len stromy mimo dosahu hry
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
  // v246: vlajky ostatných jamiek v okne jamky kreslí jamka sama (aj so skutočnou dierou – dá sa trafiť „nesprávna“ jamka); tu len vrátime ich polohu
  const cups = [];
  { const F = []; for (const h of READY) if (AP.gc[h - 1] && !(own === "apex" && h === o.hNum)) F.push([...AP.gc[h - 1], 0xd8262a, String(h)]);
    if (AK) AK.gc.forEach((p, i) => { if (!(own !== "apex" && i + 1 === o.hNum)) F.push([...akp(p), 0x16285a, "A" + (i + 1)]) });
    for (let i = F.length - 1; i >= 0; i--) { const f = F[i]; if (!f[3]) continue; const [x, y] = L(f[0], f[1]); if (inWin(x, y, 6)) { cups.push({ x, y, h: f[3], col: f[2] }); F.splice(i, 1) } }
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
  // --- tabule vzdialeností na range (namiesto vlajok)
  if (AP.range && AP.range.tee) G.add(buildRangeSigns(THREE, AP.range, V, hA, (e, n) => near(e, n)));
  // --- tunel pod cestou mimo okna jamky (v okne ho kreslí jamka)
  for (const O of AP.objects || []) if (O.t === "tunnel" && near(O.p[0], O.p[1])) { const [x, y] = L(...O.p); if (!inWin(x, y, 2)) G.add(buildTunnel(THREE, O, V, hA)) }
  // --- hlavná cesta ako 3D pás (v248): ostré okraje a čiary, rovný profil; v okne jamky na jej detailnom teréne
  // --- chodníky, príjazd, rampy ako 3D pás (v250); cez bunkre a greeny sa prerušia
  G.add(buildPaths(THREE, pathList(AP), V, (e, n) => hA(e, n), { off: .1, fog: o.groundFog !== false, clip: (e, n) => near(e, n, -8), avoid: pathAvoid(AP, AK, AKO) }));
  for (const r of ar.roads || []) if (r.t === "main") G.add(buildRoad(THREE, r, V, hA, { off: .08, fog: o.groundFog !== false, clip: (e, n) => near(e, n, -8), tunnels: (AP.objects || []).filter(O => O.t === "tunnel") }));
  // --- clubhouse (ak ho nekreslí jamka): zjednodušený na pár zlúčených objektov
  let CLB = null;
  if (!o.club && AP.clubhouse && near(AP.clubhouse.o[0], AP.clubhouse.o[1])) { const { buildClubhouse } = await import("./clubhouse.js");
    CLB = buildClubhouse(THREE, AP.clubhouse, V, hA); if (CLB) G.add(mergeStatic(THREE, CLB.group)) }
  // kolízie s budovami: pôvodné (nezlúčené) meshe clubhouse v ENU 18-ky + matica do scény jamky (G.matrix)
  return { group: G, clubhouse: CLB, coll: CLB ? { root: CLB.group, matrix: G.matrix } : null, cups };
}

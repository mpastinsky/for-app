// Jednoduché (low-poly) stromy podľa druhu pre vzdialené okolie (lib/areal.js) a 3D prehľad 18-ky (ihrisko.html).
// Druh = kód v apex.json trees[k][5]: a agát, d dub, l lipa, j javor, b borovica, t tuja, k ker, s smrek. Bez kódu = obyčajný listnáč.
// Všetky stromy = 4 inštancované objekty (koruna guľa, koruna kužeľ, kmeň).
const COL = { a: [.24, .42, .27], d: [.29, .42, .19], l: [.27, .44, .22], j: [.25, .46, .23], b: [.31, .34, .17], t: [.33, .38, .15], k: [.27, .4, .19], s: [.45, .2, .26] };
// list: [[e, n, r, h, kc], …]; at(e, n, z) → Vector3 v scéne; hAt(e, n) → výška terénu
export function lowTrees(THREE, list, at, hAt, o = {}) {
  const R = [], C = [], T = [];
  for (const [e, n, r, h, kc] of list) {
    const z = hAt(e, n);
    if (kc === "t" || kc === "s") { const rr = kc === "t" ? Math.min(r, 1.3) : Math.max(r, h * .26); C.push([e, n, z + h * .06, rr, h * .94, kc]); T.push([e, n, z, h * .1]); }
    else if (kc === "k") R.push([e, n, z + h * .45, r * 1.1, h * .55, kc]);
    else if (kc === "b") { const ch = h * .2; R.push([e, n, z + h - ch, r * 1.05, ch, kc]); T.push([e, n, z, h - ch * 1.2]); }
    else { const ch = Math.max(r * 1.1, h * .42); R.push([e, n, z + h - ch, r * 1.05, ch, kc]); T.push([e, n, z, h - ch + .6]); }
  }
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), c = new THREE.Color(), out = [];
  const mk = (geo, mat, L, f) => { if (!L.length) return; const I = new THREE.InstancedMesh(geo, mat, L.length); L.forEach((p, k) => f(I, p, k)); I.instanceMatrix.needsUpdate = true; if (I.instanceColor) I.instanceColor.needsUpdate = true; I.castShadow = !!o.shadow; out.push(I) };
  const Mat = (x) => o.lambert ? new THREE.MeshLambertMaterial(Object.assign({ flatShading: true }, x)) : new THREE.MeshStandardMaterial(Object.assign({ roughness: .95, flatShading: true }, x));
  const tint = (I, k, kc) => { const b = COL[kc] || COL.l; c.setHSL(b[0] + ((k * 37) % 10) / 400, b[1], b[2] * (.9 + ((k * 53) % 10) / 45)); I.setColorAt(k, c) };
  mk(new THREE.IcosahedronGeometry(1, 1), Mat({ color: 0xffffff }), R, (I, [e, n, z, r, ch, kc], k) => { m.compose(at(e, n, z), q, s.set(r, ch, r)); I.setMatrixAt(k, m); tint(I, k, kc) });
  const cg = new THREE.ConeGeometry(1, 1, 7); cg.translate(0, .5, 0);
  mk(cg, Mat({ color: 0xffffff }), C, (I, [e, n, z, r, h, kc], k) => { m.compose(at(e, n, z), q, s.set(r, h, r)); I.setMatrixAt(k, m); tint(I, k, kc) });
  const tg = new THREE.CylinderGeometry(.18, .26, 1, 5); tg.translate(0, .5, 0);
  mk(tg, Mat({ color: 0x5a3f28 }), T, (I, [e, n, z, h], k) => { m.compose(at(e, n, z - .3), q, s.set(1, h + .3, 1)); I.setMatrixAt(k, m) });
  return out;
}

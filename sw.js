// Fairway Live: offline vyrovnávacia pamäť appky (mapové dlaždice sa necachujú).
// v273: jamka 17 – zmazaný úzky pás „fairwayu“ k odpaliskám (podľa Martina nie je fairway).
// v272: jamka 17 Báč podľa mapy.com – 3 odpaliská (severná okrúhla, ľadvinka, JV okrúhla), green s horným lalokom, bunkre posunuté ~2 m, fairway pred greenom, koniec chodníka, kríky a borovice vpravo, falošné bunkre zmazané.
// v271: jamka 16 Báč podľa mapy.com – 5 odpalísk pri strednom chodníku, fairway okolo lalokového bunkra, bunkre posunuté ~2 m (podľa snímok), chýbajúce chodníky, kríky pri rybníku.
// v270: jamka 15 Báč podľa mapy.com – 5 odpalísk (otočka s vozíkom), green, fairway medzi rybníkmi, bunkre, chodníky, drevená chatka s červenou strechou, kríky.
// v269: jamka 14 Báč podľa mapy.com – 5 odpalísk pri chodníku, green (hruška), fairway pri rybníku, bunkre pri greene.
// v268: jamka 13 Báč podľa mapy.com – odpaliská, green, fairway, bunkre, chodníky a rad stromov pri poli.
// v267: jamky sa otvárajú z cache hneď (aj pri slabom signáli na ihrisku); nová verzia sa na pozadí overí a uloží na ďalšie otvorenie.
// Pri novej verzii (zmena CACHE) sa appka stiahne nanovo; veľké dáta terénu sa len overia voči starej kópii (stiahnu sa iba zmenené).
const CACHE = "for-v273";
const CORE = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-180.png", "icon-192.png",
  "leaflet/leaflet.css", "leaflet/leaflet.js",
  "3d/", "3d/index.html", "3d/ihrisko.html",
  "3d/lib/three.module.min.js", "3d/lib/OrbitControls.js", "3d/lib/pcnav.js", "3d/lib/species.js",
  "3d/lib/areal.js", "3d/lib/clubhouse.js", "3d/lib/treeshapes.js"];
// dáta ihriska a terénu (spolu ~3 MB) – stiahnu sa vopred pri inštalácii, aby ďalšia jamka nečakala na sieť
const DATA = ["3d/apex.json", "3d/akademia.json", "3d/areal-ter.json", "3d/apex-ter-n.json", "3d/apex-ter-s.json"];
const key = u => { const x = new URL(u, self.registration.scope); x.search = ""; x.hash = ""; return x.href; };
// stiahnuť / overiť zo siete do cache c; old = doterajšia kópia – ak sa súbor nezmenil (rovnaký ETag), použije sa tá (bez prepisovania)
const fresh = (c, u, old) => fetch(new Request(u, { cache: "no-cache" })).then(r => {
  const et = r.headers.get("etag"), same = old && et && et === old.headers.get("etag");
  if (r.ok && r.type === "basic") return (same ? c.match(key(u)).then(h => h ? null : c.put(key(u), old)) : c.put(key(u), r.clone())).then(() => r);
  return r; });
const chk = new Map();   // kedy sa súbor naposledy overoval (pri každom otvorení jamky stačí raz za 2 min)
const oldCopy = async u => { for (const k of await caches.keys()) if (k !== CACHE) { const r = await (await caches.open(k)).match(key(u)); if (r) return r; } return null; };
self.addEventListener("install", e => {
  // inštalácia beží, kým appku ešte obsluhuje stará verzia – nič nečaká. Appka sa stiahne nanovo,
  // dáta terénu sa len overia voči starej kópii (stiahnu sa iba zmenené)
  e.waitUntil(caches.open(CACHE).then(c => Promise.all([...CORE.map(u => fresh(c, u)),
    ...DATA.map(async u => { const o = await oldCopy(u); try { await fresh(c, u, o); } catch (er) { if (o) await c.put(key(u), o); } })]))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== "GET" || u.hostname.includes("arcgisonline")) return;
  if (u.origin !== location.origin) {   // cudzie zdroje: sieť, pri výpadku cache
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  // vlastné súbory: hneď z cache, zároveň na pozadí overiť novú verziu (stale-while-revalidate); prvýkrát zo siete
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(key(req.url));
    if (hit) { const k = key(req.url), t = Date.now();
      if (!(t - (chk.get(k) || 0) < 120000)) { chk.set(k, t); e.waitUntil(fresh(c, req.url, hit).catch(() => {})); }
      return hit; }
    return fresh(c, req.url).catch(() => caches.match(key(req.url)).then(r => r || Response.error()));
  }));
});

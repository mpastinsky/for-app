// Fairway Live: jednoduchá offline vyrovnávacia pamäť pre samotnú appku (mapové dlaždice sa necachujú).
const CACHE = "for-v216";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-180.png", "icon-192.png",
  "leaflet/leaflet.css",
  "leaflet/leaflet.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.hostname.includes("arcgisonline")) return;
  // sieť najprv (aby sa nové verzie prejavili hneď), pri výpadku signálu cache
  e.respondWith(fetch(e.request, u.origin === location.origin ? { cache: "no-cache" } : {}).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});

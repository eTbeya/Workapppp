// sw.js
const CACHE = "dist-app-v1";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  // CDN-ите ще се кешират динамично при първо отваряне
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  // Network-first за всичко, cache fallback когато няма интернет
  e.respondWith(
    fetch(req).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(req, clone)).catch(()=>{});
      return res;
    }).catch(() => caches.match(req).then(match => match || caches.match("./index.html")))
  );
});
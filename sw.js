// Keeps the whole app on the phone so it opens with no signal.
// Bump VERSION whenever any file below changes so phones refresh their saved copies.
const VERSION = "field-log-v10";
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./maps/property-1/map.json",
  "./maps/property-1/aerial.jpg",
  "./maps/property-1/topo.jpg"
];
const PAGE_TIMEOUT_MS = 4000;   // weak signal: give up on the network and open the saved page

self.addEventListener("install", (event) => {
  // Fetch past the browser's own cache, then take over straight away rather than waiting for every tab to close.
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // The page itself: latest from the network when there is signal, the saved copy otherwise.
  if (req.mode === "navigate") {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const network = fetch(req, { cache: "no-cache" }).then((res) => {
          if (res.ok) cache.put("./index.html", res.clone());
          return res;
        });
        const timeout = new Promise((resolve) => setTimeout(resolve, PAGE_TIMEOUT_MS, null));
        try {
          const res = await Promise.race([network, timeout]);
          if (res && res.ok) return res;
        } catch (e) { /* offline */ }
        event.waitUntil(network.catch(() => {}));
        return (await cache.match("./index.html")) ||
          network.catch(() => new Response("Offline and not yet saved. Open the app once with signal.", { status: 503 }));
      })
    );
    return;
  }

  // Everything else (icons, maps): from the phone first, refreshed in the background when there is signal.
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req)
        .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
        .catch(() => null);
      if (cached) { event.waitUntil(fresh); return cached; }
      return (await fresh) || new Response("Offline and not yet saved. Open the app once with signal.", { status: 503 });
    })
  );
});

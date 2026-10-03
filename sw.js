// Keeps the whole app on the phone so it opens with no signal.
// Two saved sets, so an app update doesn't re-download the big files:
//   APP_VERSION    - the page itself. Bump on every app change (small download).
//   STATIC_VERSION - icons, maps and the HEIC converter. Bump only when one of those files changes.
const APP_VERSION = "field-log-app-v16";
const STATIC_VERSION = "field-log-static-v1";
const APP_FILES = ["./", "./index.html", "./manifest.webmanifest"];
const STATIC_FILES = [
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./maps/property-1/map.json",
  "./maps/property-1/aerial.jpg",
  "./maps/property-1/topo.jpg",
  "./lib/heic-to/heic-to.min.js"
];
const PAGE_TIMEOUT_MS = 4000;   // weak signal: give up on the network and open the saved page

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    // The page: fetched fresh, past the browser's own cache.
    const app = await caches.open(APP_VERSION);
    await app.addAll(APP_FILES.map((f) => new Request(f, { cache: "reload" })));
    // Big files: only download what this phone doesn't already have.
    const stat = await caches.open(STATIC_VERSION);
    for (const f of STATIC_FILES) {
      if (!(await stat.match(f))) await stat.add(new Request(f, { cache: "reload" }));
    }
    // Take over straight away rather than waiting for every tab to close.
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== APP_VERSION && k !== STATIC_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // The page itself: latest from the network when there is signal, the saved copy otherwise.
  if (req.mode === "navigate") {
    event.respondWith(
      caches.open(APP_VERSION).then(async (cache) => {
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

  // Everything else: the saved copy if there is one (big files are versioned by STATIC_VERSION, so they
  // aren't re-fetched in the background); otherwise the network, saved for next time.
  event.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res.ok) (await caches.open(APP_VERSION)).put(req, res.clone());
      return res;
    } catch (e) {
      return new Response("Offline and not yet saved. Open the app once with signal.", { status: 503 });
    }
  })());
});

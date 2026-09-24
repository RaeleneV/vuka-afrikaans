// ==========================================================================
// Vuka — Service Worker
// Caches the app shell on install, then serves cached pages when offline.
// Bump CACHE_NAME whenever you deploy changes, so old caches get replaced.
// ==========================================================================

const CACHE_NAME = "vuka-cache-v8";

// Every page and asset in the site — cached immediately on install so the
// whole site is available offline, not just pages a visitor has opened.
const CORE_ASSETS = [
  "index.html",
  "team.html",
  "Journey1.html",
  "Journey2.html",
  "Journey3.html",
  "Journey4.html",
  "Journey5.html",
  "Journey6.html",
  "Journey7.html",
  "Journey8.html",
  "Journey9.html",
  "Journey10.html",
  "manifest.json",
  "css/vuka_styles_redesigned.css",
  "js/main.js",
  "libs/jspdf.umd.min.js",
  "libs/jspdf.plugin.autotable.min.js",
  "images_global/vuka-logo-white.png",
  "images_global/favicon-sun-only.ico",
  "images_global/UbuntuNexus_logo.jpeg",

  "success story/iziko.html",
  "success story/style.css",
  "success story/images_global/favicon-sun-only.ico",
  "success story/images/image1.jpeg",
  "success story/images/image2.jpeg",
  "success story/images/image3.jpeg",
  "success story/images/image4.jpeg",
  "success story/images/image5.jpeg",
  "success story/images/image6.jpeg",
  "success story/images/image7.jpeg",
  "success story/images/image8.jpeg",

  "Capital Calculator/Capital Calculator/calculator.html",
  "Capital Calculator/Capital Calculator/meals.html",
  "Capital Calculator/Capital Calculator/Categories.html",
  "Capital Calculator/Capital Calculator/libs/jspdf.umd.min.js",
  "Capital Calculator/Capital Calculator/libs/jspdf.plugin.autotable.min.js",
  "Capital Calculator/Capital Calculator/calculator.js",
  "Capital Calculator/Capital Calculator/categories.js",
  "Capital Calculator/Capital Calculator/data.js",
  "Capital Calculator/Capital Calculator/meals.js",
  "Capital Calculator/Capital Calculator/style.css",
  "Capital Calculator/Capital Calculator/Images/amagwinya.jpeg",
  "Capital Calculator/Capital Calculator/Images/amanqina.jpg",
  "Capital Calculator/Capital Calculator/Images/bottledwater.jpg",
  "Capital Calculator/Capital Calculator/Images/bunnychow.jpg",
  "Capital Calculator/Capital Calculator/Images/cheeseandham.jpg",
  "Capital Calculator/Capital Calculator/Images/chickenliver.jpg",
  "Capital Calculator/Capital Calculator/Images/coffee.jpg",
  "Capital Calculator/Capital Calculator/Images/filledvetkoek.jpg",
  "Capital Calculator/Capital Calculator/Images/gingerbeer.jpg",
  "Capital Calculator/Capital Calculator/Images/juice.jpg",
  "Capital Calculator/Capital Calculator/Images/koeksisters.jpg",
  "Capital Calculator/Capital Calculator/Images/kota.jpg",
  "Capital Calculator/Capital Calculator/Images/muffins.jpg",
  "Capital Calculator/Capital Calculator/Images/papmogodu.jpg",
  "Capital Calculator/Capital Calculator/Images/papstew.jpg",
  "Capital Calculator/Capital Calculator/Images/papwors.jpg",
  "Capital Calculator/Capital Calculator/Images/russianchips.jpg",
  "Capital Calculator/Capital Calculator/Images/scones.jpg",
  "Capital Calculator/Capital Calculator/Images/slapchips.jpg",
  "Capital Calculator/Capital Calculator/Images/smiley.jpg",
  "Capital Calculator/Capital Calculator/Images/softdrinks.jpg",
  "Capital Calculator/Capital Calculator/Images/tea.png",
  "Capital Calculator/Capital Calculator/Images/worsroll.jpg",

  "pdf/VukaJourney01.pdf",
  "pdf/VukaJourney02.pdf",
  "pdf/VukaJourney03.pdf",
  "pdf/VukaJourney04.pdf",
  "pdf/VukaJourney05.pdf",
  "pdf/VukaJourney06.pdf",
  "pdf/VukaJourney07.pdf",
  "pdf/VukaJourney08.pdf",
  "pdf/VukaJourney09.pdf",
  "pdf/VukaJourney10.pdf",
  "pdf/VukaJourneys1-10.pdf",
];

// Install: pre-cache every asset above. Each file is cached individually
// (not cache.addAll) so one missing/renamed file only skips itself instead
// of aborting the entire precache — a broken link anywhere in the site
// would otherwise silently kill offline support for everything.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`Service worker: failed to pre-cache "${url}"`, err);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

// Activate: delete any old versioned caches.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: try the network first, fall back to cache, and cache new pages
// as the user visits them (so any Journey page becomes offline-available
// after its first successful visit).
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful, same-origin responses.
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline: serve from cache if we have it.
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // No cached version available — for page navigations, fall back
          // to the homepage so the user isn't shown a browser error page.
          if (event.request.mode === "navigate") {
            return caches.match("index.html");
          }
          // No cache entry and not a page navigation (e.g. an image or
          // script): respond with a real error Response instead of
          // undefined, which respondWith() can't use.
          return new Response("", { status: 504, statusText: "Offline" });
        });
      })
  );
});
// Minimal service worker: makes the site installable. It caches nothing, so a new deploy
// is always picked up (no stale bundles). Add caching here if offline support is needed.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});

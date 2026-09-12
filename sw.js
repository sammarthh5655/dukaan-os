/* Dukaan OS — offline-first service worker.
   Cache-first for the shell so the counter opens with no network at all. */
const PREFIX = 'dukaan-os-' + encodeURIComponent(self.registration.scope) + '-';
const CACHE = PREFIX + 'security-v1';
const SHELL = [
  './', './index.html', './manifest.json',
  './css/app.css', './js/money-language.js', './js/quantity-units.js',
  './js/domain.js', './js/storage.js', './js/indexeddb.js', './js/core.js', './js/safety.js', './js/migrations.js', './js/i18n.js', './js/core-accessibility.js', './js/qr.js', './js/ui.js', './js/auth.js', './js/backup.js', './js/returns.js', './js/supplier-corrections.js', './js/stock-adjustments.js', './js/stores-transfers.js', './js/cash-shifts.js', './js/statements.js', './js/voice.js',
  './js/thermal-receipts.js','./js/pos.js', './js/inventory.js', './js/ledger.js', './js/insights.js',
  './js/settings.js', './js/app.js'
];

self.addEventListener('install', (e) => {
  // Wait for old tabs to close. Do not replace a running till mid-transaction.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then((cache) => cache.match(req)).then((hit) => {
      if (hit) {
        // Install a new version as a complete shell instead of mixing files.
        return hit;
      }
      return fetch(req)
        .then((res) => {
          return res;
        })
        .catch(() => req.mode === 'navigate' ? caches.open(CACHE).then((c) => c.match('./index.html')) : Response.error());
    })
  );
});

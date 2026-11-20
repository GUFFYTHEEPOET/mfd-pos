/* MFD POS offline worker — KreativG Studio. Version: 20261120-1104-b5536f49 */
const CACHE = 'mfd-pos-20261120-1104-b5536f49';
const SHELL = ["./", "index.html", "app.js", "fonts.css", "manifest.webmanifest", "fonts/archivo-latin-600-normal.woff2", "fonts/archivo-latin-700-normal.woff2", "fonts/archivo-latin-800-normal.woff2", "fonts/ibm-plex-mono-latin-500-normal.woff2", "fonts/ibm-plex-mono-latin-600-normal.woff2", "fonts/ibm-plex-mono-latin-700-normal.woff2", "fonts/ibm-plex-sans-latin-400-normal.woff2", "fonts/ibm-plex-sans-latin-500-normal.woff2", "fonts/ibm-plex-sans-latin-600-normal.woff2", "fonts/ibm-plex-sans-latin-700-normal.woff2", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "vendor/html2canvas.min.js", "vendor/jspdf.umd.min.js"];

self.addEventListener('install', e => {
  // Download the whole app first. Do NOT take over a running till: the page shows
  // "A new version is ready" and the cashier chooses when to update.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {cache: 'reload'})))));
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('mfd-pos-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // cloud database traffic goes straight to the network
  if (req.mode === 'navigate') {                             // opening the app: always the installed version
    e.respondWith(caches.open(CACHE).then(c => c.match('index.html')).then(r => r || fetch(req)));
    return;
  }
  e.respondWith(caches.open(CACHE).then(c => c.match(req, {ignoreSearch: true}).then(r => r || fetch(req))));
});

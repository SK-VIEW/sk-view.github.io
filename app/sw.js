// 평택역 SK VIEW 입주민 앱 — 화면 파일만 기기에 저장 (개인정보·접수 내용은 저장하지 않음)
const CACHE = 'skview-app-fb85cfe892';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('skview-app-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || !url.pathname.startsWith(new URL('./', self.registration.scope).pathname)) return;
  if (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
    // 화면: 저장본을 바로 보여주고(인터넷이 느려도 즉시 열림), 뒤에서 최신 화면을 받아 다음 실행 때 반영
    e.respondWith(caches.open(CACHE).then(c => c.match('./index.html').then(hit => {
      const net = fetch(req).then(res => { if (res.ok) c.put('./index.html', res.clone()); return res; });
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net.catch(() => caches.match('./index.html'));
    })));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});

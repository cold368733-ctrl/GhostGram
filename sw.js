// GhostGram service worker: index.html network-first, остальное из кэша
const C='gg-v3',A=['./','./index.html','./manifest.json','./icon.svg'];
const FB='https://www.gstatic.com/firebasejs/10.14.1/';
// заранее кладём Firebase-модули в кэш: дальше сайт не зависит от скорости gstatic.com
async function warm(c){const seen=new Set(),q=['firebase-app.js','firebase-auth.js','firebase-firestore.js'].map(x=>FB+x);
 while(q.length){const u=q.shift();if(seen.has(u))continue;seen.add(u);
  try{const x=await fetch(u,{mode:'cors'});if(!x.ok)continue;const t=await x.clone().text();await c.put(u,x);
   for(const m of t.matchAll(/(?:from|import)\s*["']([^"']+\.js)["']/g)){try{const n=new URL(m[1],u).href;if(n.startsWith(FB))q.push(n)}catch(e){}}}catch(e){}}}
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A).then(()=>Promise.race([warm(c),new Promise(r=>setTimeout(r,12000))]))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method==='GET'&&u.href.startsWith(FB)){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>{if(x.ok){const k=x.clone();caches.open(C).then(c=>c.put(r,k))}return x})));return} // версионные модули Firebase: cache-first
 if(r.method!=='GET'||u.origin!==location.origin)return; // остальное Firebase/Google не кэшируем
 const nav=r.mode==='navigate'||u.pathname.endsWith('index.html');
 if(nav){e.respondWith(fetch(r).then(x=>{const k=x.clone();caches.open(C).then(c=>c.put(r,k));return x}).catch(()=>caches.match(r).then(m=>m||new Response('<body style="background:#0a0612;color:#7fffd4;font-family:Georgia;text-align:center;padding:40vh 20px">Призраки потеряли связь</body>',{headers:{'Content-Type':'text/html;charset=utf-8'}}))));return}
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>{const k=x.clone();caches.open(C).then(c=>c.put(r,k));return x})));
});

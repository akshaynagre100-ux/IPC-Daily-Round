const CACHE='ipc-round-v3';
const ASSETS=['./','./index.html','./manifest.json'];
const REPORT_SCRIPT=`<script>
function emailRound(id){
  const r=rounds.find(x=>x.id===id); if(!r)return;
  const applicable=r.results.filter(x=>x.status!=="N/A");
  const compliant=applicable.filter(x=>x.status==="Compliant").length;
  const nonCompliant=applicable.filter(x=>x.status==="Non-compliant").length;
  const compliancePct=applicable.length?Math.round(compliant/applicable.length*100):0;
  const nonCompliancePct=applicable.length?Math.round(nonCompliant/applicable.length*100):0;
  const lines=["IPC Daily Round Report","Date: "+r.date,"Ward / Department: "+r.ward,"Compliance: "+compliancePct+"%","Non-Compliance: "+nonCompliancePct+"%","","CAPA",...(r.capa&&r.capa.length?r.capa.map(c=>"- "+c.item+" ("+c.status+")\n  Action: "+(c.action||"-")+"\n  Responsible: "+(c.responsible||"-")+"\n  Target Date: "+(c.target||"-")):["No CAPA required."])];
  const subject=encodeURIComponent("IPC Daily Round - "+r.ward+" - "+r.date);
  const body=encodeURIComponent(lines.join("\n"));
  window.location.href="mailto:kbhicn@gmail.com?subject="+subject+"&body="+body;
}
</script>`;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.pathname.endsWith('/index.html')||u.pathname.endsWith('/')){
    e.respondWith(fetch('./index.html',{cache:'no-store'}).then(async r=>{let t=await r.text();t=t.replace('</body>',REPORT_SCRIPT+'</body>');return new Response(t,{status:r.status,statusText:r.statusText,headers:{'Content-Type':'text/html; charset=utf-8'}})}).catch(()=>caches.match('./index.html')));return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match('./index.html'))));
});
const CACHE_NAME='quiosco-shell-v2';
const BASE='/Quiosco-Control-Pro/';
const CORE=[BASE,BASE+'manifest.webmanifest',BASE+'icon.svg'];
const CDN='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0';
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  await cache.addAll(CORE);
  const response=await fetch(CDN,{mode:'cors',cache:'reload'});if(!response.ok)throw new Error('No se pudo guardar la biblioteca necesaria para el modo offline');await cache.put(CDN,response)
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('quiosco-shell-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin==='https://hpjxadnikwdjifypzdxc.supabase.co')return;
 if(url.origin===self.location.origin||url.href===CDN){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE_NAME);
   const cached=await cache.match(request,{ignoreSearch:true});
   if(cached)return cached;
   try{const response=await fetch(request);if(response.ok&&url.origin===self.location.origin)cache.put(request,response.clone());return response}
   catch(error){if(request.mode==='navigate'){const shell=await cache.match(BASE);if(shell)return shell}throw error}
  })());
 }
});

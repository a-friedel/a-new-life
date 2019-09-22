!function(e){var t={};function s(r){if(t[r])return t[r].exports;var n=t[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,s),n.l=!0,n.exports}s.m=e,s.c=t,s.d=function(e,t,r){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(s.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)s.d(r,n,function(t){return e[t]}.bind(null,n));return r},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return{}.hasOwnProperty.call(e,t)},s.p="",s(s.s=0)}([function(e,t,s){e.exports=s(1)},function(e,t,s){"use strict";s.r(t);var r=s(2);t.default=new class extends r.ServiceWorkerServer{constructor(e){super(e)}}(self)},function(e,t,s){"use strict";s.r(t),s.d(t,"ServiceWorkerServer",(function(){return o}));var r=s(3);const n=/(\/sockjs-node\/|\/api\/|\/socket.io\/)/;class i{constructor(e){this.messageHandler=e,this.lastSendRequestId=0,this.pendingReplies=new Map}handleMessage(e,t){let s=void 0;try{s=JSON.parse(t)}catch(e){return}if(function(e){return!!e&&void 0!==e.rpcId}(s)){const e=this.pendingReplies.get(s.rpcId);if(!e)return;if(this.pendingReplies.delete(s.rpcId),r.LOG,s.error){let t=s.error;return t.$isError&&((t=new Error).name=s.error.name,t.message=s.error.message,t.stack=s.error.stack),void(e.error&&e.error(t))}return void(e.resolve&&e.resolve(s.result))}if(!s||!s.requestId)return;const n=s.requestId;r.LOG,this.messageHandler.handleMessage(e,s.method,s.args).then(t=>{this.sendResultMessage(e,{requestId:n,result:t,error:void 0})},t=>{this.sendResultMessage(e,{requestId:n,result:void 0,error:Object(r.transformErrorForSerialization)(t)})})}sendResultMessage(e,t){this.messageHandler.sendMessage(e,JSON.stringify(t))}doRPCCall(e,t,s){const r={},n=new Promise((e,t)=>{r.resolve=e,r.error=t});return this.pendingReplies.set(++this.lastSendRequestId,r),this.messageHandler.sendMessage(e,JSON.stringify({rpcId:this.lastSendRequestId,method:t,args:s})),n}}class o{constructor(e){this.serviceWorkerGlobalScope=e,this.replacesClientId=null,this.sessionMap={},this.updateCache(),this.protocol=new i({sendMessage:this.sendMessage.bind(this),handleMessage:this.handleMessage.bind(this)}),this.serviceWorkerGlobalScope.addEventListener("install",this.onInstall.bind(this)),this.serviceWorkerGlobalScope.addEventListener("activate",this.onActivate.bind(this)),this.serviceWorkerGlobalScope.addEventListener("fetch",this.onFetch.bind(this)),this.serviceWorkerGlobalScope.addEventListener("message",this.onMessage.bind(this))}onInstall(e){r.LOG,e.waitUntil(this.initializePromise.then(()=>this.serviceWorkerGlobalScope.skipWaiting()))}onActivate(e){r.LOG;const t=this.serviceWorkerGlobalScope;e.waitUntil(this.initializePromise.then(()=>t.clients.claim()))}onFetch(e){if(r.LOG,!e.request||!e.request.url)return;let t=null;if(e.clientId)t=this.sessionMap[e.clientId]||null;else{const s=e.resultingClientId,r=this.replacesClientId;this.replacesClientId=null;const n=e.request.url.indexOf("?"),i=n>0?e.request.url.substr(n+1).split("&").reduce((e,t)=>{const s=t.split("=");return e[s[0]]=s[1],e},{}):{};null!==(t=i.jriSessionId||null)?this.sessionMap[s]=t:null!==r&&(t=this.sessionMap[s]=r)}const s=this.serviceWorkerGlobalScope,i=`${s.location.origin}/api/unload`,o=()=>{if(e.request.headers.has("x-cache")){const t=e.request.headers.get("x-cache"),n=new Headers(e.request.headers);n.delete("x-cache");const i=new Request(e.request,{headers:n});return s.caches.open("data").then(e=>e.match(i).then(t=>[e,t]),()=>(r.LOG,[void 0,void 0])).then(([e,s])=>"always"===t&&s?s:fetch(i).then(t=>Promise.all([t.clone().text(),s&&s.clone().text()||Promise.resolve(null)]).then(([s,r])=>(e&&s!==r&&e.put(i,t.clone()),t)),()=>s||new Response("NOT FOUND",{status:404,statusText:"Not Found"})))}return s.caches.open("local").then(t=>t.match(e.request),()=>(r.LOG,this.refetchOrGetOfflineResponse(e.request)))},a=async()=>0===e.request.url.indexOf(i)?new Response(""):n.test(e.request.url)&&!e.request.headers.has("x-cache")?(r.LOG,this.refetchOrGetOfflineResponse(e.request)):o().then(t=>{const n=new URL(e.request.url);return!t||("/"===n.pathname||"/index.html"===n.pathname)&&n.search?n.pathname.endsWith(".map")?(r.LOG,fetch(e.request.url,{credentials:"same-origin"})):0===e.request.url.indexOf(`${s.location.origin}/`)?(r.LOG,this.redirect(new Request(`${s.location.origin}/index.html${n.search||""}`,{credentials:"same-origin"}))):(r.LOG,this.refetchOrGetOfflineResponse(e.request)):(r.LOG,t)},()=>(r.LOG,this.refetchOrGetOfflineResponse(e.request))),l=async t=>{if(0===e.request.url.indexOf(i))return this.replacesClientId=this.sessionMap[e.clientId]||null,delete this.sessionMap[e.clientId],new Response("");const r=e.request.url.startsWith(s.location.origin)?e.request.url.substr(s.location.origin.length):e.request.url;return this.protocol.doRPCCall(t,"getContent",[r]).then(e=>{if(null==e)return a();const t=0===e.indexOf("data:");let s=e,r="text/plain";if(t){const t=e.indexOf(",",5);if(-1===t)throw new Error("VirtualFile malformed.");const[n,i]=e.slice(5,t).split(";");switch(s=e.slice(t+1),r=n||r,i){case"base64":s=Uint8Array.from(atob(s),e=>e.charCodeAt(0))}}return new Response(s,{headers:{"content-type":r}})},e=>{throw new Error(e)})};e.respondWith(this.initializePromise.then(async()=>{const e=await(t?l(t):a());if(!e)throw new Error("Error: No result.");return e}))}onMessage(e){var t;(t=e.source)&&"WindowClient"===t.constructor.name&&(r.LOG,this.protocol.handleMessage(e.source.id,e.data))}async sendMessage(e,t){r.LOG;const s=await this.serviceWorkerGlobalScope.clients.get(e);s&&s.postMessage(t)}handleMessage(e,t,s){if(t===r.INITIALIZE)return this.initialize(e);const n=this.requestHandler&&this.requestHandler.get(t);if(!n)return Promise.resolve(new Error("Missing requestHandler or method: "+t));try{return Promise.resolve(n.apply(this,s))}catch(e){return Promise.resolve(e)}}getHashJson(e){return e.then(e=>{if(e)return e.text().then(e=>{if(e)try{return JSON.parse(e)}catch(e){return}},()=>void 0)},()=>void 0)}refetchOrGetOfflineResponse(e){const t=this.serviceWorkerGlobalScope;return fetch(e).then(e=>e,()=>(r.LOG,0===e.url.indexOf(`${t.location.origin}/api`)?t.caches.open("local").then(e=>e.match("offline.json")):0===e.url.indexOf(`${t.location.origin}`)?t.caches.open("local").then(e=>e.match("offline.html")):void 0))}redirect(e){return this.serviceWorkerGlobalScope.caches.open("local").then(t=>t.match(e),()=>(r.LOG,this.refetchOrGetOfflineResponse(e))).then(t=>t||(r.LOG,this.refetchOrGetOfflineResponse(e)),()=>(r.LOG,this.refetchOrGetOfflineResponse(e)))}checkForCacheUpdate(){const e=this.serviceWorkerGlobalScope,t=e.location.origin+e.location.pathname.substr(0,e.location.pathname.lastIndexOf("/"));return e.caches.open("local").then(e=>Promise.all([e,e.keys(),this.getHashJson(e.match("hashes.json")),this.getHashJson(fetch("hashes.json",{credentials:"same-origin"}))])).then(([e,s,r,n])=>{if(r||(r={}),!n)throw new Error("No serverHashes: Possible offline situation detected.");const i=Object.keys(n).map(e=>({key:e,uri:new URL(e,t).href,hash:n[e]})),o=Object.keys(r).map(e=>{const n=new URL(e,t).href;return r&&!s.some(e=>e.url===n)&&delete r[e],{key:e,uri:n,hash:r&&r[e]}}),a=s.reduce((t,s)=>{const n=i.find(e=>s.url===e.uri);return n?o.some(e=>n.uri===e.uri&&n.hash===e.hash)||(t.push(e.delete(s)),r&&delete r[n.key]):t.push(e.delete(s)),t},[]);return Promise.all([e,s,r,n,...a])}).then(([e,s,r,n])=>{const i=Object.keys(n).map(e=>({key:e,uri:new URL(e,t).href,hash:n[e]})),o=Object.keys(r).map(e=>({key:e,uri:new URL(e,t).href,hash:r[e]})),a=i.reduce((e,t)=>(o.some(e=>t.key===e.key)||e.push(t.uri),e),[]),l=JSON.stringify(n),c={headers:{"Content-Type":"application/json; charset=UTF-8","Content-Length":l.length.toString()},status:200,statusText:"OK"},h=[];for(let e=0;e<a.length;++e){(h[Math.floor(e/10)]||h[h.push([])&&h.length-1]).push(a[e])}return Promise.all([Promise.all(h.map(t=>e.addAll(t.map(e=>new Request(e,{credentials:"same-origin"}))))),e.put("hashes.json",new Response(l,c))])}).catch(()=>{r.LOG})}initialize(e){if(!this.requestHandler){this.requestHandler=new Map;const e=this.constructor.prototype;Object.getOwnPropertyNames(e).forEach(t=>{const s="constructor"!==t&&e[t];s instanceof Function&&this.requestHandler.set(t,s)}),this.requestHandler.set("$$updateCache$$",()=>this.updateCache())}return this.updateCache().then(()=>({id:e,methods:[...this.requestHandler.keys()]}))}updateCache(){return this.initializePromise=this.checkForCacheUpdate()}}},function(e,t,s){"use strict";s.r(t),s.d(t,"INITIALIZE",(function(){return r})),s.d(t,"LOG",(function(){return n})),s.d(t,"transformErrorForSerialization",(function(){return i}));const r="$initialize",n=!1;function i(e){if(e instanceof Error){let{name:t,message:s}=e;return{$isError:!0,name:t,message:s,stack:e.stacktrace||e.stack}}return e}}]);
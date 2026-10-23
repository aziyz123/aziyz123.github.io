import w from './worker.js';
import assert from 'node:assert/strict';
const store=new Map();
const KV={async get(k){return store.has(k)?store.get(k):null},async put(k,v){store.set(k,v)}};
const sent=[];
globalThis.fetch=async(url,opt)=>{
  url=String(url);
  if(url.includes('/sendMessage')){sent.push(JSON.parse(opt.body));return new Response(JSON.stringify({ok:true}))}
  if(url.includes('/getFile'))return new Response(JSON.stringify({ok:true,result:{file_path:'documents/file_1.pptx'}}));
  if(url.includes('/file/bot'))return new Response('PPTXDATA',{headers:{'Content-Length':'8'}});
  if(url.includes('/setWebhook'))return new Response(JSON.stringify({ok:true}));
  if(url.includes('/getMe'))return new Response(JSON.stringify({ok:true,result:{username:'fayl_bot'}}));
  throw new Error('unexpected '+url);
};
const env={BOT_TOKEN:'T',WEBHOOK_SECRET:'sec_123',ALLOWED_ORIGIN:'https://aziyz123.github.io',FAYL_KV:KV};
const pend=[];const ctx={waitUntil:p=>pend.push(p)};
const hook=async(body,secret='sec_123')=>{const r=await w.fetch(new Request('https://w.dev/telegram/webhook',{method:'POST',headers:{'X-Telegram-Bot-Api-Secret-Token':secret,'Content-Type':'application/json'},body:JSON.stringify(body)}),env,ctx);await Promise.all(pend.splice(0));return r};
const CODE='ABCD2345';
// 1 secret check
assert.equal((await hook({},'wrong')).status,403);
// 2 file before pairing
await hook({message:{chat:{id:1,type:'private'},document:{file_id:'F',file_name:'a.pptx',file_size:100}}});
assert.match(sent.at(-1).text,/Avval saytga ulaning/);
// 3 bad code & good code
await hook({message:{chat:{id:1,type:'private'},text:'/start BAD'}});
assert.match(sent.at(-1).text,/noto'g'ri/);
await hook({message:{chat:{id:1,type:'private'},text:'/start '+CODE.toLowerCase()}});
assert.match(sent.at(-1).text,/ulandi/);
assert.equal(store.get('chat:1'),CODE);
// 4 oversize
await hook({message:{chat:{id:1,type:'private'},document:{file_id:'F',file_name:'big.pptx',file_size:21*1024*1024}}});
assert.match(sent.at(-1).text,/20 MB/);
// 5 good file + photo
await hook({message:{chat:{id:1,type:'private'},document:{file_id:'FID1',file_name:'Dars "1"/slayd.pptx',file_size:5000,mime_type:'application/vnd.openxmlformats-officedocument.presentationml.presentation'}}});
await hook({message:{chat:{id:1,type:'private'},photo:[{file_id:'s',file_size:1},{file_id:'FIDP',file_size:900}]}});
// group chat ignored
await hook({message:{chat:{id:2,type:'group'},text:'/start '+CODE}});
assert.equal(store.get('chat:2'),undefined);
// 6 inbox
let r=await w.fetch(new Request('https://w.dev/api/inbox/'+CODE.toLowerCase(),{headers:{Origin:'https://aziyz123.github.io'}}),env,ctx);
let j=await r.json();assert.equal(j.items.length,2);
assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://aziyz123.github.io');
assert.ok(!('file_id' in j.items[0]));
assert.ok(!j.items[0].name.includes('"')&&!j.items[0].name.includes('/'));
console.log(j.items.map(i=>i.name));
// other origin gets no ACAO
r=await w.fetch(new Request('https://w.dev/api/inbox/'+CODE,{headers:{Origin:'https://evil.example'}}),env,ctx);
assert.equal(r.headers.get('Access-Control-Allow-Origin'),null);
// after filter
const t=j.items[0].ts;r=await w.fetch(new Request('https://w.dev/api/inbox/'+CODE+'?after='+t),env,ctx);
assert.ok((await r.json()).items.every(i=>i.ts>t));
// wrong code
r=await w.fetch(new Request('https://w.dev/api/inbox/12'),env,ctx);assert.equal(r.status,400);
// 7 download
r=await w.fetch(new Request('https://w.dev/dl/'+CODE+'/'+j.items[0].id),env,ctx);
assert.equal(r.status,200);assert.equal(await r.text(),'PPTXDATA');
assert.match(r.headers.get('Content-Disposition'),/filename\*=UTF-8''/);
r=await w.fetch(new Request('https://w.dev/dl/'+CODE+'/zzzzzz'),env,ctx);assert.equal(r.status,404);
// 8 setup
r=await w.fetch(new Request('https://w.dev/setup?key=bad'),env,ctx);assert.equal(r.status,403);
r=await w.fetch(new Request('https://w.dev/setup?key=sec_123'),env,ctx);assert.equal((await r.json()).bot,'fayl_bot');
// 9 help text & non-file
await hook({message:{chat:{id:1,type:'private'},text:'salom'}});assert.match(sent.at(-1).text,/Fayl Uzatish botiman/);
console.log('ALL WORKER TESTS PASSED');

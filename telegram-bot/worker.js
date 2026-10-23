/**
 * Fayl Uzatish — Telegram bot ko'prigi (Cloudflare Worker).
 *
 * Oqim:
 *  1) Sayt xona ochganda 8 belgili KOD yaratadi va  https://t.me/<bot>?start=<KOD>  havolasini (QR) ko'rsatadi.
 *  2) Foydalanuvchi botni ochadi → /start <KOD>  → bot shu chatni KOD ga bog'laydi.
 *  3) Foydalanuvchi botga fayl (slayd, PDF, rasm) yuboradi → bot uni KOD ning "inbox"iga yozadi.
 *  4) Sayt GET /api/inbox/<KOD> ni so'raydi va yangi fayllarni ko'rsatadi; yuklab olish: GET /dl/<KOD>/<id>
 *     (fayl Telegram serveridan oqim bilan olinadi, Workerda saqlanmaydi).
 *
 * Maxfiy qiymatlar (kodga yozilmaydi):  BOT_TOKEN, WEBHOOK_SECRET   — `wrangler secret put`
 * KV namespace:                          FAYL_KV
 * Oddiy o'zgaruvchi:                     ALLOWED_ORIGIN  (masalan https://aziyz123.github.io)
 */

const CODE_RE = /^[A-HJ-NP-Z2-9]{8}$/; // 0,1,O,I ishlatilmaydi
const MAX_BYTES = 20 * 1024 * 1024;    // Telegram Bot API getFile chegarasi
const TTL = 24 * 3600;                 // bog'lanish va fayllar ro'yxati 24 soat saqlanadi
const MAX_ITEMS = 20;

const enc = new TextEncoder();

function corsHeaders(req, env) {
  const origin = req.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
  const h = { 'Vary': 'Origin' };
  if (allowed.includes('*')) h['Access-Control-Allow-Origin'] = '*';
  else if (origin && allowed.includes(origin)) h['Access-Control-Allow-Origin'] = origin;
  h['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
  h['Access-Control-Allow-Headers'] = 'Content-Type';
  h['Access-Control-Max-Age'] = '86400';
  return h;
}
function json(data, status, extra) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, extra || {})
  });
}
function rid() {
  const b = new Uint8Array(6);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => (x % 36).toString(36)).join('');
}
function safeName(n) {
  return String(n || 'fayl').replace(/[\r\n"\\/<>:|?*\u0000-\u001f]/g, '_').slice(0, 160) || 'fayl';
}
function timingSafeEqual(a, b) {
  const x = enc.encode(a), y = enc.encode(b);
  if (x.length !== y.length) return false;
  let r = 0;
  for (let i = 0; i < x.length; i++) r |= x[i] ^ y[i];
  return r === 0;
}

async function tg(env, method, body) {
  const r = await fetch('https://api.telegram.org/bot' + env.BOT_TOKEN + '/' + method, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  return r.json().catch(() => ({ ok: false }));
}
const say = (env, chat, text) => tg(env, 'sendMessage', { chat_id: chat, text, disable_web_page_preview: true });

const HELP =
  "Salom! Men Fayl Uzatish botiman.\n\n" +
  "1) Kompyuterda saytni oching → «Kompyuter» → «Xona ochish».\n" +
  "2) Ekrandagi QR kodni skanerlang yoki «Telegram orqali yuborish» havolasini bosing (yoki botga 8 belgili kodni yozing).\n" +
  "3) Keyin slayd faylini (PPTX, PDF…) shu yerga yuboring — u saytda paydo bo'ladi.\n\n" +
  "Fayl hajmi 20 MB gacha.";

async function getInbox(env, code) {
  const raw = await env.FAYL_KV.get('inbox:' + code);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch (e) { return []; }
}

async function onUpdate(env, upd) {
  const m = upd.message || upd.edited_message;
  if (!m || !m.chat || m.chat.type !== 'private') return; // faqat shaxsiy chat
  const chat = m.chat.id;

  // --- matn: /start <KOD>, KOD, yordam ---
  if (typeof m.text === 'string') {
    const t = m.text.trim();
    const mm = t.match(/^\/start(?:@\w+)?(?:\s+(\S+))?$/i);
    let code = null;
    if (mm && mm[1]) code = mm[1].toUpperCase();
    else if (!mm && CODE_RE.test(t.toUpperCase())) code = t.toUpperCase();
    if (code) {
      if (!CODE_RE.test(code)) { await say(env, chat, "❌ Kod noto'g'ri. Saytdagi 8 belgili kodni tekshiring."); return; }
      await env.FAYL_KV.put('chat:' + chat, code, { expirationTtl: TTL });
      await say(env, chat, "✅ Sayt bilan ulandi (kod: " + code + ").\nEndi slayd yoki boshqa faylni shu yerga yuboring.");
      return;
    }
    await say(env, chat, HELP);
    return;
  }

  // --- fayl / rasm ---
  let file = null;
  if (m.document) {
    file = { file_id: m.document.file_id, name: m.document.file_name || 'fayl', size: m.document.file_size || 0, mime: m.document.mime_type || 'application/octet-stream' };
  } else if (Array.isArray(m.photo) && m.photo.length) {
    const p = m.photo[m.photo.length - 1];
    file = { file_id: p.file_id, name: 'rasm-' + Date.now() + '.jpg', size: p.file_size || 0, mime: 'image/jpeg' };
  }
  if (!file) { await say(env, chat, "Faqat fayl yoki rasm yuboring (hujjat sifatida)."); return; }

  const code = await env.FAYL_KV.get('chat:' + chat);
  if (!code) { await say(env, chat, "Avval saytga ulaning.\n\n" + HELP); return; }
  if (file.size > MAX_BYTES) { await say(env, chat, "❌ Fayl 20 MB dan katta. Kichikroq fayl yuboring yoki saytdagi «Telefon» rejimidan foydalaning."); return; }

  const items = await getInbox(env, code);
  const item = { id: rid(), name: safeName(file.name), size: file.size, mime: file.mime, file_id: file.file_id, ts: Date.now() };
  items.push(item);
  await env.FAYL_KV.put('inbox:' + code, JSON.stringify(items.slice(-MAX_ITEMS)), { expirationTtl: TTL });
  await say(env, chat, "✅ «" + item.name + "» saytga yuborildi.");
}

async function webhook(req, env, ctx) {
  const sec = req.headers.get('X-Telegram-Bot-Api-Secret-Token') || '';
  if (!env.WEBHOOK_SECRET || !timingSafeEqual(sec, env.WEBHOOK_SECRET)) return new Response('forbidden', { status: 403 });
  let upd;
  try { upd = await req.json(); } catch (e) { return new Response('bad request', { status: 400 }); }
  // Telegram qayta yubormasligi uchun doim 200 qaytaramiz
  ctx.waitUntil(onUpdate(env, upd).catch((e) => console.log('update error', e && e.message)));
  return new Response('ok');
}

async function inbox(req, env, code) {
  const cors = corsHeaders(req, env);
  if (!CODE_RE.test(code)) return json({ error: 'bad-code' }, 400, cors);
  const after = Number(new URL(req.url).searchParams.get('after')) || 0;
  const items = (await getInbox(env, code)).filter((x) => x.ts > after)
    .map((x) => ({ id: x.id, name: x.name, size: x.size, mime: x.mime, ts: x.ts }));
  return json({ items }, 200, cors);
}

async function download(req, env, code, id) {
  const cors = corsHeaders(req, env);
  if (!CODE_RE.test(code) || !/^[a-z0-9]{6}$/.test(id)) return new Response('not found', { status: 404, headers: cors });
  const item = (await getInbox(env, code)).find((x) => x.id === id);
  if (!item) return new Response('not found', { status: 404, headers: cors });
  const info = await tg(env, 'getFile', { file_id: item.file_id });
  if (!info.ok || !info.result || !info.result.file_path) return new Response('telegram error', { status: 502, headers: cors });
  const up = await fetch('https://api.telegram.org/file/bot' + env.BOT_TOKEN + '/' + info.result.file_path);
  if (!up.ok) return new Response('telegram error', { status: 502, headers: cors });
  const h = new Headers(cors);
  h.set('Content-Type', item.mime || 'application/octet-stream');
  const len = up.headers.get('Content-Length');
  if (len) h.set('Content-Length', len);
  h.set('Content-Disposition', "inline; filename*=UTF-8''" + encodeURIComponent(item.name));
  h.set('Cache-Control', 'private, max-age=3600');
  h.set('X-Content-Type-Options', 'nosniff');
  return new Response(up.body, { status: 200, headers: h });
}

// Bir martalik sozlash: brauzerda  https://<worker>/setup?key=<WEBHOOK_SECRET>  ochiladi.
async function setup(req, env) {
  const url = new URL(req.url);
  if (!env.WEBHOOK_SECRET || !timingSafeEqual(url.searchParams.get('key') || '', env.WEBHOOK_SECRET)) return new Response('forbidden', { status: 403 });
  const hook = url.origin + '/telegram/webhook';
  const r = await tg(env, 'setWebhook', { url: hook, secret_token: env.WEBHOOK_SECRET, allowed_updates: ['message', 'edited_message'] });
  const me = await tg(env, 'getMe', {});
  return json({ webhook: hook, setWebhook: r, bot: me && me.result && me.result.username });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname;
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req, env) });
    try {
      if (p === '/telegram/webhook' && req.method === 'POST') return await webhook(req, env, ctx);
      if (p === '/setup' && req.method === 'GET') return await setup(req, env);
      let m;
      if (req.method === 'GET' && (m = p.match(/^\/api\/inbox\/([^/]+)$/))) return await inbox(req, env, m[1].toUpperCase());
      if (req.method === 'GET' && (m = p.match(/^\/dl\/([^/]+)\/([^/]+)$/))) return await download(req, env, m[1].toUpperCase(), m[2]);
      if (p === '/') return new Response('Fayl Uzatish Telegram ko\'prigi ishlayapti.', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    } catch (e) {
      return json({ error: 'server' }, 500, corsHeaders(req, env));
    }
    return new Response('not found', { status: 404 });
  }
};

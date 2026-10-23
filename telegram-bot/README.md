# Fayl Uzatish — Telegram bot ulash

Telegram botga slayd (PPTX, PDF…) yuborsangiz, u **Fayl Uzatish** sahifasida paydo bo'ladi.
Bot Cloudflare Worker (bepul) sifatida ishlaydi; fayl Workerda saqlanmaydi, Telegram serveridan oqim bilan olinadi.

```
Telegram bot ──webhook──▶ Worker (KV: kod → fayllar ro'yxati) ◀── sayt har 2.5 s da so'raydi
```

## Xavfsizlik (muhim)
- **Bot tokenini hech kimga, hech qayerga (chat, GitHub, kod) yozmang.** Faqat `wrangler secret put` orqali kiritiladi.
- Token oshkor bo'lsa: BotFather → `/revoke` → yangi token → `wrangler secret put BOT_TOKEN`.
- Har xona uchun tasodifiy 8 belgili kod (≈ 10¹² variant) yaratiladi; fayllar 24 soatdan keyin o'chadi.

## 1. Bot yaratish
1. Telegramda **@BotFather** → `/newbot` → nom va username bering (masalan `fayl_uzatish_bot`).
2. BotFather bergan **tokenni** saqlab qo'ying (hech kimga ko'rsatmang).

## 2. Workerni joylash (kompyuteringizda, bir marta)
Cloudflare'da bepul akkaunt oching (https://dash.cloudflare.com), Node.js o'rnatilgan bo'lsin.

```bash
cd telegram-bot
npm install -g wrangler
wrangler login

wrangler kv namespace create FAYL_KV      # chiqqan id ni wrangler.toml dagi BU_YERGA_KV_ID_NI_QOYING o'rniga qo'ying
wrangler secret put BOT_TOKEN             # BotFather tokenini kiriting
wrangler secret put WEBHOOK_SECRET        # o'zingiz o'ylab topgan uzun matn (harf, raqam, _ va -)
wrangler deploy                           # oxirida https://fayl-uzatish-bot.<nom>.workers.dev chiqadi
```

`wrangler.toml` ichidagi `ALLOWED_ORIGIN` — saytingiz manzili (`https://aziyz123.github.io`).
Bir nechta bo'lsa vergul bilan yozing.

## 3. Webhookni ulash
Brauzerda bir marta oching (WEBHOOK_SECRET ni o'zingiznikiga almashtiring):

```
https://fayl-uzatish-bot.<nom>.workers.dev/setup?key=WEBHOOK_SECRET
```
Javobda `"setWebhook":{"ok":true}` va bot username'i chiqishi kerak.

## 4. Saytni ulash
`fayl-telegram.js` boshidagi ikki qiymatni to'ldiring va commit qiling:

```js
window.FAYL_TG = Object.assign({
  api: 'https://fayl-uzatish-bot.<nom>.workers.dev',
  bot: 'fayl_uzatish_bot'
}, window.FAYL_TG || {});
```
Shundan keyin sahifada «Xona ochish» bosilganda xona kodi ostida **«📨 Telegram orqali yuborish»** bloki (QR + kod) chiqadi.

## Ishlatish
1. Kompyuterda `fayl-uzatish.html` → **Xona ochish**.
2. Telefonda Telegram QR ni skanerlang (yoki botga 8 belgili kodni yozing) → **Start**.
3. Slayd faylini botga **fayl (hujjat)** sifatida yuboring → saytda paydo bo'ladi, «Yuklab olish» bilan oling.

## Cheklovlar
- Telegram Bot API fayl hajmi: **20 MB** gacha (kattaroq bo'lsa, bot xabar beradi).
- Cloudflare KV bepul tarifi: kuniga 1000 yozuv (har fayl uchun ~2) — shaxsiy foydalanish uchun yetarli.
- Fayllar ro'yxati va chat bog'lanishi 24 soat saqlanadi.
- Bot faqat shaxsiy (private) chatlarda ishlaydi.

## Tekshirish
`curl https://<worker>/` → «ishlayapti». Webhook holati: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo` (tokenni faqat o'z kompyuteringizda ishlating).

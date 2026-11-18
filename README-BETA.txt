VIRTUAL MUSEUM BETA — O‘RNATISH VA SINOV YO‘RIQNOMASI
=====================================================

Bu BETA versiya asosiy Virtual muzey (muzey.html) dan mustaqil ishlaydi.
Asosiy fayllarga (index.html, muzey.html, muzey-app.js, muzey-registon.js)
tegmaydi.

1) FAYLLAR
----------
muzey-beta.html
muzey-beta.css
muzey-beta.js
muzey-beta-config.js
assets/demo-panorama.svg
README-BETA.txt

2) OCHISH
---------
https://aziyz123.github.io/muzey-beta.html

3) ASOSIY FUNKSIYALAR
--------------------
- 360° panorama (Pannellum)
- Sensor / giroskop (mobil)
- Touch drag
- VR split-screen (BETA)
- Zallar orasida almashish
- Eksponat paneli
- Ikkinchi telefon uchun QR + xona kodi
- Supabase Realtime orqali masofaviy boshqaruv (sozlangandan keyin)

4) VR
-----
HTTPS orqali ochilishi shart.
VR tugmasi telefonda ko'rinishni to'liq ekranga o'tkazadi va giroskopdan
foydalanadi. Bu dastlabki BETA stereoskopik split-screen emas: haqiqiy ikki
ko'zli VR uchun keyingi iteratsiyada chap/o'ng ko'rinish alohida sozlanadi.
Telefon ko'zoynakka joylashtirilganda ekran orientatsiyasi va linza oralig'i
qurilmaga mos sinovdan o'tkazilishi kerak.

5) IKKINCHI TELEFONNI ULASH (SUPABASE)
--------------------------------------
Masofaviy boshqaruv uchun Supabase Realtime ishlatiladi. Bu loyiha tashqi
backend konfiguratsiyasini talab qiladi.

A. https://supabase.com da loyiha yarating.
B. Project Settings -> API dan Project URL va anon/public key oling.
C. muzey-beta-config.js ichiga kiriting:
   SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
   SUPABASE_ANON_KEY: "YOUR_ANON_PUBLIC_KEY",
D. Supabase SQL Editor'da sinov uchun quyidagi policy'larni bajaring:

   create policy "beta anon read"
   on realtime.messages for select
   to anon
   using (true);

   create policy "beta anon insert"
   on realtime.messages for insert
   to anon
   with check (true);

E. Supabase Realtime/ Broadcast ruxsatlari yoqilganini tekshiring.
F. Ikkala telefon ham internetga ulangan bo'lsin.
G. Birinchi telefonda muzeyni oching -> "Ikkinchi telefonni ulash" -> QR.
   Ikkinchi telefonda QR'ni skanerlang. Agar kamera ishlamasa, havolani
   nusxalab ikkinchi telefonda oching.

XAVFSIZLIK:
Yuqoridagi anon policy'lar faqat vaqtinchalik beta sinov uchun juda ochiq
ruxsat beradi. Ommaviy ishga tushirishdan oldin xonaga maxsus token, vaqtinchalik
kod, rate limit va RLS cheklovlari qo'shing. Anon key maxfiy parol emas, lekin
service_role key'ni hech qachon brauzer fayliga joylamang.

6) MUHIM CHEKLOVLAR
-------------------
- Demo panorama faqat texnik sinov uchun.
- Eksponat matnlari namuna; ilmiy manbalar bilan tasdiqlab to'ldiring.
- BETA versiya asosiy muzeyning muzey-app.js yoki muzey-registon.js fayllariga
  tegmaydi.
- Hozirgi masofaviy joystick buyruqlari panorama ko'rish yo'nalishini o'zgartiradi.
  Yurish navigatsiyasi va zallararo haqiqiy 360 panorama o'tishlari keyingi
  bosqichda qo'shiladi.
- VR ko'zoynakda sinashdan oldin telefonni xavfsiz mahkamlang va uzoq vaqt
  uzluksiz ishlatmasdan qisqa sinov qiling.

7) QAYTA OLIB TASHLASH
----------------------
BETA ni o'chirish uchun faqat quyidagi yangi fayllarni o'chiring:
muzey-beta.html
muzey-beta.css
muzey-beta.js
muzey-beta-config.js
assets/demo-panorama.svg
Asosiy muzey fayllariga ta'sir qilmaydi.

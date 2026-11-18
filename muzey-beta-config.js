/*
  BETA sozlamalari.
  Ikki telefon orasida real vaqt boshqaruvi uchun Supabase Realtime kerak.
  1) https://supabase.com saytida loyiha yarating.
  2) Project Settings -> API dan Project URL va anon/public key ni oling.
  3) Quyidagi qiymatlarni kiriting.
  4) Supabase SQL Editor'da README-BETA.txt dagi policy ko'rsatmasini bajaring.
*/
window.MUZEY_BETA_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
  // Haqiqiy 2:1 equirectangular 360° panorama manzili. Bo'sh qoldirilsa demo panorama ishlatiladi.
  PANORAMA_URL: "assets/demo-panorama.svg",
  // Ishlatish uchun bitta maxsus sinov xonasi nomi
  DEFAULT_HALL: "Registon — bosh zal"
};

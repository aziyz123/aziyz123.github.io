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
  // Haqiqiy 2:1 equirectangular 360° panorama (Wikimedia CC BY-SA).
  // Keyinroq o'z 360° suratlaringizni qo'yishingiz mumkin.
  PANORAMA_URL: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Rheingauer_Dom%2C_Geisenheim%2C_360_Panorama_%28Equirectangular_projection%29.jpg/1280px-Rheingauer_Dom%2C_Geisenheim%2C_360_Panorama_%28Equirectangular_projection%29.jpg",
  DEFAULT_HALL: "Tarixiy zal — bosh ko'rinish"
};

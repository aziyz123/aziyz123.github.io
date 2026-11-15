// Aqlli takrorlash: AI uchun tayyor so'rov (mavzu yoki manba bo'yicha, chatga yoki fayl ko'rinishida)
(function(){
  var ex = {
    mc: "1. O'zbekiston poytaxti qaysi shahar?\nA) Samarqand\nB) Buxoro\nC) Toshkent\nD) Andijon\nJavob: C\n\n2. Registon maydoni qaysi shaharda joylashgan?\nA) Buxoro\nB) Samarqand\nC) Xiva\nD) Termiz\nJavob: B",
    open: "1. Amir Temur qaysi yilda tug'ilgan?\nJavob: 1336-yilda\n\n2. Samarqanddagi mashhur uch madrasali maydon qanday nomlanadi?\nJavob: Registon",
    mix: "1. O'zbekiston poytaxti qaysi shahar?\nA) Samarqand\nB) Buxoro\nC) Toshkent\nD) Andijon\nJavob: C\n\n2. Amir Temur qaysi yilda tug'ilgan?\nJavob: 1336-yilda"
  };
  function build(o){
    var n = Math.max(3, Math.min(100, parseInt(o.count) || 10));
    var src = o.src === 'file'
      ? "Savollarni men senga YUBORGAN MANBA (biriktirilgan fayl, rasm yoki matn) asosida tuz. Faqat shu manbadagi ma'lumotga tayan, o'zingdan ma'lumot qo'shma. Manba yuborilmagan bo'lsa, avval undan so'ra."
      : "Mavzu: \"" + (o.topic.trim() || "[MAVZUNI SHU YERGA YOZING]") + "\". Ma'lumotni ishonchli manbalardan olib tekshir (imkoni bo'lsa internetda qidir).";
    var typeRule = o.type === 'open' ? "Hamma savol OCHIQ bo'lsin: variantsiz, javobi 1–5 so'zli qisqa va aniq."
      : o.type === 'mix' ? "Savollarning taxminan 70% i VARIANTLI (A, B, C, D), 30% i OCHIQ (variantsiz, javobi 1–5 so'zli qisqa) bo'lsin."
      : "Hamma savol VARIANTLI bo'lsin: aynan 4 ta variant (A, B, C, D), faqat bittasi to'g'ri.";
    var diff = { aralash: "aralash qiyinlikda (30% oson, 50% o'rta, 20% qiyin)", oson: "oson", orta: "o'rta qiyinlikda", qiyin: "qiyin" }[o.diff] || "";
    var outRule = o.out === 'file'
      ? "CHIQISH: tayyor savollarni \"testlar.txt\" nomli oddiy matn (.txt) FAYL qilib yarat va yuklab olish uchun ber. Fayl yarata olmasang, savollarning o'zini chatga yoz."
      : "CHIQISH: faqat tayyor savollarning o'zini chatga yoz.";
    return "Sen o'qituvchi uchun takrorlash testlari tuzadigan yordamchisan.\n\n" + src +
      "\n\n" + n + " ta savol tayyorla" + (diff ? ", " + diff : "") + (o.level ? ", " + o.level : "") + ". " + typeRule +
      "\n\nTil: o'zbek (lotin yozuvi).\n\nQAT'IY FORMAT:\n" +
      "1) Har savol \"1.\", \"2.\", \"3.\" ... tartib raqami bilan boshlansin. Oxirgi savol raqami " + n + " bo'lsin.\n" +
      "2) Variantli savolda 4 qator: \"A) ...\", \"B) ...\", \"C) ...\", \"D) ...\", keyin alohida qatorda \"Javob: \" va faqat to'g'ri harf (masalan: Javob: C).\n" +
      "3) Ochiq savolda variant yo'q, faqat \"Javob: \" va qisqa javob.\n" +
      "4) Savollar orasida albatta BITTA BO'SH QATOR bo'lsin.\n" +
      "5) Savol aniq, bitta jumla; faqat bitta to'g'ri javob; noto'g'ri variantlar ishonarli. \"Hammasi to'g'ri\" yoki \"Hech biri\" deb yozma.\n" +
      "6) To'g'ri javob harflari A, B, C, D orasida teng taqsimlansin.\n" +
      "7) Savollar takrorlanmasin. Sana, raqam yoki ismga ishonching komil bo'lmasa, o'sha savolni tashla.\n" +
      "8) Bezak qo'shma: **, #, nuqtali ro'yxat, emoji, havola va izoh qatori bo'lmasin. Salomlashish yoki tushuntirish yozma.\n\n" +
      outRule + "\n\nNamuna:\n" + ex[o.type || 'mc'];
  }
  var card = document.createElement('div'); card.className = 'card';
  card.innerHTML =
    '<h2>🤖 AI bilan test yaratish</h2>' +
    '<div class="hint">So\'rovni nusxalab ChatGPT, Gemini yoki Claude\'ga qo\'ying. Natijani pastdagi "Savollar" maydoniga qo\'ying yoki AI bergan faylni "Fayldan yuklash" orqali oching.</div>' +
    '<label for="apSrc">Savollar nimaga asoslansin?</label>' +
    '<select id="apSrc" style="width:100%;max-width:100%;"><option value="topic">Mavzu bo\'yicha (AI o\'zi manba topadi)</option><option value="file">Men manbani AI\'ga o\'zim yuboraman (PDF, rasm, matn)</option></select>' +
    '<div id="apTopicBox"><label for="apTopic">Mavzu</label><input type="text" id="apTopic" placeholder="Masalan: Amir Temur yurishlari"></div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;">' +
      '<div style="flex:1;min-width:110px;"><label for="apCount">Savollar soni</label><input type="number" id="apCount" min="3" max="100" value="10"></div>' +
      '<div style="flex:2;min-width:170px;"><label for="apType">Turi</label><select id="apType"><option value="mc">Variantli (A–D)</option><option value="mix">Aralash</option><option value="open">Ochiq (javobni yozish)</option></select></div>' +
      '<div style="flex:1;min-width:140px;"><label for="apDiff">Qiyinlik</label><select id="apDiff"><option value="aralash">Aralash</option><option value="oson">Oson</option><option value="orta">O\'rta</option><option value="qiyin">Qiyin</option></select></div>' +
    '</div>' +
    '<label for="apLvl">Daraja</label><select id="apLvl"><option value="">Oddiy</option><option value="boshlang\'ich sinf o\'quvchilari uchun, juda sodda tilda">Boshlang\'ich sinf</option><option value="o\'rta maktab o\'quvchilari uchun">O\'rta maktab</option><option value="kollej yoki litsey talabalari uchun">Kollej / litsey</option></select>' +
    '<label for="apOut">Natijani qanday olay?</label><select id="apOut"><option value="text">Chatga matn qilib yozsin</option><option value="file">Fayl (.txt) qilib bersin, men yuklab olaman</option></select>' +
    '<textarea id="apResult" readonly style="min-height:150px;margin-top:12px;font-size:12px;"></textarea>' +
    '<button class="btn-primary" id="apCopy" type="button" style="margin-top:10px;">📋 So\'rovni nusxalash</button>' +
    '<div class="file-status" id="apStatus"></div>';
  var cards = document.querySelectorAll('.card'), target = null;
  cards.forEach(function(c){ var h = c.querySelector('h2'); if(h && /Yangi to'plam yaratish/.test(h.textContent)) target = c; });
  if(target) target.parentNode.insertBefore(card, target); else document.body.appendChild(card);
  var $ = function(id){ return document.getElementById(id); };
  function upd(){
    $('apTopicBox').style.display = $('apSrc').value === 'file' ? 'none' : '';
    $('apResult').value = build({ src: $('apSrc').value, topic: $('apTopic').value, count: $('apCount').value, type: $('apType').value, diff: $('apDiff').value, level: $('apLvl').value, out: $('apOut').value });
  }
  ['apSrc','apTopic','apCount','apType','apDiff','apLvl','apOut'].forEach(function(id){ $(id).addEventListener('input', upd); $(id).addEventListener('change', upd); });
  $('apCopy').addEventListener('click', function(){
    var t = $('apResult').value, st = $('apStatus');
    function ok(){ st.className = 'file-status ok'; st.textContent = '✓ Nusxalandi. AI\'ga yopishtiring' + ($('apSrc').value === 'file' ? ' va manba faylini biriktiring.' : '.'); }
    function fb(){ $('apResult').removeAttribute('readonly'); $('apResult').select(); try{ document.execCommand('copy'); ok(); }catch(e){ st.className = 'file-status err'; st.textContent = 'Nusxalab bo\'lmadi — matnni qo\'lda belgilab nusxalang.'; } $('apResult').setAttribute('readonly', ''); }
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, fb); else fb();
  });
  upd();
})();

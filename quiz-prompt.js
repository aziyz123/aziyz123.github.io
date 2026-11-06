/*
 * Bilim Kechasi uchun AI so'rovi (prompt) yasovchi.
 * Ishlatish: QuizPrompt.mount(document.getElementById('joy'));
 * AI javobi "SAVOL:" tegli, Bilim Kechasi o'qiy oladigan formatda bo'ladi.
 */
(function () {
  'use strict';
  function el(tag, css, html) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (html) e.innerHTML = html; return e; }
  var FIELD = 'padding:10px;border-radius:8px;border:1px solid rgba(127,127,127,.45);background:rgba(127,127,127,.14);color:inherit;font:inherit;font-size:13px;';

  function build(o) {
    var topic = (o.topic || '').trim() || '[MAVZUNI SHU YERGA YOZING]';
    var n = Math.max(3, Math.min(60, parseInt(o.count) || 10));
    var lvl = o.level ? (' Savollar ' + o.level + ' bo\'lsin.') : '';
    var diff = { aralash: "aralash qiyinlikda (taxminan 30% oson, 50% o'rta, 20% qiyin)", oson: 'oson', orta: "o'rta qiyinlikda", qiyin: 'qiyin' }[o.diff] || '';
    var typeRule, example;
    if (o.type === 'open') {
      typeRule = "Hamma savol OCHIQ turda bo'lsin: variantsiz, javobi 1-5 so'zli qisqa va aniq (ism, sana, joy nomi, atama).";
      example = "SAVOL: Amir Temur qaysi yilda tug'ilgan?\nJavob: 1336-yilda\n\nSAVOL: Samarqanddagi uchta madrasali mashhur maydon qanday nomlanadi?\nJavob: Registon";
    } else if (o.type === 'mix') {
      typeRule = "Savollarning taxminan 80% i VARIANTLI (A, B, C, D), 20% i OCHIQ (variantsiz, javobi 1-5 so'zli qisqa) bo'lsin.";
      example = "SAVOL: O'zbekiston poytaxti qaysi shahar?\nA) Samarqand\nB) Buxoro\nC) Toshkent\nD) Andijon\nJavob: C\n\nSAVOL: Amir Temur qaysi yilda tug'ilgan?\nJavob: 1336-yilda";
    } else {
      typeRule = "Hamma savol VARIANTLI bo'lsin: aynan 4 ta variant (A, B, C, D), faqat bittasi to'g'ri.";
      example = "SAVOL: O'zbekiston poytaxti qaysi shahar?\nA) Samarqand\nB) Buxoro\nC) Toshkent\nD) Andijon\nJavob: C\n\nSAVOL: Registon maydoni qaysi shaharda joylashgan?\nA) Buxoro\nB) Samarqand\nC) Xiva\nD) Termiz\nJavob: B";
    }
    return "Sen o'qituvchi uchun viktorina (Bilim Kechasi) savollarini tayyorlaydigan yordamchisan. Mavzu: \"" + topic + "\"." + lvl + "\n\n" +
      n + " ta savol tayyorla" + (diff ? ", " + diff : "") + ". " + typeRule + "\n\n" +
      "Javobni o'zbek tilida (lotin yozuvida) va QAT'IY QUYIDAGI FORMATDA yoz:\n" +
      "1) Har savol ALOHIDA QATORDA \"SAVOL: \" so'zi bilan boshlansin va savol matni shu qatorda tugasin.\n" +
      "2) Variantli savolda keyingi 4 qator: \"A) ...\", \"B) ...\", \"C) ...\", \"D) ...\". Oxirida alohida qatorda \"Javob: \" va FAQAT to'g'ri variant harfi (masalan: Javob: C).\n" +
      "3) Ochiq savolda variant bo'lmaydi, faqat \"Javob: \" va qisqa javob.\n" +
      "4) Savollar orasida BITTA BO'SH QATOR qoldir.\n" +
      "5) Savol 1 ta aniq jumla, 20 so'zdan oshmasin. Faqat bitta to'g'ri javob bo'lsin, ikki xil talqin qilinadigan savol yozma.\n" +
      "6) Noto'g'ri variantlar ishonarli va uzunligi to'g'ri variantga yaqin bo'lsin. \"Yuqoridagilarning hammasi\" yoki \"Hech biri\" variantini ishlatma.\n" +
      "7) To'g'ri javob harflari (A, B, C, D) orasida teng taqsimlansin, ko'pchiligi bitta harfga tushmasin.\n" +
      "8) Savollar takrorlanmasin va turli jihatlarni qamrasin.\n" +
      "9) Faqat tekshirilgan, aniq ma'lumot yoz. Sana, raqam yoki ismga ishonching komil bo'lmasa, o'sha savolni tashlab, boshqasini yoz.\n" +
      "10) Hech qanday bezak qo'shma: # belgisi, qalin yoki qiyshiq yozuv (** va *), nuqtali ro'yxat, jadval, emoji, havola bo'lmasin. Savollarni raqamlama.\n" +
      "11) Faqat tayyor savollarning o'zini ber. Oldidan va keyinidan tushuntirish, izoh yoki salomlashish yozma.\n\n" +
      "Namuna format:\n" + example;
  }

  function mount(host) {
    if (!host || host.__qp) return; host.__qp = true;
    var wrap = el('div', 'margin-top:10px;');
    wrap.appendChild(el('div', 'font-weight:700;font-size:14px;', "🤖 AI bilan savol yaratish (tayyor so'rov)"));
    wrap.appendChild(el('div', 'font-size:12px;opacity:.75;margin:4px 0 8px;line-height:1.5;', "Mavzuni yozing, so'rovni nusxalab ChatGPT, Gemini yoki Claude'ga qo'ying. U sizga tayyor savollar beradi, ularni savollar maydoniga qo'yasiz."));
    var row = el('div', 'display:flex;gap:8px;flex-wrap:wrap;');
    var topic = el('input', FIELD + 'flex:2;min-width:180px;'); topic.type = 'text'; topic.placeholder = 'Mavzu, masalan: Amir Temur yurishlari';
    var count = el('input', FIELD + 'width:80px;'); count.type = 'number'; count.min = 3; count.max = 60; count.value = 10; count.title = 'Savollar soni';
    var type = el('select', FIELD); type.innerHTML = '<option value="mc">Variantli (A–D)</option><option value="mix">Aralash (variantli + ochiq)</option><option value="open">Ochiq (javobni yozish)</option>';
    var diff = el('select', FIELD); diff.innerHTML = '<option value="aralash">Qiyinlik: aralash</option><option value="oson">Oson</option><option value="orta">O\'rta</option><option value="qiyin">Qiyin</option>';
    var lvl = el('select', FIELD); lvl.innerHTML = '<option value="">Daraja: oddiy</option><option value="boshlang\'ich sinf o\'quvchilari uchun, juda sodda tilda">Boshlang\'ich sinf</option><option value="o\'rta maktab o\'quvchilari uchun">O\'rta maktab</option><option value="yuqori sinf va litsey o\'quvchilari uchun">Yuqori sinf</option><option value="talabalar uchun, ilmiyroq tilda">Talabalar</option>';
    [topic, count, type, diff, lvl].forEach(function (x) { row.appendChild(x); });
    wrap.appendChild(row);
    var out = el('textarea', FIELD + 'width:100%;height:140px;margin-top:8px;font-size:12px;'); out.readOnly = true;
    wrap.appendChild(out);
    var btn = el('button', 'margin-top:6px;border:none;background:transparent;color:inherit;text-decoration:underline;cursor:pointer;font-size:13px;font-weight:700;', "📋 So'rovni nusxalash");
    btn.type = 'button'; wrap.appendChild(btn);
    function upd() { out.value = build({ topic: topic.value, count: count.value, type: type.value, diff: diff.value, level: lvl.value }); }
    [topic, count, type, diff, lvl].forEach(function (x) { x.addEventListener('input', upd); x.addEventListener('change', upd); });
    upd();
    btn.addEventListener('click', function () {
      function done() { btn.textContent = '✓ Nusxalandi'; setTimeout(function () { btn.textContent = "📋 So'rovni nusxalash"; }, 1800); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.value).then(done, function () { out.select(); document.execCommand('copy'); done(); });
      else { out.select(); document.execCommand('copy'); done(); }
    });
    host.appendChild(wrap);
  }
  window.QuizPrompt = { mount: mount, build: build };
})();

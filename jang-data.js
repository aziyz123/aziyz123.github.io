const DEMO = {
  title: "ANQARA JANGI", year: "1402-yil, 20-iyul", topic: "TEMURIYLAR VA USMONIYLAR",
  terrain: "daryo",
  features: [
    { type: "river", pts: [[0,66],[22,60],[40,64],[60,58],[80,62],[100,56]], name: "Chubuk daryosi" },
    { type: "mountain", x: 82, y: 14, r: 12 }, { type: "mountain", x: 66, y: 10, r: 9 },
    { type: "place", kind: "city", name: "Anqara", x: 90, y: 40 }, { type: "hill", x: 20, y: 55, r: 14 }, { type: "hill", x: 70, y: 70, r: 12 }
  ],
  sides: [
    { name: "Temuriylar", color: "#C62828", commander: "Amir Temur",
      groups: [
        { id: "t1", name: "Markaz", kind: "piyoda", weapon: "nayza, qilich", count: 40000, x: 46, y: 80, commander: true },
        { id: "t2", name: "O'ng qanot (otliq)", kind: "otliq", weapon: "kamon, qilich", count: 35000, x: 76, y: 78 },
        { id: "t3", name: "Chap qanot (otliq)", kind: "otliq", weapon: "kamon, qilich", count: 35000, x: 16, y: 78 },
        { id: "t4", name: "Zaxira", kind: "kamonchi", weapon: "kamon", count: 20000, x: 46, y: 92 },
        { id: "t5", name: "Jang fillari", kind: "fil", count: 8, x: 60, y: 88 }
      ] },
    { name: "Usmoniylar", color: "#2E9E4F", commander: "Yildirim Boyazid",
      groups: [
        { id: "u1", name: "Markaz (yanichar)", kind: "piyoda", weapon: "kamon, qilich", count: 25000, x: 46, y: 34, commander: true },
        { id: "u2", name: "Serb otliqlari", kind: "otliq", weapon: "nayza, qilich", count: 10000, x: 22, y: 30 },
        { id: "u3", name: "Anadolu beklari qo'shini", kind: "otliq", weapon: "kamon, qilich", count: 40000, x: 74, y: 30 },
        { id: "u4", name: "Kamonchilar", kind: "kamonchi", weapon: "kamon", count: 10000, x: 46, y: 20 }
      ] }
  ],
  stages: [
    { text: "Temur qo'shini Anqara yaqinida joylashadi, daryo suvi Temur nazoratida.", cam: [50,55,0.8], dur: 5 },
    { text: "Usmoniylar suvsizlikdan charchab, tekislikka yurishga majbur bo'ladi.", cam: [50,48,1], dur: 5,
      moves: [{ g: "u1", to: [46,46] }, { g: "u2", to: [22,44] }, { g: "u3", to: [74,44] }, { g: "u4", to: [46,32] }] },
    { text: "Temur otliqlari ikki qanotdan hujumga o'tadi.", cam: [50,56,1.1], dur: 6,
      moves: [{ g: "t2", to: [76,52] }, { g: "t3", to: [16,52] }, { g: "t1", to: [46,62] }], arrows: true },
    { text: "Anadolu beklarining tatar otliqlari Temur tomoniga o'tib ketadi.", cam: [74,48,1.5], dur: 5,
      defect: [{ g: "u3", to: 0 }], moves: [{ g: "u3", to: [70,52] }] },
    { text: "Serb otliqlari Stefan Lazarevich boshchiligida qattiq qarshilik ko'rsatadi.", cam: [24,48,1.5], dur: 6,
      moves: [{ g: "t3", to: [24,46] }], losses: { u2: 0.3, t3: 0.8 } },
    { text: "Markaz qurshovga olinadi, yanicharlar oxirgi nafasgacha jang qiladi.", cam: [46,46,1.4], dur: 7,
      moves: [{ g: "t2", to: [52,40] }, { g: "t3", to: [40,40] }, { g: "t1", to: [46,44] }], losses: { u1: 0.08, u4: 0.1 } },
    { text: "Yildirim Boyazid asirga olinadi.", cam: [46,44,1.8], dur: 5, losses: { u1: 0, u4: 0 } }
  ],
  result: "Temur g'alaba qozondi. Sulton Boyazid asir tushdi."
};

const PYR = {
  title: "EHROMLAR JANGI", year: "1798-yil, 21-iyul", topic: "NAPOLEON MISRDA", terrain: "daryo",
  features: [
    { type: "river", name: "Nil", pts: [[90,0],[92,25],[88,50],[91,75],[89,100]] },
    { type: "mountain", x: 10, y: 96, r: 6 }, { type: "mountain", x: 26, y: 98, r: 5 },
    { type: "place", kind: "village", name: "Imbaba", x: 82, y: 82 }, { type: "place", kind: "fort", name: "Bikatil", x: 10, y: 80 }, { type: "hill", x: 40, y: 50, r: 14 }
  ],
  sides: [
    { name: "Fransiya", color: "#2F5DA8", commander: "Napoleon Bonapart",
      groups: [
        { id: "f1", name: "Desaix bo'linmasi", kind: "miltiqchi", weapon: "miltiq, shtik", count: 4500, x: 16, y: 22 },
        { id: "f2", name: "Reynier bo'linmasi", kind: "miltiqchi", weapon: "miltiq, shtik", count: 4500, x: 32, y: 20 },
        { id: "f3", name: "Dugua bo'linmasi", kind: "miltiqchi", weapon: "miltiq, shtik", count: 4500, x: 48, y: 20 },
        { id: "f4", name: "Vial bo'linmasi", kind: "miltiqchi", weapon: "miltiq, shtik", count: 4000, x: 62, y: 20 },
        { id: "f5", name: "Bon bo'linmasi", kind: "miltiqchi", weapon: "miltiq, shtik", count: 4500, x: 76, y: 22 },
        { id: "fa", name: "Fransuz to'plari (kvadrat burchaklarida)", kind: "top", weapon: "dala to'pi", count: 6, x: 46, y: 24 },
        { id: "fc", name: "Otliq (kvadratlar orasida)", kind: "otliq", weapon: "qilich, to'pponcha", count: 3000, x: 46, y: 10, commander: true }
      ] },
    { name: "Mamluklar", color: "#D8A21E", commander: "Murod bey",
      groups: [
        { id: "m1", name: "Mamluk otliqlari (chap)", kind: "otliq", weapon: "qilich, nayza, to'pponcha", count: 3000, x: 28, y: 66 },
        { id: "m2", name: "Mamluk otliqlari (markaz)", kind: "otliq", weapon: "qilich, nayza, to'pponcha", count: 3000, x: 50, y: 66, commander: true },
        { id: "mg", name: "Imbaba garnizoni", kind: "piyoda", weapon: "qilich, eski miltiq", count: 10000, x: 78, y: 76 },
        { id: "mt", name: "Imbaba mudofaa to'plari", kind: "top", weapon: "qal'a to'pi", count: 5, x: 74, y: 80 },
        { id: "ml", name: "Bikatil piyodalari", kind: "piyoda", weapon: "qilich, nayza", count: 5000, x: 12, y: 72 }
      ] }
  ],
  stages: [
    { text: "Napoleon Nil bo'yida, Imbaba qishlog'i yaqinida Murod bey qo'shiniga yetib keladi.", cam: [50,56,0.8], dur: 5 },
    { text: "Fransuzlar 5 ta bo'sh to'rtburchak (kvadrat) saf tuzadi: ichida otliq va yuk, burchaklarda to'p.", cam: [48,34,1.1], dur: 6,
      moves: [{ g: "f1", to: [16,30] }, { g: "f2", to: [32,28] }, { g: "f3", to: [48,28] }, { g: "f4", to: [62,28] }, { g: "f5", to: [76,30] }, { g: "fc", to: [46,18] }, { g: "fa", to: [46,34] }] },
    { text: "Mamluk otliqlari kvadratlarga qayta-qayta hujum qiladi.", cam: [46,42,1.3], dur: 6, arrows: true,
      moves: [{ g: "m1", to: [30,40] }, { g: "m2", to: [52,38] }] },
    { text: "Miltiq va to'p o'qi hujumni qaytaradi — otliq katta talafot ko'radi.", cam: [44,38,1.6], dur: 6,
      losses: { m1: 0.45, m2: 0.45 } },
    { text: "Ayyub bey boshchiligidagi umumiy hujum ham muvaffaqiyatsiz tugaydi.", cam: [40,38,1.5], dur: 5,
      moves: [{ g: "m1", to: [24,36] }, { g: "m2", to: [44,36] }], losses: { m1: 0.25, m2: 0.3 } },
    { text: "Bon bo'linmasi ustun bo'lib hujum qilib, Imbaba qishlog'ini egallaydi.", cam: [72,62,1.6], dur: 6,
      moves: [{ g: "f5", to: [76,66] }, { g: "f4", to: [64,62] }, { g: "fa", to: [66,50] }], losses: { mg: 0.4, mt: 0.3 }, arrows: true },
    { text: "Qochganlarning ko'pi Nilda cho'kadi. Yarador Murod bey Yuqori Misrga chekinadi.", cam: [70,66,1.4], dur: 6,
      losses: { mg: 0.12, ml: 0.35, m1: 0.2, m2: 0.25, mt: 0 } }
  ],
  result: "Fransiya g'alaba qozondi (~300 talafot); mamluklar taxminan 10 ming talafot ko'rdi. 24-iyulda Qohira egallandi.",
  note: "Manbalarda qo'shin soni farq qiladi: fransuzlar ~20–25 ming, mamluk-usmonli qo'shin 21–54 ming (animatsiyada o'rta variant olindi). To'plar soni shartli (belgi sifatida).",
  sources: ["https://en.wikipedia.org/wiki/Battle_of_the_Pyramids", "https://napoleonguide.com/battle_pyramids.htm"]
};
DEMO.note = "Manbalarda qo'shin soni farq qiladi; raqamlar taxminiy, fillar soni shartli. XV asr boshida to'p va miltiq jangning hal qiluvchi quroli emas edi — asosiy qurol kamon, qilich va nayza. Darslikka solishtiring.";
const LIB = { anqara: DEMO, ehromlar: PYR };

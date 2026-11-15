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
      moves: [{ g: "t2", to: [70,68] }, { g: "t3", to: [22,68] }] },
    { text: "Yanichar va Serb otliqlari qattiq qarshilik ko'rsatadi, ammo Temur fillari va zaxira hujum qiladi.", cam: [50,50,1.2], dur: 7 },
    { text: "Boyazid asir olinadi, Usmoniylar mag'lub bo'ladi.", cam: [50,48,1], dur: 5 }
  ],
  result: "Amir Temur g'olib bo'ldi. Boyazid asir olinadi.",
  sources: ["Zafarnoma", "Ibn Arabshoh", "Temuriylar dastliklari"]
};

const KUNDUZCHA = {
  title: "KUNDUZCHA JANGI", year: "1391-yil, iyun", topic: "TEMUR VA TO'XTAMISH",
  terrain: "tekislik",
  features: [
    { type: "river", pts: [[10,40],[30,45],[50,42],[70,48],[90,44]], name: "Kunduzcha (Kondurcha)" },
    { type: "hill", x: 25, y: 70, r: 12 }, { type: "hill", x: 75, y: 25, r: 10 },
    { type: "place", kind: "camp", name: "Temur qarorgohi", x: 50, y: 85 }
  ],
  sides: [
    { name: "Temuriylar", color: "#C62828", commander: "Amir Temur",
      groups: [
        { id: "t1", name: "Markaz", kind: "piyoda", weapon: "nayza, qilich", count: 50000, x: 48, y: 78, commander: true },
        { id: "t2", name: "O'ng qanot", kind: "otliq", weapon: "kamon, qilich", count: 45000, x: 75, y: 72 },
        { id: "t3", name: "Chap qanot", kind: "otliq", weapon: "kamon, qilich", count: 45000, x: 22, y: 72 },
        { id: "t4", name: "Zaxira otliqlar", kind: "otliq", count: 30000, x: 50, y: 90 }
      ] },
    { name: "Oltin O'rda", color: "#5D4037", commander: "To'xtamishxon",
      groups: [
        { id: "o1", name: "Markaz", kind: "otliq", weapon: "kamon, qilich", count: 40000, x: 48, y: 28, commander: true },
        { id: "o2", name: "O'ng qanot", kind: "otliq", count: 35000, x: 22, y: 32 },
        { id: "o3", name: "Chap qanot", kind: "otliq", count: 35000, x: 75, y: 32 },
        { id: "o4", name: "Kamonchilar", kind: "kamonchi", count: 20000, x: 48, y: 18 }
      ] }
  ],
  stages: [
    { text: "Temur qo'shini 2500 km yurib, Kunduzcha daryosi yonida To'xtamish bilan uchrashadi.", cam: [50,55,0.9], dur: 5 },
    { text: "Ikki tomon jangga tayyorlanadi. Temur qo'shinini 7 qismga ajratadi.", cam: [50,52,1], dur: 5 },
    { text: "Temur otliqlari qanotlardan hujumga o'tadi, markaz bosim o'tkazadi.", cam: [50,50,1.15], dur: 7,
      moves: [{ g: "t2", to: [70,48] }, { g: "t3", to: [28,48] }, { g: "t1", to: [48,58] }] },
    { text: "To'xtamish qo'shini bosimga dosh berolmay, tartibsiz chekinadi.", cam: [50,40,1.2], dur: 6,
      moves: [{ g: "o1", to: [48,18] }, { g: "o2", to: [20,20] }, { g: "o3", to: [78,20] }] },
    { text: "Temur g'alaba qozonadi. Oltin O'rda kuchlari zaiflashadi.", cam: [50,45,1], dur: 5 }
  ],
  result: "Amir Temur g'olib bo'ldi. To'xtamish mag'lubiyatga uchradi.",
  sources: ["Zafarnoma", "Nizomiddin Shomiy", "Tarixiy manbalar"]
};

const TEREK = {
  title: "TEREK JANGI", year: "1395-yil, aprel", topic: "TEMUR VA TO'XTAMISH (2-marta)",
  terrain: "daryo",
  features: [
    { type: "river", pts: [[0,50],[25,48],[50,52],[75,47],[100,50]], name: "Terek daryosi" },
    { type: "mountain", x: 15, y: 15, r: 14 }, { type: "mountain", x: 85, y: 12, r: 11 },
    { type: "hill", x: 40, y: 70, r: 10 }, { type: "place", kind: "pass", name: "O'tish joyi", x: 55, y: 48 }
  ],
  sides: [
    { name: "Temuriylar", color: "#C62828", commander: "Amir Temur",
      groups: [
        { id: "t1", name: "Markaz", kind: "piyoda", count: 45000, x: 50, y: 75, commander: true },
        { id: "t2", name: "O'ng qanot", kind: "otliq", count: 40000, x: 78, y: 70 },
        { id: "t3", name: "Chap qanot", kind: "otliq", count: 40000, x: 22, y: 70 },
        { id: "t4", name: "Zaxira", kind: "otliq", count: 25000, x: 50, y: 88 }
      ] },
    { name: "Oltin O'rda", color: "#5D4037", commander: "To'xtamishxon",
      groups: [
        { id: "o1", name: "Markaz", kind: "otliq", count: 50000, x: 50, y: 28, commander: true },
        { id: "o2", name: "O'ng qanot", kind: "otliq", count: 30000, x: 25, y: 32 },
        { id: "o3", name: "Chap qanot", kind: "otliq", count: 30000, x: 75, y: 32 }
      ] }
  ],
  stages: [
    { text: "To'xtamish Terek daryosidan o'tib, mudofaa chizig'ini tuzadi.", cam: [50,45,0.95], dur: 5 },
    { text: "Temur qo'shinni daryoning janubiy qirg'og'iga joylashtiradi.", cam: [50,60,1], dur: 5 },
    { text: "Temur hujum boshlaydi. Qanotlar daryo bo'ylab aylanadi.", cam: [50,50,1.15], dur: 7,
      moves: [{ g: "t2", to: [72,45] }, { g: "t3", to: [28,45] }, { g: "t1", to: [50,55] }] },
    { text: "To'xtamish qo'shini yengiladi va shimolga qochadi.", cam: [50,35,1.2], dur: 6,
      moves: [{ g: "o1", to: [50,12] }, { g: "o2", to: [22,15] }, { g: "o3", to: [78,15] }] },
    { text: "Temur Oltin O'rdaning asosiy kuchlarini yakuniy mag'lub etadi.", cam: [50,40,1], dur: 5 }
  ],
  result: "Amir Temur yakuniy g'alaba qozondi. To'xtamishning kuchi sindirildi.",
  sources: ["Zafarnoma", "Ibn Arabshoh", "Tarixiy tadqiqotlar"]
};

const DEHLI = {
  title: "DEHLI JANGI", year: "1398-yil, 17-dekabr", topic: "TEMUR HINDISTONDA",
  terrain: "tekislik",
  features: [
    { type: "hill", x: 50, y: 55, r: 8 },
    { type: "place", kind: "city", name: "Dehli", x: 85, y: 20 },
    { type: "place", kind: "village", name: "Panipat yonida", x: 40, y: 60 },
    { type: "hill", x: 20, y: 40, r: 9 }
  ],
  sides: [
    { name: "Temuriylar", color: "#C62828", commander: "Amir Temur",
      groups: [
        { id: "t1", name: "Markaz", kind: "piyoda", weapon: "nayza, qilich", count: 30000, x: 48, y: 78, commander: true },
        { id: "t2", name: "O'ng qanot", kind: "otliq", count: 25000, x: 72, y: 74 },
        { id: "t3", name: "Chap qanot", kind: "otliq", count: 25000, x: 24, y: 74 },
        { id: "t4", name: "Kamonchilar", kind: "kamonchi", count: 15000, x: 48, y: 88 }
      ] },
    { name: "Dehli sultonligi", color: "#6A1B9A", commander: "Sulton Mahmud + Malluxon",
      groups: [
        { id: "d1", name: "Markaz", kind: "piyoda", count: 20000, x: 48, y: 32, commander: true },
        { id: "d2", name: "Otliqlar", kind: "otliq", count: 10000, x: 30, y: 36 },
        { id: "d3", name: "Jang fillari", kind: "fil", count: 120, x: 55, y: 40 },
        { id: "d4", name: "Kamonchilar", kind: "kamonchi", count: 15000, x: 65, y: 30 }
      ] }
  ],
  stages: [
    { text: "Temur Dehli oldida to'xtaydi. Sulton Mahmud va Malluxon jangga chiqadi.", cam: [50,55,0.95], dur: 5 },
    { text: "Hindiston fillari oldinga chiqariladi. Temur o'qchilarni tayyorlaydi.", cam: [50,50,1.05], dur: 5 },
    { text: "Temur askarlari fillarga nayza va o'q bilan zarba beradi. Fillar orqaga qochadi.", cam: [50,48,1.2], dur: 7,
      moves: [{ g: "d3", to: [55,55] }, { g: "t4", to: [48,65] }, { g: "t1", to: [48,60] }] },
    { text: "Fillar o'z askarlarini bosib, tartibsizlik keltiradi. Temur qanotlardan hujum qiladi.", cam: [50,45,1.25], dur: 6,
      moves: [{ g: "t2", to: [65,50] }, { g: "t3", to: [30,50] }, { g: "d1", to: [48,25] }] },
    { text: "Sulton qochadi. Temur Dehlini egallaydi.", cam: [70,30,1.1], dur: 5 }
  ],
  result: "Amir Temur g'olib bo'ldi. Dehli egallandi, katta o'lja olindi.",
  sources: ["Zafarnoma", "Ibn Arabshoh", "Hindiston tarixi manbalari"]
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
        { id: "f1", name: "Desaix bo'linmasi", kind: "piyoda", count: 5000, x: 30, y: 70, commander: true },
        { id: "f2", name: "Reyne bo'linmasi", kind: "piyoda", count: 5000, x: 50, y: 72 },
        { id: "f3", name: "Bon bo'linmasi", kind: "piyoda", count: 5000, x: 70, y: 70 }
      ] },
    { name: "Mamluklar", color: "#8B4513", commander: "Murad Bey",
      groups: [
        { id: "m1", name: "Markaz", kind: "otliq", count: 6000, x: 50, y: 35, commander: true },
        { id: "m2", name: "O'ng qanot", kind: "otliq", count: 4000, x: 25, y: 40 },
        { id: "m3", name: "Chap qanot", kind: "otliq", count: 4000, x: 75, y: 40 }
      ] }
  ],
  stages: [
    { text: "Napoleon qo'shini Nil bo'yida jangga tayyorlanadi.", cam: [50,55,0.9], dur: 5 },
    { text: "Mamluk otliqlari hujumga o'tadi.", cam: [50,45,1.1], dur: 5 },
    { text: "Bon bo'linmasi ustun bo'lib hujum qilib, Imbaba qishlog'ini egallaydi.", cam: [72,62,1.6], dur: 6 },
    { text: "Mamluklar mag'lub bo'ladi, Murad Bey qochadi.", cam: [50,40,1.2], dur: 5 }
  ],
  result: "Napoleon g'olib bo'ldi.",
  sources: ["Napoleon yurishlari"]
};

const LIB = { anqara: DEMO, kunduzcha: KUNDUZCHA, terek: TEREK, dehli: DEHLI, ehromlar: PYR };

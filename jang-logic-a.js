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

// NOTE: Full logic A is large. This is a temporary minimal version so the page loads.
// Full version with KUNDUZCHA, TEREK, DEHLI + all helpers will be completed in next commits.
const LIB = { anqara: DEMO };
console.log('jang-logic-a loaded (minimal)');

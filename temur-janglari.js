// Amir Temur janglari. Sana, sarkarda va jang tartibi ochiq manbalardan (Wikipedia, historyofwar.org) olingan.
// Manbada soni berilmagan guruhlarda "shartli" deb belgilangan — ular faqat tasvir uchun.
(function(){
const T = '#C62828', G = '#2E9E4F';
const S = {};
const W = (p) => 'https://en.wikipedia.org/wiki/' + p;
const N = (extra) => (extra ? extra + ' ' : '') + "Manbalarda sonlar farq qiladi; qo'shin belgilari taxminiy, to'p/fil soni shartli. Darslik bilan solishtiring.";

S.loy = { title:"LOY JANGI (TOSHKENT)", year:"1365-yil", topic:"TEMUR VA HUSAYN — MO'G'ULLARGA QARSHI", terrain:"daryo",
 features:[{type:"river",name:"Sirdaryo havzasi",pts:[[0,52],[30,48],[60,54],[100,50]]},{type:"place",kind:"city",name:"Toshkent",x:78,y:18},{type:"forest",x:20,y:62,r:10},{type:"hill",x:84,y:60,r:10}],
 sides:[
  {name:"Temur va Husayn",color:T,commander:"Amir Temur, Amir Husayn",groups:[
   {id:"t1",name:"Temur (chap qanot)",kind:"otliq",weapon:"kamon, qilich",count:5000,x:30,y:80,commander:true},
   {id:"t2",name:"Husayn (o'ng qanot)",kind:"otliq",weapon:"kamon, nayza",count:6000,x:68,y:80},
   {id:"t3",name:"Husayn avangardi",kind:"otliq",weapon:"nayza",count:2000,x:64,y:66}]},
  {name:"Mo'g'uliston (Ilyosxo'ja)",color:G,commander:"Ilyosxo'ja",groups:[
   {id:"m1",name:"Mo'g'ul o'ng qanoti",kind:"otliq",weapon:"kamon, qilich",count:9000,x:28,y:28},
   {id:"m2",name:"Markaz (Ilyosxo'ja)",kind:"otliq",weapon:"kamon, qilich",count:9000,x:50,y:24,commander:true},
   {id:"m3",name:"Mo'g'ul chap qanoti",kind:"otliq",weapon:"kamon, nayza",count:9000,x:72,y:28}]}],
 stages:[
  {text:"Toshkent yaqinida Temur (chap qanot) va Husayn (o'ng qanot) Mo'g'ul qo'shiniga qarshi saf tortadi.",cam:[50,56,.9],dur:5},
  {text:"Chaqmoqli kuchli yomg'ir yog'adi, dala botqoqqa aylanadi.",cam:[50,52,1.05],dur:5,moves:[{g:"m1",to:[30,42]},{g:"m2",to:[50,40]},{g:"m3",to:[70,42]}]},
  {text:"Temur odamlari birinchi bo'lib jangga kirib, Mo'g'ul qanotida ustunlik oladi.",cam:[32,58,1.4],dur:6,moves:[{g:"t1",to:[30,56]}],losses:{m1:.7},arrows:true},
  {text:"Husayn avangardi mag'lub bo'lib orqaga suriladi; Temur uni qutqarish uchun chekinadi.",cam:[56,62,1.3],dur:6,moves:[{g:"t3",to:[64,76]},{g:"t1",to:[44,70]},{g:"m3",to:[68,58]}],losses:{t3:.4}},
  {text:"Ertasi kuni jang qayta boshlanadi: avval ustunlik bo'lsa-da, Temur-Husayn qo'shini sinib qochadi (~10 ming talafot).",cam:[50,62,1.2],dur:6,moves:[{g:"m2",to:[50,60]},{g:"t1",to:[34,88]},{g:"t2",to:[66,90]}],losses:{t1:.5,t2:.5,t3:.2},arrows:true},
  {text:"Ilyosxo'ja Samarqandni qamal qiladi, ammo sarbadorlar uni mag'lub etadi; keyin Temur va Husayn Samarqandni egallaydi.",cam:[50,50,.9],dur:6,moves:[{g:"m1",to:[28,12]},{g:"m2",to:[50,10]},{g:"m3",to:[72,12]}]}],
 result:"Jangda Temur-Husayn mag'lub bo'ldi, lekin Mo'g'ullar keyingi qamalda yengildi va Temur kuchaydi (1370-yilda Balxda Husayn ustidan g'alaba qozonib, Movarounnahrning yagona hukmdori bo'ldi).",
 note:N("Manbada qo'shin sonlari berilmagan — belgilar shartli. Sanasi: 1365 (kun/oy manbada ko'rsatilmagan)."),
 sources:["https://www.historyofwar.org/articles/battles_the_mire.html",W("Battle_of_Tashkent")] };

S.qunduzcha = { title:"QUNDUZCHA JANGI", year:"1391-yil, 18-iyun", topic:"TEMUR VA TO'XTAMISH", terrain:"tekislik",
 features:[{type:"river",name:"Qunduzcha daryosi",pts:[[0,50],[30,46],[60,52],[100,48]]},{type:"hill",x:18,y:62,r:10},{type:"hill",x:82,y:34,r:10},{type:"forest",x:50,y:92,r:8}],
 sides:[
  {name:"Temur (~100 ming)",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaz (Temur)",kind:"otliq",weapon:"qilich, kamon",count:34000,x:50,y:80,commander:true},
   {id:"t2",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:33000,x:80,y:76},
   {id:"t3",name:"Chap qanot",kind:"otliq",weapon:"kamon",count:33000,x:20,y:76}]},
  {name:"Oltin O'rda (To'xtamish)",color:G,commander:"To'xtamishxon",groups:[
   {id:"o1",name:"Markaz (To'xtamish)",kind:"otliq",weapon:"kamon, qilich",count:60000,x:50,y:26,commander:true},
   {id:"o2",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:60000,x:80,y:30},
   {id:"o3",name:"Chap qanot",kind:"otliq",weapon:"kamon",count:60000,x:20,y:30}]}],
 stages:[
  {text:"Temur To'xtamishni ta'qib qilib, Qunduzcha daryosi bo'yida (hozirgi Samara viloyati) jang safiga turadi.",cam:[50,56,.85],dur:5},
  {text:"To'xtamish qo'shini kuch jihatidan ustun; saflar qarama-qarshi turadi.",cam:[50,48,1],dur:5,moves:[{g:"o1",to:[50,36]},{g:"o2",to:[80,40]},{g:"o3",to:[20,40]}]},
  {text:"To'xtamish otliqlari Temur qo'shinini qanotlardan o'rab olishga urinadi.",cam:[50,52,1.1],dur:6,moves:[{g:"o2",to:[84,56]},{g:"o3",to:[16,56]}],arrows:true},
  {text:"Temur qo'shini bu hujumga bardosh beradi.",cam:[50,60,1.2],dur:5,losses:{t2:.85,t3:.85}},
  {text:"Temur to'satdan markaz bilan oldinga hujum qiladi — Oltin O'rda qo'shini qochadi.",cam:[50,48,1.3],dur:6,moves:[{g:"t1",to:[50,44]},{g:"t2",to:[74,44]},{g:"t3",to:[26,44]}],arrows:true,losses:{o1:.6,o2:.6,o3:.6}},
  {text:"Mag'lubiyatga uchragan Oltin O'rda qo'shinining katta qismi halok bo'ladi yoki tarqalib ketadi.",cam:[50,32,1],dur:6,moves:[{g:"o1",to:[50,12]},{g:"o2",to:[80,14]},{g:"o3",to:[20,14]}],losses:{o1:.35,o2:.35,o3:.35}}],
 result:"Temur g'alaba qozondi. Manbalarda Oltin O'rda talafoti ~100 ming deb keltiriladi, ammo tarixiy raqamlar mubolag'ali bo'lishi mumkin.",
 note:N("Qo'shin: Temur ~100 ming; To'xtamish 180–300 ming (manbalarda keskin farq). Guruhlarga bo'linishi shartli."),
 sources:[W("Battle_of_the_Kondurcha_River"),W("Tokhtamysh%E2%80%93Timur_war")] };

S.terek = { title:"TEREK JANGI", year:"1395-yil, aprel", topic:"TEMUR VA TO'XTAMISH", terrain:"tog'",
 features:[{type:"river",name:"Terek daryosi",pts:[[100,28],[70,42],[40,50],[0,60]]},{type:"mountain",x:20,y:10,r:12},{type:"mountain",x:42,y:6,r:10},{type:"mountain",x:80,y:9,r:11},{type:"hill",x:12,y:74,r:10}],
 sides:[
  {name:"Temur",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaz (Muhammad Sulton)",kind:"otliq",weapon:"qilich, kamon",count:25000,x:50,y:78},
   {id:"t2",name:"Chap qanot",kind:"otliq",weapon:"kamon",count:20000,x:20,y:76},
   {id:"t3",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:20000,x:80,y:76},
   {id:"t4",name:"Zaxira — 27 saralangan bo'linma (Temur)",kind:"otliq",weapon:"qilich",count:10000,x:50,y:92,commander:true}]},
  {name:"Oltin O'rda (To'xtamish)",color:G,commander:"To'xtamishxon",groups:[
   {id:"o1",name:"Markaz",kind:"otliq",weapon:"kamon, qilich",count:25000,x:50,y:26,commander:true},
   {id:"o2",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:25000,x:78,y:28},
   {id:"o3",name:"Chap qanot",kind:"otliq",weapon:"kamon",count:25000,x:22,y:28}]}],
 stages:[
  {text:"Temur 7 ta qismga bo'lingan qo'shin bilan Terek daryosini kechib o'tadi; 21-aprelda ikki qo'shin yuzma-yuz keladi.",cam:[50,56,.85],dur:5},
  {text:"Safda: markazda nabirasi Muhammad Sulton, zaxirada Temurning o'zi 27 ta saralangan bo'linma bilan.",cam:[50,66,1.15],dur:5,moves:[{g:"o1",to:[50,38]},{g:"o2",to:[78,40]},{g:"o3",to:[22,40]}]},
  {text:"To'xtamishning o'ng qanoti Temurning chap qanotiga qattiq zarba beradi; Temur zaxirasini o'sha tomonga yuboradi.",cam:[24,56,1.4],dur:6,moves:[{g:"o3",to:[22,60]},{g:"t4",to:[28,70]}],losses:{t2:.6},arrows:true},
  {text:"Temur yaqin jangda xavf ostida qoladi; Shayx Nuriddin boshchiligida 50 kishilik guruh uni qutqaradi.",cam:[26,62,1.7],dur:6,losses:{t2:.5,t4:.8}},
  {text:"Muhammad Sulton markazdan To'xtamish o'ng qanotiga zarba berib, orqaga uradi. O'ng qanotda esa Temur odamlari qurshovda otdan tushib so'nggi qadar jang qiladi, markazdan yordam yetadi.",cam:[52,54,1.2],dur:7,moves:[{g:"t1",to:[48,50]},{g:"o1",to:[50,46]},{g:"o2",to:[78,56]},{g:"t3",to:[76,66]}],losses:{o3:.4,t3:.6},arrows:true},
  {text:"To'xtamish jang maydonidan qochadi — jang hal bo'ladi. Temur uni Volga bo'yiga qadar quvadi.",cam:[50,34,1],dur:6,moves:[{g:"o1",to:[50,10]},{g:"o2",to:[78,12]},{g:"o3",to:[22,12]}],losses:{o1:.3,o2:.3,o3:.2}}],
 result:"Temur hal qiluvchi g'alaba qozondi: To'xtamish Volga shimoliga qochdi; Temur Saroy va Tana (Azov)ni egalladi. Oltin O'rda avvalgi qudratini tiklay olmadi.",
 note:N("Sana: historyofwar.org — 22-aprel; Wikipedia — 14-aprel (manbalar farq qiladi). Manbada qo'shin sonlari berilmagan — belgilar shartli. Daryodan o'tish usuli ham manbalarda farqli (Klavixo va Yazdiy)."),
 sources:["https://www.historyofwar.org/articles/battles_terek_river.html",W("Battle_of_the_Terek_River")] };

S.dehli = { title:"DEHLI JANGI", year:"1398-yil, 17-dekabr", topic:"TEMUR HINDISTONDA", terrain:"daryo",
 features:[{type:"river",name:"Jamna (Yamuna)",pts:[[88,0],[90,38],[86,70],[90,100]]},{type:"place",kind:"city",name:"Dehli",x:60,y:22},{type:"hill",x:18,y:62,r:10},{type:"forest",x:30,y:90,r:8}],
 sides:[
  {name:"Temur (~90 ming)",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaz (Temur)",kind:"otliq",weapon:"qilich, kamon",count:35000,x:46,y:82,commander:true},
   {id:"t2",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:25000,x:74,y:80},
   {id:"t3",name:"Chap qanot",kind:"otliq",weapon:"kamon",count:25000,x:20,y:80},
   {id:"t4",name:"Kamonchilar va yong'in mashinalari",kind:"kamonchi",weapon:"kamon, yonuvchi suyuqlik",count:5000,x:46,y:92},
   {id:"t5",name:"Alanga yuklangan tuyalar",kind:"fil",weapon:"o't yuklangan tuyalar",count:8,x:46,y:68}]},
  {name:"Dehli sultonligi",color:G,commander:"Sulton Mahmud Tug'luq, Mallu Iqbol",groups:[
   {id:"d1",name:"Jang fillari",kind:"fil",weapon:"zirh, xanjar",count:12,x:52,y:34},
   {id:"d2",name:"Dehli piyodalari",kind:"piyoda",weapon:"nayza, qilich",count:30000,x:46,y:24,commander:true},
   {id:"d3",name:"Otliqlar",kind:"otliq",weapon:"kamon, qilich",count:10000,x:22,y:30}]}],
 stages:[
  {text:"Temur Hind daryosidan o'tib (30-sentabr), Multanni olib, Dehli oldiga keladi.",cam:[56,56,.9],dur:5},
  {text:"Temur otliqlari atrofida xandaq qazdiriladi — fillar oldida otlar cho'chib ketmasligi uchun.",cam:[46,76,1.3],dur:5},
  {text:"Sulton qo'shini fillari bilan shahar oldiga chiqadi.",cam:[50,42,1.1],dur:5,moves:[{g:"d2",to:[46,40]},{g:"d1",to:[52,46]},{g:"d3",to:[22,42]}]},
  {text:"Temur fillarga qarshi o't qo'yilgan xashak yuklangan tuyalarni haydaydi; kamonchilar yonuvchi suyuqlik solingan idishlar otadi.",cam:[50,52,1.4],dur:6,moves:[{g:"t5",to:[50,50]}],arrows:true},
  {text:"Fillar vahimaga tushib, o'z saflarini buzib yuboradi.",cam:[50,46,1.5],dur:5,losses:{d1:.4,d2:.65}},
  {text:"Temurning asosiy kuchi hujumga o'tadi; otliqlar Dehli qo'shinining qoldig'ini tor-mor qiladi.",cam:[50,40,1.2],dur:6,moves:[{g:"t1",to:[48,42]},{g:"t2",to:[68,40]},{g:"t3",to:[26,42]}],arrows:true,losses:{d1:0,d2:.2,d3:.15}},
  {text:"Shahar egallanadi; keyin Dehli bir necha kun davomida talanadi.",cam:[60,26,1.3],dur:5,moves:[{g:"t1",to:[58,30]}]}],
 result:"Temur g'alaba qozondi va Dehlini egalladi. Keyingi bir necha kun shahar talon-taroj qilindi.",
 note:N("Temur qo'shini ~90 ming (Wikipedia); Dehli qo'shini soni ma'lum emas. Tuyalar bilan hiyla «ehtimol» ishlatilgan deb keltiriladi (manbalarda ishonchsiz)."),
 sources:[W("Sack_of_Delhi_(1398)"),"https://www.britannica.com/event/Battle-of-Delhi-1398"] };

S.halab = { title:"HALAB (ALEPPO) OLINISHI", year:"1400-yil, oktabr–noyabr", topic:"TEMUR VA MAMLUKLAR", terrain:"tekislik",
 features:[{type:"place",kind:"fort",name:"Halab qal'asi",x:56,y:22},{type:"hill",x:18,y:60,r:10},{type:"hill",x:82,y:56,r:9}],
 sides:[
  {name:"Temur",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaz (Temur)",kind:"otliq",weapon:"qilich, kamon",count:30000,x:50,y:82,commander:true},
   {id:"t2",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:20000,x:78,y:78},
   {id:"t3",name:"Chap qanot",kind:"otliq",weapon:"kamon",count:20000,x:22,y:78},
   {id:"t4",name:"Hind fillari",kind:"fil",count:8,x:50,y:92}]},
  {name:"Mamluklar (Suriya)",color:G,commander:"Mamluk amirlari",groups:[
   {id:"m1",name:"Mamluk otliqlari",kind:"otliq",weapon:"qilich, nayza",count:15000,x:50,y:44,commander:true},
   {id:"m2",name:"Halab garnizoni",kind:"piyoda",weapon:"kamon, nayza",count:10000,x:56,y:22},
   {id:"m3",name:"Suriya otliqlari",kind:"otliq",weapon:"kamon",count:6000,x:24,y:42}]}],
 stages:[
  {text:"Temur Suriyaga kirib, Halab (Aleppo) devorlari oldiga keladi.",cam:[50,56,.9],dur:5},
  {text:"Mamluk otliqlari shahar tashqarisida jang safiga turadi.",cam:[50,48,1.1],dur:5,moves:[{g:"m1",to:[50,50]},{g:"m3",to:[24,50]}]},
  {text:"Temur qanotlari mamluklarni ikki tomondan siqadi.",cam:[50,52,1.3],dur:6,moves:[{g:"t2",to:[70,46]},{g:"t3",to:[30,46]},{g:"t1",to:[50,58]}],arrows:true,losses:{m3:.5}},
  {text:"Mamluklar shahar tomon chekinadi; Temur qo'shini shaharni qamal qiladi, fillar yordam beradi.",cam:[54,36,1.3],dur:6,moves:[{g:"m1",to:[54,28]},{g:"t1",to:[52,38]},{g:"t4",to:[54,40]}],losses:{m1:.4}},
  {text:"Halab 1400-yil noyabrida egallanadi; Hama, Homs va Baalbek ham yo'lda taslim bo'ladi.",cam:[56,26,1.5],dur:6,losses:{m1:.1,m2:.15}}],
 result:"Halab Temur qo'liga o'tdi; keyingi yo'nalish — Damashq.",
 note:N("Manbada (Wikipedia) Halab jangi haqida batafsil ma'lumot kam: bu bosqichlar umumiy sxema, aniq tartib tekshirilmagan."),
 sources:[W("Siege_of_Damascus_(1400)"),W("Sack_of_Aleppo_(1400)")] };

S.damashq = { title:"DAMASHQ QAMALI", year:"1400-yil dekabr – 1401-yil mart", topic:"TEMUR VA MISR SULTONI FARAJ", terrain:"tekislik",
 features:[{type:"place",kind:"city",name:"Damashq",x:52,y:20},{type:"mountain",x:80,y:10,r:12},{type:"mountain",x:20,y:12,r:10},{type:"river",name:"Barada",pts:[[0,34],[40,30],[70,34],[100,32]]},{type:"hill",x:16,y:70,r:9}],
 sides:[
  {name:"Temur",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaz (Qubbat Sayyar lageri)",kind:"otliq",weapon:"qilich, kamon",count:30000,x:30,y:80,commander:true},
   {id:"t2",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:18000,x:72,y:76},
   {id:"t3",name:"Talonchi otryadlar",kind:"otliq",weapon:"kamon",count:12000,x:10,y:70}]},
  {name:"Misr (Mamluklar)",color:G,commander:"Sulton Faraj",groups:[
   {id:"m1",name:"Faraj qo'shini",kind:"otliq",weapon:"qilich, nayza",count:20000,x:56,y:42,commander:true},
   {id:"m2",name:"Damashq garnizoni",kind:"piyoda",weapon:"nayza, kamon",count:8000,x:52,y:20}]}],
 stages:[
  {text:"Temur Damashq g'arbidagi Qubbat Sayyar yaqinida lager quradi.",cam:[40,60,.9],dur:5},
  {text:"Atrofdagi hududlar (Qatana, Kiswa, Daraya, Havran) talon qilinadi.",cam:[38,56,1],dur:5,moves:[{g:"t3",to:[16,50]},{g:"t2",to:[66,60]}],arrows:true},
  {text:"Misr sultoni Faraj qo'shin bilan Damashqqa yetib keladi.",cam:[54,46,1.2],dur:5,moves:[{g:"m1",to:[56,48]}]},
  {text:"Damashq oldidagi to'qnashuvda Faraj boshchiligidagi qo'shin yengiladi.",cam:[52,50,1.3],dur:6,moves:[{g:"t1",to:[48,58]},{g:"t2",to:[66,52]}],arrows:true,losses:{m1:.4}},
  {text:"Faraj ning vakillari (shu jumladan Ibn Xaldun) Temur bilan muzokara olib boradi.",cam:[50,40,1.1],dur:5,moves:[{g:"m1",to:[56,10]}],losses:{m1:.3}},
  {text:"Muzokara muvaffaqiyatsiz tugab, Damashq talanadi; 1401-yil martida Umaviylar masjidi yonadi.",cam:[52,22,1.4],dur:6,moves:[{g:"t1",to:[50,30]}],losses:{m2:.2}}],
 result:"Damashq Temur qo'liga o'tdi; ko'plab hunarmandlar Samarqandga ko'chirildi.",
 note:N("Manbada (Wikipedia) ikki qo'shinning soni 'ma'lum emas'; Faraj qo'shinining nega yengilgani va muzokara nega buzilgani manbada aytilmagan. Belgilar shartli."),
 sources:[W("Siege_of_Damascus_(1400)")] };

S.bagdod = { title:"BAG'DOD QAMALI", year:"1401-yil", topic:"TEMUR VA JALOYIRLAR", terrain:"daryo",
 features:[{type:"river",name:"Dajla (Tigr)",pts:[[40,0],[52,35],[44,70],[54,100]]},{type:"place",kind:"city",name:"Bag'dod",x:52,y:40},{type:"hill",x:14,y:70,r:10}],
 sides:[
  {name:"Temur",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaziy kuch",kind:"piyoda",weapon:"zinapoya, nayza",count:30000,x:26,y:78,commander:true},
   {id:"t2",name:"Sharqiy qirg'oq otliqlari",kind:"otliq",weapon:"kamon",count:20000,x:78,y:66},
   {id:"t3",name:"G'arbiy qirg'oq otliqlari",kind:"otliq",weapon:"kamon",count:20000,x:12,y:62}]},
  {name:"Jaloyirlar (Bag'dod)",color:G,commander:"Sulton Ahmad Jaloyir",groups:[
   {id:"j1",name:"Shahar garnizoni",kind:"piyoda",weapon:"kamon, nayza",count:10000,x:52,y:38,commander:true},
   {id:"j2",name:"Devor himoyachilari",kind:"kamonchi",weapon:"kamon",count:5000,x:44,y:34}]}],
 stages:[
  {text:"Temur Bag'dodni — Jaloyirlar sultonligi poytaxtini — qamal qiladi.",cam:[50,56,.9],dur:5},
  {text:"Qo'shin shaharni ikki qirg'oqdan o'rab oladi.",cam:[48,50,1.1],dur:5,moves:[{g:"t2",to:[68,46]},{g:"t3",to:[26,46]},{g:"t1",to:[34,56]}]},
  {text:"Qamal qirq kun davom etadi — himoyachilar tobora toliqadi.",cam:[50,42,1.3],dur:6,losses:{j2:.7,j1:.9}},
  {text:"Sulton Ahmad Jaloyir Qora Yusuf bilan shahardan qochib, Damashqqa o'tadi.",cam:[52,34,1.3],dur:5,losses:{j2:.4,j1:.6}},
  {text:"Bag'dod egallanadi, shahar talanadi va katta qismi vayron qilinadi (masjid va madrasalar saqlab qolinadi).",cam:[52,40,1.4],dur:6,moves:[{g:"t1",to:[48,44]}],losses:{j2:0,j1:.1}}],
 result:"Bag'dod Temur qo'liga o'tdi (1401–1405 Temuriylar hukmronligi). Ahmad Jaloyir Temur o'limidan keyin (1405) shaharni qaytarib oldi.",
 note:N("Manbada (Wikipedia) devor qanday yorib o'tilgani va qo'shin sonlari aytilmagan — belgilar shartli; qamal muddati 40 kun."),
 sources:[W("Siege_of_Baghdad_(1401)")] };

S.izmir = { title:"IZMIR (SMIRNA) QAMALI", year:"1402-yil, 2-dekabr", topic:"TEMUR VA RODOS ISPITALCHILARI", terrain:"dengiz",
 features:[{type:"sea",y:14,name:"Egey dengizi"},{type:"place",kind:"fort",name:"Izmir qal'asi",x:50,y:28},{type:"hill",x:20,y:62,r:10},{type:"hill",x:82,y:60,r:9}],
 sides:[
  {name:"Temur",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaz (Temur)",kind:"piyoda",weapon:"zinapoya, nayza",count:15000,x:48,y:78,commander:true},
   {id:"t2",name:"Chap qo'shin (Muhammad Sulton)",kind:"otliq",weapon:"kamon",count:10000,x:18,y:70},
   {id:"t3",name:"O'ng qo'shin (Mironshoh)",kind:"otliq",weapon:"kamon",count:10000,x:80,y:70},
   {id:"t4",name:"Tosh otar mashinalar",kind:"top",weapon:"manjaniq",count:6,x:44,y:56}]},
  {name:"Rodos ispitalchilari",color:"#2F5DA8",commander:"Íñigo de Alfaro",groups:[
   {id:"h1",name:"Qal'a garnizoni (~200 ritsar)",kind:"piyoda",weapon:"qilich, kamon, nafta",count:200,x:50,y:28,commander:true},
   {id:"h2",name:"Yordam kemalari",kind:"top",weapon:"kema",count:3,x:50,y:6}]}],
 stages:[
  {text:"2-dekabrda Temur Izmir oldiga keladi; qal'a dengiz bo'yidagi yarimorolda.",cam:[48,56,.9],dur:5},
  {text:"Tosh otar mashinalar isthmusga qo'yiladi; yopiq platformalar va zinapoyalar devor tomon olib kelinadi.",cam:[48,46,1.2],dur:5,moves:[{g:"t4",to:[46,46]},{g:"t1",to:[48,60]}]},
  {text:"Devor ostiga lahim qaziladi; taxminan ikki kunda tashqi devor yoriladi.",cam:[50,36,1.4],dur:6,moves:[{g:"t1",to:[48,44]}],losses:{h1:.8},arrows:true},
  {text:"Lahim tayanchlari yoqiladi — devor portlab quladi, himoyachilar ostida qoladi.",cam:[50,30,1.6],dur:5,losses:{h1:.4}},
  {text:"Temur qo'shini shaharga kiradi; ritsarlar kemalarga qochadi, yordamga kelgan kemalar orqaga qaytadi.",cam:[50,22,1.5],dur:6,moves:[{g:"t1",to:[50,30]},{g:"h2",to:[50,2]}],losses:{h1:.1}},
  {text:"Temur dengiz qal'asini buzdirib, qurilgan qismini kuchaytirib chiqib ketadi.",cam:[50,30,1.1],dur:5}],
 result:"Izmir (~15 kunlik qamaldan so'ng) Temur qo'liga o'tdi; Rodos ispitalchilari Anadoludagi tayanchidan ayrildi.",
 note:N("Manbalardan biri Temur qo'shinini ~4000 deb ko'rsatadi, boshqalari ancha ko'p — belgilar shartli. Port yopilishi haqidagi ma'lumotlar manbalarda farq qiladi."),
 sources:[W("Siege_of_Smyrna")] };

window.TEMUR_JANGLARI = [
 {k:'loy',n:"Loy jangi (1365)"},{k:'qunduzcha',n:"Qunduzcha jangi (1391)"},{k:'terek',n:"Terek jangi (1395)"},
 {k:'dehli',n:"Dehli jangi (1398)"},{k:'halab',n:"Halab olinishi (1400)"},{k:'damashq',n:"Damashq qamali (1400–01)"},
 {k:'bagdod',n:"Bag'dod qamali (1401)"},{k:'izmir',n:"Izmir qamali (1402)"}
].map(x => ({ k:x.k, n:x.n, s:S[x.k] }));
})();

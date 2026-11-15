// Amir Temur janglari (taxminiy sxemalar). Raqamlar manbalarda farq qiladi — darslik bilan solishtiring.
(function(){
const T = '#C62828';
const NOTE = "Qo'shin soni va jang tafsilotlari manbalarda farq qiladi; raqamlar taxminiy, to'p/fil soni shartli. Darslik va ishonchli manbalar bilan solishtiring.";
const S = {};

S.loy = { title:"LOY JANGI", year:"1365-yil, may", topic:"TEMUR VA HUSAYN — MO'G'ULISTONGA QARSHI", terrain:"daryo",
 features:[{type:"river",name:"Sirdaryo yaqini",pts:[[0,50],[30,46],[60,52],[100,48]]},{type:"place",kind:"city",name:"Toshkent",x:80,y:20},{type:"hill",x:15,y:30,r:12},{type:"forest",x:60,y:60,r:10}],
 sides:[
  {name:"Temur va Husayn",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Temur otliqlari",kind:"otliq",weapon:"kamon, qilich",count:6000,x:40,y:82,commander:true},
   {id:"t2",name:"Husayn qo'shini",kind:"otliq",weapon:"kamon, nayza",count:6000,x:62,y:82},
   {id:"t3",name:"Kamonchilar",kind:"kamonchi",weapon:"kamon",count:3000,x:50,y:92}]},
  {name:"Mo'g'uliston (Ilyosxo'ja)",color:"#2E9E4F",commander:"Ilyosxo'ja",groups:[
   {id:"m1",name:"Mo'g'ul otliqlari (markaz)",kind:"otliq",weapon:"kamon, qilich",count:20000,x:48,y:24,commander:true},
   {id:"m2",name:"Chap qanot",kind:"otliq",weapon:"kamon, nayza",count:12000,x:20,y:28},
   {id:"m3",name:"O'ng qanot",kind:"otliq",weapon:"kamon, nayza",count:12000,x:76,y:30}]}],
 stages:[
  {text:"Temur va Husayn Sirdaryo bo'yida Mo'g'uliston qo'shini bilan to'qnashadi.",cam:[50,56,.9],dur:5},
  {text:"Kuchli yomg'ir yog'adi, dala botqoqqa aylanadi — otliq harakati qiyinlashadi.",cam:[50,50,1.1],dur:5,moves:[{g:"m1",to:[48,40]},{g:"m2",to:[22,42]},{g:"m3",to:[74,44]}]},
  {text:"Mo'g'ullar ko'p sonli otliq bilan botqoqda hujum qiladi.",cam:[50,52,1.3],dur:6,moves:[{g:"t1",to:[44,60]},{g:"t2",to:[60,62]},{g:"m1",to:[48,52]}],arrows:true},
  {text:"Temur va Husayn qo'shini saflari buzilib, chekinadi.",cam:[50,62,1.3],dur:6,losses:{t1:.55,t2:.5,t3:.7},moves:[{g:"t1",to:[40,86]},{g:"t2",to:[64,88]}]},
  {text:"Ammo Mo'g'ullar ham ot qirilishi va kasallikdan zaiflashib, Movarounnahrdan chiqib ketadi.",cam:[50,40,1],dur:6,moves:[{g:"m1",to:[48,14]},{g:"m2",to:[22,16]},{g:"m3",to:[76,18]}],losses:{m1:.7,m2:.7,m3:.7}}],
 result:"Jangda Temur-Husayn qo'shini mag'lub bo'ldi, lekin Mo'g'ullar keyin chekindi va Temur kuchini qayta to'pladi.", note:NOTE };

S.qunduzcha = { title:"QUNDUZCHA JANGI", year:"1391-yil, 18-iyun", topic:"TEMUR VA TO'XTAMISH", terrain:"tekislik",
 features:[{type:"river",name:"Qunduzcha",pts:[[0,52],[30,48],[60,54],[100,50]]},{type:"hill",x:20,y:60,r:10},{type:"hill",x:80,y:36,r:10}],
 sides:[
  {name:"Temur",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaz (Temur)",kind:"otliq",weapon:"qilich, kamon",count:50000,x:50,y:80,commander:true},
   {id:"t2",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:35000,x:78,y:76},
   {id:"t3",name:"Chap qanot",kind:"otliq",weapon:"kamon",count:35000,x:22,y:76},
   {id:"t4",name:"Zaxira va piyodalar",kind:"piyoda",weapon:"nayza",count:20000,x:50,y:92}]},
  {name:"Oltin O'rda (To'xtamish)",color:"#2E9E4F",commander:"To'xtamishxon",groups:[
   {id:"o1",name:"Markaz (To'xtamish)",kind:"otliq",weapon:"kamon, qilich",count:50000,x:50,y:24,commander:true},
   {id:"o2",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:35000,x:78,y:28},
   {id:"o3",name:"Chap qanot",kind:"otliq",weapon:"kamon",count:35000,x:22,y:28}]}],
 stages:[
  {text:"Temur qo'shini Qunduzcha daryosi bo'yida 7 ta saf bo'lib joylashadi.",cam:[50,56,.85],dur:5},
  {text:"To'xtamish qo'shini ham jang safiga turadi.",cam:[50,48,1],dur:5,moves:[{g:"o1",to:[50,34]},{g:"o2",to:[78,36]},{g:"o3",to:[22,36]}]},
  {text:"Temurning o'ng qanoti hujum boshlaydi, dushman chap qanoti qaytadi.",cam:[74,50,1.3],dur:6,moves:[{g:"t2",to:[74,48]}],losses:{o3:.7},arrows:true},
  {text:"Chap qanotda og'ir jang bo'lib, Temur markazi zarba beradi.",cam:[40,52,1.2],dur:6,moves:[{g:"t3",to:[26,50]},{g:"t1",to:[50,58]}],losses:{t3:.7,o2:.7}},
  {text:"To'xtamish qo'shini bosimga bardosh bera olmay qochadi.",cam:[50,40,1],dur:6,moves:[{g:"o1",to:[50,14]},{g:"o2",to:[78,12]},{g:"o3",to:[22,12]}],losses:{o1:.6,o2:.5,o3:.4}}],
 result:"Temur g'alaba qozondi; To'xtamish qochdi. Qo'shin sonlari (yuz minglab) manbalarda mubolag'ali bo'lishi mumkin.", note:NOTE };

S.terek = { title:"TEREK JANGI", year:"1395-yil, 15-aprel", topic:"TEMUR VA TO'XTAMISH", terrain:"tog'",
 features:[{type:"river",name:"Terek daryosi",pts:[[100,30],[70,44],[40,50],[0,60]]},{type:"mountain",x:20,y:12,r:12},{type:"mountain",x:42,y:8,r:10},{type:"mountain",x:80,y:10,r:11}],
 sides:[
  {name:"Temur",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaz (Temur)",kind:"otliq",weapon:"qilich, kamon",count:50000,x:50,y:84,commander:true},
   {id:"t2",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:30000,x:78,y:78},
   {id:"t3",name:"Chap qanot",kind:"otliq",weapon:"kamon",count:30000,x:22,y:78},
   {id:"t4",name:"Zaxira",kind:"piyoda",weapon:"nayza",count:15000,x:50,y:94}]},
  {name:"Oltin O'rda (To'xtamish)",color:"#2E9E4F",commander:"To'xtamishxon",groups:[
   {id:"o1",name:"Markaz",kind:"otliq",weapon:"kamon, qilich",count:40000,x:50,y:28,commander:true},
   {id:"o2",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:30000,x:78,y:32},
   {id:"o3",name:"Chap qanot",kind:"otliq",weapon:"kamon",count:30000,x:22,y:32}]}],
 stages:[
  {text:"Temur Kavkaz etaklarida, Terek daryosi bo'yida To'xtamishni topadi.",cam:[50,56,.85],dur:5},
  {text:"Ikki qo'shin jang safiga turadi; Temur qo'shini ming kishilik otryadlarga bo'lingan.",cam:[50,50,1],dur:5,moves:[{g:"o1",to:[50,38]},{g:"o2",to:[78,40]},{g:"o3",to:[22,40]}]},
  {text:"To'xtamish chap qanotga zarba beradi; Temur chap qanoti bosim ostida qoladi.",cam:[26,52,1.3],dur:6,moves:[{g:"o3",to:[26,54]}],losses:{t3:.6},arrows:true},
  {text:"Temur shaxsan markaz va zaxira bilan hujumga o'tadi.",cam:[48,50,1.3],dur:6,moves:[{g:"t1",to:[50,50]},{g:"t4",to:[40,60]}]},
  {text:"Dushman qanotlari qurshovda qoladi, To'xtamish qo'shini parchalanadi.",cam:[50,44,1.2],dur:6,moves:[{g:"t2",to:[70,40]},{g:"t3",to:[30,42]}],losses:{o2:.4,o3:.35,o1:.5}},
  {text:"To'xtamish qochadi; Temur uni Volga bo'ylab ta'qib qiladi.",cam:[50,30,1],dur:6,moves:[{g:"o1",to:[50,12]}],losses:{o1:.3,o2:.2,o3:.2}}],
 result:"Temur hal qiluvchi g'alaba qozondi; Oltin O'rdaning qudrati sindi.", note:NOTE };

S.dehli = { title:"DEHLI JANGI", year:"1398-yil, 17-dekabr", topic:"TEMUR HINDISTONDA", terrain:"daryo",
 features:[{type:"river",name:"Jamna (Yamuna)",pts:[[85,0],[88,40],[84,70],[88,100]]},{type:"place",kind:"city",name:"Dehli",x:62,y:26},{type:"hill",x:20,y:60,r:10}],
 sides:[
  {name:"Temur",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaz (Temur)",kind:"otliq",weapon:"qilich, kamon",count:30000,x:46,y:82,commander:true},
   {id:"t2",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:20000,x:74,y:80},
   {id:"t3",name:"Chap qanot",kind:"otliq",weapon:"kamon",count:20000,x:20,y:80},
   {id:"t4",name:"Kamonchilar",kind:"kamonchi",weapon:"kamon",count:8000,x:46,y:92}]},
  {name:"Dehli sultonligi",color:"#2E9E4F",commander:"Mahmud Tug'luq / Mallu Iqbol",groups:[
   {id:"d1",name:"Jang fillari",kind:"fil",weapon:"zirh, xanjar",count:12,x:52,y:34},
   {id:"d2",name:"Dehli piyodalari",kind:"piyoda",weapon:"nayza, qilich",count:40000,x:46,y:26,commander:true},
   {id:"d3",name:"Otliqlar",kind:"otliq",weapon:"kamon, qilich",count:10000,x:22,y:30}]}],
 stages:[
  {text:"Temur Jamna daryosini kechib o'tib, Dehli yaqinida jang safini tuzadi.",cam:[56,56,.9],dur:5},
  {text:"Dehli qo'shini fillari bilan shahar oldidan chiqadi.",cam:[50,42,1.1],dur:5,moves:[{g:"d2",to:[46,38]},{g:"d1",to:[52,44]},{g:"d3",to:[22,40]}]},
  {text:"Temur fillarga qarshi hiyla ishlatadi: o't qo'yilgan xashak yuklangan tuyalar va qo'riqchi to'siqlar.",cam:[50,52,1.3],dur:6,moves:[{g:"t4",to:[46,70]}],arrows:true},
  {text:"Fillar cho'chib, o'z saflariga burilib ketadi.",cam:[52,46,1.4],dur:5,losses:{d1:.4,d2:.8}},
  {text:"Temur qanotlari ikki tomondan hujum qiladi, otliq qo'shin qochadi.",cam:[50,42,1.2],dur:6,moves:[{g:"t2",to:[66,40]},{g:"t3",to:[26,40]},{g:"t1",to:[46,48]}],losses:{d3:.3,d2:.5}},
  {text:"Sulton Dehlidan qochadi; shahar Temurga taslim bo'ladi.",cam:[60,28,1.2],dur:5,moves:[{g:"t1",to:[58,32]}],losses:{d1:0,d2:.2,d3:.1}}],
 result:"Temur g'alaba qozondi va Dehlini egalladi. Qo'shin soni va fillar soni manbalarda farqli.", note:NOTE };

S.halab = { title:"HALAB (ALEPPO) JANGI", year:"1400-yil, oktabr–noyabr", topic:"TEMUR VA MAMLUKLAR", terrain:"tekislik",
 features:[{type:"place",kind:"fort",name:"Halab qal'asi",x:56,y:24},{type:"river",name:"Quvayq",pts:[[0,40],[40,38],[70,42],[100,40]]},{type:"hill",x:15,y:62,r:10}],
 sides:[
  {name:"Temur",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaz (Temur)",kind:"otliq",weapon:"qilich, kamon",count:30000,x:50,y:82,commander:true},
   {id:"t2",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:20000,x:78,y:78},
   {id:"t3",name:"Chap qanot",kind:"otliq",weapon:"kamon",count:20000,x:22,y:78},
   {id:"t4",name:"Hind fillari",kind:"fil",count:10,x:50,y:92}]},
  {name:"Mamluklar (Halab)",color:"#2E9E4F",commander:"Temurtosh / Demirdosh",groups:[
   {id:"m1",name:"Mamluk otliqlari",kind:"otliq",weapon:"qilich, nayza",count:20000,x:50,y:44,commander:true},
   {id:"m2",name:"Shahar garnizoni",kind:"piyoda",weapon:"kamon, nayza",count:15000,x:56,y:24},
   {id:"m3",name:"Suriya otliqlari",kind:"otliq",weapon:"kamon",count:6000,x:24,y:42}]}],
 stages:[
  {text:"Temur qo'shini Halab devorlari oldiga keladi.",cam:[50,56,.9],dur:5},
  {text:"Mamluk otliqlari shahar tashqarisida jang safiga turadi.",cam:[50,48,1.1],dur:5,moves:[{g:"m1",to:[50,50]},{g:"m3",to:[24,50]}]},
  {text:"Temur qanotlari mamluklarni o'rab olib, markazga zarba beradi.",cam:[50,52,1.3],dur:6,moves:[{g:"t2",to:[70,46]},{g:"t3",to:[30,46]},{g:"t1",to:[50,58]}],arrows:true,losses:{m3:.5}},
  {text:"Mamluklar shahar darvozalariga qochadi, Temur otliqlari ularning orqasidan shaharga kiradi.",cam:[54,38,1.3],dur:6,moves:[{g:"m1",to:[54,30]},{g:"t1",to:[52,36]}],losses:{m1:.4,m3:.2}},
  {text:"Hind fillari ko'makida devorlar buziladi; qal'a bir necha kundan so'ng taslim bo'ladi.",cam:[56,26,1.5],dur:6,moves:[{g:"t4",to:[54,34]}],losses:{m1:.1,m2:.2}}],
 result:"Halab Temur qo'liga o'tdi; keyingi yo'nalish — Damashq.", note:NOTE };

S.damashq = { title:"DAMASHQ JANGI", year:"1400–1401-yil, qish", topic:"TEMUR VA MISR SULTONI FARAJ", terrain:"tekislik",
 features:[{type:"place",kind:"city",name:"Damashq",x:50,y:22},{type:"mountain",x:80,y:12,r:12},{type:"mountain",x:20,y:12,r:10},{type:"river",name:"Barada",pts:[[0,34],[40,30],[70,34],[100,32]]}],
 sides:[
  {name:"Temur",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaz (Temur)",kind:"otliq",weapon:"qilich, kamon",count:30000,x:50,y:82,commander:true},
   {id:"t2",name:"O'ng qanot",kind:"otliq",weapon:"kamon",count:18000,x:78,y:78},
   {id:"t3",name:"Chap qanot",kind:"otliq",weapon:"kamon",count:18000,x:22,y:78},
   {id:"t4",name:"Hind fillari",kind:"fil",count:8,x:50,y:92}]},
  {name:"Misr (Mamluklar)",color:"#2E9E4F",commander:"Sulton Faraj",groups:[
   {id:"m1",name:"Mamluk otliqlari",kind:"otliq",weapon:"qilich, nayza",count:20000,x:50,y:40,commander:true},
   {id:"m2",name:"Damashq garnizoni",kind:"piyoda",weapon:"nayza",count:8000,x:50,y:22},
   {id:"m3",name:"Misr otliq qanoti",kind:"otliq",weapon:"kamon",count:8000,x:24,y:40}]}],
 stages:[
  {text:"Misr sulton Faraj qo'shini bilan Damashqqa yetib keladi.",cam:[50,50,.9],dur:5},
  {text:"Temur Damashq oldiga yetib kelib, jang safiga turadi.",cam:[50,56,1],dur:5,moves:[{g:"t1",to:[50,68]},{g:"t2",to:[76,66]},{g:"t3",to:[24,66]}]},
  {text:"Bir necha to'qnashuvlarda Temur qanotlari mamluklarni qisib boradi.",cam:[50,48,1.3],dur:6,moves:[{g:"t2",to:[68,46]},{g:"t3",to:[32,46]}],arrows:true,losses:{m3:.6}},
  {text:"Faraj qo'shinida fitna borligi haqida xabar tarqaladi; sulton Misrga qaytib ketadi.",cam:[50,36,1.2],dur:6,moves:[{g:"m1",to:[50,12]},{g:"m3",to:[24,12]}],losses:{m1:.7}},
  {text:"Damashq mudofaasiz qolib, kelishuvga o'tadi; keyin shahar talanib, yoqiladi.",cam:[50,24,1.4],dur:5,moves:[{g:"t1",to:[50,30]}],losses:{m2:.25}}],
 result:"Damashq Temur qo'liga o'tdi. Faraj jang qilmay chekinishi tarixchilar orasida turlicha talqin qilinadi.", note:NOTE };

S.bagdod = { title:"BAG'DOD QAMALI", year:"1401-yil, iyun–iyul", topic:"TEMUR VA JALOYIRLAR", terrain:"daryo",
 features:[{type:"river",name:"Dajla (Tigr)",pts:[[40,0],[52,35],[44,70],[54,100]]},{type:"place",kind:"city",name:"Bag'dod",x:50,y:40},{type:"hill",x:15,y:70,r:10}],
 sides:[
  {name:"Temur",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaz (Temur)",kind:"piyoda",weapon:"zinapoya, kamon",count:30000,x:30,y:78,commander:true},
   {id:"t2",name:"Sharqiy qanot",kind:"otliq",weapon:"kamon",count:20000,x:74,y:70},
   {id:"t3",name:"G'arbiy qanot",kind:"otliq",weapon:"kamon",count:20000,x:14,y:64},
   {id:"t4",name:"Qamal mashinalari",kind:"top",weapon:"manjaniq",count:6,x:34,y:60}]},
  {name:"Jaloyirlar (Bag'dod)",color:"#2E9E4F",commander:"Sulton Ahmad Jaloyir",groups:[
   {id:"j1",name:"Shahar garnizoni",kind:"piyoda",weapon:"kamon, nayza",count:12000,x:50,y:38,commander:true},
   {id:"j2",name:"Devor himoyachilari",kind:"kamonchi",weapon:"kamon",count:5000,x:42,y:34}]}],
 stages:[
  {text:"Temur Bag'dodni o'rab oladi; shahar Dajla daryosi bo'yida joylashgan.",cam:[48,56,.9],dur:5},
  {text:"Qamal mashinalari devorga yaqinlashtiriladi, daryoning ikki qirg'og'i ham egallanadi.",cam:[46,50,1.2],dur:6,moves:[{g:"t4",to:[40,50]},{g:"t2",to:[66,46]},{g:"t3",to:[24,46]}]},
  {text:"Himoyachilar uzoq (taxminan 40 kun) qarshilik ko'rsatadi.",cam:[48,42,1.3],dur:6,losses:{j2:.7,j1:.9}},
  {text:"Tong paytida umumiy hujum: zinapoyalar bilan devorlarga chiqiladi.",cam:[48,40,1.5],dur:6,moves:[{g:"t1",to:[44,42]}],arrows:true,losses:{j2:.3,j1:.6}},
  {text:"Sulton Ahmad Jaloyir shahardan qochadi; Bag'dod Temur qo'liga o'tadi.",cam:[50,38,1.5],dur:5,losses:{j2:0,j1:.1}}],
 result:"Bag'dod Temur tomonidan egallandi; Jaloyir sultoni qochdi.", note:NOTE };

S.izmir = { title:"IZMIR QAMALI", year:"1402-yil, dekabr", topic:"TEMUR VA RODOS ISPITALCHILARI", terrain:"dengiz",
 features:[{type:"place",kind:"fort",name:"Izmir qal'asi",x:50,y:30},{type:"river",name:"Dengiz qirg'og'i",pts:[[0,12],[30,14],[70,10],[100,12]]},{type:"hill",x:20,y:60,r:10}],
 sides:[
  {name:"Temur",color:T,commander:"Amir Temur",groups:[
   {id:"t1",name:"Markaz (Temur)",kind:"piyoda",weapon:"zinapoya, nayza",count:30000,x:46,y:78,commander:true},
   {id:"t2",name:"Kamonchilar",kind:"kamonchi",weapon:"kamon",count:12000,x:70,y:72},
   {id:"t3",name:"Qamal mashinalari",kind:"top",weapon:"manjaniq",count:6,x:40,y:60},
   {id:"t4",name:"Otliqlar",kind:"otliq",weapon:"qilich",count:15000,x:20,y:70}]},
  {name:"Rodos ispitalchilari",color:"#2F5DA8",commander:"Ritsar-ispitalchilar",groups:[
   {id:"h1",name:"Qal'a garnizoni",kind:"piyoda",weapon:"qilich, arbalet",count:1500,x:50,y:30,commander:true},
   {id:"h2",name:"Dengizdagi kemalar",kind:"top",weapon:"kema",count:4,x:50,y:8}]}],
 stages:[
  {text:"Temur Anqaradan keyin Izmirni qamal qiladi; qal'a dengiz bo'yida.",cam:[48,56,.9],dur:5},
  {text:"Qamal mashinalari va kamonchilar qal'a oldiga olib kelinadi.",cam:[48,46,1.2],dur:5,moves:[{g:"t3",to:[44,46]},{g:"t2",to:[62,50]}]},
  {text:"Devorlar ostiga lahim qazilib, to'siqlar buziladi (qamal ~2 hafta).",cam:[50,38,1.4],dur:6,moves:[{g:"t1",to:[48,44]}],losses:{h1:.7}},
  {text:"Umumiy hujum bilan qal'a egallanadi; ba'zi himoyachilar kemalarga qochadi.",cam:[50,30,1.5],dur:6,arrows:true,moves:[{g:"t1",to:[50,34]}],losses:{h1:.15,h2:.7}}],
 result:"Izmir qal'asi Temur qo'liga o'tdi — bu uning so'nggi yirik g'alabalaridan biri.", note:NOTE };

window.TEMUR_JANGLARI = [
 {k:'loy',n:"Loy jangi (1365)"},{k:'qunduzcha',n:"Qunduzcha jangi (1391)"},{k:'terek',n:"Terek jangi (1395)"},
 {k:'dehli',n:"Dehli jangi (1398)"},{k:'halab',n:"Halab jangi (1400)"},{k:'damashq',n:"Damashq jangi (1400–01)"},
 {k:'bagdod',n:"Bag'dod qamali (1401)"},{k:'izmir',n:"Izmir qamali (1402)"}
].map(x => ({ k:x.k, n:x.n, s:S[x.k] }));
})();

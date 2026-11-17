/* ===========================================================
   F Klavye Stüdyo — Klavye düzeni, kelime havuzu ve dersler
   =========================================================== */
'use strict';

/* ---------- Türkçe F klavye düzeni ----------
   [kod, normal, shift, altgr, parmak]
   parmak: lp lr lm li | ri rm rr rp  (sol/sağ serçe-yüzük-orta-işaret), th = başparmak */
const KB_ROWS = [
  [
    ['Backquote', '+', '*', '¬', 'lp'], ['Digit1', '1', '!', '¹', 'lp'], ['Digit2', '2', '"', '²', 'lr'],
    ['Digit3', '3', '^', '#', 'lm'], ['Digit4', '4', '$', '¼', 'li'], ['Digit5', '5', '%', '½', 'li'],
    ['Digit6', '6', '&', '¾', 'ri'], ['Digit7', '7', "'", '{', 'ri'], ['Digit8', '8', '(', '[', 'rm'],
    ['Digit9', '9', ')', ']', 'rr'], ['Digit0', '0', '=', '}', 'rp'], ['Minus', '/', '?', '\\', 'rp'],
    ['Equal', '-', '_', '|', 'rp'], ['Backspace', '⌫', '', '', 'rp', 2]
  ],
  [
    ['Tab', 'Tab', '', '', 'lp', 1.5], ['KeyQ', 'f', 'F', '@', 'lp'], ['KeyW', 'g', 'G', '', 'lr'],
    ['KeyE', 'ğ', 'Ğ', '', 'lm'], ['KeyR', 'ı', 'I', '', 'li'], ['KeyT', 'o', 'O', '', 'li'],
    ['KeyY', 'd', 'D', '', 'ri'], ['KeyU', 'r', 'R', '', 'ri'], ['KeyI', 'n', 'N', '', 'rm'],
    ['KeyO', 'h', 'H', '', 'rr'], ['KeyP', 'p', 'P', '', 'rp'], ['BracketLeft', 'q', 'Q', '', 'rp'],
    ['BracketRight', 'w', 'W', '', 'rp'], ['Enter', 'Enter', '', '', 'rp', 1.5]
  ],
  [
    ['CapsLock', 'Caps', '', '', 'lp', 1.85], ['KeyA', 'u', 'U', '', 'lp'], ['KeyS', 'i', 'İ', '', 'lr'],
    ['KeyD', 'e', 'E', '', 'lm'], ['KeyF', 'a', 'A', '', 'li'], ['KeyG', 'ü', 'Ü', '', 'li'],
    ['KeyH', 't', 'T', '', 'ri'], ['KeyJ', 'k', 'K', '', 'ri'], ['KeyK', 'm', 'M', '', 'rm'],
    ['KeyL', 'l', 'L', '', 'rr'], ['Semicolon', 'y', 'Y', '', 'rp'], ['Quote', 'ş', 'Ş', '', 'rp'],
    ['Backslash', 'x', 'X', '', 'rp'], ['EnterFill', '', '', '', 'rp', 1.15]
  ],
  [
    ['ShiftLeft', 'Shift', '', '', 'lp', 1.3], ['IntlBackslash', '<', '>', '|', 'lp'], ['KeyZ', 'j', 'J', '', 'lp'],
    ['KeyX', 'ö', 'Ö', '', 'lr'], ['KeyC', 'v', 'V', '', 'lm'], ['KeyV', 'c', 'C', '', 'li'],
    ['KeyB', 'ç', 'Ç', '', 'li'], ['KeyN', 'z', 'Z', '', 'ri'], ['KeyM', 's', 'S', '', 'ri'],
    ['Comma', 'b', 'B', '', 'rm'], ['Period', '.', ':', '', 'rr'], ['Slash', ',', ';', '', 'rp'],
    ['ShiftRight', 'Shift', '', '', 'rp', 2.75]
  ],
  [
    ['ControlLeft', 'Ctrl', '', '', 'lp', 1.5], ['MetaLeft', 'Win', '', '', 'lp', 1.25], ['AltLeft', 'Alt', '', '', 'th', 1.25],
    ['Space', '', '', '', 'th', 6.4], ['AltRight', 'Alt Gr', '', '', 'th', 1.25], ['MetaRight', 'Win', '', '', 'rp', 1.25],
    ['ContextMenu', 'Menü', '', '', 'rp', 1.25], ['ControlRight', 'Ctrl', '', '', 'rp', 1.5]
  ]
];

const FINGER_NAMES = {
  lp: 'Sol serçe parmak', lr: 'Sol yüzük parmağı', lm: 'Sol orta parmak', li: 'Sol işaret parmağı',
  ri: 'Sağ işaret parmağı', rm: 'Sağ orta parmak', rr: 'Sağ yüzük parmağı', rp: 'Sağ serçe parmak',
  th: 'Başparmak'
};

// Kod -> tuş bilgisi ve karakter -> vuruş bilgisi tabloları
const KEY_BY_CODE = {};
const CHAR_MAP = {}; // ch -> {code, shift, altgr, finger}
KB_ROWS.forEach((row) => row.forEach(([code, n, s, a, f]) => {
  KEY_BY_CODE[code] = { code, n, s, a, f };
  const isChar = (c) => c && c.length === 1;
  if (isChar(n) && !CHAR_MAP[n]) CHAR_MAP[n] = { code, shift: false, altgr: false, finger: f };
  if (isChar(s) && !CHAR_MAP[s]) CHAR_MAP[s] = { code, shift: true, altgr: false, finger: f };
  if (isChar(a) && !CHAR_MAP[a]) CHAR_MAP[a] = { code, shift: false, altgr: true, finger: f };
}));
CHAR_MAP[' '] = { code: 'Space', shift: false, altgr: false, finger: 'th' };

const ROW_HOME = 'uieaütkmlyşx';
const ROW_TOP = 'fgğıodrnhpqw';
const ROW_BOTTOM = 'jövcçzsb';
const LEFT_LETTERS = 'fgğıouieaüjövcç';
const RIGHT_LETTERS = 'drnhpqwtkmlyşxzsb';
const TR_ALPHABET = 'abcçdefgğhıijklmnoöprsştuüvyz';

const trUpper = (s) => s.toLocaleUpperCase('tr-TR');
const trLower = (s) => s.toLocaleLowerCase('tr-TR');
const capFirst = (w) => trUpper(w.charAt(0)) + w.slice(1);

/* ---------- Kelime havuzu (sık kullanılan Türkçe kelimeler) ---------- */
const WORDS = (`
ve bir bu da de için ile ama çok daha en gibi kadar sonra önce şimdi her hiç ne nasıl neden niçin kim hangi
ben sen o biz siz onlar beni seni onu bizi sizi bana sana ona bize size benim senin onun bizim sizin
evet hayır tamam belki zaten bile artık yine hep hemen sadece yalnız birlikte ayrıca çünkü eğer ancak fakat
ev okul kitap kalem defter masa sandalye kapı pencere duvar oda mutfak bahçe sokak cadde şehir köy ülke dünya
anne baba kardeş abla ağabey dede nine teyze amca dayı hala kuzen aile arkadaş komşu öğretmen öğrenci doktor
su ekmek peynir zeytin çay kahve süt yoğurt elma armut kiraz çilek muz portakal limon üzüm karpuz kavun domates
biber patates soğan havuç ıspanak fasulye mercimek pirinç makarna şeker tuz yağ bal reçel yumurta et tavuk balık
gün gece sabah akşam öğle hafta ay yıl saat dakika saniye zaman bugün yarın dün sabahleyin akşamleyin mevsim
ilkbahar yaz sonbahar kış ocak şubat mart nisan mayıs haziran temmuz ağustos eylül ekim kasım aralık
pazartesi salı çarşamba perşembe cuma cumartesi pazar tatil bayram doğum hediye parti düğün davet
kırmızı mavi yeşil sarı beyaz siyah mor turuncu pembe gri kahverengi lacivert renk renkli açık koyu
büyük küçük uzun kısa geniş dar yüksek alçak sıcak soğuk ılık yeni eski genç yaşlı güzel çirkin iyi kötü
kolay zor hızlı yavaş ağır hafif dolu boş temiz kirli tatlı acı ekşi tuzlu taze sert yumuşak derin sığ
gelmek gitmek yapmak etmek olmak almak vermek görmek bakmak bilmek demek söylemek konuşmak anlamak düşünmek
okumak yazmak çizmek oynamak koşmak yürümek oturmak kalkmak uyumak uyanmak yemek içmek sevmek istemek
gel git yap al ver gör bak bil de oku yaz çiz oyna koş yürü otur kalk uyu iç sev iste dinle anlat sor
geldi gitti yaptı aldı verdi gördü baktı bildi dedi okudu yazdı oynadı koştu yürüdü oturdu güldü sordu
geliyor gidiyor yapıyor alıyor veriyor görüyor bakıyor biliyor okuyor yazıyor oynuyor konuşuyor
gelecek gidecek yapacak alacak verecek okuyacak yazacak çalışacak öğrenecek başlayacak bitirecek
çalışmak öğrenmek öğretmek başlamak bitirmek beklemek bulmak kaybetmek kazanmak açmak kapatmak taşımak
klavye fare ekran bilgisayar telefon internet program dosya klasör tuş parmak el kol bacak ayak baş göz
kulak burun ağız diş dil saç yüz boyun omuz sırt kalp beyin ses söz kelime cümle harf hece paragraf metin
ders sınav ödev not sınıf okul lise üniversite bilgi bilim sanat müzik resim tiyatro sinema spor oyun
futbol basketbol voleybol yüzme koşu bisiklet araba otobüs tren uçak gemi yol köprü tünel istasyon liman
deniz göl nehir dağ tepe orman ağaç çiçek yaprak dal kök tohum toprak taş kum çakıl bulut yağmur kar rüzgar
güneş yıldız gökyüzü hava ışık gölge ateş duman buz sis fırtına şimşek gökkuşağı sahil ada vadi ova
kedi köpek kuş at inek koyun keçi tavşan aslan kaplan ayı kurt tilki fil zürafa maymun kartal güvercin arı
karınca kelebek böcek yılan kaplumbağa yunus balina ördek kaz horoz civciv baykuş leylek
iş meslek para fiyat çarşı pazar market dükkan mağaza alışveriş banka hesap kart ödeme ücret maaş
mutlu üzgün kızgın yorgun heyecanlı sakin meraklı şaşkın neşeli umutlu sevinç korku öfke sevgi saygı
güven umut hayal düş rüya fikir düşünce duygu anı hatıra gelecek geçmiş şimdiki yaşam hayat ölüm doğa
insan çocuk bebek kadın erkek kız oğlan adam kişi halk millet devlet bayrak vatan tarih kültür gelenek
kapak kutu çanta cüzdan anahtar kilit saat gözlük şapka ceket gömlek pantolon etek elbise ayakkabı çorap
yatak yastık yorgan halı perde lamba ayna dolap raf sehpa koltuk kanepe buzdolabı fırın ocak tencere tava
tabak bardak çatal kaşık bıçak fincan sürahi şişe kavanoz tepsi peçete havlu sabun şampuan fırça tarak
kağıt zarf mektup kart pul posta haber gazete dergi roman hikaye masal şiir yazar şair ressam müzisyen
soru cevap sorun çözüm yardım teşekkür lütfen merhaba günaydın iyi akşamlar hoşça kal güle güle
ilk son orta yan alt üst ön arka iç dış sağ sol karşı yakın uzak aşağı yukarı ileri geri öte beri
bir iki üç dört beş altı yedi sekiz dokuz on yirmi otuz kırk elli altmış yetmiş seksen doksan yüz bin
kalem kale kalite alet ateş etek tek kek mum tel mal ama eli yeşil kelime aile ayak kuyu kutu umut yatak
yumak maya yaka küme ümit mutlu tamam kat tat et at ata ay yay yaş kaş taş iş kişi eşya tüm ülke ütü yük kül
elma kilim keklik telaş eşek ameliyat kimse kalemlik ilk kim kil ali ilmek yel yem yemekli ulak ilkel ekmekçi
tatil tatlılık kimya mimar mimari makine motor mantık matematik fizik kimyasal biyoloji coğrafya edebiyat
dikkat dikkatli özen sabır sabırlı çaba emek başarı başarılı hedef amaç plan program düzen düzenli disiplin
hız hızlanmak doğru doğruluk yanlış hata hatasız pratik tekrar alıştırma egzersiz çalışma gelişim ilerleme
odak odaklanmak nefes rahat rahatlık duruş bilek dirsek sandalye yükseklik mesafe görüş ekran parlaklık
şarkı türkü melodi ritim nota gitar piyano keman davul flüt bağlama ney zurna koro orkestra konser sahne
ekim hasat tarla bağ bostan çiftlik çiftçi çoban sürü ahır kümes değirmen buğday arpa mısır pamuk fındık
çınar meşe kavak söğüt çam ladin akasya ıhlamur zeytin incir nar ayva erik kayısı şeftali vişne dut
kışlık yazlık bahar yeşillik serinlik sıcaklık nem kuraklık bereket bolluk kıtlık
özgür özgürlük barış dostluk kardeşlik eşitlik adalet hukuk kural yasa hak görev sorumluluk
yol yolcu yolculuk harita pusula rota durak bilet valiz bavul otel pansiyon kamp çadır uyku tulumu
merdiven asansör kat daire bina apartman site mahalle ilçe il bölge kıta okyanus ekvator kutup
sabahki akşamki dünkü yarınki bugünkü yıllık aylık haftalık günlük saatlik
hızlıca yavaşça sessizce dikkatlice güzelce iyice tamamen kısaca uzunca biraz azıcık epey oldukça
çabuk geç erken zamanında hemencecik sonunda başında ortasında
gözlem deney sonuç rapor özet giriş gelişme bölüm sayfa satır sütun tablo grafik şekil resim
yazılım donanım uygulama sistem ağ sunucu veri bellek işlemci kablo yazıcı tarayıcı hoparlör kulaklık
şifre güvenlik kullanıcı hesap profil ayar menü pencere simge düğme bağlantı indirme yükleme
`).trim().split(/\s+/).filter((w, i, a) => w && a.indexOf(w) === i);

/* ---------- Cümle havuzları ---------- */
// Küçük harf, yalnızca nokta ve virgül (başlangıç tekrarı)
const SENTENCES_LOWER = [
  'ellerini klavyenin temel sırasına yerleştir ve rahatça otur.',
  'her sabah biraz pratik yaparsan parmakların hızlanır.',
  'işaret parmakların a ve k tuşlarının üzerinde dursun.',
  'ekrana bak, klavyeye bakma, parmaklarına güven.',
  'bahçedeki çiçekler yağmurdan sonra daha güzel kokar.',
  'kedi pencerenin önünde güneşlenirken uyuyakaldı.',
  'yavaş ama doğru yazmak, hızlı ama hatalı yazmaktan iyidir.',
  'dağların arkasından doğan güneş vadiyi aydınlattı.',
  'kitap okumak insanın hayal gücünü geliştirir.',
  'deniz kenarında yürümek bana huzur verir.',
  'annem mutfakta mis gibi kokan bir çorba pişirdi.',
  'küçük adımlar zamanla büyük başarılara dönüşür.',
  'arkadaşım bana yeni aldığı bisikleti gösterdi.',
  'kış gelince sokaklar beyaz bir örtüyle kaplanır.',
  'sabırlı olan öğrenci sonunda hedefine ulaşır.',
  'parmaklarını yormadan, nefesini tutmadan yaz.',
  'öğretmenimiz derse güzel bir hikaye ile başladı.',
  'çay demlenirken pencereden yağmuru izledik.',
  'bu yıl tatilde yeni şehirler görmek istiyoruz.',
  'doğru duruş, uzun çalışmalarda seni korur.',
  'kuşlar sabahın erken saatlerinde şarkı söyler.',
  'yazı yazarken bileklerini masaya bastırma.',
  'ormanın içinde küçük bir dere sessizce akıyordu.',
  'her gün on dakika çalışmak bile fark yaratır.',
  'pazardan taze meyve ve sebze aldık.',
  'çocuklar parkta neşeyle top oynuyordu.',
  'güzel bir gün geçirmek için erken uyan.',
  'bilgisayar başında uzun süre kalınca mola ver.',
  'rüzgar esince ağaçların yaprakları hışırdar.',
  'okuldan dönünce önce ödevlerimi bitiririm.'
];

// Büyük harf ve noktalama içeren cümleler
const SENTENCES = [
  'Ankara, Türkiye\'nin başkentidir.',
  'Ayşe her sabah yürüyüşe çıkar.',
  'Bugün hava çok güzel, dışarı çıkalım mı?',
  'Emre kitabını okulda unuttu.',
  'İstanbul, iki kıtayı birleştiren büyük bir şehirdir.',
  'Kerem ile Zeynep kütüphanede ders çalışıyor.',
  'Ne kadar çok çalışırsan o kadar hızlanırsın!',
  'Doğru parmakla vuruş yapmak alışkanlık ister.',
  'Öğleden sonra İzmir\'e doğru yola çıktık.',
  'Selin, piyano çalmayı çok seviyor.',
  'Karadeniz\'in yaylaları yemyeşildir.',
  'Ödevini bitirdin mi, yoksa yardım ister misin?',
  'Umut, bu hafta sonu kamp yapmayı planlıyor.',
  'Çanakkale Köprüsü gece ışıl ışıl parlıyordu.',
  'Güneş batarken gökyüzü turuncuya boyandı.',
  'Ilgaz Dağı kışın kayak severlerle dolar.',
  'Şule, yeni bir dil öğrenmeye karar verdi.',
  'Hızlı yazmanın sırrı düzenli pratiktir.',
  'Lütfen telefonunu sessize al ve derse odaklan.',
  'Barış, akşam yemeğinden sonra kitap okudu.',
  'Elif ile Can, Eskişehir\'de üniversiteye gidiyor.',
  'Yarın sabah erkenden yola çıkmamız gerekiyor.',
  'Deniz kenarındaki küçük kafede çay içtik.',
  'Klavyeye bakmadan yazmak zamanla kolaylaşır.',
  'Özge, resim sergisine arkadaşlarını davet etti.',
  'Çağla en sevdiği şarkıyı tekrar tekrar dinledi.',
  'Mehmet Bey, bahçesine yeni fidanlar dikti.',
  'Trabzon\'un fındıkları dünyaca ünlüdür.',
  'Hata yapmaktan korkma; hatalar öğretir.',
  'Bu uygulama ile F klavyede ustalaşabilirsin.'
];

// Hız paragrafları (özgün metinler)
const PARAGRAPHS = [
  'F klavye, Türkçede en sık kullanılan harfleri parmakların en kolay ulaştığı yerlere yerleştirmek için tasarlanmıştır. Bu yüzden doğru parmak düzeniyle yazan biri, daha az el hareketiyle daha çok yazı üretir.',
  'Sabahın erken saatlerinde sahil boyunca yürümek, günün geri kalanı için insana enerji verir. Martıların sesi, dalgaların ritmi ve serin rüzgar, zihni sakinleştiren doğal bir müzik gibidir.',
  'Bir beceriyi öğrenmenin en etkili yolu, onu küçük parçalara bölmek ve her parçayı sabırla tekrar etmektir. On parmak yazmada da önce temel sıra, sonra üst ve alt sıralar, en sonunda da sayılar ve semboller çalışılır.',
  'Kütüphanenin sessiz köşesinde oturan genç kız, önündeki eski kitabın sararmış sayfalarını dikkatle çeviriyordu. Her sayfada başka bir dünyaya açılan bir kapı buluyor, satırlar arasında kayboluyordu.',
  'Teknoloji hayatımızın her alanına girdi. Telefonlar, bilgisayarlar ve akıllı cihazlar sayesinde bilgiye saniyeler içinde ulaşabiliyoruz. Yine de bu bilgiyi doğru kullanmak ve süzmek bizim sorumluluğumuzdur.',
  'Anadolu, binlerce yıllık tarihi boyunca pek çok uygarlığa ev sahipliği yaptı. Bu topraklarda gezerken antik kentlerin kalıntılarına, eski kervan yollarına ve köklü geleneklere her adımda rastlamak mümkündür.',
  'Düzenli egzersiz yalnızca bedeni değil, zihni de güçlendirir. Haftada birkaç gün yapılan kısa yürüyüşler bile uyku kalitesini artırır, stresi azaltır ve gün içindeki odaklanmayı kolaylaştırır.',
  'Yazarken ellerin gevşek, omuzların rahat ve sırtın dik olmalı. Ekran göz hizasında, bilekler ise havada durmalıdır. Doğru duruş, uzun süreli çalışmalarda yorgunluğu ve ağrıları büyük ölçüde önler.',
  'Kış akşamlarında sobanın etrafında toplanan aile, kestane közleyip eski günlerden konuşurdu. Dedenin anlattığı hikayeler, çocukların hayal dünyasını renklendirir, saatler su gibi akıp giderdi.',
  'Başarı bir anda gelmez; her gün atılan küçük adımların toplamıdır. Bugün dünden biraz daha hızlı ve biraz daha doğru yazıyorsan, doğru yoldasın demektir. Önemli olan vazgeçmemek ve keyifle devam etmektir.'
];

const NAMES = ['Ahmet', 'Ayşe', 'Mehmet', 'Fatma', 'Zeynep', 'Emre', 'Elif', 'Can', 'Deniz', 'Burak', 'Selin',
  'Murat', 'Ece', 'Kerem', 'Defne', 'Oğuz', 'İrem', 'Umut', 'Gül', 'Barış', 'Özge', 'Çağla', 'Şule', 'Ümit',
  'Ilgaz', 'Yusuf', 'Hande', 'Tolga', 'Melis', 'Kaan', 'Nehir', 'Arda', 'Ömer', 'Esra', 'Hakan', 'Pınar'];
const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya', 'Adana', 'Trabzon', 'Eskişehir',
  'Çanakkale', 'Gaziantep', 'Diyarbakır', 'Erzurum', 'Samsun', 'Kayseri', 'Mersin', 'Edirne', 'Muğla',
  'Şanlıurfa', 'Rize', 'Van', 'Ordu', 'Bolu', 'Sinop', 'Iğdır', 'Uşak', 'Çorum', 'Ağrı', 'Kars', 'Hatay',
  'Malatya', 'Denizli', 'Tekirdağ', 'Kocaeli', 'Sakarya', 'Düzce', 'Zonguldak', 'Kastamonu', 'Ödemiş'];

const TONGUE = [
  'şu köşede üç küçük kuş, üç küçük kuşa üç küçük üzüm.',
  'dalda dört dut, dört dutu düşüren dört dost.',
  'kırk kırmızı kiraz kırık kasede kaldı.',
  'çakıl taşlı çaya çıkan çoban çabucak çekildi.',
  'bir berber bir berbere gel beraber bir berber dükkanı açalım demiş.',
  'ığdırlı ılgın ılık ışıkta ıslık çaldı.',
  'öğle öncesi öğretmen öğrencilere örnek gösterdi.',
  'şişeyi şişiren şişko şişe şişip şaştı.'
];

/* ---------- Rastgele yardımcılar ---------- */
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function wordsFrom(pool, opts = {}) {
  const set = new Set(pool.split(''));
  const must = opts.must ? opts.must.split('') : null;
  const minL = opts.min || 1, maxL = opts.max || 99;
  return WORDS.filter((w) => w.length >= minL && w.length <= maxL &&
    [...w].every((c) => set.has(c)) && (!must || must.some((c) => w.includes(c))));
}

// Belirli tuşlardan rastgele gruplar üretir (odak tuşları daha sık gelir)
function genDrill(focus, pool, len = 90) {
  const f = [...focus], p = [...(pool || focus)];
  const out = [];
  let total = 0;
  // Isınma: odak tuşları tekrarları
  if (f.length <= 3) {
    f.forEach((c) => { const g = c.repeat(3); out.push(g); total += 4; });
    if (f.length >= 2) { out.push(f.join('') + f.slice().reverse().join('')); total += f.length * 2 + 1; }
  }
  while (total < len) {
    const L = 2 + rnd(4);
    let g = '';
    for (let i = 0; i < L; i++) g += Math.random() < 0.6 ? pick(f) : pick(p);
    out.push(g); total += g.length + 1;
  }
  return out.join(' ');
}

function genWords(list, len = 110, fallbackFocus = '', fallbackPool = '') {
  if (!list.length) return genDrill(fallbackFocus || 'ak', fallbackPool || fallbackFocus || 'ak', len);
  const out = []; let total = 0; let prev = '';
  let guard = 0;
  while (total < len && guard++ < 500) {
    let w = pick(list);
    if (list.length > 2 && w === prev) continue;
    prev = w; out.push(w); total += w.length + 1;
  }
  return out.join(' ');
}

function genSentences(list, count = 3) {
  return shuffle(list).slice(0, count).join(' ');
}

function genCapsDrill(letters, len = 90) {
  const out = []; let total = 0;
  while (total < len) {
    const c = pick([...letters]);
    const g = Math.random() < 0.5 ? trUpper(c) + c + c : trUpper(c) + trUpper(pick([...letters])) + pick([...letters]);
    out.push(g); total += g.length + 1;
  }
  return out.join(' ');
}

function genCapWords(pool, len = 110) {
  const list = wordsFrom(pool, { min: 3 });
  const out = []; let total = 0;
  while (total < len) { const w = capFirst(pick(list)); out.push(w); total += w.length + 1; }
  return out.join(' ');
}

function genNumbers(digits, len = 90, mode = 'groups') {
  const d = [...digits]; const out = []; let total = 0;
  while (total < len) {
    let g = '';
    if (mode === 'groups') { const L = 2 + rnd(3); for (let i = 0; i < L; i++) g += pick(d); }
    else if (mode === 'dates') g = `${1 + rnd(28)}.${1 + rnd(12)}.${1950 + rnd(76)}`;
    else if (mode === 'phone') g = `0${5 + rnd(1)}${rnd(10)}${rnd(10)} ${100 + rnd(900)} ${10 + rnd(90)} ${10 + rnd(90)}`;
    else if (mode === 'math') g = `${rnd(100)} + ${rnd(100)} = ${rnd(200)}`;
    out.push(g); total += g.length + 1;
  }
  return out.join(' ');
}

function genMixWordsNumbers(len = 120) {
  const units = ['kitap', 'kalem', 'elma', 'öğrenci', 'gün', 'saat', 'dakika', 'kilometre', 'sayfa', 'kişi', 'lira', 'metre', 'yıl', 'ders'];
  const out = []; let total = 0;
  while (total < len) { const g = `${1 + rnd(999)} ${pick(units)}`; out.push(g); total += g.length + 1; }
  return out.join(' ');
}

function genSymbols(symbols, len = 80) {
  const s = [...symbols]; const out = []; let total = 0;
  const words = wordsFrom(TR_ALPHABET, { min: 3, max: 6 });
  while (total < len) {
    let g;
    const r = Math.random();
    if (r < 0.4) g = pick(s) + pick(s) + pick(s);
    else if (r < 0.75) g = pick(words) + pick(s);
    else g = pick(s) + pick(words) + pick(s);
    out.push(g); total += g.length + 1;
  }
  return out.join(' ');
}

function genCodeLike(len = 110) {
  const w = wordsFrom('abcdefghijklmnoprstuvyz', { min: 3, max: 7 });
  const forms = [
    () => `${pick(w)}@${pick(w)}.com`,
    () => `(${rnd(50)} + ${rnd(50)}) * ${rnd(9) + 1} = ?`,
    () => `%${rnd(100)} indirim!`,
    () => `"${pick(w)}" ve '${pick(w)}'`,
    () => `[${pick(w)}] {${pick(w)}}`,
    () => `${pick(w)}_${pick(w)}`,
    () => `${pick(w)}/${pick(w)}/${pick(w)}`,
    () => `#${pick(w)}`,
    () => `${rnd(10)} < ${10 + rnd(10)} > ${rnd(10)}`,
    () => `C:\\${pick(w)}\\${pick(w)}`,
    () => `${pick(w)} | ${pick(w)}`,
    () => `${rnd(90) + 10}$ & ${rnd(90) + 10}$`
  ];
  const out = []; let total = 0;
  while (total < len) { const g = pick(forms)(); out.push(g); total += g.length + 1; }
  return out.join(' ');
}

/* ---------- Ders tanımları ----------
   Her seviye: { name, gen: () => metin } */
const L = (name, gen) => ({ name, gen });
const HOME = ROW_HOME, HT = ROW_HOME + ROW_TOP, HB = ROW_HOME + ROW_BOTTOM + '.,', ALL = ROW_HOME + ROW_TOP + ROW_BOTTOM;

function rowWordLevels(must, pool, n, prefix) {
  const arr = [];
  const ranges = [[2, 4], [3, 5], [4, 6], [5, 7], [6, 9], [3, 8], [7, 12], [2, 12], [4, 10], [3, 7], [5, 12], [2, 9]];
  for (let i = 0; i < n; i++) {
    const [mn, mx] = ranges[i % ranges.length];
    arr.push(L(`${prefix} ${i + 1} (${mn}-${mx} harf)`, () => genWords(wordsFrom(pool, { must, min: mn, max: mx }), 110 + i * 6, must || pool.slice(0, 4), pool)));
  }
  return arr;
}

const LESSONS = [
  /* ------------------ BAŞLANGIÇ ------------------ */
  {
    id: 1, group: 'Başlangıç', title: 'Temel Sıra Tuşları', icon: '🏠',
    intro: 'Temel sıra, parmaklarının dinlendiği evdir. Sol elini <b>u i e a</b>, sağ elini <b>k m l y</b> tuşlarına yerleştir. <b>a</b> ve <b>k</b> tuşlarındaki küçük çıkıntıları işaret parmaklarınla bul. İşaret parmakların ayrıca içe doğru uzanarak <b>ü</b> ve <b>t</b> tuşlarına basar. Boşluk tuşuna başparmağınla bas.',
    levels: [
      L('a ve k', () => genDrill('ak', 'ak', 70)),
      L('e ve m', () => genDrill('em', 'em', 70)),
      L('a k e m karışık', () => genDrill('akem', 'akem', 90)),
      L('i ve l', () => genDrill('il', 'il', 70)),
      L('u ve y', () => genDrill('uy', 'uy', 70)),
      L('i l u y karışık', () => genDrill('iluy', 'iluy', 90)),
      L('Sekiz temel tuş', () => genDrill('uieakmly', 'uieakmly', 100)),
      L('ü ve t (içe uzanma)', () => genDrill('üt', 'üt' + 'akem', 80)),
      L('ş ve x (serçe uzanma)', () => genDrill('şx', 'şx' + 'yl', 80)),
      L('Tüm temel sıra', () => genDrill(HOME, HOME, 110)),
      L('Temel sıra kelimeleri I', () => genWords(wordsFrom(HOME, { max: 4 }), 100)),
      L('Temel sıra kelimeleri II', () => genWords(wordsFrom(HOME, { min: 3 }), 120))
    ]
  },
  {
    id: 2, group: 'Başlangıç', title: 'Üst Sıra Tuşları', icon: '⬆️',
    intro: 'Üst sıraya uzanırken parmağını yukarı kaldır, vuruştan sonra hemen temel sıraya geri dön. Sol işaret <b>ı</b> ve <b>o</b>, sağ işaret <b>r</b> ve <b>d</b>; orta parmaklar <b>ğ</b> ve <b>n</b>; yüzük parmakları <b>g</b> ve <b>h</b>; serçe parmaklar <b>f</b>, <b>p</b>, <b>q</b> ve <b>w</b> tuşlarına basar.',
    levels: [
      L('ı ve r', () => genDrill('ır', 'ır', 70)),
      L('ı r + temel sıra', () => genDrill('ır', 'ır' + HOME, 100)),
      L('o ve d', () => genDrill('od', 'od', 70)),
      L('o d + temel sıra', () => genDrill('od', 'odır' + HOME, 100)),
      L('ğ ve n', () => genDrill('ğn', 'ğn', 70)),
      L('ğ n + temel sıra', () => genDrill('ğn', 'ğnodır' + HOME, 100)),
      L('g ve h', () => genDrill('gh', 'gh', 70)),
      L('g h + temel sıra', () => genDrill('gh', 'ghğnodır' + HOME, 100)),
      L('f ve p', () => genDrill('fp', 'fp', 70)),
      L('f p + temel sıra', () => genDrill('fp', 'fpghğnodır' + HOME, 100)),
      L('q ve w', () => genDrill('qw', 'qwp', 70)),
      L('Tüm üst sıra', () => genDrill(ROW_TOP, ROW_TOP, 110)),
      L('Üst + temel kelimeler I', () => genWords(wordsFrom(HT, { must: ROW_TOP, max: 5 }), 110)),
      L('Üst + temel kelimeler II', () => genWords(wordsFrom(HT, { must: ROW_TOP, min: 4 }), 130))
    ]
  },
  {
    id: 3, group: 'Başlangıç', title: 'Alt Sıra Tuşları', icon: '⬇️',
    intro: 'Alt sıraya inerken parmağını hafifçe kıvır ve aşağı uzat. Sol işaret <b>c</b> ve <b>ç</b>, sağ işaret <b>s</b> ve <b>z</b>; orta parmaklar <b>v</b> ve <b>b</b>; yüzük parmakları <b>ö</b> ve <b>nokta</b>; serçe parmaklar <b>j</b> ve <b>virgül</b> tuşlarına basar.',
    levels: [
      L('c ve s', () => genDrill('cs', 'cs', 70)),
      L('c s + temel sıra', () => genDrill('cs', 'cs' + HOME, 100)),
      L('ç ve z', () => genDrill('çz', 'çz', 70)),
      L('ç z + temel sıra', () => genDrill('çz', 'çzcs' + HOME, 100)),
      L('v ve b', () => genDrill('vb', 'vb', 70)),
      L('v b + temel sıra', () => genDrill('vb', 'vbçzcs' + HOME, 100)),
      L('ö ve nokta', () => genDrill('ö.', 'ö.', 70)),
      L('ö . + temel sıra', () => genDrill('ö.', 'ö.vbçzcs' + HOME, 100)),
      L('j ve virgül', () => genDrill('j,', 'j,', 70)),
      L('j , + temel sıra', () => genDrill('j,', 'j,ö.vbçzcs' + HOME, 100)),
      L('Tüm alt sıra', () => genDrill(ROW_BOTTOM + '.,', ROW_BOTTOM + '.,', 110)),
      L('Alt + temel kelimeler', () => genWords(wordsFrom(HB, { must: ROW_BOTTOM }), 120)),
      L('Üç sıra kelimeler', () => genWords(wordsFrom(ALL, { must: ROW_BOTTOM, min: 4 }), 130))
    ]
  },
  {
    id: 4, group: 'Başlangıç', title: 'Sıralar Arası Geçişler', icon: '↕️',
    intro: 'Bu derste her parmak kendi sütununda yukarı ve aşağı hareket eder. Amaç, parmakların hangi tuşlardan sorumlu olduğunu kas hafızasına yerleştirmektir. Her vuruştan sonra temel sıraya dönmeyi unutma.',
    levels: [
      L('Sol serçe: f u j', () => genDrill('fuj', 'fuj', 80)),
      L('Sol yüzük: g i ö', () => genDrill('giö', 'giö', 80)),
      L('Sol orta: ğ e v', () => genDrill('ğev', 'ğev', 80)),
      L('Sol işaret: ı a c / o ü ç', () => genDrill('ıacoüç', 'ıacoüç', 90)),
      L('Sağ işaret: r k s / d t z', () => genDrill('rksdtz', 'rksdtz', 90)),
      L('Sağ orta: n m b', () => genDrill('nmb', 'nmb', 80)),
      L('Sağ yüzük: h l .', () => genDrill('hl.', 'hl.', 80)),
      L('Sağ serçe: p y , ş', () => genDrill('py,ş', 'py,ş', 80)),
      L('Sol el karışık', () => genDrill(LEFT_LETTERS, LEFT_LETTERS, 110)),
      L('Sağ el karışık', () => genDrill(RIGHT_LETTERS, RIGHT_LETTERS, 110)),
      L('Tüm harfler', () => genDrill(ALL, ALL, 120)),
      L('Kısa kelimeler', () => genWords(wordsFrom(TR_ALPHABET, { max: 4 }), 120)),
      L('Orta kelimeler', () => genWords(wordsFrom(TR_ALPHABET, { min: 4, max: 6 }), 130)),
      L('Uzun kelimeler', () => genWords(wordsFrom(TR_ALPHABET, { min: 6 }), 140))
    ]
  },
  {
    id: 5, group: 'Başlangıç', title: 'Türkçe Karakterler', icon: '🔡',
    intro: 'F klavyede Türkçe karakterler ayrı tuşlardadır: <b>ü</b> sol işaret, <b>ı</b> sol işaret, <b>ğ</b> sol orta, <b>ö</b> sol yüzük, <b>ç</b> sol işaret, <b>ş</b> sağ serçe parmakla yazılır. Bu ders, bu harfleri içeren kelimelerle refleks kazandırır.',
    levels: [
      L('ü ve ı', () => genDrill('üı', 'üıaeklm', 80)),
      L('ğ ve ö', () => genDrill('ğö', 'ğöaeiklm', 80)),
      L('ç ve ş', () => genDrill('çş', 'çşaeiklm', 80)),
      L('Altı Türkçe harf', () => genDrill('üığöçş', 'üığöçş', 100)),
      L('ü içeren kelimeler', () => genWords(wordsFrom(TR_ALPHABET, { must: 'ü' }), 110)),
      L('ı içeren kelimeler', () => genWords(wordsFrom(TR_ALPHABET, { must: 'ı' }), 110)),
      L('ğ içeren kelimeler', () => genWords(wordsFrom(TR_ALPHABET, { must: 'ğ' }), 110)),
      L('ö içeren kelimeler', () => genWords(wordsFrom(TR_ALPHABET, { must: 'ö' }), 110)),
      L('ç içeren kelimeler', () => genWords(wordsFrom(TR_ALPHABET, { must: 'ç' }), 110)),
      L('ş içeren kelimeler', () => genWords(wordsFrom(TR_ALPHABET, { must: 'ş' }), 110)),
      L('Hepsi bir arada', () => genWords(wordsFrom(TR_ALPHABET, { must: 'üığöçş', min: 4 }), 140))
    ]
  },
  {
    id: 6, group: 'Başlangıç', title: 'Temel Sıra Kelimeleri', icon: '🔤',
    intro: 'Yalnızca temel sıra harflerinden oluşan kelimelerle çalış. Parmaklarını evden ayırmadan akıcı yazmaya odaklan; hız yerine ritim ve doğruluk önemli.',
    levels: rowWordLevels('', HOME, 10, 'Kelimeler')
  },
  {
    id: 7, group: 'Başlangıç', title: 'Üst Sıra Kelimeleri', icon: '📝',
    intro: 'Temel ve üst sıra harflerini birlikte kullanan kelimeler. Her kelimede en az bir üst sıra harfi bulunur. Uzanıp hemen geri dönmeyi alışkanlık hâline getir.',
    levels: rowWordLevels(ROW_TOP, HT, 11, 'Kelimeler')
  },
  {
    id: 8, group: 'Başlangıç', title: 'Alt Sıra Kelimeleri', icon: '🧩',
    intro: 'Bu kelimelerin her birinde en az bir alt sıra harfi var. Artık üç sıranın tamamını kullanıyorsun; bileklerini sabit tut, yalnızca parmakların hareket etsin.',
    levels: rowWordLevels(ROW_BOTTOM, ALL, 9, 'Kelimeler')
  },
  {
    id: 9, group: 'Başlangıç', title: 'Başlangıç Son Tekrar', icon: '🎯',
    intro: 'Küçük harf, nokta ve virgül kullanarak gerçek cümleler yaz. Bu dersi rahatça tamamlayabiliyorsan temel bilgisayar kullanımı için yeterli seviyeye ulaşmışsın demektir.',
    levels: Array.from({ length: 11 }, (_, i) => L(`Cümleler ${i + 1}`, () => genSentences(SENTENCES_LOWER, 2 + Math.min(2, Math.floor(i / 4)))))
  },

  /* ------------------ ORTA SEVİYE ------------------ */
  {
    id: 10, group: 'Orta Seviye', title: 'Harf Havuzu (A - N)', icon: '🅰️',
    intro: 'Her seviyede tek bir harfe odaklan. O harfi içeren kelimelerle yoğun tekrar yaparak zayıf olduğun harfleri güçlendir.',
    levels: [...'abcçdefgğhıijklmn'].map((c) => L(`"${c}" harfi`, () => genWords(wordsFrom(TR_ALPHABET, { must: c }), 120, c, ALL)))
  },
  {
    id: 11, group: 'Orta Seviye', title: 'Harf Havuzu (O - Z)', icon: '🔠',
    intro: 'Alfabenin ikinci yarısı. Özellikle <b>ö, ş, ü</b> gibi Türkçe karakterlerde parmağının doğru tuşa gittiğinden emin ol.',
    levels: [...[...'oöprsştuüvyz'].map((c) => L(`"${c}" harfi`, () => genWords(wordsFrom(TR_ALPHABET, { must: c }), 120, c, ALL))),
      L('q, w ve x', () => genDrill('qwx', 'qwxaeikml', 90)),
      L('Tüm alfabe karışık', () => genWords(wordsFrom(TR_ALPHABET, { min: 5 }), 140)),
      L('Alfabe sıralı', () => [...TR_ALPHABET].join(' ') + ' ' + [...TR_ALPHABET].reverse().join(' '))]
  },
  {
    id: 12, group: 'Orta Seviye', title: 'Büyük Harf: İlk Adım', icon: '⇧',
    intro: 'Büyük harf yazarken <b>karşı eldeki Shift</b> tuşunu kullan. Sol elle yazılan bir harf için sağ serçe parmakla sağ Shift\'e, sağ elle yazılan harf için sol serçe parmakla sol Shift\'e bas. Dikkat: F klavyede <b>i</b> harfinin büyüğü <b>İ</b>, <b>ı</b> harfinin büyüğü <b>I</b>\'dır.',
    levels: [
      L('Sol temel: U İ E A Ü', () => genCapsDrill('uieaü')),
      L('Sağ temel: T K M L Y Ş', () => genCapsDrill('tkmlyş')),
      L('Sol üst: F G Ğ I O', () => genCapsDrill('fgğıo')),
      L('Sağ üst: D R N H P', () => genCapsDrill('drnhp')),
      L('Sol alt: J Ö V C Ç', () => genCapsDrill('jövcç')),
      L('Sağ alt: Z S B', () => genCapsDrill('zsb')),
      L('İ ve I farkı', () => genDrill('İIiı', 'İIiıaek', 80)),
      L('Tüm büyük harfler', () => genCapsDrill(TR_ALPHABET, 110)),
      L('Büyük harfle başlayan kelimeler', () => genCapWords(TR_ALPHABET, 110)),
      L('Tamamı büyük kelimeler', () => genWords(wordsFrom(TR_ALPHABET, { max: 5 }).map(trUpper), 90))
    ]
  },
  {
    id: 13, group: 'Orta Seviye', title: 'Büyük Harfli Kelimeler', icon: '🏙️',
    intro: 'İsimler, şehirler ve büyük harfle başlayan cümlelerle Shift kullanımını otomatik hâle getir. Shift tuşunu harften hemen önce bas, harfle birlikte bırak.',
    levels: [
      L('İsimler I', () => genWords(NAMES.slice(0, 18), 110)),
      L('İsimler II', () => genWords(NAMES.slice(18), 110)),
      L('Şehirler I', () => genWords(CITIES.slice(0, 20), 120)),
      L('Şehirler II', () => genWords(CITIES.slice(20), 120)),
      L('İsim + şehir', () => Array.from({ length: 6 }, () => `${pick(NAMES)} ${pick(CITIES)}`).join(' ')),
      L('Büyük harfli kelimeler', () => genCapWords(TR_ALPHABET, 130)),
      L('Kısa cümleler I', () => genSentences(SENTENCES.slice(0, 15), 2)),
      L('Kısa cümleler II', () => genSentences(SENTENCES.slice(15), 2)),
      L('Uzun cümleler I', () => genSentences(SENTENCES, 3)),
      L('Uzun cümleler II', () => genSentences(SENTENCES, 4))
    ]
  },
  {
    id: 14, group: 'Orta Seviye', title: 'Temel Noktalama İşaretleri', icon: '❗',
    intro: 'Nokta ve virgül alt sıradadır. <b>?</b> için sol Shift + sağ serçe ile <b>/</b> tuşu, <b>!</b> için sağ Shift + sol serçe ile <b>1</b> tuşu, <b>:</b> için Shift + nokta, <b>;</b> için Shift + virgül kullanılır. Kesme işareti <b>\'</b> Shift + 7 ile yazılır.',
    levels: [
      L('Nokta ve virgül', () => genSymbols('.,', 90)),
      L('Soru ve ünlem', () => genSymbols('?!', 90)),
      L('İki nokta ve noktalı virgül', () => genSymbols(':;', 90)),
      L('Kesme ve tırnak', () => genSymbols('\'"', 90)),
      L('Tire ve alt çizgi', () => genSymbols('-_', 90)),
      L('Karışık noktalama', () => genSymbols('.,?!:;\'"-', 110)),
      L('Noktalamalı cümleler', () => genSentences(SENTENCES, 4))
    ]
  },
  {
    id: 15, group: 'Orta Seviye', title: 'Sık Kullanılan Kelimeler', icon: '⭐',
    intro: 'Türkçede en sık geçen kelimeler hızının büyük kısmını belirler. Bu kelimeleri düşünmeden, tek bir hareket gibi yazabilene kadar tekrar et.',
    levels: [
      L('En sık 40 kelime', () => genWords(WORDS.slice(0, 40), 120)),
      L('Zamirler', () => genWords(WORDS.slice(WORDS.indexOf('ben'), WORDS.indexOf('sizin') + 1), 120)),
      L('Bağlaçlar ve zarflar', () => genWords(WORDS.slice(WORDS.indexOf('evet'), WORDS.indexOf('fakat') + 1), 120)),
      L('Fiiller', () => genWords(WORDS.filter((w) => /mak$|mek$/.test(w)), 130)),
      L('Çekimli fiiller', () => genWords(WORDS.filter((w) => /(di|dı|du|dü|ti|tı|tu|tü|yor|cak|cek)$/.test(w) && w.length > 3), 130)),
      L('Günlük kelimeler', () => genWords(WORDS.slice(WORDS.indexOf('ev'), WORDS.indexOf('domates') + 1), 130)),
      L('Sıfatlar', () => genWords(WORDS.slice(WORDS.indexOf('büyük'), WORDS.indexOf('sığ') + 1), 130)),
      L('Karışık sık kelimeler', () => genWords(WORDS.slice(0, 260), 150))
    ]
  },
  {
    id: 16, group: 'Orta Seviye', title: 'Sayılar ve Kelimeler', icon: '🔢',
    intro: 'Sayı sırasına uzanmak için parmaklarını temel sıradan iki sıra yukarı kaldır. <b>1</b> sol serçe, <b>2</b> sol yüzük, <b>3</b> sol orta, <b>4-5</b> sol işaret, <b>6-7</b> sağ işaret, <b>8</b> sağ orta, <b>9</b> sağ yüzük, <b>0</b> sağ serçe parmakla yazılır.',
    levels: [
      L('4 ve 7', () => genNumbers('47')),
      L('5 ve 6', () => genNumbers('56')),
      L('3 ve 8', () => genNumbers('38')),
      L('2 ve 9', () => genNumbers('29')),
      L('1 ve 0', () => genNumbers('10')),
      L('Sol el rakamları', () => genNumbers('12345')),
      L('Sağ el rakamları', () => genNumbers('67890')),
      L('Tüm rakamlar', () => genNumbers('1234567890', 110)),
      L('Tarihler', () => genNumbers('', 110, 'dates')),
      L('Telefon numaraları', () => genNumbers('', 110, 'phone')),
      L('Sayı ve kelime', () => genMixWordsNumbers(120)),
      L('Toplama işlemleri', () => genNumbers('', 110, 'math')),
      L('Sayılı cümleler', () => [`Saat ${1 + rnd(12)}.${10 + rnd(50)} itibarıyla ${2 + rnd(40)} kişi salona girdi.`,
        `Kitabın ${10 + rnd(300)}. sayfasında ${1 + rnd(9)} resim var.`,
        `${1900 + rnd(125)} yılında ${2 + rnd(98)} yaşında olan dedem doğmuş.`].join(' ')),
      L('Plaka kodları', () => Array.from({ length: 8 }, () => `${String(1 + rnd(81)).padStart(2, '0')} ${trUpper(pick([...'abcdefghjklmnprstuvyz']))}${trUpper(pick([...'abcdefghjklmnprstuvyz']))} ${100 + rnd(900)}`).join(' ')),
      L('Fiyatlar', () => Array.from({ length: 8 }, () => `${pick(WORDS.slice(WORDS.indexOf('su'), WORDS.indexOf('balık') + 1))} ${1 + rnd(500)},${10 + rnd(89)} TL`).join(' ')),
      L('Karışık sayılar', () => genMixWordsNumbers(80) + ' ' + genNumbers('1234567890', 60))
    ]
  },

  /* ------------------ İLERİ SEVİYE ------------------ */
  {
    id: 17, group: 'İleri Seviye', title: 'Klavye Çeyrekleri', icon: '🧭',
    intro: 'Klavyeyi dört bölgeye ayırıp her bölgeyi ayrı ayrı çalış. Ardından yalnızca tek elle yazılan kelimeler ve eller arasında sürekli geçiş gerektiren kelimelerle koordinasyonunu geliştir.',
    levels: [
      L('Sol üst çeyrek', () => genDrill('fgğıo', 'fgğıouiea', 100)),
      L('Sağ üst çeyrek', () => genDrill('drnhpqw', 'drnhpqwtkmly', 100)),
      L('Sol alt çeyrek', () => genDrill('jövcç', 'jövcçuiea', 100)),
      L('Sağ alt çeyrek', () => genDrill('zsb.,', 'zsb.,tkmly', 100)),
      L('Sol el kelimeleri', () => genWords(wordsFrom(LEFT_LETTERS, { min: 2 }), 110, LEFT_LETTERS, LEFT_LETTERS)),
      L('Sağ el kelimeleri', () => genWords(wordsFrom(RIGHT_LETTERS, { min: 2 }), 110, RIGHT_LETTERS, RIGHT_LETTERS)),
      L('El değiştiren kelimeler', () => genWords(WORDS.filter((w) => {
        let sw = 0; for (let i = 1; i < w.length; i++) if (LEFT_LETTERS.includes(w[i]) !== LEFT_LETTERS.includes(w[i - 1])) sw++;
        return w.length >= 4 && sw >= w.length - 2;
      }), 130)),
      L('Uzak tuş geçişleri', () => genDrill('fpqwjx,ş', 'fpqwjx,şğn', 110)),
      L('Çapraz sıra geçişleri', () => genDrill('fçpzıbg.', 'fçpzıbg.öhvr', 110)),
      L('Sayı sırası ve harfler', () => genDrill('1234567890', 'aekm1234567890', 110)),
      L('Uzun kelimeler', () => genWords(wordsFrom(TR_ALPHABET, { min: 8 }), 150)),
      L('Çeyrek karması', () => genWords(wordsFrom(TR_ALPHABET, { min: 5 }), 160))
    ]
  },
  {
    id: 18, group: 'İleri Seviye', title: 'Semboller ve Gelişmiş Noktalama', icon: '💠',
    intro: 'Sayı sırasındaki semboller Shift ile, köşeli ve süslü parantezler, <b>@</b>, <b>#</b>, <b>\\</b> ve <b>|</b> ise <b>Alt Gr</b> ile yazılır. Alt Gr tuşunu sağ başparmakla basılı tutup sembolün tuşuna bas.',
    levels: [
      L('Shift sembolleri I: ! " ^ $', () => genSymbols('!"^$', 90)),
      L('Shift sembolleri II: % & ( )', () => genSymbols('%&()', 90)),
      L('Shift sembolleri III: = ? * _', () => genSymbols('=?*_', 90)),
      L('Küçük, büyük, artı, eksi', () => genSymbols('<>+-/', 90)),
      L('Alt Gr: @ # { }', () => genSymbols('@#{}', 90)),
      L('Alt Gr: [ ] \\ |', () => genSymbols('[]\\|', 90)),
      L('Gerçek hayattan semboller', () => genCodeLike(120)),
      L('Sembol karması', () => genSymbols('!"^$%&()=?*_<>+-/@#{}[]', 120))
    ]
  },
  {
    id: 19, group: 'İleri Seviye', title: 'Gelişmiş Doğruluk', icon: '🎖️',
    intro: 'Zorlu harf çiftleri, tekerlemeler ve uzun metinlerle doğruluğunu zirveye taşı. Bu derste hız ikinci planda; hedef %98 ve üzeri doğruluk.',
    levels: [
      L('Zor harf çiftleri', () => genDrill('ğıöüçş', 'ğıöüçşiu', 110)),
      L('ı ve i ayrımı', () => genWords(wordsFrom(TR_ALPHABET, { must: 'ı' }).concat(wordsFrom(TR_ALPHABET, { must: 'i' })).filter((w) => w.length > 3), 130)),
      L('Benzer kelimeler', () => genWords(['kar', 'kır', 'kör', 'kur', 'kür', 'dal', 'dil', 'dul', 'del', 'bal', 'bel', 'bil', 'bol', 'bul', 'gel', 'gül', 'göl', 'kel', 'kül', 'kal', 'kol', 'kil', 'sal', 'sel', 'sol', 'sil', 'tel', 'til', 'tol', 'tul'], 130)),
      L('Tekerlemeler I', () => genSentences(TONGUE.slice(0, 4), 2)),
      L('Tekerlemeler II', () => genSentences(TONGUE.slice(4), 2)),
      L('Uzun kelimeler', () => genWords(wordsFrom(TR_ALPHABET, { min: 9 }), 150)),
      L('Karma cümleler', () => genSentences(SENTENCES.concat(SENTENCES_LOWER), 4)),
      L('Usta testi', () => genSentences(SENTENCES, 3) + ' ' + genCodeLike(50))
    ]
  },
  {
    id: 20, group: 'İleri Seviye', title: 'Hız Paragrafları', icon: '🚀',
    intro: 'Gerçek yazı deneyimine en yakın bölüm. Özgün paragraflarla akıcılığını ve dayanıklılığını geliştir. Ritmini koru, hata yapınca durma; düzelt ve devam et.',
    levels: PARAGRAPHS.map((p, i) => L(`Paragraf ${i + 1}`, () => p))
  }
];

// Ders hedef hızları (kelime/dk)
LESSONS.forEach((l) => {
  l.target = l.id <= 5 ? 12 : l.id <= 9 ? 18 : l.id <= 13 ? 22 : l.id <= 16 ? 24 : l.id <= 19 ? 28 : 32;
});

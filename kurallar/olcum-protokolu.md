# Ölçüm protokolü: ne ölçülür, nasıl ölçülür, neye inanılmaz

Son gözden geçirme: 2026-11-08

Bu repodaki kurallar bir **yayın öncesi kalite kapısıdır**; sıralamayı ya da atıfı garantilemez. Etkiyi kendi verinle ölçmen gerekir. Bu dosya bunun için minimum yöntemi anlatır. Kanıt düzeyleri: **[resmî]**, **[çalışma]** (yöntemi açık ölçüm), **[satıcı]** (ürün satan kaynak), **[gözlem]** (tek site ya da tek kişi).

## 1. Birincil veriler (ücretsiz)

| Veri | Nerede | Not |
|---|---|---|
| Tıklama, gösterim, sorgu, sayfa, konum | Google Search Console | Birincil ölçü tıklama ve oturumdur; gösterim ve ortalama konum ikincildir. |
| Yapay zekâ gösterimleri | Search Console "Search Generative AI performance" raporu (3 Haziran 2026'da duyuruldu, 31 Ağustos 2026'da tüm sitelere açıldı) | Yalnız gösterim verir, tıklama yok; "görünürlük" okunur, "trafik" okunmaz. [resmî] |
| Copilot ve Bing yapay zekâ alıntıları | Bing Webmaster "AI Performance" (10 Şubat 2026, genel önizleme) | Toplam alıntı, sayfa bazında alıntı ve "grounding query" örnekleri; sıralama ya da konum göstermez. [resmî] |
| YouTube arama ve izlenme kaynakları | YouTube Studio > Analytics > Erişim | Aramadan gelen izlenmeyi ve sorguları gösterir. |
| Sunucu ve CDN günlükleri | Barındırma ya da CDN paneli | Bot ziyaretleri için tek gerçek kaynak (bölüm 4). |

Takip araçlarının (üçüncü taraf) verisine Search Console kadar güvenme; kazıma engelleri verilerini bozabiliyor. [gözlem]

## 2. Yayın sonrası değişiklik ölçümü

1. Değişiklik yapmadan önce ilgili sayfaların son 28 günlük tıklama, gösterim, TO ve konumunu kaydet (Search Console CSV).
2. **Az sayfa, uzun bekleme:** aynı anda birkaç sayfayı değiştir, en az 3-4 hafta bekle. Toplu başlık değiştirme sıralanan sayfaları sarsabilir.
3. Karşılaştırma için **değiştirmediğin benzer sayfalardan kontrol grubu** tut; mevsimsellik ve güncelleme dalgası kontrol grubunda da görünür.
4. Sonucu `araclar/gsc.mjs cozulme onceki.csv simdiki.csv` ile bak: gösterim sabit, tıklama düşenler başlık/açıklama sorunudur ya da yapay zekâ özeti tıklamayı almıştır.
5. Sahte sıçramaları ayıkla: `araclar/gsc.mjs anomali dosya.csv` konumu 10'dan kötü olup tıklama oranı %40'ı aşan satırları işaretler (kazıyıcı verisi olabilir). Bu satırları trend analizine alma.

## 3. Yapay zekâ görünürlüğü ölçümü

Tek bir istemin tek sonucu anekdottur. Minimum protokol:

1. **30-50 gerçek karar sorusu** yaz (kullanıcının gerçekten soracağı biçimde).
2. Her soruyu her motorda (Google AI Mode/AI Overviews, ChatGPT, Perplexity, Copilot) **3-5 kez** çalıştır; motorlar ayrı raporlanır.
3. **Dört şeyi ayrı say:** anılma, öneri, atıf, tıklama. Sonucu paydalı yaz ("12 koşunun 3'ünde atıf"), "bilinmiyor" geçerli bir sonuçtur.
4. Haftada bir tekrarla: atıflar çabuk değişir. Bir ölçümde (Sistrix, 17 hafta) kaynakların haftalık yaklaşık %56'sı AI Mode'da, %74'ü ChatGPT Search'te değişti; bir diğerinde atıfların büyük kısmı 20 gün içinde kayboldu ve çoğu geri döndü. [satıcı/çalışma]
5. Yapay zekâ görünürlüğü ile marka araması ya da doğrudan trafik arasında güvenilir ilişki kurmak zordur: bir uygulayıcı 4 marka ve 17 haftalık veride ilk bulduğu ilişkiyi kontrol sonrası kaybetti. [gözlem, yöntem açık] Görünürlüğü trafik değil, marka kanalı say.
6. Yapay zekâ botlarının getirdiği trafik küçüktür: 100 sitelik bir GA4 havuzunda ChatGPT trafiği Google organiğinin yaklaşık %0,62'siydi; ziyaretçi daha iyi dönüştü ama toplamda Google çok daha fazla dönüşüm getirdi. [gözlem, tek kaynak]
7. Yargıç olarak başka bir yapay zekâ kullanıyorsan **uzunluk yanlılığına** dikkat et: yapay zekâ yargıçlar daha uzun yanıtları insanlardan daha sık seçebiliyor. Uzunluğu eşitle ya da kural tabanlı ölçüt kullan.

## 4. Yapay zekâ botu günlükleri

- User-Agent tek başına kanıt değildir: bir sitede bot adı taşıyan isteklerin çoğu IP doğrulamasından geçmedi (tek site gözlemi). Yayımlanmış IP aralıklarıyla doğrula.
- Araç: `node araclar/bot-log.mjs <erişim.log> [--ip-listesi aralik.txt]` bot adına göre isteği, benzersiz yolu ve doğrulanan/doğrulanmayan oranı verir.
- `llms.txt` istekleri çok düşük bulundu: bir sitede 78 günde 241 istek, doğrulanan yalnız 7; bir yeni sitede 75 saatte doğrulanmış 440 bot isteğinin 10'u. RSS ve sayfaların Markdown kopyaları daha çok istek aldı. [gözlem, tek site]

## 5. İç kontrol listesi: sayılar ve olgular

- Yazıdaki her sayı için birincil kaynak adresi ve okunma tarihi yaz; kaynak ikincil bir blogsa "birincile ulaşılamadı" diye işaretle. Dolaşımdaki istatistiklerin büyük kısmı kaynağına ulaşınca değişiyor ya da çıkmaz sokağa varıyor. [satıcı çalışma]
- `kontrol.mjs` kaynaksız sayı yoğunluğunu `olgu-kaynak` uyarısıyla yakalar.

## 6. Kendi A/B'n (sosyal açıklama)

"Arama cümlesi ilk satırda" gibi bir kuralı kendi videolarında 2 hafta dene: aynı türden iki video, biri eski, biri yeni açıklamayla; YouTube Studio'da aramadan gelen izlenme ve ilk 48 saat. Küçük örneklemde sonuç yön gösterir, kanıt değildir.

## 7. Başlık testi (düşük tıklama oranı)

`node araclar/gsc.mjs dusuk-to sorgular.csv` konumu 3-10 olup tıklama oranı aynı konum bandının ortancasının yarısından düşük sayfaları listeler. Test yöntemi:

1. Canlı arama sonucuna bak: rakip başlıklar ne söylüyor, yapay zekâ özeti var mı? (Özet varsa düşük TO normal olabilir.)
2. Sayfada gerçekten olan bir ayrıntıyla 3 başlık adayı yaz (`kurallar/baslik-kancalari.md`), birini seç.
3. **Tek seferde tek sayfa** değiştir; benzer ama değiştirmediğin sayfaları kontrol grubu olarak izle.
4. Değişikliği deftere yaz: `node araclar/baslik-testi.mjs baslat <url> --eski "..." --yeni "..." --tur <kanca türü> --once <sayfanın sorgu CSV'si> [--kontrol <url> --kontrol-once <csv>]`.
5. En az 14 gün sonra aynı uzunlukta dönemi dışa aktar ve ölç: `baslik-testi.mjs olc <url> --sonra <csv> [--kontrol-sonra <csv>]`. Araç yalnız iki dönemde de görünen ve konumu ±1,5 içinde kalan sorguları karşılaştırır (konum değiştiyse fark başlıktan gelmeyebilir), kontrol sayfasındaki değişimi düşer ve KAZANDI / KAYBETTİ / BELİRSİZ / YETERSİZ VERİ / ERKEN der. Kaybettiyse eski başlığa dön.
6. "Birinci sayfada gösterilip hiç tıklanmayan sorgular" listesi bir sonraki adayın hedefidir: o aramaların sorusunu sayfada karşılıyorsan başlıkta söyle.
7. Birkaç test bitince `baslik-testi.mjs ders` kanca türüne, sayı/soru içermesine ve uzunluk değişimine göre özet verir. 5 testten az grup hipotezdir; sonuç yalnız kendi sitende geçerlidir.

Tıklama oranının sıralamayı ne kadar etkilediği tartışmalıdır; bu testin amacı sıralama değil, aynı gösterimden daha çok tıklama almaktır. Reklamla başlık denemesi ya da tıklama yaptırma gibi yöntemler kullanılmaz.

## 8. Kendi beyanlı kaynak sorusu

Analitik araçlar yapay zekâ ve sohbet kaynaklı ziyaretleri çoğu zaman "doğrudan" sayar. Kayıt ya da iletişim formun varsa isteğe bağlı bir "Bizi nereden duydunuz?" alanı ekle (seçenekler: Google, ChatGPT/yapay zekâ, YouTube, Instagram, TikTok, arkadaş, diğer). Kişisel veri istemeden, toplu sayı olarak raporla.

## 9. Search Console yapay zekâ kontrolü ve gelecek veriler

- **Search generative AI control** (Ayarlar; 31 Ağustos 2026'dan beri herkese açık): Include / Exclude / Inherit. **Exclude** seçmek siteyi AI Overviews, AI Mode ve Discover AI özelliklerinden çıkarır; oradan gelen trafik ve gösterim kaybolur. Bilerek seç; varsayılan bırakmak çoğu site için doğrudur. [resmî]
- UK CMA kararına göre Google'ın 3 Aralık 2026'ya kadar yapay zekâ özellikleri için **toplu** (AI Overviews + AI Mode birlikte) gösterim, tıklama ve TO vermesi bekleniyor; özellik başına ayrım beklenmiyor. Bu veri gelince "Search Generative AI performance" gösterimlerini organik raporla sayfa bazında karşılaştır. [resmî]
- Etki büyüklüğü için en güçlü kanıt şu an randomize bir alan deneyi: AIO gösterilen aramalarda dış organik tıklama ~%38-40 düştü (hakemsiz taslak). Soru biçimli sorgularda AIO çok daha sık çıkıyor (~%65); bu sorgularda başlık, özetin veremeyeceği ayrıntıyı vaat etmeli (`kurallar/baslik-kancalari.md`).

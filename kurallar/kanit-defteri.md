# Kanıt defteri: neye inanıyoruz, neyi kural yapmadık

Son gözden geçirme: 2026-11-08

Bu repo kanıt düzeyini açıkça etiketler. Burada iddiaları üç gruba ayırdık. Rakamlar okuma tarihi (8 Kasım 2026) itibarıyladır; ikinci el aktarımlar "(özetten)" diye işaretli.

## A. Sağlam: resmî belge ya da yöntemi açık ölçüm

| İddia | Dayanak |
|---|---|
| Google yapay zekâ özelliklerine uygunluk: sayfa dizinde ve snippet'e uygun olmalı, ayrıca site Search Console "Search generative AI" kontrolünde dahil olmalı (varsayılan Include). Bu kontrolün dışında yapay zekâya özel bir optimizasyon gerekmez. | [resmî] AI optimization guide (son güncelleme 10 Temmuz 2026); eski AI features sayfası (10 Aralık 2025) hâlâ "ek şart yok" diyor |
| Google'a göre llms.txt arama için kullanılmaz, ne yardım ne zarar. İçeriği küçük parçalara bölmek ya da özel cümle kalıbı gerekmez. | [resmî] Google güncelleme günlüğü (15 Haziran 2026), AI optimization guide |
| FAQ zengin sonucu Google Arama'da 7 Mayıs 2026'dan beri gösterilmiyor. | [resmî] Google güncelleme günlüğü |
| Ölçekli, değersiz içerik üretimi ve sahte anma spam sayılır. Yapay zekâ üretimi içerik yasak değil; olgu denetimi önerilir. | [resmî] Google spam politikaları, using-gen-ai-content |
| Görünür tarih ve `datePublished/dateModified` sayfanın gerçek yayın ya da güncelleme tarihini yansıtmalı. | [resmî] Google publication dates |
| YouTube: başlık ≤ 100, açıklama ≤ 5.000, en çok 3 hashtag başlık üstünde, 60+ hashtag'de hepsi yok sayılır, bölümler ≥ 3 damga ve ≥ 10 sn. | [resmî] YouTube yardım |
| OpenAI, Anthropic ve Perplexity arama ve eğitim botlarını ayrı yönetir; kullanıcı isteğiyle gelen botlar (ChatGPT-User, Perplexity-User) robots.txt'i her zaman izlemeyebilir. | [resmî] botlar belgeleri |
| ChatGPT ve Claude botları sonradan JavaScript ile gelen içeriği okumadı (küçük testler). | [çalışma, ikincil] |
| GEO çalışması: kaynak gösterme, alıntı ve istatistik eklemek ölçülen alıntı görünürlüğünü artırdı; anahtar kelime yığma işe yaramadı (Perplexity'de taban çizginin yaklaşık %10 altında kaldı). İki motorda, 2023 verisi. | [çalışma] arXiv 2311.09735 |
| Aynı sitede, başlığı ve paragrafı soruyla eşleşen sayfalar daha çok alıntılanır; getirme (retrieval) varyansın büyük bölümünü açıklar, sayfa özellikleri azını. | [çalışma] arXiv 2610.15033 |

## B. Karışık ya da sınırlı kanıt (kural yaptık ama ölçerek karar ver)

| İddia | Neden temkinli |
|---|---|
| Tablo, içindekiler, 5+ H2, soru biçimli başlık atıfla ilişkili. | Korelasyon; satıcı verisi (bir çalışmada tablo +%69 olasılık, aynı çalışma "sadece korelasyon" diyor). Aynı çalışmada yazar imzası negatif çıktı; başka satıcı tersini söylüyor. |
| Cevap önce (sayfanın ilk bölümünde doğrudan cevap) atıf alan sayfalarda daha yaygın. | Korelasyon. Okur için de iyi olduğu için kural kaldı. |
| Tazelik: eski sayfalar atıf kaybedebilir. | Satıcı verisi çelişkili; sahte tarih yasak (Google rehberiyle çelişir). `dateModified` yalnız gerçek değişiklikte değişir. |
| YouTube bir yapay zekâ cevabı kaynağı olarak büyüyor. | Satıcı ölçümleri, farklı örneklem; yön tutarlı ama büyüklük belirsiz. |
| Başlık: ana ifade başta, ayırt edici ayrıntı sonda. | Tek site testleri ve Google'ın kısa/özgün başlık önerisi; sihirli kelime yok. |

## C. Kural yapmadık (kanıtsız, çelişkili ya da riskli)

| İddia | Neden |
|---|---|
| "llms.txt AI atıfı getirir" | Büyük ölçekli ölçümler ilişki bulmadı; sunucu günlüklerinde istekler çok az ve çoğu doğrulanamadı. Ayrıca llms.txt içine komut ya da harici paket yazmak güvenlik riski (ikinci el haber). |
| "Şema ekleyince AI atıfı artar" | Bir ölçümde ilk kez şema ekleyen sayfalarda net kazanç görülmedi. Şema zengin sonuç ve doğruluk için tutulur. |
| "YouTube açıklamasını güncelleyince AI erişimi %359 arttı" | Satıcı vakası; kontrol grubu ve yöntem açık değil. Kendi A/B'nle ölç. |
| "Garantili atıf / ilk sayfa" | Hiçbir araç atıf garantilemez. |
| Yalnız AI botlarına farklı içerik sunan "makine katmanı" | Gizleme (cloaking) benzeri; kötüye kullanım yüzeyi. Botlara ve insanlara aynı içeriği sun. |
| Tıklama manipülasyonu ("reklamla başlık testi", "mahkemede kabul edildi") | Doğrulanamadı; tıklama manipülasyonuna kayar. |
| Ölçekli çok sayfa üretimi, "parazit SEO", bağlantı şemaları, katmanlı sosyal gönderi ağı | Google'ın ölçekli içerik ve site itibarı politikalarına aykırı olabilir; spam dedektörleri hedefler. |
| Sızdırılmış "iç tahminler" (yeniden tarama süresi vb.) | Kaynak doğrulanamadı. |
| Satılık geri bağlantı paketi, "AI için bağlantı" | Satıcı çıkarı; marka anmalarının bağlantıdan daha güçlü ilişkili olduğu çalışmalar var. Gerçek anılma kazan. |
| Tek tweetlik anekdotlar (ör. "şu başlıkla sıçradık") | Karar dayanağı olmaz; hipotez olarak not al, ölç. |

## Kaynak güvenilirliği (uygulayıcı hesapları için kaba rehber)

- **Şeffaf ve yöntem yazanlar:** olumsuz sonucu da paylaşan, örneklem ve gecikme seçimini açıklayan, gözlemi tahminden ayıran uygulayıcılar.
- **Satıcı ya da satış amaçlı:** kendi aracı ya da hizmetinin vaka çalışmasını yayımlayanlar; onların rakamlarını yöntem açık değilse tek başına kullanma.
- **Aktarımcılar:** başkasının çalışmasını özetleyen hesaplar; orijinal çalışmayı okumadan sayısını kullanma.

## Kullanıcının paylaştığı tweetlerden (8 Kasım 2026) kural yapılmayanlar

| İddia | Neden alınmadı |
|---|---|
| "Tıklama oranı büyük bir sıralama faktörü; reklamla başlık test et" | Satıcı tweeti; tartışmalı ve tıklama manipülasyonuna kayabilir. Yalnızca başlık testi yöntemi (tek değişiklik, kontrol grubu) alındı. |
| Kara şapka, parazit SEO, gizli istemle ChatGPT'ye önerdirme, toplu basın bülteni, AI Overviews'u YouTube ile oyuna getirme, günde 500 programatik sayfa | Google spam politikalarına aykırı (ölçekli içerik, site itibarı istismarı); bu repo önermez. |
| "Tam eşleşen alan adlarıyla 10 günde 1. sıra" | Tek anekdot; ölçekli/ince içerik riski. |
| "2 saniye gecikme müşterilerin %40'ını kaybettirir" gibi kaynaksız yerel SEO rakamları | Kaynak gösterilmedi. Hız için Core Web Vitals eşikleri yeterli. |
| "0 KD ve 0-10 aranma hacimli anahtar kelimeler" | Mantıklı başlangıç stratejisi ama ücretli anahtar kelime aracı gerektirir; araç hacim tahmini kanıt değildir. Repo bunun yerine kendi Search Console verini (`gsc.mjs bosluk`, `yakin`) kullanır. |

## Üçüncü tur: dış denetim raporundaki iddiaların doğrulaması (8 Kasım 2026)

Bir kullanıcı başka bir yapay zekâdan gelen bir denetim raporu paylaştı. İddiaları birincil kaynaktan tek tek kontrol ettik; yalnızca doğrulananlar burada, sürüm ve sınırlarıyla.

### Doğrulananlar

| İddia (düzeltilmiş hali) | Kaynak | Tür |
|---|---|---|
| Aynı site içinde alıntı farkının çoğunu getirme (retrieval) açıklıyor (~%32), sayfa özellikleri azını (~%2,8). 651 sorgu, yaklaşık 39 bin URL (makale 39.043 ve 39.059 diye iki sayı veriyor). ChatGPT'nin, soruda adı geçmeyen markaları andığı durumların %46'sında o markayı anan alıntılanmış bir sayfa yok. | Chen & Koudas, [arXiv 2610.15033](https://arxiv.org/abs/2610.15033), 10 Ekim 2026 | [çalışma], hakemsiz ön baskı |
| Yapay zekâ özeti (AIO) gösterilen aramalarda dış organik tıklama yaklaşık %38-40 düşüyor (son sürüm %39,8). 1.065 ABD'li masaüstü Chrome kullanıcısıyla randomize alan deneyi. | Agarwal & Sen, [SSRN 6513059](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6513059), Nisan/Haziran 2026 | [çalışma], hakemsiz taslak |
| 55.393 trend sorguda AIO %13,7 oranında çıkıyor, soru biçimli sorgularda ~%65. Alıntılanan alan adlarının %29,8'i aynı sorgunun ilk sayfa sonuçlarında yok. Atomik iddiaların ~%11'i gösterilen kaynakla desteklenmiyor (yazarlara göre üst sınır). | Xu, Iqbal, Montgomery (WashU), [arXiv 2605.14021](https://arxiv.org/abs/2605.14021), ACM IMC 2026 | [çalışma] |
| Search Console "Search generative AI control" (Include / Exclude / Inherit) 31 Ağustos 2026'dan beri tüm sitelerde. Exclude seçilirse site AI Overviews, AI Mode ve Discover AI özelliklerinden trafik ve gösterim kaybeder. | [Google yardım 16908024](https://support.google.com/webmasters/answer/16908024) | [resmî] |
| UK CMA kararına göre Google'ın uyum son tarihi 3 Aralık 2026; sayfa düzeyi kontrol için +3 ay. Şeffaflık verisi (gösterim, tıklama, TO) AI Overviews ve AI Mode için **toplu** veriliyor, özellik başına değil. | [CMA Publisher Conduct Requirement](https://assets.publishing.service.gov.uk/media/6a7195d7aec8358a34958bfa/Publisher_conduct_requirement_-_3_Aug_2026.pdf) | [resmî] |
| Lighthouse 13.3.0 (7 Mayıs 2026) varsayılan yapılandırmaya deneysel "agentic-browsing" kategorisini ekledi. Denetimler: `agent-accessibility-tree`, `webmcp-form-coverage`, `webmcp-registered-tools`, `webmcp-schema-validity`, `llms-txt`. Kategori geliştirme aşamasında. | [Lighthouse v13.3.0 sürüm notu](https://github.com/GoogleChrome/lighthouse/releases/tag/v13.3.0) | [resmî] |
| Cloudflare "Markdown for Agents": bir örnek sayfada HTML 16.180 token, Markdown 3.150 token. Tek sayfa örneği, genel ölçüt değil. | [Cloudflare blog](https://blog.cloudflare.com/markdown-for-agents/), 12 Şubat 2026 | [satıcı belgesi] |
| TikTok Content Posting API'de açıklama (title) en çok 2.200 UTF-16 karakter. Uygulama içi 4.000 sınırı resmî kaynakta doğrulanamadı. | [TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post) | [resmî] |
| Instagram'da profesyonel, herkese açık, 18 yaş üstü hesapların 1 Ocak 2020 sonrası gönderileri arama motorlarınca dizine eklenebilir; ayar gizlilik ayarlarından kapatılabilir. "10 Temmuz 2025" tarihi yalnızca ikincil kaynaklarda. | [Instagram yardım 147542625391305](https://help.instagram.com/147542625391305/) (arama özeti) | [resmî, özetten] |
| Google, 24 Eylül 2026'da VideoObject yapılandırılmış verisine `creator` özelliğini ekledi (`author` da kabul ediliyor). | [Google Search güncelleme günlüğü](https://developers.google.com/search/updates) | [resmî] |
| OtterlyAI: yapay zekâ alıntılarının %94'ü uzun YouTube videolarına gidiyor; alıntılanan videoların %31'inde zaman damgası sinyali var; zaman damgalı videoların %78'i birden fazla kez alıntılanıyor. | [OtterlyAI YouTube alıntı çalışması](https://otterly.ai/blog/the-youtube-citation-study-2026/), 2 Mart 2026 | [satıcı], korelasyon |

### Doğrulanamayan ya da yanlış çıkanlar (eklenmedi)

| Rapordaki iddia | Sonuç |
|---|---|
| "Alıntılanan URL'lerin %36,8'i robots.txt'e uyan bota HTML döndürmedi" | Makalede bu ifade yok; %63,2 kullanılabilir HTML'in tamamlayanından türetilmiş ve bunun bir kısmı (%18,9) robots.txt yüzünden hiç istenmemiş. |
| "%46 hiçbir sayfaya dayanmadan" genel ifade | Yalnızca soruda adı geçmeyen markalar için geçerli. |
| "Google AI özellikleri için ayrı tıklama/CTR vermek zorunda" | CMA kararı toplu veri istiyor. |
| "AIO tıklamalarının %22,4'ü Direct görünüyor", "Gemini alıntılarının %84,1'i `#:~:text=` taşıyor" | Kaynak bulunamadı. |
| "AIO yanıtlarının %29'unda YouTube, %32'sinde LinkedIn" | Belirtilen kaynaklarda bu sayılar yok. |
| "GSC Keyword Preservation Audit" adlı araç | Bulunamadı; fikir yine de faydalı olduğu için kendi `--koru-gsc` kuralımızı yazdık. |
| Lighthouse denetim adları "accessibility-for-agents", "registered-webmcp-tools" | Gerçek kimlikler farklı (yukarıda). |
| xSeek deposunun MIT lisanslı olduğu | GitHub API'de lisans yok. |
| "Instagram yardım merkezi: en çok 5 etiket, fazlası yorumu engeller" | Yardım sayfasının arama özeti 30 diyor (sayfa araçla açılamadı); 5 sınırını haberler bildiriyor ve kullanıcı kendi hesabında doğruladı. Araç kullanıcı doğrulamasına göre 5'i esas alır; resmî metin çelişkili. |
| Çetinkaya-Uzun formülü | Katsayılar (118,823 / 25,987 / 0,971) ikincil bir makaleden doğrulandı, ama "ortalama sözcük uzunluğu" biriminin hece olduğu doğrulanmadı. Bu yüzden araca eklenmedi. |

## Dördüncü tur: ikinci dış raporun doğrulaması (8 Kasım 2026)

### Doğrulananlar

| İddia | Kaynak | Tür |
|---|---|---|
| AI optimization guide'a göre site Search Console "Search generative AI" kontrolünde dahil olmalı; varsayılan Include. | [Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) (son güncelleme 10 Temmuz 2026) | [resmî] |
| `Google-Extended` Google Search'e dahil olmayı etkilemez; yalnızca Gemini uygulamaları ve Vertex AI kullanımını kapsar. | [Google common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) | [resmî] |
| Content Signals: `search` yapay zekâ özetlerini kapsamaz; politika CC0. | [Cloudflare](https://blog.cloudflare.com/content-signals-policy/), 24 Eylül 2025 | [resmî: Cloudflare] |
| Discover görseli ≥ 1.200 px, > 300.000 piksel, 16:9, `max-image-preview:large`; Article görseli ≥ 50.000 piksel; haber haritası yalnız son 2 gün. | Google Discover, Article, News sitemap belgeleri | [resmî] |
| Tercih edilen kaynaklar AI Overviews ve AI Mode'da da geçerli (27 Mayıs 2026). | [Google blog](https://blog.google/products-and-platforms/products/search/original-high-quality-content-search/) | [resmî] |
| Uydurma yazar profili (yapay zekâ portresi, uydurma ad, sahte yeterlilik) aldatmadır, sayfayı güvenilmez ve düşük kaliteli gösterir. | [Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) (son güncelleme 5 Ekim 2026) | [resmî] |
| ChatGPT atıflarında: sade adresli (slug) sonuçların atıf alma oranı %89,8, slug'sızların %81,1; atıf alan başlıkların fan-out sorgularına benzerliği 0,656, atıf almayanların istem benzerliği 0,484. Şubat 2025 verisi, yalnız masaüstü. | [Ahrefs](https://ahrefs.com/blog/why-chatgpt-cites-pages/) | [satıcı], korelasyon |
| Yapay zekâ görünürlüğüyle ilişki: Google'da sıralanan Reddit konularındaki anmalar 0,75, haber 0,67, YouTube 0,64. 260 milyon istem, 10.000 ABD markası. | [Ahrefs](https://ahrefs.com/blog/mention-types-ai-visibility/), 3 Kasım 2026 | [satıcı], korelasyon, ABD/İngilizce |
| ChatGPT ile Perplexity'nin atıf yaptığı alan adlarında örtüşme yaklaşık %11 (100.000 istem). | [Profound](https://www.tryprofound.com/blog/citation-overlap-strategy), Temmuz 2025 | [satıcı] |

### Düzeltilen ya da alınmayanlar

| Rapordaki ifade | Doğrusu |
|---|---|
| "Kontrole dahil olmak için işlem gerekir" | Varsayılan Include; yalnız Exclude yapılmadığını kontrol et. |
| "Güncelleme günlüğünde 10 Temmuz'da AI rehberi güncellendi" | Günlükte böyle bir girdi yok; tarih rehber sayfasının kendi "son güncelleme" bilgisi. |
| "OpenAI Instant Checkout ve ACP geri çekildi" | Instant Checkout uygulamalara taşındı; ACP sürüyor. Bu repo e-ticaret protokolü önermez. |
| "Yandex Wordstat API ücretsiz" | Resmî ama ücretli (bölge ağacı hariç); Yandex Cloud hesabı ister. |
| "iPullRank/qforia" | Doğru adres iPullRank-dev/qforia; lisansı yok, kodu alınmaz. Fan-out fikri kendi `--alt-sorgular` kontrolümüzde. |
| Perplexity Sonar Chat Completions | Agent API'ye geçti; bu repo Perplexity'yi şimdilik görünürlük aracına koymadı. |

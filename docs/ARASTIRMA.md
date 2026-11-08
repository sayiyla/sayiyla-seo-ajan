# Benzer açık kaynak SEO / AEO / GEO depoları: araştırma notu

Okuma tarihi: 8 Kasım 2026. Yıldız sayıları, son commit tarihleri ve lisanslar GitHub API'sinden, açıklamalar ilgili deponun kendi README'sinden okundu. "Yöntem sınırı": her depoyu satır satır denemedik; tablodaki "güçlü yan" sütunu README'nin anlattığıdır, kendi ölçümümüz değildir. Bu depoların kodunu ya da metnini bu repoya **kopyalamadık**; yalnızca fikirleri ve yöntemleri kendi sözlerimizle yeniden yazdık.

## Tablo (yıldız sırası, seçilmiş 14 depo)

| Depo | Yıldız | Lisans | Ne yapıyor | Bu repodan fark |
|---|---:|---|---|---|
| coreyhaines31/marketingskills | 59.069 | MIT | Claude Code için geniş pazarlama skill'leri (SEO dahil) | Genel pazarlama; Türkçe ya da sosyal platform açıklaması yok |
| AgriciDaniel/claude-seo | 27.257 | MIT | 26 alt skill, 19 ajan; teknik SEO, E-E-A-T, schema, GEO, yerel SEO, indexnow | Çok daha geniş; Python ağırlıklı, İngilizce odaklı |
| zubair-trabzada/geo-seo-claude | 11.561 | MIT | `/geo audit`, alıntılanabilirlik, tarayıcı, llms.txt, rapor | GEO odaklı; Python |
| GoogleChrome/lighthouse-ci | 7.133 | Apache-2.0 | Her commit'te Lighthouse çalıştırıp gerileme yakalar | Performans kapısı; içerik düzeltmez |
| nowork-studio/notfair-plugin | 4.121 | MIT | SEO, GEO, GA4, Search Console, reklam; her skill için WORKFLOW ve eval | Reklam ve analitik ağırlıklı |
| AnswerDotAI/llms-txt | 2.680 | Apache-2.0 | llms.txt önerisinin kendisi | Biçim referansı |
| onvoyage-ai/gtm-engineer-skills | 1.357 | MIT | Marka → anahtar kelime → makale → kaynak doğrulama → AEO denetimi hattı | Boru hattı yaklaşımı; her aşama dosya üretir |
| Auriti-Labs/geo-optimizer-skill | 1.292 | MIT | 16 komut, 27 yapay zekâ tarayıcısı, `geo fix` önizler `--apply` ile yazar, `--threshold` CI kapısı | Bu repoya en yakın mimari |
| Bhanunamikaze/Agentic-SEO-Skill | 1.030 | MIT | 16 alt skill; CI'da referans tazelik denetimi | Tazelik fikri |
| elmohq/elmo | 575 | MIT | Kendi sunucunda yapay zekâ görünürlük izleyici (marka anma, atıf) | İzleme tarafı; bizde yok |
| mverab/eGEOagents | 218 | MIT | Sayfayı GEO puanıyla yeniden yazar; atıf boşluğuna göre düzeltme döngüsü | Düzeltme döngüsü fikri |
| dodopayments/dualmark | 123 | Apache-2.0 | Her sayfaya Markdown ikizi, içerik pazarlığı, llms.txt otomasyonu | Markdown ikizi fikri |
| lukeed/seolint | 93 | MIT | Derlenmiş HTML için 79 kural, yapılandırma, JSON çıktı, CI ek açıklaması | Aynı yığın (Node); kural başına belge modeli |
| aleclindz/seo-skill-bench | 43 | MIT | SEO skill'lerini kusurlu sahte sitelerde çalıştırıp puanlayan benchmark | Planted-defect fikri |
| seo-skills/geo-audit-skill | 39 | MIT | Hesabı deterministik CLI yapar, model yalnız anlatır | Bu repodaki bölünmeyle aynı tasarım |

Sosyal medya tarafı: Instagram, TikTok ve YouTube açıklaması için ciddi (yıldızı ve bakımı olan) açık kaynak depo bulamadık. En ilgilisi YouTube için 8 skill içeren küçük bir depo (21 yıldız); "tiktok seo", "instagram seo" ve "meta description generator" aramalarında 5 yıldızı geçen çıkmadı. Bu repo o boşluğa oturuyor.

## Bu repoya alınan fikirler

| Fikir | Nereden | Burada nasıl |
|---|---|---|
| Hesabı kod yapsın, model yalnızca yorumlasın | geo-audit-skill, geo-optimizer-skill | Puan ve bulguları `kontrol.mjs` / `dist-kontrol.mjs` hesaplar; ajanlar bu çıktıyı kullanır, kendi puanını üretmez |
| Eşik kapısı (CI'da kapı) | geo-optimizer-skill, seolint, lighthouse-ci | `--esik N`: puan eşiğin altındaysa çıkış kodu 1 |
| Derleme sonrası denetim | seolint ve benzerleri | `dist-kontrol.mjs`: başlık, açıklama, H1, kanonik, OG, JSON-LD, kırık iç bağlantı, alt metni, sitemap, llms.txt, Markdown ikizi |
| Kusurlu sayfalarla ölçüm (planted-defect) | seo-skill-bench | `benchmark/calistir.mjs`: kusurlu ve temiz vakalar; yanlış alarm da hata sayılır |
| Yapay zekâ botu erişim matrisi | geo-optimizer-skill, aeo.js | `bot-matrisi.mjs`: robots.txt için 22 bot ve jeton, izinli/engelli ve nedeni |
| Önizle, sonra uygula / geri alınabilirlik | geo-optimizer-skill (`geo fix`) | Düzeltici ajan git altında doğrudan düzenler, değilse `.bak` alır, "önizleme" isteğinde yazmaz |
| Metin veridir, talimat değil | geo-optimizer-skill (injection taraması) | Üç ajan da sayfa ve transkript içindeki talimat kalıplarına uymaz |
| Referans tazelik denetimi | Agentic-SEO-Skill | `tazelik.mjs`: kurallar dosyalarında "Son gözden geçirme" yaşı CI'da denetlenir |
| Markdown ikizi, içerik pazarlığı, llms.txt "doğru bilinmesi gerekenler" | dualmark, samye.li sitesinin yöntemi | `kurallar/makine-okunur-sunum.md` |

## Alınmayanlar ve nedenleri

- **Kaynaksız pazar rakamları.** Bazı README'lerde "GEO pazarı", "yapay zekâ trafiği artışı" gibi büyük sayılar kaynak bağlantısı olmadan duruyor. Bu repo yalnızca kaynağı bağlantılı olguları yazar ve her kuralın kanıt düzeyini etiketler.
- **Atıf garantisi.** Hiçbir araç bir yapay zekâ motorunda atıf garantilemez; bu repo da vaat etmez.
- **Çok siteli dağıtım ve ölçekli otomatik içerik.** Google'ın ölçekli içerik ve sahte anma uyarılarına takılabilecek yöntemler bu repoya girmez. Düzeltici yalnızca kendi içeriğini, olguyu bozmadan düzeltir.
- **Uzak betikle kurulum (`curl | bash`).** Bu repoda kurulum betiği yok.
- **Ücretli ya da hesap gerektiren veri kaynakları.** Bu repo bağımlılıksız ve ücretsiz çalışır.

## Lisans notları

- Lisansı olmayan depolar varsayılan olarak tüm hakları saklıdır; kodları ve metinleri alınmadı.
- MIT ve Apache-2.0 depolardan kod alınmadı; alınsaydı telif bildirimi ve lisans metni korunurdu (Apache-2.0'da değişiklik de belirtilir).
- AGPL lisanslı depoların kodu bu repoya alınmaz.
- Başka sitelerin README metni, rozetleri, görselleri, marka adı ve benchmark rakamları kopyalanmadı.

## Tweet'teki örnek site (samye.li)

Sahibinin paylaştığı Astro ve Cloudflare Pages sitesi MIT lisanslı. İncelemede şu yöntemler öne çıktı (kopyalanmadı): tek bağlantılı JSON-LD grafı, her sayfa için Markdown ikizi ve `Accept: text/markdown` ile içerik pazarlığı, `llms.txt` içinde "doğru bilinmesi gerekenler" bölümü, IndexNow, `lastmod`'lu site haritası ve build sonunda bütün bunları denetleyen bir doğrulama betiği. Tweetteki "Lighthouse 100-100-100" iddiasını depoda ya da kodda bir ölçüm kaydıyla doğrulayamadık; bu repo Lighthouse puanı vaat etmez.

---

# İkinci tur (8 Kasım 2026): yabancı kaynaklar, X ve ek repolar

Bu tur üç kaynaktan geldi: platformların ve arama motorlarının resmî belgeleri, X'te uygulayıcıların son üç aydaki paylaşımları (yaklaşık 64 sorgu, 90'dan fazla tweet tam metin) ve GitHub'da 96 ek arama. Yöntem sınırı: tablolardaki yıldız, tarih ve lisanslar GitHub API'sinden okundu; "özetten" işaretli bilgiler ikinci elden. Hiçbir depodan kod ya da metin alınmadı.

## Resmî belgelerden doğrulananlar (kuralları değiştirenler)

| Bulgu | Etkisi |
|---|---|
| YouTube: 60'tan fazla hashtag'de hepsi yok sayılır; başlık üstünde en çok 3 görünür; etiketler (tag) keşifte "minimal" rol oynar. Daha önce kullandığımız "15" sınırı resmî değildi. | `sosyal-aciklama.md` ve `kontrol.mjs` düzeltildi (60+ hashtag hata). |
| YouTube bölümleri: ilk damga 00:00, en az 3 damga, artan sıra, her bölüm ≥ 10 sn. | `kontrol.mjs` bölüm kuralı bu resmî koşullara göre yazıldı. |
| Google: FAQ zengin sonucu 7 Mayıs 2026'dan beri gösterilmiyor; llms.txt Arama'da kullanılmıyor (ne yardım ne zarar); içeriği parçalara bölmek ya da özel cümle kalıbı gerekmez (AI optimization guide, 15 Mayıs 2026). | `kanit-defteri.md` ve `makine-okunur-sunum.md`. |
| Search Console "Search Generative AI performance" raporu (3 Haziran 2026'da duyuruldu, 31 Ağustos 2026'da herkese açıldı): yalnızca gösterim, tıklama yok. Bing Webmaster "AI Performance" (Şubat 2026). | `olcum-protokolu.md`. |
| OpenAI/Anthropic/Perplexity: arama, eğitim ve kullanıcı isteğiyle çalışan botlar ayrı; kullanıcı botları robots.txt'e her zaman uymayabilir. | `bot-matrisi.mjs` uyarıları. |
| Instagram ve TikTok yardım sayfaları araçla açılamadı; Instagram ve TikTok 5 hashtag sınırı haber kaynaklıydı, kullanıcı hesapta doğruladı (8 Kasım 2026); açıklama sınırı (2200/4000) doğrulanamadı. | `sosyal-aciklama.md` doğrulama tablosu; bu sayılar uyarı düzeyinde ve ayarlanabilir. |
| Yandex Türkiye'de yaklaşık %21,6 pay (StatCounter, Ekim 2026); `YandexAdditionalBot`, `Clean-param`. | `teknik-seo.md`, `bot-matrisi.mjs`. |

## X'ten alınan fikirler ve alınmayanlar

Alınanlar (kanıtı sağlam ya da mekanik olanlar): ham HTML'de içerik denetimi (`ham-html.mjs`); robots.txt tutarsızlık uyarısı (ChatGPT-User engelli, OAI-SearchBot açık); IP doğrulamalı bot günlüğü (`bot-log.mjs`); sahte tıklama/gösterim sıçraması süzgeci, vurma mesafesi, uzun sorgu ve içerik çürümesi analizi (`gsc.mjs`); kaynaksız sayı yoğunluğu uyarısı; Türkçe ton izi (resmî "-mektedir" yoğunluğu, art arda aynı cümle başı, klişe); ölçüm protokolü (çok istem, tekrar koşu, paydalı sonuç).

Alınmayanlar ve nedeni (`kanit-defteri.md`): "llms.txt ya da şema atıf getirir" (ölçümlerde ilişki yok), satıcı vaka çalışmaları (ör. YouTube açıklamasıyla %359 sıçrama; kontrol grubu yok), yalnız AI botlarına farklı içerik sunan "makine katmanı" (gizleme benzeri), tıklama manipülasyonu, ölçekli otomatik içerik, satılık bağlantılar, doğrulanamayan "sızıntı" bilgiler.

## Ek repolar (ilk turda olmayanlar)

| Depo | Yıldız | Lisans | Ne yapıyor | Fikir olarak alınan |
|---|---:|---|---|---|
| yucezerey/turkish-anti-ai-skill | 258 | MIT | Türkçe metindeki "yapay zekâ Türkçesi" izlerini ölçen/temizleyen skill | Cümle uzunluğu değişkenliği ve "-mektedir" yoğunluğu ölçüsü (bizde kendi kurallarımızla, `ton`) |
| cucuwang/geoptimize | 263 | MIT | Baseline'lı, deterministik içerik lint'i ve CI kapısı | `--baseline`/`--kaydet` ve kural kataloğunda "kanıt sınıfı + yanlış-pozitif sınırı" |
| IJONIS/geo-lint | 40 | MIT | Her ihlalde `suggestion` alanı olan 97 kurallı linter | JSON çıktıda `oneri` alanı; lint-düzelt-tekrar döngüsü |
| squirrelscan/squirrelscan | 308 | MIT | 300+ kurallı site denetimi; "ajan deneyimi" kategorisi | Ajan deneyimi: llms.txt, Markdown ikizi, JSON-LD `@id` tutarlılığı |
| jianruntech/geo-score | 34 | MIT | Sürümlü rubrik, kapılar, ön-kayıtlı benchmark | Gelecek iş: rubrik sürümleme ve kapı tavanı |
| everyinfra/seo-skills | 116 | Apache-2.0 | 18 pazar için ayrı kural; altın testli betikler | Gelecek iş: pazar kurallarını veri dosyasına ayırma |
| jdevalk/specification.website | 922 | MIT kod, CC BY 4.0 içerik | Her kuralı kaynağa bağlayan web spesifikasyonu | "Her kural bir kaynağa bağlı" disiplini |
| Jakeschincariol/instagram-agent-skill, youtube-agent-skill | ~5.000 | MIT | Hook formülleri, "devamını gör" önizlemesi, başlık-küçük resim çifti | İlk satır önizleme denetimi (zaten var); hook kütüphanesi gelecek iş |
| NVIDIA/SkillSpector, fubak/ferret-scan | 24.800 / 82 | Apache-2.0 / MIT | Skill ve ajan dosyalarının güvenlik taraması | `ajan-tara.mjs` (kendi kalıp listemizle) |
| ai-robots-txt/ai.robots.txt | 4.251 | MIT | AI tarayıcı listesi | Bot listesi güncelleme kaynağı olarak anılır (`bot-matrisi.mjs`) |
| iannuttall/seo, Suganthan-Mohanadasan/Suganthans-GSC-MCP | 609 / 185 | Apache-2.0 | Search Console MCP'leri; içerik çürümesi | `gsc.mjs cozulme` (çevrimdışı CSV ile) |
| tianpengg/geo-monitor, yaojingang/GEOInflow | 79 / 814 | Apache-2.0 / MIT | Sunucu günlüğünden AI tarayıcı izleme | `bot-log.mjs` |
| devbret/mapping-website-internal-links, janreges/siteone-crawler | 98 / 998 | MIT | İç bağlantı grafiği, tarayıcı | `dist-kontrol.mjs` öksüz sayfa ve zayıf bağlantı |

Bulunamayan alanlar (≥ 20 yıldız ve güncel): hreflang doğrulayıcı, bağımsız JSON-LD doğrulayıcı CLI, Open Graph doğrulayıcı, Türkçe Ateşman aracı, küçük resim CTR testi, TikTok açıklama SEO aracı, transkriptten SEO açıklaması. Bu boşluklar bu repo için fırsattır.

## Yol haritası (alınmadı, sonraki sürümler)

- Rubrik sürümleme ve "kapı" tavanı (geo-score benzeri); benchmark için ön-kayıt, duyarlılık ve yeniden üretilebilirlik raporu.
- Pazar kurallarını veri dosyasına ayırma (`markets.json`): tr için ayrı kontrol listesi (Google + Yandex).
- Hreflang ve Open Graph derin doğrulaması; küçük resim/başlık çifti lint'i.
- Hook formülü kütüphanesi (kanıt düzeyiyle) ve hook puan kartı.
- AI görünürlük ölçümünün otomasyonu (30-50 istemli, tekrar koşulu): API anahtarı ve maliyet gerektirdiği için bu repoda yok.

## Awesome listeleri (lisansı açık)

- [i365dev/awesome-seo](https://github.com/i365dev/awesome-seo) (MIT)
- [best-of-ai/awesome-ai-seo](https://github.com/best-of-ai/awesome-ai-seo) (MIT)
- [XiaomingX/awesome-seo-tools](https://github.com/XiaomingX/awesome-seo-tools) (Apache-2.0)
- [ai-robots-txt/ai.robots.txt](https://github.com/ai-robots-txt/ai.robots.txt) (MIT)

---

# Kullanıcının paylaştığı tweetler (8 Kasım 2026)

13 tweet okundu. Alınanlar fikir düzeyindedir; metin kopyalanmadı.

| Tweet | Değerlendirme | Repoda |
|---|---|---|
| @asaio87: backlinksiz sıralama iş akışı | Niyet kontrolü, cevabı ilk 100 kelimede verme, ana ifade başlıkta/açıklamada/ilk paragrafta, 3-5 iç bağlantı, GSC'den 10-30 konum ve eksik sorgu döngüsü: kurallarımızla uyumlu. Ücretli anahtar kelime aracı adımı alınmadı. | `gsc.mjs bosluk`, düzeltici ajanda "boşluk modu" ve iç bağlantı önerisi |
| @asaio87: var olan sayfalardan daha çok tıklama | En iyi 10 sayfa, son 3 ay sorgu verisi, yalnız değişen bölümü yeniden yazma, ekran görüntüsü/tablo/özgün açı önerisi, yeniden dizine ekleme. | Düzeltici ajan (boşluk modu, özgünlük önerisi), `--anahtar` |
| @borjafat: tıklama oranı ve başlık testi | Yöntem (konum 3-10, düşük TO, tek değişiklik, 2-4 hafta) alındı; "TO büyük sıralama faktörü" iddiası ve reklamla test alınmadı (satıcı). | `gsc.mjs dusuk-to`, ölçüm protokolü §7 |
| @borjafat: Search Console bağlı başlık testi döngüsü (8 Kasım) | Döngü (birinci sayfada zayıf tıklanan sayfa, yeni başlık, hâlâ geçilen aramalar, neyin tıklattığını öğrenme) alındı ve satıcı bağlayıcısı yerine bağımlılıksız CSV defteriyle kuruldu. "Google mahkemede tıklamanın sıralamaya yardım ettiğini kabul etti" iddiası ve günlük 20 $ reklamla başlık denemesi alınmadı. | `baslik-testi.mjs`, ölçüm protokolü §7 |
| @PratikSinhatwt: sitede olması gereken 12 şey | 404, meta başlık/açıklama, OG görseli, robots, sitemap, alt metin zaten denetleniyordu; favicon ve gizlilik sayfası eklendi. Yükleme durumu ve CTA SEO dışı. | `dist-kontrol.mjs` favicon, gizlilik |
| @Manojkumar2257: utillayer/youtube-agent-skill (MIT) | Başlık-küçük resim tekrar kontrolü ve bölüm fikri alındı; repo yeni (5 yıldız), kodu alınmadı. İzleyici kaybı (retention) analizi ileride. | `--kapak-yazisi` |
| @heyrimsha: 10 Instagram reposu | charlie947/social-media-skills (MIT) yapı fikri için not edildi. Instaloader ve instagrapi resmî olmayan API ile giriş ve otomasyon gerektirir; platform kurallarıyla çelişebilir, bu repoya alınmaz. Video kurgu repoları (ShortGPT, AutoSubs) bu reponun kapsamı dışında. | Not |
| @bloggersarvesh (yerel SEO 25 madde), @seo_bint_ejamil (65 maddelik yerel SEO) | Google Business Profile ve yerel işletmeye yönelik; bu repo içerik ve sosyal açıklama odaklı. Bazı rakamlar kaynaksız. İleride ayrı bir "yerel SEO" kural dosyası olabilir. | Alınmadı |
| @bloggersarvesh: "Grok ile 7/24 SEO ajanı" | Makale içeriği açılamadı; vaat dili. | Alınmadı |
| @irabukht: pazarlama mühendisi | Kara şapka, parazit SEO, gizli istem, günde 500 programatik sayfa önerileri politikalara aykırı. Yalnızca "Bizi nereden duydunuz?" sorusu alındı. | Ölçüm protokolü §8, kanıt defteri |
| @buildwithsid / @margatix: tam eşleşen alan adıyla 10 günde 1. sıra | Tek anekdot, riskli. | Kanıt defteri |
| @arthuryuzbashev: TO %1,1, konum 17 → 13 | Soru; tavsiye içermiyor. `dusuk-to` ve `yakin` tam bu durum için. | - |
| @steveruizok: "uygulamamdaki örtük durum makinelerini bul" | Kodlama istemi; SEO ile ilgisi yok. | - |

---

# Üçüncü tur: dış denetim raporu (8 Kasım 2026)

Kullanıcının paylaştığı, başka bir yapay zekâdan gelen denetim raporu iki parçada değerlendirildi:

- **Kod ve mantık önerileri** büyük ölçüde uygulandı: hata içeren sayfaya 40 puan tavanı ve en düşük sayfa kapısı (`--min-sayfa`), sayfa türü (`--tip`), trafik getiren sorgu koruması (`--koru-gsc --onceki`), Türkçe ünsüz yumuşamasına dayanıklı kök eşleşmesi, yazıyla yazılmış sayıların rakama çevrilmesi, `Google-Extended` / `Applebot-Extended` adlarının tarayıcı değil robots jetonu olarak ele alınması, `_redirects` ve `_headers` denetimi, JSON-LD ile görünür metin uyumu, Markdown ikizinin H2 eşitliği, YouTube'da boş bölüm adları. Raporun önerdiği ek sıyırıcı kodu alınmadı ("kahve" gibi sözcükleri bozuyordu); daha dar ve güvenli bir kural yazıldı.
- **Araştırma iddiaları** tek tek birincil kaynaktan kontrol edildi. Doğrulananlar ve doğrulanamayanlar kaynaklarıyla `kurallar/kanit-defteri.md` "Üçüncü tur" bölümünde. Raporun sayıları olduğu gibi alınmadı; birkaçı yanlış çerçevelenmişti (ör. %36,8 ve %46 oranları, "özellik başına" tıklama verisi, Lighthouse denetim adları).
- Yeni denetimin sayiyla.com derlemesinde bulduğu gerçek sorun: bir model sayfasının 301 yönlendirmesi 410 dönen bir hedefe gidiyordu.

| Depo | Durum | Not |
|---|---|---|
| Hainrixz/claude-seo-ai | MIT, 83 yıldız, 25 Ekim 2026 | İki eksenli puan ve "kanıtı sağlam, en ağır" hatada 40 tavanı; bizde hata içeren her sayfaya tavan uygulanır (daha sıkı). |
| xseekio/claude-code-seo-geo-skills | 2 yıldız, lisans belirtilmemiş, satıcı | Yalnızca fikir; kod alınmadı. |

---

# Dördüncü tur: ikinci dış rapor ve küçük canlı test (8 Kasım 2026)

- Rapordaki hatalar düzeltildi: "Google'a göre ek şart yok" ifadesi güncellendi (Search Console "Search generative AI" kontrolü, varsayılan Include); `Google-Extended`'ın AI Overviews ve AI Mode'u etkilemediği yazıldı; ciddiyet ile kanıt sınıfı uyumu kodda zorunlu hale geldi; TikTok için `--kanal api|uygulama`; YouTube hashtag ifadesi; repo içi eşik tutarsızlıkları tek tabloda toplandı; llms.txt için "Google kullanmıyor"; Content Signals tanımları.
- Doğrulanan ve doğrulanmayan dış iddialar: `kurallar/kanit-defteri.md` "Dördüncü tur".
- Yeni araç ve kurallar: `gorunurluk.mjs` (OpenAI, Gemini, OpenRouter web aramalı görünürlük ölçümü + çevrimdışı analiz), `--alt-sorgular` (fan-out kapsamı), fiyat şeması denetimi (geçmiş `priceValidUntil`, şema-tablo fiyat uyumu), Discover (`max-image-preview:large`), haber site haritası (2 gün), varlık (`sameAs`), başlık piksel tahmini.
- Alınmayanlar: OpenAI Instant Checkout/ACP (Instant Checkout uygulamalara taşındı, ACP sürüyor; e-ticaret protokolü bu reponun konusu değil), NLWeb, ücretli Yandex Wordstat API (resmî ama ücretli), lisanssız qforia kodu.

**Fırsat:** Türkçe pazarda yapay zekâ atıfı üzerine yayımlanmış açık bir ölçüm bulamadık. Bu repoyla toplanan veriler (soru seti, koşu sayısı, tarih, motor) açık lisansla yayımlanırsa alandaki ilk kaynaklardan biri olabilir.

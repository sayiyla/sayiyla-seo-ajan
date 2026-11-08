# Teknik SEO: tarama, dizinleme, yönlendirme, hız, yapay zekâ botları
Son gözden geçirme: 2026-11-08

Küçük ve orta statik içerik siteleri için (Astro, Hugo, Next statik çıktı, Cloudflare Pages, Netlify gibi). Kanıt düzeyleri: **[resmî]** arama motoru belgesi, **[çalışma]** yöntemi açık ölçüm, **[öneri]** pratik kural.

## Tarama ve dizinleme

1. **Tek URL, tek sinyal.** Kanonik adres, site haritası, iç bağlantılar ve sondaki eğik çizgi aynı biçimde olsun. Kopya URL'leri Google birleştirir; tutarsız sinyal kanonik seçimi şansa bırakır. [resmî: Google kopya URL birleştirme]
2. **Taşınan sayfaya 301, karşılıksız silinene 404 ya da 410.** 302 zayıf sinyaldir; Cloudflare Pages `_redirects` dosyasında kod yazmazsan varsayılan 302'dir, kodu açıkça yaz. Yönlendirme zinciri yapma; iç bağlantıları doğrudan son hedefe çevir. [resmî: Google HTTP durum kodları; Cloudflare Pages redirects]
3. **`noindex` tarama tasarrufu için değildir.** Sayfayı taramayı engellemez; robots.txt ile engellenen sayfadaki `noindex` ise hiç okunmaz. Dizinden çıkarmak için `noindex` kullan, robots.txt ile engelleme. [resmî]
4. **Bilinmeyen yol gerçek 404 döndürsün.** Cloudflare Pages'te kökte `404.html` yoksa site SPA sayılır ve bilinmeyen her yol için ana sayfa sunulur (soft 404). [resmî: Cloudflare Pages]
5. **Site haritası.** `lastmod` yalnızca anlamlı içerik değişikliğinde güncellenir; `priority` ve `changefreq` Google tarafından yok sayılır. Site haritası kanonik seçiminde zayıf sinyaldir. [resmî: Google site haritası belgesi]
6. **Tarama bütçesi küçük sitede sorun değil.** Google rehberi bu konuyu 1 milyon+ sayfalı haftalık değişen ya da 10.000+ sayfalı günlük değişen siteler (ve çoğu URL'si "Keşfedildi - şu anda dizine eklenmedi" olan siteler) için anlatıyor. Küçük sitede "dizine eklenmedi" çoğunlukla bütçe değil, kalite ve alaka sorunudur. [resmî]
7. **Yeni URL'yi duyur:** site haritası + iç bağlantı; Search Console'da "dizine eklenmesini iste" yalnız az sayıda öncelikli URL için. IndexNow Google'a gitmez (Bing, Yandex, Naver, Seznam gibi motorlar). Google Indexing API yalnızca iş ilanı ve canlı yayın sayfaları içindir. [resmî]

## Hız ve sayfa deneyimi

1. Core Web Vitals eşikleri: LCP ≤ 2,5 sn, INP ≤ 200 ms, CLS ≤ 0,1 (75. yüzdelik saha verisi). Google CWV'yi sıralamada kullanır ama alaka önce gelir; eşiği geçmek yeterli, sonra içeriğe dön. [resmî: web.dev, Google sayfa deneyimi]
2. Pratik: ilk ekran görseli `loading="lazy"` olmadan ve `fetchpriority="high"` ile; görsellere `width` ve `height`; AVIF/WebP; kritik olmayan JavaScript ertelenmiş; yazı tipi alt kümesi ve `font-display: swap`. [öneri]
3. Lighthouse puanı hedeftir, sıralama garantisi değil; saha verisi (Search Console Core Web Vitals raporu, CrUX) esastır. [resmî]

## JavaScript ve yapay zekâ botları

1. **İçerik ve kritik olgular (fiyat, ad, tarih) görünür HTML'de olsun.** ChatGPT ve Claude botları sonradan JavaScript ile gelen içeriği okumadı; yalnızca JSON-LD'de duran fiyatı hiçbir sistem bulamadı (küçük örneklemli testler). Statik çıktı bu açıdan avantajlıdır. [çalışma, ikincil]
2. **Arama botlarını açık tut; eğitim botu ayrı karardır.** OpenAI, Anthropic ve Perplexity arama ve eğitim botlarını ayrı belgeler (ör. OAI-SearchBot / GPTBot, Claude-SearchBot / ClaudeBot, PerplexityBot). Arama botunu engellersen o motorun cevaplarında görünürlüğün düşer; eğitim botunu engellemek ayrı bir politika kararıdır. `robots.txt` içinde bunu bilerek yaz. [resmî: OpenAI, Anthropic, Perplexity belgeleri]
3. **Güvenlik duvarı ve bot koruması (ör. Cloudflare Bot Fight Mode):** doğrulanmış arama botlarını engelleyip engellemediğini değiştirmeden önce test et; sahte user-agent testi kanıt sayılmaz. Search Console tarama istatistikleri ve sunucu günlükleri esastır. [resmî + vaka]
4. **`llms.txt`: Google Arama kullanmıyor ([resmî], 15 Haziran 2026 güncelleme günlüğü); diğer motorlar için etkisi kanıtsız.** Google "yapay zekâ için ayrı optimizasyon gerekmez" der; büyük bir ölçümde llms.txt dosyalarının çok büyük bölümü hiç istek almadı. İstersen koy, ama emek verme. [resmî] [çalışma, satıcı]
5. **Markdown sunumu** (`Accept: text/markdown` isteğine sayfanın Markdown sürümü): makineler için kolaylık olabilir, kanıtlı sıralama etkisi yok; kopya içerik sorunu yaratmasın diye `.md` adreslerini `noindex` yap ve site haritasına koyma. [öneri]

## İç bağlantı ve yapı

1. Her yeni sayfa en az 2-3 ilgili sayfadan bağlantı alsın; ana sayfa, kategori sayfası ve ilgili yazılar. Bağlantı metni açıklayıcı olsun ("buraya tıkla" değil). [öneri; bir ölçümde iç bağlantı sayısıyla tarama ilişkili, korelasyon]
2. Gezinti zinciri (breadcrumb) hem görünür hem `BreadcrumbList` olarak; adresler birbiriyle tutarlı.
3. Sayfalamada ve filtrelerde kopya URL üretme; parametreli adresleri kanonikle ana adrese bağla.

## Hızlı kontrol komutları

```bash
curl -sIL https://ornek.com/sayfa/          # durum kodu, yönlendirme zinciri, X-Robots-Tag, önbellek başlıkları
curl -s https://ornek.com/robots.txt
curl -s https://ornek.com/sitemap.xml | head
curl -sL -A "Mozilla/5.0" https://ornek.com/sayfa/ | grep -io '<link[^>]*canonical[^>]*>'
npx -y lighthouse https://ornek.com/ --only-categories=seo,performance --form-factor=mobile --quiet --chrome-flags="--headless=new"
```

## Yandex ve Türkiye

Türkiye'de arama motoru payı Ekim 2026'da yaklaşık Google %76,9, Yandex %21,6, Bing %0,8 (StatCounter; ölçüm, resmî veri değil). Yandex'i ihmal etme:

- Yandex Webmaster'a siteyi ekle, site haritasını gönder. Yandex robots.txt'te `Clean-param` destekler (parametreli adresleri birleştirmek için); `Crawl-delay` desteklenmiyor görünüyor. [resmî]
- Yandex Arama ve Alice yanıtları yalnızca Yandex'in dizinlediği sayfalardan gelir; iyi yapılandırılmış, bilgilendirici sayfalar daha olasıdır. Cevaplardan çıkmak için `YandexAdditionalBot` için Disallow yazılır, etki 2-14 gün sürer. [resmî]
- Doğrulama etiketi (`yandex-verification`) sayfanın `<head>` kısmında durur; `dist-kontrol.mjs` doğrulama dosyalarını sayfa saymaz.

## Google'ın yapay zekâ özelliklerini kontrol etmek

- **`Google-Extended` AI Overviews ve AI Mode'u etkilemez.** Bu jeton yalnızca Gemini uygulamaları ve Vertex AI'daki Gemini eğitimi ve grounding kullanımını kapsar; Google'a göre "Google Search'e dahil olmayı etkilemez, sıralama sinyali değildir". [resmî] [Google common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- **Search'teki yapay zekâ özelliklerinde gösterileni sınırlamanın resmî yolları:** `nosnippet`, `data-nosnippet`, `max-snippet`, `noindex` ve Search Console'daki **Search generative AI** kontrolü (Include / Exclude / Inherit; 31 Ağustos 2026'dan beri tüm sitelerde). Exclude seçmek AI Overviews, AI Mode ve Discover AI özelliklerinden gelen trafik ve gösterimi keser. [resmî] [AI features](https://developers.google.com/search/docs/appearance/ai-features), [Control what you share](https://developers.google.com/search/docs/crawling-indexing/control-what-you-share)
- **Tercih edilen kaynaklar (Preferred sources):** okur sitenizi tercih edilen kaynak olarak seçebilir; 27 Mayıs 2026'dan beri AI Overviews ve AI Mode'da da geçerli, Ağustos 2026'dan beri siteye eklenebilecek özel bir düğme var. [resmî] [Google blog](https://blog.google/products-and-platforms/products/search/original-high-quality-content-search/)

## Discover ve haber

- **Discover görseli:** en az 1.200 px genişlik, 300.000 pikselden fazla, 16:9 oran; `max-image-preview:large` robots ayarı (ya da AMP) gerekir. [resmî] [Google Discover](https://developers.google.com/search/docs/appearance/google-discover)
- **Article yapılandırılmış verisi:** görsel en az 50.000 piksel (genişlik × yükseklik); 16:9, 4:3 ve 1:1 oranlarında birden çok görsel önerilir. [resmî] [Article](https://developers.google.com/search/docs/appearance/structured-data/article)
- **Haber site haritası:** yalnızca son iki günde oluşturulmuş makaleler; daha eskiler haritadan çıkarılır. [resmî] [News sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap)
- `dist-kontrol.mjs` makale sayfalarında `max-image-preview:large` eksikliğini ve haber site haritasındaki iki günden eski adresleri bildirir.

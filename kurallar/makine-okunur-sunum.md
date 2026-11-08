# Makine okunur sunum: Markdown ikizi, llms.txt, JSON-LD grafı, IndexNow

Son gözden geçirme: 2026-11-08

Bu dosya yapay zekâ araçlarının ve arama motorlarının sayfanı temiz okumasını kolaylaştıran uygulamaları anlatır. Kanıt düzeyleri: **[resmî]** motor belgesi, **[çalışma]** yöntemi açık ölçüm, **[öneri]** pratik kural. Bu bölümdeki Markdown ve llms.txt uygulamalarının sıralama ya da alıntı etkisi kanıtlanmış değildir; maliyeti düşükse yap, ölçmeden vaat etme.

## 1. Her sayfaya Markdown ikizi

Fikir: `/yazilar/ornek/` sayfasının temiz metin karşılığı `/yazilar/ornek.md` adresinde durur. Yapay zekâ ajanları HTML ayrıştırmak yerine bunu okuyabilir. Açıkça bildirmek için:

```html
<link rel="alternate" type="text/markdown" href="/yazilar/ornek.md">
```

```
Link: </yazilar/ornek.md>; rel="alternate"; type="text/markdown"
```

- Markdown ikizi sayfanın **tam** içeriğini taşır, ondan farklı bir şey söylemez (gizli metin ya da farklı iddia yok). Başlık, tarih, yazar, kaynaklar da dahil.
- Kopya içerik sorunu çıkmasın: `.md` adreslerine `X-Robots-Tag: noindex` ver, site haritasına koyma, ikizin `Link: <sayfa>; rel="canonical"` başlığı asıl sayfayı göstersin. [öneri]
- `dist-kontrol.mjs`, `rel="alternate" type="text/markdown"` ile bildirilen her dosyanın derlemede var olduğunu denetler.

## 2. İçerik pazarlığı (`Accept: text/markdown`)

Aynı adresten, `Accept: text/markdown` isteğine Markdown sürümünü sunmak (HTML tarayıcıda, Markdown ajanda). Kurulum barındırmaya bağlıdır: statik barındırmada genellikle derlemeye `_markdown/<sayfa>/index.md` yazıp kenar katmanında `Accept` başlığına göre yeniden yazma (rewrite) kuralı koyarsın.

- Cevapta `Vary: Accept` bulunmalı, yoksa önbellek yanlış sürümü sunar. [resmî: HTTP önbellek belgeleri]
- Kural barındırma panelinde duruyorsa kodla birlikte belgele; panel kuralı kaybolursa sessizce çalışmaz.
- Doğrula: `curl -sI -H "Accept: text/markdown" https://ornek.com/sayfa/` → `Content-Type: text/markdown`.
- Önce birkaç sayfada dene; tüm siteye açmadan önce önbellek davranışını ölç.

## 3. llms.txt

`llms.txt` zorunlu değildir. Google 15 Haziran 2026 güncelleme günlüğünde bunun Arama'da kullanılmadığını, ne yardım ne zarar getirdiğini yazdı; yaklaşık 300.000 alan adında yapılan bir ölçümde dosyayla alıntı sıklığı arasında ilişki bulunmadı (satıcı); tek siteli sunucu günlüklerinde istekler çok azdı ve çoğu IP doğrulamasından geçmedi. Sayfaların Markdown kopyaları ve RSS daha çok istek aldı. Yine de koyacaksan faydalı ve güvenli kıl:

- **İçine komut ya da harici paket adı yazma.** İkinci el bir habere göre bazı llms.txt dosyalarında sahipsiz paket ya da alan adlarına işaret eden komutlar bulunmuş; saldırgan o adı alırsa dosyayı okuyan ajanlar zarar görebilir. [haber, ikincil]

- Site adı, tek cümlelik özet, ardından **"Doğru bilinmesi gerekenler"** bölümü: ad, ne yaptığın, kritik olgular (fiyat modeli, kuruluş tarihi, iletişim). Modelin yanlış olgu uydurma riskini azaltmaya çalışır. [öneri]
- Önemli sayfaların listesi; her biri için sayfa ve Markdown ikizi bağlantısı.
- Her bağlantı canlı ve 200 dönmeli (`dist-kontrol.mjs` derlemede var olup olmadığını denetler).
- Dosyada reklam, abartı ve doğrulanmamış iddia olmasın; makineye yalan söylemek marka güvenini bozar.

## 4. Tek bağlantılı JSON-LD grafı

Aynı varlığı (yazar, site, yayıncı) her şemada yeniden tanımlama; bir `@graph` içinde `@id` ile bağla:

```json
{"@context":"https://schema.org","@graph":[
  {"@type":"Person","@id":"https://ornek.com/#kisi","name":"Ad Soyad"},
  {"@type":"WebSite","@id":"https://ornek.com/#site","url":"https://ornek.com/","publisher":{"@id":"https://ornek.com/#kisi"}},
  {"@type":"Article","@id":"https://ornek.com/yazi/#yazi","headline":"Başlık","author":{"@id":"https://ornek.com/#kisi"},"isPartOf":{"@id":"https://ornek.com/#site"},"datePublished":"2026-11-08T10:00:00+03:00"}
]}
```

- Şemadaki her değer görünür metinde de yer alır (fiyat, tarih, yazar). [resmî: Google yapılandırılmış veri kuralları]
- `@id` referansları grafikte tanımlı olmalı; `dist-kontrol.mjs` tanımsız referansı uyarır.
- Kanıtlı bir sıralama kaldıracı değildir; doğruluk ve varlık netliği içindir.

## 5. IndexNow

Yeni ve değişen adresleri her yayından sonra IndexNow'a bildir (Bing, Yandex, Naver, Seznam gibi motorlar; Google dışı). Anahtar dosyasını sitenin kökünde yayımla (`/<anahtar>.txt`), sonra değişen adresleri `POST https://api.indexnow.org/indexnow` ile gönder. Google'a gitmez: Google için site haritası, iç bağlantı ve Search Console'da az sayıda adres için "dizine eklenmesini iste" kullanılır. [resmî: IndexNow belgesi, Google]

## 6. `Content-Signal` ve eğitim izni

`robots.txt` içine konan `Content-Signal: search=yes, ai-input=yes, ai-train=no` benzeri satırlar içeriğin nasıl kullanılabileceğini bildirmeye çalışan bir öneridir; bütün botlar uymaz ve standartlaşmış bir kural değildir. Tanımlar (Cloudflare Content Signals Policy, 24 Eylül 2025, CC0 lisanslı): `search` arama dizini oluşturma ve arama sonucu gösterme (bağlantı ve kısa alıntı) demektir, **yapay zekâ üretimi arama özetlerini kapsamaz**; `ai-input` içeriğin yapay zekâ modellerine girdi olarak verilmesi (grounding, RAG, yapay zekâ cevapları); `ai-train` model eğitimi ya da ince ayarı. Yani yapay zekâ cevaplarında kaynak olmak istiyorsan `ai-input=yes` gerekir. [Cloudflare](https://blog.cloudflare.com/content-signals-policy/) `ai-train` değeri bir **telif ve izin kararıdır**: başkasının sitesinden kopyalama. Kendi politikana göre seç, örnek bir siteyi taklit etme. Arama botlarını (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`) engellemek o motorun cevaplarında görünürlüğü azaltır; eğitim botlarını engellemek ayrı karardır. Matrisi görmek için `node araclar/bot-matrisi.mjs <robots.txt>`.

## 7. Derleme sonrası kapı

Bu kuralların hepsini yayından önce otomatik denetle: `node araclar/dist-kontrol.mjs dist --site https://ornek.com --esik 90`. Ayrıntı için `ornekler/github-actions-seo.yml`.

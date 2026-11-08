# Kural kataloğu: her denetim kuralı, kanıt sınıfı ve bilinen yanlış-pozitif sınırı

Son gözden geçirme: 2026-11-08

`kontrol.mjs` ve `dist-kontrol.mjs` çıktılarındaki her kuralın nedenini ve nerede yanıldığını buradan oku.

**Ciddiyet kuralı (kodda zorunlu):** yalnızca `kesin` sınıftaki kurallar **hata** üretebilir (platform ya da arama motoru belgesindeki kesin sınır, kırık sözdizimi, kırık bağlantı, kullanıcının kendi verisiyle yakalanan sorgu kaybı). `ilke` en çok **uyarı**, `öneri` **uyarı** ya da **bilgi** verir. Araç bunu kendisi uygular: sınıfı kesin olmayan bir bulgu hata olarak üretilse bile uyarıya düşer. Her bulgunun JSON çıktısında `sinif` alanı vardır.

## Eşikler: araç eşiği ve hedef

| Ölçü | Hedef (yazarken) | Araç eşiği (uyarır) | Kaynak |
|---|---|---|---|
| Web başlığı | 50-60 karakter, ~580 px | 15-60 karakter dışı; tahmini > 580 px (bilgi) | öneri; Google başlığı piksel genişliğine göre keser |
| Meta açıklama | 120-160 karakter | 120 altı / 160 üstü | öneri |
| H2 sayısı | 3-10 | 3 altı / 10 üstü (haber, kurumsal, araçta alt sınır 1) | öneri |
| İlk paragraf | ≤ 60 kelime, cevabı içerir | 60 üstü | ilke |
| Ortalama cümle | 10-18 kelime | 8-22 dışı; 30+ kelimelik cümle | öneri |
| Ateşman | ≥ 60 | < 50 | ilke |
| SSS | 3-8 gerçek soru (rehberde) | 3 altı / 8 üstü | öneri |
| Instagram / TikTok etiket | 3-5 | 5 üstü (hata) | kullanıcı doğrulaması; TikTok resmî duyuru yok |
| YouTube hashtag | 2-3 | 3 üstü uyarı, 60 üstü hata | resmî |
| TikTok açıklama | — | API 2.200 (resmî, `--kanal api` ile hata); uygulama 4.000 (doğrulanmadı) | resmî / doğrulanmadı | **Sınıf:** `kesin` (platform ya da arama motoru belgesinden), `ilke` (resmî ilkeden çıkarım), `öneri` (pratik; ölçerek karar ver). **Seviye:** hata, uyarı, bilgi. Puan: 100 − 20/hata − 5/uyarı − 1/bilgi.

## Web sayfası (`kontrol.mjs web`)

| Kural | Ne denetler | Seviye | Sınıf | Bilinen yanlış-pozitif |
|---|---|---|---|---|
| başlık | 15-60 karakter | uyarı | öneri | Google uzun başlığı kesebilir ya da yeniden yazabilir, sınır belgelenmiş değildir (cihaz genişliğine göre kısalır); 60 güvenli taraf. Marka adı eklenen başlıklarda 60'ı geçmek gerekebilir (`seo.config.json`). |
| açıklama | 120-160 karakter, cümle bitmiş | uyarı | öneri | Google açıklamayı çoğu zaman sayfadan yeniden üretir; kısa açıklama bazen yeterlidir. |
| abartı | "şok", "inanılmaz", "sır" vb. | uyarı | öneri | Haber ya da hikâye içeriğinde meşru kullanım olabilir; tam sözcük eşleşmesidir. |
| h1 | HTML'de tam 1 H1 | uyarı | ilke | Markdown ön bilgisinde başlık varsa gövdede H1 olmaması normaldir; araç yalnız 1'den fazla H1'i hata sayar. |
| h2 | 3-10 ara başlık | uyarı | öneri | Çok uzun rehberlerde 10 üstü gerekebilir (`h2Ust`). Alt başlıklar H3 ile yazılırsa sayılmaz. |
| soru-başlık | H2'lerin ≥ %25'i soru biçiminde | bilgi | öneri | Türkçe soru ekleri sezgiseldir; "nedir/nasıl/kaç/hangi" ve "mı/mi" eşleşir. |
| cevap-önce | İlk paragraf ≤ 60 kelime | uyarı | ilke | Hikâye ya da haber girişlerinde uzun giriş bilinçli olabilir. |
| cümle | Ortalama 8-22 kelime; 30+ kelimelik cümle | uyarı | öneri | Kod, tablo ve alıntı bloğu çıkarılır; listeler paragraf sayılmaz. Çok kısa teknik notlarda ortalama düşük çıkar. |
| okunabilirlik | Ateşman < 50 | uyarı | ilke | Formül 1997 Türkçe metinleri için; teknik terimler ve yabancı özel adlar puanı düşürür. Hece = sesli harf sayısı. |
| ton | "-mektedir" oranı > %15, art arda 3 aynı cümle başı, klişe kalıplar | uyarı | öneri | "Yapay zekâ dedektörü" değildir; resmî yazı türlerinde "-mektedir" meşrudur. |
| anahtar | Ana ifade başlıkta/açıklamada/ilk paragrafta | uyarı | öneri | İfade sözcüklerin ilk 5 harfiyle eşleştirilir; farklı ekler tolere edilir ama eş anlamlılar yakalanmaz. |
| sss | 3-8 gerçek soru | uyarı | öneri | Google FAQ zengin sonucunu 7 Mayıs 2026'dan beri göstermiyor; SSS okur ve yapay zekâ özetleri için tutulur. |
| kısaca | 3-5 maddelik özet | bilgi | öneri | Kanıt: korelasyon (içindekiler/özet ile alıntı). Kısa sayfalarda gereksizdir. |
| kaynak | Kaynak listesi var | bilgi | ilke | Olgu içermeyen sayfada (ör. hakkında) gerekmez. |
| olgu-kaynak | Sayı içeren paragrafların yarıdan fazlasında [n] atfı ya da bağlantı yok | uyarı | ilke | Atıf biçimi `[n]` ve bağlantıdır; dipnot biçimleri yakalanmaz. |
| şablon | "bu yazıda", "günümüzde" vb. | bilgi | öneri | Tek başına zararsız; ikisi birlikte uyarır. |
| json-ld, kanonik, görsel | HTML'de geçerli JSON-LD, rel=canonical, alt metin | uyarı | ilke | Dekoratif görselde boş `alt=""` doğrudur ve geçer (alt özelliği var). |

## Sosyal açıklama (`kontrol.mjs sosyal`)

| Kural | Ne denetler | Seviye | Sınıf | Bilinen yanlış-pozitif |
|---|---|---|---|---|
| uzunluk | Instagram/TikTok 2200, YouTube 4900 karakter | uyarı | karışık | YouTube 5000 resmî; Instagram 2200 ve TikTok 2200/4000 doğrulanamadı (en kısa güvenli sınır kullanılır). |
| etiket | Instagram/TikTok ≤ 5 (aşılırsa hata), YouTube ≤ 3 (uyarı); tekrar; YouTube 60+ hata | uyarı | karışık | Instagram/TikTok 5 sınırı kullanıcı tarafından hesapta doğrulandı (resmî yardım sayfası okunamadı); YouTube'un 3'ü görünen etiket sayısıdır, 60 resmî sınırdır. |
| ilk-satır | ≤ 125 karakter; etiketle başlamaz | uyarı | öneri | "Devamını gör" kesme noktası cihaza göre değişir. |
| başlık | YouTube başlık ≤ 100; ana ifade başta | hata/bilgi | kesin (100) | İlk ~70 karakter mobil görünüm tahminidir. |
| bölüm | 00:00 ile başlar, ≥ 3 damga, artan sıra, ≥ 10 sn | hata | kesin | YouTube bölüm biçimi değişirse güncelle; Shorts için geçerli değil. |
| anahtar | Ana ifade ilk satırda/başlıkta | uyarı | öneri | Eş anlamlılar yakalanmaz. |
| olgu-uyum | Açıklamadaki sayılar ve özel adlar transkriptte geçiyor mu | uyarı/bilgi | ilke | "üç" ile "3" farkı sayı sayılmaz (yazıyla yazılan sayı yakalanmaz, rakamla yazılan transkriptte yazıyla geçerse yanlış alarm olur). |
| gizli-karakter | Sıfır genişlikli karakter | uyarı | ilke | Bazı emoji dizileri ZWJ içerir; araç yalnızca 200B-200D, 2060, FEFF'i arar. |
| bağlantı | IG/TikTok'ta bağlantı tıklanmaz | bilgi | öneri | Platform davranışı değişebilir. |

## Derleme çıktısı (`dist-kontrol.mjs`)

| Kural | Ne denetler | Seviye | Sınıf | Bilinen yanlış-pozitif |
|---|---|---|---|---|
| başlık, açıklama, h1, lang, kanonik, viewport | Her indekslenen sayfada temel etiketler | uyarı | ilke | `noindex` sayfalar atlanır; sadece `X-Robots-Tag` ile noindex yapılan sayfalar HTML'den görülmez ve denetlenir. |
| og | og:title/description/image/url ve dosyanın varlığı | uyarı | öneri | Harici adresteki görsel denetlenmez. |
| json-ld | Ayrıştırma ve `@id` referanslarının tanımlı olması | uyarı | ilke | Dışarıdaki bir `@id`'ye atıf geçerli olabilir (http ile başlayanlar atlanır). |
| iç-bağlantı | Kırık iç bağlantı | uyarı | ilke | Betik içinde üretilen bağlantılar taranmaz; sunucu yönlendirmeleri (`_redirects`) bilinmez. |
| yinelenen-başlık / -açıklama | Aynı metin birden çok sayfada | uyarı | ilke | Sayfalama sayfaları kasıtlı benzer olabilir. |
| öksüz-sayfa / zayıf-bağlantı | Gelen iç bağlantı sayısı 0 / 1 | uyarı/bilgi | öneri | Yalnızca denetlenen klasördeki bağlantılar sayılır; harici ya da site haritası keşfi sayılmaz. |
| sitemap | lastmod eksik, yinelenen URL | uyarı | ilke | `lastmod` yalnızca anlamlı değişiklikte güncellenmelidir; yoksa uyarı verir. |
| llms | llms.txt bağlantılarının derlemede var olması | uyarı | ilke | Dosya zorunlu değildir; yoksa kural çalışmaz. |
| markdown | `rel=alternate text/markdown` dosyalarının varlığı | uyarı | ilke | İçerik pazarlığı panel kuralıyla yapılıyorsa dosya adı farklı olabilir. |
| 404 | 404.html var | uyarı | ilke | Barındırma sağlayıcısı bilinmeyen yollar için başka bir mekanizma kullanıyorsa gereksizdir. |

## Çıktı alanları

`--json` çıktısında her bulgunun `oneri` alanı, düzeltici ajanın izleyeceği düzeltme stratejisidir (lint, düzelt, yeniden lint döngüsü). `--kaydet dosya.json` puanı kaydeder; `--baseline dosya.json` yalnızca puan düşerse başarısız olur.

Yeni kural eklerken: bu tabloya satır yaz, `benchmark/calistir.mjs`'e hem kusurlu hem temiz vaka ekle ve "Son gözden geçirme" tarihini güncelle.

## Sonradan eklenenler (8 Kasım 2026)

| Kural | Ne denetler | Seviye | Sınıf | Bilinen yanlış-pozitif |
|---|---|---|---|---|
| kapak-başlık (sosyal youtube, `--kapak-yazisi`) | Küçük resim yazısının sözcüklerinin yarıdan fazlası başlıkta da var mı; 5 sözcükten uzun mu | uyarı/bilgi | öneri | Marka adı ya da seri adı bilinçli tekrar olabilir. |
| favicon (dist) | Ana sayfada rel="icon" | uyarı | ilke | Simge yalnızca `/favicon.ico` olarak kökte duruyorsa Google onu da bulabilir. |
| gizlilik (dist) | Gizlilik/çerez sayfası var mı | bilgi | öneri | Hiç veri toplamayan sitelerde gerekmeyebilir. |
| gsc bosluk | Gösterim alan sorgu sayfada geçiyor mu (sözcüklerin ilk 5 harfi) | liste | öneri | Eş anlamlı ve farklı yazımlar yakalanmaz; listeyi okura yarar süzgecinden geçir. |
| gsc dusuk-to | Konum 3-10 ve TO < bant ortancasının yarısı | liste | öneri | Yapay zekâ özeti ya da zengin sonuç olan sorgularda TO doğal olarak düşüktür. |

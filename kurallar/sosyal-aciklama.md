# Instagram, TikTok ve YouTube: SEO açıklaması kuralları
Son gözden geçirme: 2026-11-08

Sosyal platformların kendi arama kutusu vardır. İzleyici bir konuyu aradığında platform videonun başlığına, açıklamasına, ekrandaki yazıya ve söylenene bakar. Bu dosya açıklama metninin ne taşıması gerektiğini anlatır.

Kanıt düzeyleri: **[resmî]** platformun kendi belgesi, **[ikincil]** haber ya da uzman aktarımı, **[öneri]** pratik kural. Platformlar sınırlarını sık değiştirir; bu dosyadaki sayılar araç eşikleridir ve `seo.config.json` ile ayarlanır.

## Ortak ilkeler

1. **Önce izleyicinin kullandığı sözcükler.** Videonun konusunu, izleyicinin arama kutusuna yazacağı biçimde, ilk cümlede söyle ("Kahve makinesi nasıl seçilir?" gibi). Şirket içi ad ya da proje kodu yazma.
2. **İlk satır kancadır ve anahtar ifadedir.** Instagram ve TikTok'ta uzun açıklama "devamını gör" ile kesilir; konu ve vaat ilk satıra sığar. YouTube'da arama sonucunda ve önerilerde ilk ~150 karakter görünür. [öneri]
3. **Vaat videoda gerçekten var.** Açıklamadaki her sayı, ad ve iddia videoda geçer ya da kaynağı yazılır. Videoda olmayan "ücretsiz", "en iyi", "tek yol" gibi ifadeler yazılmaz.
4. **Etiket az ve somut.** Instagram ve TikTok için en çok 5, YouTube için en çok 3 etiket; konuyu tanımlayan etiketler ("#kahvemakinesi"), genel kalabalık etiketler ("#keşfet", "#viral") değil. Instagram'ın Aralık 2025'ten beri en çok 5 etiket önerdiği ve etiketlerin erişimi artırmadığı, aramaya yaradığı aktarılıyor. [ikincil] YouTube başlık ve açıklamadaki hashtag'lerden en çok 3'ünü (en ilgi çekici bulduklarını kendisi seçer) başlığın üstünde gösterir; bir videoda 60'tan fazla hashtag varsa hepsi yok sayılır ve açıklamaya aşırı etiket yığmak spam politikasına aykırıdır. [resmî: YouTube yardım, 6390658 ve 146402]
5. **Tek soru.** Açıklamanın sonunda izleyicinin cevaplayabileceği tek gerçek soru bulunur. "Beğen, takip et, yoruma 1 yaz" gibi etkileşim yemleri yazılmaz; platformlar bunları öneriden çıkarabilir. [ikincil]
6. **Bağlantı.** Instagram ve TikTok açıklamasındaki bağlantı tıklanmaz; adres yerine "Ayrıntılı yazı profildeki bağlantıda" yaz. YouTube ve Facebook açıklamasında bağlantı tıklanır; ilk satırlardan sonra, alakalı tek bağlantı bırak. [öneri]
7. **Kaynak.** Olgu içeren videoda "Kaynak: Kurum (sayfa adı)" satırı ekle; alan adı değil kurum adı yaz, en çok 2 kurum.
8. **Gerçek kişi ve yapay zekâ etiketi.** Yapay zekâyla üretilmiş görüntü ya da ses varsa platformun etiket seçeneğini kullan ve açıklamada gizleme. [resmî: platform politikaları]

## Instagram (Reels ve gönderi)

- Sınır: 2200 karakter. Hedef: ilk satır 125 karakteri geçmez; toplam 300-600 karakter. [öneri]
- Biçim: 1) konu cümlesi (anahtar ifade + sayı), 2) tek cümle özet, 3) tek soru, 4) en çok 5 etiket.
- Ekrandaki yazı ve söylenen cümle de arama için okunur; açıklamayla aynı anahtar ifadeyi taşısın.
- Bağlantı yazma; "profildeki bağlantı" de.

## TikTok

- Sınır: 2200 karakter (güvenli taraf). Hedef: ilk satır 125 karakteri geçmez; toplam 150-400 karakter.
- TikTok aramasında başlık metni, ekran yazısı ve konuşma birlikte okunur; ana ifade üçünde de geçsin. [öneri]
- Etiket en çok 5. Bağlantı yazma.

## YouTube (uzun video ve Shorts)

- **Başlık:** en çok 100 karakter; mobilde ve önerilerde ilk ~70 karakter görünür, ana ifadeyi başa al. Abartı ve ünlem yok. [resmî: 100 karakter sınırı]
- **Açıklama:** 5000 karakter sınırı vardır; araç 4900'ü güvenli üst sınır sayar. İlk 150 karakterde konu ve vaat; sonra 2-3 cümle özet. [resmî]
- **Bölümler (zaman damgaları):** uzun videolarda ilk satır `00:00` ile başlar, en az 3 bölüm, her bölüm adı izleyicinin aratacağı bir ifade. YouTube bölümleri arama sonuçlarında gösterebilir. [resmî: YouTube yardım "video bölümleri"]
- **Etiket:** en çok 3, yalnızca konuyu tanımlayanlar. "Etiket yığma" satırı yazma.
- Yapay zekâyla üretilmiş gerçekçi görüntü ya da ses varsa YouTube'un "değiştirilmiş ya da sentetik içerik" bildirimini işaretle. [resmî]
- Altyazı dosyası yükle; arama ve erişilebilirlik için işe yarar. [öneri]

## Açıklama şablonu (örnek)

```
<Konu cümlesi: anahtar ifade + sayı>

<Tek cümle özet, videoda geçen somut ayrıntı>
<Tek gerçek soru?>

Kaynak: <Kurum (sayfa adı)>
<Yalnızca YouTube/Facebook: Ayrıntılı yazı: https://...>

#etiket1 #etiket2 #etiket3
```

## Konu ifadesi bulma (isteğe bağlı)

Açıklamaya eklenecek ifadeyi bulmak için izleyicinin yazdığı sorguları kullan: platformun arama kutusu önerileri, Google'ın arama önerileri ve kendi Search Console / YouTube Studio arama verin. İfadeyi uydurma; önerilerde görünmeyen bir ifade yazma. Rakip videonun açıklamasını kopyalama; yalnız hangi ifadelerin aratıldığını gör.

## Düzeltme sırası

1. `node araclar/kontrol.mjs sosyal <platform> <dosya> [--baslik "..."]` çalıştır.
2. Hataları düzelt: uzunluk, etiketle başlayan ilk satır, 00:00 ile başlamayan bölüm listesi.
3. Uyarıları düzelt: etiket sayısı, ilk satır uzunluğu, abartı ve ünlem.
4. Olgu eklemeden, anlamı koruyarak yeniden yaz; videoda olmayan bir şeyi yazma.
5. Yeniden çalıştır; en çok 3 tur.

## Hangi sayı kesin, hangisi doğrulanamadı? (8 Kasım 2026 okuması)

| Kural | Durum | Kaynak |
|---|---|---|
| YouTube başlık ≤ 100 karakter, açıklama ≤ 5.000 karakter | **[resmî]** | [YouTube yardım 57407](https://support.google.com/youtube/answer/57407) |
| YouTube: başlık ve açıklamadaki hashtag'lerden en ilgi çekici bulduğu en çok 3'ünü kendisi seçip başlık üstünde gösterir (sıra senin değil, YouTube'un seçimi); 60+ hashtag'de hepsi yok sayılır | **[resmî]** | [YouTube yardım 6390658](https://support.google.com/youtube/answer/6390658) |
| YouTube etiketleri (tag) keşifte "minimal" rol oynar; yanlış yazılan konularda işe yarar | **[resmî]** | [YouTube yardım 57407](https://support.google.com/youtube/answer/57407) |
| YouTube bölümleri: ilk damga 00:00, en az 3 damga, artan sıra, her bölüm ≥ 10 sn | **[resmî]** | [YouTube yardım 9884579](https://support.google.com/youtube/answer/9884579) |
| YouTube arama sıralaması: ilgi (başlık, etiket, açıklama, içerik), etkileşim, kalite | **[resmî]** | [YouTube yardım 16090438](https://support.google.com/youtube/answer/16090438) |
| YouTube: gerçekçi yapay zekâ üretimi içerik bildirilir (Studio "AI use"); gerçekçi olmayan animasyon ve küçük düzenleme gerekmez | **[resmî]** | [YouTube yardım 14328491](https://support.google.com/youtube/answer/14328491) |
| Instagram: anahtar kelime açıklamaya yazılır, yorumlara değil | **[resmî]** (eski blog yazısı) | [Instagram: arama nasıl çalışır](https://about.instagram.com/blog/announcements/break-down-how-instagram-search-works) |
| Instagram: en çok 5 hashtag | **Kullanıcı doğruladı** (8 Kasım 2026, hesapta); haber kaynağı: Aralık 2025, kademeli. Yardım sayfasında doğrulanamadı | [Social Media Today](https://www.socialmediatoday.com/news/instagram-implements-new-limits-on-hashtag-use/808309/) |
| Instagram: açıklama 2.200 karakter | **doğrulanamadı** (yaygın bilinen değer); yayından önce uygulamada dene | - |
| Instagram özgünlük: başkasının içeriğine filigran, kenarlık, kredi ya da altyazı eklemek "önemli düzenleme" sayılmaz | **[resmî]** | [Instagram creators: özgünlük](https://creators.instagram.com/original-content-guidelines/) |
| TikTok: anahtar kelime açıklama, seslendirme, altyazı ve ekran yazısında önemli | **[resmî]** (ayrıntısız) | [TikTok Creator Academy](https://www.tiktok.com/creator-academy/article/Getting-discovered-with-Search) |
| TikTok: en çok 5 hashtag | **Kullanıcı doğruladı** (8 Kasım 2026, hesapta); haber kaynağı: Ağustos 2025 | [Social Media Today](https://www.socialmediatoday.com/news/tiktok-implements-five-hashtag-limit-per-post/757857/) |
| TikTok: açıklama 2.200 ya da 4.000 karakter | **doğrulanamadı**; araç en kısa güvenli sınır olan 2.200'ü kullanır | - |

Doğrulanamayan sayılar araçta uyarı düzeyindedir ve `seo.config.json` ile değiştirilebilir. Yayınlamadan önce platformun uygulamasında bir deneme gönderisiyle sınırı sına.

## Yapay zekâ üretimi içerik bildirimi

- **YouTube:** Gerçekçi görünen yapay zekâ içeriğini (gerçek kişiye söylemediği şeyi söyletmek, gerçek olay görüntüsünü değiştirmek, gerçekçi sahne ya da ses) Studio'da bildir. Açıkça gerçekçi olmayan animasyon ve renk, altyazı gibi küçük düzenlemeler bildirim gerektirmez. [resmî]
- **Instagram ve TikTok:** Platformlar yapay zekâ göstergelerini algılayınca otomatik etiket koyabilir (Meta "AI info", TikTok C2PA Content Credentials okuması); otomatik etiketi kaldıramazsın. Açıklamada yapay zekâ kullandığını gizleme. [resmî, özetten]
- Gerçek kişinin yapay zekâyla sahte görüntüsü üretilmez.

## Kaynaksız vaatler (alınmadı)

"YouTube açıklamasını güncelleyince yapay zekâ erişimi %359 arttı" gibi satıcı vaka çalışmaları kontrol grubu ve yöntem açıklamadığı için kural yapılmadı; kendi videolarında 2 haftalık karşılaştırma ile ölç (aşağıdaki "Ölçüm" bölümüne bak: `kurallar/olcum-protokolu.md`).

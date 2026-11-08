# Web sayfası: SEO, AEO ve GEO kuralları
Son gözden geçirme: 2026-11-08

Ajan bu dosyayı düzeltme sırasında okur. Her kuralın yanında kanıt düzeyi var:

- **[resmî]** arama motorunun ya da yapay zekâ ürününün kendi belgesi.
- **[çalışma]** yöntemi açık ölçüm; genelde korelasyon, nedensellik değil.
- **[öneri]** pratik kural; kanıt zayıf ya da siteye göre değişir, ölçerek karar ver.

Terimler: **SEO** arama sonuçlarında görünmek. **AEO** (Answer Engine Optimization) doğrudan cevap kutularında ve sesli asistanlarda kaynak olmak. **GEO** (Generative Engine Optimization) yapay zekâ cevaplarında (Google AI Overviews ve AI Mode, ChatGPT, Perplexity, Copilot) kaynak gösterilmek.

## Temel ilke

GEO ve AEO, SEO'nun üstüne biner. Google'ın yapay zekâ optimizasyon rehberine göre (son güncelleme 10 Temmuz 2026) AI Overviews ve AI Mode'a uygun olmak için sayfa dizinde ve snippet gösterilmeye uygun olmalı, **ayrıca site Search Console'daki "Search generative AI" kontrolünde dahil (Include) olmalı**. Bu kontrolün varsayılanı Include'dur; alt mülklerde varsayılan Inherit, üst mülkün ayarını izler. Yani çoğu site için ek işlem gerekmez, ama ayarın Exclude yapılmadığını kontrol et. (Eski "AI features" sayfası hâlâ "ek şart yok" diyor; daha yeni olan rehberdir.) `llms.txt` ya da içeriği küçük parçalara bölmek gerekmez. [resmî] [Google: AI features](https://developers.google.com/search/docs/appearance/ai-features), [Google: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

Bu yüzden ajan "yapay zekâ için yeniden yazmaz". Metni okur için açık, doğru ve kendi başına anlaşılır yapar; makine bunu zaten alıntılar.

## Başlık (`<title>` ve H1)

1. Ana arama ifadesi başta, okurun yazdığı biçimde. [öneri]
2. Hedef 50-60 karakter, yaklaşık 580 piksel. Karakter sayısı Türkçe harflerde ve marka ekinde yanıltır; Google uzunluğu piksel genişliğine göre keser. Araç 15-60 karakter dışını ve tahmini ~580 px üstünü uyarır. [öneri]
3. Başlığın ikinci yarısı sayfada gerçekten olan en ayırt edici ayrıntıdır: sayı, fark, ülkeye özgü bilgi, tarihli ölçüm, uyarı. Sayfada olmayan vaat yazılmaz. [resmî: Google, başlığın sayfayla uyuşmasını ve kısa, özgün olmasını ister; anahtar kelime doldurmayı yasaklar] [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
4. Yıl yalnızca arama ifadesinin parçasıysa ve sayfa o yıla aitse yazılır. Fiyat rakamı yalnızca sayfanın asıl konusu o fiyatsa başlığa girer, çünkü fiyat değişir. [öneri; bir kontrollü testte başlığa sabit fiyat eklemek trafiği düşürdü, tek site]
5. Abartı sözcükleri, ünlem, emoji ve TAMAMI BÜYÜK sözcük yazılmaz. Konuyu saklayan "Şaşıracaksın" tipi başlık yazılmaz. [öneri]
6. `<title>` ile H1 aynı konuyu söyler.

Evrensel "sihirli kelime" yoktur; yıl, soru, parantez ve büyük harf etkileri siteye göre değişir. Karar için kendi Search Console verini kullan.

## Meta açıklama

1. 120-160 karakter, cümle bitmiş, sayfaya özgün. [resmî: her sayfaya özgün açıklama] [Google: snippets](https://developers.google.com/search/docs/appearance/snippet)
2. Google açıklamayı çoğu zaman sayfa içeriğinden yeniden yazar (bir çalışmada %60'ın üstü); yine de yazmaya değer, çünkü kalan kısmı olduğu gibi gösterilir ve Bing ile Yandex de kullanır. [çalışma, satıcı]
3. İlk cümlede sayfanın cevabı ya da ana kazanımı yer alır; anahtar kelime yığını yapılmaz.

## Cevap önce

1. Sayfanın ilk paragrafı soruyu doğrudan cevaplar (en çok ~60 kelime). Arka plan ve tanım sonra gelir. [resmî: Microsoft, kısa ve bağımsız cevap önerir; Google'ın kalite rehberi en yararlı içeriğin üstte olmasını ister] [Microsoft: AI search answers](https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers)
2. Her bölümün ilk iki cümlesi o bölümün cevabıdır; bölüm başına tek fikir. [resmî: Microsoft]
3. Ara başlıkların bir kısmı okurun soracağı soru biçiminde yazılır ("Kireç çözme ne sıklıkla yapılmalı?"). "Genel bilgiler" gibi boş etiket kullanılmaz. [resmî: Microsoft] [çalışma: soru biçimli H2 ile alıntı arasında ilişki, korelasyon]
4. Karşılaştırma tabloya, adımlar numaralı listeye, tanım kısa paragrafa konur. Her şeyi madde işaretine çevirme. [resmî: Microsoft]
5. Cevabı sekme, akordeon, görsel ya da PDF içine saklama. Kritik olgu görünür HTML metinde durur. [resmî: Microsoft, Google'ın görünür metinle tutarlılık şartı] [çalışma: ChatGPT ve Claude botları sonradan JavaScript ile gelen içeriği okumadı]

## Yapı

1. 3-10 ara başlık (H2). Çok sayıda başlık konunun dağıldığını gösterir; bölümleri birleştir. [öneri]
2. Tek H1.
3. Sayfa başında 3-5 maddelik "Kısaca" bloğu: her madde tek başına doğru ve rakamlı. [öneri]
4. SSS: 3-8 gerçek okur sorusu. Cevaplar 1-3 cümle, sayfadaki bilgiyle tutarlı. "Alibi SSS" (kimsenin sormadığı sorular) yazılmaz. [çalışma: SSS etkisi yalnızca gerçek sorularda; FAQ zengin sonucu Google'da artık gösterilmiyor, ama okur ve yapay zekâ için değeri sürüyor]
5. Hedef ortalama cümle 10-18 kelime (araç 8-22 dışını uyarır); 30+ kelimelik cümle bölünür. Türkçede bağlaç zinciri ("ve ... ama ... çünkü") ve aynı kalıpla biten ardışık cümle tekdüze okunur; ek ve yapı çeşitlendirilir. [öneri]

## Yapılandırılmış veri (JSON-LD)

1. Görünür metinle eşleşir: şemadaki fiyat, tarih, yazar ve SSS sayfada da görünür olmalı. [resmî: Google yapılandırılmış veri kuralları]
2. Yalnız JSON-LD'de bulunan olgu yapay zekâ sistemlerinde bulunamadı; olgu görünür metinde de yer alır. [çalışma]
3. Yapılandırılmış veri yapay zekâ alıntısı için nedensel kaldıraç değildir (ilk kez şema ekleyen sayfalarda etki sıfırdan ayırt edilemedi). Doğruluk ve varlık netliği için tutulur, ödül için değil. [çalışma] [Google: search gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)
4. `datePublished` ve `dateModified` yalnızca içerik gerçekten değişince güncellenir; görünür tarihle tutarlı olur. İçerik değişmeden tarih oynatmak yapılmaz. [resmî] [Google: publication dates](https://developers.google.com/search/docs/appearance/publication-dates)

## Doğruluk ve güven (düzelticinin kırmızı çizgileri)

1. **Olgu uydurulmaz.** Düzeltici sayı, fiyat, tarih, ürün adı, alıntı ve kaynak eklemez; metinde olmayan bir şeyi "doğal olsun" diye yazmaz. Eksik bilgiyi sorar ya da `[DOĞRULANMADI]` diye işaretler.
2. Var olan bir iddia güçlendirilmez (ör. "bazı" → "tüm"). Genellemeler daraltılır, genişletilmez.
3. Sahte yazar, sahte yorum, sahte uzmanlık ya da sahte anma eklenmez. [resmî: Google yazar bilgisinde aldatmayı ve sahte anma arayışını uyarıyor]
4. Yapay zekâ ile üretilmiş ya da yardım alınmış metin yayından önce insan tarafından olgu denetiminden geçer: gövde, başlık, meta açıklama, JSON-LD ve görsel alt metni. [resmî] [Google: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
5. Yalnızca arama motoru için yazılmış, başka sayfada olmayan hiçbir şey söylemeyen metin üretilmez. Her sayfa için tek soru: "başka sitede olmayan ne var?" [resmî: Google "non-commodity" içerik ölçütü]
6. Aynı konuyu her varyasyon için ayrı sayfaya bölmek önerilmez; alt soruları aynı sayfada cevapla. [resmî: Google ölçekli içerik uyarısı]
7. Başka sitenin metnini kopyalama; yalnız olguyu al, kaynağı göster.

## Düzeltme sırası

1. `node araclar/kontrol.mjs web <dosya>` çalıştır; bulguları yaz.
2. Önce **hata**, sonra **uyarı**; **bilgi** maddelerini yalnızca yazı bunu taşıyabiliyorsa uygula.
3. Her değişikliği küçük tut; yazarın sesini ve ürün adlarını koru.
4. Yeniden çalıştır; en çok 3 tur. Üçüncü turda hâlâ hata varsa durup nedenini söyle.

## Ölçüm (isteğe bağlı)

Küçük sitede ölçerek karar ver: Search Console'da tıklama ve sorgu verisi birincil, gösterim ve ortalama konum ikincildir. Değişiklikten sonra en az birkaç hafta bekle; birden çok sayfayı aynı anda değiştirme. Yapay zekâ görünürlüğünü tek bir istemin sonucuyla değil, çok sayıda farklı istemle ölç. [çalışma]

# Sayfa kalitesi kontrol listesi (yararlı, güvenilir, insan odaklı içerik)
Son gözden geçirme: 2026-11-08

Dayanak: Google Search Central'ın "yararlı, güvenilir, insan odaklı içerik oluşturma" rehberi ve Google'ın yapay zekâ üretimi içerik hakkındaki yönergesi. Liste bu belgelerdeki soruların kısa bir uyarlamasıdır; sıralama formülü değildir. Her madde için **Geçer / Kısmen / Kalır / Uygulanmaz / Ölçülmedi** yaz ve kanıtı (adres, satır) ekle. Veri yoksa "Ölçülmedi" dürüst cevaptır.

- [Google: yararlı içerik](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: yapay zekâ üretimi içerik](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)

## A. Amaç

1. Sayfa belirli bir okur ve görev için mi yazılmış, yalnızca arama trafiği için mi? Arama olmasa da değeri olur muydu?
2. Başlığın vaat ettiği cevap sayfada var mı?
3. Okur, aynı aramayı yeniden yapmadan işini bitirebiliyor mu?
4. Dil, ülke ve arama niyeti doğru mu (fiyat, para birimi, erişim, birimler)?

## B. Özgünlük ve derinlik

5. Sayfada başka yerde bulunmayan bir şey var mı: kendi verin, testin, hesabın, deneyimin, tablon?
6. Kaynaktan alınan bilgiye özetlemenin ötesinde katkı yapılmış mı? Kaynak göstermek tek başına katkı değildir.
7. Konu, okurun görevi için yeterince kapsanmış mı? Uzunluk tamlık değildir; kelime sayısı hedefiyle dolgu yazılmamalı.
8. Başlık abartısız ve gövdeyle uyumlu mu?
9. Bilinmeyen ya da doğrulanmamış şeyler açıkça belirtilmiş mi (söylenti, çıkış tarihi, sızıntı)?

## C. Güven

10. Yazar ve yayıncı kimliği doğru ve doğrulanabilir mi? Uydurma yazar profili, sahte yeterlilik ya da yapay zekâ portresi aldatmadır ve düşük kalite sinyalidir.
11. Yapay zekâ kullanıldıysa okurun bekleyeceği yerde açıklanmış mı, ve metin yayından önce insan tarafından olgu denetiminden geçmiş mi?
12. Olgular kaynakla destekli mi, kaynaklar görünür ve açılıyor mu? Sayı, fiyat ve tarihin okunma tarihi belli mi?
13. Düzeltme ve güncelleme dürüst mü: görünür tarih yalnızca içerik gerçekten değişince değişiyor mu?
14. Para ya da sağlık kararına etki eden konularda (YMYL) daha sıkı kaynak ve uzman denetimi var mı?

## D. Yayın hijyeni

15. Sayfa tamamlanmış mı: kırık görsel, yer tutucu metin, bozuk tablo, eksik bölüm yok mu?
16. Ölçekli üretimde her sayfa yeterli editör ilgisi görüyor mu? Denetimsiz toplu üretim, Google'ın "ölçekli içerik istismarı" politikasına takılabilir.
17. Aynı konuyu varyasyonlara bölüp ince sayfalar mı çoğaltılmış? Alt soruları tek sayfada cevaplamak daha doğru.
18. Sayfa mobilde okunuyor mu; reklam, pencere ya da yönlendirme okumayı engelliyor mu?

## Karar

- Bir A-C maddesi **Kalır** ise düzeltmeden önce yayına almayın ya da `noindex` düşünün; bu, metni parlatarak çözülmez.
- Çoğu madde **Kısmen** ise sayfa için tek bir "başka sitede olmayan şey" belirleyin ve onu ekleyin.

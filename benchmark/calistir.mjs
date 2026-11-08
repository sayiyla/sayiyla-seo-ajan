#!/usr/bin/env node
// Kusur yerleştirilmiş (planted-defect) benchmark: araç bilinen kusurları yakalıyor mu, temiz sayfada yanlış alarm veriyor mu?
//   node benchmark/calistir.mjs
// Her vakada `bekle` kuralları bulunmalı, `yasak` kuralları bulunmamalı. Yanlış alarm "zaten doğru olana düzelt demek"tir ve kusur sayılır.
// Yeni kural eklediğinde buraya hem kusurlu hem temiz bir vaka ekle; CI'da bu betik çalışır.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const KOK = path.resolve(import.meta.dirname, "..");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "seo-benchmark-"));

const GOVDE = `Evde günde 3 fincandan fazla kahve içiyorsan filtre makinesi seni daha az yorar. Aşağıda üç türü fiyat, bakım ve lezzet açısından karşılaştırıyoruz.

## Hangi tür kahve makinesi sana uygun?

Filtre makinesi hazırlığı beş dakika süren, kalabalık için uygun bir yöntemdir. Kapsül makinesi tek tuşla çalışır ve temizliği kolaydır.

## Kireç çözme ne sıklıkla yapılmalı?

Sert su kullanıyorsan ayda bir, yumuşak suda üç ayda bir yapmak makinenin ömrünü uzatır.

## Satın almadan önce neye bakmalı?

Su haznesi hacmini, yedek parça bulunabilirliğini ve temizlik kolaylığını karşılaştır.
`;
const SSS = `sss:
  - soru: Kahve makinesi kaç yıl dayanır?
    cevap: Düzenli bakımla beş yıl ve üzeri kullanılıyor.
  - soru: Kapsül makinesi pahalı mı?
    cevap: Fincan başı maliyet yüksek, makinenin kendisi ucuz olabilir.
  - soru: Öğütücü gerekir mi?
    cevap: Espresso için evet, filtre için şart değil.
`;
const on = (baslik, ozet, ek = "") => `---\nbaslik: "${baslik}"\nozet: "${ozet}"\nkisaca:\n  - Üç tür arasında günlük tüketim belirleyici.\n${SSS}${ek}kaynaklar:\n  - no: 1\n    baslik: "Kaynak"\n    url: https://example.com\n---\n\n`;
const OZET = "Filtre, kapsül ve espresso makinesinin fiyat, bakım ve lezzet farkını karşılaştırdık; günlük fincan sayına göre seçim önerdik.";

const VAKALAR = [
  // --- Temiz vakalar: bulgu çıkmamalı. "Sıralama" ve "şoklayıcı" gibi sözcükler abartı listesindeki "sır" ve "şok" ile karışmamalı.
  { ad: "temiz-sayfa", tur: "web", uzanti: "md", metin: on("Kahve makinesi nasıl seçilir? Sıralama ve fark", OZET) + GOVDE, bekle: [], yasak: ["başlık", "açıklama", "abartı", "h2", "sss", "cümle", "h1"] },
  { ad: "temiz-sosyal-youtube", tur: "sosyal", platform: "youtube", baslik: "Kahve makinesi nasıl seçilir? Filtre, kapsül, espresso", uzanti: "txt", metin: "Kahve makinesi nasıl seçilir? Filtre, kapsül ve espresso farkını günde kaç fincan içtiğine göre karşılaştırıyorum.\n\nBölümler\n00:00 Hangi makine kime uygun?\n01:10 Filtre makinesi\n02:30 Kapsül makinesi\n\n#kahvemakinesi #filtrekahve", bekle: [], yasak: ["başlık", "bölüm", "etiket", "ilk-satır", "abartı", "uzunluk"] },
  // --- Kusurlu vakalar
  { ad: "baslik-kisa", tur: "web", uzanti: "md", metin: on("Kahve", OZET) + GOVDE, bekle: ["başlık"], yasak: [] },
  { ad: "baslik-uzun", tur: "web", uzanti: "md", metin: on("Kahve makinesi nasıl seçilir? Filtre, kapsül ve espresso makinesi arasındaki bütün farklar ve fiyatlar", OZET) + GOVDE, bekle: ["başlık"], yasak: [] },
  { ad: "baslik-abarti", tur: "web", uzanti: "md", metin: on("Kahve makinesi: inanılmaz sırlar ve şok fiyatlar", OZET) + GOVDE, bekle: ["abartı"], yasak: [] },
  { ad: "aciklama-eksik", tur: "web", uzanti: "md", metin: `---\nbaslik: "Kahve makinesi nasıl seçilir? Filtre ve kapsül"\n${SSS}---\n\n` + GOVDE, bekle: ["açıklama"], yasak: [] },
  { ad: "h1-cogul-html", tur: "web", uzanti: "html", metin: `<!doctype html><html lang="tr"><head><title>Kahve makinesi nasıl seçilir? Filtre ve kapsül</title><meta name="description" content="Filtre, kapsül ve espresso makinesinin fiyat, bakım ve lezzet farkını karşılaştırdık; günlük fincan sayına göre seçim önerdik."><link rel="canonical" href="https://example.com/kahve/"></head><body><h1>Kahve</h1><h1>Makine</h1><p>Evde günde 3 fincandan fazla kahve içiyorsan filtre makinesi seni daha az yorar.</p></body></html>`, bekle: ["h1"], yasak: [] },
  { ad: "tek-h2", tur: "web", uzanti: "md", metin: on("Kahve makinesi nasıl seçilir? Filtre ve kapsül", OZET) + "Evde günde 3 fincandan fazla kahve içiyorsan filtre makinesi seni daha az yorar.\n\n## Tek bölüm\n\nKısa içerik.\n", bekle: ["h2"], yasak: [] },
  { ad: "sosyal-etiketle-baslar", tur: "sosyal", platform: "instagram", uzanti: "txt", metin: "#kahve #makine #espresso\nKahve makinesi nasıl seçilir? Günde 3 fincandan fazlası için filtre, azı için kapsül.", bekle: ["ilk-satır"], yasak: [] },
  { ad: "sosyal-fazla-etiket", tur: "sosyal", platform: "tiktok", uzanti: "txt", metin: "Kahve makinesi nasıl seçilir? Filtre mi kapsül mü, tek tabloda.\n\n#a1 #b2 #c3 #d4 #e5 #f6 #g7", bekle: ["etiket"], yasak: ["ilk-satır"] },
  { ad: "anahtar-baslikta-yok", tur: "web", uzanti: "md", ek: ["--anahtar", "espresso makinesi bakımı"], metin: on("Kahve makinesi nasıl seçilir? Filtre ve kapsül", OZET) + GOVDE, bekle: ["anahtar"], yasak: [] },
  { ad: "anahtar-her-yerde-temiz", tur: "web", uzanti: "md", ek: ["--anahtar", "kahve makinesi nasıl seçilir"], metin: on("Kahve makinesi nasıl seçilir? Filtre ve kapsül", "Kahve makinesi nasıl seçilir? Filtre, kapsül ve espresso makinesinin fiyat, bakım ve lezzet farkını günde kaç fincan içtiğine göre karşılaştırdık.") + GOVDE.replace("Evde günde 3 fincandan", "Kahve makinesi nasıl seçilir? Evde günde 3 fincandan").replace("## Hangi tür kahve makinesi sana uygun?", "## Kahve makinesi nasıl seçilir: hangi tür sana uygun?"), bekle: [], yasak: ["anahtar", "okunabilirlik"] },
  { ad: "okunabilirlik-zor", tur: "web", uzanti: "md", metin: on("Kahve makinesi nasıl seçilir? Filtre ve kapsül", OZET) + "Gerçekleştirilebilirlik değerlendirmelerinin sürdürülebilirlik göstergelerini kapsamlı biçimde karşılaştırılabilmesi, kurumsallaşmış mekanizmaların uygulanabilirliğini değerlendirmeyi zorunlu kılmaktadır. Dolayısıyla değerlendiricilerin standartlaştırılmış yöntemleri benimsemeleri gerekmektedir. Bununla birlikte uluslararasılaşmış organizasyonların operasyonelleştirilmiş süreçleri belirlenmiş ölçütlere dayandırılmaktadır. Sonuçlandırılmış değerlendirmelerin yaygınlaştırılması kaçınılmazlaşmıştır.\n\n## Birinci\n\nMetin.\n\n## İkinci\n\nMetin.\n\n## Üçüncü\n\nMetin.\n", bekle: ["okunabilirlik"], yasak: [] },
  { ad: "sosyal-olgu-uyumsuz", tur: "sosyal", platform: "instagram", uzanti: "txt", transkript: "Bu videoda üç tür makineyi karşılaştırıyoruz: filtre, kapsül ve espresso.", metin: "Kahve makinesi nasıl seçilir? Videoda 12 makineyi 40 ölçütle test ettim.\n\n#kahvemakinesi", bekle: ["olgu-uyum"], yasak: [] },
  { ad: "sosyal-olgu-uyumlu-temiz", tur: "sosyal", platform: "instagram", uzanti: "txt", transkript: "Bu videoda 3 makineyi 7 ölçütle karşılaştırıyoruz: filtre, kapsül ve espresso.", metin: "Kahve makinesi nasıl seçilir? Videoda 3 makineyi 7 ölçütle karşılaştırdım.\n\n#kahvemakinesi", bekle: [], yasak: ["olgu-uyum"] },
  { ad: "sosyal-youtube-iki-bolum", tur: "sosyal", platform: "youtube", baslik: "Kahve makinesi nasıl seçilir? Filtre, kapsül, espresso", uzanti: "txt", metin: "Kahve makinesi nasıl seçilir? Filtre, kapsül ve espresso farkını karşılaştırıyorum.\n\nBölümler\n00:00 Giriş\n01:00 Filtre makinesi\n\n#kahvemakinesi", bekle: ["bölüm"], yasak: [] },
  { ad: "sosyal-youtube-kisa-bolum", tur: "sosyal", platform: "youtube", baslik: "Kahve makinesi nasıl seçilir? Filtre, kapsül, espresso", uzanti: "txt", metin: "Kahve makinesi nasıl seçilir? Filtre, kapsül ve espresso farkını karşılaştırıyorum.\n\nBölümler\n00:00 Giriş\n00:05 Filtre\n01:00 Kapsül\n\n#kahvemakinesi", bekle: ["bölüm"], yasak: [] },
  { ad: "ton-mektedir", tur: "web", uzanti: "md", metin: on("Kahve makinesi nasıl seçilir? Filtre ve kapsül", OZET) + "Filtre makineleri yaygın olarak kullanılmaktadır. Kapsül makineleri pratik bulunmaktadır. Espresso makineleri bakım gerektirmektedir. Su sertliği önem taşımaktadır. Kireç çözme düzenli yapılmaktadır. Yedek parça aranmaktadır. Fiyatlar değişmektedir. Haznesi kontrol edilmektedir. Kapasite karşılaştırılmaktadır. Temizlik kolaylığı değerlendirilmektedir. Marka seçimi yapılmaktadır.\n\n## Birinci\n\nMetin.\n\n## İkinci\n\nMetin.\n\n## Üçüncü\n\nMetin.\n", bekle: ["ton"], yasak: [] },
  { ad: "olgu-kaynaksiz", tur: "web", uzanti: "md", metin: on("Kahve makinesi nasıl seçilir? Filtre ve kapsül", OZET) + "Filtre makineleri fincan başına 2 TL tutuyor.\n\nKapsül makineleri fincan başına 12 TL tutuyor.\n\nEspresso makineleri ayda 3 saat bakım istiyor.\n\n## Birinci\n\nMetin.\n\n## İkinci\n\nMetin.\n\n## Üçüncü\n\nMetin.\n", bekle: ["olgu-kaynak"], yasak: [] },
  { ad: "kapak-basligi-tekrarliyor", tur: "sosyal", platform: "youtube", baslik: "Kahve makinesi nasıl seçilir? Filtre, kapsül, espresso", ek: ["--kapak-yazisi", "Kahve makinesi nasıl seçilir"], uzanti: "txt", metin: "Kahve makinesi nasıl seçilir? Filtre, kapsül ve espresso farkı.\n\n#kahvemakinesi", bekle: ["kapak-başlık"], yasak: [] },
  { ad: "kapak-basligi-farkli-temiz", tur: "sosyal", platform: "youtube", baslik: "Kahve makinesi nasıl seçilir? Filtre, kapsül, espresso", ek: ["--kapak-yazisi", "Günde 3 fincan mı?"], uzanti: "txt", metin: "Kahve makinesi nasıl seçilir? Filtre, kapsül ve espresso farkı.\n\n#kahvemakinesi", bekle: [], yasak: ["kapak-başlık"] },
  { ad: "haber-sss-zorlanmaz", tur: "web", uzanti: "md", metin: "---\nbaslik: \"Yeni model duyuruldu: fiyatı ve önceki sürümden farkı\"\nozet: \"Yeni model bugün duyuruldu; fiyatı, önceki sürümden farkı ve Türkiye erişimi hakkında bilinenleri kaynaklarıyla kısaca derledik.\"\nkicker: Haber\nkaynaklar:\n  - no: 1\n    url: https://example.com\n---\n\nYeni model bugün duyuruldu ve fiyatı önceki sürümle aynı kaldı [1].\n\n## Ne değişti?\n\nModel daha hızlı yanıt veriyor [1].\n", bekle: [], yasak: ["sss", "kısaca", "h2", "soru-başlık"] },
  { ad: "kok-yumusama-temiz", tur: "web", uzanti: "md", ek: ["--anahtar", "kitap rengi"], metin: on("Kitabın rengi nasıl seçilir? Kapak rengi rehberi", "Kitabın rengi okuru etkiler mi? Kapak rengi seçimi için kaynaklı ve kısa bir rehber hazırladık; örnekleri de tek tek anlattık.") + "Kitabın rengi ilk izlenimi belirler; kapak rengi okurun dikkatini çeker.\n\n## Kitabın rengi nasıl seçilir?\n\nMetin.\n\n## Hangi renkler öne çıkar?\n\nMetin.\n\n## Kapak rengi neyi etkiler?\n\nMetin.\n", bekle: [], yasak: ["anahtar"] },
  { ad: "sosyal-yaziyla-sayi-temiz", tur: "sosyal", platform: "instagram", uzanti: "txt", transkript: "Bu videoda üç makineyi yedi ölçütle karşılaştırıyoruz, tasarruf yüzde kırk.", metin: "Kahve makinesi nasıl seçilir? Videoda 3 makineyi 7 ölçütle karşılaştırdım, %40 tasarruf.\n\n#kahvemakinesi", bekle: [], yasak: ["olgu-uyum"] },
  { ad: "youtube-bos-bolum-adi", tur: "sosyal", platform: "youtube", baslik: "Kahve makinesi nasıl seçilir? Filtre, kapsül, espresso", uzanti: "txt", metin: "Kahve makinesi nasıl seçilir? Filtre, kapsül ve espresso farkı.\n\n00:00 Giriş\n01:00 Bölüm 1\n02:00 Bölüm 2\n03:00 Sonuç\n\n#kahvemakinesi", bekle: ["bölüm-adı"], yasak: ["bölüm"] },
  { ad: "sosyal-youtube-bolum-yanlis", tur: "sosyal", platform: "youtube", baslik: "Kahve makinesi nasıl seçilir? Filtre, kapsül, espresso", uzanti: "txt", metin: "Kahve makinesi nasıl seçilir? Filtre, kapsül ve espresso farkını karşılaştırıyorum.\n\nBölümler\n01:00 Filtre makinesi\n02:30 Kapsül makinesi\n03:40 Espresso\n\n#kahvemakinesi", bekle: ["bölüm"], yasak: [] },
];

let basarisiz = 0;
for (const v of VAKALAR) {
  const dosya = path.join(TMP, `${v.ad}.${v.uzanti}`);
  fs.writeFileSync(dosya, v.metin);
  const tr = v.transkript ? path.join(TMP, `${v.ad}.transkript.txt`) : null;
  if (tr) fs.writeFileSync(tr, v.transkript);
  const args = v.tur === "web" ? ["web", dosya, ...(v.ek ?? []), "--json"] : ["sosyal", v.platform, dosya, ...(v.baslik ? ["--baslik", v.baslik] : []), ...(tr ? ["--transkript", tr] : []), ...(v.ek ?? []), "--json"];
  const r = spawnSync(process.execPath, [path.join(KOK, "araclar", "kontrol.mjs"), ...args], { encoding: "utf8" });
  const bulgu = JSON.parse(r.stdout).bulgular.map((b) => b.kural);
  const eksik = v.bekle.filter((k) => !bulgu.includes(k));
  const yanlis = v.yasak.filter((k) => bulgu.includes(k));
  const tamam = !eksik.length && !yanlis.length;
  if (!tamam) basarisiz++;
  console.log(`${tamam ? "GEÇTİ " : "KALDI "} ${v.ad.padEnd(30)} bulgu: [${[...new Set(bulgu)].join(", ")}]${eksik.length ? `  yakalanmadı: ${eksik.join(", ")}` : ""}${yanlis.length ? `  YANLIŞ ALARM: ${yanlis.join(", ")}` : ""}`);
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n${VAKALAR.length - basarisiz}/${VAKALAR.length} vaka geçti`);
process.exit(basarisiz ? 1 : 0);

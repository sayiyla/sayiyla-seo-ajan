#!/usr/bin/env node
// Google Search Console dışa aktarımları (CSV) için çevrimdışı analiz. API anahtarı, hesap ya da ağ gerekmez.
// Search Console'da Performans > Sorgular (ya da Sayfalar) tablosunu "Dışa aktar > CSV" ile indir; Türkçe ve İngilizce başlıklar desteklenir.
//
//   node araclar/gsc.mjs anomali <csv> [--en-az-gosterim 20]          sahte/şüpheli tıklama sıçraması süzgeci
//   node araclar/gsc.mjs yakin <csv> [--en-az-gosterim 100]           "vurma mesafesi": konum 4-20, gösterimi yüksek satırlar
//   node araclar/gsc.mjs uzun-sorgu <csv> [--kelime 8] [--en-az-gosterim 10]   çok kelimeli sorgular (cevap bölümü fırsatı)
//   node araclar/gsc.mjs cozulme <onceki.csv> <simdiki.csv>            gösterim sabit, tıklama düşen sayfalar (yenileme listesi)
//
// Ortak: --json, --en-cok 25. Çıktı bir karar listesidir; bir şeyi kendiliğinden değiştirmez.
import fs from "node:fs";

const arg = process.argv.slice(2);
const [komut, ...dosyalar] = arg.filter((a, i) => !a.startsWith("--") && !(arg[i - 1] ?? "").startsWith("--"));
const sayisal = (ad, varsayilan) => { const i = arg.indexOf(ad); return i >= 0 ? Number(arg[i + 1]) : varsayilan; };
const json = arg.includes("--json");
const enCok = sayisal("--en-cok", 25);

function csvOku(dosya) {
  const ham = fs.readFileSync(dosya, "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
  const ayrac = (ham.split("\n")[0].match(/;/g) ?? []).length > (ham.split("\n")[0].match(/,/g) ?? []).length ? ";" : ",";
  const satirlar = ham.split("\n").map((s) => { const o = []; let c = "", q = false; for (const ch of s) { if (ch === '"') q = !q; else if (ch === ayrac && !q) { o.push(c); c = ""; } else c += ch; } o.push(c); return o; });
  const baslik = satirlar[0].map((b) => b.trim().toLowerCase());
  const bul = (...adlar) => baslik.findIndex((b) => adlar.some((a) => b === a));
  const k = { ad: bul("top queries", "queries", "query", "en çok yapılan sorgular", "sorgu", "sorgular", "top pages", "pages", "page", "en çok ziyaret edilen sayfalar", "sayfa", "sayfalar"), tik: bul("clicks", "tıklamalar"), gos: bul("impressions", "gösterimler"), to: bul("ctr", "to", "tıklama oranı"), konum: bul("position", "konum", "ortalama konum") };
  if (k.ad < 0 || k.gos < 0 || k.konum < 0) throw new Error(`${dosya}: sorgu/sayfa, gösterim ve konum sütunları bulunamadı (başlıklar: ${baslik.join(" | ")})`);
  const sayi = (s) => { const t = String(s ?? "").replace("%", "").trim(); if (!t) return 0; return Number(t.includes(",") && !t.includes(".") ? t.replace(",", ".") : t.replace(/,/g, "")); };
  return satirlar.slice(1).filter((s) => s[k.ad]).map((s) => {
    const tik = k.tik >= 0 ? sayi(s[k.tik]) : 0, gos = sayi(s[k.gos]);
    const to = k.to >= 0 ? sayi(s[k.to]) : (gos ? (tik / gos) * 100 : 0);
    return { ad: s[k.ad], tik, gos, to, konum: sayi(s[k.konum]) };
  });
}

function yaz(baslik, satirlar, sutun) {
  if (json) { console.log(JSON.stringify({ komut, sonuc: satirlar.slice(0, enCok) }, null, 2)); return; }
  console.log(`${baslik} (${satirlar.length} satır${satirlar.length > enCok ? `, ilk ${enCok}` : ""})\n`);
  if (!satirlar.length) console.log("Bulgu yok.");
  for (const s of satirlar.slice(0, enCok)) console.log("  " + sutun(s));
}

if (komut === "anomali") {
  const enAz = sayisal("--en-az-gosterim", 20);
  const l = csvOku(dosyalar[0]).filter((s) => s.konum > 10 && s.to >= 40 && s.gos >= enAz).sort((a, b) => b.gos - a.gos);
  yaz("Şüpheli satırlar: konum 10'dan kötü ama tıklama oranı %40 ve üstü. Tarayıcı/kazıyıcı verisi olabilir; trend raporuna girmeden önce ayır ve doğrula.", l, (s) => `konum ${s.konum.toFixed(1).padStart(5)}  TO %${s.to.toFixed(1).padStart(5)}  gösterim ${String(s.gos).padStart(5)}  ${s.ad}`);
} else if (komut === "yakin") {
  const enAz = sayisal("--en-az-gosterim", 100);
  const l = csvOku(dosyalar[0]).filter((s) => s.konum >= 4 && s.konum <= 20 && s.gos >= enAz).sort((a, b) => b.gos - a.gos);
  yaz("Vurma mesafesi: konum 4-20, gösterim yüksek. Bu satırların sayfası başlık, ilk paragraf cevabı ve iç bağlantıyla güçlendirilmeye en yakın adaylardır.", l, (s) => `konum ${s.konum.toFixed(1).padStart(5)}  gösterim ${String(s.gos).padStart(6)}  tık ${String(s.tik).padStart(4)}  TO %${s.to.toFixed(1).padStart(5)}  ${s.ad}`);
} else if (komut === "uzun-sorgu") {
  const kelime = sayisal("--kelime", 8), enAz = sayisal("--en-az-gosterim", 10);
  const l = csvOku(dosyalar[0]).filter((s) => s.ad.trim().split(/\s+/).length >= kelime && s.konum >= 4 && s.konum <= 20 && s.gos >= enAz).sort((a, b) => b.gos - a.gos);
  yaz(`${kelime}+ kelimelik sorgular (konum 4-20): okur tam bir soru soruyor; sayfaya o soruyu başlık yapıp ilk paragrafta cevaplamak işe yarayabilir. Türkçede ekler yüzünden kelime eşiğini düşürmeyi dene (--kelime 6).`, l, (s) => `konum ${s.konum.toFixed(1).padStart(5)}  gösterim ${String(s.gos).padStart(5)}  ${s.ad}`);
} else if (komut === "cozulme") {
  const once = new Map(csvOku(dosyalar[0]).map((s) => [s.ad, s])), simdi = csvOku(dosyalar[1]);
  const l = simdi.map((s) => { const o = once.get(s.ad); if (!o || o.tik < 5) return null; const gosFark = o.gos ? (s.gos - o.gos) / o.gos : 0, tikFark = (s.tik - o.tik) / o.tik; return { ...s, onceTik: o.tik, onceGos: o.gos, gosFark, tikFark }; })
    .filter((s) => s && Math.abs(s.gosFark) <= 0.2 && s.tikFark <= -0.3).sort((a, b) => a.tikFark - b.tikFark);
  yaz("Yenileme adayları: gösterim yaklaşık sabit (±%20) ama tıklama %30'dan fazla düşmüş. Başlık/açıklama cazibesi, AI özeti ya da rakip değişmiş olabilir. İçerik gerçekten değişmeden tarihi güncelleme.", l, (s) => `tık ${String(s.onceTik).padStart(4)} → ${String(s.tik).padStart(4)} (%${(s.tikFark * 100).toFixed(0)})  gösterim ${s.onceGos} → ${s.gos}  ${s.ad}`);
} else if (komut === "bosluk") {
  // Tek sayfanın sorgu dışa aktarımı (Search Console > Sayfalar > sayfaya tıkla > Sorgular > Dışa aktar) + sayfanın metni.
  // Gösterim aldığı halde sayfada geçmeyen sorgular ve 10-30 konumdaki sorgular: sayfayı yeniden yazmadan nereye ne ekleneceğinin listesi.
  const enAz = sayisal("--en-az-gosterim", 5);
  const katla = (m) => m.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c").replace(/ö/g, "o").replace(/ü/g, "u");
  const DOLGU = new Set(["nasil", "nedir", "neden", "nerede", "hangi", "icin", "ile", "gibi", "kac", "mi", "mu", "ne", "bir", "ve", "veya", "en", "the", "how", "what", "for", "and"]);
  const metin = katla(fs.readFileSync(dosyalar[1], "utf8"));
  // Kök: sondaki p/ç/t/k atılır (kitap→kitabı, renk→rengi), sonra ilk 5 harf; kontrol.mjs ile aynı yaklaşım.
  const kok = (w) => { let k = w; if (k.length >= 4 && /[pctk]$/.test(k)) k = k.slice(0, -1); return k.slice(0, Math.min(k.length, 5)); };
  const kapsar = (q) => katla(q).split(/\s+/).filter((w) => w.length > 2 && !DOLGU.has(w)).every((w) => metin.includes(kok(w)));
  const yer = (q) => /\b(nasıl|nedir|neden|kaç|hangi|ne zaman|nerede|mı|mi|mu|mü)\b|\?$/i.test(q) ? "SSS sorusu ya da soru biçimli H2" : q.split(/\s+/).length >= 4 ? "yeni paragraf ya da H2" : "mevcut bir cümleye doğal biçimde";
  const satirlar = csvOku(dosyalar[0]).filter((s) => s.gos >= enAz);
  const eksik = satirlar.filter((s) => !kapsar(s.ad)).sort((a, b) => b.gos - a.gos);
  const ikinciSayfa = satirlar.filter((s) => s.konum >= 10 && s.konum <= 30).sort((a, b) => b.gos - a.gos);
  if (json) console.log(JSON.stringify({ komut, sayfadaGecmeyen: eksik.slice(0, enCok).map((s) => ({ ...s, oneri: yer(s.ad) })), konum10_30: ikinciSayfa.slice(0, enCok) }, null, 2));
  else {
    yaz("Gösterim alıyor ama sayfada geçmiyor: yalnızca okura yararlıysa ekle; sayfayı baştan yazma, ilgili bölümü değiştir.", eksik, (s) => `gösterim ${String(s.gos).padStart(5)}  konum ${s.konum.toFixed(1).padStart(5)}  ${s.ad}  →  ${yer(s.ad)}`);
    console.log("");
    yaz("Konum 10-30 (2. ve 3. sayfa): Google sayfayı ilgili buluyor; eksik alt konuyu tamamla, iç bağlantı ver.", ikinciSayfa, (s) => `konum ${s.konum.toFixed(1).padStart(5)}  gösterim ${String(s.gos).padStart(5)}  ${s.ad}`);
  }
} else if (komut === "dusuk-to") {
  // Konum 3-10 olup tıklama oranı aynı konum bandındaki sitenin ortancasının yarısından düşük olanlar: başlık/açıklama testi adayları.
  const enAz = sayisal("--en-az-gosterim", 100);
  const l = csvOku(dosyalar[0]).filter((s) => s.gos >= enAz && s.konum >= 3 && s.konum <= 10);
  const bant = (k) => Math.floor(k);
  const ortanca = new Map();
  for (const b of new Set(l.map((s) => bant(s.konum)))) { const v = l.filter((s) => bant(s.konum) === b).map((s) => s.to).sort((x, y) => x - y); ortanca.set(b, v[Math.floor(v.length / 2)]); }
  const aday = l.filter((s) => s.to < ortanca.get(bant(s.konum)) / 2).sort((a, b) => b.gos - a.gos);
  yaz("Başlık testi adayları: konum 3-10, tıklama oranı aynı konum bandındaki ortancanın yarısından düşük. Her seferinde tek sayfanın başlığını değiştir, 2-4 hafta ölç, kontrol grubu tut. Yapay zekâ özeti olan sorgularda düşük TO normal olabilir.", aday, (s) => `konum ${s.konum.toFixed(1).padStart(5)}  TO %${s.to.toFixed(1).padStart(5)} (bant ortancası %${ortanca.get(bant(s.konum)).toFixed(1)})  gösterim ${String(s.gos).padStart(6)}  ${s.ad}`);
} else {
  console.error("Kullanım:\n  node araclar/gsc.mjs anomali|yakin|uzun-sorgu|dusuk-to <csv>\n  node araclar/gsc.mjs cozulme <onceki.csv> <simdiki.csv>\n  node araclar/gsc.mjs bosluk <sayfanin-sorgulari.csv> <sayfa.md|html>");
  process.exit(2);
}

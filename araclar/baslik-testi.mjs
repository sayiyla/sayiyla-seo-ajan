#!/usr/bin/env node
// Başlık testi defteri: başlığı değiştirilen sayfanın tıklama oranını önce/sonra ölçer, geçmiş testlerden hangi kanca türünün işe yaradığını çıkarır.
// API anahtarı, hesap ya da ağ gerekmez; girdi o sayfanın Search Console sorgu dışa aktarımıdır
// (Performans > Sayfalar > sayfaya tıkla > Sorgular > Dışa aktar > CSV). Aday sayfaları bulmak için: gsc.mjs dusuk-to.
//
//   node araclar/baslik-testi.mjs baslat <url> --eski "..." --yeni "..." --tur sayi|ulke|fark|uyari|sonuc|kanit|soru --once <csv> [--kontrol <url> --kontrol-once <csv>]
//   node araclar/baslik-testi.mjs olc <url> --sonra <csv> [--kontrol-sonra <csv>]
//   node araclar/baslik-testi.mjs durum                    süren testler ve ölçüm günü gelenler
//   node araclar/baslik-testi.mjs ders                     biten testlerden kanca türü ve başlık özelliği özeti
//
// Ortak: --defter baslik-testleri.jsonl (varsayılan, çalışma klasöründe), --tarih YYYY-AA-GG, --json.
// Eşikler: --gun 14 (en az test süresi), --en-az-gosterim 200 (eşleşen sorgularda, her iki dönem), --konum-farki 1.5.
// Ölçüm yalnız iki dönemde de görünen ve ortalama konumu az değişen sorgulardan yapılır: konum değiştiyse tıklama oranı farkı başlıktan gelmeyebilir.
// Kontrol sayfası (başlığı değişmeyen benzer sayfa) verilirse genel dalga (mevsim, yapay zekâ özeti, güncelleme) farktan ayrılır.
// Araç bir şeyi kendiliğinden değiştirmez ve tıklama yaptırmaz; yalnız ölçer.
import fs from "node:fs";
import { csvOku } from "./gsc-csv.mjs";

const arg = process.argv.slice(2);
const DEGERLI = new Set(["--eski", "--yeni", "--tur", "--once", "--sonra", "--kontrol", "--kontrol-once", "--kontrol-sonra", "--defter", "--tarih", "--gun", "--en-az-gosterim", "--konum-farki"]);
const [komut, url] = arg.filter((a, i) => !a.startsWith("--") && !DEGERLI.has(arg[i - 1]));
const deger = (ad, varsayilan) => { const i = arg.indexOf(ad); return i >= 0 ? arg[i + 1] : varsayilan; };
const json = arg.includes("--json");
const defter = deger("--defter", "baslik-testleri.jsonl");
const bugun = deger("--tarih", new Date().toISOString().slice(0, 10));
const minGun = Number(deger("--gun", 14)), minGos = Number(deger("--en-az-gosterim", 200)), konumFarki = Number(deger("--konum-farki", 1.5));
const TURLER = ["sayi", "ulke", "fark", "uyari", "sonuc", "kanit", "soru"];

const kayitlar = () => (fs.existsSync(defter) ? fs.readFileSync(defter, "utf8").split("\n").filter(Boolean).map((s) => JSON.parse(s)) : []);
const ekle = (k) => fs.appendFileSync(defter, JSON.stringify(k) + "\n");
const gunFarki = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const hata = (m) => { console.error(m); process.exit(2); };
const ozet = (satirlar) => satirlar.map(({ ad, tik, gos, konum }) => ({ ad, tik, gos, konum }));

// İki dönemde de görünen, konumu ±konumFarki içinde kalan sorgular; tıklama oranı gösterim ağırlıklı.
function eslestir(once, sonra) {
  const o = new Map(once.map((s) => [s.ad, s]));
  const es = sonra.filter((s) => o.has(s.ad) && Math.abs(s.konum - o.get(s.ad).konum) <= konumFarki).map((s) => ({ ad: s.ad, once: o.get(s.ad), sonra: s }));
  const top = (yan) => es.reduce((t, e) => ({ tik: t.tik + e[yan].tik, gos: t.gos + e[yan].gos }), { tik: 0, gos: 0 });
  const a = top("once"), b = top("sonra");
  return { sorgu: es.length, once: a, sonra: b, toOnce: a.gos ? a.tik / a.gos : 0, toSonra: b.gos ? b.tik / b.gos : 0, es };
}

// İki oran farkı için z (birleşik oran); gösterimler bağımsız sayılır, bu yüzden kaba bir göstergedir.
function z(a, b) {
  const p = (a.tik + b.tik) / (a.gos + b.gos), se = Math.sqrt(p * (1 - p) * (1 / a.gos + 1 / b.gos));
  return se ? (b.tik / b.gos - a.tik / a.gos) / se : 0;
}

const yuzde = (x) => `%${(x * 100).toFixed(2)}`;
const oran = (x) => `${x >= 1 ? "+" : ""}${((x - 1) * 100).toFixed(0)}%`;

if (komut === "baslat") {
  if (!url) hata("baslat: sayfa adresi gerekli");
  const eski = deger("--eski"), yeni = deger("--yeni"), tur = deger("--tur"), once = deger("--once");
  if (!eski || !yeni || !once) hata("baslat: --eski, --yeni ve --once <csv> gerekli");
  if (tur && !TURLER.includes(tur)) hata(`baslat: --tur şunlardan biri olmalı: ${TURLER.join(", ")} (kurallar/baslik-kancalari.md)`);
  const hepsi = kayitlar(), bitti = new Set(hepsi.filter((k) => k.olay === "sonuc" && k.son).map((k) => k.id));
  if (hepsi.some((k) => k.olay === "baslat" && k.url === url && !bitti.has(k.id))) hata(`baslat: ${url} için süren bir test var; önce "olc" ile bitir.`);
  const kayit = { olay: "baslat", id: `${bugun}-${hepsi.length}`, url, tarih: bugun, eski, yeni, tur: tur ?? null, once: ozet(csvOku(once)) };
  const kontrol = deger("--kontrol"), kontrolOnce = deger("--kontrol-once");
  if (kontrol && kontrolOnce) kayit.kontrol = { url: kontrol, once: ozet(csvOku(kontrolOnce)) };
  ekle(kayit);
  const gos = kayit.once.reduce((t, s) => t + s.gos, 0);
  console.log(`Test başladı: ${url}\n  "${eski}" → "${yeni}"${tur ? ` (${tur})` : ""}\n  Önce: ${kayit.once.length} sorgu, ${gos} gösterim${kayit.kontrol ? `; kontrol: ${kontrol}` : "; kontrol sayfası yok (genel dalga ayrılamaz)"}`);
  console.log(`  En erken ölçüm: ${new Date(Date.parse(bugun) + minGun * 864e5).toISOString().slice(0, 10)}. Bu sürede sayfanın başka bir yerini değiştirme; önce dönemiyle aynı uzunlukta bir dönemi dışa aktar.`);
  if (gos < minGos) console.log(`  Uyarı: önce dönemi ${minGos} gösterimden az; sonuç büyük olasılıkla "yetersiz veri" çıkar. Daha uzun bir dönem dışa aktar.`);
} else if (komut === "olc") {
  if (!url) hata("olc: sayfa adresi gerekli");
  const hepsi = kayitlar();
  const test = hepsi.filter((k) => k.olay === "baslat" && k.url === url).at(-1);
  if (!test) hata(`olc: ${url} için başlatılmış test yok`);
  const sonraCsv = deger("--sonra");
  if (!sonraCsv) hata("olc: --sonra <csv> gerekli");
  const sonra = csvOku(sonraCsv), gun = gunFarki(test.tarih, bugun);
  const m = eslestir(test.once, sonra);
  const fark = m.toOnce ? m.toSonra / m.toOnce : null;
  let kontrol = null;
  const ks = deger("--kontrol-sonra");
  if (test.kontrol && ks) {
    const k = eslestir(test.kontrol.once, csvOku(ks));
    kontrol = { url: test.kontrol.url, sorgu: k.sorgu, toOnce: k.toOnce, toSonra: k.toSonra, fark: k.toOnce ? k.toSonra / k.toOnce : null };
  }
  const duzeltilmis = fark && kontrol?.fark ? fark / kontrol.fark : fark;
  const zd = m.once.gos && m.sonra.gos ? z(m.once, m.sonra) : 0;
  let karar;
  if (gun < minGun) karar = "erken";
  else if (m.once.gos < minGos || m.sonra.gos < minGos) karar = "yetersiz veri";
  else if (Math.abs(zd) < 1.96) karar = "belirsiz";
  else if ((zd > 0) !== (duzeltilmis > 1)) karar = "belirsiz"; // fark kontrol sayfasında da var: başlıktan değil genel dalgadan
  else karar = zd > 0 ? "kazandı" : "kaybetti";
  // Birinci sayfada gösterim alıp hiç tıklanmayan sorgular: yeni başlık bu aramaların sorusunu hâlâ karşılamıyor olabilir.
  const gecilen = sonra.filter((s) => s.konum <= 10 && s.gos >= 30 && s.tik === 0).sort((a, b) => b.gos - a.gos).slice(0, 10);
  const son = !["erken", "yetersiz veri"].includes(karar);
  const sonuc = { olay: "sonuc", id: test.id, url, tarih: bugun, gun, karar, son, sorgu: m.sorgu, once: m.once, sonra: m.sonra, toOnce: m.toOnce, toSonra: m.toSonra, fark, z: Number(zd.toFixed(2)), kontrol, duzeltilmis, gecilen: gecilen.map((s) => s.ad) };
  ekle(sonuc);
  if (json) { console.log(JSON.stringify(sonuc, null, 2)); process.exit(0); }
  console.log(`Başlık testi: ${url} (${gun}. gün)\n  "${test.eski}" → "${test.yeni}"${test.tur ? ` (${test.tur})` : ""}`);
  console.log(`  Eşleşen sorgu: ${m.sorgu} (konum farkı ≤ ${konumFarki})`);
  console.log(`  Tıklama oranı: ${yuzde(m.toOnce)} → ${yuzde(m.toSonra)}${fark ? ` (${oran(fark)})` : ""}  gösterim ${m.once.gos} → ${m.sonra.gos}, tıklama ${m.once.tik} → ${m.sonra.tik}, z ${zd.toFixed(2)}`);
  if (kontrol) console.log(`  Kontrol ${kontrol.url}: ${yuzde(kontrol.toOnce)} → ${yuzde(kontrol.toSonra)}${kontrol.fark ? ` (${oran(kontrol.fark)})` : ""}; düzeltilmiş fark ${duzeltilmis ? oran(duzeltilmis) : "?"}`);
  console.log(`  Karar: ${karar.toUpperCase()}${karar === "kaybetti" ? ' — eski başlığa dön ya da "geçilen sorgular"dan yeni aday yaz' : karar === "erken" ? ` — ${minGun - gun} gün daha bekle` : ""}`);
  if (gecilen.length) { console.log("  Birinci sayfada gösterilip hiç tıklanmayan sorgular (sonraki adayın hedefi):"); for (const s of gecilen) console.log(`    konum ${s.konum.toFixed(1).padStart(5)}  gösterim ${String(s.gos).padStart(5)}  ${s.ad}`); }
} else if (komut === "durum") {
  const hepsi = kayitlar(), bitti = new Set(hepsi.filter((k) => k.olay === "sonuc" && k.son).map((k) => k.id));
  const suren = hepsi.filter((k) => k.olay === "baslat" && !bitti.has(k.id)).map((k) => ({ url: k.url, tarih: k.tarih, gun: gunFarki(k.tarih, bugun), yeni: k.yeni, olcumZamani: gunFarki(k.tarih, bugun) >= minGun }));
  if (json) { console.log(JSON.stringify({ suren }, null, 2)); process.exit(0); }
  console.log(`Süren test: ${suren.length}${suren.length ? "" : " (defter: " + defter + ")"}`);
  for (const s of suren) console.log(`  ${s.olcumZamani ? "ÖLÇ " : "bekle"}  ${String(s.gun).padStart(3)}. gün  ${s.url}  "${s.yeni}"`);
} else if (komut === "ders") {
  const hepsi = kayitlar(), bas = new Map(hepsi.filter((k) => k.olay === "baslat").map((k) => [k.id, k]));
  const sonlar = new Map();
  for (const k of hepsi) if (k.olay === "sonuc" && k.son) sonlar.set(k.id, k);
  const testler = [...sonlar.values()].map((s) => ({ ...s, b: bas.get(s.id) })).filter((s) => s.b);
  const ozellik = {
    tur: (t) => t.b.tur ?? "belirtilmedi",
    "sayı var": (t) => (/\d/.test(t.b.yeni) ? "evet" : "hayır"),
    "soru biçimi": (t) => (/\?/.test(t.b.yeni) ? "evet" : "hayır"),
    "uzunluk": (t) => (t.b.yeni.length > t.b.eski.length + 5 ? "uzadı" : t.b.yeni.length < t.b.eski.length - 5 ? "kısaldı" : "aynı"),
  };
  const tablo = {};
  for (const [ad, f] of Object.entries(ozellik)) {
    const g = {};
    for (const t of testler) { const d = f(t); (g[d] ??= []).push(t); }
    tablo[ad] = Object.entries(g).map(([d, l]) => {
      const farklar = l.map((t) => t.duzeltilmis ?? t.fark).filter((x) => x != null).sort((a, b) => a - b);
      return { deger: d, test: l.length, kazandi: l.filter((t) => t.karar === "kazandı").length, kaybetti: l.filter((t) => t.karar === "kaybetti").length, ortancaFark: farklar.length ? farklar[Math.floor(farklar.length / 2)] : null };
    });
  }
  if (json) { console.log(JSON.stringify({ test: testler.length, tablo }, null, 2)); process.exit(0); }
  console.log(`Biten test: ${testler.length}. Her satır bir hipotezdir; 5 testten az olan grupta sonuç kural sayılmaz, yalnız kendi sitende geçerlidir.\n`);
  for (const [ad, satirlar] of Object.entries(tablo)) {
    console.log(ad);
    for (const s of satirlar.sort((a, b) => (b.ortancaFark ?? 0) - (a.ortancaFark ?? 0))) console.log(`  ${s.deger.padEnd(12)} test ${String(s.test).padStart(2)}  kazandı ${s.kazandi}  kaybetti ${s.kaybetti}  ortanca fark ${s.ortancaFark ? oran(s.ortancaFark) : "?"}${s.test < 5 ? "  (az veri)" : ""}`);
  }
} else {
  console.error("Kullanım:\n  node araclar/baslik-testi.mjs baslat <url> --eski \"...\" --yeni \"...\" --tur <tür> --once <csv> [--kontrol <url> --kontrol-once <csv>]\n  node araclar/baslik-testi.mjs olc <url> --sonra <csv> [--kontrol-sonra <csv>]\n  node araclar/baslik-testi.mjs durum | ders");
  process.exit(2);
}

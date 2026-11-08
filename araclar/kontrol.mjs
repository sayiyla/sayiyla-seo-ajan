#!/usr/bin/env node
// Bağımlılıksız SEO / AEO / GEO metin denetleyici.
// Web sayfası (Markdown ya da HTML) ve sosyal medya açıklaması (düz metin) için kural kontrolü yapar; düzeltmeyi ajan yapar.
//
//   node araclar/kontrol.mjs web  <dosya.md|dosya.html> [--anahtar "ana arama ifadesi"] [--tip rehber|haber|kurumsal|arac]
//        [--koru-gsc sayfa-sorgulari.csv --onceki eski-surum.md] [--alt-sorgular "a; b; c"] [--esik 80] [--json]
//   node araclar/kontrol.mjs sosyal <instagram|tiktok|youtube> <dosya.txt> [--baslik "YouTube başlığı"] [--anahtar "ifade"] [--transkript video.txt] [--kanal api|uygulama] [--esik 80] [--json]
//
// Çıkış kodu: 0 = hata yok (uyarı olabilir), 1 = en az bir hata, 2 = kullanım hatası.
// Eşikler "pratik öneridir"; platformlar sınırlarını değiştirebilir. Değiştirmek için seo.config.json (aşağıdaki ESIK anahtarları).
import fs from "node:fs";
import path from "node:path";

const ESIK = {
  baslikEn: 15, baslikUst: 60, baslikPikselUst: 580,
  aciklamaAlt: 120, aciklamaUst: 160,
  h2Alt: 3, h2Ust: 10,
  sssAlt: 3, sssUst: 8,
  ilkParagrafKelimeUst: 60,
  atesmanAlt: 50, // Ateşman okunabilirlik: 50 altı "zor" (Türkçe)
  cumleKelimeOrtAlt: 8, cumleKelimeOrtUst: 22, uzunCumleKelime: 30,
  sosyal: {
    instagram: { karakterUst: 2200, etiketUst: 5 },
    tiktok: { karakterUst: 2200, etiketUst: 5 },
    youtube: { karakterUst: 4900, etiketUst: 3, baslikUst: 100 },
  },
  ilkSatirUst: 125, // Instagram ve TikTok'ta "devamını gör" öncesi görünen kısım için güvenli üst sınır
};
try {
  const c = JSON.parse(fs.readFileSync(path.join(process.cwd(), "seo.config.json"), "utf8"));
  for (const [k, v] of Object.entries(c)) ESIK[k] = typeof v === "object" && !Array.isArray(v) ? { ...ESIK[k], ...v } : v;
} catch { /* yapılandırma isteğe bağlı */ }

// Abartı ve boş vaat sözcükleri (başlık, açıklama ve sosyal metinde aranır).
const YASAKLI = ["şok", "inanılmaz", "kimse bilmiyor", "herkes bunu", "mutlaka izle", "sır", "sırlar", "sırrı", "bomba", "efsane", "çılgın", "yok artık", "bunu yapma", "dikkat!"];

const bul = [];
const METRIK = {};
const ekle = (seviye, kural, mesaj) => bul.push({ seviye, kural, mesaj });
const kelimeSay = (m) => (m.trim().match(/\S+/g) ?? []).length;
const sade = (m) => m.replace(/\r\n/g, "\n");
const cumleler = (m) => m.replace(/`[^`]*`/g, " ").split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter((s) => kelimeSay(s) > 0);

// Türkçe: ı/i, ş/s, ğ/g, ç/c, ö/o, ü/u farkını yok sayan sade biçim (kullanıcı arama kutusuna her iki biçimi de yazar).
const katla = (m) => m.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c").replace(/ö/g, "o").replace(/ü/g, "u").replace(/â/g, "a").replace(/î/g, "i").replace(/û/g, "u");
// Türkçe kök yaklaşımı: ilk 5 harf, ama önce sondaki ünsüz yumuşamasına (kitap→kitabı, renk→rengi, amaç→amacı, fiyat→fiyatı) karşı
// sondaki p/ç/t/k atılır. Ünlü düşmesi (ağız→ağzı, burun→burnu) yakalanmaz. Bağımlılıksız bir yaklaşımdır, tam morfoloji değildir.
const kok = (w) => { let k = katla(w); if (k.length >= 4 && /[pctk]$/.test(k)) k = k.slice(0, -1); return k.slice(0, Math.min(k.length, 5)); };
// Başlığın arama sonucundaki yaklaşık genişliği (Arial 20 px varsayımı; harf genişlikleri em cinsinden kaba tablo). Tahmindir.
function pikselGenislik(m) {
  let em = 0;
  for (const c of m) {
    if (" ".includes(c)) em += 0.28; else if ("iljıİtf.,;:'!|()[]".includes(c)) em += 0.3; else if ("r".includes(c)) em += 0.34;
    else if ("mwMW".includes(c)) em += 0.85; else if (/[A-ZÇĞÖŞÜ]/.test(c)) em += 0.68; else if (/[0-9]/.test(c)) em += 0.56; else em += 0.53;
  }
  return Math.round(em * 20);
}
// Arama ifadesi eşleşmesinde anlam taşımayan sözcükler.
const DOLGU = new Set(["nasil", "nedir", "neden", "nerede", "hangi", "icin", "ile", "gibi", "kac", "mi", "mu", "ne", "bir", "ve", "veya", "en", "the", "how", "what", "for", "and"]);
// Heceler Türkçede sesli harf sayısına eşittir.
const hece = (m) => (m.match(/[aeıioöuüâîû]/gi) ?? []).length;
// Yazıyla sayıları rakama çevirir ("üç" → 3, "kırk beş" → 45, "yüzde kırk" → %40). Altyazılar küçük sayıları çoğu zaman yazıyla verir.
function sayiNorm(metin) {
  let m = metin.toLocaleLowerCase("tr");
  const S = (a) => `(?<![\\p{L}])${a}(?![\\p{L}])`;
  const BIR = { "sıfır": 0, "bir": 1, "iki": 2, "üç": 3, "dört": 4, "beş": 5, "altı": 6, "yedi": 7, "sekiz": 8, "dokuz": 9 };
  const ON = { "on": 10, "yirmi": 20, "otuz": 30, "kırk": 40, "elli": 50, "altmış": 60, "yetmiş": 70, "seksen": 80, "doksan": 90 };
  for (const [o, ov] of Object.entries(ON)) for (const [b, bv] of Object.entries(BIR)) if (bv) m = m.replace(new RegExp(S(`${o}\\s+${b}`), "gu"), String(ov + bv));
  for (const [o, ov] of Object.entries(ON)) m = m.replace(new RegExp(S(o), "gu"), String(ov));
  for (const [b, bv] of Object.entries(BIR)) m = m.replace(new RegExp(S(b), "gu"), String(bv));
  m = m.replace(new RegExp(S("yüz"), "gu"), "100").replace(new RegExp(S("bin"), "gu"), "1000");
  return m.replace(/yüzde\s+(\d+)/gu, "%$1");
}
// Search Console CSV (sorgu/sayfa, tıklama, gösterim, konum); Türkçe ve İngilizce başlıklar.
function gscOku(dosya) {
  const ham = fs.readFileSync(dosya, "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim().split("\n");
  const ayr = (ham[0].match(/;/g) ?? []).length > (ham[0].match(/,/g) ?? []).length ? ";" : ",";
  const bol = (s) => { const o = []; let c = "", q = false; for (const ch of s) { if (ch === '"') q = !q; else if (ch === ayr && !q) { o.push(c); c = ""; } else c += ch; } o.push(c); return o; };
  const bas = bol(ham[0]).map((b) => b.trim().toLowerCase());
  const i = (...a) => bas.findIndex((b) => a.includes(b));
  const ad = i("top queries", "queries", "query", "en çok yapılan sorgular", "sorgu", "sorgular"), tik = i("clicks", "tıklamalar"), gos = i("impressions", "gösterimler");
  const sayi = (x) => Number(String(x ?? "").replace("%", "").replace(",", ".")) || 0;
  return ham.slice(1).map(bol).filter((s) => s[ad]).map((s) => ({ ad: s[ad], tik: sayi(s[tik]), gos: sayi(s[gos]) }));
}
// Ateşman okunabilirlik: 198,825 - 40,175 x (hece/kelime) - 2,610 x (kelime/cümle). Yüksek = kolay (70+ kolay, 50-70 orta, 50 altı zor).
function atesman(paragraflar) {
  const metin = paragraflar.join(" ").replace(/`[^`]*`/g, " ");
  const c = cumleler(metin), k = (metin.match(/[\p{L}]+/gu) ?? []);
  if (!c.length || k.length < 30) return null;
  let toplamHece = 0;
  for (const cm of c) (cm.match(/[\p{L}]+/gu) ?? []).forEach((w, i) => { const h = Math.max(1, hece(w)); toplamHece += i > 0 && /^[A-Z][a-z]+$/.test(w) ? Math.min(2, h) : h; });
  return +(198.825 - 40.175 * (toplamHece / k.length) - 2.61 * (k.length / c.length)).toFixed(1);
}
// Anahtar ifade eşleşmesi: her sözcüğün ilk 5 harfiyle (ek farkını tolere eder), sıra gözetmeden.
function anahtarVar(metin, ifade) {
  const m = katla(metin), parcalar = katla(ifade).split(/\s+/).filter((w) => w.length > 2);
  return parcalar.length > 0 && parcalar.every((w) => m.includes(kok(w)));
}

function yasakliTara(alan, metin) {
  const k = metin.toLocaleLowerCase("tr");
  for (const y of YASAKLI) if (new RegExp(`(?<![\\p{L}])${y}(?![\\p{L}])`, "u").test(k)) ekle("uyarı", "abartı", `${alan}: "${y}" abartı ya da boş vaat gibi okunuyor; yazıdaki somut bir ayrıntıyla değiştir.`);
  if (/[!]{1,}/.test(metin)) ekle("uyarı", "ünlem", `${alan}: ünlem işareti var.`);
  if (/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(metin) && alan === "başlık") ekle("uyarı", "emoji", "başlık: emoji arama başlığında güven vermez.");
}

// ---------- WEB ----------
function webOku(dosya) {
  const ham = sade(fs.readFileSync(dosya, "utf8"));
  const html = /\.html?$/i.test(dosya);
  if (html) {
    const al = (re) => ham.match(re)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "";
    return {
      baslik: al(/<title[^>]*>([\s\S]*?)<\/title>/i),
      aciklama: ham.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? "",
      h1: [...ham.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim()),
      h2: [...ham.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim()),
      govde: ham.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " "),
      paragraflar: [...ham.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean),
      jsonld: [...ham.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]),
      html, ham,
    };
  }
  const on = ham.match(/^---\n([\s\S]*?)\n---\n?/);
  const govde = on ? ham.slice(on[0].length) : ham;
  const alan = (...adlar) => { for (const a of adlar) { const m = on?.[1].match(new RegExp(`^${a}:\\s*(.+)$`, "m")); if (m) return m[1].trim().replace(/^["']|["']$/g, ""); } return ""; };
  const satirlar = govde.split("\n");
  return {
    baslik: alan("seo_baslik", "title", "baslik"),
    aciklama: alan("ozet", "description", "aciklama"),
    h1: satirlar.filter((s) => /^# /.test(s)).map((s) => s.slice(2).trim()),
    h2: satirlar.filter((s) => /^## /.test(s)).map((s) => s.slice(3).trim()),
    govde,
    paragraflar: govde.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p && !/^(#|\||[-*>]|\d+\.|!\[|<)/.test(p)),
    sss: on ? [...on[1].matchAll(/^\s*-?\s*soru:/gm)].length : 0,
    onBilgi: on?.[1] ?? "", html, ham,
  };
}

function webKontrol(dosya, anahtar = "") {
  const s = webOku(dosya);
  const bas = bul.length;
  // Sayfa türü: --tip > ön bilgi "tip:" > kicker (Haber/Gündem) > JSON-LD @type > rehber. Haber, kurumsal ve araç sayfalarına SSS ya da Kısaca zorlanmaz.
  const onTip = /^\s*tip\s*:\s*["']?([a-zçğıöşü]+)/im.exec(s.onBilgi ?? "")?.[1];
  const kicker = /^\s*kicker\s*:\s*(.+)$/im.exec(s.onBilgi ?? "")?.[1] ?? "";
  const tip = tipArg || onTip || (/(haber|gündem)/i.test(kicker) ? "haber" : "") || (/"@type"\s*:\s*"NewsArticle"/.test(s.ham) ? "haber" : /"@type"\s*:\s*"(AboutPage|ContactPage)"/.test(s.ham) ? "kurumsal" : "rehber");
  const KAPALI = { haber: ["sss", "kısaca", "soru-başlık"], kurumsal: ["sss", "kısaca", "soru-başlık", "olgu-kaynak", "kaynak"], arac: ["sss", "olgu-kaynak", "soru-başlık"] }[tip] ?? [];
  const h2Alt = ["haber", "kurumsal", "arac"].includes(tip) ? 1 : ESIK.h2Alt;
  METRIK.tip = tip;
  // Başlık
  if (!s.baslik) ekle("hata", "başlık-yok", "Başlık (title) yok.");
  else {
    const n = [...s.baslik].length;
    if (n < ESIK.baslikEn) ekle("hata", "başlık", `Başlık çok kısa (${n} karakter, en az ${ESIK.baslikEn}).`);
    if (n > ESIK.baslikUst) ekle("hata", "başlık", `Başlık uzun (${n} karakter, en çok ${ESIK.baslikUst}); arama sonucunda kesilir.`);
    yasakliTara("başlık", s.baslik);
    const px = pikselGenislik(s.baslik);
    METRIK.baslikPiksel = px;
    if (px > ESIK.baslikPikselUst) ekle("bilgi", "başlık", `Başlık tahmini ${px} px; masaüstü arama sonucunda yaklaşık ${ESIK.baslikPikselUst} px'ten sonrası kesilebilir (karakter sayısı Türkçe harflerde yanıltır).`);
  }
  // Açıklama
  if (!s.aciklama) ekle("hata", "açıklama", "Meta açıklama (description) yok.");
  else {
    const n = [...s.aciklama].length;
    if (n < ESIK.aciklamaAlt) ekle("uyarı", "açıklama", `Açıklama kısa (${n} karakter, hedef ${ESIK.aciklamaAlt}-${ESIK.aciklamaUst}).`);
    if (n > ESIK.aciklamaUst) ekle("hata", "açıklama", `Açıklama uzun (${n} karakter, en çok ${ESIK.aciklamaUst}).`);
    if (!/[.!?…)"”]$/.test(s.aciklama.trim())) ekle("uyarı", "açıklama", "Açıklama cümle ortasında bitiyor gibi; kelime ortasında kesilmemeli.");
    yasakliTara("açıklama", s.aciklama);
  }
  // Başlık yapısı. Markdown'da başlık ön bilgidedir; gövdede H1 olmayabilir.
  if (s.html && s.h1.length !== 1) ekle("hata", "h1", `Sayfada ${s.h1.length} adet H1 var; tam 1 olmalı.`);
  if (!s.html && s.h1.length > 1) ekle("hata", "h1", `Gövdede ${s.h1.length} adet H1 var; en çok 1 olmalı (başlık ön bilgide ise 0).`);
  if (s.h2.length < h2Alt) ekle("uyarı", "h2", `Yalnızca ${s.h2.length} ara başlık var; okuru ve yapay zekâ özetini yönlendirmek için en az ${h2Alt}.`);
  if (s.h2.length > ESIK.h2Ust) ekle("hata", "h2", `${s.h2.length} ara başlık var (en çok ${ESIK.h2Ust}); konu dağınık görünüyor, bölümleri birleştir.`);
  const soruH2 = s.h2.filter((h) => /\?$|nedir|nasıl|neden|kaç|hangi|mı\b|mi\b|mu\b|mü\b/i.test(h)).length;
  if (s.h2.length >= 4 && soruH2 / s.h2.length < 0.25) ekle("bilgi", "soru-başlık", "Ara başlıkların çok azı okurun soracağı soru biçiminde; en az birkaçını soruya çevirmek AEO için işe yarar.");
  // Cevap önce
  const ilk = s.paragraflar[0] ?? "";
  if (!ilk) ekle("hata", "ilk-paragraf", "Gövdede paragraf bulunamadı.");
  else if (kelimeSay(ilk) > ESIK.ilkParagrafKelimeUst) ekle("uyarı", "cevap-önce", `İlk paragraf ${kelimeSay(ilk)} kelime; cevap ya da özet ilk ${ESIK.ilkParagrafKelimeUst} kelimede verilmeli.`);
  // Cümle ritmi
  const tum = cumleler(s.paragraflar.join(" "));
  if (tum.length >= 10) {
    const ort = tum.reduce((t, c) => t + kelimeSay(c), 0) / tum.length;
    if (ort > ESIK.cumleKelimeOrtUst) ekle("uyarı", "cümle", `Ortalama cümle ${ort.toFixed(1)} kelime (hedef ${ESIK.cumleKelimeOrtAlt}-${ESIK.cumleKelimeOrtUst}); cümleleri böl.`);
    if (ort < ESIK.cumleKelimeOrtAlt) ekle("uyarı", "cümle", `Ortalama cümle ${ort.toFixed(1)} kelime; metin kesik okunuyor, ilişkili cümleleri birleştir.`);
    const uzun = tum.filter((c) => kelimeSay(c) >= ESIK.uzunCumleKelime);
    if (uzun.length) ekle("uyarı", "cümle", `${uzun.length} cümle ${ESIK.uzunCumleKelime}+ kelime. İlki: "${uzun[0].slice(0, 80)}…"`);
  }
  // SSS ve özet (Markdown ön bilgisinde ya da gövdede)
  if (!s.html) {
    const sss = s.sss || (s.h2.some((h) => /sık sorulan|sss|faq/i.test(h)) ? 3 : 0);
    if (sss < ESIK.sssAlt) ekle("uyarı", "sss", `Gerçek okur sorusu içeren SSS yok ya da ${ESIK.sssAlt} sorudan az (${sss}).`);
    if (sss > ESIK.sssUst) ekle("uyarı", "sss", `${sss} SSS sorusu var (en çok ${ESIK.sssUst}); alibi SSS izlenimi verir.`);
    if (!/^\s*(kisaca|ozet_maddeler|tldr)\s*:/m.test(s.onBilgi) && !s.h2.some((h) => /kısaca|özet|tl;?dr/i.test(h))) ekle("bilgi", "kısaca", "Sayfa başında 3-5 maddelik 'Kısaca' bloğu yok; yapay zekâ özetleri ve hızlı okurlar için işe yarar.");
  } else {
    if (!s.jsonld.length) ekle("uyarı", "json-ld", "JSON-LD yapılandırılmış veri yok (Article, FAQPage vb.).");
    for (const j of s.jsonld) { try { JSON.parse(j); } catch { ekle("hata", "json-ld", "JSON-LD bloğu ayrıştırılamıyor."); } }
    if (!/<link[^>]+rel=["']canonical["']/i.test(s.ham)) ekle("hata", "kanonik", "Kanonik adres (rel=canonical) yok.");
    const img = [...s.ham.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
    const altsiz = img.filter((t) => !/\balt=/.test(t)).length;
    if (altsiz) ekle("uyarı", "görsel", `${altsiz} görselde alt metin yok.`);
  }
  // Kaynak ve tarih (olgu yazıları için)
  if (!s.html && !/kaynak/i.test(s.onBilgi) && !/\bkaynak/i.test(s.h2.join(" "))) ekle("bilgi", "kaynak", "Kaynak listesi yok; olgu içeren sayfada kaynaklar görünür olmalı.");
  // Türkçe ton izi: tekdüze ve mekanik yazıya işaret eden kalıplar (uyarı; "yapay zekâ dedektörü" değil, üslup denetimi).
  if (tum.length >= 10) {
    const mektedir = tum.filter((c) => /(mektedir|maktadır|mektedirler|maktadırlar)[.!?…]?$/i.test(c.trim())).length / tum.length;
    if (mektedir > 0.15) ekle("uyarı", "ton", `Cümlelerin %${Math.round(mektedir * 100)}'i "-mektedir/-maktadır" ile bitiyor; resmî ve tekdüze okunuyor, yalın fiil kullan.`);
    const baslar = tum.map((c) => katla(c.split(/\s+/)[0]));
    let seri = 1, enUzun = 1; for (let i = 1; i < baslar.length; i++) { seri = baslar[i] === baslar[i - 1] ? seri + 1 : 1; enUzun = Math.max(enUzun, seri); }
    if (enUzun >= 3) ekle("uyarı", "ton", `Art arda ${enUzun} cümle aynı sözcükle başlıyor; cümle başlarını çeşitlendir.`);
    const klise = ["önemli bir rol oynamaktadır", "dikkat çekmektedir", "bu bağlamda", "göz ardı edilmemelidir", "hayatımızın vazgeçilmezi", "teknolojinin hızla gelişmesiyle", "çağımızda"].filter((k) => s.govde.toLocaleLowerCase("tr").includes(k));
    if (klise.length >= 2) ekle("uyarı", "ton", `Klişe kalıplar: ${klise.map((x) => `"${x}"`).join(", ")}; somut bilgiyle değiştir.`);
  }
  // Kaynaksız olgu paragrafları: sayı içeren ama [n] atfı ya da bağlantısı olmayan paragraflar.
  if (!s.html) {
    const olguluP = s.paragraflar.filter((p) => (p.match(/\b\d+(?:[.,]\d+)?\s?(?:%|dolar|TL|\$|€|GB|MB|ms|sn|dakika|saat|gün|kat)/gi) ?? []).length >= 1);
    const kaynaksiz = olguluP.filter((p) => !/\[\d+\]|\]\(http|https?:\/\//.test(p));
    if (olguluP.length >= 3 && kaynaksiz.length / olguluP.length > 0.5) ekle("uyarı", "olgu-kaynak", `Sayı içeren ${olguluP.length} paragrafın ${kaynaksiz.length}'inde kaynak atfı ([n]) ya da bağlantı yok; her sayı için birincil kaynak yaz.`);
  }
  // Okunabilirlik (Türkçe, Ateşman)
  const ates = atesman(s.paragraflar);
  METRIK.atesman = ates; METRIK.atesmanBandi = ates === null ? null : ates >= 90 ? "çok kolay" : ates >= 70 ? "kolay" : ates >= 50 ? "orta" : ates >= 30 ? "zor" : "çok zor"; METRIK.ilkParagrafKelime = kelimeSay(ilk); METRIK.h2 = s.h2.length; METRIK.govdeKelime = kelimeSay(s.govde);
  METRIK.ortalamaCumle = tum.length ? +(tum.reduce((t, c) => t + kelimeSay(c), 0) / tum.length).toFixed(1) : null;
  if (ates !== null && ates < ESIK.atesmanAlt) ekle("uyarı", "okunabilirlik", `Ateşman okunabilirlik ${ates} (50 altı zor); kısa cümle ve yaygın sözcük kullan.`);
  // Ana arama ifadesi (verilmişse)
  if (anahtar) {
    METRIK.anahtar = anahtar;
    if (!anahtarVar(s.baslik, anahtar)) ekle("hata", "anahtar", `Ana arama ifadesi başlıkta yok: "${anahtar}".`);
    else if (katla(s.baslik).indexOf(kok(anahtar.split(/\s+/)[0])) > 30) ekle("uyarı", "anahtar", "Ana ifade başlığın ilk ~30 karakterinde başlamıyor; başa al.");
    if (!anahtarVar(s.aciklama, anahtar)) ekle("uyarı", "anahtar", "Ana ifade meta açıklamada yok.");
    if (!anahtarVar(ilk, anahtar)) ekle("uyarı", "anahtar", "Ana ifade ilk paragrafta yok; cevap ve ifade birlikte başta durmalı.");
    if (!s.h2.some((h) => anahtarVar(h, anahtar)) && !(s.h1 ?? []).some((h) => anahtarVar(h, anahtar))) ekle("bilgi", "anahtar", "Ana ifade hiçbir H1/H2'de geçmiyor; en az bir ara başlıkta doğal biçimde geçsin.");
    const sayi = (katla(s.govde).match(new RegExp(kok(anahtar.split(/\s+/)[0]), "g")) ?? []).length;
    if (kelimeSay(s.govde) >= 150 && sayi / kelimeSay(s.govde) > 0.04) ekle("uyarı", "anahtar", "Ana ifade çok sık tekrar ediliyor (anahtar kelime yığma izlenimi).");
  }
  // Boş şablon cümleleri
  const sablon = ["bu yazıda", "günümüzde", "hepimizin bildiği gibi", "sonuç olarak"].filter((k) => s.govde.toLocaleLowerCase("tr").includes(k));
  if (sablon.length >= 2) ekle("bilgi", "şablon", `Şablon kalıplar: ${sablon.map((x) => `"${x}"`).join(", ")}; yararlı bilgiyle değiştir.`);
  // Trafik getiren sorguları koruma (--koru-gsc sayfa-sorgulari.csv [--onceki eski-surum.md]): düzeltme, sayfanın zaten sıralandığı sorguları silmemeli.
  if (koruGsc) {
    const sorgular = gscOku(koruGsc).sort((a, b) => b.tik - a.tik || b.gos - a.gos).slice(0, 15);
    const kapsar = (metin, q) => { const p = katla(q).split(/\s+/).filter((w) => w.length > 2 && !DOLGU.has(w)); return p.length > 0 && p.every((w) => metin.includes(kok(w))); };
    const simdi = katla([s.baslik, s.aciklama, s.govde].join(" "));
    if (oncekiArg) {
      const o = webOku(oncekiArg), onceki = katla([o.baslik, o.aciklama, o.govde].join(" "));
      for (const q of sorgular.filter((x) => kapsar(onceki, x.ad) && !kapsar(simdi, x.ad))) ekle("hata", "anahtar-kaybi", `"${q.ad}" (tık ${q.tik}, gösterim ${q.gos}) önceki sürümde geçiyordu, yenisinde yok; trafik getiren sorguyu silme.`);
    }
    METRIK.korunanSorgu = `${sorgular.filter((q) => kapsar(simdi, q.ad)).length}/${sorgular.length}`;
  }
  // Alt sorgu (fan-out) kapsamı: --alt-sorgular "a; b; c". Yapay zekâ aramaları soruyu alt sorulara böler; her alt soru sayfada bir ara başlıkta,
  // ilk paragrafta, Kısaca'da ya da SSS'de karşılanmalı. Her alt soru için ayrı sayfa açılmaz; bu sayfa güçlendirilir.
  if (altSorgular) {
    const liste = altSorgular.split(/[;\n]/).map((x) => x.trim()).filter(Boolean);
    const alan = katla([s.h2.join(" "), ilk, s.onBilgi ?? ""].join(" "));
    const kapsar = (q) => { const p = katla(q).split(/\s+/).filter((w) => w.length > 2 && !DOLGU.has(w)); return p.length > 0 && p.every((w) => alan.includes(kok(w))); };
    const eksik = liste.filter((q) => !kapsar(q));
    METRIK.altSorguKapsami = `${liste.length - eksik.length}/${liste.length}`;
    if (eksik.length) ekle("bilgi", "alt-sorgu", `Ara başlıklarda, ilk paragrafta, Kısaca ya da SSS'de karşılanmayan alt sorular: ${eksik.slice(0, 8).join(" | ")}${eksik.length > 8 ? " ..." : ""}. Okura yararlıysa bu sayfada bir bölüm ya da SSS olarak ekle; ayrı sayfa açma.`);
  }
  for (let i = bul.length - 1; i >= bas; i--) if (KAPALI.includes(bul[i].kural)) bul.splice(i, 1);
}

// ---------- SOSYAL ----------
function sosyalKontrol(platform, dosya, baslik, anahtar = "", transkript = "") {
  const lim = ESIK.sosyal[platform];
  if (!lim) { console.error(`Bilinmeyen platform: ${platform} (instagram, tiktok, youtube)`); process.exit(2); }
  const metin = sade(fs.readFileSync(dosya, "utf8")).trim();
  const etiketler = [...metin.matchAll(/(^|\s)#([\p{L}\p{N}_]+)/gu)].map((m) => m[2]);
  const n = [...metin].length;
  if (platform === "tiktok") {
    // TikTok Content Posting API: açıklama en çok 2.200 UTF-16 karakter [resmî]. Uygulama içi 4.000 sınırı resmî kaynakta doğrulanamadı.
    const ust = kanal === "uygulama" ? 4000 : 2200;
    if (n > ust) ekle(kanal === "api" ? "hata" : "uyarı", "uzunluk", kanal === "api" ? `Metin ${n} karakter; TikTok Content Posting API sınırı 2.200.` : kanal === "uygulama" ? `Metin ${n} karakter; uygulama içi sınır 4.000 olarak bildiriliyor (resmî doğrulanmadı).` : `Metin ${n} karakter; API ile (zamanlayıcı araçlar) en çok 2.200, uygulamadan daha uzun olabilir. Kanalı belirt: --kanal api|uygulama.`);
  } else if (n > lim.karakterUst) ekle("hata", "uzunluk", `Metin ${n} karakter (en çok ${lim.karakterUst}).`);
  if (!metin) ekle("hata", "uzunluk", "Metin boş.");
  if (etiketler.length > lim.etiketUst) ekle(platform === "youtube" ? "uyarı" : "hata", "etiket", platform === "youtube" ? `${etiketler.length} etiket var; YouTube başlığın üstünde en çok ${lim.etiketUst} hashtag gösterir (fazlası spam gibi okunur).` : `${etiketler.length} etiket var; ${platform} gönderilerinde en çok ${lim.etiketUst} hashtag kullanılabiliyor (kullanıcı doğrulaması, 8 Kasım 2026); fazlasını kaldır.`);
  if (etiketler.length === 0) ekle("bilgi", "etiket", "Etiket yok; konuyu tanımlayan 2-3 somut etiket ekleyebilirsin.");
  if (new Set(etiketler.map((e) => e.toLocaleLowerCase("tr"))).size !== etiketler.length) ekle("uyarı", "etiket", "Aynı etiket birden fazla kez geçiyor.");
  const ilkSatir = metin.split("\n")[0];
  if (platform !== "youtube") {
    if ([...ilkSatir].length > ESIK.ilkSatirUst) ekle("uyarı", "ilk-satır", `İlk satır ${[...ilkSatir].length} karakter; "devamını gör" öncesinde yalnızca ilk ~${ESIK.ilkSatirUst} karakter görünür, konuyu ve kancayı oraya sığdır.`);
    if (/^#/.test(ilkSatir)) ekle("hata", "ilk-satır", "Metin etiketle başlıyor; ilk satır konuyu anlatan cümle olmalı.");
  }
  if (platform === "youtube") {
    if (!baslik) ekle("uyarı", "başlık", "YouTube başlığı verilmedi (--baslik); başlık denetlenmedi.");
    else {
      const b = [...baslik].length;
      if (b > lim.baslikUst) ekle("hata", "başlık", `Başlık ${b} karakter (en çok ${lim.baslikUst}).`);
      if (b > 70) ekle("bilgi", "başlık", `Başlık ${b} karakter; mobilde ilk ~70 karakter görünür, ana ifadeyi başa al.`);
      yasakliTara("başlık", baslik);
      // Küçük resim yazısı başlığı tekrar etmemeli; ikisi birlikte iki ayrı bilgi vermeli.
      if (kapakYazisi) {
        const sozler = (m) => new Set(katla(m).split(/[^a-z0-9]+/).filter((w) => w.length > 2));
        const ks = sozler(kapakYazisi), bs = sozler(baslik);
        const ortak = [...ks].filter((w) => bs.has(w));
        if (ks.size && ortak.length / ks.size > 0.5) ekle("uyarı", "kapak-başlık", `Küçük resim yazısındaki sözcüklerin %${Math.round((ortak.length / ks.size) * 100)}'i başlıkta da var (${ortak.join(", ")}); kapak başlığı tekrar etmesin, ek bir vaat ya da sayı söylesin.`);
        if (katla(kapakYazisi).split(/\s+/).filter(Boolean).length > 5) ekle("bilgi", "kapak-başlık", "Küçük resim yazısı 5 sözcükten uzun; mobilde okunması zorlaşır.");
      }
    }
    const ilk150 = [...metin].slice(0, 150).join("");
    if (!/[a-zçğıöşü]{3,}/i.test(ilk150)) ekle("uyarı", "ilk-satır", "Açıklamanın ilk 150 karakteri boş görünüyor.");
    const damgalar = [...metin.matchAll(/^\s*(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\s+\S/gm)].map((m) => (Number(m[1] ?? 0) * 3600) + Number(m[2]) * 60 + Number(m[3]));
    if (!damgalar.length && n > 1500) ekle("bilgi", "bölüm", "Uzun açıklamada bölüm damgası (00:00 ...) yok; uzun videolarda bölümler arama sonucunda gösterilebilir.");
    else if (damgalar.length) {
      // YouTube yardım: ilk damga 00:00, en az 3 damga, artan sırada, her bölüm en az 10 sn. [resmî]
      if (damgalar[0] !== 0) ekle("hata", "bölüm", "Bölüm damgaları 00:00 ile başlamalı.");
      if (damgalar.length < 3) ekle("hata", "bölüm", `En az 3 bölüm damgası gerekir (var: ${damgalar.length}); aksi halde YouTube bölümleri göstermez.`);
      if (damgalar.some((d, i) => i > 0 && d <= damgalar[i - 1])) ekle("hata", "bölüm", "Bölüm damgaları artan sırada olmalı.");
      else if (damgalar.some((d, i) => i > 0 && d - damgalar[i - 1] < 10)) ekle("hata", "bölüm", "Her bölüm en az 10 saniye olmalı.");
    }
    const bolumAdlari = [...metin.matchAll(/^\s*(?:\d{1,2}:)?\d{1,2}:\d{2}\s+(.+)$/gm)].map((m) => m[1].trim());
    const bos = bolumAdlari.filter((a) => /^(giriş|intro|başlangıç|bölüm\s*\d+|part\s*\d+|sonuç|kapanış|outro|özet|devam)$/i.test(a));
    if (bolumAdlari.length >= 3 && bos.length / bolumAdlari.length >= 0.5) ekle("bilgi", "bölüm-adı", `Bölüm adlarının çoğu boş etiket (${bos.join(", ")}); izleyicinin arayacağı ifade ya da soru yaz.`);
    if (etiketler.length > 60) ekle("hata", "etiket", `${etiketler.length} etiket: YouTube'a göre 60'tan fazla hashtag varsa hepsi yok sayılır.`);
  }
  if (/[\u200B-\u200D\u2060\uFEFF]/.test(metin)) ekle("uyarı", "gizli-karakter", "Metinde görünmez (sıfır genişlikli) karakter var; kopyalanmış metin ya da gizli içerik izlenimi verir, temizle.");
  yasakliTara("metin", metin);
  METRIK.karakter = n; METRIK.etiket = etiketler.length; METRIK.ilkSatirKarakter = [...ilkSatir].length;
  if (anahtar) {
    METRIK.anahtar = anahtar;
    const yer = platform === "youtube" && baslik ? baslik : ilkSatir;
    if (!anahtarVar(yer, anahtar)) ekle("uyarı", "anahtar", `Ana ifade ${platform === "youtube" && baslik ? "başlıkta" : "ilk satırda"} yok: "${anahtar}".`);
    if (!anahtarVar(metin, anahtar)) ekle("uyarı", "anahtar", "Ana ifade açıklamanın hiçbir yerinde geçmiyor.");
  }
  // Videoyla tutarlılık: açıklamadaki sayılar ve özel adlar transkriptte (ya da özette) geçmeli.
  if (transkript) {
    const tr = katla(sayiNorm(fs.readFileSync(transkript, "utf8")));
    const govde = metin.split("\n").filter((s) => !/^\s*(#|\d{1,2}:\d{2})/.test(s)).join(" ").replace(/https?:\/\/\S+/g, " ");
    const sayilar = [...new Set(govde.match(/\d+(?:[.,]\d+)?/g) ?? [])];
    const eksikSayi = sayilar.filter((x) => !tr.includes(katla(x)));
    if (eksikSayi.length) ekle("uyarı", "olgu-uyum", `Açıklamadaki şu sayılar transkriptte geçmiyor: ${eksikSayi.join(", ")}. Videoda yoksa kaldır ya da kaynağını yaz.`);
    const adlar = [...new Set((govde.match(/(?<![.!?]\s)(?<!^)\b[A-ZÇĞİÖŞÜ][\p{L}]{3,}\b/gu) ?? []))];
    const eksikAd = adlar.filter((x) => !tr.includes(katla(x).slice(0, Math.min(x.length, 5))));
    if (eksikAd.length) ekle("bilgi", "olgu-uyum", `Açıklamadaki şu özel adlar transkriptte geçmiyor: ${eksikAd.slice(0, 6).join(", ")}.`);
  }
  const linkler = metin.match(/https?:\/\/\S+/g) ?? [];
  if (linkler.length && platform !== "youtube") ekle("bilgi", "bağlantı", "Instagram ve TikTok açıklamasındaki bağlantılar tıklanmaz; adresi profildeki bağlantıya yönlendir.");
}

// ---------- ÇALIŞTIR ----------
const arg = process.argv.slice(2);
const json = arg.includes("--json");
const deger = (ad) => { const i = arg.indexOf(ad); return i >= 0 ? arg[i + 1] : ""; };
const baslik = deger("--baslik"), anahtarArg = deger("--anahtar"), transkriptArg = deger("--transkript"), kapakYazisi = deger("--kapak-yazisi");
const tipArg = deger("--tip"), koruGsc = deger("--koru-gsc"), oncekiArg = deger("--onceki"), altSorgular = deger("--alt-sorgular"), kanal = deger("--kanal");
const degerli = new Set(["--baslik", "--esik", "--anahtar", "--transkript", "--kapak-yazisi", "--baseline", "--kaydet", "--tolerans", "--tip", "--koru-gsc", "--onceki", "--alt-sorgular", "--kanal"]);
const poz = arg.filter((a, i) => !a.startsWith("--") && !degerli.has(arg[i - 1]));
const [tur, ...kalan] = poz;
if (tur === "web" && kalan[0]) webKontrol(kalan[0], anahtarArg);
else if (tur === "sosyal" && kalan[0] && kalan[1]) sosyalKontrol(kalan[0], kalan[1], baslik, anahtarArg, transkriptArg);
else { console.error("Kullanım:\n  node araclar/kontrol.mjs web <dosya.md|html> [--json]\n  node araclar/kontrol.mjs sosyal <instagram|tiktok|youtube> <dosya.txt> [--baslik \"...\"] [--json]"); process.exit(2); }

// Düzeltme önerileri: JSON çıktısındaki her bulguya "oneri" eklenir; düzeltici ajan bunu okur.
const ONERI = {
  başlık: "Ana arama ifadesini başa al; 15-60 karakter; sayfada geçen en ayırt edici ayrıntıyı sona koy; abartı sözcüğü yazma.",
  açıklama: "120-160 karakter, ilk cümlede sayfanın cevabı, cümle bitmiş, sayfaya özgün.",
  h1: "Sayfada tam bir H1 bırak; fazlasını H2'ye çevir.",
  h2: "3-10 ara başlık olsun; fazlaysa bölümleri birleştir, azsa uzun bölümleri böl.",
  "cevap-önce": "İlk paragrafı ≤ 60 kelimede soruyu doğrudan cevaplayan 1-2 cümleye indir; arka planı sonraya al.",
  cümle: "30+ kelimelik cümleleri böl; çok kısa cümleleri birleştir.",
  okunabilirlik: "Kısa cümle, yaygın sözcük, tek fikir per cümle; terimi ilk geçtiği yerde açıkla.",
  ton: "Resmî çekimi ('-mektedir') yalın fiile çevir; cümle başlarını çeşitlendir; klişe kalıpları somut bilgiyle değiştir.",
  "olgu-kaynak": "Sayı içeren her paragrafa kaynak atfı [n] ekle; kaynak yoksa sayıyı kaldır ya da [DOĞRULANMADI] işaretle.",
  "olgu-uyum": "Videoda geçmeyen sayı ve adı açıklamadan kaldır ya da kaynağını yaz.",
  abartı: "Abartı sözcüğünü sayfadaki somut bir ayrıntıyla (sayı, fark, sonuç) değiştir.",
  anahtar: "Ana ifadeyi başlıkta (başta), meta açıklamada ve ilk paragrafta doğal biçimde geçir; yığma yapma.",
  etiket: "Etiketleri platform sınırına indir; yalnızca konuyu tanımlayan somut etiketler kalsın.",
  "ilk-satır": "İlk satırı konuyu ve vaadi anlatan, ≤ 125 karakterlik bir cümle yap; etiketleri sona taşı.",
  bölüm: "YouTube bölümleri: 00:00 ile başla, en az 3 damga, artan sıra, her bölüm ≥ 10 sn.",
  sss: "Sayfada zaten var olan bilgiden 3-8 gerçek okur sorusu yaz; cevaplar 1-3 cümle.",
  kısaca: "Sayfa başına 3-5 maddelik, her biri tek başına doğru bir 'Kısaca' bloğu ekle.",
};
// Kanıt sınıfı ve ciddiyet: yalnızca "kesin" sınıftaki kurallar hata üretebilir; "ilke" ve "öneri" en çok uyarıdır (kural kataloğu).
const SINIF = {
  "başlık-yok": "kesin", "ilk-paragraf": "kesin", "json-ld": "kesin", uzunluk: "kesin", etiket: "kesin", bölüm: "kesin", "anahtar-kaybi": "kesin",
  h1: "ilke", "cevap-önce": "ilke", okunabilirlik: "ilke", kaynak: "ilke", "olgu-kaynak": "ilke", kanonik: "ilke", görsel: "ilke", "olgu-uyum": "ilke", "gizli-karakter": "ilke",
};
for (const b of bul) { b.sinif = SINIF[b.kural] ?? "öneri"; if (b.seviye === "hata" && b.sinif !== "kesin") b.seviye = "uyarı"; b.oneri = ONERI[b.kural] ?? null; }
const hata = bul.filter((b) => b.seviye === "hata").length, uyari = bul.filter((b) => b.seviye === "uyarı").length, bilgi = bul.filter((b) => b.seviye === "bilgi").length;
// Puan: 100 - 20/hata - 5/uyarı - 1/bilgi (alt sınır 0). Hesabı kod yapar, model yalnızca yorumlar.
const hamPuan = Math.max(0, 100 - 20 * hata - 5 * uyari - bilgi);
const puan = hata ? Math.min(hamPuan, 40) : hamPuan;
const ei = arg.indexOf("--esik");
const esik = ei >= 0 ? Number(arg[ei + 1]) : null;
if (json) console.log(JSON.stringify({ puan, hamPuan, hata, uyari, bilgi, metrikler: METRIK, bulgular: bul }, null, 2));
else {
  if (!bul.length) console.log("Sorun bulunmadı.");
  for (const b of bul) console.log(`[${b.seviye}] ${b.kural}: ${b.mesaj}`);
  if (Object.keys(METRIK).length) console.log(`\nMetrikler: ${Object.entries(METRIK).filter(([, v]) => v !== null).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  console.log(`\nPuan ${puan}/100: ${hata} hata, ${uyari} uyarı, ${bilgi} bilgi${esik !== null ? ` (eşik ${esik})` : ""}`);
}

// Baseline kapısı: --kaydet dosya.json puanı kaydeder; --baseline dosya.json ile yalnızca puan DÜŞERSE (tolerans --tolerans N, varsayılan 0) başarısız olur.
// Mevcut sorunları sabitleyip yeni gerilemeleri engellemek için kullanılır.
const dv = (ad) => { const i = arg.indexOf(ad); return i >= 0 ? arg[i + 1] : null; };
let baselineDustu = false;
if (dv("--baseline")) {
  try {
    const onceki = JSON.parse(fs.readFileSync(dv("--baseline"), "utf8"));
    const tol = Number(dv("--tolerans") ?? 0);
    if (puan < onceki.puan - tol) { baselineDustu = true; console.log(`\nBASELINE: puan ${onceki.puan} → ${puan} (düşüş, tolerans ${tol}); yeni sorunları düzelt.`); }
    else console.log(`\nBASELINE: puan ${onceki.puan} → ${puan} (gerileme yok).`);
  } catch (e) { console.error("baseline okunamadı: " + e.message); process.exit(2); }
}
if (dv("--kaydet")) fs.writeFileSync(dv("--kaydet"), JSON.stringify({ tarih: new Date().toISOString().slice(0, 10), puan, hata, uyari, bilgi }, null, 2));
process.exit(hata || (esik !== null && puan < esik) || baselineDustu ? 1 : 0);

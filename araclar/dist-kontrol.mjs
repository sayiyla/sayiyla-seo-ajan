#!/usr/bin/env node
// Derleme çıktısı (dist/, build/, public/ ya da bir HTML klasörü) için bağımlılıksız SEO / AEO / GEO yayın kapısı.
// Her HTML sayfasını ve site düzeyi dosyaları denetler; CI'da dağıtımdan önce çalıştırılır.
//
//   node araclar/dist-kontrol.mjs <klasor> [--site https://ornek.com] [--esik 80] [--json] [--uyariyi-hata-say]
//
// Çıkış kodu: 0 = hata yok, 1 = hata var (ya da --uyariyi-hata-say ile uyarı var), 2 = kullanım hatası.
import fs from "node:fs";
import path from "node:path";

const ESIK = { baslikUst: 70, aciklamaAlt: 50, aciklamaUst: 240, h2Ust: 12 };
const arg = process.argv.slice(2);
const kok = arg.find((a) => !a.startsWith("--") && !["--site", "--esik", "--min-sayfa", "--baseline", "--kaydet", "--tolerans"].includes(arg[arg.indexOf(a) - 1]));
const siteIdx = arg.indexOf("--site");
const site = siteIdx >= 0 ? arg[siteIdx + 1].replace(/\/$/, "") : "";
const json = arg.includes("--json");
const uyariHata = arg.includes("--uyariyi-hata-say");
if (!kok || !fs.existsSync(kok) || !fs.statSync(kok).isDirectory()) {
  console.error("Kullanım: node araclar/dist-kontrol.mjs <klasor> [--site https://ornek.com] [--esik 80] [--min-sayfa 60] [--baseline f.json] [--json] [--uyariyi-hata-say]");
  process.exit(2);
}

const bul = [];
const ekle = (seviye, sayfa, kural, mesaj) => bul.push({ seviye, sayfa, kural, mesaj });

function dosyalar(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? dosyalar(path.join(d, e.name)) : [path.join(d, e.name)]));
}
const tum = dosyalar(kok);
const rel = (f) => path.relative(kok, f).split(path.sep).join("/");
const htmller = tum.filter((f) => /\.html?$/i.test(f));
const adres = (f) => { const r = rel(f); return "/" + r.replace(/index\.html?$/i, "").replace(/\.html?$/i, ""); };
const mevcutAdresler = new Set(tum.map((f) => "/" + rel(f)));
for (const f of htmller) mevcutAdresler.add(adres(f)), mevcutAdresler.add(adres(f).replace(/\/$/, "") || "/");

const oku = (f) => fs.readFileSync(f, "utf8");
const etiketler = (h, ad) => [...h.matchAll(new RegExp(`<${ad}\\b[^>]*>`, "gi"))].map((m) => m[0]);
const ozellik = (tag, ad) => tag.match(new RegExp(`\\b${ad}=["']([^"']*)["']`, "i"))?.[1];
const meta = (h, adOzellik, ad) => etiketler(h, "meta").find((t) => ozellik(t, adOzellik)?.toLowerCase() === ad)?.match(/\bcontent=["']([^"']*)["']/i)?.[1];
const dugumler = (j) => (Array.isArray(j) ? j : j && typeof j === "object" ? [j, ...(Array.isArray(j["@graph"]) ? j["@graph"] : [])] : []);

let noindexSayisi = 0;
for (const f of htmller) {
  const s = adres(f), h = oku(f);
  if (/(^|\/)(404|google[0-9a-f]+|yandex_[0-9a-f]+|BingSiteAuth)\.(html?|xml)$/i.test(rel(f))) continue; // hata sayfası ve site doğrulama dosyaları sayfa değildir
  const robots = meta(h, "name", "robots") ?? "";
  if (/noindex/i.test(robots)) { noindexSayisi++; continue; } // noindex sayfa denetlenmez
  const baslik = h.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
  if (!baslik) ekle("hata", s, "başlık-yok", "<title> yok ya da boş.");
  else if ([...baslik].length > ESIK.baslikUst) ekle("hata", s, "başlık", `<title> ${[...baslik].length} karakter (en çok ${ESIK.baslikUst}).`);
  const acik = meta(h, "name", "description");
  if (!acik) ekle("hata", s, "açıklama", "meta description yok.");
  else if ([...acik].length < ESIK.aciklamaAlt || [...acik].length > ESIK.aciklamaUst) ekle("uyarı", s, "açıklama", `description ${[...acik].length} karakter (hedef ${ESIK.aciklamaAlt}-${ESIK.aciklamaUst}).`);
  const h1 = (h.match(/<h1\b/gi) ?? []).length;
  if (h1 !== 1) ekle("hata", s, "h1", `${h1} adet H1 var; tam 1 olmalı.`);
  const h2 = (h.match(/<h2\b/gi) ?? []).length;
  if (h2 > ESIK.h2Ust) ekle("uyarı", s, "h2", `${h2} ara başlık; konu dağınık görünüyor.`);
  if (!/<html\b[^>]*\blang=/i.test(h)) ekle("hata", s, "lang", "<html lang> yok.");
  const kanonik = etiketler(h, "link").find((t) => ozellik(t, "rel")?.toLowerCase() === "canonical");
  if (!kanonik) ekle("hata", s, "kanonik", "rel=canonical yok.");
  else if (site && !ozellik(kanonik, "href")?.startsWith(site)) ekle("uyarı", s, "kanonik", `kanonik adres ${site} ile başlamıyor: ${ozellik(kanonik, "href")}`);
  for (const p of ["og:title", "og:description", "og:image", "og:url"]) if (!meta(h, "property", p)) ekle("uyarı", s, "og", `${p} yok.`);
  const ogGorsel = meta(h, "property", "og:image");
  if (ogGorsel) { const yol = ogGorsel.replace(/^https?:\/\/[^/]+/, ""); if (!ogGorsel.startsWith("http") || site && ogGorsel.startsWith(site)) { if (!mevcutAdresler.has(yol)) ekle("uyarı", s, "og", `og:image dosyası derlemede yok: ${yol}`); } }
  if (!meta(h, "name", "viewport")) ekle("hata", s, "viewport", "meta viewport yok.");
  // Discover: makale sayfalarında büyük görsel önizlemesi için max-image-preview:large gerekir (Google Discover belgesi).
  if (/"@type"\s*:\s*"(NewsArticle|Article|BlogPosting|TechArticle)"/.test(h) && !/max-image-preview\s*:\s*large/i.test(robots)) ekle("bilgi", s, "discover", "Makale sayfasında robots meta'da max-image-preview:large yok; Discover'da büyük görsel gösterilmez.");
  // JSON-LD
  const ld = [...h.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  if (!ld.length) ekle("uyarı", s, "json-ld", "JSON-LD yok.");
  const idler = new Set(), basvurular = [];
  // Görünür metin (karşılaştırma için sade biçim): şemadaki başlık ve SSS soruları sayfada da görünmeli (Google: yapılandırılmış veri görünür içerikle eşleşmeli).
  const sadeMetin = (m) => String(m).toLocaleLowerCase("tr").replace(/&amp;/g, "&").replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const gorunur = sadeMetin(h.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " "));
  for (const j of ld) {
    try {
      for (const d of dugumler(JSON.parse(j))) {
        if (typeof d.headline === "string" && !gorunur.includes(sadeMetin(d.headline))) ekle("uyarı", s, "json-ld-uyum", `JSON-LD headline görünür metinde yok: "${d.headline.slice(0, 60)}"`);
        if (/FAQPage/.test(String(d["@type"])) && Array.isArray(d.mainEntity)) for (const q of d.mainEntity) if (q?.name && !gorunur.includes(sadeMetin(q.name))) ekle("uyarı", s, "json-ld-uyum", `FAQPage sorusu görünür metinde yok: "${String(q.name).slice(0, 60)}"`);
        // Fiyat: JSON-LD'deki fiyat görünür metinde de olmalı; geçerlilik tarihi geçmiş fiyat yanıltır. Okunma tarihini sayfada göster.
        for (const o of [].concat(d.offers ?? [])) {
          if (!o || typeof o !== "object") continue;
          if (o.priceValidUntil && Date.parse(o.priceValidUntil) < Date.now()) ekle("uyarı", s, "fiyat", `JSON-LD fiyatının geçerlilik tarihi geçmiş (priceValidUntil ${o.priceValidUntil}); fiyatı yeniden kontrol et, tarihi güncelle.`);
          const p = o.price ?? o.lowPrice;
          if (p != null && !gorunur.includes(sadeMetin(String(p)))) ekle("uyarı", s, "json-ld-uyum", `JSON-LD fiyatı (${p}${o.priceCurrency ? " " + o.priceCurrency : ""}) görünür metinde yok; fiyat tablosu ile şema aynı olmalı.`);
          if (p != null && !o.priceCurrency) ekle("bilgi", s, "fiyat", "JSON-LD teklifinde priceCurrency yok (ör. TRY).");
        }
        if (d["@id"]) idler.add(d["@id"]);
        for (const v of Object.values(d)) if (v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 1 && v["@id"]) basvurular.push(v["@id"]);
      }
    } catch { ekle("hata", s, "json-ld", "JSON-LD bloğu ayrıştırılamıyor."); }
  }
  for (const b of basvurular) if (!idler.has(b) && !b.startsWith("http")) ekle("uyarı", s, "json-ld", `@id referansı grafikte tanımlı değil: ${b}`);
  // Görseller ve bağlantılar
  const hSade = h.replace(/<script[\s\S]*?<\/script>/gi, "");
  for (const t of etiketler(hSade, "img")) {
    if (ozellik(t, "alt") === undefined) ekle("uyarı", s, "görsel", `alt metni yok: ${(ozellik(t, "src") ?? "").slice(0, 60)}`);
    if (!/\bwidth=/.test(t) || !/\bheight=/.test(t)) ekle("bilgi", s, "görsel", `width/height yok (CLS riski): ${(ozellik(t, "src") ?? "").slice(0, 60)}`);
  }
  for (const t of etiketler(hSade, "a")) {
    const href = ozellik(t, "href"); if (!href || /^(#|mailto:|tel:|javascript:|https?:|\/\/|data:)/i.test(href)) continue;
    const yol = new URL(href, "http://x" + s).pathname;
    const dosyaSon = path.posix.extname(yol);
    const var_ = mevcutAdresler.has(yol) || mevcutAdresler.has(yol.replace(/\/$/, "")) || mevcutAdresler.has(yol.replace(/\/?$/, "/"));
    if (!var_ && !(dosyaSon && mevcutAdresler.has(yol))) ekle("hata", s, "iç-bağlantı", `kırık iç bağlantı: ${href}`);
    if (/^(tıkla|buraya|burada|daha fazla|devamı)$/i.test(t.replace(/<[^>]+>/g, "").trim())) ekle("bilgi", s, "bağlantı-metni", `açıklayıcı olmayan bağlantı metni: ${href}`);
  }
}

// Site düzeyinde: yinelenen başlık ve açıklama, öksüz sayfa (gelen iç bağlantısı yok), zayıf iç bağlantı.
{
  const sayfalar = htmller.filter((f) => !/(^|\/)(404|google[0-9a-f]+|yandex_[0-9a-f]+|BingSiteAuth)\.(html?|xml)$/i.test(rel(f)));
  const baslikSayim = new Map(), aciklamaSayim = new Map(), gelen = new Map(), indexli = [];
  const norm = (p) => (p.replace(/\/index\.html?$/i, "/").replace(/\.html?$/i, "").replace(/\/$/, "") || "/");
  for (const f of sayfalar) {
    const h = oku(f), s = adres(f);
    if (/noindex/i.test(meta(h, "name", "robots") ?? "")) continue;
    indexli.push(s);
    const b = h.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim(), a = meta(h, "name", "description");
    if (b) baslikSayim.set(b, [...(baslikSayim.get(b) ?? []), s]);
    if (a) aciklamaSayim.set(a, [...(aciklamaSayim.get(a) ?? []), s]);
    const govde = h.replace(/<script[\s\S]*?<\/script>/gi, "");
    for (const tag of etiketler(govde, "a")) {
      const href = ozellik(tag, "href"); if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
      if (/^(https?:)?\/\//i.test(href) && !(site && href.startsWith(site))) continue;
      const hedef = norm(new URL(href, "http://x" + s).pathname);
      if (hedef !== norm(s)) gelen.set(hedef, (gelen.get(hedef) ?? new Set()).add(norm(s)));
    }
  }
  for (const [b, l] of baslikSayim) if (l.length > 1) ekle("uyarı", l[0], "yinelenen-başlık", `Aynı <title> ${l.length} sayfada: "${b.slice(0, 60)}" (${l.slice(0, 3).join(", ")}).`);
  for (const [a, l] of aciklamaSayim) if (l.length > 1) ekle("uyarı", l[0], "yinelenen-açıklama", `Aynı meta description ${l.length} sayfada (${l.slice(0, 3).join(", ")}).`);
  for (const s of indexli) {
    if (norm(s) === "/") continue;
    const n = gelen.get(norm(s))?.size ?? 0;
    if (n === 0) ekle("uyarı", s, "öksüz-sayfa", "Hiçbir sayfadan iç bağlantı almıyor; ana sayfa, kategori ya da ilgili yazılardan bağla.");
    else if (n === 1) ekle("bilgi", s, "zayıf-bağlantı", "Yalnızca 1 sayfadan iç bağlantı alıyor; 2-3 ilgili sayfadan bağlantı almalı.");
  }
}

// Site düzeyi
const tek = (yol) => tum.find((f) => rel(f) === yol);
// Favicon: Google arama sonucunda site simgesi için taranabilir bir rel="icon" ister.
const anasayfa = tek("index.html");
if (anasayfa && !etiketler(oku(anasayfa), "link").some((t) => /\bicon\b/i.test(ozellik(t, "rel") ?? ""))) ekle("uyarı", "/", "favicon", "Ana sayfada rel=\"icon\" yok; arama sonucunda site simgesi görünmez.");
// Gizlilik sayfası: güven sinyali ve yasal gereklilik (analitik ya da form kullanan sitelerde).
if (!htmller.some((f) => /(gizlilik|privacy|kvkk|cerez|cookie)/i.test(rel(f)))) ekle("bilgi", "/", "gizlilik", "Gizlilik/çerez sayfası bulunamadı; analitik ya da form kullanıyorsan gerekir.");
const robots = tek("robots.txt");
if (!robots) ekle("uyarı", "/", "robots", "robots.txt yok.");
else if (!/^sitemap:/im.test(oku(robots))) ekle("uyarı", "/robots.txt", "robots", "robots.txt içinde Sitemap satırı yok.");
const siteHaritalari = tum.filter((f) => /sitemap[^/]*\.xml$/i.test(rel(f)));
if (!siteHaritalari.length) ekle("uyarı", "/", "sitemap", "Site haritası bulunamadı.");
// Haber site haritası: yalnızca son iki günde yayımlanan makaleler bulunmalı (Google News sitemap belgesi). Derleme zamanına göre ölçülür.
for (const f of tum.filter((x) => /\.xml$/i.test(x))) {
  const x = oku(f);
  if (!/<news:publication_date>/.test(x)) continue;
  const eski = [...x.matchAll(/<news:publication_date>([^<]+)<\/news:publication_date>/g)].filter((m) => Date.now() - Date.parse(m[1]) > 2 * 86400000).length;
  if (eski) ekle("uyarı", "/" + rel(f), "haber-haritası", `Haber site haritasında ${eski} adres iki günden eski; yalnızca son 2 günün makaleleri kalmalı (derleme bugün yapıldıysa).`);
}
// Varlık netliği: ana sayfada Organization/Person için @id ve sameAs (sosyal profiller) önerilir; atıfa nedensel etkisi kanıtlanmadı.
{
  const ana = tek("index.html");
  if (ana && !/"sameAs"\s*:/.test(oku(ana))) ekle("bilgi", "/", "varlık", "Ana sayfa JSON-LD'sinde sameAs yok; Organization (@id) için X, YouTube, GitHub gibi resmî profilleri bağla.");
}
for (const f of siteHaritalari) {
  const x = oku(f);
  const locs = [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const lastmodlu = (x.match(/<lastmod>/g) ?? []).length;
  if (locs.length && !/<sitemapindex/.test(x) && lastmodlu < locs.length) ekle("uyarı", "/" + rel(f), "sitemap", `${locs.length - lastmodlu} URL'de lastmod yok; yalnızca anlamlı içerik değişikliğinde güncelle, hepsini derleme tarihine eşitleme.`);
  if (new Set(locs).size !== locs.length) ekle("hata", "/" + rel(f), "sitemap", "Aynı URL birden fazla kez listelenmiş.");
}
const llms = tek("llms.txt");
if (llms) {
  for (const m of oku(llms).matchAll(/\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g)) {
    const u = m[1].replace(/^https?:\/\/[^/]+/, "").split("#")[0].split("?")[0];
    if (u && !mevcutAdresler.has(u) && !mevcutAdresler.has(u.replace(/\/$/, "")) && !(site && !m[1].startsWith(site) && m[1].startsWith("http"))) ekle("uyarı", "/llms.txt", "llms", `llms.txt bağlantısı derlemede yok: ${m[1]}`);
  }
}
if (!tek("404.html") && !tek("404/index.html")) ekle("uyarı", "/", "404", "404.html yok; bilinmeyen yollar soft 404 olabilir (özellikle Cloudflare Pages'te).");
const mdAlternatif = htmller.filter((f) => /rel=["']alternate["'][^>]*text\/markdown/i.test(oku(f))).length;
if (mdAlternatif) {
  const eksik = htmller.filter((f) => /rel=["']alternate["'][^>]*text\/markdown/i.test(oku(f))).flatMap((f) => [...oku(f).matchAll(/<link[^>]*text\/markdown[^>]*href=["']([^"']+)["']/gi)].map((m) => m[1])).filter((u) => !mevcutAdresler.has(u.replace(/^https?:\/\/[^/]+/, "")));
  if (eksik.length) ekle("hata", "/", "markdown", `${eksik.length} markdown alternatif bağlantısı dosyası derlemede yok (ilk: ${eksik[0]}).`);
}

// _redirects (Cloudflare Pages / Netlify biçimi: kaynak hedef [kod]). Cloudflare Pages'te kod yazılmazsa 302 (geçici) olur.
const red = tek("_redirects");
if (red) {
  const satirlar = oku(red).split(/\r?\n/).map((x) => x.trim()).filter((x) => x && !x.startsWith("#")).map((x) => x.split(/\s+/));
  const kodsuz = satirlar.filter((p) => p.length === 2);
  if (kodsuz.length) ekle("uyarı", "/_redirects", "yönlendirme", `${kodsuz.length} yönlendirmede durum kodu yok; Cloudflare Pages'te varsayılan 302 (geçici). Kalıcı taşımada 301 yaz. İlk: ${kodsuz[0].join(" ")}`);
  const kaynakSet = new Set(satirlar.map((p) => p[0]));
  const zincir = satirlar.filter((p) => p[1] && kaynakSet.has(p[1].replace(/^https?:\/\/[^/]+/, "")) && p[1] !== p[0]);
  if (zincir.length) ekle("uyarı", "/_redirects", "yönlendirme", `${zincir.length} yönlendirme zinciri (A→B, B→C); doğrudan son hedefe yönlendir. İlk: ${zincir[0].join(" ")}`);
  const varMi = (y) => mevcutAdresler.has(y) || mevcutAdresler.has(y.replace(/\/$/, "")) || mevcutAdresler.has(y.replace(/\/?$/, "/"));
  const hedefsiz = satirlar.filter((p) => p[1]?.startsWith("/") && !/[:*]/.test(p[1]) && !kaynakSet.has(p[1]) && !varMi(p[1].split(/[?#]/)[0]));
  if (hedefsiz.length) ekle("uyarı", "/_redirects", "yönlendirme", `${hedefsiz.length} yönlendirmenin hedefi derlemede yok. İlk: ${hedefsiz[0].join(" ")}`);
}
// _headers: Markdown kopyaları varsa noindex başlığı almalı (kopya içerik olmasın).
const mdDosyalari = tum.filter((f) => /\.md$/i.test(f) && !/(^|\/)(readme|license|changelog)\.md$/i.test(rel(f)));
if (mdDosyalari.length) {
  const bas = tek("_headers") ? oku(tek("_headers")) : "";
  const bloklar = []; let b = null;
  for (const x of bas.split(/\r?\n/)) { if (!x.trim() || x.trim().startsWith("#")) continue; if (!/^\s/.test(x)) { b = { yol: x.trim(), baslik: [] }; bloklar.push(b); } else if (b) b.baslik.push(x.trim()); }
  const mdNoindex = bloklar.some((k) => /\.md$|\*\.md|\/\*$/.test(k.yol) && k.baslik.some((h) => /x-robots-tag:\s*.*noindex/i.test(h)) && (/\.md/.test(k.yol)));
  if (!mdNoindex) ekle("uyarı", "/_headers", "markdown", `${mdDosyalari.length} Markdown dosyası var ama _headers içinde /*.md için "X-Robots-Tag: noindex" yok; kopya içerik olarak dizine girebilir. İçerik pazarlığı yapıyorsan "Vary: Accept" da ekle.`);
}
// Markdown ikizi içerik eşitliği: HTML'deki H2 başlıkları ikizde de olmalı.
for (const f of htmller) {
  const h = oku(f), m = h.match(/<link[^>]*text\/markdown[^>]*href=["']([^"']+)["']/i);
  if (!m) continue;
  const mdYol = tum.find((x) => "/" + rel(x) === m[1].replace(/^https?:\/\/[^/]+/, ""));
  if (!mdYol) continue;
  const md = oku(mdYol).toLocaleLowerCase("tr");
  const h2ler = [...h.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((x) => x[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean);
  const eksik = h2ler.filter((x) => !md.includes(x.toLocaleLowerCase("tr").replace(/&amp;/g, "&")));
  if (eksik.length) ekle("uyarı", adres(f), "markdown", `Markdown ikizinde ${eksik.length}/${h2ler.length} H2 eksik (ilk: "${eksik[0].slice(0, 50)}"); ikiz sayfanın tam içeriğini taşımalı.`);
}

// Kanıt sınıfı ve ciddiyet: yalnızca "kesin" sınıftaki kurallar hata üretebilir; diğerleri en çok uyarıdır.
const SINIF = { "başlık-yok": "kesin", "json-ld": "kesin", "iç-bağlantı": "kesin", markdown: "kesin" };
for (const b of bul) { b.sinif = SINIF[b.kural] ?? "ilke"; if (b.seviye === "hata" && b.sinif !== "kesin") b.seviye = "uyarı"; }

const hata = bul.filter((b) => b.seviye === "hata").length, uyari = bul.filter((b) => b.seviye === "uyarı").length;
// Site puanı: her sayfa 100 - 20/hata - 5/uyarı - 1/bilgi (alt sınır 0) ile puanlanır, sayfaların ortalaması alınır. Hesabı kod yapar.
const sayfaSayisi = Math.max(1, htmller.length - noindexSayisi);
// Hata içeren sayfa en çok 40 puan alır (kapı tavanı); ortalama tek kötü sayfayı gizlemesin diye en düşük sayfa puanı da raporlanır.
const sayfaPuani = new Map();
for (const x of bul) { const o = sayfaPuani.get(x.sayfa) ?? { ceza: 0, hata: false }; o.ceza += x.seviye === "hata" ? 20 : x.seviye === "uyarı" ? 5 : 1; o.hata ||= x.seviye === "hata"; sayfaPuani.set(x.sayfa, o); }
const puanlar = [...sayfaPuani.entries()].map(([sayfa, o]) => ({ sayfa, puan: o.hata ? Math.min(40, Math.max(0, 100 - o.ceza)) : Math.max(0, 100 - o.ceza) }));
const puan = Math.round(100 - puanlar.reduce((t, p) => t + (100 - p.puan), 0) / sayfaSayisi);
const enKotu = puanlar.sort((a, b) => a.puan - b.puan)[0] ?? { sayfa: "-", puan: 100 };
const mi = arg.indexOf("--min-sayfa"), minSayfa = mi >= 0 ? Number(arg[mi + 1]) : null;
const ei = arg.indexOf("--esik"), esik = ei >= 0 ? Number(arg[ei + 1]) : null;

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
if (dv("--kaydet")) fs.writeFileSync(dv("--kaydet"), JSON.stringify({ tarih: new Date().toISOString().slice(0, 10), puan, hata, uyari }, null, 2));
if (json) console.log(JSON.stringify({ puan, enDusukSayfa: enKotu, sayfa: htmller.length - noindexSayisi, noindex: noindexSayisi, hata, uyari, bulgular: bul }, null, 2));
else {
  const grup = new Map();
  for (const b of bul) { const k = `${b.seviye}|${b.kural}`; if (!grup.has(k)) grup.set(k, []); grup.get(k).push(b); }
  for (const [k, l] of [...grup].sort()) {
    const [sev, kural] = k.split("|");
    console.log(`\n[${sev}] ${kural} (${l.length})`);
    for (const b of l.slice(0, 8)) console.log(`  ${b.sayfa}: ${b.mesaj}`);
    if (l.length > 8) console.log(`  ... ve ${l.length - 8} tane daha`);
  }
  console.log(`\nEn düşük sayfa: ${enKotu.sayfa} (${enKotu.puan}/100)${minSayfa !== null ? ` (alt sınır ${minSayfa})` : ""}`);
  console.log(`Site puanı ${puan}/100${esik !== null ? ` (eşik ${esik})` : ""}; ${htmller.length - noindexSayisi} sayfa denetlendi (${noindexSayisi} noindex atlandı): ${hata} hata, ${uyari} uyarı, ${bul.filter((b) => b.seviye === "bilgi").length} bilgi`);
}
process.exit(hata || (uyariHata && uyari) || (esik !== null && puan < esik) || (minSayfa !== null && enKotu.puan < minSayfa) || baselineDustu ? 1 : 0);

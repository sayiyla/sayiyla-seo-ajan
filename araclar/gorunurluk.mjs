#!/usr/bin/env node
// Yapay zekâ cevaplarında görünürlük ölçümü: aynı soruları web aramalı modellere birkaç kez sorar; markanın anılmasını, sitenin kaynak
// gösterilmesini ve rakip alan adlarını sayar. Sonuç "x/y koşuda" biçiminde, motor motor raporlanır (tek koşu anekdottur).
//
//   Ölçüm (API anahtarı ister, ücretli olabilir):
//     node araclar/gorunurluk.mjs olc --sorular sorular.txt --saglayici openai|gemini|openrouter --model <model-adı> [--kosu 3] [--ulke TR] --cikti sonuc.jsonl
//   Analiz (çevrimdışı; kendi topladığın sonuçlar da olur):
//     node araclar/gorunurluk.mjs analiz --girdi sonuc.jsonl --alan ornek.com --marka "Örnek" [--json]
//
// Anahtarlar ortamdan okunur: OPENAI_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY. Anahtar ve yanıt metni ekrana yazılmaz.
// İstek biçimleri sağlayıcıların belgelerine göre yazıldı (8 Kasım 2026): OpenAI Responses `web_search` + `include: web_search_call.action.sources`,
// Gemini generateContent `google_search` aracı (groundingMetadata), OpenRouter `openrouter:web_search` sunucu aracı. Bu sürümde canlı denenmedi;
// sağlayıcı biçimi değişirse ayrıştırıcıyı güncelle. sorular.txt: her satır bir soru (# ile başlayan satır yorum).
import fs from "node:fs";

const arg = process.argv.slice(2);
const komut = arg[0];
const d = (ad, v = "") => { const i = arg.indexOf(ad); return i >= 0 ? arg[i + 1] : v; };
const katla = (m) => String(m).toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c").replace(/ö/g, "o").replace(/ü/g, "u");
const alanAdi = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return String(u).replace(/^www\./, "").toLowerCase(); } };

async function sor(saglayici, model, soru, ulke) {
  if (saglayici === "openai") {
    const r = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model, input: soru, tools: [{ type: "web_search", user_location: { type: "approximate", country: ulke } }], include: ["web_search_call.action.sources"] }) });
    const j = await r.json(); if (!r.ok) throw new Error(`OpenAI ${r.status}: ${j.error?.message ?? ""}`.slice(0, 200));
    const metin = [], kaynak = [], sorgu = [];
    for (const o of j.output ?? []) {
      if (o.type === "web_search_call") { for (const s of o.action?.sources ?? []) if (s.url) kaynak.push(s.url); if (o.action?.query) sorgu.push(o.action.query); }
      if (o.type === "message") for (const c of o.content ?? []) { if (c.text) metin.push(c.text); for (const a of c.annotations ?? []) if (a.url) kaynak.push(a.url); }
    }
    return { metin: metin.join("\n"), kaynaklar: [...new Set(kaynak)], sorgular: sorgu };
  }
  if (saglayici === "gemini") {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: "POST", headers: { "x-goog-api-key": process.env.GEMINI_API_KEY ?? "", "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: soru }] }], tools: [{ google_search: {} }] }) });
    const j = await r.json(); if (!r.ok) throw new Error(`Gemini ${r.status}: ${j.error?.message ?? ""}`.slice(0, 200));
    const c = j.candidates?.[0] ?? {}, g = c.groundingMetadata ?? {};
    // Gemini kaynak adresleri çoğu zaman yönlendirme adresidir; başlık alanında alan adı bulunur.
    const kaynaklar = (g.groundingChunks ?? []).map((k) => k.web?.title && /\./.test(k.web.title) ? `https://${k.web.title}` : k.web?.uri).filter(Boolean);
    return { metin: (c.content?.parts ?? []).map((p) => p.text ?? "").join(""), kaynaklar: [...new Set(kaynaklar)], sorgular: g.webSearchQueries ?? [] };
  }
  if (saglayici === "openrouter") {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "user", content: soru }], tools: [{ type: "openrouter:web_search" }] }) });
    const j = await r.json(); if (!r.ok) throw new Error(`OpenRouter ${r.status}: ${j.error?.message ?? ""}`.slice(0, 200));
    const m = j.choices?.[0]?.message ?? {};
    const kaynaklar = (m.annotations ?? []).map((a) => a.url_citation?.url ?? a.url).filter(Boolean);
    return { metin: typeof m.content === "string" ? m.content : "", kaynaklar: [...new Set(kaynaklar)], sorgular: [] };
  }
  throw new Error(`Bilinmeyen sağlayıcı: ${saglayici}`);
}

if (komut === "olc") {
  const saglayici = d("--saglayici"), model = d("--model"), kosu = Number(d("--kosu", "3")), ulke = d("--ulke", "TR"), cikti = d("--cikti");
  if (!saglayici || !model || !cikti || !d("--sorular")) { console.error("Gerekli: --sorular, --saglayici, --model, --cikti (model adını sağlayıcının güncel listesinden ver; araç tahmin etmez)."); process.exit(2); }
  const anahtar = { openai: "OPENAI_API_KEY", gemini: "GEMINI_API_KEY", openrouter: "OPENROUTER_API_KEY" }[saglayici];
  if (!process.env[anahtar]) { console.error(`${anahtar} ortam değişkeni yok.`); process.exit(2); }
  const sorular = fs.readFileSync(d("--sorular"), "utf8").split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith("#"));
  console.log(`${sorular.length} soru × ${kosu} koşu = ${sorular.length * kosu} istek (${saglayici}, ${model}). Ücret sağlayıcının fiyatına bağlıdır.`);
  for (const soru of sorular) for (let k = 1; k <= kosu; k++) {
    try {
      const s = await sor(saglayici, model, soru, ulke);
      fs.appendFileSync(cikti, JSON.stringify({ tarih: new Date().toISOString(), saglayici, model, soru, kosu: k, ...s }) + "\n");
      process.stdout.write(".");
    } catch (e) { fs.appendFileSync(cikti, JSON.stringify({ tarih: new Date().toISOString(), saglayici, model, soru, kosu: k, hata: e.message }) + "\n"); process.stdout.write("x"); }
    await new Promise((c) => setTimeout(c, 1500));
  }
  console.log(`\nKaydedildi: ${cikti}. Analiz: node araclar/gorunurluk.mjs analiz --girdi ${cikti} --alan <alan> --marka "<marka>"`);
} else if (komut === "analiz") {
  const alan = d("--alan").replace(/^www\./, "").toLowerCase(), marka = d("--marka"), json = arg.includes("--json");
  if (!d("--girdi") || !alan) { console.error("Gerekli: --girdi sonuc.jsonl --alan ornek.com [--marka \"Ad\"]"); process.exit(2); }
  const kayit = fs.readFileSync(d("--girdi"), "utf8").split(/\r?\n/).filter(Boolean).map((s) => JSON.parse(s)).filter((r) => !r.hata);
  const motorlar = new Map();
  for (const r of kayit) {
    const k = `${r.saglayici}/${r.model}`; if (!motorlar.has(k)) motorlar.set(k, { kosu: 0, atif: 0, anma: 0, alanlar: new Map(), sorular: new Map() });
    const m = motorlar.get(k), alanlar = [...new Set((r.kaynaklar ?? []).map(alanAdi))];
    m.kosu++;
    const atif = alanlar.some((a) => a === alan || a.endsWith("." + alan));
    const anma = marka ? katla(r.metin ?? "").includes(katla(marka)) : false;
    if (atif) m.atif++; if (anma) m.anma++;
    for (const a of alanlar) m.alanlar.set(a, (m.alanlar.get(a) ?? 0) + 1);
    const sq = m.sorular.get(r.soru) ?? { kosu: 0, atif: 0, anma: 0 }; sq.kosu++; if (atif) sq.atif++; if (anma) sq.anma++; m.sorular.set(r.soru, sq);
  }
  const sonuc = [...motorlar].map(([motor, m]) => ({ motor, kosu: m.kosu, atif: m.atif, anma: m.anma, enCokAlanlar: [...m.alanlar].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([a, n]) => ({ alan: a, kosu: n, pay: +(n / m.kosu).toFixed(2) })), sorular: [...m.sorular].map(([soru, s]) => ({ soru, ...s })) }));
  if (json) console.log(JSON.stringify({ alan, marka, motorlar: sonuc }, null, 2));
  else for (const s of sonuc) {
    console.log(`\n${s.motor}: atıf ${s.atif}/${s.kosu} koşu, anma ${marka ? `${s.anma}/${s.kosu}` : "(marka verilmedi)"}`);
    console.log("  En çok kaynak gösterilen alan adları: " + s.enCokAlanlar.map((a) => `${a.alan} (${a.kosu})`).join(", "));
    for (const q of s.sorular) console.log(`  - ${q.soru}: atıf ${q.atif}/${q.kosu}${marka ? `, anma ${q.anma}/${q.kosu}` : ""}`);
  }
  if (!json) console.log("\nNot: Sonuçlar koşudan koşuya ve haftadan haftaya değişir; motorları ayrı oku, en az 30 soru ve 3 koşu ile karar ver. Atıf trafik değildir.");
} else {
  console.error("Kullanım:\n  node araclar/gorunurluk.mjs olc --sorular s.txt --saglayici openai|gemini|openrouter --model <ad> --cikti sonuc.jsonl [--kosu 3] [--ulke TR]\n  node araclar/gorunurluk.mjs analiz --girdi sonuc.jsonl --alan ornek.com [--marka \"Ad\"] [--json]");
  process.exit(2);
}

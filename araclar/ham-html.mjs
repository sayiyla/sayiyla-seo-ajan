#!/usr/bin/env node
// Bir adresin JavaScript çalıştırılmadan gelen ham HTML'ini farklı User-Agent'larla çeker ve karşılaştırır.
//   node araclar/ham-html.mjs <https://ornek.com/sayfa/> [--json]
//
// Neyi arar: (1) kritik içerik (H1, ana metin, JSON-LD, kanonik) ham HTML'de var mı, (2) arama/yapay zekâ botu adıyla gelen istek farklı durum kodu ya da
// farklı uzunlukta içerik alıyor mu (bot koruması engeli ya da gizleme belirtisi).
// Uyarı: User-Agent taklidi doğrulanmış bot değildir; bot koruması çoğu zaman IP'ye de bakar. Fark görmemen engel olmadığını kanıtlamaz,
// fark görmen ise araştırmaya değer bir işarettir. Kanıt için sunucu günlükleri (araclar/bot-log.mjs) ve Search Console tarama istatistikleri esastır.
const arg = process.argv.slice(2);
const json = arg.includes("--json");
const url = arg.find((a) => /^https?:\/\//.test(a));
if (!url) { console.error("Kullanım: node araclar/ham-html.mjs <https://ornek.com/sayfa/> [--json]"); process.exit(2); }

const UA = {
  tarayici: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  Googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "OAI-SearchBot": "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)",
  "Claude-SearchBot": "Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +https://www.anthropic.com)",
  PerplexityBot: "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
};
const sonuc = [];
for (const [ad, ua] of Object.entries(UA)) {
  try {
    const r = await fetch(url, { headers: { "user-agent": ua, accept: "text/html" }, redirect: "follow" });
    const h = await r.text();
    const govde = h.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    sonuc.push({ ad, durum: r.status, bayt: h.length, metinKelime: govde.split(" ").filter(Boolean).length, h1: (h.match(/<h1\b/gi) ?? []).length, jsonld: (h.match(/application\/ld\+json/gi) ?? []).length, kanonik: /<link[^>]+rel=["']canonical["']/i.test(h), noindex: /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(h) || /noindex/i.test(r.headers.get("x-robots-tag") ?? ""), robotsBaslik: r.headers.get("x-robots-tag") ?? null });
  } catch (e) { sonuc.push({ ad, hata: e.message }); }
}
const ref = sonuc.find((s) => s.ad === "tarayici" && !s.hata);
const bulgu = [];
if (ref) {
  if (ref.h1 !== 1) bulgu.push(`Ham HTML'de ${ref.h1} adet H1 var (JavaScript sonrası eklenen başlık botlara görünmez).`);
  if (ref.metinKelime < 150) bulgu.push(`Ham HTML'de yalnızca ${ref.metinKelime} kelime metin var; içerik JavaScript ile geliyor olabilir.`);
  if (!ref.kanonik) bulgu.push("Ham HTML'de rel=canonical yok.");
  if (!ref.jsonld) bulgu.push("Ham HTML'de JSON-LD yok.");
  if (ref.noindex) bulgu.push("Sayfa noindex (meta ya da X-Robots-Tag).");
  for (const s of sonuc.filter((x) => x.ad !== "tarayici" && !x.hata)) {
    if (s.durum !== ref.durum) bulgu.push(`${s.ad} adıyla gelen istek ${s.durum} aldı, tarayıcı ${ref.durum}; bot koruması engelliyor olabilir.`);
    else if (Math.abs(s.bayt - ref.bayt) / Math.max(ref.bayt, 1) > 0.2) bulgu.push(`${s.ad} adıyla gelen içerik tarayıcıdan %${Math.round((Math.abs(s.bayt - ref.bayt) / ref.bayt) * 100)} farklı uzunlukta (bayt ${s.bayt} / ${ref.bayt}); farklı içerik sunuluyor olabilir.`);
  }
}
if (json) console.log(JSON.stringify({ url, sonuc, bulgu }, null, 2));
else {
  console.log(`Ham HTML denetimi: ${url}\n`);
  for (const s of sonuc) console.log(s.hata ? `${s.ad.padEnd(18)} HATA ${s.hata}` : `${s.ad.padEnd(18)} durum ${s.durum}  bayt ${String(s.bayt).padStart(7)}  metin ${String(s.metinKelime).padStart(5)} kelime  H1 ${s.h1}  JSON-LD ${s.jsonld}  kanonik ${s.kanonik ? "var" : "yok"}${s.noindex ? "  NOINDEX" : ""}`);
  console.log(bulgu.length ? `\nBulgular:\n${bulgu.map((b) => "- " + b).join("\n")}` : "\nBulgu yok.");
  console.log("\nNot: User-Agent taklidi doğrulanmış bot değildir; kesin sonuç için sunucu günlüğüne bak (araclar/bot-log.mjs).");
}
process.exit(bulgu.length ? 1 : 0);

#!/usr/bin/env node
// robots.txt için yapay zekâ ve arama botu erişim matrisi.
//   node araclar/bot-matrisi.mjs <robots.txt dosyası | https://ornek.com/robots.txt> [--yol /yazilar/ornek/] [--json]
// Her bot için verilen yolun (varsayılan "/") izinli mi, engelli mi olduğunu gösterir. Bot adı eşleşmezse "*" grubu uygulanır.
// Bot listesi robots.txt belgelerinde yayımlanan kullanıcı aracısı adlarıdır; satıcılar adları değiştirebilir, listeyi güncel tut.
import fs from "node:fs";

const BOTLAR = [
  // [ad, tür, sahip]
  ["Googlebot", "arama", "Google"],
  ["Google-Extended", "robots jetonu (tarayıcı değil)", "Google: Gemini eğitimi ve grounding izni; taramayı Googlebot yapar"],
  ["Bingbot", "arama", "Microsoft"],
  ["YandexBot", "arama", "Yandex"],
  ["YandexAdditionalBot", "yapay zekâ cevapları (Alice)", "Yandex"],
  ["DuckDuckBot", "arama", "DuckDuckGo"],
  ["OAI-SearchBot", "yapay zekâ arama", "OpenAI"],
  ["ChatGPT-User", "kullanıcı isteğiyle getirme", "OpenAI"],
  ["GPTBot", "eğitim", "OpenAI"],
  ["Claude-SearchBot", "yapay zekâ arama", "Anthropic"],
  ["Claude-User", "kullanıcı isteğiyle getirme", "Anthropic"],
  ["ClaudeBot", "eğitim", "Anthropic"],
  ["PerplexityBot", "yapay zekâ arama", "Perplexity"],
  ["Perplexity-User", "kullanıcı isteğiyle getirme", "Perplexity"],
  ["Applebot", "arama", "Apple"],
  ["Applebot-Extended", "robots jetonu (tarayıcı değil)", "Apple: eğitim izni; taramayı Applebot yapar"],
  ["Amazonbot", "arama ve yapay zekâ", "Amazon"],
  ["meta-externalagent", "eğitim ve getirme", "Meta"],
  ["CCBot", "eğitim (Common Crawl)", "Common Crawl"],
  ["Bytespider", "eğitim", "ByteDance"],
  ["DuckAssistBot", "yapay zekâ cevapları", "DuckDuckGo"],
  ["MistralAI-User", "kullanıcı isteğiyle getirme", "Mistral"],
];

const arg = process.argv.slice(2);
const json = arg.includes("--json");
const yi = arg.indexOf("--yol");
const yol = yi >= 0 ? arg[yi + 1] : "/";
const kaynak = arg.find((a, i) => !a.startsWith("--") && !(yi >= 0 && i === yi + 1));
if (!kaynak) { console.error("Kullanım: node araclar/bot-matrisi.mjs <robots.txt | URL> [--yol /sayfa/] [--json]"); process.exit(2); }

const ham = /^https?:\/\//i.test(kaynak) ? await (await fetch(kaynak, { headers: { "user-agent": "seo-bot-matrisi" } })).text() : fs.readFileSync(kaynak, "utf8");

// Gruplara ayır: ardışık User-agent satırları bir grubu açar.
const gruplar = [];
let g = null, oncekiUA = false;
for (const satir of ham.split(/\r?\n/)) {
  const s = satir.replace(/#.*$/, "").trim();
  if (!s) continue;
  const m = s.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
  if (!m) continue;
  const k = m[1].toLowerCase(), v = m[2].trim();
  if (k === "user-agent") { if (!oncekiUA) { g = { ua: [], kurallar: [] }; gruplar.push(g); } g.ua.push(v.toLowerCase()); oncekiUA = true; }
  else { oncekiUA = false; if (g && (k === "allow" || k === "disallow")) g.kurallar.push({ tur: k, desen: v }); }
}

function eslesir(desen, p) {
  if (desen === "") return -1;
  const re = new RegExp("^" + desen.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"));
  return re.test(p) ? desen.replace(/\*/g, "").length : -1;
}
function karar(bot) {
  const ad = bot.toLowerCase();
  const ozel = gruplar.filter((x) => x.ua.some((u) => u !== "*" && (ad === u || ad.startsWith(u))));
  const kullan = ozel.length ? ozel : gruplar.filter((x) => x.ua.includes("*"));
  if (!kullan.length) return { durum: "izinli", neden: "kural yok" };
  let en = { uzun: -1, tur: "allow", desen: "" };
  for (const gr of kullan) for (const r of gr.kurallar) { const u = eslesir(r.desen, yol); if (u > en.uzun || (u === en.uzun && r.tur === "allow")) en = { uzun: u, tur: r.tur, desen: r.desen }; }
  const kaynakGrup = ozel.length ? `${bot} grubu` : "* grubu";
  if (en.uzun < 0) return { durum: "izinli", neden: `${kaynakGrup}: eşleşen kural yok` };
  return { durum: en.tur === "disallow" ? "ENGELLİ" : "izinli", neden: `${kaynakGrup}: ${en.tur === "disallow" ? "Disallow" : "Allow"}: ${en.desen}` };
}

const sonuc = BOTLAR.map(([ad, tur, sahip]) => ({ bot: ad, tur, sahip, yol, ...karar(ad) }));
if (json) console.log(JSON.stringify(sonuc, null, 2));
else {
  console.log(`robots.txt erişim matrisi (yol: ${yol})\n`);
  const w = Math.max(...sonuc.map((s) => s.bot.length));
  for (const s of sonuc) console.log(`${s.bot.padEnd(w)}  ${s.durum.padEnd(8)}  ${s.tur.padEnd(28)}  ${s.neden}`);
  const aramaEngelli = sonuc.filter((s) => s.durum === "ENGELLİ" && /arama|getirme/.test(s.tur));
  if (aramaEngelli.length) console.log(`\nUyarı: ${aramaEngelli.map((s) => s.bot).join(", ")} engelli. Bu botlar ilgili motorun cevaplarında görünürlüğü etkiler; bilerek mi engelledin?`);
  if (!gruplar.length) console.log("\nNot: robots.txt'te User-agent grubu bulunamadı; her bot izinli sayılır.");
  console.log("\nEğitim botlarını engellemek ayrı bir politika kararıdır; arama botlarını engellemek görünürlüğü etkiler.");
  console.log("Kullanıcı isteğiyle gelen botlar (ChatGPT-User, Perplexity-User) robots.txt kurallarına her zaman uymayabilir; \"engelledim\" garantisi sayma. Değişikliklerin işlenmesi ~24 saat sürebilir.");
  if (sonuc.find((s) => s.bot === "ChatGPT-User")?.durum === "ENGELLİ" && sonuc.find((s) => s.bot === "OAI-SearchBot")?.durum === "izinli") console.log("Tutarsızlık: ChatGPT-User engelli ama OAI-SearchBot açık; bilerek mi?");
  if (sonuc.find((s) => s.bot === "Google-Extended")?.durum === "ENGELLİ") console.log("Not: Google-Extended engelli. Bu yalnızca Gemini uygulamaları ve Vertex AI kullanımını kapsar; site AI Overviews ve AI Mode'dan ÇIKMAZ. Search'teki yapay zekâ özelliklerini sınırlamak için nosnippet / data-nosnippet / max-snippet / noindex ya da Search Console 'Search generative AI' kontrolü kullanılır.");
}

#!/usr/bin/env node
// Erişim günlüğünden (nginx/Apache "combined" ya da satır başına JSON) yapay zekâ ve arama botu ziyaretlerini özetler.
//   node araclar/bot-log.mjs <erisim.log> [--ip-listesi aralik.txt] [--json]
//
// User-Agent tek başına kanıt değildir: bot adı taşıyan isteklerin bir kısmı sahte olabilir. Doğrulama için botun yayımladığı IP aralıklarını
// (OpenAI, Anthropic, Perplexity, Google, Bing belgelerindeki listeler) bir dosyaya satır satır CIDR olarak koy (ör. 20.171.206.0/24) ve --ip-listesi ile ver.
// IP listesi verilmezse "doğrulanmadı" olarak raporlanır. Yalnızca IPv4 CIDR desteklenir.
import fs from "node:fs";

const arg = process.argv.slice(2);
const json = arg.includes("--json");
const ii = arg.indexOf("--ip-listesi");
const dosya = arg.find((a, i) => !a.startsWith("--") && !(ii >= 0 && i === ii + 1));
if (!dosya) { console.error("Kullanım: node araclar/bot-log.mjs <erisim.log> [--ip-listesi aralik.txt] [--json]"); process.exit(2); }

const BOTLAR = ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "Claude-SearchBot", "Claude-User", "ClaudeBot", "PerplexityBot", "Perplexity-User", "Googlebot", "bingbot", "YandexBot", "Applebot", "Amazonbot", "meta-externalagent", "CCBot", "Bytespider", "DuckAssistBot", "MistralAI-User", "YandexAdditionalBot"];
const ipInt = (ip) => ip.split(".").reduce((a, b) => (a << 8) + Number(b), 0) >>> 0;
const aralik = ii >= 0 ? fs.readFileSync(arg[ii + 1], "utf8").split(/\r?\n/).map((s) => s.trim()).filter((s) => /^\d+\.\d+\.\d+\.\d+(\/\d+)?$/.test(s)).map((s) => { const [ip, bit = "32"] = s.split("/"); const m = bit === "0" ? 0 : (~0 << (32 - Number(bit))) >>> 0; return { ag: ipInt(ip) & m, m }; }) : null;
const dogrula = (ip) => aralik ? aralik.some((r) => ((ipInt(ip) & r.m) >>> 0) === r.ag) : null;

// Bu adlar yalnızca robots.txt'te kullanılan kontrol jetonlarıdır; hiçbir tarayıcı bu User-Agent ile gelmez. Görülürse sahtedir.
const JETONLAR = ["Google-Extended", "Applebot-Extended"];
const sahteJeton = new Map();
const sonuc = new Map();
let toplam = 0;
for (const satir of fs.readFileSync(dosya, "utf8").split(/\r?\n/)) {
  if (!satir.trim()) continue;
  let ip, ua, yol, durum;
  if (satir.startsWith("{")) { try { const j = JSON.parse(satir); ip = j.ClientIP ?? j.remote_addr ?? j.ip ?? j.clientip; ua = j.ClientRequestUserAgent ?? j.http_user_agent ?? j.user_agent ?? j.ua ?? ""; yol = j.ClientRequestURI ?? j.request_uri ?? j.path ?? j.uri ?? ""; durum = j.EdgeResponseStatus ?? j.status; } catch { continue; } }
  else { const m = satir.match(/^(\S+) \S+ \S+ \[[^\]]+\] "(?:\S+) (\S+)[^"]*" (\d{3}) \S+ "[^"]*" "([^"]*)"/); if (!m) continue; [, ip, yol, durum, ua] = m; }
  toplam++;
  const jeton = JETONLAR.find((b) => (ua ?? "").toLowerCase().includes(b.toLowerCase()));
  if (jeton) { sahteJeton.set(jeton, (sahteJeton.get(jeton) ?? 0) + 1); continue; }
  const bot = BOTLAR.find((b) => (ua ?? "").toLowerCase().includes(b.toLowerCase()));
  if (!bot) continue;
  const o = sonuc.get(bot) ?? { istek: 0, yollar: new Set(), dogrulanan: 0, dogrulanmayan: 0, durumlar: {} };
  o.istek++; o.yollar.add(String(yol).split("?")[0]);
  const d = ip ? dogrula(ip) : null; if (d === true) o.dogrulanan++; else if (d === false) o.dogrulanmayan++;
  o.durumlar[durum] = (o.durumlar[durum] ?? 0) + 1;
  sonuc.set(bot, o);
}
const satirlar = [...sonuc].map(([bot, o]) => ({ bot, istek: o.istek, benzersizYol: o.yollar.size, dogrulanan: aralik ? o.dogrulanan : null, dogrulanmayan: aralik ? o.dogrulanmayan : null, durumlar: o.durumlar })).sort((a, b) => b.istek - a.istek);
if (json) console.log(JSON.stringify({ toplamIstek: toplam, botlar: satirlar, sahteJeton: Object.fromEntries(sahteJeton) }, null, 2));
else {
  console.log(`${toplam} istek tarandı, ${satirlar.length} bot adı bulundu.${aralik ? "" : " (IP listesi verilmedi: doğrulama yapılmadı)"}\n`);
  for (const s of satirlar) console.log(`${s.bot.padEnd(20)} istek ${String(s.istek).padStart(6)}  yol ${String(s.benzersizYol).padStart(5)}${aralik ? `  doğrulanan ${s.dogrulanan}  doğrulanmayan ${s.dogrulanmayan}` : ""}  durum ${JSON.stringify(s.durumlar)}`);
  if (aralik) console.log("\nDoğrulanmayan istekler sahte User-Agent olabilir; bot adına güvenme.");
  if (!satirlar.length) console.log("Günlükte tanınan bot adı yok.");
  for (const [j, n] of sahteJeton) console.log(`SAHTE: ${n} istek "${j}" adıyla geldi; bu ad yalnızca robots.txt jetonudur, gerçek bir tarayıcı bu User-Agent'ı kullanmaz.`);
  console.log("\n4xx/5xx oranı yüksek bir bot, güvenlik duvarının ya da bot korumasının onu engellediğine işaret edebilir.");
}

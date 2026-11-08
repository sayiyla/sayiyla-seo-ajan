#!/usr/bin/env node
// Ajan, skill ve komut dosyalarını (Markdown) güvenlik açısından tarar. Dışarıdan aldığın bir ajanı ya da skill'i kullanmadan önce çalıştır.
//   node araclar/ajan-tara.mjs [klasör ...]      (varsayılan: .claude/ ve ajanlar/ varsa)
//
// Aranan kalıplar (kesin bir güvenlik denetimi değildir; riskli görünen yerleri insan gözüne çıkarır):
// uzak betiği doğrudan çalıştıran komutlar, gizli ya da kodlanmış içerik, talimat ezme cümleleri, kimlik bilgisi yazan/okuyan komutlar,
// geniş yıkıcı komutlar, ajana tanınan gereksiz geniş yetkiler.
import fs from "node:fs";
import path from "node:path";

const arg = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const kokler = (arg.length ? arg : [".claude", "ajanlar"]).filter((k) => fs.existsSync(k));
const KURALLAR = [
  { ad: "uzak-betik", seviye: "yüksek", re: /\b(curl|wget|iwr|irm|Invoke-WebRequest)\b[^\n|]*\|\s*(bash|sh|zsh|iex|python3?|node)\b/i, mesaj: "Uzak betik doğrudan çalıştırılıyor (curl | bash)." },
  { ad: "talimat-ezme", seviye: "yüksek", re: /(ignore|disregard|forget)\s+(all\s+|the\s+)?(previous|prior|above)\s+(instructions|rules)|önceki\s+(talimatları|kuralları)\s+(yok say|unut)/i, mesaj: "Önceki talimatları yok sayma cümlesi (prompt injection kalıbı)." },
  { ad: "gizli-karakter", seviye: "yüksek", re: /[​-‏‪-‮⁠-⁤﻿]/, mesaj: "Görünmez ya da yön değiştiren Unicode karakter (gizli içerik)." },
  { ad: "kodlanmis-yuk", seviye: "orta", re: /\b(base64\s+(-d|--decode)|atob\(|FromBase64String|eval\(|exec\()/i, mesaj: "Kodlanmış yük çözme ya da dinamik çalıştırma." },
  { ad: "kimlik-bilgisi", seviye: "yüksek", re: /(\.env\b|id_rsa|\.aws\/credentials|\.npmrc|\.git-credentials|api[_-]?key\s*[:=]|password\s*[:=]|Authorization:\s*Bearer\s+\S{12,})/i, mesaj: "Kimlik bilgisi dosyasına/değerine atıf ya da sabit gizli anahtar." },
  { ad: "yikici-komut", seviye: "yüksek", re: /\b(rm\s+-rf\s+(\/|~|\$HOME|\*)|git\s+push\s+(-f|--force)|git\s+reset\s+--hard|DROP\s+TABLE|format\s+[a-z]:)/i, mesaj: "Geniş yıkıcı komut." },
  { ad: "gonderim", seviye: "orta", re: /\b(curl|wget|Invoke-WebRequest|fetch)\b[^\n]*\s(-d|--data|-F|--upload-file|-X\s*(POST|PUT))(\s|=)/i, mesaj: "Dış adrese veri gönderen komut; ne gönderdiğini doğrula." },
  { ad: "genis-yetki", seviye: "bilgi", re: /^tools:\s*\*\s*$/m, mesaj: "Ajan tüm araçlara yetkili (tools: *); gerekenlerle sınırla." },
];

function dosyalar(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (e.name === "node_modules" ? [] : dosyalar(path.join(d, e.name))) : e.name.endsWith(".md") ? [path.join(d, e.name)] : [])); }
const bulgular = [];
for (const k of kokler) for (const f of dosyalar(k)) {
  const satirlar = fs.readFileSync(f, "utf8").split(/\r?\n/);
  // Savunma cümleleri ("... talimatlara uyma") kalıbı örnek olarak anar; bunlar bulgu sayılmaz.
  const savunma = /(uyma|uyulmaz|uymaz|do not follow|never follow|don't follow)/i;
  satirlar.forEach((s, i) => { for (const r of KURALLAR) if (r.re.test(s) && !(r.ad === "talimat-ezme" && savunma.test(s))) bulgular.push({ dosya: f, satir: i + 1, kural: r.ad, seviye: r.seviye, mesaj: r.mesaj, parca: s.trim().slice(0, 90) }); });
}
if (!kokler.length) { console.log("Taranacak klasör yok (.claude ya da ajanlar bulunamadı; klasör adı ver)."); process.exit(0); }
for (const b of bulgular) console.log(`[${b.seviye}] ${b.dosya}:${b.satir} ${b.kural}: ${b.mesaj}\n    ${b.parca}`);
const yuksek = bulgular.filter((b) => b.seviye === "yüksek").length;
console.log(`\n${bulgular.length} bulgu (${yuksek} yüksek). Bu tarama kesin güvenlik denetimi değildir; yüksek bulguları elle incele, kaynağı belirsiz ajanı çalıştırma.`);
process.exit(yuksek ? 1 : 0);

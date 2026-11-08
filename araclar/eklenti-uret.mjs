#!/usr/bin/env node
// Claude Code eklentisi için ajan kopyalarını üretir: .claude/agents/*.md → agents/*.md.
// Repo içinde çalışırken ajanlar göreli yolları (araclar/, kurallar/) kullanır; eklenti olarak kurulunca çalışma klasörü kullanıcının
// projesidir, bu yüzden eklenti kopyalarında yollar ${CLAUDE_PLUGIN_ROOT} ile başlar (Claude Code ajan gövdesinde bunu gerçek yola çevirir).
//   node araclar/eklenti-uret.mjs           üretir
//   node araclar/eklenti-uret.mjs --denetle   kopyalar güncel değilse çıkış kodu 1 (CI)
import fs from "node:fs";
import path from "node:path";

const KOK = path.resolve(import.meta.dirname, "..");
const KAYNAK = path.join(KOK, ".claude", "agents"), HEDEF = path.join(KOK, "agents");
const denetle = process.argv.includes("--denetle");
const cevir = (m) => {
  const [, on, govde] = m.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/) ?? [null, "", m];
  const g = govde
    .replace(/(^|[\s`"(])node (araclar\/[\w.-]+)/g, (_, a, yol) => `${a}node "\${CLAUDE_PLUGIN_ROOT}/${yol}"`)
    .replace(/(^|[\s`"(])(kurallar|benchmark|ornekler|docs)\//g, (_, a, k) => `${a}\${CLAUDE_PLUGIN_ROOT}/${k}/`)
    .replace(/(^|[\s`"(])(araclar)\/(?![\w.-]+")/g, (_, a, k) => `${a}\${CLAUDE_PLUGIN_ROOT}/${k}/`);
  return on + "<!-- Bu dosya .claude/agents/ altındaki asıldan araclar/eklenti-uret.mjs ile üretilir; doğrudan düzenleme. -->\n" + g;
};
let fark = 0;
fs.mkdirSync(HEDEF, { recursive: true });
for (const f of fs.readdirSync(KAYNAK).filter((x) => x.endsWith(".md"))) {
  const yeni = cevir(fs.readFileSync(path.join(KAYNAK, f), "utf8"));
  const hedef = path.join(HEDEF, f);
  const eski = fs.existsSync(hedef) ? fs.readFileSync(hedef, "utf8") : null;
  if (eski !== yeni) { fark++; if (!denetle) fs.writeFileSync(hedef, yeni); }
}
console.log(denetle ? (fark ? `${fark} eklenti ajanı güncel değil; node araclar/eklenti-uret.mjs çalıştır.` : "Eklenti ajanları güncel.") : `${fark} dosya yazıldı.`);
process.exit(denetle && fark ? 1 : 0);

#!/usr/bin/env node
// Kurallar dosyalarının tazeliğini denetler: her dosyada "Son gözden geçirme: YYYY-AA-GG" satırı olmalı ve yaşı sınırı aşmamalı.
//   node araclar/tazelik.mjs [kurallar klasörü] [--gun 90]
// Arama motorlarının kuralları ve platform sınırları değişir; eskiyen kural sessizce yanlış öneri üretir. CI'da çalıştırılır.
import fs from "node:fs";
import path from "node:path";

const arg = process.argv.slice(2);
const gi = arg.indexOf("--gun");
const sinir = gi >= 0 ? Number(arg[gi + 1]) : 90;
const klasor = arg.find((a, i) => !a.startsWith("--") && !(gi >= 0 && i === gi + 1)) ?? path.resolve(import.meta.dirname, "..", "kurallar");
let hata = 0;
for (const f of fs.readdirSync(klasor).filter((x) => x.endsWith(".md")).sort()) {
  const m = fs.readFileSync(path.join(klasor, f), "utf8").match(/Son gözden geçirme:\s*(\d{4}-\d{2}-\d{2})/);
  if (!m) { console.log(`HATA  ${f}: "Son gözden geçirme: YYYY-AA-GG" satırı yok`); hata++; continue; }
  const yas = Math.floor((Date.now() - Date.parse(m[1])) / 86400000);
  if (yas > sinir) { console.log(`ESKİ  ${f}: ${yas} gün önce gözden geçirilmiş (sınır ${sinir}); kaynakları yeniden oku`); hata++; }
  else console.log(`TAMAM ${f}: ${m[1]} (${yas} gün)`);
}
process.exit(hata ? 1 : 0);

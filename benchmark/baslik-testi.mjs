#!/usr/bin/env node
// baslik-testi.mjs için uçtan uca vaka testi: erken ölçüm, kazanç, genel dalga (kontrol sayfası), yetersiz veri, konum kayması.
//   node benchmark/baslik-testi.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ARAC = path.resolve(import.meta.dirname, "..", "araclar", "baslik-testi.mjs");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "baslik-testi-"));
const csv = (ad, satirlar) => { const f = path.join(TMP, ad); fs.writeFileSync(f, "Sorgu,Tıklamalar,Gösterimler,TO,Konum\n" + satirlar.map((s) => s.join(",")).join("\n")); return f; };
const calis = (...a) => { const r = spawnSync(process.execPath, [ARAC, ...a, "--defter", path.join(TMP, "defter.jsonl"), "--json"], { encoding: "utf8" }); return r.stdout.trim().startsWith("{") ? JSON.parse(r.stdout) : { kod: r.status, cikti: r.stdout + r.stderr }; };

const ONCE = csv("once.csv", [["a", 8, 900, "0.9%", 5.1], ["b", 4, 500, "0.8%", 6.0]]);
const KAZANC = csv("kazanc.csv", [["a", 30, 950, "3.2%", 5.0], ["b", 15, 480, "3.1%", 6.3]]);
const KAYMA = csv("kayma.csv", [["a", 60, 950, "6.3%", 2.0], ["b", 40, 480, "8.3%", 2.1]]);
const AZ = csv("az.csv", [["a", 3, 60, "5%", 5.0]]);
const K_ONCE = csv("k-once.csv", [["x", 10, 1000, "1%", 5]]);
const K_DALGA = csv("k-dalga.csv", [["x", 40, 1000, "4%", 5]]);

const VAKALAR = [
  { ad: "erken ölçüm", url: "https://o.com/1/", sonra: KAZANC, tarih: "2026-11-05", bekle: "erken" },
  { ad: "gerçek kazanç", url: "https://o.com/2/", sonra: KAZANC, tarih: "2026-11-20", bekle: "kazandı" },
  { ad: "genel dalga (kontrol de arttı)", url: "https://o.com/3/", sonra: KAZANC, kontrol: true, tarih: "2026-11-20", bekle: "belirsiz" },
  { ad: "yetersiz gösterim", url: "https://o.com/4/", sonra: AZ, tarih: "2026-11-20", bekle: "yetersiz veri" },
  { ad: "konum kayması ölçüme girmez", url: "https://o.com/5/", sonra: KAYMA, tarih: "2026-11-20", bekle: "yetersiz veri" },
];

let basarisiz = 0;
for (const v of VAKALAR) {
  const ek = v.kontrol ? ["--kontrol", "https://o.com/k/", "--kontrol-once", K_ONCE] : [];
  calis("baslat", v.url, "--eski", "Eski", "--yeni", "Yeni başlık 3 fark", "--tur", "fark", "--once", ONCE, "--tarih", "2026-11-01", ...ek);
  const r = calis("olc", v.url, "--sonra", v.sonra, "--tarih", v.tarih, ...(v.kontrol ? ["--kontrol-sonra", K_DALGA] : []));
  const tamam = r.karar === v.bekle;
  if (!tamam) basarisiz++;
  console.log(`${tamam ? "GEÇTİ " : "KALDI "} ${v.ad.padEnd(32)} karar: ${r.karar ?? r.cikti}${tamam ? "" : `  beklenen: ${v.bekle}`}`);
}
const ikinci = calis("baslat", "https://o.com/1/", "--eski", "a", "--yeni", "b", "--once", ONCE);
const kilit = ikinci.kod === 2;
if (!kilit) basarisiz++;
console.log(`${kilit ? "GEÇTİ " : "KALDI "} ${"süren teste ikinci başlangıç reddedilir".padEnd(32)}`);
const ders = calis("ders");
const dersTamam = ders.test === 2 && ders.tablo?.tur?.[0]?.deger === "fark";
if (!dersTamam) basarisiz++;
console.log(`${dersTamam ? "GEÇTİ " : "KALDI "} ${"ders yalnız biten testleri sayar".padEnd(32)} test: ${ders.test}`);
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n${VAKALAR.length + 2 - basarisiz}/${VAKALAR.length + 2} vaka geçti`);
process.exit(basarisiz ? 1 : 0);

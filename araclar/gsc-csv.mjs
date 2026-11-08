// Search Console "Dışa aktar > CSV" dosyasını okur (Türkçe ve İngilizce başlıklar, virgül ya da noktalı virgül ayraç).
// gsc.mjs ve baslik-testi.mjs ortak kullanır.
import fs from "node:fs";

export function csvOku(dosya) {
  const ham = fs.readFileSync(dosya, "utf8").replace(/^﻿/, "").replace(/\r\n/g, "\n").trim();
  const ayrac = (ham.split("\n")[0].match(/;/g) ?? []).length > (ham.split("\n")[0].match(/,/g) ?? []).length ? ";" : ",";
  const satirlar = ham.split("\n").map((s) => { const o = []; let c = "", q = false; for (const ch of s) { if (ch === '"') q = !q; else if (ch === ayrac && !q) { o.push(c); c = ""; } else c += ch; } o.push(c); return o; });
  const baslik = satirlar[0].map((b) => b.trim().toLowerCase());
  const bul = (...adlar) => baslik.findIndex((b) => adlar.some((a) => b === a));
  const k = { ad: bul("top queries", "queries", "query", "en çok yapılan sorgular", "sorgu", "sorgular", "top pages", "pages", "page", "en çok ziyaret edilen sayfalar", "sayfa", "sayfalar"), tik: bul("clicks", "tıklamalar"), gos: bul("impressions", "gösterimler"), to: bul("ctr", "to", "tıklama oranı"), konum: bul("position", "konum", "ortalama konum") };
  if (k.ad < 0 || k.gos < 0 || k.konum < 0) throw new Error(`${dosya}: sorgu/sayfa, gösterim ve konum sütunları bulunamadı (başlıklar: ${baslik.join(" | ")})`);
  const sayi = (s) => { const t = String(s ?? "").replace("%", "").trim(); if (!t) return 0; return Number(t.includes(",") && !t.includes(".") ? t.replace(",", ".") : t.replace(/,/g, "")); };
  return satirlar.slice(1).filter((s) => s[k.ad]).map((s) => {
    const tik = k.tik >= 0 ? sayi(s[k.tik]) : 0, gos = sayi(s[k.gos]);
    const to = k.to >= 0 ? sayi(s[k.to]) : (gos ? (tik / gos) * 100 : 0);
    return { ad: s[k.ad], tik, gos, to, konum: sayi(s[k.konum]) };
  });
}

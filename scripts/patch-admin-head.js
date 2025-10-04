// scripts/patch-admin-head.mjs
// Mantém o /admin do Tina estável: injeta só favicon e fontes (nada de CSS/JS da app).
// Aplica no admin do output final (.vercel/output/static/admin/index.html)
// e, se não existir (ex.: local), aplica em public/admin/index.html.

import { readFile, writeFile, access } from "node:fs/promises";
import { constants as FS } from "node:fs";
import path from "node:path";

const candidates = [
  path.join(".vercel", "output", "static", "admin", "index.html"),
  path.join("public", "admin", "index.html"),
];

async function firstExisting(paths) {
  for (const p of paths) {
    try { await access(p, FS.F_OK); return p; } catch {}
  }
  return null;
}

async function run() {
  const target = await firstExisting(candidates);
  if (!target) {
    console.log("[patch-admin-head] admin/index.html não encontrado (ok se build ainda não gerou).");
    return;
  }

  let html = await readFile(target, "utf8");

  // evita duplicação se rodar mais de uma vez
  if (html.includes("<!-- patched-by: lefthandjournal -->")) {
    console.log("[patch-admin-head] já estava aplicado.");
    return;
  }

  const inject = `
  <!-- patched-by: lefthandjournal -->
  <link rel="icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet">
`;

  if (html.includes("</head>")) {
    html = html.replace("</head>", `${inject}\n</head>`);
  } else {
    // fallback raro
    html = html + inject;
  }

  await writeFile(target, html, "utf8");
  console.log(`[patch-admin-head] aplicado em: ${target}`);
}

run().catch((e) => {
  console.error("[patch-admin-head] erro:", e);
  process.exit(1);
});
 
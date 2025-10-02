// scripts/patch-admin-head.js
import fs from "node:fs";

const file = "public/admin/index.html"; // ajuste: admin está em public
let html = fs.readFileSync(file, "utf8");

/** Injeta <link rel="stylesheet" href="/admin/theme.css" /> */
if (!html.includes('id="tina-custom-theme"')) {
  html = html.replace(
    "</head>",
    `  <link id="tina-custom-theme" rel="stylesheet" href="/admin/theme.css" />\n</head>`
  );
}

/** Injeta script de tema + botão flutuante + atalho "T" */
if (!html.includes('id="tina-theme-script"')) {
  html = html.replace(
    "</body>",
    `<script id="tina-theme-script">
(function () {
  var KEY = "tina-theme";
  var saved = localStorage.getItem(KEY);
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);

  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(KEY, t);
    btn && (btn.textContent = t === "dark" ? "☀︎" : "☾");
  }

  // Toggle com tecla "T"
  window.addEventListener("keydown", function (e) {
    if (e.key.toLowerCase() === "t" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    }
  });

  // Botão flutuante discreto
  var btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = theme === "dark" ? "☀︎" : "☾";
  btn.setAttribute("aria-label", "Toggle theme");
  Object.assign(btn.style, {
    position: "fixed",
    zIndex: 9999,
    right: "1rem",
    bottom: "1rem",
    width: "36px",
    height: "36px",
    borderRadius: "9999px",
    border: "1px solid var(--border, #ddd)",
    background: "var(--background, #fff)",
    color: "var(--text, #000)",
    fontSize: "18px",
    lineHeight: "36px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,.1)",
    cursor: "pointer"
  });
  btn.addEventListener("click", function () {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });
  document.body.appendChild(btn);

  window.__tinaTheme = { set: setTheme, get: () => document.documentElement.getAttribute("data-theme") };
})();
</script>
</body>`
  );
}

fs.writeFileSync(file, html);
console.log("✔ Patched admin/index.html with theme CSS & script");

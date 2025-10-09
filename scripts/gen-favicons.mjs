import fs from "node:fs/promises";
import path from "node:path";
import favicons from "favicons";

const SRC = "public/favicon.svg";
const OUT = "public";

const config = {
  path: "/",                   // <link> paths
  appName: "O Levógiro", // optional
  icons: {
    favicons: true,
    android: true,
    appleIcon: true,
    appleStartup: false,
    windows: false,
    yandex: false,
    coast: false,
    firefox: false
  }
};

const res = await favicons(SRC, config);

// Write images
await Promise.all(res.images.map(img => fs.writeFile(path.join(OUT, img.name), img.contents)));
// Write files (e.g., manifest)
await Promise.all(res.files.map(file => fs.writeFile(path.join(OUT, file.name), file.contents)));

console.log("Favicons generated from", SRC);

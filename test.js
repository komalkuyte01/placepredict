const fs = require("node:fs");
async function run() {
  const mod = await import("pdf-parse");
  const pdfParse = mod.default || mod;
  console.log("pdfParse is function:", typeof pdfParse === "function");
  fs.writeFileSync("out.txt", `type: ${typeof pdfParse}`);
}
run();

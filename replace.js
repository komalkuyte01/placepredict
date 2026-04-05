const fs = require("fs");
const path = require("path");

const targetStr = "#6e44ff";
const targetStr2 = "#8b6aff";
const replacementStr = "#1360fa";
const replacementStr2 = "#3b7efa"; // slightly lighter blue for #8b6aff placeholder

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir("./src", (filePath) => {
  if (
    filePath.endsWith(".tsx") ||
    filePath.endsWith(".ts") ||
    filePath.endsWith(".css")
  ) {
    const content = fs.readFileSync(filePath, "utf8");
    if (
      content.includes(targetStr) ||
      content.includes(targetStr.toUpperCase()) ||
      content.includes(targetStr2)
    ) {
      const updated = content
        .replace(new RegExp(targetStr, "g"), replacementStr)
        .replace(new RegExp(targetStr.toUpperCase(), "g"), replacementStr)
        .replace(new RegExp(targetStr2, "g"), replacementStr2);
      fs.writeFileSync(filePath, updated, "utf8");
      console.log(`Updated ${filePath}`);
    }
  }
});

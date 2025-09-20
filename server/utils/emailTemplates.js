import fs from "fs";
import path from "path";

// Simple Mustache-like replacement for {{key}} placeholders.
function render(templateStr, data = {}) {
  return templateStr.replace(/{{\s*([\w\.]+)\s*}}/g, (_, key) => {
    const val = data[key];
    return val === undefined || val === null ? "" : String(val);
  });
}

function loadTemplate(name, ext = "html") {
  const candidates = [
    path.resolve(process.cwd(), "server", "templates", `${name}.${ext}`),
    path.resolve(process.cwd(), "templates", `${name}.${ext}`),
    path.resolve(__dirname, "..", "templates", `${name}.${ext}`),
  ];
  const tplPath = candidates.find((p) => fs.existsSync(p));
  if (!tplPath) return null;
  return fs.readFileSync(tplPath, "utf8");
}

export function renderTemplate(name, data = {}, opts = { html: true }) {
  const ext = opts.html ? "html" : "txt";
  const tpl = loadTemplate(name, ext);
  if (!tpl) return null;
  return render(tpl, data);
}

export default { renderTemplate };

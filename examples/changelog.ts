import "./site.css";
import changelog from "../CHANGELOG.md?raw";
const lines = changelog.split("\n").filter(Boolean);
const escape = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
document.querySelector("#app")!.innerHTML =
  `<header class="site-nav"><a class="brand" href="/">salyra<span>/</span>ui</a><nav><a href="/">Examples</a><a href="/docs.html">Documentation</a></nav></header><main class="docs-content">${lines.map((line) => (line.startsWith("# ") ? `<h1>${escape(line.slice(2))}</h1>` : line.startsWith("## ") ? `<h2>${escape(line.slice(3))}</h2>` : line.startsWith("- ") ? `<p>${escape(line.slice(2))}</p>` : `<p>${escape(line)}</p>`)).join("")}<a href="/docs.html">Read the 0.1.0 documentation</a></main>`;

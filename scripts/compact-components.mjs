import { readFile, writeFile, readdir } from "node:fs/promises";
import { parse as parseScript } from "@babel/parser";
import generator from "@babel/generator";
import { parse as parseSvelte } from "svelte/compiler";
import { parse as parseVue } from "@vue/compiler-sfc";

const generate = generator.default ?? generator;
function compactScript(source) {
  const ast = parseScript(source, {
    sourceType: "module",
    plugins: ["typescript"],
  });
  return generate(ast, { minified: true, comments: false }).code;
}

export async function compactComponents(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      await compactComponents(path);
      continue;
    }
    if (entry.name.endsWith(".d.ts")) continue;
    if (!/\.(ts|svelte|vue|astro)$/.test(entry.name)) continue;
    let source = await readFile(path, "utf8");
    if (entry.name.endsWith(".ts")) source = compactScript(source);
    else if (entry.name.endsWith(".svelte")) {
      const ast = parseSvelte(source, { modern: true });
      const scripts = [ast.instance, ast.module]
        .filter(Boolean)
        .sort((a, b) => b.content.start - a.content.start);
      for (const script of scripts)
        source =
          source.slice(0, script.content.start) +
          compactScript(
            source.slice(script.content.start, script.content.end),
          ) +
          source.slice(script.content.end);
    } else if (entry.name.endsWith(".vue")) {
      const { descriptor, errors } = parseVue(source);
      if (errors.length)
        throw new Error(`Cannot parse ${path}: ${errors.join(", ")}`);
      const scripts = [descriptor.script, descriptor.scriptSetup]
        .filter(Boolean)
        .sort((a, b) => b.loc.start.offset - a.loc.start.offset);
      for (const script of scripts)
        source =
          source.slice(0, script.loc.start.offset) +
          compactScript(script.content) +
          source.slice(script.loc.end.offset);
    } else {
      source = source.replace(
        /^---\r?\n([\s\S]*?)\r?\n---/,
        (_, script) => `---\n${compactScript(script)}\n---`,
      );
      source = source.replace(
        /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g,
        (_, open, script, close) => open + compactScript(script) + close,
      );
    }
    await writeFile(path, source.trim() + "\n");
  }
}

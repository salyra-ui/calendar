import { build } from "esbuild";
import { mkdir, cp, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { compactComponents } from "./compact-components.mjs";
const root = "release/package";
await rm("release", { recursive: true, force: true });
await mkdir(`${root}/dist`, { recursive: true });
execFileSync(
  process.execPath,
  ["node_modules/typescript/bin/tsc", "-p", "tsconfig.build.json"],
  { stdio: "inherit" },
);
execFileSync(
  process.execPath,
  [
    "node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js",
    "-p",
    "tsconfig.angular.json",
  ],
  { stdio: "inherit" },
);
const coreExternal = {
  name: "shared-core",
  setup(b) {
    b.onResolve({ filter: /^\.\.\/core$/ }, () => ({
      path: "../core/index.js",
      external: true,
    }));
  },
};
for (const [entry, outfile] of [
  ["src/core/index.ts", "core/index.js"],
  ["src/react/index.tsx", "react/index.js"],
  ["src/vue/index.ts", "vue/index.js"],
  ["src/vanilla/index.ts", "vanilla/index.js"],
  ["artifacts/angular/angular/index.js", "angular/index.js"],
]) {
  await build({
    entryPoints: [entry],
    outfile: `${root}/dist/${outfile}`,
    bundle: true,
    format: "esm",
    platform: "neutral",
    packages: "external",
    target: "es2022",
    minify: true,
    sourcemap: false,
    plugins: [coreExternal],
  });
}
for (const entry of ["core", "react", "vue", "vanilla"])
  await cp(`artifacts/types/${entry}`, `${root}/dist/${entry}`, {
    recursive: true,
  });
await cp("artifacts/angular/angular", `${root}/dist/angular`, {
  recursive: true,
  filter: (path) =>
    path.endsWith(".d.ts") || !path.includes(".") || path.endsWith("/angular"),
});
for (const dir of ["svelte", "astro"]) {
  await cp(`src/${dir}`, `${root}/dist/${dir}`, { recursive: true });
  for (const file of await readdir(`${root}/dist/${dir}`))
    if (/\.(ts|svelte|astro)$/.test(file)) {
      const path = `${root}/dist/${dir}/${file}`;
      let text = await readFile(path, "utf8");
      text = text
        .replace(/from (['"])\.\.\/core\1/g, 'from "../core/index.js"')
        .replace(/from (['"])\.\.\/vanilla\1/g, 'from "../vanilla/index.js"');
      await writeFile(path, text);
    }
  await compactComponents(`${root}/dist/${dir}`);
}
for (const minify of [false, true]) {
  await build({
    entryPoints: ["src/vanilla/index.ts"],
    outfile: `${root}/dist/browser/date-picker${minify ? ".min" : ""}.js`,
    bundle: true,
    format: "iife",
    globalName: "SalyraDatePicker",
    platform: "browser",
    target: "es2022",
    minify,
    sourcemap: false,
  });
  await build({
    entryPoints: ["src/styles.css"],
    outfile: `${root}/dist/styles${minify ? ".min" : ""}.css`,
    minify,
    sourcemap: false,
  });
}
const manifest = JSON.parse(await readFile("package.json", "utf8"));
const exports = {
  ".": { types: "./dist/core/index.d.ts", import: "./dist/core/index.js" },
  ...Object.fromEntries(
    ["react", "vue", "angular", "vanilla"].map((x) => [
      `./${x}`,
      { types: `./dist/${x}/index.d.ts`, import: `./dist/${x}/index.js` },
    ]),
  ),
  "./svelte": "./dist/svelte/index.ts",
  "./astro": "./dist/vanilla/index.js",
  "./astro/*": "./dist/astro/*",
  "./styles.css": "./dist/styles.min.css",
  "./styles.min.css": "./dist/styles.min.css",
  "./styles.standard.css": "./dist/styles.css",
  "./browser/*": "./dist/browser/*",
};
await writeFile(
  `${root}/package.json`,
  JSON.stringify(
    {
      name: manifest.name,
      version: manifest.version,
      type: "module",
      description: manifest.description,
      license: "MIT",
      files: ["dist", "README.md", "LICENSE"],
      exports,
      sideEffects: manifest.sideEffects,
      peerDependencies: manifest.peerDependencies,
      peerDependenciesMeta: manifest.peerDependenciesMeta,
    },
    null,
    2,
  ),
);
await cp("README.md", `${root}/README.md`);
await cp("LICENSE", `${root}/LICENSE`);
const result = execFileSync("npm", ["pack", "--json", "--ignore-scripts"], {
  cwd: root,
  encoding: "utf8",
});
const packed = JSON.parse(result)[0];
if (
  packed.files.some(
    (f) =>
      f.path.endsWith(".map") ||
      (!f.path.startsWith("dist/") &&
        !["package.json", "README.md", "LICENSE"].includes(f.path)),
  )
)
  throw new Error("Unexpected archive content");
await mkdir("public/downloads", { recursive: true });
await cp(`${root}/${packed.filename}`, `public/downloads/${packed.filename}`);
console.log(
  `Built ${packed.filename}: ${packed.entryCount} files, ${packed.size} bytes, no sourcemaps`,
);

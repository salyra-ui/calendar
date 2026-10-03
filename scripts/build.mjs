import { build } from "esbuild";
import { mkdir, cp, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { compactComponents } from "./compact-components.mjs";
const slugs = ["calendar", "date-picker", "time-picker", "date-time-picker"];
const source = "packages/calendar/src";
await rm("release", { recursive: true, force: true });
await rm("public/downloads", { recursive: true, force: true });
await mkdir("public/downloads", { recursive: true });
for (const config of ["tsconfig.build.json", "tsconfig.packages.json"])
  execFileSync(
    process.execPath,
    ["node_modules/typescript/bin/tsc", "-p", config],
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
for (const slug of slugs) {
  const root = `release/${slug}`;
  await mkdir(`${root}/dist`, { recursive: true });
  const manifest = JSON.parse(
    await readFile(`packages/${slug}/package.json`, "utf8"),
  );
  delete manifest.private;
  let exports;
  if (slug === "calendar") {
    for (const [entry, outfile] of [
      [`${source}/core/index.ts`, "core/index.js"],
      [`${source}/react/index.tsx`, "react/index.js"],
      [`${source}/vue/index.ts`, "vue/index.js"],
      [`${source}/vanilla/index.ts`, "vanilla/index.js"],
      ["artifacts/angular/angular/index.js", "angular/index.js"],
    ])
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
    for (const entry of ["core", "react", "vue", "vanilla"])
      await cp(`artifacts/types/${entry}`, `${root}/dist/${entry}`, {
        recursive: true,
      });
    await cp("artifacts/angular/angular", `${root}/dist/angular`, {
      recursive: true,
      filter: (path) =>
        path.endsWith(".d.ts") ||
        !path.includes(".") ||
        path.endsWith("/angular"),
    });
    for (const dir of ["svelte", "astro"]) {
      await cp(`${source}/${dir}`, `${root}/dist/${dir}`, { recursive: true });
      for (const file of await readdir(`${root}/dist/${dir}`))
        if (/\.(ts|svelte|astro)$/.test(file)) {
          const path = `${root}/dist/${dir}/${file}`;
          const text = (await readFile(path, "utf8"))
            .replace(/from (['"])\.\.\/core\1/g, 'from "../core/index.js"')
            .replace(
              /from (['"])\.\.\/vanilla\1/g,
              'from "../vanilla/index.js"',
            );
          await writeFile(path, text);
        }
      await compactComponents(`${root}/dist/${dir}`);
    }
    exports = {
      ".": { types: "./dist/core/index.d.ts", import: "./dist/core/index.js" },
      ...Object.fromEntries(
        ["react", "vue", "angular", "vanilla"].map((f) => [
          `./${f}`,
          { types: `./dist/${f}/index.d.ts`, import: `./dist/${f}/index.js` },
        ]),
      ),
      "./svelte": "./dist/svelte/index.ts",
      "./astro": "./dist/vanilla/index.js",
      "./astro/*": "./dist/astro/*",
    };
  } else {
    for (const entry of ["index", "react", "vue", "angular", "vanilla"]) {
      await build({
        entryPoints: [
          `packages/${slug}/src/${entry}${entry === "react" ? ".tsx" : ".ts"}`,
        ],
        outfile: `${root}/dist/${entry}.js`,
        bundle: true,
        format: "esm",
        platform: "neutral",
        packages: "external",
        target: "es2022",
        minify: true,
        sourcemap: false,
      });
      await cp(
        `artifacts/package-types/${slug}/src/${entry}.d.ts`,
        `${root}/dist/${entry}.d.ts`,
      );
    }
    await cp(`packages/${slug}/src/svelte.ts`, `${root}/dist/svelte.ts`);
    await cp(`packages/${slug}/src/astro`, `${root}/dist/astro`, {
      recursive: true,
    });
    await compactComponents(`${root}/dist`);
    exports = {
      ".": { types: "./dist/index.d.ts", import: "./dist/index.js" },
      ...Object.fromEntries(
        ["react", "vue", "angular", "vanilla"].map((f) => [
          `./${f}`,
          { types: `./dist/${f}.d.ts`, import: `./dist/${f}.js` },
        ]),
      ),
      "./svelte": "./dist/svelte.ts",
      "./astro": "./dist/vanilla.js",
      "./astro/*": "./dist/astro/*",
    };
  }
  for (const minify of [false, true]) {
    await build({
      entryPoints: [
        slug === "calendar"
          ? `${source}/vanilla/index.ts`
          : `packages/${slug}/src/vanilla.ts`,
      ],
      outfile: `${root}/dist/browser/${slug}${minify ? ".min" : ""}.js`,
      bundle: true,
      format: "iife",
      globalName:
        "Salyra" +
        slug
          .split("-")
          .map((s) => s[0].toUpperCase() + s.slice(1))
          .join(""),
      platform: "browser",
      target: "es2022",
      minify,
      sourcemap: false,
    });
    await build({
      entryPoints: [`${source}/styles.css`],
      outfile: `${root}/dist/styles${minify ? ".min" : ""}.css`,
      minify,
      sourcemap: false,
    });
  }
  Object.assign(exports, {
    "./styles.css": "./dist/styles.min.css",
    "./styles.min.css": "./dist/styles.min.css",
    "./styles.standard.css": "./dist/styles.css",
    "./browser/*": "./dist/browser/*",
  });
  await writeFile(
    `${root}/package.json`,
    JSON.stringify(
      { ...manifest, exports, files: ["dist", "README.md", "LICENSE"] },
      null,
      2,
    ) + "\n",
  );
  await cp(`packages/${slug}/README.md`, `${root}/README.md`);
  await cp("LICENSE", `${root}/LICENSE`);
  const packed = JSON.parse(
    execFileSync("npm", ["pack", "--json", "--ignore-scripts"], {
      cwd: root,
      encoding: "utf8",
    }),
  )[0];
  if (
    packed.files.some(
      (f) =>
        f.path.endsWith(".map") ||
        (!f.path.startsWith("dist/") &&
          !["package.json", "README.md", "LICENSE"].includes(f.path)),
    )
  )
    throw new Error(`Unexpected ${slug} archive content`);
  await cp(`${root}/${packed.filename}`, `public/downloads/${packed.filename}`);
  console.log(
    `Built ${packed.filename}: ${packed.entryCount} files, ${packed.size} bytes, no sourcemaps`,
  );
}

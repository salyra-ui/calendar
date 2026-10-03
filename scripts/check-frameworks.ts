import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { compile } from "svelte/compiler";
import { transform } from "@astrojs/compiler";
for (const file of await readdir("src/svelte"))
  if (file.endsWith(".svelte")) {
    const source = await readFile(`src/svelte/${file}`, "utf8");
    for (const generate of ["client", "server"] as const)
      compile(source, { filename: `src/svelte/${file}`, generate });
  }
for (const file of await readdir("src/astro"))
  if (file.endsWith(".astro"))
    await transform(await readFile(`src/astro/${file}`, "utf8"), {
      filename: `src/astro/${file}`,
    });
console.log("Svelte client/server components and Astro components compiled");

import { readdir, readFile } from "node:fs/promises";
import { compile } from "svelte/compiler";
import { transform } from "@astrojs/compiler";
const shared = "packages/calendar/src/svelte";
for (const file of await readdir(shared))
  if (file.endsWith(".svelte"))
    for (const generate of ["client", "server"] as const)
      compile(await readFile(`${shared}/${file}`, "utf8"), {
        filename: `${shared}/${file}`,
        generate,
      });
for (const slug of [
  "calendar",
  "date-picker",
  "time-picker",
  "date-time-picker",
]) {
  const dir = `packages/${slug}/src/astro`;
  for (const file of await readdir(dir))
    if (file.endsWith(".astro"))
      await transform(await readFile(`${dir}/${file}`, "utf8"), {
        filename: `${dir}/${file}`,
      });
}
console.log(
  "Shared Svelte client/server primitives and all four Astro package components compiled",
);

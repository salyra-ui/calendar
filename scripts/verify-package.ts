import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build } from "esbuild";
import { compile } from "svelte/compiler";
import { transform } from "@astrojs/compiler";
const directory = await mkdtemp(join(tmpdir(), "salyra-date-consumer-"));
try {
  const manifest = JSON.parse(await readFile("package.json", "utf8"));
  const archive = resolve(
    `release/package/salyra-ui-date-picker-${manifest.version}.tgz`,
  );
  await writeFile(
    join(directory, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  execFileSync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--omit=optional",
      "--legacy-peer-deps",
      archive,
    ],
    { cwd: directory, stdio: "pipe" },
  );
  const packagePath = join(directory, "node_modules/@salyra-ui/date-picker");
  const packedManifest = JSON.parse(
    await readFile(join(packagePath, "package.json"), "utf8"),
  );
  assert(!packedManifest.private);
  assert(
    !packedManifest.dependencies,
    "The package must not install unrelated framework runtimes",
  );
  async function audit(path: string): Promise<void> {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const file = join(path, entry.name);
      if (entry.isDirectory()) await audit(file);
      else {
        assert(!file.endsWith(".map"), "Sourcemaps must not be packed");
        if (/\.(js|css|ts|svelte|astro)$/.test(file))
          assert(
            !(await readFile(file, "utf8")).includes("sourceMappingURL"),
            "No source map references",
          );
      }
    }
  }
  await audit(packagePath);
  for (const file of await readdir(join(packagePath, "dist/svelte")))
    if (file.endsWith(".svelte")) {
      const source = await readFile(
        join(packagePath, "dist/svelte", file),
        "utf8",
      );
      compile(source, { generate: "client", filename: file });
      compile(source, { generate: "server", filename: file });
    }
  for (const file of await readdir(join(packagePath, "dist/astro")))
    if (file.endsWith(".astro"))
      await transform(
        await readFile(join(packagePath, "dist/astro", file), "utf8"),
        { filename: file },
      );

  const consumer = `import {createPickerStore,resolveZonedDateTime} from '@salyra-ui/date-picker';
 import {mountPicker} from '@salyra-ui/date-picker/vanilla';
 const store=createPickerStore({referenceDate:'2010-03-01',month:{year:2010,month:3}});
 if(store.getMonth().weeks[0][0].date!=='2010-03-01')throw Error('Wrong packaged calendar');
 store.selectDate('2010-03-09');if(store.getSnapshot().value.date!=='2010-03-09')throw Error('Wrong packaged selection');
 if(typeof mountPicker!=='function'||typeof resolveZonedDateTime!=='function')throw Error('Missing exports');`;
  await writeFile(join(directory, "consumer.mjs"), consumer);
  execFileSync(process.execPath, ["consumer.mjs"], {
    cwd: directory,
    stdio: "pipe",
  });
  // Inspect the actual import graph of a Vanilla app, not only export names.
  const bundle = await build({
    entryPoints: [join(directory, "consumer.mjs")],
    bundle: true,
    write: false,
    metafile: true,
    platform: "browser",
    format: "esm",
  });
  assert(
    Object.keys(bundle.metafile!.inputs).every(
      (path) => !/(react|vue|svelte|angular|astro)\//.test(path),
    ),
    "Vanilla must not bundle another adapter",
  );
  console.log(
    "Fresh archive install, core/native imports, compact component compilation, isolated adapter graph and sourcemap audit passed",
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}

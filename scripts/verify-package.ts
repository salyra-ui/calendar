import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import {
  mkdtemp,
  writeFile,
  readFile,
  readdir,
  rm,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build } from "esbuild";
import { compile } from "svelte/compiler";
import { transform } from "@astrojs/compiler";
const slugs = ["calendar", "date-picker", "time-picker", "date-time-picker"];
const directory = await mkdtemp(join(tmpdir(), "salyra-picker-consumer-"));
try {
  const version = JSON.parse(await readFile("package.json", "utf8")).version;
  await writeFile(
    join(directory, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  const archives = slugs.map((slug) =>
    resolve(`release/${slug}/salyra-ui-${slug}-${version}.tgz`),
  );
  execFileSync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--omit=optional",
      "--legacy-peer-deps",
      "--offline",
      "--no-audit",
      "--no-fund",
      ...archives,
    ],
    { cwd: directory, stdio: "pipe" },
  );
  for (const slug of slugs) {
    const path = join(directory, "node_modules/@salyra-ui", slug);
    const manifest = JSON.parse(
      await readFile(join(path, "package.json"), "utf8"),
    );
    assert(!manifest.private);
    assert.equal(manifest.name, `@salyra-ui/${slug}`);
    const deps = manifest.dependencies ?? {};
    assert.deepEqual(
      Object.keys(deps).sort(),
      slug === "calendar"
        ? []
        : slug === "date-time-picker"
          ? [
              "@salyra-ui/calendar",
              "@salyra-ui/date-picker",
              "@salyra-ui/time-picker",
            ]
          : ["@salyra-ui/calendar"],
    );
    assert(Object.values(deps).every((v) => v === version));
    async function audit(folder: string): Promise<void> {
      for (const entry of await readdir(folder, { withFileTypes: true })) {
        const file = join(folder, entry.name);
        if (entry.isDirectory()) await audit(file);
        else {
          assert(!file.endsWith(".map"));
          if (/\.(js|css|ts|svelte|astro)$/.test(file))
            assert(
              !(await readFile(file, "utf8")).includes("sourceMappingURL"),
            );
          if (file.endsWith(".svelte"))
            for (const generate of ["client", "server"] as const)
              compile(await readFile(file, "utf8"), {
                generate,
                filename: file,
              });
          if (file.endsWith(".astro"))
            await transform(await readFile(file, "utf8"), { filename: file });
        }
      }
    }
    await audit(path);
  }
  const consumer = `import {createPickerStore as calendar} from '@salyra-ui/calendar';
import {createPickerStore as date} from '@salyra-ui/date-picker';
import {createPickerStore as time} from '@salyra-ui/time-picker';
import {createPickerStore as datetime} from '@salyra-ui/date-time-picker';
import {mountPicker} from '@salyra-ui/time-picker/vanilla';
const stores=[calendar({referenceDate:'2010-03-01',month:{year:2010,month:3}}),date({referenceDate:'2010-03-01'}),time({referenceDate:'2010-03-01'}),datetime({referenceDate:'2010-03-01'})];
if(stores[0].getMonth().weeks[0][0].date!=='2010-03-01')throw Error('Wrong packaged calendar');
if(stores.map(s=>s.getSnapshot().options.kind).join()!=='date,date,time,datetime')throw Error('Wrong defaults');
stores[1].selectDate('2010-03-09');if(stores[1].getSnapshot().value.date!=='2010-03-09')throw Error('Wrong date selection');
stores[2].setTime('23:30');if(stores[2].getSnapshot().value.time!=='23:30')throw Error('Wrong time selection');
if(typeof mountPicker!=='function')throw Error('Missing mount');`;
  await writeFile(join(directory, "consumer.mjs"), consumer);
  execFileSync(process.execPath, ["consumer.mjs"], {
    cwd: directory,
    stdio: "pipe",
  });
  const bundle = await build({
    entryPoints: [join(directory, "consumer.mjs")],
    bundle: true,
    write: false,
    metafile: true,
    platform: "browser",
    format: "esm",
  });
  const inputs = Object.keys(bundle.metafile!.inputs);
  assert(inputs.every((p) => !/(react|vue|svelte|angular|astro)\//.test(p)));
  assert.equal(
    inputs.filter((p) => p.endsWith("/calendar/dist/core/index.js")).length,
    1,
    "Core must be shared once",
  );
  // Compile every installed framework entry using the release archives, not workspace source aliases.
  const peers = [
    "react",
    "react-dom",
    "vue",
    "svelte",
    "@angular/core",
    "@angular/common",
  ];
  for (const slug of slugs)
    for (const adapter of ["react", "vue", "angular", "svelte"]) {
      const file = join(directory, `${slug}-${adapter}.ts`);
      await writeFile(
        file,
        `import * as components from '@salyra-ui/${slug}/${adapter}';console.log(components);`,
      );
      await build({
        entryPoints: [file],
        bundle: true,
        write: false,
        format: "esm",
        platform: "neutral",
        external: peers,
        plugins: [
          {
            name: "svelte-compiler",
            setup(b) {
              b.onLoad({ filter: /\.svelte$/ }, async (args) => ({
                contents: compile(await readFile(args.path, "utf8"), {
                  generate: "client",
                  filename: args.path,
                }).js.code,
                loader: "js",
              }));
            },
          },
        ],
      });
    }
  // The DateTime root and both field families must share the actual packaged React context.
  for (const peer of ["react", "react-dom"])
    await symlink(
      resolve("node_modules", peer),
      join(directory, "node_modules", peer),
      "dir",
    );
  const reactFile = join(directory, "react-test.tsx");
  await writeFile(
    reactFile,
    `import React from 'react';import {renderToString} from 'react-dom/server';
import {DateTimePicker} from '@salyra-ui/date-time-picker/react';
const html=renderToString(<DateTimePicker.Root value={{date:'2010-03-09',time:'13:45'}} referenceDate="2010-03-01"><DateTimePicker.Field/><DateTimePicker.Time/></DateTimePicker.Root>);
if(!html.includes('2010-03-09')||!html.includes('45'))throw Error('Separate packages lost context');`,
  );
  await build({
    entryPoints: [reactFile],
    outfile: join(directory, "react-test.mjs"),
    bundle: true,
    platform: "node",
    format: "esm",
    external: ["react", "react-dom/server"],
  });
  execFileSync(process.execPath, ["react-test.mjs"], {
    cwd: directory,
    stdio: "pipe",
  });
  console.log(
    "Four fresh archive installs, package dependencies, kind defaults, shared React context, all adapter graphs, compact components and sourcemap audits passed",
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}

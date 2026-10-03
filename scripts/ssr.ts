import { strict as assert } from "node:assert";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import React from "react";
import { renderToString } from "react-dom/server";
import { createSSRApp, h } from "vue";
import { renderToString as renderVue } from "@vue/server-renderer";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import { Calendar as ReactCalendar } from "../packages/calendar/src/react";
import { Calendar as VueCalendar } from "../packages/calendar/src/vue";
import { renderAngular } from "../tests/angular-ssr";
const output = resolve("artifacts/ssr");
await mkdir(output, { recursive: true });
for (const file of await readdir("packages/calendar/src/svelte"))
  if (file.endsWith(".svelte")) {
    const source = await readFile(
      `packages/calendar/src/svelte/${file}`,
      "utf8",
    );
    let js = compile(source, { generate: "server", filename: file }).js.code;
    js = js
      .replace(/(['"])(\.\/[^'"]+)\.svelte\1/g, "$1$2.mjs$1")
      .replace(
        /(['"])\.\.\/core\1/g,
        JSON.stringify(
          pathToFileURL(resolve("packages/calendar/src/core/index.ts")).href,
        ),
      )
      .replace(
        /(['"])\.\/context\1/g,
        JSON.stringify(
          pathToFileURL(resolve("packages/calendar/src/svelte/context.ts"))
            .href,
        ),
      );
    await writeFile(`${output}/${file.replace(".svelte", ".mjs")}`, js);
  }
const app = `<script lang="ts">import Root from './Root.svelte';import View from './CalendarView.svelte';let {date}=$props();const options={value:{date},referenceDate:date,month:{year:2010,month:3}};</script><Root {options}><View/></Root>`;
const compiled = compile(app, { generate: "server", filename: "App.svelte" })
  .js.code.replaceAll("./Root.svelte", "./Root.mjs")
  .replaceAll("./CalendarView.svelte", "./CalendarView.mjs");
await writeFile(`${output}/App.mjs`, compiled);
const { default: SvelteApp } = await import(
  pathToFileURL(`${output}/App.mjs`).href
);
for (const date of ["2010-03-09", "2010-03-12"]) {
  const options = {
    referenceDate: date,
    value: { date },
    month: { year: 2010, month: 3 },
  };
  const react = renderToString(
    React.createElement(ReactCalendar.Root, {
      ...options,
      children: React.createElement(ReactCalendar.View),
    }),
  );
  const vue = await renderVue(
    createSSRApp({
      render: () => h(VueCalendar.Root, { options }, () => h(VueCalendar.View)),
    }),
  );
  const svelte = render(SvelteApp, { props: { date } }).body;
  const angular = await renderAngular(date);
  for (const [name, html] of Object.entries({ react, vue, svelte, angular })) {
    assert(html.includes("March 2010"), `${name}: missing SSR grid`);
    assert(html.includes(`data-date="${date}"`), `${name}: missing date`);
    assert(
      html.includes("data-selected"),
      `${name}: missing initial selection`,
    );
  }
}
console.log(
  "React, Vue, Svelte and Angular: initial calendar selection and SSR request isolation passed",
);

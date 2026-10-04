import { readFile } from "node:fs/promises";
import { test, expect, type Locator } from "@playwright/test";
async function chooseDate(
  host: Locator,
  endpoint: "start" | "end",
  date: string,
) {
  const control = host.locator(
    `[data-choice-picker="date"][data-endpoint="${endpoint}"]`,
  );
  const trigger = control.locator(".picker-control-trigger");
  await trigger.click();
  await control.locator(`[data-day-trigger][data-date="${date}"]`).click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toHaveAttribute("data-value", date);
}
async function chooseTime(
  host: Locator,
  endpoint: "start" | "end",
  parts: { hour?: number; minute?: number; second?: number; period?: string },
) {
  const control = host.locator(
    `[data-choice-picker="time"][data-endpoint="${endpoint}"]`,
  );
  await control.locator(".picker-control-trigger").click();
  for (const [part, value] of Object.entries(parts))
    await control
      .locator(`[data-time-choice="${part}"][data-value="${value}"]`)
      .click();
  await control.getByRole("button", { name: "Done", exact: true }).click();
}

test("date range keeps a draft, normalizes clicks and exports only dates", async ({
  page,
}) => {
  await page.goto("/");
  const host = page.locator("#picker-host");
  await host
    .locator('[data-day-trigger][data-date="2026-10-20"]')
    .first()
    .click();
  await host
    .locator('[data-day-trigger][data-date="2026-10-10"]')
    .first()
    .hover();
  await expect(
    host.locator('[data-part="cell"][data-in-range]'),
  ).not.toHaveCount(0);
  await host
    .locator('[data-day-trigger][data-date="2026-10-10"]')
    .first()
    .click();
  await expect(page.locator("#applied")).not.toContainText("2026-10-10");
  await host.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator("#applied")).toContainText("2026-10-10");
  await expect(page.locator("#applied")).toContainText("2026-10-20");
  await expect(page.locator("#applied")).not.toContainText("time");
});
test("historical navigation, week start and outside cells reflect the actual month", async ({
  page,
}) => {
  await page.goto("/");
  const grid = page.locator("#history-calendar");
  await expect(
    grid.locator("tbody tr").first().locator("[data-day-trigger]").first(),
  ).toHaveAttribute("data-date", "2010-03-01");
  await page.locator("#week-start").selectOption("0");
  await expect(
    grid.locator("tbody tr").first().locator("[data-day-trigger]").first(),
  ).toHaveAttribute("data-date", "2010-02-28");
  await page.locator("#outside").selectOption("hidden");
  await expect(grid.locator("[data-outside]")).toHaveCount(0);
  await page.locator("#fixed").check();
  await expect(grid.locator("tbody tr")).toHaveCount(6);
  await page.locator("#year").fill("2000");
  await page.locator("#month").selectOption("2");
  await expect(
    grid.locator('[data-day-trigger][data-date="2000-02-29"]'),
  ).toHaveCount(1);
});
test("time range ends on an explicit later date", async ({ page }) => {
  await page.goto("/");
  await page.locator("#kind").selectOption("time");
  const host = page.locator("#picker-host");
  await chooseDate(host, "start", "2026-10-03");
  await chooseTime(host, "start", { hour: 22 });
  await chooseDate(host, "end", "2026-10-06");
  await chooseTime(host, "end", { hour: 9, minute: 30 });
  await host.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator("#applied")).toContainText("2026-10-06");
  await expect(page.locator("#applied")).toContainText("09:30");
});
test("datetime on one day uses separate endpoint time pickers", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#kind").selectOption("datetime");
  const host = page.locator("#picker-host");
  await host
    .locator('[data-day-trigger][data-date="2026-10-03"]')
    .first()
    .click();
  await host
    .locator('[data-day-trigger][data-date="2026-10-03"]')
    .first()
    .click();
  await chooseTime(host, "start", { hour: 9 });
  await chooseTime(host, "end", { hour: 17 });
  await host.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator("#applied")).toContainText("09:00");
  await expect(page.locator("#applied")).toContainText("17:00");
});
test("event editor saves a multi-day date-time interval and reopens it without selecting a day", async ({
  page,
}) => {
  await page.goto("/");
  const editor = page.locator("#event-editor");
  await page
    .locator('#event-calendar [data-day-trigger][data-date="2026-10-09"]')
    .click();
  await expect(page.locator("#event-action")).toHaveText(
    "New event on 2026-10-09",
  );
  await expect(
    editor.locator(
      '[data-choice-picker="date"][data-endpoint="start"] .picker-control-trigger',
    ),
  ).toHaveAttribute("data-value", "2026-10-09");
  await page.locator('#event-form [name="title"]').fill("Review");
  await chooseDate(editor, "end", "2026-10-11");
  await chooseTime(editor, "start", { hour: 12 });
  await chooseTime(editor, "end", { hour: 16, minute: 30 });
  await page
    .locator("#event-form")
    .getByRole("button", { name: "Add event", exact: true })
    .click();
  await expect(page.locator("#event-action")).toHaveText("Added event: Review");
  await expect(page.locator("#event-calendar [data-event-id]")).toHaveCount(3);
  const exported = JSON.parse(
    (await page.locator("#event-export").textContent()) ?? "{}",
  );
  expect(exported.start).toEqual({ date: "2026-10-09", time: "12:00" });
  expect(exported.end).toEqual({ date: "2026-10-11", time: "16:30" });
  await page
    .locator(
      '#event-calendar [data-part="cell"][data-date="2026-10-10"] [data-event-id]',
    )
    .click();
  await expect(page.locator("#event-action")).toHaveText(
    "Editing event: Review",
  );
  await expect(
    editor.locator(
      '[data-choice-picker="date"][data-endpoint="end"] .picker-control-trigger',
    ),
  ).toHaveAttribute("data-value", "2026-10-11");
  await chooseTime(editor, "end", { hour: 18 });
  await page
    .locator("#event-form")
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(page.locator("#event-action")).toHaveText(
    "Updated event: Review",
  );
  await expect(page.locator("#event-calendar [data-event-id]")).toHaveCount(3);
  await expect(
    page.locator('#event-calendar [aria-selected="true"]'),
  ).toHaveCount(0);
});
test("all weekdays including each weekend have independent names and classes", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByText("Weekday names and classes", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Saturday name", exact: true })
    .fill("Sat off");
  await page
    .getByRole("textbox", { name: "Saturday class", exact: true })
    .fill("weekday-blue");
  await page
    .getByRole("textbox", { name: "Sunday name", exact: true })
    .fill("Sun rest");
  await page
    .getByRole("textbox", { name: "Sunday class", exact: true })
    .fill("weekday-bold");
  await page
    .getByRole("textbox", { name: "Monday name", exact: true })
    .fill("Work");
  const saturday = page.locator('#event-calendar [data-weekday="6"]'),
    sunday = page.locator('#event-calendar [data-weekday="0"]');
  await expect(saturday).toHaveText("Sat off");
  await expect(saturday).toHaveClass("weekday-blue");
  await expect(sunday).toHaveText("Sun rest");
  await expect(sunday).toHaveClass("weekday-bold");
  await expect(page.locator('#event-calendar [data-weekday="1"]')).toHaveText(
    "Work",
  );
  await page
    .locator("#event-navigation")
    .getByRole("button", { name: "Next month", exact: true })
    .click();
  await expect(saturday).toHaveText("Sat off");
  await expect(sunday).toHaveClass("weekday-bold");
});
test("invalid event endpoints stay out of the calendar and a midnight end does not occupy its ending day", async ({
  page,
}) => {
  await page.goto("/");
  const editor = page.locator("#event-editor");
  await page.locator('#event-form [name="title"]').fill("Night shift");
  await chooseDate(editor, "end", "2026-10-08");
  await page
    .locator("#event-form")
    .getByRole("button", { name: "Add event", exact: true })
    .click();
  await expect(page.locator("#event-calendar [data-event-id]")).toHaveCount(0);
  await expect(page.locator("#event-error")).not.toBeEmpty();
  await chooseDate(editor, "end", "2026-10-10");
  await chooseTime(editor, "end", { hour: 0, minute: 0 });
  await page
    .locator("#event-form")
    .getByRole("button", { name: "Add event", exact: true })
    .click();
  await expect(page.locator("#event-action")).toHaveText(
    "Added event: Night shift",
  );
  await expect(page.locator("#event-calendar [data-event-id]")).toHaveCount(1);
  await expect(
    page.locator(
      '#event-calendar [data-part="cell"][data-date="2026-10-10"] [data-event-id]',
    ),
  ).toHaveCount(0);
});
test("keyboard crosses months and popup Escape returns focus", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#open-popup").click();
  const button = page.locator(
    '#popup-calendar [data-day-trigger][tabindex="0"]',
  );
  await expect(button).toBeFocused();
  await button.press("PageDown");
  await expect(page.locator("#popup-calendar h3")).toContainText("April 2010");
  await page.keyboard.press("Escape");
  await expect(page.locator("#popup")).toBeHidden();
  await expect(page.locator("#open-popup")).toBeFocused();
});
test("disabled blocks editing and the page fits a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#disabled").check();
  await expect(
    page.locator("#picker-host [data-day-trigger]").first(),
  ).toBeDisabled();
  await expect(
    page.locator("#picker-host .picker-control-trigger").first(),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("continuous scrolling keeps the DOM bounded and follows the visible month", async ({
  page,
}) => {
  await page.goto("/");
  const scroll = page.locator("#continuous-calendar");
  expect(await scroll.locator(".sp-month").count()).toBeLessThanOrEqual(5);
  await scroll.evaluate((el) => {
    el.scrollTop += 340 * 120;
  });
  await page.waitForTimeout(100);
  expect(await scroll.locator(".sp-month").count()).toBeLessThanOrEqual(5);
  await expect(scroll.locator("h3").first()).toContainText("2036");
});

test("12-hour time picker includes seconds and exports a 24-hour value", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#kind").selectOption("time");
  await page.locator("#selection").selectOption("single");
  await page.locator("#clock").selectOption("12");
  await page.locator("#seconds").check();
  const host = page.locator("#picker-host");
  await chooseTime(host, "start", { hour: 3, period: "PM", second: 45 });
  await host.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator("#applied")).toContainText("15:00:45");
});

test("documentation switches only its code block and keeps tables inside a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs.html");
  await page.getByRole("tab", { name: "Svelte", exact: true }).click();
  await expect(page.locator("#source")).toContainText(
    "@salyra-ui/date-time-picker/svelte",
  );
  await page.getByRole("tab", { name: "Vue", exact: true }).click();
  await expect(page.locator("#source")).toContainText(
    "@salyra-ui/date-time-picker/vue",
  );
  await expect(page.locator("#source")).not.toContainText(
    "@salyra-ui/date-time-picker/svelte",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const name of ["picker-controls.ts", "picker-controls.css"]) {
    const pending = page.waitForEvent("download");
    await page
      .getByRole("button", { name: `Download ${name}`, exact: true })
      .click();
    const download = await pending;
    expect(download.suggestedFilename()).toBe(name);
    const content = await readFile((await download.path())!, "utf8");
    expect(content).toContain(
      name.endsWith(".ts") ? "mountEndpointPickers" : ".endpoint-popup",
    );
  }
  const assets = page.locator("#vanilla-assets a[download]");
  await expect(assets).toHaveCount(16);
  for (const asset of await assets.all()) {
    const href = await asset.getAttribute("href");
    expect(href).toMatch(
      /^\/downloads\/(calendar|date-picker|time-picker|date-time-picker)\/.+\.(js|css)$/,
    );
    const response = await page.request.get(href!);
    expect(response.ok()).toBe(true);
    expect(await response.text()).not.toContain("sourceMappingURL");
  }
  await expect(page.locator("#setup")).toContainText(
    "npm install @salyra-ui/date-picker",
  );
  await expect(page.locator("#setup")).not.toContainText(".tgz");
});

test("manual time segments preserve seconds when the ready-made seconds control is hidden", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async (modulePath) => {
    const core = await import(modulePath),
      store = core.createPickerStore({
        kind: "time",
        referenceDate: "2026-10-03",
        value: { time: "09:30:45" },
      });
    const hour = document.createElement("input"),
      second = document.createElement("input");
    document.body.append(hour, second);
    const cleanupHour = core.bindTimeSegment(hour, store, "hour"),
      cleanupSecond = core.bindTimeSegment(second, store, "second");
    hour.value = "11";
    hour.dispatchEvent(new Event("input"));
    const afterHour = store.getSnapshot().value.time;
    second.value = "50";
    second.dispatchEvent(new Event("input"));
    const afterSecond = store.getSnapshot().value.time;
    cleanupHour();
    cleanupSecond();
    hour.remove();
    second.remove();
    store.destroy();
    return { afterHour, afterSecond };
  }, "/packages/calendar/src/core/index.ts");
  expect(result).toEqual({ afterHour: "11:30:45", afterSecond: "11:30:50" });
});

test("a segmented clock can reach a minimum time without choosing a temporary later hour", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async (modulePath) => {
    const core = await import(modulePath),
      store = core.createPickerStore({
        kind: "time",
        referenceDate: "2026-10-03",
        minTime: "09:30",
      });
    const hour = document.createElement("input"),
      minute = document.createElement("input");
    document.body.append(hour, minute);
    const stopHour = core.bindTimeSegment(hour, store, "hour"),
      stopMinute = core.bindTimeSegment(minute, store, "minute");
    hour.value = "9";
    hour.dispatchEvent(new Event("input"));
    const pending = store.getSnapshot().value;
    minute.value = "30";
    minute.dispatchEvent(new Event("input"));
    const value = store.getSnapshot().value,
      invalid = hour.getAttribute("aria-invalid");
    stopHour();
    stopMinute();
    hour.remove();
    minute.remove();
    store.destroy();
    return { pending, value, invalid };
  }, "/packages/calendar/src/core/index.ts");
  expect(result).toEqual({
    pending: null,
    value: { time: "09:30" },
    invalid: "false",
  });
});

test("endpoint popups keep the draft on Escape and outside click, with one popup open at a time", async ({
  page,
}) => {
  await page.goto("/");
  const host = page.locator("#picker-host");
  await chooseDate(host, "start", "2026-10-09");
  await chooseDate(host, "end", "2026-10-11");
  const savedDraft = await page.locator("#draft").textContent();
  const start = host.locator(
    '[data-choice-picker="date"][data-endpoint="start"]',
  );
  const end = host.locator('[data-choice-picker="date"][data-endpoint="end"]');
  await start.locator(".picker-control-trigger").click();
  await expect(start.locator('[data-day-trigger][tabindex="0"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(start.locator(".endpoint-popup")).toBeHidden();
  await expect(start.locator(".picker-control-trigger")).toBeFocused();
  await expect(page.locator("#draft")).toHaveText(savedDraft!);
  await start.locator(".picker-control-trigger").click();
  await end.locator(".picker-control-trigger").click();
  await expect(host.locator(".endpoint-popup:visible")).toHaveCount(1);
  await expect(start.locator(".endpoint-popup")).toBeHidden();
  await page.locator("#draft").click();
  await expect(end.locator(".endpoint-popup")).toBeHidden();
  await expect(page.locator("#draft")).toHaveText(savedDraft!);
  expect(JSON.parse((await page.locator("#applied").textContent())!)).toEqual({
    start: null,
    end: null,
  });
});

test("clock choices support arrows and keep edited time when the popup closes", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#kind").selectOption("time");
  await page.locator("#selection").selectOption("single");
  const control = page.locator('#picker-host [data-choice-picker="time"]');
  await control.locator(".picker-control-trigger").click();
  await expect(
    control.locator('[data-time-choice="hour"][data-value="0"]'),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    control.locator('[data-time-choice="hour"][data-value="1"]'),
  ).toBeFocused();
  await expect(
    control.locator('[data-time-choice="hour"][data-value="1"]'),
  ).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");
  await expect(control.locator(".picker-control-trigger")).toHaveAttribute(
    "data-value",
    "01:00",
  );
  await control.locator(".picker-control-trigger").click();
  await expect(
    control.locator('[data-time-choice="hour"][data-value="1"]'),
  ).toHaveAttribute("aria-checked", "true");
  await page.locator("#disabled").check();
  await expect(control.locator(".endpoint-popup")).toBeHidden();
  await expect(control.locator(".picker-control-trigger")).toBeDisabled();
});

test("date and time popups fit a phone viewport without native date or time inputs", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const editor = page.locator("#event-editor");
  expect(await editor.locator("input").count()).toBe(0);
  for (const part of ["date", "time"]) {
    const control = editor.locator(
      `[data-choice-picker="${part}"][data-endpoint="end"]`,
    );
    await control.locator(".picker-control-trigger").click();
    const bounds = await control.locator(".endpoint-popup").boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
    await page.keyboard.press("Escape");
  }
});

test("every working example has independent Preview and Code tabs with its real files", async ({
  page,
}) => {
  await page.goto("/");
  const examples = [
    ["picker", "interval-picker.ts", "mountIntervalPicker"],
    ["historical", "historical-calendar.ts", "mountHistoricalCalendar"],
    ["events", "event-calendar.ts", "mountEventCalendar"],
    ["scrolling", "scrolling-calendar.ts", "mountScrollingCalendar"],
  ];
  for (const [id, file, entry] of examples) {
    const section = page.locator(`#${id}`);
    await section.getByRole("tab", { name: "Code", exact: true }).click();
    await expect(section.locator(".example-preview")).toBeHidden();
    await expect(section.locator(".example-source")).toContainText(entry);
    await section.getByRole("tab", { name: file, exact: true }).click();
    await expect(section.locator(".example-source")).toContainText(
      `export function ${entry}`,
    );
    await section
      .getByRole("tab", { name: "demo-styles.css", exact: true })
      .click();
    await expect(section.locator(".example-source")).toContainText(
      ".example-preview",
    );
    await section.getByRole("tab", { name: "Preview", exact: true }).click();
    await expect(section.locator(".example-preview")).toBeVisible();
    await expect(page.locator(".example-code:visible")).toHaveCount(0);
  }
});

test("preview selections survive code navigation and source copy/download follows the selected file", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const section = page.locator("#picker");
  await chooseDate(section, "start", "2026-10-09");
  const draft = await page.locator("#draft").textContent();
  await section.getByRole("tab", { name: "Code", exact: true }).click();
  await section
    .getByRole("tab", { name: "picker-controls.ts", exact: true })
    .click();
  await section.getByRole("button", { name: "Copy code", exact: true }).click();
  await expect(section.getByRole("status")).toContainText(
    "picker-controls.ts copied.",
  );
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("export function mountEndpointPickers");
  const pending = page.waitForEvent("download");
  await section
    .getByRole("button", { name: "Download file", exact: true })
    .click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe("picker-controls.ts");
  expect(await readFile((await download.path())!, "utf8")).toBe(copied);
  await section.getByRole("tab", { name: "Preview", exact: true }).click();
  await expect(page.locator("#draft")).toHaveText(draft!);
  await expect(
    section.locator(
      '[data-choice-picker="date"][data-endpoint="start"] .picker-control-trigger',
    ),
  ).toHaveAttribute("data-value", "2026-10-09");
  await expect(
    section.getByRole("tab", { name: "Preview", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
});

test("example view and file tabs support arrow navigation on a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const section = page.locator("#events");
  await section.getByRole("tab", { name: "Preview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    section.getByRole("tab", { name: "Code", exact: true }),
  ).toBeFocused();
  const first = section.getByRole("tab", { name: "example.ts", exact: true });
  await first.focus();
  await page.keyboard.press("End");
  await expect(
    section.getByRole("tab", { name: "picker-controls.css", exact: true }),
  ).toBeFocused();
  await expect(section.locator(".example-source")).toContainText(
    ".endpoint-popup",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator("#historical .example-preview")).toBeVisible();
});

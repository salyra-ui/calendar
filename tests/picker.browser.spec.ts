import { test, expect } from "@playwright/test";
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
  await host
    .locator('[data-date-field][data-endpoint="start"]')
    .fill("2026-10-03");
  await host.getByRole("spinbutton", { name: "start hours" }).fill("22");
  await host
    .locator('[data-date-field][data-endpoint="end"]')
    .fill("2026-10-06");
  await host.getByRole("spinbutton", { name: "end hours" }).fill("9");
  await host.getByRole("spinbutton", { name: "end minutes" }).fill("30");
  await host.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator("#applied")).toContainText("2026-10-06");
  await expect(page.locator("#applied")).toContainText("09:30");
});
test("datetime on one day can be completed segment by segment", async ({
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
  await host.getByRole("spinbutton", { name: "start hours" }).fill("9");
  await host.getByRole("spinbutton", { name: "end hours" }).fill("17");
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
    editor.locator('[data-date-field][data-endpoint="start"]'),
  ).toHaveValue("2026-10-09");
  await page.locator('#event-form [name="title"]').fill("Review");
  await editor
    .locator('[data-date-field][data-endpoint="end"]')
    .fill("2026-10-11");
  await editor
    .getByRole("spinbutton", { name: "start hours", exact: true })
    .fill("12");
  await editor
    .getByRole("spinbutton", { name: "end hours", exact: true })
    .fill("16");
  await editor
    .getByRole("spinbutton", { name: "end minutes", exact: true })
    .fill("30");
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
    editor.locator('[data-date-field][data-endpoint="end"]'),
  ).toHaveValue("2026-10-11");
  await editor
    .getByRole("spinbutton", { name: "end hours", exact: true })
    .fill("18");
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
  await editor
    .locator('[data-date-field][data-endpoint="end"]')
    .fill("2026-10-08");
  await page
    .locator("#event-form")
    .getByRole("button", { name: "Add event", exact: true })
    .click();
  await expect(page.locator("#event-calendar [data-event-id]")).toHaveCount(0);
  await expect(page.locator("#event-error")).not.toBeEmpty();
  await editor
    .locator('[data-date-field][data-endpoint="end"]')
    .fill("2026-10-10");
  await editor
    .getByRole("spinbutton", { name: "end hours", exact: true })
    .fill("0");
  await editor
    .getByRole("spinbutton", { name: "end minutes", exact: true })
    .fill("0");
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

test("12-hour time input includes seconds and exports a 24-hour value", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#kind").selectOption("time");
  await page.locator("#selection").selectOption("single");
  await page.locator("#clock").selectOption("12");
  await page.locator("#seconds").check();
  const host = page.locator("#picker-host");
  await host.getByRole("spinbutton", { name: "start hours" }).fill("3");
  await host.getByRole("combobox", { name: "start period" }).selectOption("PM");
  await host.getByRole("spinbutton", { name: "start seconds" }).fill("45");
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
  for (const name of [
    "Calendar archive",
    "Date Picker archive",
    "Time Picker archive",
    "Date Time Picker archive",
  ]) {
    const href = await page
      .getByRole("link", { name, exact: true })
      .getAttribute("href");
    expect((await page.request.get(href!)).ok()).toBe(true);
  }
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

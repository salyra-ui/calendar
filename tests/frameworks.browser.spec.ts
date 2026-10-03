import { test, expect } from "@playwright/test";
for (const framework of ["react", "svelte", "vue", "angular"])
  test(`${framework} shares range state and keeps event actions separate`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/framework.html?framework=${framework}`);
    const surface = page
      .locator('[data-part="calendar"], [spCalendar]')
      .first();
    await expect(surface.locator("h3")).toHaveText("March 2010");
    await surface.locator('[data-day-trigger][data-date="2010-03-09"]').click();
    await surface.locator('[data-day-trigger][data-date="2010-03-12"]').click();
    await page
      .getByRole("button", { name: "Apply", exact: true })
      .first()
      .click();
    await expect(page.locator("#value")).toContainText("2010-03-09");
    await expect(page.locator("#value")).toContainText("2010-03-12");
    await page.getByRole("button", { name: "Open event", exact: true }).click();
    await expect(page.locator("#event-result")).toHaveText("Opened event");
    await expect(page.locator("#value")).toContainText("2010-03-12");
    expect(errors).toEqual([]);
  });
test("Astro seeds its server grid and applies a client range", async ({
  page,
  request,
}) => {
  const url = "http://127.0.0.1:4331/";
  const response = await request.get(url);
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain("March 2010");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page.locator('[data-day-trigger][data-date="2010-03-09"]').click();
  await page.locator('[data-day-trigger][data-date="2010-03-12"]').click();
  await page
    .getByRole("button", { name: "Apply", exact: true })
    .first()
    .click();
  await expect(page.locator("#value")).toContainText("2010-03-09");
  await expect(page.locator("#value")).toContainText("2010-03-12");
  expect(errors).toEqual([]);
});

for (const framework of ["react", "svelte", "vue", "angular", "astro"])
  test(`${framework} datetime root preserves both date and time`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(
      framework === "astro"
        ? "http://127.0.0.1:4331/"
        : `/framework.html?framework=${framework}`,
    );
    const editor = page.locator("#dt-editor");
    await editor
      .getByRole("spinbutton", { name: "Hours", exact: true })
      .fill("17");
    await editor.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page.locator("#dt-value")).toContainText("2010-03-09");
    await expect(page.locator("#dt-value")).toContainText("17:30");
    expect(errors).toEqual([]);
  });

test("nested Astro roots keep calendar actions and values isolated", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:4331/nested");
  await page
    .locator('#outer [data-day-trigger][data-date="2010-03-12"]')
    .click();
  await expect(page.locator("#outer-value")).toContainText("2010-03-12");
  await page
    .locator('#inner [data-day-trigger][data-date="2026-10-09"]')
    .click();
  await expect(page.locator("#inner-value")).toContainText("2026-10-09");
  await expect(page.locator("#outer-value")).toContainText("2010-03-12");
  await page
    .locator('#outer [data-day-trigger][data-date="2010-03-20"]')
    .click();
  await expect(page.locator("#outer-value")).toContainText("2010-03-20");
  await expect(page.locator("#inner-value")).toContainText("2026-10-09");
});

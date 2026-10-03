import { it, expect } from "vitest";
import { createPickerStore, calendarMarkup } from "@salyra-ui/calendar";
it("maps independent weekday presentation by day rather than column and escapes its text and classes", () => {
  const store = createPickerStore({
    referenceDate: "2010-03-01",
    weekStartsOn: 0,
  });
  const html = calendarMarkup(store, {
    weekdays: {
      6: {
        label: "Sat <off>",
        class: 'blue" onclick="bad',
        ariaLabel: "Saturday",
      },
      0: { label: "Rest", class: "bold" },
    },
  });
  expect(html).toContain(
    'data-weekday="6" class="blue&quot; onclick=&quot;bad"',
  );
  expect(html).toContain("Sat &lt;off&gt;");
  expect(html).toContain('data-weekday="0" class="bold"');
  expect(html).toContain(">Rest</th>");
  expect(html.indexOf('data-weekday="0"')).toBeLessThan(
    html.indexOf('data-weekday="6"'),
  );
  store.setOptions({ weekStartsOn: 1 });
  const mondayFirst = calendarMarkup(store, {
    weekdays: { 0: { label: "Rest", class: "bold" } },
  });
  expect(mondayFirst).toContain('data-weekday="0" class="bold"');
  expect(mondayFirst.indexOf('data-weekday="1"')).toBeLessThan(
    mondayFirst.indexOf('data-weekday="0"'),
  );
});

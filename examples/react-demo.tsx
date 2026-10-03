import { DatePicker as Picker } from "@salyra-ui/date-picker/react";
import { DateTimePicker } from "@salyra-ui/date-time-picker/react";
import { createRoot } from "react-dom/client";
import {
  Calendar,
  usePickerStore,
  useCalendarMonth,
  createPickerStore,
} from "@salyra-ui/calendar/react";
const store = createPickerStore({
  selection: "range",
  referenceDate: "2026-10-03",
  month: { year: 2010, month: 3 },
  commit: "explicit",
});
function Custom() {
  const month = useCalendarMonth();
  return (
    <Calendar.Grid aria-label="Custom month">
      {month.weeks.map((week, i) => (
        <Calendar.Week key={i}>
          {week.map((day) =>
            day.hidden ? null : (
              <Calendar.Cell
                key={day.date}
                date={day.date}
                outside={day.outside}
              >
                <Calendar.DayTrigger date={day.date} outside={day.outside}>
                  <Calendar.Number date={day.date} />
                  <span className="custom-dot" />
                </Calendar.DayTrigger>
                {day.date === "2010-03-09" && (
                  <button
                    onClick={() =>
                      (document.querySelector("#event-result")!.textContent =
                        "Opened event")
                    }
                  >
                    Open event
                  </button>
                )}
              </Calendar.Cell>
            ),
          )}
        </Calendar.Week>
      ))}
    </Calendar.Grid>
  );
}
function App() {
  return (
    <main style={{ padding: 40 }}>
      <h1>React</h1>
      <Picker.Root store={store}>
        <Picker.MonthSelect aria-label="Month" />
        <Picker.YearSelect aria-label="Year" />
        <Picker.Calendar className="sp-calendar" />
        <Picker.Action action="apply">Apply</Picker.Action>
        <Picker.Output id="value" />
        <Custom />
        <p id="event-result" />
      </Picker.Root>
      <section id="custom-click">
        <h2>Your click action</h2>
        <Calendar.Root
          referenceDate="2010-03-01"
          month={{ year: 2010, month: 3 }}
        >
          <Calendar.View
            className="sp-calendar"
            weekdays={{
              6: { label: "Saturday off", class: "weekday-red" },
              0: { label: "Sunday rest", class: "weekday-bold" },
            }}
            onClick={(event) => {
              const day = (event.target as Element).closest<HTMLElement>(
                "[data-day-trigger]",
              );
              if (!day) return;
              event.preventDefault();
              document.querySelector("#click-result")!.textContent =
                `Opened date: ${day.dataset.date}`;
            }}
          />
          <output id="click-result" />
          <Calendar.Output id="click-value" />
        </Calendar.Root>
      </section>
      <section id="dt-editor">
        <DateTimePicker.Root
          referenceDate="2010-03-09"
          commit="explicit"
          defaultValue={{ date: "2010-03-09", time: "09:30" }}
        >
          <DateTimePicker.Time />
          <DateTimePicker.Action action="apply">Apply</DateTimePicker.Action>
          <DateTimePicker.Output id="dt-value" />
        </DateTimePicker.Root>
      </section>
    </main>
  );
}
createRoot(document.querySelector("#app")!).render(<App />);

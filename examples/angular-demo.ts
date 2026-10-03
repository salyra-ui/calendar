import "@angular/compiler";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import {
  PickerRoot,
  CalendarView,
  DayTrigger,
  CalendarNumber,
  TimeSegmentField,
  createPickerStore,
} from "../src/angular";
@Component({
  selector: "date-demo",
  standalone: true,
  imports: [
    PickerRoot,
    CalendarView,
    DayTrigger,
    CalendarNumber,
    TimeSegmentField,
  ],
  template: `<main style="padding:40px">
    <h1>Angular</h1>
    <div [spRoot]="options" [store]="store">
      <div spCalendar class="sp-calendar"></div>
      <button (click)="store.apply(); value = store.getSnapshot().value">
        Apply</button
      ><output id="value">{{ json(value) }}</output
      ><button spDayTrigger="2010-03-09">
        <span spNumber="2010-03-09"></span
        ><span class="custom-dot"></span></button
      ><button (click)="event = 'Opened event'">Open event</button>
      <p id="event-result">{{ event }}</p>
    </div>
    <section id="dt-editor" [spRoot]="datetimeOptions" [store]="datetimeStore">
      <label>Hours<input type="number" spTimeSegment="hour" /></label
      ><label>Minutes<input type="number" spTimeSegment="minute" /></label
      ><button
        (click)="
          datetimeStore.apply();
          datetimeValue = datetimeStore.getSnapshot().value
        "
      >
        Apply</button
      ><output id="dt-value">{{ json(datetimeValue) }}</output>
    </section>
  </main>`,
})
class App {
  readonly options = {
    selection: "range",
    referenceDate: "2026-10-03",
    month: { year: 2010, month: 3 },
    commit: "explicit",
  } as const;
  readonly store = createPickerStore(this.options);
  value: unknown = null;
  event = "";
  json = JSON.stringify;
  readonly datetimeOptions = {
    kind: "datetime",
    commit: "explicit",
    referenceDate: "2010-03-09",
    defaultValue: { date: "2010-03-09", time: "09:30" },
  } as const;
  readonly datetimeStore = createPickerStore(this.datetimeOptions);
  datetimeValue: unknown = this.datetimeStore.getSnapshot().value;
}
document.querySelector("#app")!.innerHTML = "<date-demo></date-demo>";
await bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection()],
});

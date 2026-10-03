import "@angular/compiler";
import {
  Component,
  inject,
  InjectionToken,
  provideZonelessChangeDetection,
} from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import {
  renderApplication,
  provideServerRendering,
} from "@angular/platform-server";
import { PickerRoot, CalendarView, type PickerOptions } from "../src/angular";
const INITIAL = new InjectionToken<string>("Date");
@Component({
  selector: "ssr-test",
  standalone: true,
  imports: [PickerRoot, CalendarView],
  template: '<div [spRoot]="options"><div spCalendar></div></div>',
})
class App {
  readonly options: PickerOptions = {
    referenceDate: inject(INITIAL),
    value: { date: inject(INITIAL) },
    month: { year: 2010, month: 3 },
  };
}
export function renderAngular(date: string) {
  return renderApplication(
    (context) =>
      bootstrapApplication(
        App,
        {
          providers: [
            provideServerRendering(),
            provideZonelessChangeDetection(),
            { provide: INITIAL, useValue: date },
          ],
        },
        context,
      ),
    {
      document: "<html><body><ssr-test></ssr-test></body></html>",
      url: "http://localhost",
      allowedHosts: ["localhost"],
    },
  );
}

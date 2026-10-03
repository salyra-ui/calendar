import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  inject,
} from "@angular/core";
import {
  bindCalendar,
  type CalendarRenderOptions,
  calendarMarkup,
} from "../core";

import { PICKER_CONTEXT } from "./PickerRoot";
@Directive({ selector: "[spCalendar]", standalone: true })
export class CalendarView implements OnInit, OnDestroy {
  @Input("spCalendar") options: CalendarRenderOptions = {};
  private el = inject(ElementRef<HTMLElement>);
  private root = inject(PICKER_CONTEXT);
  private stop?: () => void;
  ngOnInit() {
    this.root.ngOnInit();
    if (typeof window === "undefined")
      this.el.nativeElement.innerHTML = calendarMarkup(
        this.root.store!,
        this.options,
      );
    else
      this.stop = bindCalendar(
        this.el.nativeElement,
        this.root.store!,
        this.options,
      );
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

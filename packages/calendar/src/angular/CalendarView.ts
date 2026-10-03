import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
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
export class CalendarView implements OnInit, OnChanges, OnDestroy {
  @Input("spCalendar") options: CalendarRenderOptions = {};
  private el = inject(ElementRef<HTMLElement>);
  private root = inject(PICKER_CONTEXT);
  private stop?: () => void;
  private started = false;
  ngOnInit() {
    this.root.ngOnInit();
    this.started = true;
    this.bind();
  }
  ngOnChanges() {
    if (this.started) this.bind();
  }
  private bind() {
    this.stop?.();
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

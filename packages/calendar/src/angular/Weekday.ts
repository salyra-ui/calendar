import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  inject,
} from "@angular/core";
import { attribute, weekdayLabels } from "../core";

import { PICKER_CONTEXT } from "./PickerRoot";
@Directive({ selector: "[spWeekday]", standalone: true })
export class Weekday implements OnInit, OnChanges, OnDestroy {
  @Input("spWeekday") day = 0;
  @Input() label?: string;
  private el = inject(ElementRef<HTMLElement>);
  private root = inject(PICKER_CONTEXT);
  private stop?: () => void;
  ngOnInit() {
    this.root.ngOnInit();
    this.update();
    this.stop = this.root.store!.subscribe(() => this.update());
  }
  ngOnChanges() {
    if (this.root.store) this.update();
  }
  private update() {
    const s = this.root.store!.getSnapshot();
    this.el.nativeElement.textContent =
      this.label ??
      weekdayLabels(s.options.locale, s.options.weekStartsOn).find(
        (d) => d.weekday === this.day,
      )?.label ??
      "";
    attribute(
      this.el.nativeElement,
      "data-weekend",
      s.options.weekend.includes(this.day),
    );
    attribute(this.el.nativeElement, "data-weekday", String(this.day));
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

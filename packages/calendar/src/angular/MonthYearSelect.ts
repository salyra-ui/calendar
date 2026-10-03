import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  inject,
} from "@angular/core";

import { PICKER_CONTEXT } from "./PickerRoot";
@Directive({
  selector: "select[spMonthSelect],select[spYearSelect]",
  standalone: true,
})
export class MonthYearSelect implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLSelectElement>);
  private root = inject(PICKER_CONTEXT);
  private stop?: () => void;
  ngOnInit() {
    this.root.ngOnInit();
    const element = this.el.nativeElement,
      key = element.hasAttribute("spMonthSelect") ? "month" : "year";
    const update = () => {
      element.value = String(this.root.store!.getSnapshot().visibleMonth[key]);
      element.disabled = !!this.root.store!.getSnapshot().options.disabled;
    };
    const change = () => {
      if (!element.disabled)
        this.root.store!.setVisibleMonth({
          ...this.root.store!.getSnapshot().visibleMonth,
          [key]: Number(element.value),
        });
    };
    update();
    const unsubscribe = this.root.store!.subscribe(update);
    if (typeof window !== "undefined")
      element.addEventListener("change", change);
    this.stop = () => {
      unsubscribe();
      element.removeEventListener("change", change);
    };
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

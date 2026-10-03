import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  inject,
} from "@angular/core";
import {
  bindMonthScroller,
  monthScrollerMarkup,
  type MonthScrollerOptions,
} from "../core";

import { PICKER_CONTEXT } from "./PickerRoot";
@Directive({ selector: "[spContinuous]", standalone: true })
export class Continuous implements OnInit, OnDestroy {
  @Input("spContinuous") options: MonthScrollerOptions = {};
  private el = inject(ElementRef<HTMLElement>);
  private root = inject(PICKER_CONTEXT);
  private stop?: () => void;
  ngOnInit() {
    this.root.ngOnInit();
    if (typeof window !== "undefined")
      this.stop = bindMonthScroller(
        this.el.nativeElement,
        this.root.store!,
        this.options,
      );
    else
      this.el.nativeElement.innerHTML = monthScrollerMarkup(
        this.root.store!,
        this.options,
      );
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

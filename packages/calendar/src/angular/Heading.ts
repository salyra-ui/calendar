import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  inject,
} from "@angular/core";
import { formatMonth } from "../core";

import { PICKER_CONTEXT } from "./PickerRoot";
@Directive({ selector: "[spHeading]", standalone: true })
export class Heading implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private root = inject(PICKER_CONTEXT);
  private stop?: () => void;
  ngOnInit() {
    this.root.ngOnInit();
    const update = () =>
      (this.el.nativeElement.textContent = formatMonth(
        this.root.store!.getSnapshot().visibleMonth,
        this.root.store!.getSnapshot().options.locale,
      ));
    update();
    this.stop = this.root.store!.subscribe(update);
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

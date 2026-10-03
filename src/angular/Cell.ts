import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  inject,
} from "@angular/core";
import { attribute, dayAttributes } from "../core";

import { PICKER_CONTEXT } from "./PickerRoot";
@Directive({ selector: "[spCell]", standalone: true })
export class Cell implements OnInit, OnChanges, OnDestroy {
  @Input("spCell") date = "";
  @Input() outside = false;
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
    this.el.nativeElement.setAttribute("role", "gridcell");
    for (const [key, value] of Object.entries(
      dayAttributes(this.root.store!, this.date, this.outside),
    ))
      attribute(this.el.nativeElement, key, value);
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

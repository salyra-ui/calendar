import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  inject,
} from "@angular/core";
import { bindDateField, type Endpoint, pointFor } from "../core";

import { PICKER_CONTEXT } from "./PickerRoot";
@Directive({ selector: "input[spDateField]", standalone: true })
export class DateField implements OnInit, OnChanges, OnDestroy {
  @Input("spDateField") endpoint: Endpoint = "start";
  private el = inject(ElementRef<HTMLInputElement>);
  private root = inject(PICKER_CONTEXT);
  private stop?: () => void;
  ngOnChanges() {
    if (this.root.store) this.bind();
  }
  ngOnInit() {
    this.bind();
  }
  private bind() {
    this.root.ngOnInit();
    this.stop?.();
    if (typeof window === "undefined")
      this.el.nativeElement.setAttribute(
        "value",
        pointFor(this.root.store!.getSnapshot().draft, this.endpoint)?.date ??
          "",
      );
    else
      this.stop = bindDateField(
        this.el.nativeElement,
        this.root.store!,
        this.endpoint,
      );
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

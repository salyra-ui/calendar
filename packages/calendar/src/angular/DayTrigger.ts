import {
  Directive,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  inject,
} from "@angular/core";
import { bindDayTrigger } from "../core";

import { PICKER_CONTEXT } from "./PickerRoot";
@Directive({ selector: "button[spDayTrigger]", standalone: true })
export class DayTrigger implements OnInit, OnChanges, OnDestroy {
  @Input("spDayTrigger") date = "";
  @Output() dateSelect = new EventEmitter<string>();
  private el = inject(ElementRef<HTMLButtonElement>);
  private root = inject(PICKER_CONTEXT);
  private stop?: () => void;
  ngOnInit() {
    this.bind();
  }
  ngOnChanges() {
    if (this.root.store) this.bind();
  }
  private bind() {
    this.root.ngOnInit();
    this.stop?.();
    if (typeof window !== "undefined")
      this.stop = bindDayTrigger(
        this.el.nativeElement,
        this.root.store!,
        this.date,
        { onSelect: (d) => this.dateSelect.emit(d) },
      );
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

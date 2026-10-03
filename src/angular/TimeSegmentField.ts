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
  bindTimeSegment,
  type Endpoint,
  type TimeSegment,
  pointFor,
  timeSegmentValue,
} from "../core";

import { PICKER_CONTEXT } from "./PickerRoot";
@Directive({
  selector: "input[spTimeSegment],select[spTimeSegment]",
  standalone: true,
})
export class TimeSegmentField implements OnInit, OnChanges, OnDestroy {
  @Input("spTimeSegment") part: TimeSegment = "hour";
  @Input() endpoint: Endpoint = "start";
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
        timeSegmentValue(
          pointFor(this.root.store!.getSnapshot().draft, this.endpoint)?.time,
          this.part,
          this.root.store!.getSnapshot().options.hourCycle,
        ),
      );
    else
      this.stop = bindTimeSegment(
        this.el.nativeElement,
        this.root.store!,
        this.part,
        this.endpoint,
      );
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

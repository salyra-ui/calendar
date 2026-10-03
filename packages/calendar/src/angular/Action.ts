import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  inject,
} from "@angular/core";

import { PICKER_CONTEXT } from "./PickerRoot";
@Directive({
  selector: "button[spNavigate],button[spAction]",
  standalone: true,
})
export class Action implements OnInit, OnDestroy {
  @Input() spNavigate?: number;
  @Input() spAction?: "apply" | "cancel" | "clear";
  private el = inject(ElementRef<HTMLButtonElement>);
  private root = inject(PICKER_CONTEXT);
  private stop?: () => void;
  ngOnInit() {
    this.root.ngOnInit();
    const update = () => {
      this.el.nativeElement.disabled =
        !!this.root.store!.getSnapshot().options.disabled;
    };
    let active = true;
    const click = (e: MouseEvent) =>
      queueMicrotask(() => {
        if (!active || e.defaultPrevented || this.el.nativeElement.disabled)
          return;
        if (this.spNavigate !== undefined)
          this.root.store!.navigate(this.spNavigate);
        if (this.spAction) this.root.store![this.spAction]();
      });
    update();
    const unsubscribe = this.root.store!.subscribe(update);
    if (typeof window !== "undefined")
      this.el.nativeElement.addEventListener("click", click);
    this.stop = () => {
      active = false;
      unsubscribe();
      this.el.nativeElement.removeEventListener("click", click);
    };
  }
  ngOnDestroy() {
    this.stop?.();
  }
}

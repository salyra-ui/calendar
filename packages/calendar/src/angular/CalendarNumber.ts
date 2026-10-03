import { Directive, ElementRef, Input, OnChanges, inject } from "@angular/core";

@Directive({ selector: "[spNumber]", standalone: true })
export class CalendarNumber implements OnChanges {
  @Input("spNumber") date = "";
  @Input() label?: string;
  private el = inject(ElementRef<HTMLElement>);
  ngOnChanges() {
    this.el.nativeElement.textContent =
      this.label ?? String(Number(this.date.slice(-2)));
  }
}

import { Directive, ElementRef, inject } from "@angular/core";

@Directive({ selector: "[spWeek]", standalone: true })
export class Week {
  private el = inject(ElementRef<HTMLElement>);
  constructor() {
    this.el.nativeElement.setAttribute("role", "row");
  }
}

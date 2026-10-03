import { Directive, ElementRef, inject } from "@angular/core";

@Directive({ selector: "[spGrid]", standalone: true })
export class Grid {
  private el = inject(ElementRef<HTMLElement>);
  constructor() {
    this.el.nativeElement.setAttribute("role", "grid");
  }
}

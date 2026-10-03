import {
  Directive,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  inject,
  InjectionToken,
  forwardRef,
} from "@angular/core";
import {
  createPickerStore,
  type PickerOptions,
  type PickerStore,
} from "../core";

export const PICKER_CONTEXT = new InjectionToken<PickerRoot>("Salyra calendar");
@Directive({
  selector: "[spRoot]",
  standalone: true,
  providers: [
    { provide: PICKER_CONTEXT, useExisting: forwardRef(() => PickerRoot) },
  ],
})
export class PickerRoot implements OnInit, OnChanges, OnDestroy {
  @Input("spRoot") options: PickerOptions = {};
  @Input() store?: PickerStore;
  @Output() valueChange = new EventEmitter();
  private stop?: () => void;
  ngOnInit() {
    if (this.stop) return;
    this.store ??= createPickerStore(this.options);
    this.stop = this.store.subscribeValue((v) => this.valueChange.emit(v));
  }
  ngOnChanges() {
    if (this.store) this.store.setOptions(this.options);
  }
  ngOnDestroy() {
    this.stop?.();
  }
}
export function usePickerStore() {
  const root = inject(PICKER_CONTEXT);
  root.ngOnInit();
  return root.store!;
}

import {
  defineComponent,
  provide,
  onMounted,
  onScopeDispose,
  watch,
  type PropType,
} from "vue";
import {
  createPickerStore,
  type PickerOptions,
  type PickerStore,
  type PickerValue,
  type PickerKind,
} from "../core";
import { pickerContext } from "./context";
export function createRoot(kind?: PickerKind) {
  return defineComponent({
    name: "PickerRoot",
    props: {
      store: Object as PropType<PickerStore>,
      options: { type: Object as PropType<PickerOptions>, default: () => ({}) },
      modelValue: Object as PropType<PickerValue>,
    },
    emits: ["update:modelValue", "valueChange"],
    setup(props, { slots, emit, expose }) {
      const store =
        props.store ??
        createPickerStore({
          ...props.options,
          ...(kind ? { kind } : {}),
          value:
            props.modelValue === undefined
              ? props.options.value
              : props.modelValue,
        });
      if (props.store) {
        store.setOptions({ ...props.options, ...(kind ? { kind } : {}) });
        if (props.modelValue !== undefined) store.setValue(props.modelValue);
      }
      provide(pickerContext, store);
      expose({ store });
      watch(
        () => props.modelValue,
        (value) => {
          if (value !== undefined) store.setValue(value);
        },
      );
      watch(
        () => props.options,
        (options) => store.setOptions(options),
        { deep: true },
      );
      let stop: (() => void) | undefined;
      onMounted(
        () =>
          (stop = store.subscribeValue((value) => {
            emit("update:modelValue", value);
            emit("valueChange", value);
          })),
      );
      onScopeDispose(() => stop?.());
      return () => slots.default?.();
    },
  });
}
export const Root = createRoot();
export const DateRoot = createRoot("date");
export const TimeRoot = createRoot("time");
export const DateTimeRoot = createRoot("datetime");

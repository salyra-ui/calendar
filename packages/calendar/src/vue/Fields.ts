import {
  defineComponent,
  h,
  shallowRef,
  onMounted,
  onScopeDispose,
  watch,
  type PropType,
} from "vue";
import {
  bindDateField,
  bindTimeSegment,
  pointFor,
  timeSegmentValue,
  type Endpoint,
  type TimeSegment,
} from "../core";
import { usePickerStore, usePicker } from "./context";
const endpoint = {
  type: String as PropType<Endpoint>,
  default: "start" as const,
};
export const Field = defineComponent({
  inheritAttrs: false,
  props: { endpoint },
  setup(props, { attrs }) {
    const store = usePickerStore(),
      element = shallowRef<HTMLInputElement>();
    let stop: (() => void) | undefined;
    const bind = () => {
      stop?.();
      stop = bindDateField(element.value!, store, props.endpoint);
    };
    onMounted(bind);
    watch(
      () => [props.endpoint, attrs.disabled, attrs.readonly],
      () => {
        if (element.value) bind();
      },
    );
    onScopeDispose(() => stop?.());
    return () =>
      h("input", {
        ...attrs,
        ref: element,
        type: "text",
        placeholder: attrs.placeholder ?? "YYYY-MM-DD",
        value: pointFor(store.getSnapshot().draft, props.endpoint)?.date ?? "",
      });
  },
});
export const Segment = defineComponent({
  inheritAttrs: false,
  props: {
    endpoint,
    part: {
      type: String as PropType<Exclude<TimeSegment, "period">>,
      default: "hour" as const,
    },
  },
  setup(props, { attrs }) {
    const store = usePickerStore(),
      element = shallowRef<HTMLInputElement>();
    let stop: (() => void) | undefined;
    const bind = () => {
      stop?.();
      stop = bindTimeSegment(element.value!, store, props.part, props.endpoint);
    };
    onMounted(bind);
    watch(
      () => [props.part, props.endpoint, attrs.disabled, attrs.readonly],
      () => {
        if (element.value) bind();
      },
    );
    onScopeDispose(() => stop?.());
    return () =>
      h("input", {
        ...attrs,
        ref: element,
        type: "number",
        value: timeSegmentValue(
          pointFor(store.getSnapshot().draft, props.endpoint)?.time,
          props.part,
          store.getSnapshot().options.hourCycle,
        ),
      });
  },
});
export const Period = defineComponent({
  inheritAttrs: false,
  props: { endpoint },
  setup(props, { attrs, slots }) {
    const store = usePickerStore(),
      element = shallowRef<HTMLSelectElement>();
    let stop: (() => void) | undefined;
    const bind = () => {
      stop?.();
      stop = bindTimeSegment(element.value!, store, "period", props.endpoint);
    };
    onMounted(bind);
    watch(
      () => [props.endpoint, attrs.disabled, attrs.readonly],
      () => {
        if (element.value) bind();
      },
    );
    onScopeDispose(() => stop?.());
    return () =>
      h(
        "select",
        { ...attrs, ref: element },
        slots.default?.() ?? [h("option", "AM"), h("option", "PM")],
      );
  },
});
export const Time = defineComponent({
  inheritAttrs: false,
  props: {
    endpoint,
    labels: {
      type: Object as PropType<Partial<Record<TimeSegment, string>>>,
      default: () => ({}),
    },
  },
  setup(props, { attrs }) {
    const state = usePicker();
    return () =>
      h("div", { class: "sp-time", ...attrs }, [
        h("label", {}, [
          props.labels.hour ?? "Hours",
          h(Segment, { part: "hour", endpoint: props.endpoint }),
        ]),
        h("label", {}, [
          props.labels.minute ?? "Minutes",
          h(Segment, { part: "minute", endpoint: props.endpoint }),
        ]),
        ...(state.value.options.seconds
          ? [
              h("label", {}, [
                props.labels.second ?? "Seconds",
                h(Segment, { part: "second", endpoint: props.endpoint }),
              ]),
            ]
          : []),
        ...(state.value.options.hourCycle === 12
          ? [
              h("label", {}, [
                props.labels.period ?? "Period",
                h(Period, { endpoint: props.endpoint }),
              ]),
            ]
          : []),
      ]);
  },
});
function monthYearSelect(key: "month" | "year") {
  return defineComponent({
    inheritAttrs: false,
    props: {
      from: { type: Number, default: 1900 },
      to: { type: Number, default: 2100 },
    },
    setup(props, { attrs, slots }) {
      const store = usePickerStore(),
        state = usePicker();
      return () =>
        h(
          "select",
          {
            ...attrs,
            disabled: !!attrs.disabled || !!state.value.options.disabled,
            value: state.value.visibleMonth[key],
            onChange: (event: Event) => {
              (attrs.onChange as ((e: Event) => void) | undefined)?.(event);
              if (!event.defaultPrevented)
                store.setVisibleMonth({
                  ...state.value.visibleMonth,
                  [key]: Number((event.target as HTMLSelectElement).value),
                });
            },
          },
          slots.default?.() ??
            Array.from(
              { length: key === "month" ? 12 : props.to - props.from + 1 },
              (_, i) => {
                const value = key === "month" ? i + 1 : props.from + i;
                return h("option", { value }, String(value));
              },
            ),
        );
    },
  });
}
export const MonthSelect = monthYearSelect("month"),
  YearSelect = monthYearSelect("year");
export const Action = defineComponent({
  inheritAttrs: false,
  props: {
    action: {
      type: String as PropType<"apply" | "cancel" | "clear">,
      default: "apply" as const,
    },
  },
  setup(props, { attrs, slots }) {
    const store = usePickerStore(),
      state = usePicker();
    return () =>
      h(
        "button",
        {
          ...attrs,
          type: "button",
          disabled:
            !!attrs.disabled ||
            !!state.value.options.disabled ||
            !!state.value.options.readOnly,
          onClick: (event: MouseEvent) => {
            (attrs.onClick as ((e: MouseEvent) => void) | undefined)?.(event);
            if (!event.defaultPrevented) store[props.action]();
          },
        },
        slots.default?.() ?? props.action,
      );
  },
});
export const Output = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const state = usePicker();
    return () =>
      h(
        "output",
        attrs,
        slots.default?.({
          value: state.value.value,
          draft: state.value.draft,
        }) ?? JSON.stringify(state.value.value),
      );
  },
});

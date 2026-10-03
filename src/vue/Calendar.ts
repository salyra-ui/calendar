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
  bindCalendar,
  calendarMarkup,
  bindDayTrigger,
  dayAttributes,
  dayTriggerAttributes,
  formatMonth,
  weekdayLabels,
  type CalendarRenderOptions,
} from "../core";
import { usePickerStore, usePicker } from "./context";
export const CalendarView = defineComponent({
  name: "CalendarView",
  inheritAttrs: false,
  props: { options: Object as PropType<CalendarRenderOptions> },
  setup(props, { attrs }) {
    const store = usePickerStore(),
      element = shallowRef<HTMLElement>(),
      html = calendarMarkup(store, props.options);
    let stop: (() => void) | undefined;
    const bind = () => {
      stop?.();
      stop = bindCalendar(element.value!, store, props.options);
    };
    onMounted(bind);
    watch(
      () => props.options,
      () => {
        if (element.value) bind();
      },
    );
    onScopeDispose(() => stop?.());
    return () =>
      h("div", {
        ...attrs,
        ref: element,
        "data-part": "calendar",
        innerHTML: html,
      });
  },
});
function container(name: string, role: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h(
          "div",
          { ...attrs, role, "data-part": name.toLowerCase() },
          slots.default?.(),
        );
    },
  });
}
export const Grid = container("Grid", "grid"),
  Week = container("Week", "row");
export const Cell = defineComponent({
  inheritAttrs: false,
  props: { date: { type: String, required: true }, outside: Boolean },
  setup(props, { attrs, slots }) {
    const store = usePickerStore(),
      state = usePicker();
    return () => {
      state.value;
      return h(
        "div",
        {
          ...attrs,
          ...dayAttributes(store, props.date, props.outside),
          role: "gridcell",
          "data-part": "cell",
        },
        slots.default?.(),
      );
    };
  },
});
export const NumberLabel = defineComponent({
  inheritAttrs: false,
  props: { date: { type: String, required: true } },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "span",
        { ...attrs, "data-part": "number" },
        slots.default?.() ?? String(Number(props.date.slice(-2))),
      );
  },
});
export const DayTrigger = defineComponent({
  inheritAttrs: false,
  props: { date: { type: String, required: true }, outside: Boolean },
  emits: ["select"],
  setup(props, { attrs, slots, emit }) {
    const store = usePickerStore(),
      state = usePicker(),
      element = shallowRef<HTMLButtonElement>();
    let stop: (() => void) | undefined;
    const bind = () => {
      stop?.();
      stop = bindDayTrigger(element.value!, store, props.date, {
        outside: props.outside,
        disabled: !!attrs.disabled,
        onSelect: (date) => emit("select", date),
      });
    };
    onMounted(bind);
    watch(
      () => [props.date, props.outside, attrs.disabled],
      () => {
        if (element.value) bind();
      },
    );
    onScopeDispose(() => stop?.());
    return () =>
      h(
        "button",
        {
          ...attrs,
          ...dayTriggerAttributes(store, props.date, props.outside),
          type: "button",
          disabled: !!attrs.disabled || store.getDay(props.date).disabled,
          tabindex:
            state.value.focusedDate === props.date && !props.outside ? 0 : -1,
          "data-day-trigger": "",
          ref: element,
        },
        slots.default?.(),
      );
  },
});
export const Heading = defineComponent({
  inheritAttrs: false,
  props: { offset: { type: Number, default: 0 } },
  setup(props, { attrs, slots }) {
    const store = usePickerStore(),
      state = usePicker();
    return () =>
      h(
        "h3",
        { ...attrs, "aria-live": "polite" },
        slots.default?.() ??
          formatMonth(store.getMonth(props.offset), state.value.options.locale),
      );
  },
});
export const Weekday = defineComponent({
  inheritAttrs: false,
  props: { day: { type: Number, required: true } },
  setup(props, { attrs, slots }) {
    const state = usePicker();
    return () => {
      const s = state.value;
      return h(
        "span",
        {
          ...attrs,
          role: "columnheader",
          "data-part": "weekday",
          "data-weekday": props.day,
          "data-weekend": s.options.weekend.includes(props.day)
            ? ""
            : undefined,
        },
        slots.default?.() ??
          weekdayLabels(s.options.locale, s.options.weekStartsOn).find(
            (d) => d.weekday === props.day,
          )?.label,
      );
    };
  },
});
export const Navigation = defineComponent({
  inheritAttrs: false,
  props: { direction: { type: Number, default: 1 } },
  setup(props, { attrs, slots }) {
    const store = usePickerStore(),
      state = usePicker();
    return () =>
      h(
        "button",
        {
          ...attrs,
          type: "button",
          disabled: !!attrs.disabled || !!state.value.options.disabled,
          onClick: (event: MouseEvent) => {
            (attrs.onClick as ((e: MouseEvent) => void) | undefined)?.(event);
            if (!event.defaultPrevented) {
              try {
                store.navigate(props.direction);
              } catch (error) {
                if (!(error instanceof RangeError)) throw error;
              }
            }
          },
        },
        slots.default?.() ??
          (props.direction < 0 ? "Previous month" : "Next month"),
      );
  },
});

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
  bindMonthScroller,
  monthScrollerMarkup,
  type MonthScrollerOptions,
} from "../core";
import { usePickerStore } from "./context";
export const Continuous = defineComponent({
  inheritAttrs: false,
  props: { options: Object as PropType<MonthScrollerOptions> },
  setup(props, { attrs }) {
    const store = usePickerStore(),
      element = shallowRef<HTMLElement>(),
      html = monthScrollerMarkup(store, props.options);
    let stop: (() => void) | undefined;
    const bind = () => {
      stop?.();
      stop = bindMonthScroller(element.value!, store, props.options);
    };
    onMounted(bind);
    watch(
      () => props.options,
      () => {
        if (element.value) bind();
      },
    );
    onScopeDispose(() => stop?.());
    return () => h("div", { ...attrs, ref: element, innerHTML: html });
  },
});

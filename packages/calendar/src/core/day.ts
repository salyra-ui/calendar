import { attribute, dayTriggerAttributes } from "./dom";
import { formatDate } from "./format";
import type { PickerStore } from "./store";
export function bindDayTrigger(
  button: HTMLButtonElement,
  store: PickerStore,
  date: string,
  {
    outside = false,
    onSelect,
    disabled,
  }: {
    outside?: boolean;
    disabled?: boolean;
    onSelect?: (date: string) => void;
  } = {},
) {
  let active = true;
  const pending = new Set<ReturnType<typeof setTimeout>>();
  const ownDisabled = disabled ?? button.disabled,
    ownLabel = button.getAttribute("aria-label");
  const update = () => {
    const s = store.getSnapshot(),
      state = store.getDay(date);
    for (const [k, v] of Object.entries(
      dayTriggerAttributes(store, date, outside),
    ))
      attribute(button, k, v);
    button.disabled =
      ownDisabled ||
      state.disabled ||
      (outside && s.options.outsideSelectable === false);
    button.tabIndex = state.focused && !outside ? 0 : -1;
    attribute(button, "data-day-trigger", true);

    attribute(button, "aria-current", state.today ? "date" : null);
    attribute(
      button,
      "aria-label",
      ownLabel ?? formatDate(date, s.options.locale),
    );
    const active = button.ownerDocument.activeElement;
    if (
      state.focused &&
      !outside &&
      active !== button &&
      active?.matches("[data-day-trigger]") &&
      active.closest('[role="grid"]') === button.closest('[role="grid"]')
    )
      button.focus();
  };
  const click = (event: MouseEvent) => {
    const task = setTimeout(() => {
      pending.delete(task);
      if (
        active &&
        button.isConnected &&
        !button.disabled &&
        !event.defaultPrevented &&
        !(outside && store.getSnapshot().options.outsideSelectable === false) &&
        store.selectDate(date)
      )
        onSelect?.(date);
    }, 0);
    pending.add(task);
  };
  const hover = (event: PointerEvent) => {
    if (event.pointerType !== "touch" && !button.disabled) store.hover(date);
  };
  const key = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    try {
      if (event.key === "Escape") {
        store.cancel();
        event.preventDefault();
        return;
      }
      store.focus(date);
      const rtl = getComputedStyle(button).direction === "rtl";
      const key =
        rtl && event.key === "ArrowLeft"
          ? "ArrowRight"
          : rtl && event.key === "ArrowRight"
            ? "ArrowLeft"
            : event.key;
      if (store.moveFocus(key, event.shiftKey)) event.preventDefault();
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
    }
  };
  update();
  const stop = store.subscribe(update);
  button.addEventListener("click", click);
  button.addEventListener("pointerenter", hover);
  button.addEventListener("keydown", key);
  return () => {
    active = false;
    for (const task of pending) clearTimeout(task);
    pending.clear();
    stop();
    button.removeEventListener("click", click);
    button.removeEventListener("pointerenter", hover);
    button.removeEventListener("keydown", key);
  };
}

import type { PickerStore } from "./store";
/** Popup behavior for app-owned containers. The trigger and content can live anywhere. */
export function bindPickerPopover(
  trigger: HTMLButtonElement,
  content: HTMLElement,
  store: PickerStore,
  {
    modal = false,
    label = "Choose a date",
  }: { modal?: boolean; label?: string } = {},
) {
  const doc = content.ownerDocument,
    oldHidden = content.hidden,
    ownDisabled = trigger.disabled;
  content.setAttribute("role", "dialog");
  content.setAttribute(
    "aria-label",
    content.getAttribute("aria-label") ?? label,
  );
  if (modal) content.setAttribute("aria-modal", "true");
  trigger.setAttribute("aria-haspopup", "dialog");
  let wasOpen = store.getSnapshot().open;
  const update = () => {
    const s = store.getSnapshot();
    content.hidden = !s.open;
    trigger.disabled = ownDisabled || !!s.options.disabled;
    trigger.setAttribute("aria-expanded", String(s.open));
    if (s.open && !wasOpen)
      queueMicrotask(() => {
        if (store.getSnapshot().open)
          (
            content.querySelector<HTMLElement>(
              '[data-day-trigger][tabindex="0"],input:not(:disabled),button:not(:disabled)',
            ) ?? content
          ).focus();
      });
    if (!s.open && wasOpen) trigger.focus();
    wasOpen = s.open;
  };
  const click = (event: MouseEvent) => {
    if (event.defaultPrevented) return;
    if (store.getSnapshot().open) store.cancel();
    else store.setOpen(true);
  };
  const outside = (event: PointerEvent) => {
    if (
      store.getSnapshot().open &&
      !content.contains(event.target as Node) &&
      !trigger.contains(event.target as Node)
    )
      store.cancel();
  };
  const key = (event: KeyboardEvent) => {
    if (!store.getSnapshot().open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      store.cancel();
    }
    if (modal && event.key === "Tab") {
      const controls = [
        ...content.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]',
        ),
      ].filter(
        (el) => el.tabIndex >= 0 && !el.hidden && el.getClientRects().length,
      );
      const first = controls[0],
        last = controls.at(-1);
      if (!first) {
        event.preventDefault();
        content.focus();
      } else if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last!.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  update();
  const stop = store.subscribe(update);
  trigger.addEventListener("click", click);
  doc.addEventListener("pointerdown", outside);
  doc.addEventListener("keydown", key);
  return () => {
    stop();
    content.hidden = oldHidden;
    trigger.removeEventListener("click", click);
    doc.removeEventListener("pointerdown", outside);
    doc.removeEventListener("keydown", key);
  };
}

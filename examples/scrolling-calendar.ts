import { createPickerStore, bindMonthScroller } from "@salyra-ui/calendar";
export const scrollingCalendarMarkup =
  '<div id="continuous-calendar" class="sp-calendar continuous-calendar" tabindex="0" aria-label="Scrolling calendar"></div><p id="scroll-value"></p>';
export function mountScrollingCalendar(
  root: HTMLElement,
  referenceDate: string,
) {
  const scrollStore = createPickerStore({
      referenceDate,
      selection: "range",
      fixedWeeks: true,
    }),
    scrollStop = bindMonthScroller(
      root.querySelector("#continuous-calendar")!,
      scrollStore,
    );
  const scrollSub = scrollStore.subscribeValue(
    (value) =>
      (root.querySelector("#scroll-value")!.textContent =
        JSON.stringify(value)),
  );
  return () => {
    scrollStop();
    scrollSub();
    scrollStore.destroy();
  };
}

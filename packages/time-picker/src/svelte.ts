export * from "./index";
import {
  Calendar,
  Segment,
  Period,
  Time,
  Action,
  TimeRoot,
} from "@salyra-ui/calendar/svelte";
export const TimePicker = {
  ...Calendar,
  Root: TimeRoot,
  Segment,
  Period,
  Time,
  Action,
};
export {
  TimeRoot as Root,
  Segment,
  Period,
  Time,
  Action,
} from "@salyra-ui/calendar/svelte";
export { usePickerStore } from "@salyra-ui/calendar/svelte";

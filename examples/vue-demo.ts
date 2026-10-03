import { createApp, h, ref } from "vue";
import {
  DatePicker as Picker,
  DateTimePicker,
  Calendar,
  createPickerStore,
  type PickerValue,
} from "../src/vue";
const store = createPickerStore({
  selection: "range",
  referenceDate: "2026-10-03",
  month: { year: 2010, month: 3 },
  commit: "explicit",
});
createApp({
  setup() {
    const value = ref<PickerValue>(null);
    return () =>
      h("main", { style: "padding:40px" }, [
        h("h1", "Vue"),
        h(
          Picker.Root,
          {
            store,
            "onUpdate:modelValue": (v: PickerValue) => (value.value = v),
          },
          {
            default: () => [
              h(Picker.MonthSelect, { "aria-label": "Month" }),
              h(Picker.YearSelect, { "aria-label": "Year" }),
              h(Picker.Calendar, { class: "sp-calendar" }),
              h(Picker.Action, { action: "apply" }, () => "Apply"),
              h("output", { id: "value" }, JSON.stringify(value.value)),
              h(Calendar.DayTrigger, { date: "2010-03-09" }, () => [
                h(Calendar.Number, { date: "2010-03-09" }),
                h("span", { class: "custom-dot" }),
              ]),
              h(
                "button",
                {
                  onClick: () =>
                    (document.querySelector("#event-result")!.textContent =
                      "Opened event"),
                },
                "Open event",
              ),
              h("p", { id: "event-result" }),
            ],
          },
        ),
        h("section", { id: "dt-editor" }, [
          h(
            DateTimePicker.Root,
            {
              options: {
                referenceDate: "2010-03-09",
                commit: "explicit",
                defaultValue: { date: "2010-03-09", time: "09:30" },
              },
            },
            () => [
              h(DateTimePicker.Time),
              h(DateTimePicker.Action, { action: "apply" }, () => "Apply"),
              h(DateTimePicker.Output, { id: "dt-value" }),
            ],
          ),
        ]),
      ]);
  },
}).mount("#app");

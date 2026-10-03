"use client";
import React, { useRef, useEffect, useState, type HTMLAttributes } from "react";
import {
  bindMonthScroller,
  monthScrollerMarkup,
  type MonthScrollerOptions,
} from "../core";
import { usePickerStore } from "./context";
export function Continuous({
  options = {},
  ...attributes
}: HTMLAttributes<HTMLDivElement> & { options?: MonthScrollerOptions }) {
  const store = usePickerStore(),
    element = useRef<HTMLDivElement>(null);
  const [html] = useState(() => monthScrollerMarkup(store, options));
  useEffect(
    () => bindMonthScroller(element.current!, store, options),
    [store, options],
  );
  return (
    <div
      {...attributes}
      ref={element}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

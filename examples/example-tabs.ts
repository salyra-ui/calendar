import { escapeHTML } from "@salyra-ui/calendar";
import "./example-tabs.css";

export interface ExampleFile {
  name: string;
  source: string;
}

/** Documentation chrome. The preview stays mounted when its source is shown. */
export function mountExampleTabs(
  section: HTMLElement,
  files: readonly ExampleFile[],
) {
  const heading = section.querySelector(".section-heading")!;
  const id = section.id;
  const title = heading.querySelector("h2")!.textContent!;
  const frame = document.createElement("div");
  frame.className = "example-frame";
  frame.innerHTML = `<div class="example-view-bar"><div class="example-view-tabs" role="tablist" aria-label="${escapeHTML(title)} view"><button type="button" role="tab" id="${id}-preview-tab" aria-controls="${id}-preview" aria-selected="true" data-example-view="preview">Preview</button><button type="button" role="tab" id="${id}-code-tab" aria-controls="${id}-code" aria-selected="false" tabindex="-1" data-example-view="code">Code</button></div><span class="example-language">Vanilla</span></div><div class="example-preview" role="tabpanel" id="${id}-preview" aria-labelledby="${id}-preview-tab"></div><div class="example-code" role="tabpanel" id="${id}-code" aria-labelledby="${id}-code-tab" hidden><div class="example-code-bar"><div class="example-file-tabs" role="tablist" aria-label="${escapeHTML(title)} files">${files.map((file, index) => `<button type="button" role="tab" id="${id}-file-${index}" aria-controls="${id}-source" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-example-file="${index}">${escapeHTML(file.name)}</button>`).join("")}</div><div class="example-code-actions"><button type="button" data-download-source>Download file</button><button type="button" data-copy-source>Copy code</button></div></div><pre class="example-source" id="${id}-source" role="tabpanel" tabindex="0" aria-labelledby="${id}-file-0"><code></code></pre><div class="example-code-footer"><p role="status" data-copy-status></p><a href="/docs.html#setup">Package setup</a></div></div>`;
  const preview = frame.querySelector<HTMLElement>(".example-preview")!;
  // Move the existing nodes, including their current form values. Never rebuild the demo.
  while (heading.nextSibling) preview.append(heading.nextSibling);
  section.append(frame);
  const codePanel = frame.querySelector<HTMLElement>(".example-code")!;
  const sourcePanel = frame.querySelector<HTMLElement>(".example-source")!;
  const source = sourcePanel.querySelector("code")!;
  const viewTabs = [
    ...frame.querySelectorAll<HTMLButtonElement>("[data-example-view]"),
  ];
  const fileTabs = [
    ...frame.querySelectorAll<HTMLButtonElement>("[data-example-file]"),
  ];
  const status = frame.querySelector<HTMLElement>("[data-copy-status]")!;
  let selected = 0;
  let active = true;
  const handlers = new AbortController();

  function showView(view: string) {
    for (const tab of viewTabs) {
      const chosen = tab.dataset.exampleView === view;
      tab.setAttribute("aria-selected", String(chosen));
      tab.tabIndex = chosen ? 0 : -1;
    }
    preview.hidden = view !== "preview";
    codePanel.hidden = view !== "code";
  }
  function showFile(index: number) {
    selected = index;
    for (const [i, tab] of fileTabs.entries()) {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    }
    source.textContent = files[index].source;
    sourcePanel.setAttribute("aria-labelledby", fileTabs[index].id);
    sourcePanel.scrollTop = 0;
    sourcePanel.scrollLeft = 0;
    status.textContent = "";
  }
  showFile(0);

  // Handle only the documentation buttons. A calendar cell click cannot switch views.
  frame.querySelector(".example-view-tabs")!.addEventListener(
    "click",
    (event) => {
      const tab = (event.target as Element).closest<HTMLElement>(
        "[data-example-view]",
      );
      if (tab) showView(tab.dataset.exampleView!);
    },
    { signal: handlers.signal },
  );
  frame.querySelector(".example-file-tabs")!.addEventListener(
    "click",
    (event) => {
      const tab = (event.target as Element).closest<HTMLElement>(
        "[data-example-file]",
      );
      if (tab) showFile(Number(tab.dataset.exampleFile));
    },
    { signal: handlers.signal },
  );
  for (const tabs of [viewTabs, fileTabs]) {
    tabs[0].parentElement!.addEventListener(
      "keydown",
      (event) => {
        const key = event as KeyboardEvent;
        const tab = (key.target as Element).closest<HTMLButtonElement>(
          '[role="tab"]',
        );
        if (
          !tab ||
          !["ArrowLeft", "ArrowRight", "Home", "End"].includes(key.key)
        )
          return;
        key.preventDefault();
        const index = tabs.indexOf(tab);
        const next =
          key.key === "Home"
            ? 0
            : key.key === "End"
              ? tabs.length - 1
              : (index + (key.key === "ArrowLeft" ? -1 : 1) + tabs.length) %
                tabs.length;
        tabs[next].focus();
        tabs[next].click();
      },
      { signal: handlers.signal },
    );
  }
  frame.querySelector("[data-copy-source]")!.addEventListener(
    "click",
    async () => {
      const file = files[selected];
      try {
        await navigator.clipboard.writeText(file.source);
        if (active && files[selected] === file)
          status.textContent = `${file.name} copied.`;
      } catch {
        if (active)
          status.textContent =
            "Select the code and copy it with your keyboard.";
      }
    },
    { signal: handlers.signal },
  );
  frame.querySelector("[data-download-source]")!.addEventListener(
    "click",
    () => {
      const file = files[selected];
      const url = URL.createObjectURL(
        new Blob([file.source], { type: "text/plain;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    { signal: handlers.signal },
  );
  return () => {
    active = false;
    handlers.abort();
  };
}

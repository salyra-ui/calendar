import "../packages/calendar/src/styles.css";
import "./site.css";
const framework =
  new URLSearchParams(location.search).get("framework") ?? "react";
if (framework === "react") await import("./react-demo");
else if (framework === "svelte") {
  const { mount } = await import("svelte");
  const { default: App } = await import("./SvelteDemo.svelte");
  mount(App, { target: document.querySelector("#app")! });
} else if (framework === "vue") await import("./vue-demo");
else if (framework === "angular") await import("./angular-demo");

import { snapshotTest } from "./snapshot.ts";

await snapshotTest({
  name: "should run only one step if only is set",
  meta: import.meta,
  steps: {
    "step 1": { args: ["with", "only"], only: true },
    "step 2": { args: ["without", "only"], only: false },
  },
  fn() {
    console.log(Deno.args);
  },
});

await snapshotTest({
  name: "should run only one step if only is set 2",
  meta: import.meta,
  steps: {
    "step 1": { args: ["without", "only"], only: false },
    "step 2": { args: ["", "without", "only"], only: false },
  },
  fn() {
    console.log(Deno.args);
  },
});

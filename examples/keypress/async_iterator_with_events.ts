#!/usr/bin/env -S deno run

import { keypress, type KeyPressEvent } from "@cliffy/keypress";

keypress().addEventListener("keydown", (event: KeyPressEvent) => {
  console.log("# event");
  if (event.ctrlKey && event.key === "x") {
    console.log("Canceled within event listener.");
    // Stop event loop and iterator.
    keypress().dispose();
  }
});

for await (const event of keypress()) {
  console.log("# iterator");
  if (event.ctrlKey && event.key === "c") {
    console.log("Canceled within for loop.");
    // Stop event loop.
    keypress().dispose();
    // Stop iterator.
    break;
  }
}

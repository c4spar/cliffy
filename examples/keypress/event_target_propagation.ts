#!/usr/bin/env -S deno run

import { keypress, type KeyPressEvent } from "@cliffy/keypress";

// Register an event listener that is called an every keydown event.
keypress().addEventListener("keydown", (event: KeyPressEvent) => {
  console.log(
    "# event - type: %s, key: %s, ctrl: %s, meta: %s, shift: %s",
    event.type,
    event.key,
    event.ctrlKey,
    event.metaKey,
    event.shiftKey,
  );
});

// Register an event listener that is called only once.
keypress().addEventListener("keydown", (event: KeyPressEvent) => {
  console.log(
    "# first - type: %s, key: %s, ctrl: %s, meta: %s, shift: %s",
    event.type,
    event.key,
    event.ctrlKey,
    event.metaKey,
    event.shiftKey,
  );
  // Prevents other listeners that was registered after this listener from being called.
  event.stopImmediatePropagation();
}, {
  // Executes the listener only once
  once: true,
});

keypress().addEventListener("keydown", (event: KeyPressEvent) => {
  console.log(
    "# second - type: %s, key: %s, ctrl: %s, meta: %s, shift: %s",
    event.type,
    event.key,
    event.ctrlKey,
    event.metaKey,
    event.shiftKey,
  );
  // Stops the event loop.
  keypress().dispose();
});

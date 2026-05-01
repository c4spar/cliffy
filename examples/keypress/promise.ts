#!/usr/bin/env -S deno run

import { keypress, type KeyPressEvent } from "@cliffy/keypress";

const event: KeyPressEvent = await keypress();

console.log(
  "type: %s, key: %s, ctrl: %s, meta: %s, shift: %s, alt: %s, repeat: %s",
  event.type,
  event.key,
  event.ctrlKey,
  event.metaKey,
  event.shiftKey,
  event.altKey,
  event.repeat,
);

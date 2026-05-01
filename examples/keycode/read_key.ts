#!/usr/bin/env -S deno run

import { type KeyCode, parse } from "@cliffy/keycode";

async function* keypress(): AsyncGenerator<KeyCode, void> {
  while (true) {
    const data = new Uint8Array(8);

    Deno.stdin.setRaw(true);
    const nread = await Deno.stdin.read(data);
    Deno.stdin.setRaw(false);

    if (nread === null) {
      return;
    }

    const keys: Array<KeyCode> = parse(data.subarray(0, nread));

    for (const key of keys) {
      yield key;
    }
  }
}

console.log("Hit ctrl + c to exit.");

for await (const key of keypress()) {
  if (key.ctrl && key.name === "c") {
    console.log("exit");
    break;
  }
  console.log(key);
}

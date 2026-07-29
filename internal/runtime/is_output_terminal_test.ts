import { assertEquals } from "@std/assert";
import { test } from "../testing/test/mod.ts";
import { fakeOutputTerminal } from "../testing/fake_output_terminal.ts";
import { isOutputTerminal } from "./is_output_terminal.ts";

test("should detect a terminal standard output", () => {
  const restore = fakeOutputTerminal({ isTerminal: true });

  try {
    assertEquals(isOutputTerminal(), true);
  } finally {
    restore();
  }
});

test("should detect a non-terminal standard output", () => {
  const restore = fakeOutputTerminal({ isTerminal: false });

  try {
    assertEquals(isOutputTerminal(), false);
  } finally {
    restore();
  }
});

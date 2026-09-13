import { test } from "@cliffy/internal/testing/test";
import { assertEquals } from "@std/assert";
import { isUsageError, usageError } from "./usage_error.ts";

test("isUsageError", async (ctx) => {
  await ctx.step("should detect an error marked on its prototype", () => {
    class MarkedError extends Error {}
    Object.defineProperty(MarkedError.prototype, usageError, { value: true });

    assertEquals(isUsageError(new MarkedError("boom")), true);
  });

  await ctx.step("should detect a marker from the global symbol key", () => {
    const error = Object.assign(new Error("boom"), {
      [Symbol.for("cliffy.usageError")]: true,
    });

    assertEquals(isUsageError(error), true);
  });

  await ctx.step("should not detect an unmarked error", () => {
    assertEquals(isUsageError(new Error("boom")), false);
  });

  await ctx.step("should not detect a marked non-error value", () => {
    assertEquals(isUsageError({ [usageError]: true }), false);
  });
});

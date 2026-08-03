import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { assertType, type IsExact } from "@std/testing/types";
import { Command } from "../../command.ts";
import { withEnv } from "@cliffy/internal/testing/with-env";

function command() {
  return new Command().noExit();
}

test(
  "should resolve a presence env var to true for any value",
  withEnv({ NO_COLOR: "whatever" }, async () => {
    const { options } = await command()
      .env("NO_COLOR=<value:presence>", "...")
      .parse([]);

    assertEquals(options, { noColor: true });
  }),
);

test(
  "should not parse the value of a presence env var",
  withEnv({ NO_COLOR: "false" }, async () => {
    const { options } = await command()
      .env("NO_COLOR=<value:presence>", "...")
      .parse([]);

    assertEquals(options, { noColor: true });
  }),
);

test("should not set a presence env var when it is unset", async () => {
  const { options } = await command()
    .env("NO_COLOR=<value:presence>", "...")
    .parse([]);

  assertEquals(options, {});
});

test(
  "should treat an empty presence env var as unset",
  withEnv({ NO_COLOR: "" }, async () => {
    const { options } = await command()
      .env("NO_COLOR=<value:presence>", "...")
      .parse([]);

    assertEquals(options, {});
  }),
);

test(
  "should negate a presence env var for any value",
  withEnv({ NO_COLOR: "false" }, async () => {
    const { options } = await command()
      .env("NO_COLOR=<value:presence>", "...", { negatable: true })
      .parse([]);

    assertEquals(options, { color: false });
  }),
);

test(
  "should combine a presence env var with a prefix",
  withEnv({ MYCLI_NO_CACHE: "1" }, async () => {
    const { options } = await command()
      .env("MYCLI_NO_CACHE=<value:presence>", "...", {
        prefix: "MYCLI_",
        negatable: true,
      })
      .parse([]);

    assertEquals(options, { cache: false });
  }),
);

test("should throw when a negatable env var is neither boolean nor presence", () => {
  assertThrows(
    () => command().env("NO_COLOR=<value:string>", "...", { negatable: true }),
    Error,
    `A negatable environment variable must have a value of type "boolean" or "presence", but "NO_COLOR=<value:string>" does not.`,
  );
});

test("should throw when a negatable presence env var does not start with NO_", () => {
  assertThrows(
    () => command().env("CACHE=<value:presence>", "...", { negatable: true }),
    Error,
    `A negatable environment variable must start with "NO_", but "CACHE" does not.`,
  );
});

test("should infer a boolean for a presence env var", async () => {
  const { options } = await command()
    .env("CI=<value:presence>", "...")
    .parse([]);

  assertType<IsExact<typeof options, { ci?: boolean | undefined }>>(true);
});

test("should infer a boolean for a negatable presence env var", async () => {
  const { options } = await command()
    .env("NO_CACHE=<value:presence>", "...", { negatable: true })
    .parse([]);

  assertType<IsExact<typeof options, { cache?: boolean | undefined }>>(true);
});

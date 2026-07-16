import { test } from "@cliffy/internal/testing/test";
import { deleteEnv } from "@cliffy/internal/runtime/delete-env";
import { setEnv } from "@cliffy/internal/runtime/set-env";
import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { assertType, type IsExact } from "@std/testing/types";
import { Command } from "../../command.ts";

function command() {
  return new Command().noExit();
}

function withEnv(
  vars: Record<string, string>,
  fn: () => Promise<void> | void,
) {
  return async () => {
    for (const [name, value] of Object.entries(vars)) {
      setEnv(name, value);
    }
    try {
      await fn();
    } finally {
      for (const name of Object.keys(vars)) {
        deleteEnv(name);
      }
    }
  };
}

test(
  "should invert a negatable env var and strip the NO_ prefix",
  withEnv({ NO_COLOR: "true" }, async () => {
    const { options } = await command()
      .env("NO_COLOR=<value:boolean>", "...", { negatable: true })
      .parse([]);

    assertEquals(options, { color: false });
  }),
);

test(
  "should resolve a negatable env var to true when set to false",
  withEnv({ NO_COLOR: "false" }, async () => {
    const { options } = await command()
      .env("NO_COLOR=<value:boolean>", "...", { negatable: true })
      .parse([]);

    assertEquals(options, { color: true });
  }),
);

test("should not set a negatable env var property when the env var is unset", async () => {
  const { options } = await command()
    .env("NO_COLOR=<value:boolean>", "...", { negatable: true })
    .parse([]);

  assertEquals(options, {});
});

test(
  "should combine a negatable env var with a prefix",
  withEnv({ DENO_NO_COLOR: "true" }, async () => {
    const { options } = await command()
      .env("DENO_NO_COLOR=<value:boolean>", "...", {
        prefix: "DENO_",
        negatable: true,
      })
      .parse([]);

    assertEquals(options, { color: false });
  }),
);

test(
  "should apply the value handler to the inverted negatable env var value",
  withEnv({ NO_COLOR: "true" }, async () => {
    const { options } = await command()
      .env("NO_COLOR=<value:boolean>", "...", {
        negatable: true,
        value: (value: boolean) => `color=${value}`,
      })
      .parse([]);

    assertEquals(options, { color: "color=false" });
  }),
);

test(
  "should support a negatable global env var in sub commands",
  withEnv({ NO_CACHE: "true" }, async () => {
    const { options } = await command()
      .globalEnv("NO_CACHE=<value:boolean>", "...", { negatable: true })
      .command("sub", command().action(() => {}))
      .parse(["sub"]);

    assertEquals(options, { cache: false });
  }),
);

test("should support a required negatable env var", async () => {
  await assertRejects(
    () =>
      command()
        .env("NO_COLOR=<value:boolean>", "...", {
          negatable: true,
          required: true,
        })
        .parse([]),
    Error,
    `Missing required environment variable "NO_COLOR".`,
  );
});

test(
  "should not invert a NO_ env var that is not negatable",
  withEnv({ NO_CACHE: "true" }, async () => {
    const { options } = await command()
      .env("NO_CACHE=<value:boolean>", "...")
      .parse([]);

    assertEquals(options, { noCache: true });
  }),
);

test(
  "should invert every alias of a negatable env var",
  withEnv({ NO_COLOUR: "true" }, async () => {
    const { options } = await command()
      .env("NO_COLOR, NO_COLOUR <value:boolean>", "...", { negatable: true })
      .parse([]);

    assertEquals(options, { color: false });
  }),
);

test(
  "should let a negatable env var win over its positive env var",
  withEnv({ COLOR: "blue", NO_COLOR: "true" }, async () => {
    const { options } = await command()
      .env("COLOR=<value:string>", "...")
      .env("NO_COLOR=<value:boolean>", "...", { negatable: true })
      .parse([]);

    assertEquals(options, { color: false });
  }),
);

test(
  "should let a negatable env var win regardless of the registration order",
  withEnv({ COLOR: "blue", NO_COLOR: "true" }, async () => {
    const { options } = await command()
      .env("NO_COLOR=<value:boolean>", "...", { negatable: true })
      .env("COLOR=<value:string>", "...")
      .parse([]);

    // @ts-expect-error: TODO: Registering a positive env var last infers a broken property type.
    assertEquals(options, { color: false });
  }),
);

test(
  "should use the positive env var when the negatable env var is unset",
  withEnv({ COLOR: "blue" }, async () => {
    const { options } = await command()
      .env("COLOR=<value:string>", "...")
      .env("NO_COLOR=<value:boolean>", "...", { negatable: true })
      .parse([]);

    assertEquals(options, { color: "blue" });
  }),
);

// Not required to execute this code, only type check.
(() => {
  test({
    name: "should type a negatable env var as the positive property",
    fn() {
      command()
        .env("NO_COLOR=<value:boolean>", "...", { negatable: true })
        .action((options) => {
          assertType<IsExact<typeof options, { color?: boolean | undefined }>>(
            true,
          );
        });
    },
  });

  test({
    name: "should type a required negatable env var as a required property",
    fn() {
      command()
        .env("NO_COLOR=<value:boolean>", "...", {
          negatable: true,
          required: true,
        })
        .action((options) => {
          assertType<IsExact<typeof options, { color: boolean }>>(true);
        });
    },
  });

  test({
    name: "should type a negatable env var paired with a positive env var",
    fn() {
      command()
        .env("COLOR=<value:string>", "...")
        .env("NO_COLOR=<value:boolean>", "...", { negatable: true })
        .action((options) => {
          assertType<
            IsExact<typeof options, { color?: string | false | undefined }>
          >(true);
        });
    },
  });

  test({
    name:
      "should type a negatable env var paired with a positive option the same way a negatable option does",
    fn() {
      command()
        .option("--color [color:string]", "...", { default: "yellow" })
        .env("NO_COLOR=<value:boolean>", "...", { negatable: true })
        .action((options) => {
          assertType<IsExact<typeof options, { color: string | boolean }>>(
            true,
          );
        });

      command()
        .option("--color [color:string]", "...", { default: "yellow" })
        .option("--no-color", "...")
        .action((options) => {
          assertType<IsExact<typeof options, { color: string | boolean }>>(
            true,
          );
        });
    },
  });
})();

test("should throw when a negatable env var is not of type boolean", () => {
  assertThrows(
    () => command().env("NO_PROXY=<value:string>", "...", { negatable: true }),
    Error,
    `A negatable environment variable must have a value of type "boolean", but "NO_PROXY=<value:string>" does not.`,
  );
});

test("should throw when a negatable env var does not start with NO_", () => {
  assertThrows(
    () => command().env("COLOR=<value:boolean>", "...", { negatable: true }),
    Error,
    `A negatable environment variable must start with "NO_", but "COLOR" does not.`,
  );
});

test("should throw when a negatable env var alias does not start with NO_", () => {
  assertThrows(
    () =>
      command().env("NO_COLOR, COLOUR <value:boolean>", "...", {
        negatable: true,
      }),
    Error,
    `A negatable environment variable must start with "NO_", but "COLOUR" does not.`,
  );
});

test("should throw when a prefixed negatable env var does not start with NO_ after the prefix", () => {
  assertThrows(
    () =>
      command().env("DENO_COLOR=<value:boolean>", "...", {
        prefix: "DENO_",
        negatable: true,
      }),
    Error,
    `A negatable environment variable must start with "NO_", but "DENO_COLOR" does not.`,
  );
});

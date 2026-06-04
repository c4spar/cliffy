import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertInstanceOf, assertRejects } from "@std/assert";
import { assertSpyCalls, spy } from "@std/testing/mock";
import { assertType, type IsExact } from "@std/testing/types";
import {
  Command,
  type ErrorContext,
  type ErrorHandler,
  ValidationError,
} from "../../mod.ts";

test("[command] should call error handler on error", async () => {
  let error: unknown;
  const errorHandler = (): ErrorHandler => (error, cmd) => {
    assertInstanceOf(error, ValidationError);
    assertInstanceOf(cmd, Command);
    assertEquals(cmd.getName(), "child");
    assertInstanceOf(error.cmd, Command);
    assertEquals(error.cmd.getName(), "child");
  };
  const errorHandlerSpy = spy(errorHandler());
  const child2ErrorHandlerSpy = spy(errorHandler());

  const cmd = new Command()
    .throwErrors()
    .error(errorHandlerSpy)
    .command("child")
    .action(() => {
      throw new ValidationError("validation error message.");
    })
    .command("child2")
    .error(child2ErrorHandlerSpy)
    .action(() => {
      throw new ValidationError("validation error message.");
    });

  try {
    await cmd.parse(["child"]);
  } catch (err) {
    error = err;
  }

  assertSpyCalls(errorHandlerSpy, 1);
  assertSpyCalls(child2ErrorHandlerSpy, 0);
  assertInstanceOf(error, ValidationError);
  assertInstanceOf(error.cmd, Command);
  assertEquals(error.cmd.getName(), "child");
});

test("[command] should call child error handler on child error", async () => {
  let error: unknown;
  const errorHandler = (): ErrorHandler => (error, cmd) => {
    assertInstanceOf(error, ValidationError);
    assertInstanceOf(cmd, Command);
    assertEquals(cmd.getName(), "child2");
    assertInstanceOf(error.cmd, Command);
    assertEquals(error.cmd.getName(), "child2");
  };
  const errorHandlerSpy = spy(errorHandler());
  const child2ErrorHandlerSpy = spy(errorHandler());

  const cmd = new Command()
    .throwErrors()
    .error(errorHandlerSpy)
    .command("child")
    .action(() => {
      throw new ValidationError("validation error message.");
    })
    .command("child2")
    .error(child2ErrorHandlerSpy)
    .action(() => {
      throw new ValidationError("validation error message.");
    });

  try {
    await cmd.parse(["child2"]);
  } catch (err) {
    error = err;
  }

  assertSpyCalls(errorHandlerSpy, 0);
  assertSpyCalls(child2ErrorHandlerSpy, 1);
  assertInstanceOf(error, ValidationError);
  assertInstanceOf(error.cmd, Command);
  assertEquals(error.cmd.getName(), "child2");
});

test("[command] should call error handler for runtime errors from deeply nested sub-commands", async () => {
  const runtimeError = new Error("runtime error message.");
  const errorHandlerSpy = spy((error: Error, cmd: Command) => {
    assertEquals(error, runtimeError);
    assertInstanceOf(cmd, Command);
    assertEquals(cmd.getName(), "leaf");
  });

  const cmd = new Command()
    .throwErrors()
    .error(errorHandlerSpy)
    .command(
      "mid",
      new Command()
        .command("leaf")
        .action(() => {
          throw runtimeError;
        }),
    );

  await assertRejects(
    () => cmd.parse(["mid", "leaf"]),
    Error,
    "runtime error message.",
  );

  assertSpyCalls(errorHandlerSpy, 1);
});

test("[command] should call error handler for validation errors from deeply nested sub-commands", async () => {
  const errorHandlerSpy = spy((error: Error, cmd: Command) => {
    assertInstanceOf(error, ValidationError);
    assertInstanceOf(cmd, Command);
    assertEquals(cmd.getName(), "leaf");
  });

  const cmd = new Command()
    .throwErrors()
    .error(errorHandlerSpy)
    .command(
      "mid",
      new Command()
        .command("leaf")
        .action(() => {
          throw new ValidationError("validation error message.");
        }),
    );

  await assertRejects(
    () => cmd.parse(["mid", "leaf"]),
    ValidationError,
    "validation error message.",
  );

  assertSpyCalls(errorHandlerSpy, 1);
});

test("[command] should call closest error handler for nested sub-command errors", async () => {
  const rootErrorHandlerSpy = spy();
  const midErrorHandlerSpy = spy();

  const cmd = new Command()
    .throwErrors()
    .error(rootErrorHandlerSpy)
    .command(
      "mid",
      new Command()
        .error(midErrorHandlerSpy)
        .command("leaf")
        .action(() => {
          throw new Error("runtime error message.");
        }),
    );

  await assertRejects(
    () => cmd.parse(["mid", "leaf"]),
    Error,
    "runtime error message.",
  );

  assertSpyCalls(midErrorHandlerSpy, 1);
  assertSpyCalls(rootErrorHandlerSpy, 0);
});

test("[command] should handle error with useRawArgs enabled", async () => {
  const errorHandlerSpy = spy();

  await assertRejects(
    () =>
      new Command()
        .throwErrors()
        .error(errorHandlerSpy)
        .option("-f, --foo", "...")
        .arguments("[bar:string]")
        .useRawArgs()
        .action(() => {
          throw new Error("foo");
        })
        .parse([
          "-f",
          "test",
        ]),
    Error,
    "foo",
  );

  assertSpyCalls(errorHandlerSpy, 1);
});

test("[command] error handler ctx should have options and args when error occurs in action", async () => {
  await assertRejects(
    () =>
      new Command()
        .throwErrors()
        .option("-f, --foo <val:string>", "...")
        .arguments("<bar:string>")
        .error((_error, _cmd, ctx) => {
          assertEquals(ctx.options.foo, "hello");
          assertEquals(ctx.args[0], "world");
        })
        .action(() => {
          throw new ValidationError("test error");
        })
        .parse(["--foo", "hello", "world"]),
    ValidationError,
  );
});

test("[command] error handler ctx should have empty options and args when error occurs during option parsing", async () => {
  await assertRejects(
    () =>
      new Command()
        .throwErrors()
        .option("-f, --foo <val:string>", "...")
        .error((_error, _cmd, ctx) => {
          assertEquals(ctx.options, {});
          assertEquals(ctx.args, []);
        })
        .parse(["--unknown"]),
    ValidationError,
  );
});

test("[command] error handler ctx should have options but empty args when error occurs during argument processing", async () => {
  await assertRejects(
    () =>
      new Command()
        .throwErrors()
        .option("-f, --foo <val:string>", "...")
        .error((_error, _cmd, ctx) => {
          assertEquals(ctx.options.foo, "hello");
          assertEquals(ctx.args, []);
        })
        .parse(["--foo", "hello", "unexpected-arg"]),
    ValidationError,
  );
});

test("[command] error handler ctx should be typed with parsed options and arguments", () => {
  new Command()
    .option("-f, --foo <val:string>", "...")
    .globalOption("-v, --verbose", "...")
    .arguments("<bar:string>")
    .error((_error, _cmd, ctx) => {
      assertType<
        IsExact<
          typeof ctx,
          ErrorContext<{ foo?: string; verbose?: true }, [bar: string]>
        >
      >(true);
    });
});

test("[command] should handle error on sub command with useRawArgs enabled", async () => {
  const errorHandlerSpy = spy();

  await assertRejects(
    () =>
      new Command()
        .throwErrors()
        .error(errorHandlerSpy)
        .command("foo")
        .option("-f, --foo", "...")
        .arguments("[bar:string]")
        .useRawArgs()
        .action(() => {
          throw new Error("foo");
        })
        .parse([
          "foo",
          "-f",
          "test",
        ]),
    Error,
    "foo",
  );

  assertSpyCalls(errorHandlerSpy, 1);
});

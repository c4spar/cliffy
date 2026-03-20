import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects } from "@std/assert";
import { ValidationError } from "../../_errors.ts";
import { Command } from "../../command.ts";
import { assertType, type IsExact } from "@std/testing/types";

test("should accept a dash as argument", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("<input:string>", "...")
    .parse(["-"]);

  assertType<IsExact<typeof args, [string]>>(true);
  assertEquals(args, ["-"]);
});

test("should parse correctly argument types", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("<foo:string>", "...")
    .argument("[bar:number]", "...")
    .argument("[baz:boolean]", "...")
    .argument("[list:number[]]", "...")
    .parse([
      "abc",
      "123",
      "true",
      "1,2,3,4",
    ]);

  assertType<IsExact<typeof args, [string, number?, boolean?, Array<number>?]>>(
    true,
  );
  assertEquals(args, ["abc", 123, true, [1, 2, 3, 4]]);
});

test("should parse correctly argument types on sub command", async () => {
  const { args } = await new Command()
    .throwErrors()
    .command("foo", "...")
    .argument("<foo:string>", "...")
    .argument("[bar:number]", "...")
    .argument("[baz:boolean]", "...")
    .argument("[list:number[]]", "...")
    .parse([
      "foo",
      "abc",
      "123",
      "true",
      "1,2,3,4",
    ]);

  assertType<IsExact<typeof args, Array<unknown>>>(true);
  assertEquals(args, ["abc", 123, true, [1, 2, 3, 4]]);
});

test("should parse correctly a variadic argument", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("<...foo:string>", "...")
    .parse(["foo", "bar", "baz"]);

  assertType<IsExact<typeof args, [string, ...Array<string>]>>(true);
  assertEquals(args, ["foo", "bar", "baz"]);
});

test("should parse correctly a variadic argument with other args", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("<foo:string>", "...")
    .argument("[...bar:number]", "...")
    .parse(["abc", "1", "2", "3"]);

  assertType<IsExact<typeof args, [string, ...Array<number>]>>(true);
  assertEquals(args, ["abc", 1, 2, 3]);
});

test("should parse correctly a required variadic argument with other args", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("<foo:string>", "...")
    .argument("<...bar:number>", "...")
    .parse(["abc", "1", "2", "3"]);

  assertType<IsExact<typeof args, [string, number, ...Array<number>]>>(true);
  assertEquals(args, ["abc", 1, 2, 3]);
});

test("should use default value for argument", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("<foo:string>", "...")
    .argument("[bar:string]", "...", { default: 42 })
    .argument("[baz:string]", "...")
    .parse(["abc"]);

  assertType<IsExact<typeof args, [string, string | 42, string?]>>(true);
  assertEquals(args, ["abc", 42]);
});

test("should map argument value", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("<foo:string>", "...", {
      value: (value) => ({ value }),
    })
    .argument("[bar:number]", "...", {
      value: (value) => ({ value }),
    })
    .parse(["abc", "123"]);

  assertType<IsExact<typeof args, [{ value: string }, { value: number }?]>>(
    true,
  );
  assertEquals(args, [{ value: "abc" }, { value: 123 }]);
});

test("should throw on missing required argument", async () => {
  const command = new Command()
    .throwErrors()
    .argument("<foo:string>", "...")
    .argument("<bar:string>", "...");

  await assertRejects(
    () => command.parse(["only-one-arg"]),
    ValidationError,
    "Missing argument: bar",
  );
});

test("should throw on invalid argument type", async () => {
  const command = new Command()
    .throwErrors()
    .argument("<foo:number>", "...");

  await assertRejects(
    () => command.parse(["not-a-number"]),
    ValidationError,
    'Argument "foo" must be of type "number", but got "not-a-number".',
  );
});

test("should throw on invalid variadic argument type", async () => {
  const command = new Command()
    .throwErrors()
    .argument("<...foo:number>", "...");

  await assertRejects(
    () => command.parse(["1", "2", "three"]),
    ValidationError,
    'Argument "foo" must be of type "number", but got "three".',
  );
});

test("should parse variadic argument with default array value", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("<...foo>", "...", {
      default: [1],
    })
    .parse([]);

  assertType<IsExact<typeof args, [1] | [string, ...Array<string>]>>(
    true,
  );
  assertEquals(args, [1]);
});

test("should map argument value", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("<foo:string>", "...", {
      value: (value) => ({ value1: value }),
    })
    .argument("[bar:number]", "...", {
      default: 42,
      value: (value) => ({ value2: value }),
    })
    .argument("[baz:number]", "...", {
      value: (value) => ({ value3: value }),
    })
    .parse(["abc"]);

  assertType<
    IsExact<
      typeof args,
      [{ value1: string }, { value2: number }, { value3: number }?]
    >
  >(true);
  assertEquals(args, [{ value1: "abc" }, { value2: 42 }]);
});

test("should map async argument value", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("<foo:string>", "...", {
      value: async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return Promise.resolve({ value1: value });
      },
    })
    .argument("[bar:number]", "...", {
      default: 42,
      value: async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return Promise.resolve({ value2: value });
      },
    })
    .argument("[baz:number]", "...", {
      value: async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return Promise.resolve({ value3: value });
      },
    })
    .parse(["abc"]);

  assertType<
    IsExact<
      typeof args,
      [{ value1: string }, { value2: number }, { value3: number }?]
    >
  >(true);
  assertEquals(args, [{ value1: "abc" }, { value2: 42 }]);
});

test("should map required variadic argument values", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("<...foo:string>", "...", {
      value: (value) => ({ value }),
    })
    .parse(["a", "b", "c"]);

  assertType<IsExact<typeof args, [{ value: [string, ...Array<string>] }]>>(
    true,
  );
  assertEquals(args, [{ value: ["a", "b", "c"] }]);
});

test("should map optional variadic argument values", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("[...foo:string]", "...", {
      value: (value) => ({ value }),
    })
    .parse(["a", "b", "c"]);

  assertType<IsExact<typeof args, [{ value: Array<string> }?]>>(true);
  assertEquals(args, [{ value: ["a", "b", "c"] }]);
});

test("should map required variadic argument values to array", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("<...foo:string>", "...", {
      value: (
        [value, ...values],
      ): [{ value: string }, ...Array<{ value: string }>] => [
        { value },
        ...values.map((value) => ({ value })),
      ],
    })
    .parse(["a", "b", "c"]);

  assertType<
    IsExact<typeof args, [{ value: string }, ...Array<{ value: string }>]>
  >(true);
  assertEquals(args, [{ value: "a" }, { value: "b" }, { value: "c" }]);
});

test("should map optional variadic argument values to array", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("[...foo:string]", "...", {
      value: (value) => value.map((value) => ({ value })),
    })
    .parse(["a", "b", "c"]);

  assertType<IsExact<typeof args, Array<{ value: string }>>>(true);
  assertEquals(args, [{ value: "a" }, { value: "b" }, { value: "c" }]);
});

test("should map variadic argument values with default array value", async () => {
  const { args } = await new Command()
    .throwErrors()
    .argument("[...foo:string]", "...", {
      default: [1, 2, 3],
      value: (value) => {
        assertType<IsExact<typeof value, [1, 2, 3] | Array<string>>>(true);
        return { value };
      },
    })
    .parse(["a", "b", "c"]);

  assertType<
    IsExact<
      typeof args,
      [{ value: [1, 2, 3] | Array<string> }]
    >
  >(true);
  assertEquals(args, [{ value: ["a", "b", "c"] }]);
});

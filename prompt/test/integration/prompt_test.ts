import { ansi } from "@cliffy/ansi";
import { assertEquals } from "@std/assert";
import { assertType, type IsExact } from "@std/testing/types";
import { Checkbox, type CheckboxOptions } from "../../checkbox.ts";
import { Confirm } from "../../confirm.ts";
import { Input } from "../../input.ts";
import { Number } from "../../number.ts";
import {
  prompt,
  type PromptMiddleware,
  type PromptOptions,
} from "../../prompt.ts";
import { Select } from "../../select.ts";
import { Toggle } from "../../toggle.ts";
import { snapshotTest } from "@cliffy/testing";

await snapshotTest({
  name: "prompt method",
  meta: import.meta,
  osSuffix: ["windows"],
  steps: {
    "should check an option": {
      stdin: ansi
        // input
        .text("f")
        .text("o")
        .text("o")
        .text("\n")
        // number
        .text("4")
        .text("3")
        .text("\n")
        // confirm
        .text("y")
        .text("\n")
        // toggle
        .text("y")
        .text("n")
        .text("y")
        .text("\n")
        // checkbox
        .cursorDown
        .text(" ")
        .cursorDown
        .text(" ")
        .text("\n")
        .text("\n")
        // select
        .cursorDown
        .text("\n")
        .toArray(),
    },
  },
  async fn() {
    const checkboxOptions: PromptOptions<
      "checkbox",
      typeof Checkbox,
      { input?: string }
    > = {
      name: "checkbox",
      type: Checkbox,
      message: "Select an option",
      options: [
        { name: "Foo", value: "foo" },
        { name: "Bar", value: "bar" },
        { name: "Baz", value: "baz" },
      ],
      before({ input }, next) {
        console.log("[checkbox:before] input is:", input);
        return next();
      },
    };

    const result = await prompt([
      {
        name: "input",
        type: Input,
        message: "Enter some text",
        default: "default value",
      },
      {
        name: "number",
        type: Number,
        message: "Enter a number",
      },
      {
        name: "confirm",
        type: Confirm,
        message: "Please confirm",
      },
      {
        name: "toggle",
        type: Toggle,
        message: "Please toggle",
        hint: "some hint",
        default: false,
      },
      checkboxOptions,
      {
        name: "select",
        type: Select<number>,
        message: "Select a value",
        options: [1, 2, 3],
      },
    ], {
      reader: Deno.stdin,
      writer: Deno.stderr,
    });

    assertType<
      IsExact<typeof result, {
        select?: number | undefined;
        checkbox?: string[] | undefined;
        input?: string | undefined;
        number?: number | undefined;
        confirm?: boolean | undefined;
        toggle?: boolean | undefined;
      }>
    >(true);

    assertEquals(result, {
      input: "foo",
      number: 43,
      confirm: true,
      toggle: true,
      checkbox: ["bar", "baz"],
      select: 2,
    });

    assertType<
      IsExact<
        typeof checkboxOptions,
        & {
          name: "checkbox";
          before?: PromptMiddleware<
            { checkbox?: Array<string>; input?: string }
          >;
          after?: PromptMiddleware<
            { checkbox?: Array<string>; input?: string }
          >;
        }
        & CheckboxOptions<string>
        & { type: typeof Checkbox }
      >
    >(true);

    console.log(result);
  },
});

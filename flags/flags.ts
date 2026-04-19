import { getArgs } from "@cliffy/internal/runtime/get-args";
import {
  getDefaultValue,
  getOption,
  matchWildCardOptions,
  paramCaseToCamelCase,
} from "./_utils.ts";
import {
  DuplicateOptionError,
  InvalidOptionError,
  InvalidOptionValueError,
  MissingOptionValueError,
  UnexpectedArgumentAfterVariadicArgumentError,
  UnexpectedOptionValueError,
  UnexpectedRequiredArgumentError,
  UnknownConflictingOptionError,
  UnknownOptionError,
  UnknownRequiredOptionError,
  UnknownTypeError,
} from "./_errors.ts";
import type {
  ArgumentOptions,
  ArgumentType,
  FlagOptions,
  ParseFlagsContext,
  ParseFlagsOptions,
  TypeHandler,
} from "./types.ts";
import { boolean } from "./types/boolean.ts";
import { number } from "./types/number.ts";
import { string } from "./types/string.ts";
import { validateFlags } from "./_validate_flags.ts";
import { integer } from "./types/integer.ts";

const DefaultTypes: Record<ArgumentType, TypeHandler> = {
  string,
  number,
  integer,
  boolean,
};

/**
 * Command-line arguments parser with built-in validations.
 *
 * The `parseFlags` method takes as its first argument the arguments to be parsed,
 * usually `Deno.args`, or a {@linkcode ParseFlagsContext}. As the second
 * argument you can define {@linkcode ParseFlagsOptions}.
 *
 * ### Basic usage
 *
 * If `parseFlags` is called without defining specific flags with the options
 * object, all arguments are parsed and added to the flags object returned by the
 * `parseFlags` method. All non-options arguments are added to the `unknown` array
 * and all flags specified after the double dash (`--`) are added to the `literal`
 * array.
 *
 * @example Parse arguments without validation
 *
 * ```typescript
 * import { parseFlags } from "https://deno.land/x/cliffy/flags/mod.ts";
 *
 * console.log(parseFlags(Deno.args));
 * ```
 *
 * ```console
 * $ deno run https://deno.land/x/cliffy/examples/flags/flags.ts -a foo -b bar
 * {
 *   flags: { a: "foo", b: "bar" },
 *   literal: [],
 *   unknown: [],
 *   stopEarly: false,
 *   stopOnUnknown: false
 * }
 *
 * $ deno run https://deno.land/x/cliffy/examples/flags/flags.ts \
 *     -x 3 \
 *     -y.z -n5 \
 *     -abc \
 *     --beep=boop \
 *     foo bar baz \
 *     --deno.land \
 *     --deno.com -- --cliffy
 * {
 *   flags: {
 *     x: "3",
 *     y: { z: true },
 *     n: "5",
 *     a: true,
 *     b: true,
 *     c: true,
 *     beep: "boop",
 *     deno: { land: true, com: true }
 *   },
 *   literal: [ "--cliffy" ],
 *   unknown: [ "foo", "bar", "baz" ],
 *   stopEarly: false,
 *   stopOnUnknown: false
 * }
 * ```
 *
 * ### Define flags
 *
 * You can specify flags with the options object. For all unknown or invalid flags
 * an `ValidationError` is thrown. Read more about error handling
 * [here](./error_handling.md). A list of all available flag options can be found
 * [here](./flag_options.md).
 *
 * @example Parse flags with validation
 *
 * ```typescript
 * import { parseFlags } from "https://deno.land/x/cliffy/flags/mod.ts";
 *
 * const { flags } = parseFlags(Deno.args, {
 *   flags: [{
 *     name: "help",
 *     aliases: ["h"],
 *     standalone: true,
 *   }, {
 *     name: "verbose",
 *     aliases: ["v"],
 *     collect: true,
 *     value: (val: boolean, previous = 0) => val ? previous + 1 : 0,
 *   }, {
 *     name: "file",
 *     aliases: ["f"],
 *     type: "string",
 *   }],
 * });
 *
 * console.log(flags);
 * ```
 *
 * ```console
 * $ deno run https://deno.land/x/cliffy/examples/flags/options.ts -vvv -f ./example.ts
 * { verbose: 3, file: "./example.ts" }
 * ```
 *
 * ### Parse context
 *
 * The `parseFlags` method accepts also a parse context as first argument. The
 * context can either be a manually created object or the result of a previously
 * called `parseFlags` method.
 *
 * This can be used to parse command line flags in multiple steps, for example,
 * when parsing options that precede a subcommand.
 *
 * @example Pre-parsing global options
 *
 * ```ts
 * import { parseFlags } from "https://deno.land/x/cliffy/flags/mod.ts";
 *
 * const globalFlags = [{
 *   name: "foo-global",
 *   alias: ["g"],
 *   collect: true,
 * }];
 *
 * const flags = [{
 *   name: "foo",
 *   alias: ["f"],
 *   collect: true,
 * }];
 *
 * const args = ["--foo-global", "cmd1", "--foo-global", "--foo", "arg1", "--foo"];
 *
 * // Parse main command args (all flags until the first unknown argument).
 * const ctx = parseFlags(args, {
 *   flags: globalFlags,
 *   stopEarly: true, // Stop on first non option argument.
 *   stopOnUnknown: true, // Stop on first option argument.
 *   dotted: false, // Don't convert dotted option keys to nested objects.
 * });
 *
 * // Shift sub-command from arguments.
 * const subCommand = ctx.unknown.shift();
 *
 * // Parse all sub command args.
 * parseFlags(ctx, {
 *   flags: [
 *     ...globalFlags,
 *     ...flags,
 *   ],
 * });
 *
 * console.log("sub-command:", subCommand); // -> cmd1
 * console.log("options:", ctx.flags); // -> { fooGlobal: [ true, true ], foo: [ true, true ] }
 * console.log("arguments:", ctx.unknown); // -> [ "arg1" ]
 * ```
 *
 * @param argsOrCtx Command line arguments e.g: `Deno.args` or parse context.
 * @param opts      Parse options.
 */
export function parseFlags<
  TFlags extends Record<string, unknown>,
  TFlagOptions extends FlagOptions,
  TFlagsResult extends ParseFlagsContext,
>(
  argsOrCtx: string[] | Partial<TFlagsResult> = getArgs(),
  opts: ParseFlagsOptions<TFlagOptions> = {},
): TFlagsResult & ParseFlagsContext<TFlags, TFlagOptions> {
  let args: Array<string>;
  let ctx: ParseFlagsContext<Record<string, unknown>>;

  if (Array.isArray(argsOrCtx)) {
    ctx = {} as ParseFlagsContext<Record<string, unknown>>;
    args = argsOrCtx;
  } else {
    ctx = argsOrCtx as ParseFlagsContext<Record<string, unknown>>;
    args = argsOrCtx.unknown ?? [];
    argsOrCtx.unknown = [];
  }
  args = args.slice();

  ctx.flags ??= {};
  ctx.literal ??= [];
  ctx.unknown ??= [];
  ctx.stopEarly = false;
  ctx.stopOnUnknown = false;
  ctx.defaults ??= {};
  ctx.parsedFlags ??= [];

  opts.dotted ??= true;

  validateOptions(opts);
  const options = parseArgs(ctx, args, opts);
  validateFlags(ctx, opts, options);

  if (opts.dotted) {
    parseDottedOptions(ctx);
  }

  return ctx as TFlagsResult & ParseFlagsContext<TFlags, TFlagOptions>;
}

function validateOptions<TFlagOptions extends FlagOptions>(
  opts: ParseFlagsOptions<TFlagOptions>,
) {
  opts.flags?.forEach((opt) => {
    opt.depends?.forEach((flag) => {
      if (!opts.flags || !getOption(opts.flags, flag)) {
        throw new UnknownRequiredOptionError(flag, opts.flags ?? []);
      }
    });
    opt.conflicts?.forEach((flag) => {
      if (!opts.flags || !getOption(opts.flags, flag)) {
        throw new UnknownConflictingOptionError(flag, opts.flags ?? []);
      }
    });
  });
}

function parseArgs<TFlagOptions extends FlagOptions>(
  ctx: ParseFlagsContext<Record<string, unknown>>,
  args: Array<string>,
  opts: ParseFlagsOptions<TFlagOptions>,
): Map<string, FlagOptions> {
  /** Option name mapping: propertyName -> option.name */
  const optionsMap: Map<string, FlagOptions> = new Map();
  let inLiteral = false;

  for (
    let argsIndex = 0;
    argsIndex < args.length;
    argsIndex++
  ) {
    let option: FlagOptions | undefined;
    let current: string = args[argsIndex];
    let currentValue: string | undefined;
    let negate = false;

    // literal args after --
    if (inLiteral) {
      ctx.literal.push(current);
      continue;
    } else if (current === "--") {
      inLiteral = true;
      continue;
    } else if (ctx.stopEarly || ctx.stopOnUnknown) {
      ctx.unknown.push(current);
      continue;
    }

    const isFlag = current.length > 1 && current[0] === "-";

    if (!isFlag) {
      if (opts.stopEarly) {
        ctx.stopEarly = true;
      }
      ctx.unknown.push(current);
      continue;
    }
    const isShort = current[1] !== "-";
    const isLong = isShort ? false : current.length > 3 && current[2] !== "-";

    if (!isShort && !isLong) {
      throw new InvalidOptionError(current, opts.flags ?? []);
    }

    // normalize short flags: -abc => -a -b -c
    if (isShort && current.length > 2 && current[2] !== ".") {
      args.splice(argsIndex, 1, ...splitFlags(current));
      current = args[argsIndex];
    } else if (isLong && current.startsWith("--no-")) {
      negate = true;
    }

    // split value: --foo="bar=baz" => --foo bar=baz
    const equalSignIndex = current.indexOf("=");
    if (equalSignIndex !== -1) {
      currentValue = current.slice(equalSignIndex + 1) || undefined;
      current = current.slice(0, equalSignIndex);
    }

    if (opts.flags) {
      option = getOption(opts.flags, current);

      if (!option) {
        const name = current.replace(/^-+/, "");
        option = matchWildCardOptions(name, opts.flags);

        if (!option) {
          if (opts.stopOnUnknown) {
            ctx.stopOnUnknown = true;
            ctx.unknown.push(args[argsIndex]);
            continue;
          }
          throw new UnknownOptionError(current, opts.flags);
        }
      }
    } else {
      option = {
        name: current.replace(/^-+/, ""),
        optionalValue: true,
        type: "string",
      };
    }
    ctx.parsedFlags.push(args[argsIndex]);

    if (option.standalone) {
      ctx.standalone = option;
    }

    const positiveName: string = negate
      ? option.name.replace(/^no-?/, "")
      : option.name;
    const propName: string = paramCaseToCamelCase(positiveName);

    if (typeof ctx.flags[propName] !== "undefined") {
      if (!opts.flags?.length) {
        option.collect = true;
      } else if (!option.collect && !ctx.defaults[option.name]) {
        throw new DuplicateOptionError(current);
      }
    }

    if (option.type && !option.args?.length) {
      option.args = [{
        type: option.type,
        optional: option.optionalValue,
        variadic: option.variadic,
        list: option.list,
        separator: option.separator,
      }];
    }

    if (
      opts.flags?.length && !option.args?.length &&
      typeof currentValue !== "undefined"
    ) {
      throw new UnexpectedOptionValueError(option.name, currentValue);
    }

    let optionArgsIndex = 0;
    let inOptionalArg = false;
    const next = () => currentValue ?? args[argsIndex + 1];
    const previous = ctx.flags[propName];

    parseNext(option);

    if (typeof ctx.flags[propName] === "undefined") {
      if (option.args?.length && !option.args?.[optionArgsIndex].optional) {
        throw new MissingOptionValueError(option.name);
      } else if (
        typeof option.default !== "undefined" &&
        (option.type || option.value || option.args?.length)
      ) {
        ctx.flags[propName] = getDefaultValue(option);
      } else {
        setFlagValue(true);
      }
    }

    if (option.value) {
      const value = option.value(ctx.flags[propName], previous);
      setFlagValue(value);
    } else if (option.collect) {
      const value: unknown[] = typeof previous !== "undefined"
        ? (Array.isArray(previous) ? previous : [previous])
        : [];

      value.push(ctx.flags[propName]);
      setFlagValue(value);
    }

    optionsMap.set(propName, option);

    opts.option?.(option as TFlagOptions, ctx.flags[propName]);

    /** Parse next argument for current option. */
    // deno-lint-ignore no-inner-declarations
    function parseNext(option: FlagOptions): void {
      if (negate) {
        setFlagValue(false);
        return;
      } else if (!option.args?.length) {
        setFlagValue(undefined);
        return;
      }
      const arg: ArgumentOptions | undefined = option.args[optionArgsIndex];

      if (!arg) {
        const flag = next();
        throw new UnknownOptionError(flag, opts.flags ?? []);
      }

      if (!arg.type) {
        arg.type = "boolean";
      }

      // make boolean values optional by default
      if (
        !option.args?.length &&
        arg.type === "boolean" &&
        arg.optional === undefined
      ) {
        arg.optional = true;
      }

      if (arg.optional) {
        inOptionalArg = true;
      } else if (inOptionalArg) {
        throw new UnexpectedRequiredArgumentError(option.name);
      }

      let result: unknown;
      let increase = false;

      if (arg.list && hasNext(arg)) {
        const parsed: unknown[] = next()
          .split(arg.separator || ",")
          .map((nextValue: string) => {
            const value = parseValue(option, arg, nextValue);
            if (typeof value === "undefined") {
              throw new InvalidOptionValueError(
                option.name,
                arg.type ?? "?",
                nextValue,
              );
            }
            return value;
          });

        if (parsed?.length) {
          result = parsed;
        }
      } else {
        if (hasNext(arg)) {
          result = parseValue(option, arg, next());
        } else if (arg.optional && arg.type === "boolean") {
          result = true;
        }
      }

      if (increase && typeof currentValue === "undefined") {
        argsIndex++;
        if (!arg.variadic) {
          optionArgsIndex++;
        } else if (option.args[optionArgsIndex + 1]) {
          throw new UnexpectedArgumentAfterVariadicArgumentError(next());
        }
      }

      if (
        typeof result !== "undefined" &&
        (option.args.length > 1 || arg.variadic)
      ) {
        if (!ctx.flags[propName]) {
          setFlagValue([]);
        }

        (ctx.flags[propName] as Array<unknown>).push(result);

        if (hasNext(arg)) {
          parseNext(option);
        }
      } else {
        setFlagValue(result);
      }

      /** Check if current option should have an argument. */
      function hasNext(arg: ArgumentOptions): boolean {
        if (!option.args?.length) {
          return false;
        }
        const nextValue = next();
        if (!nextValue) {
          return false;
        }
        if (option.args.length > 1 && optionArgsIndex >= option.args.length) {
          return false;
        }
        let nextOption: FlagOptions | undefined;
        if (
          !arg.optional &&
          (!arg.variadic ||
            !(nextOption = getOption(opts.flags ?? [], nextValue)))
        ) {
          return true;
        }
        // require optional values to be called with an equal sign: foo=bar
        if (
          option.equalsSign && arg.optional && !arg.variadic &&
          typeof currentValue === "undefined"
        ) {
          return false;
        }
        if (
          (arg.optional || arg.variadic) &&
          !(nextOption ?? getOption(opts.flags ?? [], nextValue))
        ) {
          return nextValue[0] !== "-" ||
            typeof currentValue !== "undefined" ||
            (arg.type === "number" && !isNaN(Number(nextValue)));
        }

        return false;
      }

      /** Parse argument value.  */
      function parseValue(
        option: FlagOptions,
        arg: ArgumentOptions,
        value: string,
      ): unknown {
        if (equalSignIndex === -1) {
          ctx.parsedFlags.push(value);
        }
        const result: unknown = opts.parse
          ? opts.parse({
            label: "Option",
            type: arg.type || "string",
            name: `--${option.name}`,
            value,
          })
          : parseDefaultType(option, arg, value);

        if (typeof result !== "undefined") {
          increase = true;
        }

        return result;
      }
    }

    // deno-lint-ignore no-inner-declarations
    function setFlagValue(value: unknown) {
      ctx.flags[propName] = value;
      if (ctx.defaults[propName]) {
        delete ctx.defaults[propName];
      }
    }
  }

  return optionsMap;
}

function parseDottedOptions(ctx: ParseFlagsContext): void {
  // convert dotted option keys into nested objects
  ctx.flags = Object.keys(ctx.flags).reduce(
    (result: Record<string, unknown>, key: string) => {
      if (~key.indexOf(".")) {
        key.split(".").reduce(
          (
            // deno-lint-ignore no-explicit-any
            result: Record<string, any>,
            subKey: string,
            index: number,
            parts: string[],
          ) => {
            if (index === parts.length - 1) {
              result[subKey] = ctx.flags[key];
            } else {
              result[subKey] = result[subKey] ?? {};
            }
            return result[subKey];
          },
          result,
        );
      } else {
        result[key] = ctx.flags[key];
      }
      return result;
    },
    {},
  );
}

function splitFlags(flag: string): Array<string> {
  flag = flag.slice(1);
  const normalized: Array<string> = [];
  const index = flag.indexOf("=");
  const flags = (index !== -1 ? flag.slice(0, index) : flag).split("");

  if (isNaN(Number(flag[flag.length - 1]))) {
    flags.forEach((val) => normalized.push(`-${val}`));
  } else {
    normalized.push(`-${flags.shift()}`);
    if (flags.length) {
      normalized.push(flags.join(""));
    }
  }

  if (index !== -1) {
    normalized[normalized.length - 1] += flag.slice(index);
  }

  return normalized;
}

function parseDefaultType(
  option: FlagOptions,
  arg: ArgumentOptions,
  value: string,
): unknown {
  const type: ArgumentType = arg.type as ArgumentType || "string";
  const parseType = DefaultTypes[type];

  if (!parseType) {
    throw new UnknownTypeError(type, Object.keys(DefaultTypes));
  }

  return parseType({
    label: "Option",
    type,
    name: `--${option.name}`,
    value,
  });
}

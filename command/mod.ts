/**
 * A TypeScript-first, runtime-agnostic command-line framework, that provides a fluent, declarative API for building complex CLI applications.
 *
 * The command module supports typed options and arguments, input validation, auto
 * generated help, shell completions, upgrade providers and more.
 *
 * > [!NOTE]\
 * > The full documentation can be found at
 * > [cliffy.io](https://cliffy.io/docs/command).
 *
 * ## Examples
 *
 * Some example CLIs.
 *
 * ### Hello world
 *
 * A simple hello world example.
 *
 * ```ts
 * import { Command } from "@cliffy/command";
 *
 * await new Command()
 *   .name("hello-world")
 *   .description("A simple Hello World CLI.")
 *   .version("v1.0.0")
 *   .action(() => {
 *     console.log("Hello, World!");
 *   })
 *   .parse(Deno.args);
 * ```
 *
 * ### Volume converter
 *
 * A CLI to convert volume from liters to gallons or vice versa with.
 *
 * ```ts
 * import { Command, EnumType } from "@cliffy/command";
 * import { HelpCommand } from "@cliffy/command/help";
 * import { CompletionsCommand } from "@cliffy/command/completions";
 *
 * await new Command()
 *   .name("volume-converter")
 *   .description("A simple volume converter CLI.")
 *   .version("v1.0.0")
 *   .type("unit", new EnumType(["l", "gal"]))
 *   .option("-u, --unit [unit:unit]", "Unit of the volume.", { default: "l" })
 *   .arguments("<volume:number>")
 *   .action(({ unit }, volume) => {
 *     if (unit === "l") {
 *       const gallons = volume * 0.264172;
 *       console.log(`${volume} L is ${gallons.toFixed(2)} gal.`);
 *     } else {
 *       const liters = volume / 0.264172;
 *       console.log(`${volume} gal is ${liters.toFixed(2)} L.`);
 *     }
 *   })
 *   .command("help", new HelpCommand())
 *   .command("completions", new CompletionsCommand())
 *   .parse(Deno.args);
 * ```
 *
 * @module
 */
export type {
  ActionHandler,
  Argument,
  ArgumentValue,
  CommandOptions,
  CommandResult,
  CompleteHandler,
  CompleteHandlerResult,
  CompleteOptions,
  Completion,
  DefaultValue,
  Description,
  DescriptionHandler,
  EnvVar,
  EnvVarOptions,
  EnvVarValueHandler,
  ErrorHandler,
  Example,
  GlobalEnvVarOptions,
  GlobalOptionOptions,
  HelpHandler,
  Option,
  OptionOptions,
  OptionValueHandler,
  TypeDef,
  TypeHandler,
  TypeOptions,
  TypeOrTypeHandler,
  ValuesHandlerResult,
  VersionHandler,
} from "./types.ts";
export { Command } from "./command.ts";
export { ActionListType } from "./types/action_list.ts";
export { BooleanType } from "./types/boolean.ts";
export { ChildCommandType } from "./types/child_command.ts";
export { CommandType } from "./types/command.ts";
export { EnumType } from "./types/enum.ts";
export { FileType } from "./types/file.ts";
export { IntegerType } from "./types/integer.ts";
export { NumberType } from "./types/number.ts";
export { SecretType } from "./types/secret.ts";
export { StringType } from "./types/string.ts";
export { type InferType, Type } from "./type.ts";
export { ValidationError, type ValidationErrorOptions } from "./_errors.ts";

// deno-lint-ignore-file no-explicit-any
import {
  parseFlags,
  type ParseFlagsContext,
  UnknownTypeError,
  ValidationError as FlagsValidationError,
} from "@cliffy/flags";
import { bold, brightBlue, red } from "@std/fmt/colors";
import type {
  IsRequired,
  MapTypes,
  MapValue,
  MergeOptions,
  TypedArgument,
  TypedArguments,
  TypedArgumentValue,
  TypedCommandArguments,
  TypedEnv,
  TypedOption,
  TypedType,
} from "./_argument_types.ts";
import {
  CommandNotFoundError,
  DefaultCommandNotFoundError,
  DuplicateCommandAliasError,
  DuplicateCommandNameError,
  DuplicateCompletionError,
  DuplicateEnvVarError,
  DuplicateExampleError,
  DuplicateOptionNameError,
  DuplicateTypeError,
  MissingArgumentError,
  MissingArgumentsError,
  MissingCommandNameError,
  MissingRequiredEnvVarError,
  NoArgumentsAllowedError,
  TooManyArgumentsError,
  TooManyEnvVarValuesError,
  UnexpectedOptionalEnvVarValueError,
  UnexpectedVariadicEnvVarValueError,
  UnknownCommandError,
  ValidationError,
} from "./_errors.ts";
import { exit } from "@cliffy/internal/runtime/exit";
import { getArgs } from "@cliffy/internal/runtime/get-args";
import { getEnv } from "@cliffy/internal/runtime/get-env";
import type { Merge, Mutable, OneOf, ValueOf } from "./_type_utils.ts";
import {
  getDescription,
  parseArgumentsDefinition,
  splitArguments,
  underscoreToCamelCase,
} from "./_utils.ts";
import { HelpGenerator, type HelpOptions } from "./help/_help_generator.ts";
import { Type } from "./type.ts";
import type {
  ActionHandler,
  Argument,
  ArgumentValue,
  ArgumentValueHandler,
  CommandArgumentOptions,
  CommandResult,
  CompleteHandler,
  CompleteOptions,
  Completion,
  DefaultText,
  DefaultValue,
  Description,
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
  TypeOptions,
  TypeOrTypeHandler,
  VersionHandler,
} from "./types.ts";
import { BooleanType } from "./types/boolean.ts";
import { FileType } from "./types/file.ts";
import { IntegerType } from "./types/integer.ts";
import { NumberType } from "./types/number.ts";
import { SecretType } from "./types/secret.ts";
import { StringType } from "./types/string.ts";
import { checkVersion } from "./upgrade/_check_version.ts";

export interface ArgDefinition extends CommandArgumentOptions<any, any, any> {
  arg: string;
  description?: string;
}

interface CommandSettings {
  name: string;
  version?: VersionHandler;
  help?: HelpHandler;
  errorHandler?: ErrorHandler;
  actionHandler?: ActionHandler;
  globalActionHandler?: ActionHandler;
  description: Description;
  usage?: string;
  examples: Array<Example>;
  aliases: Array<string>;
  arguments?: Array<ArgDefinition>;
  throwOnError?: boolean;
  allowEmpty?: boolean;
  stopEarly?: boolean;
  defaultCommand?: string;
  useRawArgs?: boolean;
  isHidden?: boolean;
  isGlobal?: boolean;
  shouldExit?: boolean;
  noGlobals?: boolean;
  meta: Record<string, string>;
  commands: Map<string, Command<any>>;
  versionOptions?: DefaultOption | false;
  helpOptions?: DefaultOption | false;
}

interface CommandProps {
  rawArgs: Array<string>;
  literalArgs: Array<string>;
  hasDefaults?: boolean;
  globalParent?: Command<any>;
  args: Array<Argument>;
  versionOption?: Option;
  helpOption?: Option;
  isRoot?: boolean;
}

interface BuilderProps {
  groupName: string | null;
  types: Map<string, TypeDef>;
  options: Array<Option>;
  envVars: Array<EnvVar>;
  completions: Map<string, Completion>;
}

export interface SubCommandOptions {
  override?: boolean;
}

/**
 * Chainable command factory class.
 *
 * The command class can be used to create main and sub commands. All methods
 * from the command class are chainable. Options, arguments, types, etc. that
 * belong to the main command, should be registered before the first sub-command
 * is registered. All options, arguments, etc. that are registered after calling
 * the `.command()` method will be registered to that child-command.
 *
 * When calling the `.reset()` method, options, arguments, etc. will be
 * registered again to the main command.
 *
 * @example Todo cli
 *
 * ```ts
 * import { Command } from "./mod.ts";
 *
 * export const cli = new Command()
 *   .name("todo")
 *   .description("Todo cli.")
 *   .globalOption("--verbose", "Enable verbose output.")
 *   .globalEnv("VERBOSE=<value>", "Enable verbose output.")
 *   .command("add <todo>", "Add todo.")
 *   .action(({ verbose }, todo: string) => {
 *     if (verbose) {
 *       console.log("Add todo '%s'.", todo);
 *     }
 *   })
 *   .command("delete <id>", "Delete todo.")
 *   .action(({ verbose }, id: string) => {
 *     if (verbose) {
 *       console.log("Delete todo with id '%s'.", id);
 *     }
 *   });
 *
 * if (import.meta.main) {
 *   await cli.parse();
 * }
 * ```
 *
 * @example Use command instance as child command
 *
 * ```ts
 * import { Command } from "./mod.ts";
 *
 * export const addCommand = new Command<{ verbose?: boolean }>()
 *   .description("Add todo.")
 *   .arguments("<todo>")
 *   .action(({ verbose }, todo: string) => {
 *     if (verbose) {
 *       console.log("Add todo '%s'.", todo);
 *     }
 *   });
 *
 * export const deleteCommand = new Command<{ verbose?: boolean }>()
 *   .description("Delete todo.")
 *   .arguments("<id>")
 *   .action(({ verbose }, id: string) => {
 *     if (verbose) {
 *       console.log("Delete todo with id '%s'.", id);
 *     }
 *   });
 *
 * export const cli = new Command()
 *   .name("todo")
 *   .description("Todo cli.")
 *   .globalOption("--verbose", "Enable verbose output.")
 *   .globalEnv("VERBOSE=<value:boolean>", "Enable verbose output.")
 *   .command("add", addCommand)
 *   .command("delete", deleteCommand);
 *
 * if (import.meta.main) {
 *   await cli.parse();
 * }
 * ```
 */
export class Command<
  TParentCommandGlobals extends Record<string, unknown> | void = void,
  TParentCommandTypes extends Record<string, unknown> | void =
    TParentCommandGlobals extends number ? any : void,
  TCommandOptions extends Record<string, unknown> | void =
    TParentCommandGlobals extends number ? any : void,
  TCommandArguments extends Array<unknown> = TParentCommandGlobals extends
    number ? any : [],
  TCommandGlobals extends Record<string, unknown> | void =
    TParentCommandGlobals extends number ? any : void,
  TCommandTypes extends Record<string, unknown> | void =
    TParentCommandGlobals extends number ? any : {
      number: number;
      integer: number;
      string: string;
      boolean: boolean;
      file: string;
      secret: string;
    },
  TCommandGlobalTypes extends Record<string, unknown> | void =
    TParentCommandGlobals extends number ? any : void,
  TParentCommand extends Command<any> | undefined =
    TParentCommandGlobals extends number ? any : undefined,
> {
  cmd: Command<any> = this;
  parent?: TParentCommand;
  props: CommandProps = {
    rawArgs: [],
    literalArgs: [],
    args: [],
  };
  settings: CommandSettings = {
    name: "COMMAND",
    description: "",
    examples: [],
    aliases: [],
    meta: {},
    commands: new Map<string, Command<any>>(),
  };
  builder: BuilderProps = {
    groupName: null,
    types: new Map(),
    options: [],
    envVars: [],
    completions: new Map<string, Completion>(),
  };

  /** Disable version option. */
  public versionOption(enable: false): this;

  /**
   * Set global version option.
   *
   * @param flags The flags of the version option.
   * @param desc  The description of the version option.
   * @param opts  Version option options.
   */
  public versionOption(
    flags: string,
    desc?: string,
    opts?:
      & OptionOptions<
        Partial<TCommandOptions>,
        TCommandArguments,
        TCommandGlobals,
        TParentCommandGlobals,
        TCommandTypes,
        TCommandGlobalTypes,
        TParentCommandTypes,
        TParentCommand
      >
      & {
        global: true;
      },
  ): this;

  /**
   * Set version option.
   *
   * @param flags The flags of the version option.
   * @param desc  The description of the version option.
   * @param opts  Version option options.
   */
  public versionOption(
    flags: string,
    desc?: string,
    opts?: OptionOptions<
      TCommandOptions,
      TCommandArguments,
      TCommandGlobals,
      TParentCommandGlobals,
      TCommandTypes,
      TCommandGlobalTypes,
      TParentCommandTypes,
      TParentCommand
    >,
  ): this;

  /**
   * Set version option.
   *
   * @param flags The flags of the version option.
   * @param desc  The description of the version option.
   * @param opts  The action of the version option.
   */
  public versionOption(
    flags: string,
    desc?: string,
    opts?: ActionHandler<
      TCommandOptions,
      TCommandArguments,
      TCommandGlobals,
      TParentCommandGlobals,
      TCommandTypes,
      TCommandGlobalTypes,
      TParentCommandTypes,
      TParentCommand
    >,
  ): this;

  public versionOption(
    flags: string | false,
    desc?: string,
    opts?:
      | ActionHandler<
        TCommandOptions,
        TCommandArguments,
        TCommandGlobals,
        TParentCommandGlobals,
        TCommandTypes,
        TCommandGlobalTypes,
        TParentCommandTypes,
        TParentCommand
      >
      | OptionOptions<
        TCommandOptions,
        TCommandArguments,
        TCommandGlobals,
        TParentCommandGlobals,
        TCommandTypes,
        TCommandGlobalTypes,
        TParentCommandTypes,
        TParentCommand
      >
      | OptionOptions<
        Partial<TCommandOptions>,
        TCommandArguments,
        TCommandGlobals,
        TParentCommandGlobals,
        TCommandTypes,
        TCommandGlobalTypes,
        TParentCommandTypes,
        TParentCommand
      >
        & {
          global: true;
        },
  ): this {
    this.settings.versionOptions = flags === false ? flags : {
      flags,
      desc,
      opts: typeof opts === "function" ? { action: opts } : opts,
    };
    return this;
  }

  /** Disable help option. */
  public helpOption(enable: false): this;

  /**
   * Set global help option.
   *
   * @param flags The flags of the help option.
   * @param desc  The description of the help option.
   * @param opts  Help option options.
   */
  public helpOption(
    flags: string,
    desc?: string,
    opts?:
      & OptionOptions<
        Partial<TCommandOptions>,
        TCommandArguments,
        TCommandGlobals,
        TParentCommandGlobals,
        TCommandTypes,
        TCommandGlobalTypes,
        TParentCommandTypes,
        TParentCommand
      >
      & {
        global: true;
      },
  ): this;

  /**
   * Set help option.
   *
   * @param flags The flags of the help option.
   * @param desc  The description of the help option.
   * @param opts  Help option options.
   */
  public helpOption(
    flags: string,
    desc?: string,
    opts?: OptionOptions<
      TCommandOptions,
      TCommandArguments,
      TCommandGlobals,
      TParentCommandGlobals,
      TCommandTypes,
      TCommandGlobalTypes,
      TParentCommandTypes,
      TParentCommand
    >,
  ): this;

  /**
   * Set help option.
   *
   * @param flags The flags of the help option.
   * @param desc  The description of the help option.
   * @param opts  The action of the help option.
   */
  public helpOption(
    flags: string,
    desc?: string,
    opts?: ActionHandler<
      TCommandOptions,
      TCommandArguments,
      TCommandGlobals,
      TParentCommandGlobals,
      TCommandTypes,
      TCommandGlobalTypes,
      TParentCommandTypes,
      TParentCommand
    >,
  ): this;

  public helpOption(
    flags: string | false,
    desc?: string,
    opts?:
      | ActionHandler<
        TCommandOptions,
        TCommandArguments,
        TCommandGlobals,
        TParentCommandGlobals,
        TCommandTypes,
        TCommandGlobalTypes,
        TParentCommandTypes,
        TParentCommand
      >
      | OptionOptions<
        TCommandOptions,
        TCommandArguments,
        TCommandGlobals,
        TParentCommandGlobals,
        TCommandTypes,
        TCommandGlobalTypes,
        TParentCommandTypes,
        TParentCommand
      >
      | OptionOptions<
        Partial<TCommandOptions>,
        TCommandArguments,
        TCommandGlobals,
        TParentCommandGlobals,
        TCommandTypes,
        TCommandGlobalTypes,
        TParentCommandTypes,
        TParentCommand
      >
        & {
          global: true;
        },
  ): this {
    this.settings.helpOptions = flags === false ? flags : {
      flags,
      desc,
      opts: typeof opts === "function" ? { action: opts } : opts,
    };
    return this;
  }

  /**
   * Add new sub-command.
   *
   * @param name      Command definition. E.g: `my-command <input-file:string> <output-file:string>`
   * @param cmd       The new child command to register.
   * @param options   Sub-command options.
   */
  public command<
    TCommand extends Command<
      (TGlobalOptions & Record<string, unknown>) | void | undefined,
      TGlobalTypes | void | undefined,
      Record<string, unknown> | void,
      Array<unknown>,
      Record<string, unknown> | void,
      Record<string, unknown> | void,
      Record<string, unknown> | void,
      Command<
        TGlobalOptions | void | undefined,
        TGlobalTypes | void | undefined,
        Record<string, unknown> | void,
        Array<unknown>,
        Record<string, unknown> | void,
        Record<string, unknown> | void,
        Record<string, unknown> | void,
        undefined
      >
    >,
    TGlobalOptions
      extends (TParentCommand extends Command<any> ? TParentCommandGlobals
        : Merge<TParentCommandGlobals, TCommandGlobals>),
    TGlobalTypes
      extends (TParentCommand extends Command<any> ? TParentCommandTypes
        : Merge<TParentCommandTypes, TCommandTypes>),
  >(
    name: string,
    cmd: TCommand,
    options?: SubCommandOptions,
  ): ReturnType<TCommand["reset"]> extends Command<
    Record<string, unknown> | void,
    Record<string, unknown> | void,
    infer Options,
    infer Arguments,
    infer GlobalOptions,
    infer Types,
    infer GlobalTypes,
    undefined
  > ? Command<
      TGlobalOptions,
      TGlobalTypes,
      Options,
      Arguments,
      GlobalOptions,
      Types,
      GlobalTypes,
      OneOf<TParentCommand, this>
    >
    : never;

  /**
   * Add new sub-command.
   *
   * @param name      Command definition. E.g: `my-command <input-file:string> <output-file:string>`
   * @param cmd       The new child command to register.
   * @param options   Sub-command options.
   */
  public command<
    TCommand extends Command<
      TGlobalOptions | void | undefined,
      TGlobalTypes | void | undefined,
      Record<string, unknown> | void,
      Array<unknown>,
      Record<string, unknown> | void,
      Record<string, unknown> | void,
      Record<string, unknown> | void,
      OneOf<TParentCommand, this> | undefined
    >,
    TGlobalOptions
      extends (TParentCommand extends Command<any> ? TParentCommandGlobals
        : Merge<TParentCommandGlobals, TCommandGlobals>),
    TGlobalTypes
      extends (TParentCommand extends Command<any> ? TParentCommandTypes
        : Merge<TParentCommandTypes, TCommandTypes>),
  >(
    name: string,
    cmd: TCommand,
    options?: SubCommandOptions,
  ): TCommand extends Command<
    Record<string, unknown> | void,
    Record<string, unknown> | void,
    infer Options,
    infer Arguments,
    infer GlobalOptions,
    infer Types,
    infer GlobalTypes,
    OneOf<TParentCommand, this> | undefined
  > ? Command<
      TGlobalOptions,
      TGlobalTypes,
      Options,
      Arguments,
      GlobalOptions,
      Types,
      GlobalTypes,
      OneOf<TParentCommand, this>
    >
    : never;

  /**
   * Add new sub-command.
   *
   * @param nameAndArguments  Command definition. E.g: `my-command <input-file:string> <output-file:string>`
   * @param desc              The description of the new child command.
   * @param options           Sub-command options.
   */
  public command<
    TNameAndArguments extends string,
    TArguments extends TypedCommandArguments<
      TNameAndArguments,
      TParentCommand extends Command<any> ? TParentCommandTypes
        : Merge<TParentCommandTypes, TCommandGlobalTypes>
    >,
  >(
    nameAndArguments: TNameAndArguments,
    desc?: string,
    options?: SubCommandOptions,
  ): TParentCommandGlobals extends number ? Command<any> : Command<
    TParentCommand extends Command<any> ? TParentCommandGlobals
      : Merge<TParentCommandGlobals, TCommandGlobals>,
    TParentCommand extends Command<any> ? TParentCommandTypes
      : Merge<TParentCommandTypes, TCommandGlobalTypes>,
    void,
    TArguments,
    void,
    void,
    void,
    OneOf<TParentCommand, this>
  >;

  /**
   * Add new sub-command.
   * @param nameAndArguments  Command definition. E.g: `my-command <input-file:string> <output-file:string>`
   * @param cmdOrDescription  The description of the new child command.
   * @param options           Sub-command options.
   */
  command(
    nameAndArguments: string,
    cmdOrDescription?: Command<any> | string,
    { override }: SubCommandOptions = {},
  ): Command<any> {
    this.reset();

    const result = splitArguments(nameAndArguments);

    const name: string | undefined = result.flags.shift();
    const aliases: string[] = result.flags;

    if (!name) {
      throw new MissingCommandNameError();
    }

    if (this.getBaseCommand(name, true)) {
      if (!override) {
        throw new DuplicateCommandNameError(name);
      }
      this.removeCommand(name);
    }

    let description: string | undefined;
    let cmd: Command<any>;

    if (typeof cmdOrDescription === "string") {
      description = cmdOrDescription;
    }

    if (cmdOrDescription instanceof Command) {
      cmd = cmdOrDescription.reset();
    } else {
      cmd = new Command();
    }

    cmd.settings.name = name;
    cmd.parent = this;

    if (description) {
      cmd.description(description);
    }

    if (result.typeDefinition) {
      cmd.arguments(result.typeDefinition);
    }

    aliases.forEach((alias: string) => cmd.alias(alias));

    this.settings.commands.set(name, cmd);

    this.select(name);

    return this;
  }

  /**
   * Add new command alias.
   *
   * @param alias Tha name of the alias.
   */
  public alias(alias: string): this {
    if (
      this.cmd.settings.name === alias ||
      this.cmd.settings.aliases.includes(alias)
    ) {
      throw new DuplicateCommandAliasError(alias);
    }

    this.cmd.settings.aliases.push(alias);

    return this;
  }

  /** Reset internal command reference to main command. */
  public reset(): OneOf<TParentCommand, this> {
    this.builder.groupName = null;
    this.cmd = this;
    return this as OneOf<TParentCommand, this>;
  }

  /**
   * Set internal command pointer to child command with given name.
   * @param name The name of the command to select.
   */
  public select<
    TOptions extends Record<string, unknown> | void = any,
    TArguments extends Array<unknown> = any,
    TGlobalOptions extends Record<string, unknown> | void = any,
  >(
    name: string,
  ): Command<
    TParentCommandGlobals,
    TParentCommandTypes,
    TOptions,
    TArguments,
    TGlobalOptions,
    TCommandTypes,
    TCommandGlobalTypes,
    TParentCommand
  > {
    const cmd = this.getBaseCommand(name, true);

    if (!cmd) {
      throw new CommandNotFoundError(name, this.getBaseCommands(true));
    }

    this.cmd = cmd;

    return this as Command<any>;
  }

  /*****************************************************************************
   **** SUB HANDLER ************************************************************
   *****************************************************************************/

  /**
   * Set command name.
   *
   * This method is usually used to set the command name for the main command.
   * The name should match the name of your program. It is displayed in the auto
   * generated help and used for shell completions by default.
   *
   * When used on child command, the name will be overridden by the command name
   * passed to the parent command when the command is registered with the
   * {@linkcode Command.command}.
   *
   * @param name The name for the command.
   */
  public name(name: string): this {
    this.cmd.settings.name = name;
    return this;
  }

  /**
   * Set command version.
   *
   * Set the version of your cli. The version is displayed in the auto generated
   * help and the output from the [version](./help.md#version-option) option.
   *
   * @param version Semantic version string string or method that returns the version string.
   */
  public version(
    version:
      | string
      | VersionHandler<
        Partial<TCommandOptions>,
        Partial<TCommandArguments>,
        TCommandGlobals,
        TParentCommandGlobals,
        TCommandTypes,
        TCommandGlobalTypes,
        TParentCommandTypes,
        TParentCommand
      >,
  ): this {
    if (typeof version === "string") {
      this.cmd.settings.version = () => version;
    } else if (typeof version === "function") {
      this.cmd.settings.version = version;
    }
    return this;
  }

  /**
   * Add meta data. Will be displayed in the auto generated help and in the
   * output of the long version.
   *
   * @param name  The name/label of the metadata.
   * @param value The value of the metadata.
   */
  public meta(name: string, value: string): this {
    this.cmd.settings.meta[name] = value;
    return this;
  }

  /** Returns an object of metadata. */
  public getMeta(): Record<string, string>;

  /** Get metadata value by name. */
  public getMeta(name: string): string;

  public getMeta(name?: string): Record<string, string> | string {
    return typeof name === "undefined"
      ? this.settings.meta
      : this.settings.meta[name];
  }

  /**
   * Set command help.
   *
   * @param help Help string, method, or config for generator that returns the help string.
   */
  public help(
    help:
      | string
      | HelpHandler<
        Partial<TCommandOptions>,
        Partial<TCommandArguments>,
        TCommandGlobals,
        TParentCommandGlobals
      >
      | HelpOptions,
  ): this {
    if (typeof help === "string") {
      this.cmd.settings.help = () => help;
    } else if (typeof help === "function") {
      this.cmd.settings.help = help;
    } else {
      this.cmd.settings.help = (cmd: Command, options: HelpOptions): string =>
        HelpGenerator.generate(cmd, { ...help, ...options });
    }
    return this;
  }

  /**
   * Set the command description.
   *
   * The description will be displayed in the auto generated help. If the help
   * option is called with the short flag `-h`, only the first line is
   * displayed. If called with the long name `--help`, the full description is
   * displayed.
   *
   * For better multiline formatting, unnecessary indentations and empty leading
   * and trailing lines will be automatically removed.
   *
   * @example Multiline formatting
   *
   * For example, following description:
   *
   * ```ts
   * import { Command } from "https://deno.land/x/cliffy/command/mod.ts";
   *
   * new Command()
   *   .description(`
   *     This is a multiline description.
   *       The indentation of this line will be preserved.
   *   `);
   * ```
   *
   * is formatted as follows:
   *
   * ```console
   * This is a multiline description.
   *   The indentation of this line will be preserved.
   * ```
   *
   * @param description The command description.
   */
  public description(
    description: Description<
      TCommandOptions,
      TCommandArguments,
      TCommandGlobals,
      TParentCommandGlobals,
      TCommandTypes,
      TCommandGlobalTypes,
      TParentCommandTypes,
      TParentCommand
    >,
  ): this {
    this.cmd.settings.description = description;
    return this;
  }

  /**
   * Set the command usage. Defaults to arguments.
   *
   * With the `.usage()` method you can override the usage text that is
   * displayed at the top of the auto generated help. By default the command
   * arguments are used. The usage is always prefixed with the command name.
   *
   * @example Set custom usage
   *
   * ```ts
   * import { Command } from "https://deno.land/x/cliffy/command/mod.ts";
   *
   * await new Command()
   *   .name("script-runner")
   *   .description("Simple script runner.")
   *   .usage("[options] [script] [script options]")
   *   // ...
   *   .parse(Deno.args);
   * ```
   *
   * @param usage The command usage.
   */
  public usage(usage: string): this {
    this.cmd.settings.usage = usage;
    return this;
  }

  /** Hide command from help, completions, etc. */
  public hidden(): this {
    this.cmd.settings.isHidden = true;
    return this;
  }

  /** Make command globally available. */
  public global(): this {
    this.cmd.settings.isGlobal = true;
    return this;
  }

  /**
   * Set command arguments.
   *
   * You can use the {@linkcode Command.arguments} method to specify the
   * arguments for the command.
   *
   * This method will override any previously defined arguments.
   *
   * Angled brackets (e.g. `<required>`) indicate required input and
   * square brackets (e.g. `[optional]`) indicate optional input. A required
   * input cannot be defined after an optional input.
   *
   * Arguments can be also defined with the {@linkcode Command.command} method.
   *
   * Optionally you can define [types](./types.md) and
   * [completions](./shell_completions.md) for your arguments after the argument
   * name separated by colon. If no type is specified the type defaults to
   * `string`.
   *
   * @example Define arguments
   *
   * ```ts
   * import { Command } from "@cliffy/command";
   *
   * const cmd = new Command()
   *   .name("example")
   *   .arguments("<input-file:string> [output-file:string] [...tags:string]", [
   *     "The input file.",
   *     "The output file.",
   *     "Tags for the file."
   *   ]);
   *
   * // Parsing arguments
   * const { args } = await cmd.parse(["input.txt", "result.txt", "tag1", "tag2"]);
   *
   * console.log(args); // Output: ['input.txt', 'result.txt', 'tag1', 'tag2']
   * ```
   *
   * @example Use custom types in arguments
   *
   * ```typescript
   * import { Command, EnumType } from "@cliffy/command";
   *
   * await new Command()
   *   .type("color", new EnumType(["red", "blue"]))
   *   .arguments("<color:color>")
   *   .action((_, color: "red" | "blue") => {
   *     console.log("color:", color);
   *   })
   *   .parse(Deno.args);
   * ```
   *
   * @example Variadic arguments
   *
   * The last argument of a command can be variadic. To make an argument
   * variadic you can append or prepend `...` to the argument name (`<...NAME>`
   * or `<NAME...>`).
   *
   * Required rest arguments `<...args>` requires at least one argument, optional
   * rest args `[...args]` are completely optional.
   *
   * ```typescript
   * import { Command } from "https://deno.land/x/cliffy/command/mod.ts";
   *
   * await new Command()
   *   .description("Remove directories.")
   *   .arguments("<dirs...>")
   *   .action((_, ...dirs: Array<string>) => {
   *     for (const dir of dirs) {
   *       console.log("rmdir %s", dir);
   *     }
   *   })
   *   .parse(Deno.args);
   * ```
   *
   * ```console
   * $ deno run example.ts dir1 dir2 dir3
   * rmdir dir1
   * rmdir dir2
   * rmdir dir3
   * ```
   *
   * @param args         The arguments definition string.
   * @param descriptions The argument descriptions.
   * @returns            The command instance.
   */
  public arguments<
    TArguments extends TypedArguments<
      TArgs,
      Merge<TParentCommandTypes, Merge<TCommandGlobalTypes, TCommandTypes>>
    >,
    TArgs extends string = string,
  >(
    args: TArgs,
    descriptions?: Array<string>,
  ): Command<
    TParentCommandGlobals,
    TParentCommandTypes,
    TCommandOptions,
    TArguments,
    TCommandGlobals,
    TCommandTypes,
    TCommandGlobalTypes,
    TParentCommand
  > {
    this.cmd.settings.arguments = args.split(" ").map((arg, index) => ({
      arg,
      description: descriptions?.[index],
    }));
    return this as Command<any>;
  }

  /**
   * Add a new command argument.
   *
   * - When called multiple times, arguments are appended in the order of calls.
   * - When called after `arguments()`, the new argument is appended after the previously
   *   defined arguments.
   * - When called before `arguments()`, the new argument is overwritten by the later
   *   defined arguments.
   *
   * @example
   * ```ts
   * import { Command } from "@cliffy/command";
   *
   * const cmd = new Command()
   *   .name("example")
   *   .argument("<input-file:string>", "The input file.")
   *   .argument("[output-file:string]", "The output file.", { default: "out.txt" })
   *   .argument("[...tags:string]", "Tags for the file.");
   *
   * // Parsing arguments
   * const { args } = await cmd.parse(["input.txt", "result.txt", "tag1", "tag2"]);
   *
   * console.log(args); // Output: ['input.txt', 'result.txt', 'tag1', 'tag2']
   * ```
   *
   * @param arg         The argument definition. E.g: `<input-file:string>`
   * @param description The argument description.
   * @param opts        Argument options.
   * @returns           The command instance.
   */
  public argument<
    TArguments extends TypedArgument<
      TArg,
      Merge<TParentCommandTypes, Merge<TCommandGlobalTypes, TCommandTypes>>,
      TDefaultValue
    >,
    const TArg extends string = string,
    const TDefaultValue
      extends (TArg extends `${string}...${string}`
        ? ReadonlyArray<unknown> | undefined
        : unknown) = undefined,
    TMappedArguments = undefined,
    TValue = MapTypes<
      TypedArgumentValue<
        TArg,
        Merge<
          TParentCommandTypes,
          Merge<TCommandGlobalTypes, TCommandTypes>
        >,
        Mutable<TDefaultValue>
      >
    >,
  >(
    arg: TArg,
    description: string,
    opts?:
      | CommandArgumentOptions<TDefaultValue, TValue, TMappedArguments>
      | ArgumentValueHandler<TValue, TMappedArguments>,
  ): Command<
    TParentCommandGlobals,
    TParentCommandTypes,
    TCommandOptions,
    [
      ...TCommandArguments,
      ...TMappedArguments extends undefined ? TArguments
        : TArg extends `${string}...${string}`
          ? TMappedArguments extends ReadonlyArray<unknown> ? TMappedArguments
          : IsRequired<
            TArg extends `<${string}>` ? true : false,
            TDefaultValue
          > extends true ? [Awaited<TMappedArguments>]
          : [Awaited<TMappedArguments>?]
        : IsRequired<
          TArg extends `<${string}>` ? true : false,
          TDefaultValue
        > extends true ? [Awaited<TMappedArguments>]
        : [Awaited<TMappedArguments>?],
    ],
    TCommandGlobals,
    TCommandTypes,
    TCommandGlobalTypes,
    TParentCommand
  > {
    this.cmd.settings.arguments ??= [];
    this.cmd.settings.arguments.push({ arg, description, ...opts });
    return this as Command<any>;
  }

  /**
   * Set command callback method.
   *
   * @param fn Command action handler.
   */
  public action(
    fn: ActionHandler<
      TCommandOptions,
      TCommandArguments,
      TCommandGlobals,
      TParentCommandGlobals,
      TCommandTypes,
      TCommandGlobalTypes,
      TParentCommandTypes,
      TParentCommand
    >,
  ): this {
    this.cmd.settings.actionHandler = fn;
    return this;
  }

  /**
   * Set command callback method.
   *
   * @param fn Command action handler.
   */
  public globalAction(
    fn: ActionHandler<
      Partial<TCommandOptions>,
      Array<unknown>,
      TCommandGlobals,
      TParentCommandGlobals,
      TCommandTypes,
      TCommandGlobalTypes,
      TParentCommandTypes,
      TParentCommand
    >,
  ): this {
    this.cmd.settings.globalActionHandler = fn;
    return this;
  }

  /**
   * Don't throw an error if the command was called without arguments.
   *
   * @param allowEmpty Enable/disable allow empty.
   */
  public allowEmpty<TAllowEmpty extends boolean | undefined = undefined>(
    allowEmpty?: TAllowEmpty,
  ): false extends TAllowEmpty ? this
    : Command<
      Partial<TParentCommandGlobals>,
      TParentCommandTypes,
      Partial<TCommandOptions>,
      TCommandArguments,
      TCommandGlobals,
      TCommandTypes,
      TCommandGlobalTypes,
      TParentCommand
    > {
    this.cmd.settings.allowEmpty = allowEmpty !== false;
    return this as false extends TAllowEmpty ? this
      : Command<
        Partial<TParentCommandGlobals>,
        TParentCommandTypes,
        Partial<TCommandOptions>,
        TCommandArguments,
        TCommandGlobals,
        TCommandTypes,
        TCommandGlobalTypes,
        TParentCommand
      >;
  }

  /**
   * Enable stop early. If enabled, all arguments starting from the first non
   * option argument will be passed as arguments with type string to the command
   * action handler.
   *
   * For example:
   *     `command --debug-level warning server --port 80`
   *
   * Will result in:
   *     - options: `{ debugLevel: 'warning' }`
   *     - args: `['server', '--port', '80']`
   *
   * @param stopEarly Enable/disable stop early.
   */
  public stopEarly(stopEarly = true): this {
    this.cmd.settings.stopEarly = stopEarly;
    return this;
  }

  /**
   * Disable parsing arguments. If enabled the raw arguments will be passed to
   * the action handler. This has no effect for parent or child commands. Only
   * for the command on which this method was called.
   *
   * @param useRawArgs Enable/disable raw arguments.
   */
  public useRawArgs(
    useRawArgs = true,
  ): Command<
    void,
    void,
    void,
    Array<string>,
    void,
    void,
    void,
    TParentCommand
  > {
    this.cmd.settings.useRawArgs = useRawArgs;
    return this as Command<any>;
  }

  /**
   * Set default command.
   *
   * The default command is executed when the command was called without any
   * additional arguments.
   *
   * @param name Name of the default command.
   */
  public default(name: string): this {
    this.cmd.settings.defaultCommand = name;
    return this;
  }

  public globalType<
    THandler extends TypeOrTypeHandler<unknown>,
    TName extends string = string,
  >(
    name: TName,
    handler: THandler,
    options?: Omit<TypeOptions, "global">,
  ): Command<
    TParentCommandGlobals,
    TParentCommandTypes,
    TCommandOptions,
    TCommandArguments,
    TCommandGlobals,
    TCommandTypes,
    Merge<TCommandGlobalTypes, TypedType<TName, THandler>>,
    TParentCommand
  > {
    return this.type(name, handler, { ...options, global: true }) as Command<
      TParentCommandGlobals,
      TParentCommandTypes,
      TCommandOptions,
      TCommandArguments,
      TCommandGlobals,
      TCommandTypes,
      Merge<TCommandGlobalTypes, TypedType<TName, THandler>>,
      TParentCommand
    >;
  }

  /**
   * Register custom type.
   *
   * @param name    The name of the type.
   * @param handler The callback method to parse the type.
   * @param options Type options.
   */
  public type<
    THandler extends TypeOrTypeHandler<unknown>,
    TName extends string = string,
  >(
    name: TName,
    handler: THandler,
    options?: TypeOptions,
  ): Command<
    TParentCommandGlobals,
    TParentCommandTypes,
    TCommandOptions,
    TCommandArguments,
    TCommandGlobals,
    Merge<TCommandTypes, TypedType<TName, THandler>>,
    TCommandGlobalTypes,
    TParentCommand
  > {
    if (this.cmd.builder.types.get(name) && !options?.override) {
      throw new DuplicateTypeError(name);
    }

    this.cmd.builder.types.set(name, {
      ...options,
      name,
      handler: handler as TypeOrTypeHandler<unknown>,
    });

    if (
      handler instanceof Type &&
      (typeof handler.complete !== "undefined" ||
        typeof handler.values !== "undefined")
    ) {
      const completeHandler: CompleteHandler = (
        cmd: Command,
        parent?: Command,
      ) => handler.complete?.(cmd, parent) || [];
      this.complete(name, completeHandler, options);
    }

    return this as Command<any>;
  }

  /**
   * Register global complete handler.
   *
   * @param name      The name of the completion.
   * @param complete  The callback method to complete the type.
   * @param options   Complete options.
   */
  public globalComplete(
    name: string,
    complete: CompleteHandler,
    options?: Omit<CompleteOptions, "global">,
  ): this {
    return this.complete(name, complete, { ...options, global: true });
  }

  /**
   * Register global complete handler.
   *
   * @param name      The name of the completion.
   * @param complete  The callback method to complete the type.
   * @param options   Complete options.
   */
  public complete(
    name: string,
    complete: CompleteHandler<
      Partial<TCommandOptions>,
      Partial<TCommandArguments>,
      TCommandGlobals,
      TParentCommandGlobals,
      TCommandTypes,
      TCommandGlobalTypes,
      TParentCommandTypes,
      any
    >,
    options: CompleteOptions & { global: boolean },
  ): this;

  /**
   * Register complete handler.
   *
   * @param name      The name of the completion.
   * @param complete  The callback method to complete the type.
   * @param options   Complete options.
   */
  public complete(
    name: string,
    complete: CompleteHandler<
      TCommandOptions,
      TCommandArguments,
      TCommandGlobals,
      TParentCommandGlobals,
      TCommandTypes,
      TCommandGlobalTypes,
      TParentCommandTypes,
      TParentCommand
    >,
    options?: CompleteOptions,
  ): this;

  public complete(
    name: string,
    complete:
      | CompleteHandler<
        TCommandOptions,
        TCommandArguments,
        TCommandGlobals,
        TParentCommandGlobals,
        TCommandTypes,
        TCommandGlobalTypes,
        TParentCommandTypes,
        TParentCommand
      >
      | CompleteHandler<
        Partial<TCommandOptions>,
        Partial<TCommandArguments>,
        TCommandGlobals,
        TParentCommandGlobals,
        TCommandTypes,
        TCommandGlobalTypes,
        TParentCommandTypes,
        any
      >,
    options?: CompleteOptions,
  ): this {
    if (this.cmd.builder.completions.has(name) && !options?.override) {
      throw new DuplicateCompletionError(name);
    }

    this.cmd.builder.completions.set(name, {
      name,
      complete,
      ...options,
    });

    return this;
  }

  /**
   * Throw validation errors instead of calling `exit()` to handle
   * validation errors manually.
   *
   * A validation error is thrown when the command is wrongly used by the user.
   * For example: If the user passes some invalid options or arguments to the
   * command.
   *
   * This has no effect for parent commands. Only for the command on which this
   * method was called and all child commands.
   *
   * **Example:**
   *
   * ```ts
   * import { Command, ValidationError } from "./mod.ts";
   *
   * const cmd = new Command();
   * // ...
   *
   * try {
   *   cmd.parse();
   * } catch(error) {
   *   if (error instanceof ValidationError) {
   *     cmd.showHelp();
   *     Deno.exit(1);
   *   }
   *   throw error;
   * }
   * ```
   *
   * @see ValidationError
   */
  public throwErrors(): this {
    this.cmd.settings.throwOnError = true;
    return this;
  }

  /**
   * Set custom error handler.
   *
   * @param handler Error handler callback function.
   */
  public error(handler: ErrorHandler): this {
    this.cmd.settings.errorHandler = handler;
    return this;
  }

  /** Get error handler callback function. */
  private getErrorHandler(): ErrorHandler | undefined {
    return this.settings.errorHandler ??
      (this.parent && this.parent.settings.errorHandler);
  }

  /**
   * Same as `.throwErrors()` but also prevents calling `exit()` after
   * printing help or version with the --help and --version option.
   */
  public noExit(): this {
    this.cmd.settings.shouldExit = false;
    this.throwErrors();
    return this;
  }

  /**
   * Disable inheriting global commands, options and environment variables from
   * parent commands.
   */
  public noGlobals(): this {
    this.cmd.settings.noGlobals = true;
    return this;
  }

  /** Check whether the command should throw errors or exit. */
  protected shouldThrowErrors(): boolean {
    return this.settings.throwOnError || !!this.parent?.shouldThrowErrors();
  }

  /** Check whether the command should exit after printing help or version. */
  protected shouldExit(): boolean {
    return this.settings.shouldExit ?? this.parent?.shouldExit() ?? true;
  }

  /**
   * Enable grouping of options and set the name of the group.
   * All option which are added after calling the `.group()` method will be
   * grouped in the help output. If the `.group()` method can be use multiple
   * times to create more groups.
   *
   * @param name The name of the option group.
   */
  public group(name: string | null): this {
    this.cmd.builder.groupName = name;
    return this;
  }

  /**
   * Register a global option.
   *
   * @param flags Flags string e.g: -h, --help, --manual <requiredArg:string> [optionalArg:number] [...restArgs:string]
   * @param desc Flag description.
   * @param opts Flag options or custom handler for processing flag value.
   */
  public globalOption<
    TFlags extends string,
    TGlobalOptions extends TypedOption<
      TFlags,
      TCommandOptions,
      Merge<TParentCommandTypes, Merge<TCommandGlobalTypes, TCommandTypes>>,
      undefined extends TConflicts ? TRequired : false,
      TDefaultValue
    >,
    TMappedGlobalOptions extends MapValue<
      TGlobalOptions,
      TMappedValue,
      TCollect
    >,
    TRequired extends OptionOptions["required"] = undefined,
    TCollect extends OptionOptions["collect"] = undefined,
    TConflicts extends OptionOptions["conflicts"] = undefined,
    const TDefaultValue = undefined,
    TMappedValue = undefined,
  >(
    flags: TFlags,
    desc: string,
    opts?:
      | Omit<
        GlobalOptionOptions<
          Partial<TCommandOptions>,
          TCommandArguments,
          MergeOptions<TFlags, TCommandGlobals, TGlobalOptions>,
          TParentCommandGlobals,
          TCommandTypes,
          TCommandGlobalTypes,
          TParentCommandTypes,
          TParentCommand,
          TDefaultValue
        >,
        "value"
      >
        & {
          default?: DefaultValue<TDefaultValue>;
          defaultText?: DefaultText<TDefaultValue>;
          required?: TRequired;
          collect?: TCollect;
          value?: OptionValueHandler<
            MapTypes<ValueOf<TGlobalOptions>>,
            TMappedValue
          >;
        }
      | OptionValueHandler<MapTypes<ValueOf<TGlobalOptions>>, TMappedValue>,
  ): Command<
    TParentCommandGlobals,
    TParentCommandTypes,
    TCommandOptions,
    TCommandArguments,
    MergeOptions<TFlags, TCommandGlobals, TMappedGlobalOptions>,
    TCommandTypes,
    TCommandGlobalTypes,
    TParentCommand
  > {
    if (typeof opts === "function") {
      return this.option(
        flags,
        desc,
        { value: opts, global: true } as OptionOptions,
      ) as Command<any>;
    }
    return this.option(
      flags,
      desc,
      { ...opts, global: true } as OptionOptions,
    ) as Command<any>;
  }

  /**
   * Add a global option.
   *
   * @param flags Flags string e.g: -h, --help, --manual <requiredArg:string> [optionalArg:number] [...restArgs:string]
   * @param desc Flag description.
   * @param opts Flag options or custom handler for processing flag value.
   */
  public option<
    TFlags extends string,
    TGlobalOptions extends TypedOption<
      TFlags,
      TCommandOptions,
      Merge<TParentCommandTypes, Merge<TCommandGlobalTypes, TCommandTypes>>,
      undefined extends TConflicts ? TRequired : false,
      TDefaultValue
    >,
    TMappedGlobalOptions extends MapValue<
      TGlobalOptions,
      TMappedValue,
      TCollect
    >,
    TRequired extends OptionOptions["required"] = undefined,
    TCollect extends OptionOptions["collect"] = undefined,
    TConflicts extends OptionOptions["conflicts"] = undefined,
    const TDefaultValue = undefined,
    TMappedValue = undefined,
  >(
    flags: TFlags,
    desc: string,
    opts:
      | Omit<
        OptionOptions<
          Partial<TCommandOptions>,
          TCommandArguments,
          MergeOptions<TFlags, TCommandGlobals, TGlobalOptions>,
          TParentCommandGlobals,
          TCommandTypes,
          TCommandGlobalTypes,
          TParentCommandTypes,
          TParentCommand,
          TDefaultValue
        >,
        "value"
      >
        & {
          global: true;
          default?: DefaultValue<TDefaultValue>;
          defaultText?: DefaultText<TDefaultValue>;
          required?: TRequired;
          collect?: TCollect;
          value?: OptionValueHandler<
            MapTypes<ValueOf<TGlobalOptions>>,
            TMappedValue
          >;
        }
      | OptionValueHandler<MapTypes<ValueOf<TGlobalOptions>>, TMappedValue>,
  ): Command<
    TParentCommandGlobals,
    TParentCommandTypes,
    TCommandOptions,
    TCommandArguments,
    MergeOptions<TFlags, TCommandGlobals, TMappedGlobalOptions>,
    TCommandTypes,
    TCommandGlobalTypes,
    TParentCommand
  >;

  /**
   * Register an option.
   *
   * @param flags Flags string e.g: -h, --help, --manual <requiredArg:string> [optionalArg:number] [...restArgs:string]
   * @param desc Flag description.
   * @param opts Flag options or custom handler for processing flag value.
   */
  public option<
    TFlags extends string,
    TOptions extends TypedOption<
      TFlags,
      TCommandOptions,
      Merge<TParentCommandTypes, Merge<TCommandGlobalTypes, TCommandTypes>>,
      undefined extends TConflicts ? TRequired : false,
      TDefaultValue
    >,
    TMappedOptions extends MapValue<TOptions, TMappedValue, TCollect>,
    TRequired extends OptionOptions["required"] = undefined,
    TCollect extends OptionOptions["collect"] = undefined,
    TConflicts extends OptionOptions["conflicts"] = undefined,
    const TDefaultValue = undefined,
    TMappedValue = undefined,
  >(
    flags: TFlags,
    desc: string,
    opts?:
      | Omit<
        OptionOptions<
          MergeOptions<TFlags, TCommandOptions, TMappedOptions>,
          TCommandArguments,
          TCommandGlobals,
          TParentCommandGlobals,
          TCommandTypes,
          TCommandGlobalTypes,
          TParentCommandTypes,
          TParentCommand,
          TDefaultValue
        >,
        "value"
      >
        & {
          default?: DefaultValue<TDefaultValue>;
          defaultText?: DefaultText<TDefaultValue>;
          required?: TRequired;
          collect?: TCollect;
          conflicts?: TConflicts;
          value?: OptionValueHandler<MapTypes<ValueOf<TOptions>>, TMappedValue>;
        }
      | OptionValueHandler<MapTypes<ValueOf<TOptions>>, TMappedValue>,
  ): Command<
    TParentCommandGlobals,
    TParentCommandTypes,
    MergeOptions<TFlags, TCommandOptions, TMappedOptions>,
    TCommandArguments,
    TCommandGlobals,
    TCommandTypes,
    TCommandGlobalTypes,
    TParentCommand
  >;

  public option(
    flags: string,
    desc: string,
    opts?: OptionOptions | OptionValueHandler,
  ): Command<any> {
    if (typeof opts === "function") {
      opts = { value: opts };
    }

    const result = splitArguments(flags);

    const args: Argument[] = result.typeDefinition
      ? parseArgumentsDefinition(result.typeDefinition)
      : [];

    const option: Option = {
      ...opts,
      name: "",
      description: desc,
      args,
      flags: result.flags,
      equalsSign: result.equalsSign,
      typeDefinition: result.typeDefinition,
      groupName: this.builder.groupName ?? undefined,
    };

    if (option.separator) {
      for (const arg of args) {
        if (arg.list) {
          arg.separator = option.separator;
        }
      }
    }

    for (const part of option.flags) {
      const arg = part.trim();
      const isLong = /^--/.test(arg);
      const name = isLong ? arg.slice(2) : arg.slice(1);

      if (this.cmd.getBaseOption(name, true)) {
        if (opts?.override) {
          this.removeOption(name);
        } else {
          throw new DuplicateOptionNameError(name, this.getPath());
        }
      }

      if (!option.name && isLong) {
        option.name = name;
      } else if (!option.aliases) {
        option.aliases = [name];
      } else {
        option.aliases.push(name);
      }
    }

    if (option.prepend) {
      this.cmd.builder.options.unshift(option);
    } else {
      this.cmd.builder.options.push(option);
    }

    return this;
  }

  /**
   * Register command example.
   *
   * @param name          Name of the example.
   * @param description   The content of the example.
   */
  public example(name: string, description: string): this {
    if (this.cmd.hasExample(name)) {
      throw new DuplicateExampleError(name);
    }

    this.cmd.settings.examples.push({ name, description });

    return this;
  }

  /**
   * @param flags Flags string e.g: -h, --help, --manual <requiredArg:string> [optionalArg:number] [...restArgs:string]
   * @param desc Flag description.
   * @param opts Flag options or custom handler for processing flag value.
   */

  /**
   * Register a global environment variable.
   *
   * @param name        Name of the environment variable.
   * @param description The description of the environment variable.
   * @param options     Environment variable options.
   */
  public globalEnv<
    TNameAndValue extends string,
    TGlobalEnvVars extends TypedEnv<
      TNameAndValue,
      TPrefix,
      TCommandOptions,
      Merge<TParentCommandTypes, Merge<TCommandGlobalTypes, TCommandTypes>>,
      TRequired
    >,
    TMappedGlobalEnvVars extends MapValue<TGlobalEnvVars, TMappedValue>,
    TRequired extends EnvVarOptions["required"] = undefined,
    TPrefix extends EnvVarOptions["prefix"] = undefined,
    TMappedValue = undefined,
  >(
    name: TNameAndValue,
    description: string,
    options?: Omit<GlobalEnvVarOptions, "value"> & {
      required?: TRequired;
      prefix?: TPrefix;
      value?: EnvVarValueHandler<
        MapTypes<ValueOf<TGlobalEnvVars>>,
        TMappedValue
      >;
    },
  ): Command<
    TParentCommandGlobals,
    TParentCommandTypes,
    TCommandOptions,
    TCommandArguments,
    Merge<TCommandGlobals, TMappedGlobalEnvVars>,
    TCommandTypes,
    TCommandGlobalTypes,
    TParentCommand
  > {
    return this.env(
      name,
      description,
      { ...options, global: true } as EnvVarOptions,
    ) as Command<any>;
  }

  /**
   * Register a global environment variable.
   *
   * @param name        Name of the environment variable.
   * @param description The description of the environment variable.
   * @param options     Environment variable options.
   */
  public env<
    N extends string,
    G extends TypedEnv<
      N,
      P,
      TCommandOptions,
      Merge<TParentCommandTypes, Merge<TCommandGlobalTypes, TCommandTypes>>,
      R
    >,
    MG extends MapValue<G, V>,
    R extends EnvVarOptions["required"] = undefined,
    P extends EnvVarOptions["prefix"] = undefined,
    V = undefined,
  >(
    name: N,
    description: string,
    options: Omit<EnvVarOptions, "value"> & {
      global: true;
      required?: R;
      prefix?: P;
      value?: EnvVarValueHandler<MapTypes<ValueOf<G>>, V>;
    },
  ): Command<
    TParentCommandGlobals,
    TParentCommandTypes,
    TCommandOptions,
    TCommandArguments,
    Merge<TCommandGlobals, MG>,
    TCommandTypes,
    TCommandGlobalTypes,
    TParentCommand
  >;

  /**
   * Register an environment variable.
   *
   * @param name        Name of the environment variable.
   * @param description The description of the environment variable.
   * @param options     Environment variable options.
   */
  public env<
    TNameAndValue extends string,
    TEnvVar extends TypedEnv<
      TNameAndValue,
      TPrefix,
      TCommandOptions,
      Merge<TParentCommandTypes, Merge<TCommandGlobalTypes, TCommandTypes>>,
      TRequired
    >,
    TMappedEnvVar extends MapValue<TEnvVar, TMappedValue>,
    TRequired extends EnvVarOptions["required"] = undefined,
    TPrefix extends EnvVarOptions["prefix"] = undefined,
    TMappedValue = undefined,
  >(
    name: TNameAndValue,
    description: string,
    options?: Omit<EnvVarOptions, "value"> & {
      required?: TRequired;
      prefix?: TPrefix;
      value?: EnvVarValueHandler<MapTypes<ValueOf<TEnvVar>>, TMappedValue>;
    },
  ): Command<
    TParentCommandGlobals,
    TParentCommandTypes,
    Merge<TCommandOptions, TMappedEnvVar>,
    TCommandArguments,
    TCommandGlobals,
    TCommandTypes,
    TCommandGlobalTypes,
    TParentCommand
  >;

  public env(
    name: string,
    description: string,
    options?: EnvVarOptions,
  ): Command<any> {
    const result = splitArguments(name);

    if (!result.typeDefinition) {
      result.typeDefinition = "<value:boolean>";
    }

    if (
      result.flags.some((envName) => this.cmd.getBaseEnvVar(envName, true))
    ) {
      throw new DuplicateEnvVarError(name);
    }

    const details: Argument[] = parseArgumentsDefinition(
      result.typeDefinition,
    );

    if (details.length > 1) {
      throw new TooManyEnvVarValuesError(name);
    } else if (details.length && details[0].optional) {
      throw new UnexpectedOptionalEnvVarValueError(name);
    } else if (details.length && details[0].variadic) {
      throw new UnexpectedVariadicEnvVarValueError(name);
    }

    this.cmd.builder.envVars.push({
      name: result.flags[0],
      names: result.flags,
      description,
      type: details[0].type,
      details: details.shift() as Argument,
      ...options,
    });

    return this;
  }

  /*****************************************************************************
   **** MAIN HANDLER ***********************************************************
   *****************************************************************************/

  /**
   * Parse command line arguments and execute matched command.
   *
   * @param args Command line args to parse. Ex: `cmd.parse( Deno.args )`
   */
  public parse(
    args: string[] = getArgs(),
  ): Promise<
    TParentCommand extends Command<any> ? CommandResult<
        Record<string, unknown>,
        Array<unknown>,
        Record<string, unknown>,
        Record<string, unknown>,
        Record<string, unknown>,
        Record<string, unknown>,
        Record<string, unknown>,
        undefined
      >
      : CommandResult<
        MapTypes<TCommandOptions>,
        MapTypes<TCommandArguments>,
        MapTypes<TCommandGlobals>,
        MapTypes<TParentCommandGlobals>,
        TCommandTypes,
        TCommandGlobalTypes,
        TParentCommandTypes,
        TParentCommand
      >
  > {
    this.props.isRoot = true;
    const ctx: ParseContext = {
      unknown: args.slice(),
      flags: {},
      env: {},
      literal: [],
      stopEarly: false,
      stopOnUnknown: false,
      defaults: {},
      actions: [],
      parsedFlags: [],
    };
    return this.parseCommand(ctx) as any;
  }

  private async parseCommand(ctx: ParseContext): Promise<CommandResult> {
    try {
      this.reset();
      this.registerDefaults();
      this.props.rawArgs = ctx.unknown.slice();

      if (!ctx.unknown.length && this.settings.defaultCommand) {
        const defaultCommand = this.getCommand(
          this.settings.defaultCommand,
          true,
        );

        if (!defaultCommand) {
          throw new DefaultCommandNotFoundError(
            this.settings.defaultCommand,
            this.getCommands(),
          );
        }
        defaultCommand.props.globalParent = this;

        return defaultCommand.parseCommand(ctx);
      }

      if (this.settings.useRawArgs) {
        await this.parseEnvVars(ctx, this.builder.envVars);
        return await this.execute(ctx.env, ctx.unknown);
      }

      let preParseGlobals = false;
      let subCommand: Command<any> | undefined;

      // Pre parse globals to support: cmd --global-option sub-command --option
      if (ctx.unknown.length > 0) {
        // Detect sub command.
        subCommand = this.getSubCommand(ctx);

        if (!subCommand) {
          // Only pre parse globals if first arg ist a global option.
          const optionName = ctx.unknown[0].replace(/^-+/, "").split("=")[0];
          const option = this.getOption(optionName, true);

          if (option?.global) {
            preParseGlobals = true;
            await this.parseGlobalOptionsAndEnvVars(ctx);
          }
        }
      }

      if (subCommand || ctx.unknown.length > 0) {
        subCommand ??= this.getSubCommand(ctx);

        if (subCommand) {
          subCommand.props.globalParent = this;
          return subCommand.parseCommand(ctx);
        }
      }

      // Parse rest options & env vars.
      await this.parseOptionsAndEnvVars(ctx, preParseGlobals);
      const options = { ...ctx.env, ...ctx.flags };
      const args = await this.parseArguments(ctx, options);
      this.props.literalArgs = ctx.literal;

      // Execute option action.
      if (ctx.actions.length) {
        await Promise.all(
          ctx.actions.map((action) => action.call(this, options, ...args)),
        );

        if (ctx.standalone) {
          return {
            options,
            args,
            cmd: this,
            literal: this.props.literalArgs,
          };
        }
      }

      return await this.execute(options, args);
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  private getSubCommand(ctx: ParseContext) {
    const subCommand = this.getCommand(ctx.unknown[0], true);

    if (subCommand) {
      ctx.unknown.shift();
    }

    return subCommand;
  }

  private async parseGlobalOptionsAndEnvVars(
    ctx: ParseContext,
  ): Promise<void> {
    const isHelpOption = this.getHelpOption()?.flags.includes(ctx.unknown[0]);

    // Parse global env vars.
    const envVars = [
      ...this.builder.envVars.filter((envVar) => envVar.global),
      ...this.getGlobalEnvVars(true),
    ];

    await this.parseEnvVars(ctx, envVars, !isHelpOption);

    // Parse global options.
    const options = [
      ...this.builder.options.filter((option) => option.global),
      ...this.getGlobalOptions(true),
    ];

    this.parseOptions(ctx, options, {
      stopEarly: true,
      stopOnUnknown: true,
      dotted: false,
    });
  }

  private async parseOptionsAndEnvVars(
    ctx: ParseContext,
    preParseGlobals: boolean,
  ): Promise<void> {
    const helpOption = this.getHelpOption();
    const isVersionOption = this.props.versionOption?.flags.includes(
      ctx.unknown[0],
    );
    const isHelpOption = helpOption && ctx.flags?.[helpOption.name] === true;

    // Parse env vars.
    const envVars = preParseGlobals
      ? this.builder.envVars.filter((envVar) => !envVar.global)
      : this.getEnvVars(true);

    await this.parseEnvVars(
      ctx,
      envVars,
      !isHelpOption && !isVersionOption,
    );

    // Parse options.
    const options = this.getOptions(true);

    this.parseOptions(ctx, options);
  }

  /** Register default options like `--version` and `--help`. */
  private registerDefaults(): this {
    if (this.props.hasDefaults) {
      return this;
    }
    if (this.parent) {
      if (this.props.isRoot) {
        this.getMainCommand().registerDefaults();
      }
      return this;
    }
    this.props.hasDefaults = true;

    this.reset();

    !this.builder.types.has("string") &&
      this.type("string", new StringType(), { global: true });
    !this.builder.types.has("number") &&
      this.type("number", new NumberType(), { global: true });
    !this.builder.types.has("integer") &&
      this.type("integer", new IntegerType(), { global: true });
    !this.builder.types.has("boolean") &&
      this.type("boolean", new BooleanType(), { global: true });
    !this.builder.types.has("file") &&
      this.type("file", new FileType(), { global: true });
    !this.builder.types.has("secret") &&
      this.type("secret", new SecretType(), { global: true });

    if (!this.settings.help) {
      this.help({});
    }

    if (
      this.settings.versionOptions !== false &&
      (this.settings.versionOptions || this.settings.version)
    ) {
      this.option(
        this.settings.versionOptions?.flags || "-V, --version",
        this.settings.versionOptions?.desc ||
          "Show the version number for this program.",
        {
          standalone: true,
          prepend: true,
          action: async function () {
            const long = this.getRawArgs().includes(
              `--${this.props.versionOption?.name}`,
            );
            if (long) {
              await checkVersion(this);
              this.showLongVersion();
            } else {
              this.showVersion();
            }
            this.exit();
          },
          ...(this.settings.versionOptions?.opts ?? {}),
        },
      );
      this.props.versionOption = this.builder.options[0];
    }

    if (this.settings.helpOptions !== false) {
      this.option(
        this.settings.helpOptions?.flags || "-h, --help",
        this.settings.helpOptions?.desc || "Show this help.",
        {
          standalone: true,
          global: true,
          prepend: true,
          action: async function () {
            const long = this.getRawArgs().includes(
              `--${this.getHelpOption()?.name}`,
            );
            await checkVersion(this);
            this.showHelp({ long });
            this.exit();
          },
          ...(this.settings.helpOptions?.opts ?? {}),
        },
      );
      this.props.helpOption = this.builder.options[0];
    }

    return this;
  }

  /**
   * Execute command.
   * @param options A map of options.
   * @param args Command arguments.
   */
  private async execute(
    options: Record<string, unknown>,
    args: Array<unknown>,
  ): Promise<CommandResult> {
    await this.executeGlobalAction(options, args);

    if (this.settings.actionHandler) {
      await this.settings.actionHandler.call(this, options, ...args);
    }

    return {
      options,
      args,
      cmd: this,
      literal: this.props.literalArgs,
    };
  }

  private async executeGlobalAction(
    options: Record<string, unknown>,
    args: Array<unknown>,
  ) {
    if (!this.settings.noGlobals) {
      await this.parent?.executeGlobalAction(options, args);
    }
    await this.settings.globalActionHandler?.call(this, options, ...args);
  }

  /** Parse raw command line arguments. */
  protected parseOptions(
    ctx: ParseContext,
    options: Option[],
    {
      stopEarly = this.settings.stopEarly,
      stopOnUnknown = false,
      dotted = true,
    }: ParseOptionsOptions = {},
  ): void {
    parseFlags(ctx, {
      stopEarly,
      stopOnUnknown,
      dotted,
      allowEmpty: this.settings.allowEmpty,
      flags: options,
      ignoreDefaults: ctx.env,
      parse: (type: ArgumentValue) => this.parseType(type),
      option: (option: Option) => {
        if (option.action) {
          ctx.actions.push(option.action);
        }
      },
    });
  }

  /** Parse argument type. */
  protected parseType(type: ArgumentValue): unknown {
    const typeSettings: TypeDef | undefined = this.getType(type.type);

    if (!typeSettings) {
      throw new UnknownTypeError(
        type.type,
        this.getTypes().map((type) => type.name),
      );
    }

    return typeSettings.handler instanceof Type
      ? typeSettings.handler.parse(type)
      : typeSettings.handler(type);
  }

  /**
   * Read and validate environment variables.
   * @param ctx Parse context.
   * @param envVars env vars defined by the command.
   * @param validate when true, throws an error if a required env var is missing.
   */
  protected async parseEnvVars(
    ctx: ParseContext,
    envVars: Array<EnvVar>,
    validate = true,
  ): Promise<void> {
    for (const envVar of envVars) {
      const env = await this.findEnvVar(envVar.names);

      if (env) {
        const parseType = (value: string) => {
          return this.parseType({
            label: "Environment variable",
            type: envVar.type,
            name: env.name,
            value,
          });
        };

        const propertyName = underscoreToCamelCase(
          envVar.prefix
            ? envVar.names[0].replace(new RegExp(`^${envVar.prefix}`), "")
            : envVar.names[0],
        );

        if (envVar.details.list) {
          ctx.env[propertyName] = env.value
            .split(envVar.details.separator ?? ",")
            .map(parseType);
        } else {
          ctx.env[propertyName] = parseType(env.value);
        }

        if (envVar.value && typeof ctx.env[propertyName] !== "undefined") {
          ctx.env[propertyName] = envVar.value(ctx.env[propertyName]);
        }
      } else if (envVar.required && validate) {
        throw new MissingRequiredEnvVarError(envVar);
      }
    }
  }

  protected async findEnvVar(
    names: readonly string[],
  ): Promise<{ name: string; value: string } | undefined> {
    for (const name of names) {
      // dnt-shim-ignore
      const status = await (globalThis as any).Deno?.permissions.query({
        name: "env",
        variable: name,
      });

      if (!status || status.state === "granted") {
        const value = getEnv(name);

        if (value) {
          return { name, value };
        }
      }
    }

    return undefined;
  }

  /**
   * Parse command-line arguments.
   * @param ctx     Parse context.
   * @param options Parsed command line options.
   */
  protected async parseArguments(
    ctx: ParseContext,
    options: Record<string, unknown>,
  ): Promise<TCommandArguments> {
    const params: Array<unknown> = [];
    const args = ctx.unknown.slice();

    if (!this.hasArguments()) {
      if (args.length) {
        if (this.hasCommands(true)) {
          if (this.hasCommand(args[0], true)) {
            // e.g: command --global-foo --foo sub-command
            throw new TooManyArgumentsError(args);
          } else {
            throw new UnknownCommandError(args[0], this.getCommands());
          }
        } else {
          throw new NoArgumentsAllowedError(this.getPath());
        }
      }
    } else {
      const hasDefaults = this.settings.arguments?.some((arg) => arg.default);

      if (!args.length && !hasDefaults) {
        const required = this.getArguments()
          .filter((expectedArg) => !expectedArg.optional)
          .map((expectedArg) => expectedArg.name);

        if (required.length) {
          const optionNames: string[] = Object.keys(options);
          const hasStandaloneOption = !!optionNames.find((name) =>
            this.getOption(name, true)?.standalone
          );

          if (!hasStandaloneOption) {
            throw new MissingArgumentsError(required);
          }
        }
      } else {
        for (const [index, expectedArg] of this.getArguments().entries()) {
          const mapArgValue = (parsed: unknown) => {
            return this.settings.arguments?.[index].value
              ? this.settings.arguments[index].value(parsed)
              : parsed;
          };

          if (!args.length) {
            if (this.settings.arguments?.[index].default !== undefined) {
              const defaultValue =
                typeof this.settings.arguments[index].default === "function"
                  ? this.settings.arguments[index].default.call(this)
                  : this.settings.arguments[index].default;

              const mappedValue = mapArgValue(defaultValue);

              if (expectedArg.variadic && Array.isArray(mappedValue)) {
                params.push(...mappedValue);
                continue;
              }
              params.push(mappedValue);
              continue;
            }

            if (expectedArg.optional) {
              if (hasDefaults) {
                params.push(undefined);
              }
              continue;
            }
            throw new MissingArgumentError(expectedArg.name);
          }

          let arg: unknown;

          const parseArgValue = (value: string) => {
            return expectedArg.list
              ? value.split(",").map((value) => parseArgType(value))
              : parseArgType(value);
          };

          const parseArgType = (value: string) => {
            return this.parseType({
              label: "Argument",
              type: expectedArg.type,
              name: expectedArg.name,
              value,
            });
          };

          if (expectedArg.variadic) {
            arg = args.splice(0, args.length).map((value) =>
              parseArgValue(value)
            );
          } else {
            arg = parseArgValue(args.shift() as string);
          }

          arg = mapArgValue(arg);

          if (expectedArg.variadic && Array.isArray(arg)) {
            params.push(...arg);
          } else if (typeof arg !== "undefined") {
            params.push(arg);
          }
        }

        if (args.length) {
          throw new TooManyArgumentsError(args);
        }
      }
    }
    const values = await Promise.all(params);

    while (values.length && values.at(-1) === undefined) {
      values.pop();
    }

    return values as TCommandArguments;
  }

  private handleError(error: unknown): never {
    this.throw(
      error instanceof FlagsValidationError
        ? new ValidationError(error.message)
        : error instanceof Error
        ? error
        : new Error(`[non-error-thrown] ${error}`),
    );
  }

  /**
   * Handle error. If `throwErrors` is enabled the error will be thrown,
   * otherwise a formatted error message will be printed and `exit(1)`
   * will be called. This will also trigger registered error handlers.
   *
   * @param error The error to handle.
   */
  public throw(error: Error): never {
    if (error instanceof ValidationError) {
      error.cmd = this as unknown as Command;
    }
    this.getErrorHandler()?.(error, this as unknown as Command);

    if (this.shouldThrowErrors() || !(error instanceof ValidationError)) {
      throw error;
    }
    this.showHelp();

    console.error(red(`  ${bold("error")}: ${error.message}\n`));

    exit(error instanceof ValidationError ? error.exitCode : 1);
  }

  /*****************************************************************************
   **** GETTER *****************************************************************
   *****************************************************************************/

  /** Get command name. */
  public getName(): string {
    return this.settings.name;
  }

  /** Get parent command. */
  public getParent(): TParentCommand {
    return this.parent as TParentCommand;
  }

  /**
   * Get parent command from global executed command.
   * Be sure, to call this method only inside an action handler. Unless this or any child command was executed,
   * this method returns always undefined.
   */
  public getGlobalParent(): Command<any> | undefined {
    return this.props.globalParent;
  }

  /** Get main command. */
  public getMainCommand(): Command<any> {
    return this.parent?.getMainCommand() ?? this;
  }

  /** Get command name aliases. */
  public getAliases(): string[] {
    return this.settings.aliases;
  }

  /**
   * Get full command path.
   *
   * @param name Override the main command name.
   */
  public getPath(name?: string): string {
    return this.parent && !this.props.isRoot
      ? this.parent.getPath(name) + " " + this.settings.name
      : name || this.settings.name;
  }

  /** Get arguments definition. E.g: <input-file:string> <output-file:string> */
  public getArgsDefinition(): string | undefined {
    return this.settings.arguments?.map(({ arg }) => arg).join(" ");
  }

  /**
   * Get argument by name.
   *
   * @param name Name of the argument.
   */
  public getArgument(name: string): Argument | undefined {
    return this.getArguments().find((arg) => arg.name === name);
  }

  /** Get arguments. */
  public getArguments(): Argument[] {
    if (!this.props.args.length && this.settings.arguments) {
      this.props.args = parseArgumentsDefinition(this.settings.arguments);
    }

    return this.props.args;
  }

  /** Check if command has arguments. */
  public hasArguments(): boolean {
    return !!this.settings.arguments?.length;
  }

  /** Get command version. */
  public getVersion(): string | undefined {
    return this.getVersionHandler()?.call(this, this);
  }

  /** Get help handler method. */
  private getVersionHandler(): VersionHandler | undefined {
    return this.settings.version ?? this.parent?.getVersionHandler();
  }

  /** Get command description. */
  public getDescription(): string {
    // call description method only once
    return typeof this.settings.description === "function"
      ? this.settings.description = this.settings.description.call(this)
      : this.settings.description;
  }

  /** Get auto generated command usage. */
  public getUsage(): string {
    return this.settings.usage ??
      [this.getArgsDefinition(), this.getRequiredOptionsDefinition()]
        .join(" ")
        .trim();
  }

  private getRequiredOptionsDefinition() {
    return this.getOptions()
      .filter((option) => option.required)
      .map((option) =>
        [findFlag(option.flags), option.typeDefinition].filter((v) => v)
          .join(" ")
          .trim()
      )
      .join(" ");
  }

  /** Get short command description. This is the first line of the description. */
  public getShortDescription(): string {
    return getDescription(this.getDescription(), true);
  }

  /** Get original command-line arguments. */
  public getRawArgs(): string[] {
    return this.props.rawArgs;
  }

  /** Get all arguments defined after the double dash. */
  public getLiteralArgs(): string[] {
    return this.props.literalArgs;
  }

  /** Output generated help without exiting. */
  public showVersion(): void {
    console.log(this.getVersion());
  }

  /** Returns command name, version and meta data. */
  public getLongVersion(): string {
    return `${bold(this.getMainCommand().getName())} ${
      brightBlue(this.getVersion() ?? "")
    }` +
      Object.entries(this.getMeta()).map(
        ([k, v]) => `\n${bold(k)} ${brightBlue(v)}`,
      ).join("");
  }

  /** Outputs command name, version and meta data. */
  public showLongVersion(): void {
    console.log(this.getLongVersion());
  }

  /** Output generated help without exiting. */
  public showHelp(options?: HelpOptions): void {
    console.log(this.getHelp(options));
  }

  /** Get generated help. */
  public getHelp(options?: HelpOptions): string {
    this.registerDefaults();
    return this.getHelpHandler().call(this, this, options ?? {});
  }

  /** Get help handler method. */
  private getHelpHandler(): HelpHandler {
    return this.settings.help ?? this.parent?.getHelpHandler() as HelpHandler;
  }

  private exit(code = 0) {
    if (this.shouldExit()) {
      exit(code);
    }
  }

  /*****************************************************************************
   **** Options GETTER *********************************************************
   *****************************************************************************/

  /**
   * Checks whether the command has options or not.
   *
   * @param hidden Include hidden options.
   */
  public hasOptions(hidden?: boolean): boolean {
    return this.getOptions(hidden).length > 0;
  }

  /**
   * Get options.
   *
   * @param hidden Include hidden options.
   */
  public getOptions(hidden?: boolean): Option[] {
    return this.getGlobalOptions(hidden).concat(this.getBaseOptions(hidden));
  }

  /**
   * Get base options.
   *
   * @param hidden Include hidden options.
   */
  public getBaseOptions(hidden?: boolean): Option[] {
    if (!this.builder.options.length) {
      return [];
    }

    return hidden
      ? this.builder.options.slice(0)
      : this.builder.options.filter((opt) => !opt.hidden);
  }

  /**
   * Get global options.
   *
   * @param hidden Include hidden options.
   */
  public getGlobalOptions(hidden?: boolean): Option[] {
    const helpOption = this.getHelpOption();
    const getGlobals = (
      cmd: Command<any>,
      noGlobals: boolean | undefined,
      options: Option[] = [],
      names: string[] = [],
    ): Option[] => {
      if (cmd.builder.options.length) {
        for (const option of cmd.builder.options) {
          if (
            option.global &&
            !this.builder.options.find((opt) => opt.name === option.name) &&
            names.indexOf(option.name) === -1 &&
            (hidden || !option.hidden)
          ) {
            if (noGlobals && option !== helpOption) {
              continue;
            }

            names.push(option.name);
            options.push(option);
          }
        }
      }

      return cmd.parent
        ? getGlobals(
          cmd.parent,
          noGlobals || cmd.settings.noGlobals,
          options,
          names,
        )
        : options;
    };

    return this.parent ? getGlobals(this.parent, this.settings.noGlobals) : [];
  }

  /**
   * Checks whether the command has an option with given name or not.
   *
   * @param name Name of the option. Must be in param-case.
   * @param hidden Include hidden options.
   */
  public hasOption(name: string, hidden?: boolean): boolean {
    return !!this.getOption(name, hidden);
  }

  /**
   * Get option by name.
   *
   * @param name Name of the option. Must be in param-case.
   * @param hidden Include hidden options.
   */
  public getOption(name: string, hidden?: boolean): Option | undefined {
    return this.getBaseOption(name, hidden) ??
      this.getGlobalOption(name, hidden);
  }

  /**
   * Get base option by name.
   *
   * @param name Name of the option. Must be in param-case.
   * @param hidden Include hidden options.
   */
  public getBaseOption(name: string, hidden?: boolean): Option | undefined {
    const option = this.builder.options.find((option) =>
      option.name === name || option.aliases?.includes(name)
    );

    return option && (hidden || !option.hidden) ? option : undefined;
  }

  /**
   * Get global option from parent commands by name.
   *
   * @param name Name of the option. Must be in param-case.
   * @param hidden Include hidden options.
   */
  public getGlobalOption(name: string, hidden?: boolean): Option | undefined {
    const helpOption = this.getHelpOption();
    const getGlobalOption = (
      parent: Command,
      noGlobals: boolean | undefined,
    ): Option | undefined => {
      const option: Option | undefined = parent.getBaseOption(
        name,
        hidden,
      );

      if (!option?.global) {
        return parent.parent && getGlobalOption(
          parent.parent,
          noGlobals || parent.settings.noGlobals,
        );
      }
      if (noGlobals && option !== helpOption) {
        return;
      }

      return option;
    };

    return this.parent && getGlobalOption(
      this.parent,
      this.settings.noGlobals,
    );
  }

  /**
   * Remove option by name.
   *
   * @param name Name of the option. Must be in param-case.
   */
  public removeOption(name: string): Option | undefined {
    const index = this.builder.options.findIndex((option) =>
      option.name === name
    );

    if (index === -1) {
      return;
    }

    return this.builder.options.splice(index, 1)[0];
  }

  /**
   * Checks whether the command has sub-commands or not.
   *
   * @param hidden Include hidden commands.
   */
  public hasCommands(hidden?: boolean): boolean {
    return this.getCommands(hidden).length > 0;
  }

  /**
   * Get commands.
   *
   * @param hidden Include hidden commands.
   */
  public getCommands(hidden?: boolean): Array<Command<any>> {
    return this.getGlobalCommands(hidden).concat(this.getBaseCommands(hidden));
  }

  /**
   * Get base commands.
   *
   * @param hidden Include hidden commands.
   */
  public getBaseCommands(hidden?: boolean): Array<Command<any>> {
    const commands = Array.from(this.settings.commands.values());
    return hidden ? commands : commands.filter((cmd) => !cmd.settings.isHidden);
  }

  /**
   * Get global commands.
   *
   * @param hidden Include hidden commands.
   */
  public getGlobalCommands(hidden?: boolean): Array<Command<any>> {
    const getCommands = (
      command: Command<any>,
      noGlobals: boolean | undefined,
      commands: Array<Command<any>> = [],
      names: string[] = [],
    ): Array<Command<any>> => {
      if (command.settings.commands.size) {
        for (const [_, cmd] of command.settings.commands) {
          if (
            cmd.settings.isGlobal &&
            this !== cmd &&
            !this.settings.commands.has(cmd.settings.name) &&
            names.indexOf(cmd.settings.name) === -1 &&
            (hidden || !cmd.settings.isHidden)
          ) {
            if (noGlobals && cmd?.getName() !== "help") {
              continue;
            }

            names.push(cmd.settings.name);
            commands.push(cmd);
          }
        }
      }

      return command.parent
        ? getCommands(
          command.parent,
          noGlobals || command.settings.noGlobals,
          commands,
          names,
        )
        : commands;
    };

    return this.parent ? getCommands(this.parent, this.settings.noGlobals) : [];
  }

  /**
   * Checks whether a child command exists by given name or alias.
   *
   * @param name Name or alias of the command.
   * @param hidden Include hidden commands.
   */
  public hasCommand(name: string, hidden?: boolean): boolean {
    return !!this.getCommand(name, hidden);
  }

  /**
   * Get command by name or alias.
   *
   * @param name Name or alias of the command.
   * @param hidden Include hidden commands.
   */
  public getCommand<TCommand extends Command<any>>(
    name: string,
    hidden?: boolean,
  ): TCommand | undefined {
    return this.getBaseCommand(name, hidden) ??
      this.getGlobalCommand(name, hidden);
  }

  /**
   * Get base command by name or alias.
   *
   * @param name Name or alias of the command.
   * @param hidden Include hidden commands.
   */
  public getBaseCommand<TCommand extends Command<any>>(
    name: string,
    hidden?: boolean,
  ): TCommand | undefined {
    for (const cmd of this.settings.commands.values()) {
      if (cmd.settings.name === name || cmd.settings.aliases.includes(name)) {
        return (cmd && (hidden || !cmd.settings.isHidden) ? cmd : undefined) as
          | TCommand
          | undefined;
      }
    }
  }

  /**
   * Get global command by name or alias.
   *
   * @param name Name or alias of the command.
   * @param hidden Include hidden commands.
   */
  public getGlobalCommand<TCommand extends Command<any>>(
    name: string,
    hidden?: boolean,
  ): TCommand | undefined {
    const getGlobalCommand = (
      parent: Command,
      noGlobals: boolean | undefined,
    ): Command | undefined => {
      const cmd: Command | undefined = parent.getBaseCommand(name, hidden);

      if (!cmd || !cmd.settings.isGlobal) {
        return parent.parent &&
          getGlobalCommand(
            parent.parent,
            noGlobals || parent.settings.noGlobals,
          );
      }
      if (noGlobals && cmd.getName() !== "help") {
        return;
      }

      return cmd;
    };

    return this.parent &&
      getGlobalCommand(this.parent, this.settings.noGlobals) as TCommand;
  }

  /**
   * Remove sub-command by name or alias.
   *
   * @param name Name or alias of the command.
   */
  public removeCommand(name: string): Command<any> | undefined {
    const command = this.getBaseCommand(name, true);

    if (command) {
      this.settings.commands.delete(command.settings.name);
    }

    return command;
  }

  /** Get types. */
  public getTypes(): Array<TypeDef> {
    return this.getGlobalTypes().concat(this.getBaseTypes());
  }

  /** Get base types. */
  public getBaseTypes(): Array<TypeDef> {
    return Array.from(this.builder.types.values());
  }

  /** Get global types. */
  public getGlobalTypes(): Array<TypeDef> {
    const getTypes = (
      cmd: Command<any> | undefined,
      types: Array<TypeDef> = [],
      names: Array<string> = [],
    ): Array<TypeDef> => {
      if (cmd) {
        if (cmd.builder.types.size) {
          cmd.builder.types.forEach((type: TypeDef) => {
            if (
              type.global &&
              !this.builder.types.has(type.name) &&
              names.indexOf(type.name) === -1
            ) {
              names.push(type.name);
              types.push(type);
            }
          });
        }

        return getTypes(cmd.parent, types, names);
      }

      return types;
    };

    return getTypes(this.parent);
  }

  /**
   * Get type by name.
   *
   * @param name Name of the type.
   */
  public getType(name: string): TypeDef | undefined {
    return this.getBaseType(name) ?? this.getGlobalType(name);
  }

  /**
   * Get base type by name.
   *
   * @param name Name of the type.
   */
  public getBaseType(name: string): TypeDef | undefined {
    return this.builder.types.get(name);
  }

  /**
   * Get global type by name.
   *
   * @param name Name of the type.
   */
  public getGlobalType(name: string): TypeDef | undefined {
    if (!this.parent) {
      return;
    }

    const cmd: TypeDef | undefined = this.parent.getBaseType(name);

    if (!cmd?.global) {
      return this.parent.getGlobalType(name);
    }

    return cmd;
  }

  /** Get completions. */
  public getCompletions(): Completion<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[] {
    return this.getGlobalCompletions().concat(this.getBaseCompletions());
  }

  /** Get base completions. */
  public getBaseCompletions(): Completion[] {
    return Array.from(this.builder.completions.values());
  }

  /** Get global completions. */
  public getGlobalCompletions(): Completion[] {
    const getCompletions = (
      cmd: Command<any> | undefined,
      completions: Completion[] = [],
      names: string[] = [],
    ): Completion[] => {
      if (cmd) {
        if (cmd.builder.completions.size) {
          cmd.builder.completions.forEach((completion: Completion) => {
            if (
              completion.global &&
              !this.builder.completions.has(completion.name) &&
              names.indexOf(completion.name) === -1
            ) {
              names.push(completion.name);
              completions.push(completion);
            }
          });
        }

        return getCompletions(cmd.parent, completions, names);
      }

      return completions;
    };

    return getCompletions(this.parent);
  }

  /**
   * Get completion by name.
   *
   * @param name Name of the completion.
   */
  public getCompletion(name: string): Completion | undefined {
    return this.getBaseCompletion(name) ?? this.getGlobalCompletion(name);
  }

  /**
   * Get base completion by name.
   *
   * @param name Name of the completion.
   */
  public getBaseCompletion(name: string): Completion | undefined {
    return this.builder.completions.get(name);
  }

  /**
   * Get global completions by name.
   *
   * @param name Name of the completion.
   */
  public getGlobalCompletion(name: string): Completion | undefined {
    if (!this.parent) {
      return;
    }

    const completion: Completion | undefined = this.parent.getBaseCompletion(
      name,
    );

    if (!completion?.global) {
      return this.parent.getGlobalCompletion(name);
    }

    return completion;
  }

  /**
   * Checks whether the command has environment variables or not.
   *
   * @param hidden Include hidden environment variable.
   */
  public hasEnvVars(hidden?: boolean): boolean {
    return this.getEnvVars(hidden).length > 0;
  }

  /**
   * Get environment variables.
   *
   * @param hidden Include hidden environment variable.
   */
  public getEnvVars(hidden?: boolean): EnvVar[] {
    return this.getGlobalEnvVars(hidden).concat(this.getBaseEnvVars(hidden));
  }

  /**
   * Get base environment variables.
   *
   * @param hidden Include hidden environment variable.
   */
  public getBaseEnvVars(hidden?: boolean): EnvVar[] {
    if (!this.builder.envVars.length) {
      return [];
    }

    return hidden
      ? this.builder.envVars.slice(0)
      : this.builder.envVars.filter((env) => !env.hidden);
  }

  /**
   * Get global environment variables.
   *
   * @param hidden Include hidden environment variable.
   */
  public getGlobalEnvVars(hidden?: boolean): EnvVar[] {
    if (this.settings.noGlobals) {
      return [];
    }

    const getEnvVars = (
      cmd: Command<any> | undefined,
      envVars: EnvVar[] = [],
      names: string[] = [],
    ): EnvVar[] => {
      if (cmd) {
        if (cmd.builder.envVars.length) {
          cmd.builder.envVars.forEach((envVar: EnvVar) => {
            if (
              envVar.global &&
              !this.builder.envVars.find((env) =>
                env.names[0] === envVar.names[0]
              ) &&
              names.indexOf(envVar.names[0]) === -1 &&
              (hidden || !envVar.hidden)
            ) {
              names.push(envVar.names[0]);
              envVars.push(envVar);
            }
          });
        }

        return getEnvVars(cmd.parent, envVars, names);
      }

      return envVars;
    };

    return getEnvVars(this.parent);
  }

  /**
   * Checks whether the command has an environment variable with given name or not.
   *
   * @param name Name of the environment variable.
   * @param hidden Include hidden environment variable.
   */
  public hasEnvVar(name: string, hidden?: boolean): boolean {
    return !!this.getEnvVar(name, hidden);
  }

  /**
   * Get environment variable by name.
   *
   * @param name Name of the environment variable.
   * @param hidden Include hidden environment variable.
   */
  public getEnvVar(name: string, hidden?: boolean): EnvVar | undefined {
    return this.getBaseEnvVar(name, hidden) ??
      this.getGlobalEnvVar(name, hidden);
  }

  /**
   * Get base environment variable by name.
   *
   * @param name Name of the environment variable.
   * @param hidden Include hidden environment variable.
   */
  public getBaseEnvVar(name: string, hidden?: boolean): EnvVar | undefined {
    const envVar: EnvVar | undefined = this.builder.envVars.find((env) =>
      env.names.indexOf(name) !== -1
    );

    return envVar && (hidden || !envVar.hidden) ? envVar : undefined;
  }

  /**
   * Get global environment variable by name.
   *
   * @param name Name of the environment variable.
   * @param hidden Include hidden environment variable.
   */
  public getGlobalEnvVar(name: string, hidden?: boolean): EnvVar | undefined {
    if (!this.parent || this.settings.noGlobals) {
      return;
    }

    const envVar: EnvVar | undefined = this.parent.getBaseEnvVar(
      name,
      hidden,
    );

    if (!envVar?.global) {
      return this.parent.getGlobalEnvVar(name, hidden);
    }

    return envVar;
  }

  /** Checks whether the command has examples or not. */
  public hasExamples(): boolean {
    return this.settings.examples.length > 0;
  }

  /** Get all examples. */
  public getExamples(): Example[] {
    return this.settings.examples;
  }

  /** Checks whether the command has an example with given name or not. */
  public hasExample(name: string): boolean {
    return !!this.getExample(name);
  }

  /** Get example with given name. */
  public getExample(name: string): Example | undefined {
    return this.settings.examples.find((example) => example.name === name);
  }

  private getHelpOption(): Option | undefined {
    return this.props.helpOption ?? this.parent?.getHelpOption();
  }
}

function findFlag(flags: Array<string>): string {
  for (const flag of flags) {
    if (flag.startsWith("--")) {
      return flag;
    }
  }
  return flags[0];
}

interface DefaultOption {
  flags: string;
  desc?: string;
  opts?: OptionOptions;
}

interface ParseContext extends ParseFlagsContext<Record<string, unknown>> {
  actions: Array<ActionHandler>;
  env: Record<string, unknown>;
}

interface ParseOptionsOptions {
  stopEarly?: boolean;
  stopOnUnknown?: boolean;
  dotted?: boolean;
}

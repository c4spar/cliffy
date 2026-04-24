import type { Command } from "../command.ts";
import { BashCompletionsGenerator } from "./_bash_completions_generator.ts";
import { FishCompletionsGenerator } from "./_fish_completions_generator.ts";
import { ZshCompletionsGenerator } from "./_zsh_completions_generator.ts";

export interface GenerateShellCompletionsOptions {
  name?: string;
}

/**
 * Generates shell completions for the specified shell.
 *
 * @param shell The target shell type ("bash", "fish", or "zsh").
 * @param name The name of the command-line application.
 * @param cmd The root Command instance representing the CLI structure.
 * @returns A string containing the shell completion script.
 * @throws {Error} If an unsupported shell type is specified.
 *
 * @example
 * ```ts
 * import { Command } from "@cliffy/command";
 * import { generateShellCompletions } from "@cliffy/command/completions";
 *
 * const myCmd = new Command()
 *   .name("myapp")
 *   .description("My Application")
 *   // ... define commands and options ...
 *   ;
 *
 * const bashCompletions = generateShellCompletions(myCmd, "bash");
 * console.log(bashCompletions);
 * // This will output the bash completion script for "myapp".
 *
 * const zshCompletions = generateShellCompletions(myCmd, "zsh", { name: "myapp2" });
 * console.log(zshCompletions);
 * // This will output the zsh completion script and use "myapp2" as the command name.
 * ```
 */
export function generateShellCompletions(
  // deno-lint-ignore no-explicit-any
  cmd: Command<any>,
  shell: "bash" | "fish" | "zsh",
  { name = cmd.getName() }: GenerateShellCompletionsOptions = {},
): string {
  switch (shell) {
    case "bash":
      return BashCompletionsGenerator.generate(name, cmd);
    case "fish":
      return FishCompletionsGenerator.generate(name, cmd);
    case "zsh":
      return ZshCompletionsGenerator.generate(name, cmd);
    default:
      throw new Error(`Unsupported shell: ${shell}`);
  }
}

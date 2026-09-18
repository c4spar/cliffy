import { Command } from "../command.ts";
import { dim, italic } from "@std/fmt/colors";
import { ZshCompletionsGenerator } from "./_zsh_completions_generator.ts";

/** Generates zsh completions script. */
export class ZshCompletionsCommand
  extends Command<void, void, { name: string }> {
  readonly #cmd?: Command;

  public constructor(cmd?: Command) {
    super();
    this.#cmd = cmd;
    return this
      .description(() => {
        const baseCmd = this.#cmd || this.getMainCommand();
        return `Generate shell completions for zsh.

To enable zsh completions for this program add following line to your ${
          dim(italic("~/.zshrc"))
        }:

    ${dim(italic(`source <(${baseCmd.getPath()} completions zsh)`))}`;
      })
      .noGlobals()
      .option(
        "-n, --name <command-name>",
        "The name of the main command.",
        { default: () => this.getMainCommand().getName() },
      )
      .action(async ({ name }) => {
        const baseCmd = this.#cmd || this.getMainCommand();
        await baseCmd.loadCommandTree();
        console.log(ZshCompletionsGenerator.generate(name, baseCmd));
      });
  }
}

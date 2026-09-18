import { UnknownCompletionCommandError } from "../_errors.ts";
import { writeSync } from "@cliffy/internal/runtime/write-sync";
import { Command } from "../command.ts";
import type { Completion } from "../types.ts";

/** Execute auto completion method of command and action. */
export class CompleteCommand extends Command<
  void,
  void,
  void,
  [action: string, ...commandNames: Array<string>]
> {
  public constructor(cmd?: Command) {
    super();
    return this
      .description(
        "Get completions for given action from given command.",
      )
      .noGlobals()
      .arguments("<action:string> [command...:string]")
      .action(async (_, action: string, ...commandNames: Array<string>) => {
        let parent: Command | undefined;
        let completeCommand: Command = cmd || this.getMainCommand();

        for (const name of commandNames ?? []) {
          parent = completeCommand;
          await completeCommand.loadCommands(false);
          const childCmd: Command | undefined = completeCommand.getCommand(
            name,
            false,
          );
          if (!childCmd) {
            throw new UnknownCompletionCommandError(
              name,
              completeCommand.getCommands(),
            );
          }
          completeCommand = childCmd;
        }

        const completion: Completion | undefined = completeCommand
          .getCompletion(action);
        const result: Array<string | number | boolean> =
          await completion?.complete(completeCommand, parent) ?? [];

        if (result?.length) {
          writeSync(new TextEncoder().encode(result.join("\n")));
        }
      })
      .reset();
  }
}

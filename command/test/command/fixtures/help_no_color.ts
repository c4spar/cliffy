import { Command } from "../../../command.ts";
import { getArgs } from "../../../../internal/runtime/get_args.ts";

const commands: Record<string, Command> = {
  default: new Command()
    .name("no-color")
    .helpOption(false),
  explicit: new Command()
    .name("explicit-colors")
    .help({ colors: true })
    .helpOption(false),
};

console.log(commands[getArgs()[0]].getHelp());

import { Command } from "../../../command.ts";
import { getArgs } from "../../../../internal/runtime/get_args.ts";
import { fakeOutputTerminal } from "../../../../internal/testing/fake_output_terminal.ts";

const commands: Record<string, Command> = {
  default: new Command()
    .name("default-colors")
    .helpOption(false),
  explicit: new Command()
    .name("explicit-colors")
    .help({ colors: true })
    .helpOption(false),
  auto: new Command()
    .name("auto-colors")
    .help({ colors: "auto" })
    .helpOption(false),
};

const [name, output] = getArgs();

if (output === "terminal") {
  fakeOutputTerminal(true);
}

console.log(commands[name].getHelp());

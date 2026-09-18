import { getOs } from "@cliffy/internal/runtime/get-os";
import { snapshotTest } from "@cliffy/testing";
import { HelpCommand } from "../../help/mod.ts";
import { Command } from "../../mod.ts";

await snapshotTest({
  name: "lazy command help integration",
  meta: import.meta,
  ignore: getOs() === "windows",
  steps: {
    "should print the auto help of a container command": { args: [] },
    "should print the help option output": { args: ["--help"] },
    "should print the help of a lazy sub command": {
      args: ["clone", "--help"],
    },
    "should print the help command output": { args: ["help"] },
    "should print the help command output of a lazy sub command": {
      args: ["help", "clone"],
    },
  },
  async fn() {
    await new Command()
      .name("lazy-test")
      .command(
        "clone",
        () =>
          new Command()
            .description("Clone a repository.")
            .option("-r, --recursive", "Clone recursive.")
            .command("mirror", "Mirror a repository."),
      )
      .command("hidden-one", () => new Command().hidden().action(() => {}))
      .command("global", () => new Command().description("Global command."))
      .global()
      .command("help", new HelpCommand().global())
      .parse();
  },
});

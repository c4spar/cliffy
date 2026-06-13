#!/usr/bin/env -S deno run

import { Command } from "@cliffy/command";

await new Command()
  .option("-l, --local [val:string]", "Only available on this command.")
  // Define global options before adding child commands, or call `.reset()`
  // before adding them, so the chain is back on the parent command.
  .globalOption(
    "-g, --global [val:string]",
    "Available on this and all nested child commands.",
  )
  .action(console.log)
  .command(
    "command1",
    new Command()
      .description("Some sub command.")
      .action(console.log)
      .command(
        "command2",
        new Command()
          .description("Some nested sub command.")
          .action(console.log),
      )
      .reset(),
  )
  .parse();

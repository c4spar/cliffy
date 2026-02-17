#!/usr/bin/env -S deno run

import { Command } from "@cliffy/command";

console.log("init cli");

export const cli = new Command()
  .name("example")
  .description("Example command with lazy loading.")
  .action(function () {
    console.log("main");
  })
  .command("foo", () => import("./foo_command.ts"))
  .action((_opts) => console.log("foo foo"))
  .command("bar", () => import("./bar_command.ts"))
  .action((_opts) => console.log("bar bar"));

if (import.meta.main) {
  await cli.parse();
}

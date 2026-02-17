#!/usr/bin/env -S deno run

import { Command } from "@cliffy/command";

console.log("init bar command");

export default new Command()
  .description("Example command with lazy loading.")
  .option("-b, --bar", "description")
  .action(function () {
    console.log("bar");
  })
  .command("baz", () => import("./baz_command.ts"))
  .action((_opts) => console.log("baz baz"));

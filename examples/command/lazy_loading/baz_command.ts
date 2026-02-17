#!/usr/bin/env -S deno run

import { Command } from "@cliffy/command";

console.log("init baz command");

export default new Command()
  .description("Example command with lazy loading.")
  .option("-b, --baz", "description")
  .arguments("[arg]")
  .action(function () {
    console.log("baz");
  });

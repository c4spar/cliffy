#!/usr/bin/env -S deno run

import { Command } from "@cliffy/command";

console.log("init foo command");

export default new Command()
  .description("Example command with lazy loading.")
  .option("-f, --flag", "description")
  .action(() => console.log("foo"));

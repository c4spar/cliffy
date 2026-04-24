#!/usr/bin/env -S deno run

import { Command } from "@cliffy/command";

const { options } = await new Command()
  .option("-c, --cheese [type:string]", "add the specified type of cheese", {
    default: "blue",
    defaultText: "some cheese",
  })
  .parse();

console.log(`cheese: ${options.cheese}`);

#!/usr/bin/env -S deno run --allow-net --allow-run --allow-read --no-check

import { Command } from "@cliffy/command";
import { CompletionsCommand } from "@cliffy/command/completions";
import { UpgradeCommand } from "@cliffy/command/upgrade";
import { DenoLandProvider } from "@cliffy/upgrade/provider/deno-land";
import { GithubProvider } from "@cliffy/upgrade/provider/github";
import { NestLandProvider } from "@cliffy/upgrade/provider/nest-land";

await new Command()
  .name("codeview")
  .version("0.2.1")
  .command(
    "upgrade",
    new UpgradeCommand({
      main: "codeview.ts",
      args: ["--allow-all", "--unstable"],
      provider: [
        new DenoLandProvider(),
        new NestLandProvider(),
        new GithubProvider({ repository: "c4spar/deno-codeview" }),
      ],
    }),
  )
  .command("completions", new CompletionsCommand())
  .parse();

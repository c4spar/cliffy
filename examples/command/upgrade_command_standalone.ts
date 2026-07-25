#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env=GITHUB_TOKEN,GH_TOKEN

import { Command } from "@cliffy/command";
import { UpgradeCommand } from "@cliffy/command/upgrade";
import { GithubProvider } from "@cliffy/upgrade/provider/github";
import { Uint8ArrayReader, Uint8ArrayWriter, ZipReader } from "@zip-js/zip-js";

await new Command()
  .name("deno-ce")
  .version("2.9.2")
  .command(
    "upgrade",
    new UpgradeCommand({
      standalone: true,
      provider: new GithubProvider({
        repository: "denoland/deno",
        binaryName: "deno",
        location: "./deno-upgrade-demo/",
        asset: {
          "darwin-x86_64": "deno-x86_64-apple-darwin.zip",
          "darwin-aarch64": "deno-aarch64-apple-darwin.zip",
          "linux-x86_64": "deno-x86_64-unknown-linux-gnu.zip",
          "linux-aarch64": "deno-aarch64-unknown-linux-gnu.zip",
          "windows-x86_64": "deno-x86_64-pc-windows-msvc.zip",
        },
        extract: {
          ".zip": async (bytes, asset) => {
            const zip = new ZipReader(new Uint8ArrayReader(bytes));
            try {
              const entry = (await zip.getEntries()).find((entry) => {
                const base = entry.filename.split("/").pop();
                return base === asset.binaryName ||
                  base === `${asset.binaryName}.exe`;
              });
              if (!entry || !("getData" in entry) || !entry.getData) {
                throw new Error(
                  `binary "${asset.binaryName}" not found in the release asset`,
                );
              }
              return await entry.getData(new Uint8ArrayWriter());
            } finally {
              await zip.close();
            }
          },
        },
      }),
    }),
  )
  .parse();

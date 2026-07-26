#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write

import { Command } from "@cliffy/command";
import { UpgradeCommand } from "@cliffy/command/upgrade";
import { hasPermission } from "@cliffy/internal/runtime/has-permission";
import { UrlProvider } from "@cliffy/upgrade/provider/url";
import { Uint8ArrayReader, Uint8ArrayWriter, ZipReader } from "@zip-js/zip-js";

const assets: Record<string, string> = {
  "darwin-x86_64": "deno-x86_64-apple-darwin.zip",
  "darwin-aarch64": "deno-aarch64-apple-darwin.zip",
  "linux-x86_64": "deno-x86_64-unknown-linux-gnu.zip",
  "linux-aarch64": "deno-aarch64-unknown-linux-gnu.zip",
  "windows-x86_64": "deno-x86_64-pc-windows-msvc.zip",
};

await new Command()
  .name("deno-ce")
  .version("v2.9.2")
  .command(
    "upgrade",
    new UpgradeCommand({
      standalone: true,
      provider: new UrlProvider({
        url: ({ version, os, arch }) => {
          const asset = assets[`${os}-${arch}`];
          if (!asset) {
            throw new Error(`Unsupported target: ${os}-${arch}`);
          }
          return `https://github.com/denoland/deno/releases/download/${version}/${asset}`;
        },
        versions: async () => {
          const response = await fetch(
            "https://api.github.com/repos/denoland/deno/tags?per_page=100",
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch versions: ${response.status}`);
          }
          const tags = (await response.json()) as Array<{ name: string }>;
          const versions = tags.map(({ name }) => name);
          const [latest] = versions;
          if (!latest) {
            throw new Error("No versions found");
          }
          return { latest, versions };
        },
        hasRequiredPermissions: () =>
          hasPermission({ name: "net", host: "api.github.com" }),
        binaryName: "deno",
        location: "./deno-upgrade-demo/",
        homepage: "https://github.com/denoland/deno",
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

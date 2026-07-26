#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env=GITLAB_TOKEN

import { Command } from "@cliffy/command";
import { UpgradeCommand } from "@cliffy/command/upgrade";
import type { BinaryAsset } from "@cliffy/upgrade";
import { GitlabProvider } from "@cliffy/upgrade/provider/gitlab";
import { Uint8ArrayReader, Uint8ArrayWriter, ZipReader } from "@zip-js/zip-js";

await new Command()
  .name("glab-ce")
  .version("v1.108.0")
  .command(
    "upgrade",
    new UpgradeCommand({
      standalone: true,
      provider: new GitlabProvider({
        repository: "gitlab-org/cli",
        binaryName: "glab",
        location: "./glab-upgrade-demo/",
        asset: ({ version, os, arch }) => {
          const target = `${os}_${arch === "x86_64" ? "amd64" : "arm64"}`;
          const extension = os === "windows" ? "zip" : "tar.gz";
          return `glab_${version.replace(/^v/, "")}_${target}.${extension}`;
        },
        extract: { ".zip": unzipBinary },
      }),
    }),
  )
  .parse();

async function unzipBinary(
  bytes: Uint8Array,
  asset: BinaryAsset,
): Promise<Uint8Array> {
  const zip = new ZipReader(new Uint8ArrayReader(bytes));
  try {
    const entry = (await zip.getEntries()).find((entry) => {
      const base = entry.filename.split("/").pop();
      return base === asset.binaryName || base === `${asset.binaryName}.exe`;
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
}

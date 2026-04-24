#! /usr/bin/env -S deno run -A

import { walk } from "@std/fs/walk";
import denoConfig from "../deno.json" with { type: "json" };
import { join } from "@std/path/posix";

const projects = await getProjects();
const paths: Record<string, Array<string>> = {};

await Promise.all(projects.map(async (project) => {
  let { default: { exports } }: {
    default: { exports: Record<string, string> | string };
  } = await import(`../${project}/deno.json`, { with: { type: "json" } });

  if (typeof exports === "string") {
    exports = { ".": exports };
  }

  if (!exports || typeof exports !== "object") {
    return;
  }

  for (const [specifier, path] of Object.entries(exports)) {
    paths[join("@cliffy", project, specifier)] = [`./${join(project, path)}`];
  }
}));

await Deno.writeTextFile(
  "./tsconfig.json",
  JSON.stringify({
    compilerOptions: {
      allowJs: true,
      esModuleInterop: true,
      experimentalDecorators: false,
      inlineSourceMap: true,
      isolatedModules: true,
      module: "esnext",
      moduleDetection: "force",
      strict: true,
      target: "esnext",
      useDefineForClassFields: true,
      paths,
    },
  }),
);

const dependencies: Record<string, string> = {};
for (const [specifier, version] of Object.entries(denoConfig.imports)) {
  if (specifier.includes("cliffy")) {
    continue;
  }
  dependencies[specifier] = version.startsWith("jsr:")
    ? `npm:@jsr/${version.replace("/", "__").replace("jsr:@", "")}`
    : version;
}

await Deno.writeTextFile(
  "./package.json",
  JSON.stringify({
    type: "module",
    packageManager: "pnpm@9.7.1",
    dependencies: {
      ...dependencies,
      tsx: "4.17.0",
    },
  }),
);

await Deno.writeTextFile("./.npmrc", "@jsr:registry=https://npm.jsr.io\n");

await new Deno.Command("deno", {
  args: ["fmt", "tsconfig.json", "package.json"],
}).output();

if (!Deno.args.includes("--no-install")) {
  if (Deno.args.includes("--bun")) {
    await new Deno.Command("bun", {
      args: ["install"],
    }).output();
  } else {
    await new Deno.Command("pnpm", {
      args: ["install"],
    }).output();
  }
}

async function getProjects(): Promise<Array<string>> {
  const projects: Array<string> = [];

  for await (
    const entry of walk(".", { includeDirs: true, followSymlinks: false })
  ) {
    if (
      entry.isDirectory && !entry.path.startsWith(".") &&
      [".", "node_modules"].every((path) => !entry.path.startsWith(path))
    ) {
      try {
        const files = [...Deno.readDirSync(entry.path)];
        if (files.some((file) => file.name === "deno.json")) {
          projects.push(entry.path);
        }
      } catch (error) {
        console.error(`Error reading directory ${entry.path}:`, error);
      }
    }
  }

  return projects;
}

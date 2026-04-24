# Contributing to Cliffy

First off, thank you for considering contributing to cliffy. Here are a few
things you may find helpful.

### Get in touch

- ❓ Ask general support questions in
  [discussions](https://github.com/c4spar/deno-cliffy/discussions/categories/q-a?discussions_q=category%3AQ%26A+)
  or in the [chat](https://discord.gg/ghFYyP53jb).
- 👨‍💻 Use [issues](https://github.com/c4spar/deno-cliffy/issues/new) to report
  bugs, request new features and discuss your contributions.
- 💬 Discuss topics in the [chat](https://discord.gg/V8XpuHdzz2).

### Contributing to development

Before you submit your PR please consider the following guidelines:

- 🕶 Follow Deno's
  [style guide](https://deno.land/manual/contributing/style_guide#typescript).
- 📄 [Conventional Commits](https://conventionalcommits.org) are appreciated.
- ✨ Lint your code changes with `deno task lint`.
- 🪄 Format your code changes with `deno task fmt`.
- ⚙️ Test your changes with `deno task test`.

#### Run Node.js tests

- Install **Node.Js** and **pnpm**.
- Run `deno task setup:node`. This will setup all necessary files for node and
  installs all dependencies with pnpm.
- Run `deno task test:node` to run the tests with node.
- Run `deno task clean` to cleanup the node setup.

#### Run bun tests

- Install **bun**.
- Run `deno task setup:bun`. This will setup all necessary files for bun and
  installs all dependencies with bun.
- Run `deno task test:bun` to run the tests with bun.
- Run `deno task clean` to cleanup the bun setup.

#### Run examples

- **deno:** `deno run examples/prompt/checkbox.ts`
- **node:** `deno task node examples/prompt/checkbox.ts`
- **bun:** `deno task bun examples/prompt/checkbox.ts`

> If you need any help, feel free to ask!

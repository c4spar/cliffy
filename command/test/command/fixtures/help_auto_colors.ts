import { Command } from "../../../command.ts";
import {
  getRuntimeName,
  type RuntimeName,
} from "../../../../internal/runtime/runtime_name.ts";

interface Output {
  isTerminal?: () => boolean;
  isTTY?: boolean;
}

const runtimeGlobals = globalThis as unknown as {
  Deno: { stdout: Output };
  process: { stdout: Output };
};
const outputs: Record<RuntimeName, () => Output> = {
  deno: () => runtimeGlobals.Deno.stdout,
  node: () => runtimeGlobals.process.stdout,
  bun: () => runtimeGlobals.process.stdout,
};
const terminalProperties: Record<RuntimeName, keyof Output> = {
  deno: "isTerminal",
  node: "isTTY",
  bun: "isTTY",
};
const terminalValues: Record<RuntimeName, unknown> = {
  deno: () => true,
  node: true,
  bun: true,
};
const runtime = getRuntimeName();

Object.defineProperty(outputs[runtime](), terminalProperties[runtime], {
  configurable: true,
  value: terminalValues[runtime],
});

console.log(
  new Command()
    .name("auto-colors")
    .help({ colors: "auto" })
    .helpOption(false)
    .getHelp(),
);

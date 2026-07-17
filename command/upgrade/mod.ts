import { Provider as Provider_ } from "@cliffy/upgrade";
import type { Versions as Versions_ } from "@cliffy/upgrade";

/** @deprecated Import `Provider` from `@cliffy/upgrade` instead. Will be removed in 2.0. */
export const Provider = Provider_;
/** @deprecated Import `Provider` from `@cliffy/upgrade` instead. Will be removed in 2.0. */
export type Provider = Provider_;
/** @deprecated Import `Versions` from `@cliffy/upgrade` instead. Will be removed in 2.0. */
export type Versions = Versions_;
export {
  UpgradeCommand,
  type UpgradeCommandOptions,
} from "./upgrade_command.ts";

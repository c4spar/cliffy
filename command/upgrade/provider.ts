import { compare, parse } from "@std/semver";
import { bold, brightBlue, cyan, green, red, yellow } from "@std/fmt/colors";
import { ValidationError } from "../_errors.ts";
import { Table } from "@cliffy/table";
import type { Logger } from "./logger.ts";

export interface Versions {
  latest: string;
  versions: Array<string>;
}

/** Shared provider options. */
export interface ProviderOptions {
  main?: string;
  logger?: Logger;
}

/** Provider upgrade options. */
export interface ProviderUpgradeOptions {
  name: string;
  to: string;
  main?: string;
  args?: Array<string>;
  from?: string;
  force?: boolean;
  verbose?: boolean;
}

/**
 * Upgrade provider.
 *
 * The upgrade provider is an api wrapper for a javascript registry which is
 * used by the upgrade command to upgrade the cli to a specific version.
 *
 * @example Upgrade provider example
 *
 * ```
 * import { Command } from "@cliffy/command";
 * import { UpgradeCommand } from "@cliffy/command/upgrade";
 * import { DenoLandProvider } from "@cliffy/command/upgrade/provider/deno-land";
 * import { GithubProvider } from "@cliffy/command/upgrade/provider/github";
 * import { JsrProvider } from "@cliffy/command/upgrade/provider/jsr";
 * import { NestLandProvider } from "@cliffy/command/upgrade/provider/nest-land";
 * import { NpmProvider } from "@cliffy/command/upgrade/provider/npm";
 *
 * const upgradeCommand = new UpgradeCommand({
 *   provider: [
 *     new JsrProvider({ package: "@examples/package" }),
 *   ],
 * });
 * ```
 */
export abstract class Provider {
  abstract readonly name: string;
  protected readonly main?: string;
  protected readonly maxListSize: number = 25;
  protected logger: Logger;
  private maxCols = 8;

  /**
   * Whether resolving the `latest` target is delegated to the runtime /
   * package manager instead of being resolved to a concrete version by the
   * provider. Registries that support a min-release-age policy (npm, jsr)
   * enable this so the runtime can downgrade to the newest version allowed by
   * the configured policy. See {@link resolveSpecifierVersion}.
   */
  protected readonly delegateLatestResolution: boolean = false;

  protected constructor({ main, logger = console }: ProviderOptions = {}) {
    this.main = main;
    this.logger = logger;
  }

  abstract hasRequiredPermissions(): Promise<boolean>;

  abstract getVersions(name: string): Promise<Versions>;

  abstract getRepositoryUrl(name: string, version?: string): string;

  abstract getRegistryUrl(name: string, version: string): string;

  upgrade?(options: ProviderUpgradeOptions): Promise<void>;

  getSpecifier(name: string, version: string, defaultMain?: string): string {
    return `${this.getRegistryUrl(name, version)}${this.getMain(defaultMain)}`;
  }

  /**
   * Resolve the requested target version to an installable version.
   *
   * By default the `latest` target is resolved to the concrete latest version
   * reported by the registry. Providers that delegate resolution to the
   * runtime (see {@link delegateLatestResolution}) keep the `latest` target
   * unresolved so the runtime can apply its own min-release-age policy when
   * installing the specifier produced by {@link resolveSpecifierVersion}.
   */
  async resolveVersion(name: string, version: string): Promise<string> {
    if (version === "latest" && !this.delegateLatestResolution) {
      const { latest } = await this.getVersions(name);
      return latest;
    }
    return version;
  }

  /**
   * Map the version part of an install specifier.
   *
   * For providers that delegate resolution, the `latest` target is mapped to
   * the `*` semver range instead of the `latest` dist-tag. This lets the
   * runtime / package manager downgrade to the newest version permitted by a
   * configured minimumDependencyAge (deno) or min-release-age (npm/pnpm/bun).
   *
   * `*` is used rather than the `latest` tag because Deno rejects a too-new
   * tag instead of downgrading it (npm and bun downgrade the tag either way,
   * and jsr has no `latest` tag at all). Use the `latest` tag once deno
   * resolves tags like npm/pnpm/bun do: https://github.com/denoland/deno/issues/34579
   */
  protected resolveSpecifierVersion(version: string): string {
    return this.delegateLatestResolution && version === "latest"
      ? "*"
      : version;
  }

  async isOutdated(
    name: string,
    currentVersion: string,
    targetVersion: string,
  ): Promise<boolean> {
    const { latest, versions } = await this.getVersions(name);

    if (targetVersion === "latest") {
      targetVersion = latest;
    }

    // Check if requested version exists.
    if (targetVersion && !versions.includes(targetVersion)) {
      throw new ValidationError(
        `The provided version ${
          bold(red(targetVersion))
        } is not found.\n\n    ${
          cyan(
            `Visit ${
              brightBlue(this.getRepositoryUrl(name))
            } for available releases or run again with the ${(yellow(
              "-l",
            ))} or ${(yellow("--list-versions"))} command.`,
          )
        }`,
      );
    }

    // Check if requested version is already the latest available version.
    if (latest && latest === currentVersion && latest === targetVersion) {
      this.logger.warn(
        yellow(
          `You're already using the latest available version ${currentVersion} of ${name}.`,
        ),
      );
      return false;
    }

    // Check if requested version is already installed.
    if (targetVersion && currentVersion === targetVersion) {
      this.logger.warn(
        yellow(`You're already using version ${currentVersion} of ${name}.`),
      );
      return false;
    }

    return true;
  }

  public async listVersions(
    name: string,
    currentVersion?: string,
  ): Promise<void> {
    const { versions } = await this.getVersions(name);
    this.printVersions(versions, currentVersion);
  }

  protected printVersions(
    versions: Array<string>,
    currentVersion?: string,
    { maxCols = this.maxCols, indent = 0 }: {
      maxCols?: number;
      indent?: number;
    } = {},
  ): void {
    versions = versions
      .sort((versionA, versionB) => {
        const semverA = parse(versionA);
        const semverB = parse(versionB);

        return compare(semverB, semverA);
      })
      .slice();

    if (versions?.length) {
      versions = versions.map((version: string) =>
        currentVersion && currentVersion === version
          ? green(`* ${version}`)
          : `  ${version}`
      );

      if (versions.length > this.maxListSize) {
        const table = new Table().indent(indent);
        const rowSize = Math.ceil(versions.length / maxCols);
        const colSize = Math.min(versions.length, maxCols);
        let versionIndex = 0;
        for (let colIndex = 0; colIndex < colSize; colIndex++) {
          for (let rowIndex = 0; rowIndex < rowSize; rowIndex++) {
            if (!table[rowIndex]) {
              table[rowIndex] = [];
            }
            table[rowIndex][colIndex] = versions[versionIndex++];
          }
        }
        console.log(table.toString());
      } else {
        console.log(
          versions.map((version) => " ".repeat(indent) + version).join("\n"),
        );
      }
    }
  }

  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  private getMain(defaultMain?: string): string {
    const main = this.main ?? defaultMain;
    return main ? `/${main}` : "";
  }
}

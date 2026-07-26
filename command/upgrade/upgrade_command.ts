import { bold, brightBlue } from "@std/fmt/colors";
import { ValidationError } from "../_errors.ts";
import { exit } from "@cliffy/internal/runtime/exit";
import { isStandalone } from "@cliffy/internal/runtime/is-standalone";
import { Command } from "../command.ts";
import { EnumType } from "../types/enum.ts";
import { createLogger } from "./logger.ts";
import { Spinner } from "./spinner.ts";
import {
  type Provider,
  type RuntimeOptions,
  type RuntimeOptionsMap,
  upgrade,
  type Versions,
} from "@cliffy/upgrade";

export interface UpgradeCommandOptions<
  TProvider extends Provider = Provider,
> extends RuntimeOptions {
  provider: TProvider | Array<TProvider>;
  runtime?: RuntimeOptionsMap;
  spinner?: boolean;
  /**
   * Force standalone installation instead of auto-detecting it. Set to `true`
   * when the cli is a compiled standalone binary.
   */
  standalone?: boolean;
  /**
   * Enables an env var for the `--output` option (binary upgrades). Uses the
   * same form as the `env` option of the `option` method: `true` derives
   * `OUTPUT`, a string sets the name explicitly, and `{ prefix }` prepends a
   * prefix (e.g. `{ prefix: "MYCLI_" }` -> `MYCLI_OUTPUT`). The `--output`
   * flag takes precedence over the env var.
   */
  outputEnv?: boolean | string | { prefix: string };
}

/**
 * The `UpgradeCommand` adds an upgrade functionality to the cli to be able to
 * seamlessly upgrade the cli to the latest or a specific version from a
 * provided registry with any supported runtime.
 * Currently supported runtimes are: `deno`, `node` and `bun`.
 *
 * @example Upgrade command example
 *
 * ```
 * import { Command } from "@cliffy/command";
 * import { UpgradeCommand } from "@cliffy/command/upgrade";
 * import { DenoLandProvider } from "@cliffy/upgrade/provider/deno-land";
 * import { GithubProvider } from "@cliffy/upgrade/provider/github";
 * import { JsrProvider } from "@cliffy/upgrade/provider/jsr";
 * import { NestLandProvider } from "@cliffy/upgrade/provider/nest-land";
 * import { NpmProvider } from "@cliffy/upgrade/provider/npm";
 *
 * await new Command()
 *   .name("my-cli")
 *   .version("0.2.1")
 *   .command(
 *     "upgrade",
 *     new UpgradeCommand({
 *       provider: [
 *         new JsrProvider({ scope: "examples" }),
 *         new NpmProvider({ scope: "examples" }),
 *         new DenoLandProvider(),
 *         new NestLandProvider(),
 *         new GithubProvider({ repository: "examples/my-cli" }),
 *       ],
 *     }),
 *   )
 *   .parse();
 * ```
 */
export class UpgradeCommand extends Command {
  private readonly providers: ReadonlyArray<Provider>;
  private readonly standalone?: boolean;

  constructor(
    {
      provider,
      spinner: withSpinner = true,
      standalone,
      outputEnv,
      ...options
    }: UpgradeCommandOptions,
  ) {
    super();
    this.providers = Array.isArray(provider) ? provider : [provider];
    this.standalone = standalone;

    if (!this.providers.length) {
      throw new Error(`No upgrade provider defined!`);
    }

    const supportsVersionListing = this.providers.some((provider) =>
      provider.supportsVersionListing
    );

    this
      .description(() =>
        `Upgrade ${this.getMainCommand().getName()} executable to latest or given version.`
      )
      .noGlobals()
      .type("provider", new EnumType(this.getProviderNames()))
      .option(
        "-r, --registry <name:provider>",
        `The registry name from which to upgrade.`,
        {
          default: () =>
            this.selectProvider(this.standalone ?? isStandalone()).name,
          hidden: this.providers.length < 2,
          value: (registry) => this.getProvider(registry),
        },
      )
      .option(
        "-l, --list-versions",
        "Show available versions.",
        {
          enabled: supportsVersionListing,
          action: async ({ registry }) => {
            await registry.listVersions(
              this.getMainCommand().getName(),
              this.getVersion(),
            );
            exit(0);
          },
        },
      )
      .option(
        "--version <version:string:version>",
        "The version to upgrade to.",
        { default: "latest" },
      )
      .option(
        "-f, --force",
        "Replace current installation even if not out-of-date.",
      )
      .option(
        "-v, --verbose",
        "Log verbose output.",
      )
      .option(
        "-o, --output <path:string>",
        "Install the upgraded binary to this path instead of replacing the current one.",
        {
          enabled: this.providers.some((p) => p.supportsBinaryUpgrade),
          env: outputEnv,
        },
      )
      .option("--no-spinner", "Disable spinner.", {
        hidden: !withSpinner,
      })
      .action(
        async (
          {
            registry: provider,
            version,
            force,
            verbose,
            output,
            spinner: spinnerEnabled,
          },
        ) => {
          const name: string = this.getMainCommand().getName();
          const currentVersion: string | undefined = this.getVersion();
          const standalone: boolean = this.standalone ?? isStandalone();

          const spinner = withSpinner && spinnerEnabled
            ? new Spinner({
              message: brightBlue(
                `Upgrading ${bold(name)} from version ${
                  bold(currentVersion ?? "")
                } to ${bold(version)}...`,
              ),
            })
            : undefined;
          const logger = createLogger({ spinner, verbose });
          spinner?.start();

          try {
            await upgrade({
              name,
              to: version,
              from: currentVersion,
              force,
              provider,
              verbose,
              logger,
              standalone,
              location: output,
              ...options,
            });
          } catch (error: unknown) {
            logger.error(
              !verbose && error instanceof Error ? error.message : error,
            );
            spinner?.stop();
            exit(1);
          } finally {
            spinner?.stop();
          }
        },
      );

    if (supportsVersionListing) {
      this.complete("version", () => this.getAllVersions());
    }
  }

  public async getAllVersions(): Promise<Array<string>> {
    const provider = this.providers.find((provider) =>
      provider.supportsVersionListing
    );
    if (!provider) {
      return [];
    }
    const { versions } = await provider.getVersions(
      this.getMainCommand().getName(),
    );
    return versions;
  }

  public async hasRequiredPermissions(): Promise<boolean> {
    return await this.getProvider().hasRequiredPermissions();
  }

  public supportsVersionListing(): boolean {
    return this.getProvider().supportsVersionListing;
  }

  public async getLatestVersion(): Promise<string> {
    const { latest } = await this.getVersions();
    return latest;
  }

  public getVersions(): Promise<Versions> {
    return this.getProvider().getVersions(
      this.getMainCommand().getName(),
    );
  }

  private getProvider(name?: string): Provider {
    const provider = name
      ? this.providers.find((provider) => provider.name === name)
      : this.providers[0];
    if (!provider) {
      throw new ValidationError(`Unknown provider "${name}"`);
    }
    return provider;
  }

  private selectProvider(standalone: boolean): Provider {
    if (standalone) {
      const binaryProvider = this.providers.find((p) =>
        p.supportsBinaryUpgrade
      );
      if (binaryProvider) {
        return binaryProvider;
      }
    }
    return this.getProvider();
  }

  private getProviderNames(): Array<string> {
    return this.providers.map((provider) => provider.name);
  }
}

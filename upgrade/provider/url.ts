import {
  type BinaryAsset,
  type BinaryUpgradeContext,
  type Extract,
  Provider,
  type ProviderOptions,
  type Versions,
} from "../provider.ts";
import { UnsupportedUpgradeError } from "../unsupported-upgrade-error.ts";
import {
  UnsupportedVersionListingError,
} from "../unsupported-version-listing-error.ts";
import { type BinaryNameResolver, resolveBinaryName } from "../asset.ts";
import { yellow } from "@std/fmt/colors";
import { getRuntimeName } from "@cliffy/internal/runtime/runtime-name";

/** Context used to resolve a script entrypoint url. */
export interface ScriptUpgradeContext {
  /** Cli name. */
  name: string;
  /** Resolved target version (a concrete version, never `latest`). */
  version: string;
}

/** Resolves the exact script entrypoint url. */
export type ScriptUrlResolver =
  | string
  | ((context: ScriptUpgradeContext) => string);

/** Resolves the binary asset url for a build target. */
export type AssetUrlResolver =
  | string
  | ((context: BinaryUpgradeContext) => string);

/** Resolves the available versions. */
export type VersionsResolver = Versions | (() => Versions | Promise<Versions>);

/** Resolves the auth headers sent with the binary asset request. */
export type AssetHeadersResolver =
  | HeadersInit
  | ((context: BinaryUpgradeContext) => HeadersInit | Promise<HeadersInit>);

export interface UrlProviderOptions extends Omit<ProviderOptions, "main"> {
  /** Exact script entrypoint url. Deno only. */
  url?: ScriptUrlResolver;
  /** Binary asset url, or a resolver building it per build target. */
  asset?: AssetUrlResolver;
  /**
   * Available versions, or a resolver returning them. Required to resolve the
   * `latest` target; without it an explicit version must be requested.
   */
  versions?: VersionsResolver;
  /**
   * Checks whether a function-based version resolver can run without prompting
   * for additional permissions. Automatic version checks are skipped when
   * omitted.
   */
  hasRequiredPermissions?: () => boolean | Promise<boolean>;
  /** Auth headers sent with the binary asset request. */
  assetHeaders?: AssetHeadersResolver;
  /** Binary to extract from an archive asset. Defaults to the cli name. */
  binaryName?: BinaryNameResolver;
  /** Custom extractor(s) for archive formats that aren't handled built-in. */
  extract?: Extract;
  /** Default install location for the downloaded binary. */
  location?: string;
  /** Homepage shown in the upgrade success message. */
  homepage?: string;
}

/**
 * Upgrade provider that installs a Deno script or downloads a prebuilt binary
 * from an arbitrary url (a cdn, object storage, or a custom host).
 *
 * @example
 * ```ts ignore
 * import { UrlProvider } from "@cliffy/upgrade/provider/url";
 *
 * const provider = new UrlProvider({
 *   url: ({ name, version }) =>
 *     `https://cdn.example.com/${name}/${version}/cli.ts`,
 * });
 * ```
 */
export class UrlProvider extends Provider {
  name = "url";
  private readonly scriptUrl?: ScriptUrlResolver;
  private readonly assetUrl?: AssetUrlResolver;
  private readonly versionsResolver?: VersionsResolver;
  private readonly requiredPermissionsResolver?: () =>
    | boolean
    | Promise<boolean>;
  private readonly assetHeaders?: AssetHeadersResolver;
  private readonly binaryName?: BinaryNameResolver;
  private readonly extract?: Extract;
  private readonly binaryLocation?: string;
  private readonly homepage?: string;

  constructor({
    url,
    asset,
    versions,
    hasRequiredPermissions,
    assetHeaders,
    binaryName,
    extract,
    location,
    homepage,
    logger,
  }: UrlProviderOptions) {
    if (url === undefined && asset === undefined) {
      throw new TypeError(
        `The "url" provider requires a \`url\` or \`asset\` option.`,
      );
    }
    super({ logger });
    this.scriptUrl = url;
    this.assetUrl = asset;
    this.versionsResolver = versions;
    this.requiredPermissionsResolver = hasRequiredPermissions;
    this.assetHeaders = assetHeaders;
    this.binaryName = binaryName;
    this.extract = extract;
    this.binaryLocation = location;
    this.homepage = homepage;
  }

  override get supportsScriptUpgrade(): boolean {
    return this.scriptUrl !== undefined && getRuntimeName() === "deno";
  }

  override get supportsBinaryUpgrade(): boolean {
    return this.assetUrl !== undefined;
  }

  override get supportsVersionListing(): boolean {
    return !!this.versionsResolver;
  }

  override get location(): string | undefined {
    return this.binaryLocation;
  }

  async hasRequiredPermissions(): Promise<boolean> {
    if (typeof this.versionsResolver !== "function") {
      return !!this.versionsResolver;
    }
    return this.requiredPermissionsResolver
      ? await this.requiredPermissionsResolver()
      : false;
  }

  // deno-lint-ignore require-await
  async getVersions(_name: string): Promise<Versions> {
    if (!this.versionsResolver) {
      throw new UnsupportedVersionListingError(
        `The "${this.name}" provider has no version list. Set the \`versions\` option or request an explicit version.`,
      );
    }
    return typeof this.versionsResolver === "function"
      ? this.versionsResolver()
      : this.versionsResolver;
  }

  override isOutdated(
    name: string,
    currentVersion: string,
    targetVersion: string,
  ): Promise<boolean> {
    if (this.versionsResolver) {
      return super.isOutdated(name, currentVersion, targetVersion);
    }

    if (currentVersion === targetVersion) {
      this.logger?.warn(
        yellow(`You're already using version ${currentVersion} of ${name}.`),
      );
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }

  getRepositoryUrl(): string {
    return this.homepage ?? "";
  }

  getRegistryUrl(name: string, version: string): string {
    if (!this.scriptUrl) {
      throw new UnsupportedUpgradeError(
        `The "${this.name}" provider has no script url. Set the \`url\` option.`,
      );
    }
    if (getRuntimeName() !== "deno") {
      throw new UnsupportedUpgradeError(
        `Script upgrades with the "${this.name}" provider are only supported on Deno.`,
      );
    }
    const url = typeof this.scriptUrl === "function"
      ? this.scriptUrl({ name, version })
      : this.scriptUrl;

    return new URL(url).href;
  }

  override getSpecifier(
    name: string,
    version: string,
    main?: string,
  ): string {
    if (main) {
      throw new TypeError(
        `The "url" provider does not support the \`main\` option because \`url\` resolves the exact script entrypoint.`,
      );
    }
    return this.getRegistryUrl(name, version);
  }

  override async getBinaryAsset(
    context: BinaryUpgradeContext,
  ): Promise<BinaryAsset> {
    if (!this.assetUrl) {
      throw new UnsupportedUpgradeError(
        `The "${this.name}" provider has no binary asset. Set the \`asset\` option.`,
      );
    }
    const url = typeof this.assetUrl === "function"
      ? this.assetUrl(context)
      : this.assetUrl;
    const assetUrl = new URL(url);
    const pathname = assetUrl.pathname;
    const name = pathname.split("/").filter(Boolean).pop() ?? context.name;
    const headers = typeof this.assetHeaders === "function"
      ? await this.assetHeaders(context)
      : this.assetHeaders;

    return {
      url: assetUrl.href,
      name,
      headers,
      binaryName: resolveBinaryName(this.binaryName, context),
      extract: this.extract,
    };
  }
}

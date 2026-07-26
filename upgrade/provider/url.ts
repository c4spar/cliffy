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

/** Resolves the download url for a build target. */
export type UrlResolver =
  | string
  | ((context: BinaryUpgradeContext) => string);

/** Resolves the available versions. */
export type VersionsResolver = Versions | (() => Versions | Promise<Versions>);

/** Resolves the auth headers sent with the download request. */
export type HeadersResolver =
  | HeadersInit
  | ((context: BinaryUpgradeContext) => HeadersInit | Promise<HeadersInit>);

export interface UrlProviderOptions extends ProviderOptions {
  /** Download url for the binary, or a resolver building it per build target. */
  url: UrlResolver;
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
  /** Auth headers sent with the download request, e.g. for private hosts. */
  headers?: HeadersResolver;
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
 * Upgrade provider that downloads a prebuilt binary from an arbitrary url
 * (a cdn, object storage, or a custom host). Binary upgrades only.
 *
 * @example
 * ```ts ignore
 * import { UrlProvider } from "@cliffy/upgrade/provider/url";
 *
 * const provider = new UrlProvider({
 *   url: ({ name, version, os, arch }) =>
 *     `https://cdn.example.com/${name}/${version}/${name}-${os}-${arch}.tar.gz`,
 * });
 * ```
 */
export class UrlProvider extends Provider {
  name = "url";
  private readonly url: UrlResolver;
  private readonly versionsResolver?: VersionsResolver;
  private readonly requiredPermissionsResolver?: () =>
    | boolean
    | Promise<boolean>;
  private readonly headers?: HeadersResolver;
  private readonly binaryName?: BinaryNameResolver;
  private readonly extract?: Extract;
  private readonly binaryLocation?: string;
  private readonly homepage?: string;

  constructor(
    {
      url,
      versions,
      hasRequiredPermissions,
      headers,
      binaryName,
      extract,
      location,
      homepage,
      main,
      logger,
    }: UrlProviderOptions,
  ) {
    super({ main, logger });
    this.url = url;
    this.versionsResolver = versions;
    this.requiredPermissionsResolver = hasRequiredPermissions;
    this.headers = headers;
    this.binaryName = binaryName;
    this.extract = extract;
    this.binaryLocation = location;
    this.homepage = homepage;
  }

  override get supportsScriptUpgrade(): boolean {
    return false;
  }

  override get supportsBinaryUpgrade(): boolean {
    return true;
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

  getRegistryUrl(): string {
    throw new UnsupportedUpgradeError(
      `The "${this.name}" provider does not support script upgrades.`,
    );
  }

  override async getBinaryAsset(
    context: BinaryUpgradeContext,
  ): Promise<BinaryAsset> {
    const url = typeof this.url === "function" ? this.url(context) : this.url;
    const pathname = new URL(url).pathname;
    const name = pathname.split("/").filter(Boolean).pop() ?? context.name;
    const headers = typeof this.headers === "function"
      ? await this.headers(context)
      : this.headers;

    return {
      url,
      name,
      headers,
      binaryName: resolveBinaryName(this.binaryName, context),
      extract: this.extract,
    };
  }
}

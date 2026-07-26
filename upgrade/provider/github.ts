import {
  type BinaryAsset,
  type BinaryUpgradeContext,
  type Extract,
  Provider,
  type ProviderOptions,
  type Versions,
} from "../provider.ts";
import { AssetNotFoundError } from "../asset-not-found-error.ts";
import { getEnv } from "@cliffy/internal/runtime/get-env";
import { hasPermission } from "@cliffy/internal/runtime/has-permission";
import { bold, brightBlue } from "@std/fmt/colors";

/** Resolves the token used to authenticate github api requests. */
export type GithubTokenResolver = () =>
  | string
  | undefined
  | Promise<
    string | undefined
  >;

/**
 * Resolves the release asset filename for a build target, either as a
 * `os-arch` -> filename map or a function.
 */
export type GithubAssetResolver =
  | Record<`${string}-${string}`, string>
  | ((context: BinaryUpgradeContext) => string);

export interface GithubProviderOptions extends ProviderOptions {
  repository: string;
  branches?: boolean;
  /**
   * Github token, or a resolver returning one. Falls back to the `GITHUB_TOKEN`
   * and `GH_TOKEN` environment variables.
   */
  token?: string | GithubTokenResolver;
  /**
   * Release asset to download per build target. Enables binary upgrades for
   * clis compiled with `deno compile` and friends.
   */
  asset?: GithubAssetResolver;
  /** Binary to extract from an archive asset. Defaults to the cli name. */
  binaryName?: string | ((context: BinaryUpgradeContext) => string);
  /** Custom extractor(s) for archive formats that aren't handled built-in. */
  extract?: Extract;
  /** Default install location for the downloaded binary. */
  location?: string;
}

export interface GithubVersions extends Versions {
  tags: Array<string>;
  branches: Array<string>;
}

export class GithubProvider extends Provider {
  name = "github";
  private readonly repositoryUrl = "https://github.com/";
  private readonly registryUrl = "https://raw.githubusercontent.com/";
  private readonly apiUrl = "https://api.github.com/repos/";
  private readonly repositoryName: string;
  private readonly listBranches?: boolean;
  private readonly githubToken?: string | GithubTokenResolver;
  private readonly asset?: GithubAssetResolver;
  private readonly binaryName?:
    | string
    | ((context: BinaryUpgradeContext) => string);
  private readonly extract?: Extract;
  private readonly binaryLocation?: string;

  constructor(
    {
      repository,
      branches = true,
      token,
      asset,
      binaryName,
      extract,
      location,
      main,
      logger,
    }: GithubProviderOptions,
  ) {
    super({ main, logger });
    this.repositoryName = repository;
    this.listBranches = branches;
    this.githubToken = token;
    this.asset = asset;
    this.binaryName = binaryName;
    this.extract = extract;
    this.binaryLocation = location;
  }

  override get supportsBinaryUpgrade(): boolean {
    return !!this.asset;
  }

  override get location(): string | undefined {
    return this.binaryLocation;
  }

  hasRequiredPermissions(): Promise<boolean> {
    return hasPermission({ name: "net", host: new URL(this.apiUrl).host });
  }

  async getVersions(
    _name: string,
  ): Promise<GithubVersions> {
    const { tags, branches } = await this.getRefs();
    const branchNames = branches.map((branch) => branch.name);

    return {
      versions: [
        ...tags,
        ...branchNames,
      ],
      latest: tags[0],
      tags,
      branches: branchNames,
    };
  }

  getRepositoryUrl(_name: string, version?: string): string {
    return new URL(
      `${this.repositoryName}${version ? `/releases/tag/${version}` : ""}`,
      this.repositoryUrl,
    ).href;
  }

  getRegistryUrl(_name: string, version: string): string {
    return new URL(`${this.repositoryName}/${version}`, this.registryUrl).href;
  }

  override async listVersions(
    _name: string,
    currentVersion?: string,
  ): Promise<void> {
    const { tags, branches } = await this.getRefs();
    const showBranches = !!this.listBranches && branches.length > 0;
    const indent = showBranches ? 2 : 0;
    if (showBranches) {
      console.log("\n" + " ".repeat(indent) + bold(brightBlue("Tags:\n")));
    }
    super.printVersions(tags, currentVersion, { indent });
    if (showBranches) {
      const branchNames = branches.map((branch) =>
        branch.protected ? `${branch.name} (${bold("Protected")})` : branch.name
      );
      console.log("\n" + " ".repeat(indent) + bold(brightBlue("Branches:\n")));
      super.printVersions(branchNames, currentVersion, { maxCols: 5, indent });
      console.log();
    }
  }

  override async getBinaryAsset(
    context: BinaryUpgradeContext,
  ): Promise<BinaryAsset> {
    const assetName = this.resolveAssetName(context);
    const release = await this.gitFetch<GithubRelease>(
      `releases/tags/${context.version}`,
    );
    const releaseAsset = release.assets
      ?.find((asset) => asset.name === assetName);

    if (!releaseAsset) {
      throw new AssetNotFoundError(
        `No asset "${assetName}" found in release "${context.version}" of ${this.repositoryName}.` +
          (release.assets?.length
            ? ` Available assets: ${
              release.assets.map((asset) => asset.name).join(", ")
            }`
            : " The release has no assets."),
      );
    }

    const token = await this.getToken();
    const headers: Record<string, string> = {
      Accept: "application/octet-stream",
    };
    if (token) {
      headers.Authorization = `token ${token}`;
    }

    return {
      url: releaseAsset.url,
      name: assetName,
      headers,
      binaryName: this.resolveBinaryName(context),
      extract: this.extract,
    };
  }

  private resolveAssetName(context: BinaryUpgradeContext): string {
    if (typeof this.asset === "function") {
      return this.asset(context);
    }
    const key = `${context.os}-${context.arch}` as const;
    const assetName = this.asset?.[key];
    if (!assetName) {
      throw new AssetNotFoundError(
        `No release asset configured for target "${key}".` +
          (this.asset
            ? ` Configured targets: ${Object.keys(this.asset).join(", ")}`
            : ""),
      );
    }
    return assetName;
  }

  private resolveBinaryName(context: BinaryUpgradeContext): string {
    const binaryName = typeof this.binaryName === "function"
      ? this.binaryName(context)
      : this.binaryName;
    return binaryName ?? context.name;
  }

  private async getToken(): Promise<string | undefined> {
    const explicit = typeof this.githubToken === "function"
      ? await this.githubToken()
      : this.githubToken;
    return explicit ?? safeGetEnv("GITHUB_TOKEN") ?? safeGetEnv("GH_TOKEN");
  }

  private async getRefs(): Promise<{
    tags: Array<string>;
    branches: Array<GithubBranch>;
  }> {
    const [tags, branches] = await Promise.all([
      this.gitFetch<Array<{ ref: string }>>("git/refs/tags"),
      this.gitFetch<Array<GithubBranch>>("branches"),
    ]);

    return {
      tags: tags
        .map((tag) => tag.ref.replace(/^refs\/tags\//, ""))
        .reverse(),
      branches: branches
        .sort((a, b) =>
          (a.protected === b.protected) ? 0 : (a.protected ? 1 : -1)
        )
        .reverse(),
    };
  }

  private getApiUrl(endpoint: string): string {
    return new URL(`${this.repositoryName}/${endpoint}`, this.apiUrl).href;
  }

  private async gitFetch<T>(endpoint: string): Promise<T> {
    const headers = new Headers({ "Content-Type": "application/json" });
    const token = await this.getToken();
    if (token) {
      headers.set("Authorization", `token ${token}`);
    }
    const response = await fetch(
      this.getApiUrl(endpoint),
      {
        method: "GET",
        cache: "default",
        headers,
      },
    );

    if (!response.status) {
      throw new Error(
        "couldn't fetch versions - try again after sometime",
      );
    }

    const data: GithubResponse & T = await response.json();

    if (
      typeof data === "object" && "message" in data &&
      "documentation_url" in data
    ) {
      throw new Error(data.message + " " + data.documentation_url);
    }

    return data;
  }
}

interface GithubResponse {
  message: string;
  // deno-lint-ignore camelcase
  documentation_url: string;
}

interface GithubRelease {
  assets: Array<{
    name: string;
    url: string;
  }>;
}

interface GithubBranch {
  name: string;
  protected: boolean;
}

function safeGetEnv(name: string): string | undefined {
  try {
    return getEnv(name);
  } catch {
    return undefined;
  }
}

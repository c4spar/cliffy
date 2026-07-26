import {
  type BinaryAsset,
  type BinaryUpgradeContext,
  type Extract,
  Provider,
  type ProviderOptions,
  type Versions,
} from "../provider.ts";
import { AssetNotFoundError } from "../asset-not-found-error.ts";
import {
  type AssetResolver,
  type BinaryNameResolver,
  resolveAssetName,
  resolveBinaryName,
} from "../asset.ts";
import { resolveToken, type TokenResolver } from "../token.ts";
import { hasPermission } from "@cliffy/internal/runtime/has-permission";
import { bold, brightBlue } from "@std/fmt/colors";

/** Resolves the token used to authenticate gitlab api requests. */
export type GitlabTokenResolver = TokenResolver;

/**
 * Resolves the release asset filename for a build target, either as a
 * `os-arch` -> filename map or a function.
 */
export type GitlabAssetResolver = AssetResolver;

export interface GitlabProviderOptions extends ProviderOptions {
  repository: string;
  /** Gitlab instance url. Defaults to `https://gitlab.com` for self-hosting. */
  host?: string;
  branches?: boolean;
  /**
   * Gitlab token, or a resolver returning one. Falls back to the
   * `GITLAB_TOKEN` environment variable. Sent as the `PRIVATE-TOKEN` header.
   */
  token?: string | GitlabTokenResolver;
  /**
   * Release asset to download per build target. Enables binary upgrades for
   * clis compiled with `deno compile` and friends.
   */
  asset?: GitlabAssetResolver;
  /** Binary to extract from an archive asset. Defaults to the cli name. */
  binaryName?: BinaryNameResolver;
  /** Custom extractor(s) for archive formats that aren't handled built-in. */
  extract?: Extract;
  /** Default install location for the downloaded binary. */
  location?: string;
}

export interface GitlabVersions extends Versions {
  tags: Array<string>;
  branches: Array<string>;
}

export class GitlabProvider extends Provider {
  name = "gitlab";
  private readonly host: string;
  private readonly repositoryName: string;
  private readonly listBranches?: boolean;
  private readonly gitlabToken?: string | GitlabTokenResolver;
  private readonly asset?: GitlabAssetResolver;
  private readonly binaryName?: BinaryNameResolver;
  private readonly extract?: Extract;
  private readonly binaryLocation?: string;

  constructor(
    {
      repository,
      host = "https://gitlab.com",
      branches = true,
      token,
      asset,
      binaryName,
      extract,
      location,
      main,
      logger,
    }: GitlabProviderOptions,
  ) {
    super({ main, logger });
    this.host = host.replace(/\/+$/, "");
    this.repositoryName = repository;
    this.listBranches = branches;
    this.gitlabToken = token;
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
    return hasPermission({ name: "net", host: new URL(this.host).host });
  }

  async getVersions(_name: string): Promise<GitlabVersions> {
    const { tags, branches } = await this.getRefs();
    const branchNames = branches.map((branch) => branch.name);

    return {
      versions: [...tags, ...branchNames],
      latest: tags[0],
      tags,
      branches: branchNames,
    };
  }

  getRepositoryUrl(_name: string, version?: string): string {
    return `${this.host}/${this.repositoryName}${
      version ? `/-/releases/${version}` : ""
    }`;
  }

  getRegistryUrl(_name: string, version: string): string {
    return `${this.host}/${this.repositoryName}/-/raw/${version}`;
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
    const assetName = resolveAssetName(this.asset, context);
    const release = await this.gitFetch<GitlabRelease>(
      `releases/${context.version}`,
    );
    const link = release.assets?.links?.find((l) => l.name === assetName);

    if (!link) {
      const available = release.assets?.links?.map((l) => l.name) ?? [];
      throw new AssetNotFoundError(
        `No asset "${assetName}" found in release "${context.version}" of ${this.repositoryName}.` +
          (available.length
            ? ` Available assets: ${available.join(", ")}`
            : " The release has no asset links."),
      );
    }

    const url = new URL(link.url, `${this.host}/`);
    const token = await this.getToken();
    const headers: Record<string, string> = {};
    if (token && url.origin === new URL(this.host).origin) {
      headers["PRIVATE-TOKEN"] = token;
    }

    return {
      url: url.href,
      name: assetName,
      headers,
      binaryName: resolveBinaryName(this.binaryName, context),
      extract: this.extract,
    };
  }

  private getToken(): Promise<string | undefined> {
    return resolveToken(this.gitlabToken, ["GITLAB_TOKEN"]);
  }

  private async getRefs(): Promise<{
    tags: Array<string>;
    branches: Array<GitlabBranch>;
  }> {
    const [tags, branches] = await Promise.all([
      this.gitFetch<Array<{ name: string }>>("repository/tags"),
      this.gitFetch<Array<GitlabBranch>>("repository/branches"),
    ]);

    return {
      tags: tags.map((tag) => tag.name),
      branches: branches.sort((a, b) =>
        a.protected === b.protected ? 0 : a.protected ? 1 : -1
      ),
    };
  }

  private getApiUrl(endpoint: string): string {
    return `${this.host}/api/v4/projects/${
      encodeURIComponent(this.repositoryName)
    }/${endpoint}`;
  }

  private async gitFetch<T>(endpoint: string): Promise<T> {
    const headers = new Headers({ "Content-Type": "application/json" });
    const token = await this.getToken();
    if (token) {
      headers.set("PRIVATE-TOKEN", token);
    }
    const response = await fetch(this.getApiUrl(endpoint), {
      method: "GET",
      cache: "default",
      headers,
    });

    const data: GitlabError & T | GitlabError = await response.json();

    if (!response.ok) {
      const message = isGitlabError(data)
        ? (data.message ?? data.error)
        : response.statusText;
      throw new Error(String(message));
    }

    return data as T;
  }
}

interface GitlabError {
  message?: string;
  error?: string;
}

interface GitlabRelease {
  assets?: {
    links?: Array<{ name: string; url: string }>;
  };
}

interface GitlabBranch {
  name: string;
  protected: boolean;
}

function isGitlabError(data: unknown): data is GitlabError {
  return typeof data === "object" && data !== null &&
    ("message" in data || "error" in data);
}

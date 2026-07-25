import { Provider, type ProviderOptions, type Versions } from "../provider.ts";
import { hasPermission } from "@cliffy/internal/runtime/has-permission";

export type NpmProviderOptions =
  & ProviderOptions
  & ({
    package: string;
  } | {
    scope?: string;
    name?: string;
  });

export class NpmProvider extends Provider {
  name = "npm";
  protected override readonly delegateLatestResolution = true;
  private readonly repositoryUrl = "https://npmjs.org/";
  private readonly apiUrl = "https://registry.npmjs.org/";
  private readonly packageName?: string;
  private readonly packageScope?: string;

  constructor({ main, logger, ...options }: NpmProviderOptions = {}) {
    super({ main, logger });
    if ("package" in options) {
      if (options.package.startsWith("@")) {
        this.packageScope = options.package.split("/")[0].slice(1);
        this.packageName = options.package.split("/")[1];
      } else {
        this.packageName = options.package;
      }
    } else {
      this.packageScope = options.scope;
      this.packageName = options.name;
    }
  }

  hasRequiredPermissions(): Promise<boolean> {
    return hasPermission({ name: "net", host: new URL(this.apiUrl).host });
  }

  async getVersions(
    name: string,
  ): Promise<Versions> {
    const response = await fetch(
      new URL(this.#getPackageName(name), this.apiUrl),
    );
    if (!response.ok) {
      throw new Error(
        "couldn't fetch the latest version - try again after sometime",
      );
    }

    const { "dist-tags": { latest }, versions } = await response
      .json() as NpmApiPackageMetadata;

    return {
      latest,
      versions: Object.keys(versions).reverse(),
    };
  }

  getRepositoryUrl(name: string, version?: string): string {
    return new URL(
      `package/${this.#getPackageName(name)}${version ? `/v/${version}` : ""}`,
      this.repositoryUrl,
    ).href;
  }

  getRegistryUrl(name: string, version: string): string {
    return `npm:${this.#getPackageName(name)}@${
      this.resolveSpecifierVersion(version)
    }`;
  }

  #getPackageName(name: string): string {
    return `${this.packageScope ? `@${this.packageScope}/` : ""}${
      this.packageName ?? name
    }`;
  }
}

type NpmApiPackageMetadata = {
  "dist-tags": {
    latest: string;
  };
  versions: {
    [version: string]: unknown;
  };
};

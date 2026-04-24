import { Provider, type ProviderOptions, type Versions } from "../provider.ts";

type Semver =
  | `${number}.${number}.${number}`
  | `${number}.${number}.${number}-${string}`;

type Package = `@${string}/${string}`;

type JsrApiPackageMetadata = {
  scope: string;
  name: string;
  latest: Semver;
  versions: {
    [version: Semver]: { yanked?: boolean };
  };
};

export type JsrProviderOptions =
  & ProviderOptions
  & ({
    package: Package;
  } | {
    scope: string;
    name?: string;
  });

export class JsrProvider extends Provider {
  name = "jsr";
  private readonly repositoryUrl = "https://jsr.io/";
  private readonly packageName?: string;
  private readonly packageScope: string;

  constructor({ main, logger, ...options }: JsrProviderOptions) {
    super({ main, logger });
    this.packageScope = "package" in options
      ? options.package.split("/")[0].slice(1)
      : options.scope;
    this.packageName = "package" in options
      ? options.package.split("/")[1]
      : options.name;
  }

  async hasRequiredPermissions(): Promise<boolean> {
    const apiUrl = new URL(this.repositoryUrl);
    const permissionStatus = await Deno.permissions.query({
      name: "net",
      host: apiUrl.host,
    });
    return permissionStatus.state === "granted";
  }

  async getVersions(
    name: string,
  ): Promise<Versions> {
    const response = await fetch(`${this.getRepositoryUrl(name)}/meta.json`);
    if (!response.ok) {
      throw new Error(
        "couldn't fetch the latest version - try again after sometime",
      );
    }

    const { latest, versions } = await response.json() as JsrApiPackageMetadata;

    return {
      latest,
      versions: Object.keys(versions),
    };
  }

  getRepositoryUrl(name: string, version?: Semver): string {
    return new URL(
      `@${this.packageScope}/${this.packageName ?? name}${
        version ? `@${version}` : ""
      }`,
      this.repositoryUrl,
    ).href;
  }

  getRegistryUrl(name: string, version: Semver): string {
    return `jsr:@${this.packageScope}/${this.packageName ?? name}@${version}`;
  }
}

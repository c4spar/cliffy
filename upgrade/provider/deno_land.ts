import { Provider, type ProviderOptions, type Versions } from "../provider.ts";

export interface DenoLandProviderOptions extends ProviderOptions {
  name?: string;
}

export class DenoLandProvider extends Provider {
  name = "deno.land";
  private readonly repositoryUrl = "https://deno.land/x/";
  private readonly registryUrl = "https://deno.land/x/";
  private readonly apiUrl = "https://cdn.deno.land/";
  private readonly moduleName?: string;

  constructor({ name, main, logger }: DenoLandProviderOptions = {}) {
    super({ main, logger });
    this.moduleName = name;
  }

  async hasRequiredPermissions(): Promise<boolean> {
    const apiUrl = new URL(this.apiUrl);
    const permissionStatus = await Deno.permissions.query({
      name: "net",
      host: apiUrl.host,
    });
    return permissionStatus.state === "granted";
  }

  async getVersions(
    name: string,
  ): Promise<Versions> {
    const response = await fetch(
      `${this.apiUrl}${this.moduleName ?? name}/meta/versions.json`,
    );
    if (!response.ok) {
      throw new Error(
        "couldn't fetch the latest version - try again after sometime",
      );
    }

    return await response.json();
  }

  getRepositoryUrl(name: string, version?: string): string {
    return new URL(
      `${this.moduleName ?? name}${version ? `@${version}` : ""}`,
      this.repositoryUrl,
    ).href;
  }

  getRegistryUrl(name: string, version: string): string {
    return new URL(`${this.moduleName ?? name}@${version}`, this.registryUrl)
      .href;
  }
}

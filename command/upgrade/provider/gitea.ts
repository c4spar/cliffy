import { Provider, type Versions } from "../provider.ts";
import { bold, brightBlue } from "@std/fmt/colors";

export interface GiteaProviderOptions {
  registryUrl: string;
  repository: string;
  branches?: boolean;
  token?: string;
}

export interface GiteaVersions extends Versions {
  tags: Array<string>;
  branches: Array<string>;
}

export class GiteaProvider extends Provider {
  name = "gitea";
  private readonly registryUrl: string;
  private readonly repositoryName: string;
  private readonly listBranches?: boolean;
  private readonly giteaToken?: string;

  constructor({ registryUrl, repository, branches = true, token }: GiteaProviderOptions) {
    super();
    this.registryUrl = registryUrl
    this.repositoryName = repository;
    this.listBranches = branches;
    this.giteaToken = token;
  }

  async getVersions(
    _name: string,
  ): Promise<GiteaVersions> {
    //!TODO
    const [tags, branches] = await Promise.all([
      this.gitFetch<GiteaRepoTag[]>("tags"),
      this.gitFetch<GiteaRepoBranch[]>("branches"),
    ]);

    const tagNames = tags.map(tag => tag.name).toReversed()

    const branchNames = branches
      .sort((a, b) =>
        (a.protected === b.protected) ? 0 : (a.protected ? 1 : -1)
      )
      .map((tag) =>
        tag.protected ? `${tag.name} (${bold("Protected")})` : tag.name
      )
      .reverse();

    return {
      versions: [
        ...tagNames,
        ...branchNames,
      ],
      latest: tagNames[0],
      tags: tagNames,
      branches: branchNames,
    };
  }

  getRepositoryUrl(_name: string): string {
    return new URL(this.repositoryName, this.registryUrl).href;
  }

  getRegistryUrl(_name: string, version: string): string {
    return new URL(`${this.repositoryName}/src/tag/${version}`, this.registryUrl).href;
  }

  async listVersions(name: string, currentVersion?: string): Promise<void> {
    //!TODO
    const { tags, branches } = await this.getVersions(name);
    const showBranches: boolean = !!this.listBranches && branches.length > 0;
    const indent = showBranches ? 2 : 0;
    if (showBranches) {
      console.log("\n" + " ".repeat(indent) + bold(brightBlue("Tags:\n")));
    }
    super.printVersions(tags, currentVersion, { indent });
    if (showBranches) {
      console.log("\n" + " ".repeat(indent) + bold(brightBlue("Branches:\n")));
      super.printVersions(branches, currentVersion, { maxCols: 5, indent });
      console.log();
    }
  }

  private getApiUrl(endpoint: string): string {
    return new URL(`api/v1/repos/${this.repositoryName}/${endpoint}`, this.registryUrl).href;
  }

  private async gitFetch<T>(endpoint: string): Promise<T> {
    const headers = new Headers({ "Content-Type": "application/json" });
    if (this.giteaToken) {
      headers.set(
        "Authorization",
        this.giteaToken ? `token ${this.giteaToken}` : "",
      );
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

    const data: GiteaResponse & T = await response.json();

    //!TODO check error message
    if (
      typeof data === "object" && "message" in data &&
      "documentation_url" in data
    ) {
      throw new Error(data.message + " " + data.documentation_url);
    }

    return data;
  }
}

interface GiteaResponse {
  //!TODO check response format
  message: string;
  // deno-lint-ignore camelcase
  documentation_url: string;
}

interface GiteaRepoTag {
    //!TODO improve types
    name: string
    message: string
    id: string //sha1 (commit.sha)
    commit: {
        url: string //url
        sha: string //sha1
        created: string //ISO
    }
    zipball_url: string //url
    tarball_url: string //url
}

interface GiteaRepoBranch {   
    commit: {
        author:	{    
            email:  string
            name: string
            username: string
            committer: {
                email: string
                name: string
                username: string
            }
            id: string //commit sha1
            url: string //url
            timestamp: string //ISO
            message: string
            added: string[] | null
            modified: string[] | null
            removed: string[] | null
            verification: {
                payload: string
                reason: string
                signature: string
                verified: boolean
                signer: {
                    email: string
                    name: string
                    username: string
                } | null
            }
        }
    }
    effective_branch_protection_name: string
    enable_status_check: boolean
    name: string
    protected: boolean
    required_approvals: number
    status_check_contexts: string[]
    user_can_merge: boolean
    user_can_push: boolean
}
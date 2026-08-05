export interface EcosystemRepoOwner {
  login: string;
  avatar_url: string;
}

export interface EcosystemRepo {
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  html_url: string;
  open_issues_count: number;
  pushed_at: string | null;
  owner: EcosystemRepoOwner;
}

export interface MainRepo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count: number;
  language: string | null;
  description: string;
  html_url: string;
  topics: string[];
  pushed_at: string | null;
  created_at: string | null;
  license: {
    spdx_id: string;
  };
}

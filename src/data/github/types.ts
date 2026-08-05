export interface GitHubRepo {
  name: string;
  slug: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
  owner: string;
  topics: string[];
  updatedAt: string;
}

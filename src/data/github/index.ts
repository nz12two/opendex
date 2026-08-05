import type { GitHubRepo } from './types';
import ecosystemRepos from './ecosystem-repos.json';

export type { GitHubRepo };

function toGitHubRepo(repo: any): GitHubRepo {
  return {
    name: repo.full_name.split('/')[1],
    slug: repo.full_name.replace('/', '-'),
    description: repo.description ?? '',
    language: repo.language ?? 'Unknown',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    url: repo.html_url,
    owner: repo.owner?.login ?? '',
    topics: repo.topics ?? [],
    updatedAt: repo.pushed_at?.slice(0, 10) ?? '',
  };
}

export const githubRepos: GitHubRepo[] = ecosystemRepos.map(toGitHubRepo);

export function getRepoBySlug(slug: string): GitHubRepo | undefined {
  return githubRepos.find(r => r.slug === slug);
}

export function getLanguages(): string[] {
  const langSet = new Set<string>();
  githubRepos.forEach(r => langSet.add(r.language));
  return [...langSet].sort();
}

export function getTotalStars(): number {
  return githubRepos.reduce((acc, r) => acc + r.stars, 0);
}

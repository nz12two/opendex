export interface LinkItem {
  name: string;
  url: string;
  icon: string;
  category: 'official' | 'community' | 'resources';
}

export const links: LinkItem[] = [
  { name: "Website", url: "https://opencode.ai", icon: "Globe", category: "official" },
  { name: "GitHub", url: "https://github.com/anomalyco/opencode", icon: "Github", category: "official" },
  { name: "Documentation", url: "https://opencode.ai/docs", icon: "BookOpen", category: "official" },
  { name: "Discord", url: "https://discord.gg/opencode", icon: "MessageCircle", category: "community" },
  { name: "Discussions", url: "https://github.com/anomalyco/opencode/discussions", icon: "MessageSquare", category: "community" },
  { name: "Roadmap", url: "https://github.com/anomalyco/opencode/milestones", icon: "Map", category: "resources" },
  { name: "Releases", url: "https://github.com/anomalyco/opencode/releases", icon: "Rocket", category: "resources" },
  { name: "Changelog", url: "https://opencode.ai/changelog", icon: "Newspaper", category: "resources" },
  { name: "Issues", url: "https://github.com/anomalyco/opencode/issues", icon: "GitPullRequest", category: "resources" },
  { name: "Pull Requests", url: "https://github.com/anomalyco/opencode/pulls", icon: "GitMerge", category: "resources" },
];

export function getLinksByCategory(category: LinkItem['category']): LinkItem[] {
  return links.filter(l => l.category === category);
}

export const categories = [
  { id: 'official' as const, label: 'Official' },
  { id: 'community' as const, label: 'Community' },
  { id: 'resources' as const, label: 'Resources' },
];

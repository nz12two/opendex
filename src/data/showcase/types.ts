export interface ShowcaseProject {
  name: string;
  slug: string;
  description: string;
  author: string;
  tags: string[];
  type: string;
  url: string;
  featured: boolean;
  stars: number;
  forks: number;
  language: string | null;
  avatar?: string;
  score: number;
  lastUpdated: string;
}

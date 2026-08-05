export interface Script {
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  downloads: number;
  version: string;
  npm: string;
  repository: string | null;
}

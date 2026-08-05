export interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'release' | 'community';
  icon: string;
  url: string;
  source: string;
  author?: string;
  content?: string;
  tags?: string[];
}

export interface ComparisonRow {
  feature: string;
  opencode: string;
  other: string;
}

export interface Comparison {
  tool: string;
  vs: string;
  slug: string;
  description: string;
  table: ComparisonRow[];
  pros?: string[];
  cons?: string[];
  verdict?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

export interface BenchmarkModel {
  name: string;
  speed: number;
  cost: string;
  quality: number;
}

export interface Benchmark {
  models: BenchmarkModel[];
  description?: string;
}

export interface Model {
  name: string;
  slug: string;
  category: 'free' | 'cheap' | 'fast' | 'reasoning' | 'coding' | 'large-context' | 'vision' | 'local';
  speed: number; // 1-5
  quality: number; // 1-5
  price: string;
  context: number;
  toolCalling: boolean;
  reasoning: boolean;
  whenToUse: string;
  whenNotToUse: string;
  communityRating: number;
  pros: string[];
  cons: string[];
  description?: string;
  provider?: string;
  releaseDate?: string;
}

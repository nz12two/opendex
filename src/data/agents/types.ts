export interface Agent {
  name: string;
  slug: string;
  description: string;
  whatItDoes: string;
  whenToUse: string;
  inputs: string[];
  outputs: string[];
  example: string;
  tags: string[];
}

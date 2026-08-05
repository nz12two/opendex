export interface SetupStep {
  title: string;
  description: string;
  code?: string;
  warning?: string;
}

export interface SetupGuide {
  name: string;
  slug: string;
  provider: string;
  description: string;
  icon: string;
  difficulty: 'iniciante' | 'intermediário' | 'avançado';
  timeToComplete: string;
  steps: SetupStep[];
  tips?: string[];
  requirements?: string[];
}

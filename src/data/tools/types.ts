export interface Tool {
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

export interface AgentConfig {
  name: string;
  description: string;
  type: 'builder' | 'reviewer' | 'tester' | 'debugger' | 'planner' | 'researcher';
  tools: string[];
  budget: number;
  model?: string;
}

export interface OpencodeConfig {
  projectName: string;
  agents: AgentConfig[];
  plugins: string[];
  mcps: string[];
  skills: string[];
  customInstructions?: string;
}

export interface PromptTemplate {
  name: string;
  slug: string;
  description: string;
  category: string;
  content: string;
  variables: string[];
}

export interface TokenEstimate {
  characters: number;
  words: number;
  lines: number;
  tokens: number;
  estimatedCost: number;
}

export interface WorkflowAgent {
  id: string;
  name: string;
  agentType: string;
  prompt: string;
}

export interface WorkflowConfig {
  name: string;
  description: string;
  steps: WorkflowAgent[];
  parallel: boolean;
}

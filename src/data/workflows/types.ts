export interface WorkflowStep {
  name: string;
  agent: string;
  next?: string[];
}

export interface Workflow {
  name: string;
  slug: string;
  description: string;
  steps: WorkflowStep[];
  tags?: string[];
}

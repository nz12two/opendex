import type { Workflow } from './types';

export { type Workflow };

export const workflows: Workflow[] = [
  {
    name: "Desenvolvimento Web",
    slug: "web-development",
    description: "Workflow completo de desenvolvimento web full-stack",
    tags: ["web", "fullstack", "desenvolvimento"],
    steps: [
      { name: "Planner", agent: "planner", next: ["backend", "frontend"] },
      { name: "Backend", agent: "builder", next: ["qa"] },
      { name: "Frontend", agent: "builder", next: ["qa"] },
      { name: "QA", agent: "tester", next: ["aggregator"] },
      { name: "Aggregator", agent: "reviewer" }
    ]
  },
  {
    name: "Refatoração",
    slug: "refactoring",
    description: "Workflow de refatoração segura com testes e revisão",
    tags: ["refatoração", "clean-code", "melhoria"],
    steps: [
      { name: "Analysis", agent: "planner", next: ["extraction"] },
      { name: "Extraction", agent: "builder", next: ["testing"] },
      { name: "Testing", agent: "tester", next: ["review"] },
      { name: "Review", agent: "reviewer", next: ["cleanup"] },
      { name: "Cleanup", agent: "builder" }
    ]
  },
  {
    name: "Deploy",
    slug: "deploy",
    description: "Workflow de deploy automatizado com validação e rollback",
    tags: ["deploy", "devops", "automação"],
    steps: [
      { name: "Pre-deploy Checks", agent: "tester", next: ["build"] },
      { name: "Build", agent: "builder", next: ["staging"] },
      { name: "Staging", agent: "reviewer", next: ["production"] },
      { name: "Production", agent: "builder", next: ["monitor"] },
      { name: "Monitor", agent: "tester" }
    ]
  }
];

export function getWorkflowBySlug(slug: string): Workflow | undefined {
  return workflows.find(w => w.slug === slug);
}

export function getWorkflowTags(): string[] {
  const tagSet = new Set<string>();
  workflows.forEach(w => (w.tags || []).forEach(t => tagSet.add(t)));
  return [...tagSet].sort();
}

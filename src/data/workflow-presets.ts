import type { WorkflowPreset } from '@/lib/workflow/types';

export const workflowPresets: WorkflowPreset[] = [
  {
    name: 'Desenvolvimento Web',
    description: 'Workflow completo de desenvolvimento web full-stack',
    nodes: [
      {
        id: 'planner',
        type: 'agent',
        position: { x: 250, y: 50 },
        data: { label: 'Planner', agent: 'planner' },
      },
      {
        id: 'backend',
        type: 'agent',
        position: { x: 50, y: 250 },
        data: { label: 'Backend', agent: 'builder' },
      },
      {
        id: 'frontend',
        type: 'agent',
        position: { x: 450, y: 250 },
        data: { label: 'Frontend', agent: 'builder' },
      },
      {
        id: 'qa',
        type: 'agent',
        position: { x: 250, y: 400 },
        data: { label: 'QA', agent: 'tester' },
      },
      {
        id: 'aggregator',
        type: 'agent',
        position: { x: 250, y: 550 },
        data: { label: 'Aggregator', agent: 'aggregator' },
      },
    ],
    edges: [
      { id: 'e-planner-backend', source: 'planner', target: 'backend', type: 'smoothstep' },
      { id: 'e-planner-frontend', source: 'planner', target: 'frontend', type: 'smoothstep' },
      { id: 'e-backend-qa', source: 'backend', target: 'qa', type: 'smoothstep' },
      { id: 'e-frontend-qa', source: 'frontend', target: 'qa', type: 'smoothstep' },
      { id: 'e-qa-aggregator', source: 'qa', target: 'aggregator', type: 'smoothstep' },
    ],
  },
  {
    name: 'Refatoração',
    description: 'Workflow de refatoração segura com testes e revisão',
    nodes: [
      {
        id: 'analysis',
        type: 'agent',
        position: { x: 250, y: 0 },
        data: { label: 'Analysis', agent: 'planner' },
      },
      {
        id: 'extraction',
        type: 'agent',
        position: { x: 250, y: 150 },
        data: { label: 'Extraction', agent: 'builder' },
      },
      {
        id: 'testing',
        type: 'agent',
        position: { x: 250, y: 300 },
        data: { label: 'Testing', agent: 'tester' },
      },
      {
        id: 'review',
        type: 'agent',
        position: { x: 250, y: 450 },
        data: { label: 'Review', agent: 'reviewer' },
      },
      {
        id: 'cleanup',
        type: 'agent',
        position: { x: 250, y: 600 },
        data: { label: 'Cleanup', agent: 'builder' },
      },
    ],
    edges: [
      { id: 'e-analysis-extraction', source: 'analysis', target: 'extraction', type: 'smoothstep' },
      { id: 'e-extraction-testing', source: 'extraction', target: 'testing', type: 'smoothstep' },
      { id: 'e-testing-review', source: 'testing', target: 'review', type: 'smoothstep' },
      { id: 'e-review-cleanup', source: 'review', target: 'cleanup', type: 'smoothstep' },
    ],
  },
  {
    name: 'Deploy',
    description: 'Workflow de deploy automatizado com validação e rollback',
    nodes: [
      {
        id: 'predeploy',
        type: 'agent',
        position: { x: 250, y: 0 },
        data: { label: 'Pre-deploy', agent: 'tester' },
      },
      {
        id: 'build',
        type: 'agent',
        position: { x: 250, y: 150 },
        data: { label: 'Build', agent: 'builder' },
      },
      {
        id: 'staging',
        type: 'agent',
        position: { x: 250, y: 300 },
        data: { label: 'Staging', agent: 'reviewer' },
      },
      {
        id: 'production',
        type: 'agent',
        position: { x: 250, y: 450 },
        data: { label: 'Production', agent: 'builder' },
      },
      {
        id: 'monitor',
        type: 'agent',
        position: { x: 250, y: 600 },
        data: { label: 'Monitor', agent: 'tester' },
      },
    ],
    edges: [
      { id: 'e-predeploy-build', source: 'predeploy', target: 'build', type: 'smoothstep' },
      { id: 'e-build-staging', source: 'build', target: 'staging', type: 'smoothstep' },
      { id: 'e-staging-production', source: 'staging', target: 'production', type: 'smoothstep' },
      { id: 'e-production-monitor', source: 'production', target: 'monitor', type: 'smoothstep' },
    ],
  },
];

export function getWorkflowPresetByName(name: string): WorkflowPreset | undefined {
  return workflowPresets.find((p) => p.name === name);
}

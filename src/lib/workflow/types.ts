import type { Node, Edge } from '@xyflow/react';

export type AgentType =
  | 'planner'
  | 'builder'
  | 'reviewer'
  | 'tester'
  | 'debugger'
  | 'aggregator';

export interface AgentNodeData {
  label: string;
  agent: AgentType;
  icon?: string;
  /** Configuration fields for the config panel */
  prompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Execution state for the simulator */
  executionStatus?: 'idle' | 'active' | 'completed';
}

export type WorkflowNode = Node<AgentNodeData>;
export type WorkflowEdge = Edge;

export interface WorkflowPreset {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowExport {
  nodes: { id: string; type: AgentType; label: string }[];
  edges: { source: string; target: string }[];
}

export interface OpenCodeExport {
  agents: { name: string; type: AgentType; role: string }[];
  workflow: { steps: { name: string; agent: AgentType; next?: string[] }[] };
}

export interface AgentsJsonExport {
  agents: {
    id: string;
    name: string;
    type: AgentType;
    connections: string[];
  }[];
}

export const AGENT_COLORS: Record<AgentType, string> = {
  planner: '#7c3aed',
  builder: '#3b82f6',
  reviewer: '#22c55e',
  tester: '#f97316',
  debugger: '#ef4444',
  aggregator: '#6b7280',
};

export const AGENT_LABELS: Record<AgentType, string> = {
  planner: 'Planner',
  builder: 'Builder',
  reviewer: 'Reviewer',
  tester: 'Tester',
  debugger: 'Debugger',
  aggregator: 'Aggregator',
};

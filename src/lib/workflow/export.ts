import type { WorkflowNode, WorkflowEdge, AgentType, WorkflowExport, OpenCodeExport, AgentsJsonExport } from './types';

export function exportAsWorkflowJson(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowExport {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.data.agent as AgentType,
      label: n.data.label,
    })),
    edges: edges.map((e) => ({
      source: e.source,
      target: e.target,
    })),
  };
}

export function exportAsOpenCodeJson(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): OpenCodeExport {
  const steps = nodes.map((n) => {
    const outgoing = edges
      .filter((e) => e.source === n.id)
      .map((e) => {
        const target = nodes.find((nd) => nd.id === e.target);
        return target?.data.label || e.target;
      });
    return {
      name: n.data.label,
      agent: n.data.agent as AgentType,
      ...(outgoing.length > 0 ? { next: outgoing } : {}),
    };
  });

  return {
    agents: nodes.map((n) => ({
      name: n.data.label,
      type: n.data.agent as AgentType,
      role: getAgentRole(n.data.agent as AgentType),
    })),
    workflow: { steps },
  };
}

export function exportAsAgentsJson(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): AgentsJsonExport {
  return {
    agents: nodes.map((n) => ({
      id: n.id,
      name: n.data.label,
      type: n.data.agent as AgentType,
      connections: edges
        .filter((e) => e.source === n.id || e.target === n.id)
        .map((e) => (e.source === n.id ? e.target : e.source)),
    })),
  };
}

function getAgentRole(agent: AgentType): string {
  const roles: Record<AgentType, string> = {
    planner: 'Planejamento e orquestração',
    builder: 'Implementação de código',
    reviewer: 'Revisão e qualidade',
    tester: 'Testes e validação',
    debugger: 'Diagnóstico e correção',
    aggregator: 'Agregação e sumarização',
  };
  return roles[agent] || 'Agente';
}

/**
 * Simple YAML serializer (no external deps)
 */
function toYaml(obj: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'string') {
    // Quote if contains special chars
    if (obj.includes(':') || obj.includes('#') || obj.includes('"') || obj.includes("'") || obj.includes('\n')) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj;
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return '\n' + obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        // For objects in arrays, use "- " prefix
        const firstLine = toYaml(item, indent + 1).trimStart();
        return `${pad}- ${firstLine}`;
      }
      return `${pad}- ${toYaml(item, indent + 1)}`;
    }).join('\n');
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return '\n' + entries.map(([key, val]) => {
      const valStr = toYaml(val, indent + 1).trimStart();
      return `${pad}${key}: ${valStr}`;
    }).join('\n');
  }
  return String(obj);
}

export function exportAsYaml(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string {
  const steps = nodes.map((n) => {
    const outgoing = edges
      .filter((e) => e.source === n.id)
      .map((e) => {
        const target = nodes.find((nd) => nd.id === e.target);
        return target?.data.label || e.target;
      });
    const step: Record<string, unknown> = {
      name: n.data.label,
      agent: n.data.agent,
      prompt: n.data.prompt || undefined,
      model: n.data.model || undefined,
      temperature: n.data.temperature ?? undefined,
      maxTokens: n.data.maxTokens ?? undefined,
    };
    if (outgoing.length > 0) step.next = outgoing;
    // Remove undefined values
    Object.keys(step).forEach(k => step[k] === undefined && delete step[k]);
    return step;
  });

  const doc: Record<string, unknown> = {
    name: 'playground-workflow',
    description: 'Workflow criado no Playground Visual OpenCode',
    agents: nodes.map((n) => ({
      name: n.data.label,
      type: n.data.agent,
      role: getAgentRole(n.data.agent as AgentType),
    })),
    workflow: { steps },
  };

  return toYaml(doc).trimStart();
}

export type ExportFormat = 'workflow' | 'opencode' | 'agents' | 'yaml';

export function exportWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  format: ExportFormat
): string {
  let data: unknown;
  switch (format) {
    case 'workflow':
      data = exportAsWorkflowJson(nodes, edges);
      return JSON.stringify(data, null, 2);
    case 'opencode':
      data = exportAsOpenCodeJson(nodes, edges);
      return JSON.stringify(data, null, 2);
    case 'agents':
      data = exportAsAgentsJson(nodes, edges);
      return JSON.stringify(data, null, 2);
    case 'yaml':
      return exportAsYaml(nodes, edges);
  }
  return '';
}

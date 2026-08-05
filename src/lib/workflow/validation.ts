import type { WorkflowNode, WorkflowEdge } from './types';

export interface ValidationError {
  type: 'cycle' | 'orphan' | 'empty';
  message: string;
  nodeIds?: string[];
}

/**
 * Detect cycles in directed graph using DFS
 */
export function detectCycles(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const adjList = new Map<string, string[]>();

  // Build adjacency list
  for (const node of nodes) {
    adjList.set(node.id, []);
  }
  for (const edge of edges) {
    const list = adjList.get(edge.source);
    if (list) {
      list.push(edge.target);
    }
  }

  function dfs(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) {
      return true; // cycle found
    }
    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) {
        errors.push({
          type: 'cycle',
          message: 'O workflow contém um ciclo. Remova conexões circulares.',
          nodeIds: [...recursionStack],
        });
        break;
      }
    }
  }

  return errors;
}

/**
 * Find orphan nodes (no incoming or outgoing edges)
 */
export function detectOrphanNodes(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationError[] {
  if (nodes.length === 0) return [];
  if (edges.length === 0) {
    return [
      {
        type: 'orphan',
        message: 'Nenhuma conexão entre os agentes.',
        nodeIds: nodes.map((n) => n.id),
      },
    ];
  }

  const hasIncoming = new Set<string>();
  const hasOutgoing = new Set<string>();

  for (const edge of edges) {
    hasOutgoing.add(edge.source);
    hasIncoming.add(edge.target);
  }

  const orphans = nodes.filter((n) => {
    const noIncoming = !hasIncoming.has(n.id);
    const noOutgoing = !hasOutgoing.has(n.id);
    // Only truly orphan if neither incoming nor outgoing
    return noIncoming && noOutgoing;
  });

  if (orphans.length > 0) {
    return [
      {
        type: 'orphan',
        message: `${orphans.length} nó(ns) sem conexão: ${orphans.map((n) => n.data.label).join(', ')}`,
        nodeIds: orphans.map((n) => n.id),
      },
    ];
  }

  return [];
}

/**
 * Check if workflow is empty
 */
export function detectEmpty(
  nodes: WorkflowNode[],
  _edges: WorkflowEdge[]
): ValidationError[] {
  if (nodes.length === 0) {
    return [
      {
        type: 'empty',
        message: 'O canvas está vazio. Arraste agentes para começar.',
      },
    ];
  }
  return [];
}

/**
 * Run all validations
 */
export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationError[] {
  return [
    ...detectEmpty(nodes, edges),
    ...detectCycles(nodes, edges),
    ...detectOrphanNodes(nodes, edges),
  ];
}

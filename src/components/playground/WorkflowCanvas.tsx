import { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  SelectionMode,
  type Connection,
  type Edge,
  type ReactFlowInstance,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AgentNode from './AgentNode';
import AgentPalette from './AgentPalette';
import WorkflowToolbar from './WorkflowToolbar';
import WorkflowMiniMap from './WorkflowMiniMap';
import ExportDialog from './ExportDialog';
import { workflowPresets } from '@/data/workflow-presets';
import type { WorkflowNode, WorkflowEdge, AgentType, WorkflowPreset } from '@/lib/workflow/types';
import type { ValidationError } from '@/lib/workflow/validation';
import { validateWorkflow } from '@/lib/workflow/validation';

const nodeTypes = {
  agent: AgentNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  style: { stroke: '#475569', strokeWidth: 2 },
  markerEnd: { type: 'arrowclosed', color: '#475569', width: 20, height: 20 },
};

let nodeIdCounter = 0;
function getNodeId(): string {
  return `node_${++nodeIdCounter}_${Date.now()}`;
}

export default function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── A. Node configuration panel ─────────────────────────────
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) ?? null : null;

  const updateNode = useCallback(
    (id: string, data: Partial<WorkflowNode['data']>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n))
      );
    },
    [setNodes]
  );

  // ── B. Execution simulation ─────────────────────────────────
  const [isRunning, setIsRunning] = useState(false);
  const [executionOrder, setExecutionOrder] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleRun = useCallback(() => {
    if (nodes.length === 0) return;

    const order = nodes.map((n) => n.id);
    setExecutionOrder(order);
    setIsRunning(true);
    setCurrentStep(-1);

    // Reset all nodes to idle
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, executionStatus: 'idle' as const } })));

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Activate each node in order with 500ms delay
    order.forEach((nodeId, index) => {
      const t = setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === nodeId) {
              return { ...n, data: { ...n.data, executionStatus: 'active' as const } };
            }
            // Mark previous as completed
            if (index > 0 && n.id === order[index - 1]) {
              return { ...n, data: { ...n.data, executionStatus: 'completed' as const } };
            }
            return n;
          })
        );
        setCurrentStep(index);
      }, (index + 1) * 500);
      timeouts.push(t);
    });

    // Mark last as completed and finish
    const finalTimeout = setTimeout(() => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === order[order.length - 1]
            ? { ...n, data: { ...n.data, executionStatus: 'completed' as const } }
            : n
        )
      );
      setIsRunning(false);
      setCurrentStep(-1);
    }, (order.length + 1) * 500);
    timeouts.push(finalTimeout);

    timeoutRef.current = timeouts;
  }, [nodes, setNodes]);

  const handleStop = useCallback(() => {
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    handleStop();
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, executionStatus: undefined } }))
    );
    setCurrentStep(-1);
  }, [handleStop, setNodes]);

  // ── C. Auto-layout ──────────────────────────────────────────
  const handleAutoLayout = useCallback(() => {
    setNodes((nds) =>
      nds.map((n, i) => ({
        ...n,
        position: { x: 250, y: 100 + i * 120 },
      }))
    );
  }, [setNodes]);

  // ── D. Undo/Redo ────────────────────────────────────────────
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  const historyRef = useRef<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }[]>([]);
  const [undoIndex, setUndoIndex] = useState(-1);

  const canUndo = undoIndex > 0;
  const canRedo = undoIndex < historyRef.current.length - 1;

  const pushState = useCallback(() => {
    historyRef.current = historyRef.current.slice(0, undoIndex + 1);
    historyRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodesRef.current)),
      edges: JSON.parse(JSON.stringify(edgesRef.current)),
    });
    setUndoIndex(historyRef.current.length - 1);
  }, [undoIndex]);

  const handleUndo = useCallback(() => {
    if (undoIndex < 1) return;
    const newIdx = undoIndex - 1;
    const state = historyRef.current[newIdx];
    setNodes(state.nodes);
    setEdges(state.edges);
    setUndoIndex(newIdx);
  }, [undoIndex, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (undoIndex >= historyRef.current.length - 1) return;
    const newIdx = undoIndex + 1;
    const state = historyRef.current[newIdx];
    setNodes(state.nodes);
    setEdges(state.edges);
    setUndoIndex(newIdx);
  }, [undoIndex, setNodes, setEdges]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo]);

  // ── Validate whenever nodes/edges change ────────────────────
  useEffect(() => {
    const errs = validateWorkflow(nodes, edges);
    setValidationErrors(errs);
    if (errs.length > 0 && nodes.length > 0) {
      setShowErrors(true);
    } else {
      setShowErrors(false);
    }
  }, [nodes, edges]);

  // Handle delete-node custom event from AgentNode
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.id) {
        const nodeToDelete = nodes.find((n) => n.data.label === detail.id);
        if (nodeToDelete) {
          pushState();
          setNodes((nds) => nds.filter((n) => n.id !== nodeToDelete.id));
          setEdges((eds) =>
            eds.filter((e) => e.source !== nodeToDelete.id && e.target !== nodeToDelete.id)
          );
        }
      }
    };
    document.addEventListener('delete-node', handler);
    return () => document.removeEventListener('delete-node', handler);
  }, [nodes, setNodes, setEdges, pushState]);

  // ── Handlers ────────────────────────────────────────────────
  const onConnect = useCallback(
    (connection: Connection) => {
      pushState();
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges, pushState]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;

      try {
        const agentData = JSON.parse(data) as { type: AgentType; label: string };
        const position = reactFlowRef.current?.screenToFlowPosition({
          x: e.clientX,
          y: e.clientY,
        });

        if (!position) return;

        const newNode: WorkflowNode = {
          id: getNodeId(),
          type: 'agent',
          position,
          data: {
            label: agentData.label,
            agent: agentData.type,
          },
        };

        setNodes((nds) => [...nds, newNode]);
        pushState();
      } catch {
        // Invalid drag data
      }
    },
    [setNodes, pushState]
  );

  const onClear = useCallback(() => {
    if (nodes.length === 0) return;
    pushState();
    setNodes([]);
    setEdges([]);
    setValidationErrors([]);
    setShowErrors(false);
    setSelectedNodeId(null);
  }, [setNodes, setEdges, pushState, nodes]);

  const handleLoadPreset = useCallback(
    (preset: WorkflowPreset) => {
      pushState();
      setNodes(preset.nodes);
      setEdges(preset.edges);
      setSelectedNodeId(null);
    },
    [setNodes, setEdges, pushState]
  );

  const handleZoomIn = useCallback(() => {
    reactFlowRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    reactFlowRef.current?.zoomOut();
  }, []);

  const handleExport = useCallback(() => {
    setExportOpen(true);
  }, []);

  const handlePaletteDragStart = useCallback((_type: AgentType, _label: string) => {
    // Visual feedback could go here
  }, []);

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      pushState();
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges, pushState]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return (
    <div className="flex h-full w-full">
      {/* Left sidebar - Agent Palette */}
      <aside className="w-56 shrink-0 border-r border-border bg-card/50 backdrop-blur-sm">
        <AgentPalette onDragStart={handlePaletteDragStart} />
      </aside>

      {/* Main canvas area */}
      <div className="flex flex-1 flex-col">
        {/* Toolbar */}
        <WorkflowToolbar
          onClear={onClear}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onExport={handleExport}
          onLoadPreset={handleLoadPreset}
          presets={workflowPresets}
          hasNodes={nodes.length > 0}
          onRun={handleRun}
          onStop={handleStop}
          onReset={handleReset}
          onAutoLayout={handleAutoLayout}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          isRunning={isRunning}
        />

        {/* Validation errors banner */}
        {showErrors && validationErrors.length > 0 && (
          <div className="flex items-center gap-2 border-b border-yellow-500/20 bg-yellow-500/10 px-4 py-1.5">
            <span className="text-xs font-medium text-yellow-500">Avisos:</span>
            {validationErrors.map((err, i) => (
              <span key={i} className="text-xs text-yellow-400/80">
                {err.message}
              </span>
            ))}
          </div>
        )}

        {/* React Flow Canvas */}
        <div ref={canvasRef} className="flex-1 bg-[#0f172a]" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onInit={(instance) => {
              reactFlowRef.current = instance;
            }}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            selectionMode={SelectionMode.Partial}
            selectionOnDrag
            panOnDrag={[1, 2]}
            selectNodesOnDrag
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
            multiSelectionKeyCode="Shift"
            className="bg-[#0f172a]"
            minZoom={0.1}
            maxZoom={4}
            snapToGrid
            snapGrid={[20, 20]}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="#1e293b"
            />
            <Controls
              showInteractive={false}
              className="!bottom-4 !left-4 !border !border-border !rounded-lg !bg-card !shadow-xl"
            />
            <WorkflowMiniMap />
          </ReactFlow>
        </div>
      </div>

      {/* Right sidebar - Node configuration */}
      {selectedNode && (
        <aside className="w-72 shrink-0 border-l border-border bg-card/50 p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-4">Configurar Nó</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Nome</label>
              <input
                value={selectedNode.data.label}
                onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Agente</label>
              <select
                value={selectedNode.data.agent}
                onChange={(e) => updateNode(selectedNode.id, { agent: e.target.value as AgentType })}
                className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
              >
                <option value="planner">Planner</option>
                <option value="builder">Builder</option>
                <option value="reviewer">Reviewer</option>
                <option value="tester">Tester</option>
                <option value="debugger">Debugger</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Prompt</label>
              <textarea
                value={selectedNode.data.prompt || ''}
                onChange={(e) => updateNode(selectedNode.id, { prompt: e.target.value })}
                className="w-full rounded border border-input bg-background px-2 py-1 text-sm min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Modelo</label>
              <select
                value={selectedNode.data.model || ''}
                onChange={(e) => updateNode(selectedNode.id, { model: e.target.value })}
                className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
              >
                <option value="">Padrão</option>
                <option value="claude-sonnet">Claude Sonnet</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gemini">Gemini Pro</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Temperatura: {selectedNode.data.temperature ?? 0.3}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedNode.data.temperature ?? 0.3}
                onChange={(e) =>
                  updateNode(selectedNode.id, { temperature: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>
          </div>
        </aside>
      )}

      {/* Export Dialog */}
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        nodes={nodes}
        edges={edges}
      />
    </div>
  );
}

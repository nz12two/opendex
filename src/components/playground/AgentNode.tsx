import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { X, Brain, Code, CheckCircle, Bug, TestTube, LayoutGrid, Loader2, Sparkles } from 'lucide-react';
import type { AgentNodeData, AgentType } from '@/lib/workflow/types';
import { AGENT_COLORS } from '@/lib/workflow/types';
import { cn } from '@/lib/utils';

const agentIcons: Record<AgentType, React.ReactNode> = {
  planner: <Brain className="h-5 w-5" />,
  builder: <Code className="h-5 w-5" />,
  reviewer: <CheckCircle className="h-5 w-5" />,
  tester: <TestTube className="h-5 w-5" />,
  debugger: <Bug className="h-5 w-5" />,
  aggregator: <LayoutGrid className="h-5 w-5" />,
};

function AgentNode({ data, selected }: NodeProps<AgentNodeData>) {
  const color = AGENT_COLORS[data.agent] || '#6b7280';
  const status = data.executionStatus || 'idle';

  const onDelete = useCallback(() => {
    const event = new CustomEvent('delete-node', { detail: { id: data.label } });
    document.dispatchEvent(event);
  }, [data.label]);

  // Execution status styles
  const statusBorder = status === 'active'
    ? 'border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/20'
    : status === 'completed'
    ? 'border-green-500 ring-2 ring-green-500/30'
    : selected
    ? 'border-primary ring-2 ring-primary/30 shadow-primary/20'
    : 'border-border hover:border-muted-foreground/30';

  const statusGlow = status === 'active'
    ? 'animate-glow-pulse'
    : '';

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 bg-card px-4 py-3 shadow-lg transition-all duration-200 min-w-[160px] cursor-pointer',
        statusBorder,
        statusGlow
      )}
      style={{ borderLeftColor: color, borderLeftWidth: 4 }}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          '!h-3 !w-3 !border-2 !border-background transition-all duration-300',
          status === 'active' && '!h-4 !w-4 !shadow-lg !shadow-primary/30'
        )}
        style={{ backgroundColor: color }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          '!h-3 !w-3 !border-2 !border-background transition-all duration-300',
          status === 'active' && '!h-4 !w-4 !shadow-lg !shadow-primary/30'
        )}
        style={{ backgroundColor: color }}
      />

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity hover:opacity-100"
        style={{ opacity: selected || status === 'active' ? 1 : undefined }}
        title="Remover nó"
      >
        <X className="h-3 w-3" />
      </button>

      {/* Status badge */}
      {status === 'active' && (
        <div className="absolute -right-2 -bottom-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Loader2 className="h-3 w-3 animate-spin" />
        </div>
      )}
      {status === 'completed' && (
        <div className="absolute -right-2 -bottom-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30">
          <Sparkles className="h-3 w-3" />
        </div>
      )}

      {/* Content */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300',
            status === 'active' && 'shadow-lg shadow-primary/20'
          )}
          style={{ backgroundColor: `${color}20`, color }}
        >
          {status === 'active' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            agentIcons[data.agent] || <Brain className="h-5 w-5" />
          )}
        </div>
        <div className="flex flex-col">
          <span className={cn(
            'text-sm font-semibold text-foreground',
            status === 'completed' && 'text-green-500'
          )}>
            {data.label}
          </span>
          <span className="text-xs capitalize text-muted-foreground">{data.agent}</span>
        </div>
      </div>

      {/* Bottom color / progress indicator */}
      <div
        className={cn(
          'mt-2 h-1 w-full rounded-full opacity-40 transition-all duration-500',
          status === 'active' && 'opacity-70 h-1.5'
        )}
        style={{ backgroundColor: status === 'completed' ? '#22c55e' : color }}
      />

      {/* Model badge */}
      {data.model && (
        <div className="mt-1.5 flex items-center gap-1">
          <span className="rounded bg-muted/50 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
            {data.model}
          </span>
          {data.temperature !== undefined && (
            <span className="rounded bg-muted/50 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              T={data.temperature}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(AgentNode);

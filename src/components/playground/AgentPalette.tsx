import { useCallback, useRef, useState, useMemo } from 'react';
import { Brain, Code, CheckCircle, Bug, TestTube, LayoutGrid, GripVertical, Search, SearchX } from 'lucide-react';
import type { AgentType } from '@/lib/workflow/types';
import { AGENT_COLORS, AGENT_LABELS } from '@/lib/workflow/types';
import { cn } from '@/lib/utils';

interface PaletteAgent {
  type: AgentType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const paletteAgents: PaletteAgent[] = [
  { type: 'planner', label: AGENT_LABELS.planner, description: 'Planejamento e orquestração', icon: <Brain className="h-5 w-5" /> },
  { type: 'builder', label: AGENT_LABELS.builder, description: 'Implementação de código', icon: <Code className="h-5 w-5" /> },
  { type: 'reviewer', label: AGENT_LABELS.reviewer, description: 'Revisão e qualidade', icon: <CheckCircle className="h-5 w-5" /> },
  { type: 'tester', label: AGENT_LABELS.tester, description: 'Testes e validação', icon: <TestTube className="h-5 w-5" /> },
  { type: 'debugger', label: AGENT_LABELS.debugger, description: 'Diagnóstico e correção', icon: <Bug className="h-5 w-5" /> },
  { type: 'aggregator', label: AGENT_LABELS.aggregator, description: 'Agregação e sumarização', icon: <LayoutGrid className="h-5 w-5" /> },
];

interface AgentPaletteProps {
  onDragStart: (type: AgentType, label: string) => void;
}

export default function AgentPalette({ onDragStart }: AgentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return paletteAgents;
    const q = searchQuery.toLowerCase().trim();
    return paletteAgents.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleDragStart = useCallback(
    (e: React.DragEvent, agent: PaletteAgent) => {
      e.dataTransfer.setData('application/json', JSON.stringify({
        type: agent.type,
        label: agent.label,
      }));
      e.dataTransfer.effectAllowed = 'copy';
      onDragStart(agent.type, agent.label);
    },
    [onDragStart]
  );

  return (
    <div className="flex h-full flex-col gap-1 p-3">
      {/* Header */}
      <div className="mb-2 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Agentes
        </h3>
        <p className="mt-0.5 text-[10px] text-muted-foreground/60">
          Arraste para o canvas
        </p>
      </div>

      {/* Search input */}
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
        <input
          ref={searchRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar agentes..."
          className="w-full rounded-lg border border-border/50 bg-background/50 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <SearchX className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Agent list */}
      <div className="flex flex-col gap-1.5 overflow-y-auto scroll-smooth">
        {filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <SearchX className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground/50">
              Nenhum agente encontrado
            </p>
          </div>
        ) : (
          filteredAgents.map((agent) => (
            <div
              key={agent.type}
              draggable
              onDragStart={(e) => handleDragStart(e, agent)}
              className={cn(
                'group flex cursor-grab items-center gap-2.5 rounded-lg border border-border/50 bg-card/50 px-3 py-2.5 transition-all',
                'hover:border-border hover:bg-card hover:shadow-md active:cursor-grabbing active:scale-[0.98]'
              )}
            >
              <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/60" />
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${AGENT_COLORS[agent.type]}20`, color: AGENT_COLORS[agent.type] }}
              >
                {agent.icon}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-foreground truncate">{agent.label}</span>
                <span className="text-[10px] text-muted-foreground truncate">{agent.description}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

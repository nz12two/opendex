import { useMemo } from 'react';
import type { WorkflowStep } from '@/data/workflows/types';
import { cn } from '@/lib/utils';

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  className?: string;
}

interface Position {
  x: number;
  y: number;
}

// Agent colors for visual distinction
const agentColors: Record<string, { bg: string; border: string; text: string }> = {
  planner: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-500' },
  builder: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500' },
  tester: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500' },
  reviewer: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500' },
};

const defaultColor = { bg: 'bg-muted', border: 'border-border', text: 'text-foreground' };

export default function WorkflowDiagram({ steps, className }: WorkflowDiagramProps) {
  const { svgWidth, svgHeight, stepPositions, paths } = useMemo(() => {
    const padding = 40;
    const nodeW = 160;
    const nodeH = 56;
    const gapX = 80;
    const gapY = 40;

    // Calculate positions using a simple layered layout
    const layers: { name: string; agent: string; next?: string[] }[][] = [];
    const visited = new Set<string>();

    function assignLayer(stepName: string, depth: number) {
      if (visited.has(stepName)) return;
      visited.add(stepName);
      if (!layers[depth]) layers[depth] = [];
      const step = steps.find((s) => s.name === stepName);
      if (!step) return;
      layers[depth].push(step);
      if (step.next) {
        step.next.forEach((next) => assignLayer(next, depth + 1));
      }
    }

    if (steps.length > 0) {
      assignLayer(steps[0].name, 0);
    }

    // Ensure all steps are included even if not in the tree from root
    steps.forEach((s) => {
      if (!visited.has(s.name)) {
        const depth = layers.length;
        if (!layers[depth]) layers[depth] = [];
        layers[depth].push(s);
        visited.add(s.name);
      }
    });

    const maxInLayer = Math.max(...layers.map((l) => l.length), 1);
    const totalW = layers.length * (nodeW + gapX) - gapX + padding * 2;
    const totalH = maxInLayer * (nodeH + gapY) - gapY + padding * 2;

    const positions = new Map<string, Position>();
    const allPaths: { from: Position; to: Position; fromIdx: number; toIdx: number }[] = [];

    layers.forEach((layer, layerIdx) => {
      const layerCount = layer.length;
      const layerHeight = layerCount * (nodeH + gapY) - gapY;
      const startY = (totalH - layerHeight) / 2;

      layer.forEach((step, stepIdx) => {
        const x = padding + layerIdx * (nodeW + gapX);
        const y = startY + stepIdx * (nodeH + gapY);
        positions.set(step.name, { x, y });

        // Create paths to next steps
        if (step.next) {
          step.next.forEach((nextName) => {
            const nextPos = positions.get(nextName);
            if (nextPos) {
              allPaths.push({
                from: { x: x + nodeW, y: y + nodeH / 2 },
                to: { x: nextPos.x, y: nextPos.y + nodeH / 2 },
                fromIdx: layerIdx,
                toIdx: layers.findIndex((l) => l.some((s) => s.name === nextName)),
              });
            }
          });
        }
      });
    });

    return {
      svgWidth: totalW,
      svgHeight: totalH,
      stepPositions: positions,
      paths: allPaths,
    };
  }, [steps]);

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border bg-card p-4', className)}>
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="min-w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Arrow markers definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              className="fill-muted-foreground/40"
            />
          </marker>
        </defs>

        {/* Paths (connections) */}
        {paths.map((path, i) => {
          const midX = (path.from.x + path.to.x) / 2;
          const midY = (path.from.y + path.to.y) / 2;
          const isAdjacent = Math.abs(path.toIdx - path.fromIdx) === 1;

          let pathD: string;
          if (isAdjacent) {
            // Simple bezier
            pathD = `M ${path.from.x} ${path.from.y} C ${midX} ${path.from.y}, ${midX} ${path.to.y}, ${path.to.x} ${path.to.y}`;
          } else {
            // S-curve for skipping layers
            const cp1x = path.from.x + 30;
            const cp2x = path.to.x - 30;
            pathD = `M ${path.from.x} ${path.from.y} C ${cp1x} ${path.from.y}, ${cp2x} ${path.to.y}, ${path.to.x} ${path.to.y}`;
          }

          return (
            <path
              key={`path-${i}`}
              d={pathD}
              fill="none"
              className="stroke-muted-foreground/40"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* Nodes */}
        {steps.map((step) => {
          const pos = stepPositions.get(step.name);
          if (!pos) return null;
          const colors = agentColors[step.agent] || defaultColor;

          return (
            <g key={step.name}>
              {/* Node background */}
              <rect
                x={pos.x}
                y={pos.y}
                width={160}
                height={56}
                rx={8}
                className="fill-background stroke-border"
                strokeWidth={1}
              />
              {/* Border accent */}
              <rect
                x={pos.x}
                y={pos.y}
                width={160}
                height={3}
                rx={1.5}
                className={colors.border.replace('border-', 'fill-').replace('/30', '/40')}
              />
              {/* Step name */}
              <text
                x={pos.x + 80}
                y={pos.y + 24}
                textAnchor="middle"
                className="fill-foreground text-xs font-medium"
              >
                {step.name}
              </text>
              {/* Agent label */}
              <text
                x={pos.x + 80}
                y={pos.y + 42}
                textAnchor="middle"
                className={cn('fill-current text-[10px]', colors.text.replace('text-', 'fill-'))}
              >
                {step.agent}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

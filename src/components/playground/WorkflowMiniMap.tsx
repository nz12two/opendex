import { MiniMap } from '@xyflow/react';

const nodeColors = [
  '#7c3aed', // planner
  '#3b82f6', // builder
  '#22c55e', // reviewer
  '#f97316', // tester
  '#ef4444', // debugger
  '#6b7280', // aggregator
];

export default function WorkflowMiniMap() {
  return (
    <div className="absolute bottom-4 right-4 z-10 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
      <MiniMap
        nodeStrokeColor="var(--border)"
        nodeColor={(node) => {
          const agentType = node.data?.agent as string;
          const colorMap: Record<string, string> = {
            planner: nodeColors[0],
            builder: nodeColors[1],
            reviewer: nodeColors[2],
            tester: nodeColors[3],
            debugger: nodeColors[4],
            aggregator: nodeColors[5],
          };
          return colorMap[agentType] || '#6b7280';
        }}
        nodeBorderRadius={8}
        maskColor="rgba(0,0,0,0.6)"
        style={{ backgroundColor: 'var(--background)' }}
        className="!h-[120px] !w-[180px]"
      />
    </div>
  );
}

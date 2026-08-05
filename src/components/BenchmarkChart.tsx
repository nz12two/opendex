import type { BenchmarkModel } from '@/data/comparisons/types';

interface BenchmarkChartProps {
  models: BenchmarkModel[];
}

const BAR_COLORS = {
  speed: 'fill-blue-500',
  quality: 'fill-emerald-500',
};

const BAR_HEIGHT = 200;

export default function BenchmarkChart({ models }: BenchmarkChartProps) {
  const maxValue = 5;
  const barWidth = Math.max(40, Math.min(80, 600 / models.length - 16));

  return (
    <div class="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${Math.max(400, models.length * 100)} 320`}
        class="w-full max-w-2xl mx-auto"
        role="img"
        aria-label="Gráfico comparativo de modelos"
      >
        {/* Y-axis labels */}
        {[5, 4, 3, 2, 1].map((val) => {
          const y = BAR_HEIGHT - (val / maxValue) * BAR_HEIGHT + 20;
          return (
            <g key={val}>
              <text x="0" y={y + 4} class="fill-muted-foreground text-[10px]" text-anchor="start">
                {val}
              </text>
              <line
                x1="25"
                y1={y}
                x2={Math.max(380, models.length * 100 - 20)}
                y2={y}
                class="stroke-border/50"
                stroke-width="0.5"
              />
            </g>
          );
        })}

        {/* Bars */}
        {models.map((model, i) => {
          const x = 40 + i * (Math.max(400, models.length * 100) / models.length);
          const speedH = (model.speed / maxValue) * BAR_HEIGHT;
          const qualityH = (model.quality / maxValue) * BAR_HEIGHT;
          const groupWidth = (Math.max(400, models.length * 100) - 40) / models.length;

          return (
            <g key={model.name}>
              {/* Speed bar */}
              <rect
                x={x + groupWidth * 0.1}
                y={BAR_HEIGHT - speedH + 20}
                width={barWidth * 0.4}
                height={speedH}
                rx="4"
                class={BAR_COLORS.speed + ' opacity-80 hover:opacity-100 transition-opacity'}
              >
                <title>{model.name} Velocidade: {model.speed}/5</title>
              </rect>
              {/* Quality bar */}
              <rect
                x={x + groupWidth * 0.1 + barWidth * 0.5}
                y={BAR_HEIGHT - qualityH + 20}
                width={barWidth * 0.4}
                height={qualityH}
                rx="4"
                class={BAR_COLORS.quality + ' opacity-80 hover:opacity-100 transition-opacity'}
              >
                <title>{model.name} Qualidade: {model.quality}/5</title>
              </rect>
              {/* Label */}
              <text
                x={x + groupWidth * 0.1 + barWidth * 0.45}
                y={BAR_HEIGHT + 40}
                text-anchor="middle"
                class="fill-foreground text-[10px] font-medium"
              >
                {model.name.split(' ')[0]}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(0, ${BAR_HEIGHT + 60})`}>
          <rect x="0" y="0" width="12" height="12" rx="2" class={BAR_COLORS.speed + ' opacity-80'} />
          <text x="18" y="10" class="fill-muted-foreground text-[11px]">Velocidade</text>
          <rect x="100" y="0" width="12" height="12" rx="2" class={BAR_COLORS.quality + ' opacity-80'} />
          <text x="118" y="10" class="fill-muted-foreground text-[11px]">Qualidade</text>
        </g>
      </svg>
    </div>
  );
}

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  ZoomIn,
  ZoomOut,
  Download,
  Trash2,
  Play,
  Square,
  RefreshCw,
  LayoutGrid,
  Undo2,
  Redo2,
} from 'lucide-react';
import type { WorkflowPreset } from '@/lib/workflow/types';
import { cn } from '@/lib/utils';

interface WorkflowToolbarProps {
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExport: () => void;
  onLoadPreset: (preset: WorkflowPreset) => void;
  presets: WorkflowPreset[];
  hasNodes: boolean;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onAutoLayout: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isRunning: boolean;
}

export default function WorkflowToolbar({
  onClear,
  onZoomIn,
  onZoomOut,
  onExport,
  onLoadPreset,
  presets,
  hasNodes,
  onRun,
  onStop,
  onReset,
  onAutoLayout,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isRunning,
}: WorkflowToolbarProps) {
  const handlePresetChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const preset = presets.find((p) => p.name === e.target.value);
      if (preset) onLoadPreset(preset);
    },
    [presets, onLoadPreset]
  );

  return (
    <div className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-2 backdrop-blur-sm">
      {/* Left: Presets */}
      <div className="flex items-center gap-2">
        <select
          onChange={handlePresetChange}
          defaultValue=""
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="" disabled>
            Carregar preset...
          </option>
          {presets.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="mx-2 h-6 w-px bg-border" />
      </div>

      {/* Center: Zoom controls + Auto Layout + Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onZoomOut} title="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onZoomIn} title="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          onClick={onAutoLayout}
          disabled={!hasNodes}
          title="Auto Layout"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          title="Desfazer (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          title="Refazer (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Right: Run/Stop/Reset + Export + Clear */}
      <div className="flex items-center gap-1">
        {isRunning ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={onStop}
              title="Parar execução"
            >
              <Square className="mr-1.5 h-4 w-4" />
              Stop
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              title="Resetar"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            size="sm"
            onClick={onRun}
            disabled={!hasNodes}
            title="Executar workflow"
          >
            <Play className="mr-1.5 h-4 w-4" />
            Executar
          </Button>
        )}

        <div className="mx-1 h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          disabled={!hasNodes}
          title="Exportar workflow"
        >
          <Download className="mr-1.5 h-4 w-4" />
          Exportar
        </Button>

        <div className="mx-1 h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          disabled={!hasNodes}
          title="Limpar canvas"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

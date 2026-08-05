import { useState, useCallback, useMemo } from 'react';
import { agentTypes } from '@/data/tools';
import type { WorkflowAgent, WorkflowConfig } from '@/data/tools/types';
import { Copy, Check, Download, Plus, X, ArrowDown, GripVertical } from 'lucide-react';

export default function WorkflowBuilder() {
  const [config, setConfig] = useState<WorkflowConfig>({
    name: '',
    description: '',
    steps: [],
    parallel: false,
  });
  const [newStep, setNewStep] = useState<WorkflowAgent>({
    id: '',
    name: '',
    agentType: 'builder',
    prompt: '',
  });
  const [copied, setCopied] = useState(false);

  const updateConfig = useCallback(<K extends keyof WorkflowConfig>(key: K, value: WorkflowConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const addStep = useCallback(() => {
    if (!newStep.name.trim()) return;
    const step: WorkflowAgent = {
      ...newStep,
      id: `step-${Date.now()}`,
      name: newStep.name.trim(),
    };
    setConfig(prev => ({ ...prev, steps: [...prev.steps, step] }));
    setNewStep({ id: '', name: '', agentType: 'builder', prompt: '' });
  }, [newStep]);

  const removeStep = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== id),
    }));
  }, []);

  const moveStep = useCallback((index: number, direction: 'up' | 'down') => {
    setConfig(prev => {
      const steps = [...prev.steps];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= steps.length) return prev;
      [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
      return { ...prev, steps };
    });
  }, []);

  const generateYaml = useCallback((): string => {
    if (config.steps.length === 0) return '# Adicione ao menos um passo ao workflow';

    let yaml = `# Workflow: ${config.name || 'meu-workflow'}
# Gerado pelo OpenDex
name: ${config.name || 'meu-workflow'}
description: ${config.description || 'Workflow automatizado'}
parallel: ${config.parallel}
steps:\n`;

    config.steps.forEach((step, i) => {
      yaml += `  - name: ${step.name}\n`;
      yaml += `    agent: ${step.agentType}\n`;
      if (step.prompt) {
        yaml += `    prompt: |\n`;
        yaml += `      ${step.prompt.replace(/\n/g, '\n      ')}\n`;
      }
      if (i < config.steps.length - 1) {
        yaml += `    next:\n`;
        yaml += `      - ${config.steps[i + 1].name}\n`;
      }
    });

    return yaml;
  }, [config]);

  const preview = generateYaml();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [preview]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([preview], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name || 'workflow'}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  }, [preview, config.name]);

  const agentTypeOptions = agentTypes.map(at => ({
    value: at.value,
    label: at.label,
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left: Builder */}
      <div className="space-y-6">
        {/* Workflow Info */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold">Configuração do Workflow</h3>

          <div>
            <label className="block text-sm font-medium mb-1.5">Nome do Workflow</label>
            <input
              type="text"
              value={config.name}
              onChange={e => updateConfig('name', e.target.value)}
              placeholder="meu-workflow"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Descrição</label>
            <input
              type="text"
              value={config.description}
              onChange={e => updateConfig('description', e.target.value)}
              placeholder="Descrição do workflow"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Execução paralela</label>
            <button
              type="button"
              role="switch"
              aria-checked={config.parallel}
              onClick={() => updateConfig('parallel', !config.parallel)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                config.parallel ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.parallel ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold">
            Passos ({config.steps.length})
          </h3>

          {/* Add step form */}
          <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nome do passo</label>
                <input
                  type="text"
                  value={newStep.name}
                  onChange={e => setNewStep(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Analisar código"
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  onKeyDown={e => e.key === 'Enter' && addStep()}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Agente</label>
                <select
                  value={newStep.agentType}
                  onChange={e => setNewStep(prev => ({ ...prev, agentType: e.target.value }))}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {agentTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Prompt (opcional)</label>
              <textarea
                value={newStep.prompt}
                onChange={e => setNewStep(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Instruções para o agente..."
                rows={2}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none"
              />
            </div>
            <button
              type="button"
              onClick={addStep}
              disabled={!newStep.name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Adicionar Passo
            </button>
          </div>

          {/* Steps list */}
          {config.steps.length > 0 && (
            <div className="space-y-2">
              {config.steps.map((step, i) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-3"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-medium">{step.name}</span>
                      <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {step.agentType}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => moveStep(i, 'up')}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowDown className="h-3.5 w-3.5 rotate-180" />
                      </button>
                    )}
                    {i < config.steps.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveStep(i, 'down')}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Flow visualization */}
          {config.steps.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              {config.steps.map((step, i) => (
                <>
                  <span className="rounded-md border border-border bg-muted/50 px-2 py-1 text-[10px] font-medium">
                    {step.name}
                  </span>
                  {i < config.steps.length - 1 && (
                    <ArrowDown className="h-3 w-3 text-muted-foreground/40 rotate-[-90deg]" />
                  )}
                </>
              ))}
              {config.parallel && (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] text-primary ml-2">
                  Paralelo
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Workflow YAML</h3>
        <div className="relative rounded-xl border border-border/50 bg-muted/30 p-4 min-h-[200px]">
          <pre className="overflow-x-auto text-sm font-mono leading-relaxed text-foreground/90 whitespace-pre">
            {preview}
          </pre>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={config.steps.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={config.steps.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

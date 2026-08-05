import { useState, useCallback } from 'react';
import { agentTypes, defaultTools } from '@/data/tools';
import type { AgentConfig } from '@/data/tools/types';
import { Copy, Check, Download } from 'lucide-react';

export default function GeradorAgentes() {
  const [config, setConfig] = useState<AgentConfig>({
    name: '',
    description: '',
    type: 'builder',
    tools: ['read', 'edit', 'write'],
    budget: 3,
  });
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'yaml' | 'json'>('yaml');

  const updateField = useCallback(<K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleTool = useCallback((tool: string) => {
    setConfig(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool],
    }));
  }, []);

  const generateYaml = useCallback((): string => {
    return `# Agente: ${config.name || 'meu-agente'}
# Gerado pelo OpenDex
name: ${config.name || 'meu-agente'}
description: ${config.description || 'Descrição do agente'}
type: ${config.type}
tools:
${config.tools.map(t => `  - ${t}`).join('\n')}
task_budget: ${config.budget}
${config.type === 'builder' || config.type === 'debugger' ? `model: claude-sonnet-4` : ''}`;
  }, [config]);

  const generateJson = useCallback((): string => {
    const obj: Record<string, any> = {
      name: config.name || 'meu-agente',
      description: config.description || 'Descrição do agente',
      type: config.type,
      tools: config.tools,
      task_budget: config.budget,
    };
    if (config.type === 'builder' || config.type === 'debugger') {
      obj.model = 'claude-sonnet-4';
    }
    return JSON.stringify(obj, null, 2);
  }, [config]);

  const preview = format === 'yaml' ? generateYaml() : generateJson();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [preview]);

  const handleDownload = useCallback(() => {
    const ext = format === 'yaml' ? 'yaml' : 'json';
    const blob = new Blob([preview], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name || 'agente'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [preview, config.name, format]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Form */}
      <div className="space-y-6 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Configuração do Agente</h3>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Nome do Agente</label>
          <input
            type="text"
            value={config.name}
            onChange={e => updateField('name', e.target.value)}
            placeholder="meu-agente"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Descrição</label>
          <textarea
            value={config.description}
            onChange={e => updateField('description', e.target.value)}
            placeholder="Descreva o propósito do agente..."
            rows={3}
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Tipo de Agente</label>
          <div className="grid grid-cols-2 gap-2">
            {agentTypes.map(at => (
              <button
                key={at.value}
                type="button"
                onClick={() => updateField('type', at.value as AgentConfig['type'])}
                className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                  config.type === at.value
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-border bg-background hover:border-primary/30'
                }`}
              >
                <div className="font-medium">{at.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{at.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Ferramentas ({config.tools.length} selecionadas)</label>
          <div className="flex flex-wrap gap-1.5">
            {defaultTools.map(tool => (
              <button
                key={tool}
                type="button"
                onClick={() => toggleTool(tool)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                  config.tools.includes(tool)
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                }`}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Task Budget: <span className="text-primary font-bold">{config.budget}</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={config.budget}
            onChange={e => updateField('budget', parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1 - Mínimo</span>
            <span>10 - Máximo</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Preview</h3>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setFormat('yaml')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  format === 'yaml' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                YAML
              </button>
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  format === 'json' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                JSON
              </button>
            </div>
          </div>
        </div>

        <div className="relative rounded-xl border border-border/50 bg-muted/30 p-4">
          <pre className="overflow-x-auto text-sm font-mono leading-relaxed text-foreground/90 whitespace-pre">
            {preview}
          </pre>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

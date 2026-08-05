import { useState, useCallback } from 'react';
import { availablePlugins, availableMcps, availableSkills } from '@/data/tools';
import type { OpencodeConfig } from '@/data/tools/types';
import { Copy, Check, Download, Plus, X } from 'lucide-react';

interface SimpleAgent {
  name: string;
  type: string;
}

export default function GeradorOpencode() {
  const [config, setConfig] = useState<OpencodeConfig>({
    projectName: '',
    agents: [],
    plugins: [],
    mcps: [],
    skills: [],
  });
  const [newAgent, setNewAgent] = useState<SimpleAgent>({ name: '', type: 'builder' });
  const [copied, setCopied] = useState(false);

  const updateProjectName = useCallback((name: string) => {
    setConfig(prev => ({ ...prev, projectName: name }));
  }, []);

  const togglePlugin = useCallback((plugin: string) => {
    setConfig(prev => ({
      ...prev,
      plugins: prev.plugins.includes(plugin)
        ? prev.plugins.filter(p => p !== plugin)
        : [...prev.plugins, plugin],
    }));
  }, []);

  const toggleMcp = useCallback((mcp: string) => {
    setConfig(prev => ({
      ...prev,
      mcps: prev.mcps.includes(mcp)
        ? prev.mcps.filter(m => m !== mcp)
        : [...prev.mcps, mcp],
    }));
  }, []);

  const toggleSkill = useCallback((skill: string) => {
    setConfig(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  }, []);

  const addAgent = useCallback(() => {
    if (!newAgent.name.trim()) return;
    setConfig(prev => ({
      ...prev,
      agents: [...prev.agents, { name: newAgent.name.trim(), type: newAgent.type }],
    }));
    setNewAgent({ name: '', type: 'builder' });
  }, [newAgent]);

  const removeAgent = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      agents: prev.agents.filter((_, i) => i !== index),
    }));
  }, []);

  const generateConfig = useCallback((): string => {
    const obj: Record<string, any> = {
      name: config.projectName || 'meu-projeto',
    };

    if (config.agents.length > 0) {
      obj.agents = config.agents.reduce((acc: Record<string, any>, agent) => {
        acc[agent.name] = { type: agent.type };
        return acc;
      }, {});
    }

    if (config.plugins.length > 0) {
      obj.plugins = config.plugins.reduce((acc: Record<string, any>, p) => {
        acc[p] = { enabled: true };
        return acc;
      }, {});
    }

    if (config.mcps.length > 0) {
      obj.mcps = config.mcps;
    }

    if (config.skills.length > 0) {
      obj.skills = config.skills;
    }

    return JSON.stringify(obj, null, 2);
  }, [config]);

  const preview = generateConfig();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [preview]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([preview], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'opencode.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [preview]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Form */}
      <div className="space-y-6 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Configuração do Projeto</h3>

        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Nome do Projeto</label>
          <input
            type="text"
            value={config.projectName}
            onChange={e => updateProjectName(e.target.value)}
            placeholder="meu-projeto"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
        </div>

        {/* Agents */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Agentes</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newAgent.name}
              onChange={e => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do agente..."
              className="flex h-9 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onKeyDown={e => e.key === 'Enter' && addAgent()}
            />
            <select
              value={newAgent.type}
              onChange={e => setNewAgent(prev => ({ ...prev, type: e.target.value }))}
              className="flex h-9 rounded-lg border border-input bg-background px-2 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="builder">Builder</option>
              <option value="reviewer">Reviewer</option>
              <option value="tester">Tester</option>
              <option value="debugger">Debugger</option>
              <option value="planner">Planner</option>
            </select>
            <button
              type="button"
              onClick={addAgent}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {config.agents.length > 0 && (
            <div className="space-y-1.5">
              {config.agents.map((agent, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{agent.name}</span>
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{agent.type}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAgent(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plugins */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Plugins ({config.plugins.length} selecionados)</label>
          <div className="flex flex-wrap gap-1.5">
            {availablePlugins.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => togglePlugin(p.value)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                  config.plugins.includes(p.value)
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* MCPs */}
        <div>
          <label className="block text-sm font-medium mb-1.5">MCPs ({config.mcps.length} selecionados)</label>
          <div className="flex flex-wrap gap-1.5">
            {availableMcps.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => toggleMcp(m.value)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                  config.mcps.includes(m.value)
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Skills ({config.skills.length} selecionados)</label>
          <div className="flex flex-wrap gap-1.5">
            {availableSkills.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleSkill(s.value)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                  config.skills.includes(s.value)
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preview — opencode.json</h3>
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

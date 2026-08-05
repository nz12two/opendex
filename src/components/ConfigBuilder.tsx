import { useState, useCallback } from 'react';

interface AgentConfig {
  name: string;
  type: string;
  model: string;
  budget: number;
  tools: string[];
}

interface FormData {
  projectName: string;
  agents: AgentConfig[];
  plugins: string[];
  mcps: string[];
  skills: string[];
}

const AGENT_TYPES = [
  { value: 'builder', label: 'Builder' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'tester', label: 'Tester' },
  { value: 'debugger', label: 'Debugger' },
  { value: 'planner', label: 'Planner' },
  { value: 'researcher', label: 'Researcher' },
];

const MODELS = [
  { value: 'claude-sonnet-4', label: 'Claude Sonnet 4' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'deepseek-v4', label: 'DeepSeek V4' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];

const ALL_TOOLS = [
  'read', 'edit', 'write', 'grep', 'glob', 'bash', 'task',
  'filesystem', 'search', 'webfetch', 'websearch',
];

const ALL_PLUGINS = [
  { value: '@tarquinen/opencode-dcp', label: 'DCP - Context Pruning' },
  { value: 'opencode-vibeguard', label: 'VibeGuard - Secrets' },
  { value: 'opencode-browser', label: 'Browser MCP' },
  { value: 'opencode-mem', label: 'Memória persistente' },
  { value: 'opencode-plugin-gitea', label: 'Integração Gitea' },
];

const ALL_MCPS = [
  { value: 'playwright', label: 'Playwright' },
  { value: 'github', label: 'GitHub' },
  { value: 'postgres', label: 'PostgreSQL' },
  { value: 'redis', label: 'Redis' },
  { value: 'sentry', label: 'Sentry' },
];

const ALL_SKILLS = [
  { value: 'code-review', label: 'Code Review' },
  { value: 'test-patterns', label: 'Test Patterns' },
  { value: 'api-design', label: 'API Design' },
  { value: 'cartography', label: 'Cartography' },
  { value: 'debugging-workflow', label: 'Debugging Workflow' },
];

export default function ConfigBuilder() {
  const [form, setForm] = useState<FormData>({
    projectName: '',
    agents: [{ name: '', type: 'builder', model: 'claude-sonnet-4', budget: 8, tools: ['read', 'edit', 'write', 'grep', 'glob'] }],
    plugins: [],
    mcps: [],
    skills: [],
  });

  const [output, setOutput] = useState<string>('');

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const addAgent = useCallback(() => {
    setForm(prev => ({
      ...prev,
      agents: [...prev.agents, { name: '', type: 'builder', model: 'claude-sonnet-4', budget: 8, tools: ['read', 'edit'] }],
    }));
  }, []);

  const removeAgent = useCallback((index: number) => {
    setForm(prev => ({
      ...prev,
      agents: prev.agents.filter((_, i) => i !== index),
    }));
  }, []);

  const updateAgent = useCallback((index: number, field: string, value: unknown) => {
    setForm(prev => {
      const agents = [...prev.agents];
      agents[index] = { ...agents[index], [field]: value };
      return { ...prev, agents };
    });
  }, []);

  const toggleArrayItem = useCallback(<T,>(key: 'plugins' | 'mcps' | 'skills', item: T) => {
    setForm(prev => {
      const arr = prev[key] as T[];
      const exists = arr.includes(item);
      return {
        ...prev,
        [key]: exists ? arr.filter(i => i !== item) : [...arr, item],
      };
    });
  }, []);

  const generateConfig = useCallback(() => {
    const config: Record<string, unknown> = {
      projectName: form.projectName || 'meu-projeto',
      agents: form.agents.map(a => ({
        name: a.name || `${a.type}-agent`,
        type: a.type,
        model: a.model,
        budget: a.budget,
        tools: a.tools,
      })),
    };

    if (form.plugins.length > 0) config.plugins = form.plugins;
    if (form.mcps.length > 0) config.mcps = form.mcps;
    if (form.skills.length > 0) config.skills = form.skills;

    setOutput(JSON.stringify(config, null, 2));
  }, [form]);

  return (
    <div className="space-y-6">
      {/* Project Name */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <label className="block text-sm font-medium mb-2">Nome do Projeto</label>
        <input
          type="text"
          value={form.projectName}
          onChange={e => updateField('projectName', e.target.value)}
          placeholder="meu-projeto"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        />
      </div>

      {/* Agents */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium">Agentes</h4>
          <button
            type="button"
            onClick={addAgent}
            className="inline-flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Adicionar
          </button>
        </div>

        <div className="space-y-4">
          {form.agents.map((agent, i) => (
            <div key={i} className="rounded-lg border border-border/30 bg-muted/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">Agente {i + 1}</span>
                {form.agents.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAgent(i)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remover
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Nome</label>
                  <input
                    type="text"
                    value={agent.name}
                    onChange={e => updateAgent(i, 'name', e.target.value)}
                    placeholder={`agente-${i + 1}`}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Tipo</label>
                  <select
                    value={agent.type}
                    onChange={e => updateAgent(i, 'type', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {AGENT_TYPES.map(at => (
                      <option key={at.value} value={at.value}>{at.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Modelo</label>
                  <select
                    value={agent.model}
                    onChange={e => updateAgent(i, 'model', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {MODELS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Budget (tasks)</label>
                  <input
                    type="number"
                    value={agent.budget}
                    onChange={e => updateAgent(i, 'budget', parseInt(e.target.value) || 1)}
                    min={1}
                    max={20}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-muted-foreground mb-1">Tools</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TOOLS.map(tool => (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => {
                        const tools = agent.tools.includes(tool)
                          ? agent.tools.filter(t => t !== tool)
                          : [...agent.tools, tool];
                        updateAgent(i, 'tools', tools);
                      }}
                      className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                        agent.tools.includes(tool)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plugins, MCPs, Skills checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h4 className="text-sm font-medium mb-3">Plugins</h4>
          <div className="space-y-2">
            {ALL_PLUGINS.map(p => (
              <label key={p.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.plugins.includes(p.value)}
                  onChange={() => toggleArrayItem('plugins', p.value)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground">{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h4 className="text-sm font-medium mb-3">MCPs</h4>
          <div className="space-y-2">
            {ALL_MCPS.map(m => (
              <label key={m.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.mcps.includes(m.value)}
                  onChange={() => toggleArrayItem('mcps', m.value)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h4 className="text-sm font-medium mb-3">Skills</h4>
          <div className="space-y-2">
            {ALL_SKILLS.map(s => (
              <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.skills.includes(s.value)}
                  onChange={() => toggleArrayItem('skills', s.value)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Generate */}
      <div className="text-center">
        <button
          type="button"
          onClick={generateConfig}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          Gerar Configuração
        </button>
      </div>

      {/* Output */}
      {output && (
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Configuração Gerada</h4>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(output)}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium hover:bg-muted/80 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copiar
            </button>
          </div>
          <div className="rounded-lg bg-muted p-4 overflow-auto max-h-96">
            <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

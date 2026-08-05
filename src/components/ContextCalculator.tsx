import { useState, useMemo } from 'react';

interface ModelContextLimit {
  id: string;
  name: string;
  maxTokens: number;
}

const MODELS: ModelContextLimit[] = [
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', maxTokens: 200000 },
  { id: 'claude-haiku-3.5', name: 'Claude Haiku 3.5', maxTokens: 200000 },
  { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 128000 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 128000 },
  { id: 'deepseek-v4', name: 'DeepSeek V4', maxTokens: 128000 },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', maxTokens: 1000000 },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', maxTokens: 1000000 },
];

const CHARS_PER_TOKEN = 4;

const FILE_TYPE_WEIGHTS: Record<string, number> = {
  ts: 1.0, tsx: 1.1, js: 1.0, jsx: 1.0, json: 0.8,
  yaml: 0.9, yml: 0.9, md: 0.7, css: 0.6, scss: 0.6,
  html: 0.7, py: 1.0, rs: 1.0, go: 1.0, java: 1.0,
  rb: 0.9, php: 0.9, vue: 1.0, svelte: 1.0,
};

export default function ContextCalculator() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [filesCount, setFilesCount] = useState(50);
  const [avgFileSize, setAvgFileSize] = useState(500);
  const [promptTokens, setPromptTokens] = useState(2000);
  const [systemPromptTokens, setSystemPromptTokens] = useState(500);
  const [overhead, setOverhead] = useState(10);

  const model = MODELS.find(m => m.id === selectedModel)!;

  const calculation = useMemo(() => {
    const avgTokensPerFile = Math.round((avgFileSize / CHARS_PER_TOKEN) * 1.0);
    const filesTokens = filesCount * avgTokensPerFile;
    const overheadTokens = Math.round(filesTokens * (overhead / 100));
    const totalNeeded = filesTokens + overheadTokens + promptTokens + systemPromptTokens;
    const available = model.maxTokens;
    const utilization = (totalNeeded / available) * 100;
    const fits = totalNeeded <= available;
    const remaining = Math.max(0, available - totalNeeded);

    return {
      avgTokensPerFile,
      filesTokens,
      overheadTokens,
      totalNeeded,
      available,
      utilization,
      fits,
      remaining,
    };
  }, [filesCount, avgFileSize, promptTokens, systemPromptTokens, overhead, model]);

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <label className="block text-sm font-medium mb-2">Modelo</label>
        <select
          value={selectedModel}
          onChange={e => setSelectedModel(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {MODELS.map(m => (
            <option key={m.id} value={m.id}>{m.name} — {m.maxTokens.toLocaleString()} tokens</option>
          ))}
        </select>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <label className="block text-sm font-medium mb-2">Quantidade de Arquivos</label>
          <input
            type="number"
            value={filesCount}
            onChange={e => setFilesCount(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">Número de arquivos no contexto</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <label className="block text-sm font-medium mb-2">Tamanho Médio por Arquivo</label>
          <input
            type="number"
            value={avgFileSize}
            onChange={e => setAvgFileSize(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">Linhas de código por arquivo</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <label className="block text-sm font-medium mb-2">Prompt do Usuário</label>
          <input
            type="number"
            value={promptTokens}
            onChange={e => setPromptTokens(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">Tokens do prompt do usuário</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <label className="block text-sm font-medium mb-2">System Prompt</label>
          <input
            type="number"
            value={systemPromptTokens}
            onChange={e => setSystemPromptTokens(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">Tokens do system prompt</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <label className="block text-sm font-medium mb-2">Overhead (%)</label>
          <input
            type="number"
            value={overhead}
            onChange={e => setOverhead(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
            min={0}
            max={100}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">Margem de segurança (%)</p>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <h4 className="text-sm font-medium mb-4">Resultado do Cálculo</h4>

        {/* Context gauge */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Utilização do Contexto</span>
            <span className={`font-bold ${
              calculation.utilization > 90 ? 'text-red-500' :
              calculation.utilization > 70 ? 'text-amber-500' :
              'text-green-500'
            }`}>
              {calculation.utilization.toFixed(1)}%
            </span>
          </div>
          <div className="h-4 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                calculation.utilization > 90 ? 'bg-red-500' :
                calculation.utilization > 70 ? 'bg-amber-500' :
                'bg-primary'
              }`}
              style={{ width: `${Math.min(calculation.utilization, 100)}%` }}
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-sm font-bold text-foreground">{calculation.avgTokensPerFile.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Tokens/arquivo</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-sm font-bold text-foreground">{calculation.filesTokens.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Tokens (arquivos)</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-sm font-bold text-foreground">{calculation.overheadTokens.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Overhead</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-sm font-bold text-primary">{calculation.totalNeeded.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total necessário</div>
          </div>
        </div>

        {/* Status */}
        <div className={`rounded-lg p-4 ${
          calculation.fits
            ? 'bg-green-500/5 border border-green-500/20'
            : 'bg-red-500/5 border border-red-500/20'
        }`}>
          <div className="flex items-center gap-2">
            {calculation.fits ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <div>
                  <p className="text-sm font-medium text-green-500">Contexto suficiente!</p>
                  <p className="text-xs text-muted-foreground">
                    {calculation.remaining.toLocaleString()} tokens livres de {calculation.available.toLocaleString()} limite do {model.name}
                  </p>
                </div>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <div>
                  <p className="text-sm font-medium text-red-500">Contexto insuficiente!</p>
                  <p className="text-xs text-muted-foreground">
                    Precisa de {(calculation.totalNeeded - calculation.available).toLocaleString()} tokens extras. O limite do {model.name} é {calculation.available.toLocaleString()} tokens.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <h4 className="text-sm font-medium mb-3">Detalhamento</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Componente</th>
                <th className="text-right py-2 pr-4 text-muted-foreground font-medium">Tokens</th>
                <th className="text-right py-2 text-muted-foreground font-medium">% do Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/20">
                <td className="py-2 pr-4">Arquivos ({filesCount} × {calculation.avgTokensPerFile})</td>
                <td className="text-right py-2 pr-4">{calculation.filesTokens.toLocaleString()}</td>
                <td className="text-right py-2">{((calculation.filesTokens / calculation.totalNeeded) * 100).toFixed(1)}%</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-2 pr-4">Overhead ({overhead}%)</td>
                <td className="text-right py-2 pr-4">{calculation.overheadTokens.toLocaleString()}</td>
                <td className="text-right py-2">{((calculation.overheadTokens / calculation.totalNeeded) * 100).toFixed(1)}%</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-2 pr-4">Prompt do usuário</td>
                <td className="text-right py-2 pr-4">{promptTokens.toLocaleString()}</td>
                <td className="text-right py-2">{((promptTokens / calculation.totalNeeded) * 100).toFixed(1)}%</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-2 pr-4">System prompt</td>
                <td className="text-right py-2 pr-4">{systemPromptTokens.toLocaleString()}</td>
                <td className="text-right py-2">{((systemPromptTokens / calculation.totalNeeded) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Total Necessário</td>
                <td className="text-right py-2 pr-4 font-medium text-primary">{calculation.totalNeeded.toLocaleString()}</td>
                <td className="text-right py-2 font-medium">100%</td>
              </tr>
              <tr className="border-t border-border/30">
                <td className="py-2 pr-4 text-muted-foreground">Limite do {model.name}</td>
                <td className="text-right py-2 pr-4 text-muted-foreground">{calculation.available.toLocaleString()}</td>
                <td className="text-right py-2 text-muted-foreground">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

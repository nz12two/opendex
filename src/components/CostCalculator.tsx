import { useState, useMemo } from 'react';

interface ModelPricing {
  id: string;
  name: string;
  inputPer1K: number;
  outputPer1K: number;
  contextLimit: number;
}

const MODELS: ModelPricing[] = [
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', inputPer1K: 0.003, outputPer1K: 0.015, contextLimit: 200000 },
  { id: 'claude-haiku-3.5', name: 'Claude Haiku 3.5', inputPer1K: 0.001, outputPer1K: 0.005, contextLimit: 200000 },
  { id: 'gpt-4o', name: 'GPT-4o', inputPer1K: 0.005, outputPer1K: 0.015, contextLimit: 128000 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', inputPer1K: 0.00015, outputPer1K: 0.0006, contextLimit: 128000 },
  { id: 'deepseek-v4', name: 'DeepSeek V4', inputPer1K: 0.0005, outputPer1K: 0.002, contextLimit: 128000 },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', inputPer1K: 0.00125, outputPer1K: 0.005, contextLimit: 1000000 },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', inputPer1K: 0.00015, outputPer1K: 0.0006, contextLimit: 1000000 },
];

export default function CostCalculator() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [numRequests, setNumRequests] = useState(100);

  const model = MODELS.find(m => m.id === selectedModel);
  if (!model) return <p className="text-muted-foreground">Modelo não encontrado</p>;

  const costs = useMemo(() => {
    const inputCost = (inputTokens / 1000) * model.inputPer1K;
    const outputCost = (outputTokens / 1000) * model.outputPer1K;
    const perRequest = inputCost + outputCost;
    const total = perRequest * numRequests;

    const inputCostMonthly = inputCost * numRequests * 30;
    const outputCostMonthly = outputCost * numRequests * 30;
    const totalMonthly = inputCostMonthly + outputCostMonthly;

    return {
      inputCost,
      outputCost,
      perRequest,
      total,
      totalMonthly,
      tokensPerRequest: inputTokens + outputTokens,
      contextUtilization: ((inputTokens + outputTokens) / model.contextLimit * 100),
    };
  }, [inputTokens, outputTokens, numRequests, model]);

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
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <div className="mt-2 text-xs text-muted-foreground">
          Limite de contexto: {model.contextLimit.toLocaleString()} tokens | 
          Input: ${model.inputPer1K}/1K tokens | 
          Output: ${model.outputPer1K}/1K tokens
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <label className="block text-sm font-medium mb-2">Tokens de Input</label>
          <input
            type="number"
            value={inputTokens}
            onChange={e => setInputTokens(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <label className="block text-sm font-medium mb-2">Tokens de Output</label>
          <input
            type="number"
            value={outputTokens}
            onChange={e => setOutputTokens(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <label className="block text-sm font-medium mb-2">Requisições</label>
          <input
            type="number"
            value={numRequests}
            onChange={e => setNumRequests(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <h4 className="text-sm font-medium mb-4">Custos Estimados</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <div className="text-lg font-bold text-foreground">${(costs.inputCost || 0).toFixed(5)}</div>
            <div className="text-xs text-muted-foreground">Input/request</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <div className="text-lg font-bold text-foreground">${(costs.outputCost || 0).toFixed(5)}</div>
            <div className="text-xs text-muted-foreground">Output/request</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-lg font-bold text-primary">${(costs.perRequest || 0).toFixed(5)}</div>
            <div className="text-xs text-muted-foreground">Total/request</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-lg font-bold text-primary">${(costs.total || 0).toFixed(4)}</div>
            <div className="text-xs text-muted-foreground">Total {numRequests} requests</div>
          </div>
        </div>

        {/* Monthly projection */}
        <div className="rounded-lg border border-border/30 bg-muted/20 p-4">
          <h5 className="text-xs font-medium mb-3">Projeção Mensal (30 dias)</h5>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm font-bold text-foreground">${(costs.inputCostMonthly || 0).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Input</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-foreground">${(costs.outputCostMonthly || 0).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Output</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-primary">${(costs.totalMonthly || 0).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Total/mês</div>
            </div>
          </div>
        </div>

        {/* Context utilization */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Utilização de contexto</span>
            <span className="font-medium">{(costs.contextUtilization || 0).toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                costs.contextUtilization > 80 ? 'bg-red-500' : costs.contextUtilization > 50 ? 'bg-amber-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(costs.contextUtilization, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {costs.tokensPerRequest.toLocaleString()} tokens / {model.contextLimit.toLocaleString()} tokens limite
          </p>
        </div>
      </div>

      {/* Comparison at bottom */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <h4 className="text-sm font-medium mb-3">Comparação entre Modelos</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 px-2 text-muted-foreground font-medium">Modelo</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Input/1K</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Output/1K</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Contexto</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Custo/req</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map(m => {
                const inputC = (inputTokens / 1000) * m.inputPer1K;
                const outputC = (outputTokens / 1000) * m.outputPer1K;
                const totalC = inputC + outputC;
                return (
                  <tr key={m.id} className={`border-b border-border/20 ${m.id === selectedModel ? 'bg-primary/5' : ''}`}>
                    <td className="py-2 px-2 font-medium">{m.name}</td>
                    <td className="text-right py-2 px-2 text-muted-foreground">${(m.inputPer1K || 0).toFixed(5)}</td>
                    <td className="text-right py-2 px-2 text-muted-foreground">${(m.outputPer1K || 0).toFixed(5)}</td>
                    <td className="text-right py-2 px-2 text-muted-foreground">{m.contextLimit.toLocaleString()}</td>
                    <td className={`text-right py-2 px-2 font-medium ${m.id === selectedModel ? 'text-primary' : ''}`}>
                      ${(totalC || 0).toFixed(5)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

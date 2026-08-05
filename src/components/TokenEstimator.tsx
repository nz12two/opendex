import { useState, useMemo, useCallback } from 'react';

const CHARS_PER_TOKEN = 4;
const COST_PER_1K_TOKENS = 0.003; // $0.003 por 1K tokens (ex: Claude Sonnet)

export default function TokenEstimator() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const characters = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;
    const tokens = Math.ceil(characters / CHARS_PER_TOKEN);
    const estimatedCost = (tokens / 1000) * COST_PER_1K_TOKENS;
    return { characters, words, lines, tokens, estimatedCost };
  }, [text]);

  const handleClear = useCallback(() => setText(''), []);

  return (
    <div className="space-y-6">
      {/* Textarea */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <label className="block text-sm font-medium mb-2">
          Cole seu texto ou prompt abaixo
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Cole seu texto aqui para estimar tokens..."
          rows={12}
          className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-y font-mono"
        />
        <div className="flex justify-between mt-3">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar
          </button>
          <span className="text-xs text-muted-foreground">
            ~1 token ≈ {CHARS_PER_TOKEN} caracteres
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Caracteres" value={stats.characters.toLocaleString()} />
        <StatCard label="Palavras" value={stats.words.toLocaleString()} />
        <StatCard label="Linhas" value={stats.lines.toLocaleString()} />
        <StatCard
          label="Tokens (estimado)"
          value={stats.tokens.toLocaleString()}
          highlight
        />
        <StatCard
          label="Custo estimado"
          value={`$${stats.estimatedCost.toFixed(5)}`}
          highlight
        />
      </div>

      {/* Bar visualization */}
      {text.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h4 className="text-sm font-medium mb-4">Distribuição</h4>
          <div className="space-y-3">
            <BarItem
              label="Caracteres"
              value={stats.characters}
              max={Math.max(stats.characters, 1)}
              color="bg-primary"
            />
            <BarItem
              label="Tokens"
              value={stats.tokens}
              max={Math.max(stats.tokens, 1)}
              color="bg-amber-500"
            />
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">📊 Sobre a estimativa</p>
        <p>
          A estimativa de tokens usa a aproximação de ~1 token = {CHARS_PER_TOKEN} caracteres,
          baseada na média do GPT-4/Claude. O custo estimado usa ~$0.003/1K tokens (preço
          aproximado do Claude Sonnet). Para uma estimativa mais precisa, use o tokenizador
          oficial do modelo escolhido.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border ${highlight ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-card'} p-4 text-center shadow-sm`}>
      <div className={`text-2xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function BarItem({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

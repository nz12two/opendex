import { useState, useMemo } from 'react';

const CHARS_PER_TOKEN = 4;
const QUALITY_KEYWORDS = [
  'contexto', 'objetivo', 'formato', 'exemplo', 'específico',
  'detalhado', 'passo a passo', 'código', 'estrutura',
  'por favor', 'considere', 'analise', 'explique',
];

export default function PromptOptimizer() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const tokens = Math.ceil(text.length / CHARS_PER_TOKEN);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    // Quality score
    let score = 50; // base score
    const lowerText = text.toLowerCase();

    if (text.length > 50) score += 5;
    if (text.length > 200) score += 5;
    if (words > 20) score += 5;

    QUALITY_KEYWORDS.forEach(kw => {
      if (lowerText.includes(kw)) score += 3;
    });

    // Deductions
    if (text.split('.').length < 3) score -= 10;
    if (text.split('\n').length < 2) score -= 5;
    if (text.length > 0 && text.length < 20) score -= 15;

    score = Math.max(0, Math.min(100, score));

    const tips: string[] = [];
    if (text.length < 50 && text.length > 0) tips.push('Seu prompt é muito curto. Adicione mais contexto.');
    if (!lowerText.includes('objetivo') && !lowerText.includes('objective')) tips.push('Defina claramente o objetivo do prompt.');
    if (words > 0 && words < 10) tips.push('Use mais palavras para descrever o que precisa.');
    if (!lowerText.includes('exemplo') && !lowerText.includes('example')) tips.push('Adicione exemplos para melhorar a precisão.');
    if (!lowerText.includes('formato') && !lowerText.includes('format')) tips.push('Especifique o formato esperado da resposta.');
    if (text.length > 0 && text.split('.').length < 3) tips.push('Estruture seu prompt em frases completas.');
    if (score < 40) tips.push('Reescreva o prompt com mais detalhes e contexto.');
    if (score >= 80) tips.push('Excelente! Seu prompt está bem estruturado.');

    return { tokens, words, score, tips };
  }, [text]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Textarea */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <label className="block text-sm font-medium mb-2">
          Cole seu prompt para análise
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Digite ou cole seu prompt aqui para analisar qualidade, tokens e receber dicas de otimização..."
          rows={10}
          className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-y font-mono"
        />
        <div className="flex justify-between mt-3">
          <button
            type="button"
            onClick={() => setText('')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar
          </button>
          <span className="text-xs text-muted-foreground">
            {text.length} caracteres | ~{stats.tokens} tokens
          </span>
        </div>
      </div>

      {/* Quality Score */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium">Score de Qualidade</h4>
          <span className={`text-2xl font-bold ${getScoreColor(stats.score)}`}>
            {stats.score}/100
          </span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(stats.score)}`}
            style={{ width: `${stats.score}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-lg font-bold text-foreground">{stats.words}</div>
            <div className="text-xs text-muted-foreground">Palavras</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-lg font-bold text-foreground">{stats.tokens}</div>
            <div className="text-xs text-muted-foreground">Tokens</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-lg font-bold text-foreground">{text.length}</div>
            <div className="text-xs text-muted-foreground">Caracteres</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      {text.length > 0 && stats.tips.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h4 className="text-sm font-medium mb-4">Dicas de Otimização</h4>
          <div className="space-y-2">
            {stats.tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 text-sm"
              >
                <span className={`shrink-0 mt-0.5 ${
                  tip.startsWith('Excelente') ? 'text-green-500' : 'text-primary'
                }`}>
                  {tip.startsWith('Excelente') ? '✓' : '→'}
                </span>
                <span className="text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      {text.length === 0 && (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">💡 Como funciona</p>
          <p>
            Cole seu prompt para receber uma análise completa incluindo score de qualidade,
            contagem de tokens, palavras e dicas personalizadas de otimização.
          </p>
        </div>
      )}
    </div>
  );
}

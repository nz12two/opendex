import { useState, useCallback, useMemo } from 'react';
import { promptTemplates } from '@/data/tools';
import { Copy, Check } from 'lucide-react';

export default function PromptBuilder() {
  const [selectedSlug, setSelectedSlug] = useState(promptTemplates[0]?.slug || '');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const template = useMemo(
    () => promptTemplates.find(t => t.slug === selectedSlug),
    [selectedSlug]
  );

  const selectedCategory = template?.category || '';

  const handleSelectTemplate = useCallback((slug: string) => {
    setSelectedSlug(slug);
    setVariables({});
  }, []);

  const updateVariable = useCallback((key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  }, []);

  const processedPrompt = useMemo(() => {
    if (!template) return '';
    let result = template.content;
    template.variables.forEach(v => {
      const value = variables[v] || `[${v}]`;
      result = result.replace(new RegExp(`\\[${v}\\]`, 'g'), value);
    });
    return result;
  }, [template, variables]);

  const categories = useMemo(
    () => [...new Set(promptTemplates.map(t => t.category))],
    []
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(processedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [processedPrompt]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left: Template selection + variables */}
      <div className="space-y-6">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                const firstInCat = promptTemplates.find(t => t.category === cat);
                if (firstInCat) handleSelectTemplate(firstInCat.slug);
              }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Template</label>
          <div className="grid gap-2">
            {promptTemplates.map(t => (
              <button
                key={t.slug}
                type="button"
                onClick={() => handleSelectTemplate(t.slug)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  selectedSlug === t.slug
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-border bg-background hover:border-primary/30'
                }`}
              >
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
                <div className="flex gap-1 mt-1.5">
                  {t.variables.map(v => (
                    <span key={v} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      [{v}]
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Variables */}
        {template && template.variables.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
            <h4 className="text-sm font-medium">Customizar Variáveis</h4>
            {template.variables.map(v => (
              <div key={v}>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  {v.replace(/_/g, ' ')}
                </label>
                <input
                  type="text"
                  value={variables[v] || ''}
                  onChange={e => updateVariable(v, e.target.value)}
                  placeholder={`[${v}]`}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Prompt Final</h3>
          {template && (
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {template.name}
            </span>
          )}
        </div>

        <div className="relative rounded-xl border border-border/50 bg-muted/30 p-4 min-h-[300px]">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-sans">
            {processedPrompt || 'Selecione um template para começar...'}
          </pre>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!processedPrompt}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copiado!' : 'Copiar Prompt'}
        </button>
      </div>
    </div>
  );
}

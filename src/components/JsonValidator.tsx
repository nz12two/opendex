import { useState, useMemo, useCallback } from 'react';

export default function JsonValidator() {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<unknown>(null);

  const validate = useCallback((value: string) => {
    if (!value.trim()) {
      setError(null);
      setParsed(null);
      return;
    }
    try {
      const result = JSON.parse(value);
      setError(null);
      setParsed(result);
    } catch (e) {
      setError((e as Error).message);
      setParsed(null);
    }
  }, []);

  const handleChange = useCallback((value: string) => {
    setInput(value);
    validate(value);
  }, [validate]);

  const format = useCallback(() => {
    if (!parsed) return;
    try {
      const formatted = JSON.stringify(parsed, null, 2);
      setInput(formatted);
      setError(null);
    } catch {
      // noop
    }
  }, [parsed]);

  const minify = useCallback(() => {
    if (!parsed) return;
    try {
      const minified = JSON.stringify(parsed);
      setInput(minified);
      setError(null);
    } catch {
      // noop
    }
  }, [parsed]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(input);
  }, [input]);

  const syntaxInfo = useMemo(() => {
    if (!input.trim()) return null;
    const lineCount = input.split('\n').length;
    const charCount = input.length;
    return { lineCount, charCount };
  }, [input]);

  return (
    <div className="space-y-6">
      {/* Editor */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">JSON Input</label>
          {parsed && (
            <span className="text-xs text-green-500">✓ JSON Válido</span>
          )}
          {error && (
            <span className="text-xs text-red-500">✗ JSON Inválido</span>
          )}
        </div>
        <textarea
          value={input}
          onChange={e => handleChange(e.target.value)}
          placeholder='Cole seu JSON aqui...'
          rows={14}
          spellCheck={false}
          className={`flex w-full rounded-lg border px-4 py-3 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 resize-y ${
            error
              ? 'border-red-500 bg-red-500/5 focus-visible:ring-red-500'
              : parsed
              ? 'border-green-500/50 bg-green-500/5 focus-visible:ring-green-500'
              : 'border-input bg-background focus-visible:ring-primary'
          }`}
        />
        {syntaxInfo && (
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{syntaxInfo.lineCount} linhas</span>
            <span>{syntaxInfo.charCount} caracteres</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <h4 className="text-sm font-medium text-red-500 mb-1">Erro de Validação</h4>
          <p className="text-xs text-red-400 font-mono">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={format}
          disabled={!parsed}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Format
        </button>
        <button
          type="button"
          onClick={minify}
          disabled={!parsed}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          Minify
        </button>
        <button
          type="button"
          onClick={copyToClipboard}
          disabled={!input}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copiar
        </button>
        <button
          type="button"
          onClick={() => { setInput(''); setError(null); setParsed(null); }}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Limpar
        </button>
      </div>

      {/* Preview */}
      {parsed && (
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h4 className="text-sm font-medium mb-3">Preview</h4>
          <div className="rounded-lg bg-muted p-4 overflow-auto max-h-80">
            <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span>Tipo: {Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' && parsed !== null ? 'Object' : typeof parsed}</span>
            <span>|</span>
            <span>Tamanho: {new Blob([input]).size} bytes</span>
          </div>
        </div>
      )}

      {!input.trim() && (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">📋 Como usar</p>
          <p>Cole um JSON no editor para validar, formatar ou minificar. A validação é feita em tempo real.</p>
        </div>
      )}
    </div>
  );
}

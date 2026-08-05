import { useState, useCallback } from 'react';
import RecommendationForm from './RecommendationForm';
import RecommendationResult from './RecommendationResult';
import GargaloAlert from './GargaloAlert';
import { recomendar } from '@/lib/recommendation/engine';
import type { ResultadoRecomendacao } from '@/lib/recommendation/types';

export default function RecommendationApp() {
  const [descricao, setDescricao] = useState('');
  const [resultado, setResultado] = useState<ResultadoRecomendacao | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback((texto: string) => {
    setDescricao(texto);
    setIsLoading(true);
    setError(null);

    // Simula um pequeno delay para feedback visual
    setTimeout(() => {
      try {
        const result = recomendar(texto);
        setResultado(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao analisar o projeto');
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      {/* Formulário */}
      <div className="rounded-xl border border-border/50 bg-card p-6 md:p-8 shadow-sm">
        <RecommendationForm onAnalyze={handleAnalyze} isLoading={isLoading} />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Analisando seu projeto...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm font-medium text-red-500">Erro ao analisar</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      )}

      {/* Resultados */}
      {resultado && !isLoading && (
        <>
          {/* Gargalos */}
          {resultado.gargalos.length > 0 && (
            <div id="gargalos-container">
              <GargaloAlert gargalos={resultado.gargalos} />
            </div>
          )}

          {/* Recomendações */}
          <div id="recomendacoes-container">
            <RecommendationResult recomendacoes={resultado.recomendacoes} />
          </div>
        </>
      )}
    </div>
  );
}

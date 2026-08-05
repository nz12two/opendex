import { useState, type FormEvent } from 'react';
import { Sparkles, Send, Loader2, FileText } from 'lucide-react';

interface RecommendationFormProps {
  onAnalyze: (descricao: string) => void;
  isLoading: boolean;
}

const EXEMPLOS = [
  'Estou criando uma API em Fastify com PostgreSQL',
  'Quero fazer um bot para Discord com TypeScript',
  'Preciso refatorar um projeto React grande',
  'Vou criar um app mobile com React Native e Firebase',
  'Preciso de um pipeline CI/CD com Docker e testes automatizados',
];

export default function RecommendationForm({ onAnalyze, isLoading }: RecommendationFormProps) {
  const [descricao, setDescricao] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (descricao.trim().length < 5) return;
    onAnalyze(descricao.trim());
  };

  const handleExemplo = (exemplo: string) => {
    setDescricao(exemplo);
    onAnalyze(exemplo);
  };

  const isDisabled = descricao.trim().length < 5 || isLoading;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva seu projeto... Ex: Estou criando uma API REST em Fastify com PostgreSQL e autenticação JWT"
            className="flex min-h-[140px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-3">
            <button
              type="submit"
              disabled={isDisabled}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Analisar Projeto
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Exemplos rápidos
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXEMPLOS.map((exemplo) => (
            <button
              key={exemplo}
              type="button"
              onClick={() => handleExemplo(exemplo)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              {exemplo.length > 40 ? exemplo.slice(0, 40) + '...' : exemplo}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

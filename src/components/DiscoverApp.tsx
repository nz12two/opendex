import { useState, useCallback } from 'react';
import DiscoverQuestion from './DiscoverQuestion';
import DiscoverProgress from './DiscoverProgress';
import DiscoverResult from './DiscoverResult';
import { getRecommendation } from '@/data/discover/rules';
import type { DiscoverAnswers, DiscoverRecommendation } from '@/data/discover/rules';

const steps = [
  {
    id: 'linguagem',
    title: 'Qual linguagem você usa?',
    subtitle: 'Escolha a linguagem principal do seu projeto',
    options: [
      { value: 'node', label: 'Node.js', description: 'JavaScript e TypeScript no backend' },
      { value: 'python', label: 'Python', description: 'Ciência de dados, IA, automação' },
      { value: 'go', label: 'Go', description: 'Sistemas concorrentes e microsserviços' },
      { value: 'rust', label: 'Rust', description: 'Performance e segurança de memória' },
      { value: 'java', label: 'Java', description: 'Aplicações enterprise e Android' },
    ],
  },
  {
    id: 'projeto',
    title: 'Que tipo de projeto?',
    subtitle: 'Selecione a categoria que melhor descreve seu projeto',
    options: [
      { value: 'api', label: 'API', description: 'APIs REST, GraphQL ou gRPC' },
      { value: 'bot', label: 'Bot', description: 'Bots para Discord, Telegram, etc' },
      { value: 'minecraft', label: 'Minecraft', description: 'Plugins, mods e servidores' },
      { value: 'cli', label: 'CLI', description: 'Ferramentas de linha de comando' },
      { value: 'web', label: 'Web', description: 'Aplicações e sites web' },
    ],
  },
  {
    id: 'modelo',
    title: 'Modelo Free ou Pago?',
    subtitle: 'Isso ajuda a recomendar ferramentas dentro do seu orçamento',
    options: [
      { value: 'free', label: 'Free', description: 'Modelos gratuitos como Gemini 2.5 Flash' },
      { value: 'paid', label: 'Pago', description: 'Modelos premium como Claude ou GPT-4o' },
    ],
  },
  {
    id: 'experiencia',
    title: 'Qual seu nível de experiência?',
    subtitle: 'Adaptamos as recomendações ao seu conhecimento',
    options: [
      { value: 'iniciante', label: 'Iniciante', description: 'Primeiros passos com a ferramenta' },
      { value: 'intermediario', label: 'Intermediário', description: 'Já usa no dia a dia' },
      { value: 'avancado', label: 'Avançado', description: 'Domina conceitos e quer otimizar' },
    ],
  },
];

const stepLabels = ['Linguagem', 'Projeto', 'Modelo', 'Experiência'];

export default function DiscoverApp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({
    linguagem: null,
    projeto: null,
    modelo: null,
    experiencia: null,
  });
  const [result, setResult] = useState<DiscoverRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = useCallback((value: string) => {
    const stepId = steps[currentStep].id;
    setAnswers((prev) => ({ ...prev, [stepId]: value }));
  }, [currentStep]);

  const handleNext = useCallback(() => {
    const stepId = steps[currentStep].id;
    if (!answers[stepId]) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Generate recommendation
      try {
        const fullAnswers: DiscoverAnswers = {
          linguagem: answers.linguagem as DiscoverAnswers['linguagem'],
          projeto: answers.projeto as DiscoverAnswers['projeto'],
          modelo: answers.modelo as DiscoverAnswers['modelo'],
          experiencia: answers.experiencia as DiscoverAnswers['experiencia'],
        };
        const rec = getRecommendation(fullAnswers);
        setResult(rec);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao gerar recomendação');
      }
    }
  }, [currentStep, answers]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setAnswers({ linguagem: null, projeto: null, modelo: null, experiencia: null });
    setResult(null);
    setError(null);
  }, []);

  // Result screen
  if (result) {
    return (
      <div className="space-y-8">
        <DiscoverResult result={result} onRestart={handleRestart} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <DiscoverProgress
        currentStep={currentStep}
        totalSteps={steps.length}
        labels={stepLabels}
      />

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Question */}
      <DiscoverQuestion
        steps={steps}
        currentStep={currentStep}
        answers={answers}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </div>
  );
}

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export interface QuestionOption {
  value: string;
  label: string;
  description: string;
  icon?: string;
}

interface Step {
  id: string;
  title: string;
  subtitle: string;
  options: QuestionOption[];
}

interface DiscoverQuestionProps {
  steps: Step[];
  currentStep: number;
  answers: Record<string, string | null>;
  onAnswer: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function DiscoverQuestion({
  steps,
  currentStep,
  answers,
  onAnswer,
  onNext,
  onPrev,
}: DiscoverQuestionProps) {
  const step = steps[currentStep];
  const selected = answers[step.id];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Step indicator */}
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Etapa {currentStep + 1} de {steps.length}
        </span>
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold md:text-3xl">{step.title}</h2>
        <p className="mt-2 text-muted-foreground">{step.subtitle}</p>
      </div>

      {/* Options grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {step.options.map((option) => (
          <button
            key={option.value}
            onClick={() => onAnswer(option.value)}
            className={`group relative rounded-xl border-2 p-5 text-left transition-all duration-200 hover:scale-[1.02] ${
              selected === option.value
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                : 'border-border bg-card hover:border-primary/40 hover:bg-accent/50'
            }`}
          >
            <div className="flex flex-col gap-2">
              <span
                className={`text-lg font-semibold transition-colors ${
                  selected === option.value
                    ? 'text-primary'
                    : 'text-foreground group-hover:text-primary'
                }`}
              >
                {option.label}
              </span>
              <span className="text-sm text-muted-foreground">
                {option.description}
              </span>
            </div>

            {selected === option.value && (
              <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <span className="text-xs font-bold text-primary-foreground">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={currentStep === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={`h-2 w-2 rounded-full transition-all ${
                i === currentStep
                  ? 'bg-primary w-6'
                  : i < currentStep
                  ? 'bg-primary/40'
                  : 'bg-border'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!selected}
          className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all ${
            selected
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isLastStep ? 'Ver Resultado' : 'Próximo'}
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
          {isLastStep && <Sparkles className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

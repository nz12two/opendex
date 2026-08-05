interface DiscoverProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function DiscoverProgress({
  currentStep,
  totalSteps,
  labels,
}: DiscoverProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {labels.map((label, i) => (
          <span
            key={label}
            className={`text-xs font-medium transition-colors ${
              i === currentStep
                ? 'text-primary'
                : i < currentStep
                ? 'text-primary/60'
                : 'text-muted-foreground/40'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

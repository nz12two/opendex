import { cn } from '@/lib/utils';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: 'sm' | 'md';
}

const difficultyConfig: Record<Difficulty, { emoji: string; label: string; className: string }> = {
  beginner: {
    emoji: '🟢',
    label: 'Beginner',
    className: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  intermediate: {
    emoji: '🟡',
    label: 'Intermediate',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  advanced: {
    emoji: '🔴',
    label: 'Advanced',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export default function DifficultyBadge({ difficulty, size = 'sm' }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium transition-colors',
        config.className,
        sizeStyles[size],
      )}
    >
      <span className="leading-none">{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}

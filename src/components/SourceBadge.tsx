import { cn } from '@/lib/utils';
import { Github, Package, Brain, ExternalLink, Clock } from 'lucide-react';

interface SourceBadgeProps {
  source: 'github' | 'npm' | 'openrouter' | 'community';
  url?: string;
  lastUpdated?: string;
  className?: string;
}

const sourceConfig = {
  github: { icon: Github, label: 'GitHub', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
  npm: { icon: Package, label: 'npm', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  openrouter: { icon: Brain, label: 'OpenRouter API', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  community: { icon: ExternalLink, label: 'Dados da Comunidade', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
};

export function SourceBadge({ source, url, lastUpdated, className }: SourceBadgeProps) {
  const config = sourceConfig[source];
  const Icon = config.icon;

  const formatDate = (date?: string) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return ''; }
  };

  return (
    <div className={cn('inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs', config.color, className)}>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium">{config.label}</span>
      {lastUpdated && (
        <>
          <span className="text-current/50">·</span>
          <Clock className="h-3 w-3 text-current/70" />
          <span className="text-current/70">{formatDate(lastUpdated)}</span>
        </>
      )}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer"
           className="ml-1 inline-flex items-center gap-0.5 text-current/70 hover:text-current transition-colors">
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

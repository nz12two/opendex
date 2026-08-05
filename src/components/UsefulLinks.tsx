import { links, categories, type LinkItem } from '../data/links';
import {
  Globe,
  Github,
  BookOpen,
  MessageCircle,
  MessageSquare,
  Map,
  Rocket,
  Newspaper,
  GitPullRequest,
  GitMerge,
  ExternalLink,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Globe,
  Github,
  BookOpen,
  MessageCircle,
  MessageSquare,
  Map,
  Rocket,
  Newspaper,
  GitPullRequest,
  GitMerge,
};

interface UsefulLinksProps {
  className?: string;
}

export default function UsefulLinks({ className = '' }: UsefulLinksProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {categories.map((cat) => {
        const catLinks = links.filter((l) => l.category === cat.id);
        if (catLinks.length === 0) return null;

        return (
          <div key={cat.id} className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-card-foreground">
              {cat.label}
            </h3>
            <ul className="space-y-1.5">
              {catLinks.map((link) => {
                const Icon = iconMap[link.icon] || ExternalLink;
                return (
                  <li key={link.name}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="flex-1">{link.name}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

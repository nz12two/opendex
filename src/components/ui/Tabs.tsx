import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TabsProps {
  labels: string[];
  children: React.ReactNode[];
  defaultIndex?: number;
  className?: string;
}

export function Tabs({ labels, children, defaultIndex = 0, className }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <div className={cn('my-6', className)}>
      <div className="flex border-b border-border" role="tablist">
        {labels.map((label, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === activeIndex}
            aria-controls={`tabpanel-${i}`}
            id={`tab-${i}`}
            onClick={() => setActiveIndex(i)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors relative',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              i === activeIndex
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
            {i === activeIndex && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>
      {children.map((child, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`tabpanel-${i}`}
          aria-labelledby={`tab-${i}`}
          hidden={i !== activeIndex}
          className={cn(
            'rounded-b-lg border border-t-0 border-border p-4',
            'animate-in fadeIn',
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

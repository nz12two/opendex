import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';

export interface CodeBlockItem {
  language: string;
  code: string;
  title?: string;
}

export interface CodeGroupProps {
  items: CodeBlockItem[];
  defaultIndex?: number;
  className?: string;
}

export function CodeGroup({ items, defaultIndex = 0, className }: CodeGroupProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [copied, setCopied] = useState(false);

  const activeItem = items[activeIndex];

  const handleCopy = useCallback(async () => {
    if (!activeItem) return;
    try {
      await navigator.clipboard.writeText(activeItem.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  }, [activeItem]);

  if (!items.length) return null;

  return (
    <div className={cn('codegroup-wrapper', className)}>
      {/* Language Tabs */}
      <div className="codegroup-tabs" role="tablist">
        {items.map((item, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === activeIndex}
            aria-controls={`codegroup-panel-${i}`}
            id={`codegroup-tab-${i}`}
            onClick={() => setActiveIndex(i)}
            className={cn('codegroup-tab', i === activeIndex && 'active')}
          >
            {item.title || item.language}
          </button>
        ))}
      </div>

      {/* Code Content */}
      <div className="codegroup-content">
        {items.map((item, i) => (
          <div
            key={i}
            role="tabpanel"
            id={`codegroup-panel-${i}`}
            aria-labelledby={`codegroup-tab-${i}`}
            hidden={i !== activeIndex}
          >
            <pre className="overflow-x-auto p-4 text-sm">
              <code className="font-mono text-foreground/90 leading-relaxed">{item.code}</code>
            </pre>
          </div>
        ))}

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="codegroup-copy-btn"
          aria-label={copied ? 'Copiado!' : 'Copiar código'}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-500">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default CodeGroup;

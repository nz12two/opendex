import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileJson, Copy, Download, Check } from 'lucide-react';
import { exportWorkflow, exportAsYaml, type ExportFormat } from '@/lib/workflow/export';
import type { WorkflowNode, WorkflowEdge } from '@/lib/workflow/types';
import { cn } from '@/lib/utils';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

const formats: { value: ExportFormat; label: string; filename: string }[] = [
  { value: 'workflow', label: 'workflow.json', filename: 'workflow.json' },
  { value: 'opencode', label: 'opencode.json', filename: 'opencode.json' },
  { value: 'agents', label: 'agents.json', filename: 'agents.json' },
  { value: 'yaml', label: 'workflow.yaml', filename: 'workflow.yaml' },
];

export default function ExportDialog({ open, onOpenChange, nodes, edges }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('workflow');
  const [copied, setCopied] = useState(false);

  const content =
    selectedFormat === 'yaml'
      ? exportAsYaml(nodes, edges)
      : exportWorkflow(nodes, edges, selectedFormat);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [content]);

  const handleDownload = useCallback(() => {
    const format = formats.find((f) => f.value === selectedFormat);
    const contentType = selectedFormat === 'yaml' ? 'text/yaml' : 'application/json';
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = format?.filename || 'workflow.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content, selectedFormat]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" />
            Exportar Workflow
          </DialogTitle>
          <DialogDescription>
            Escolha o formato e copie ou faça download do arquivo.
          </DialogDescription>
        </DialogHeader>

        {/* Format selector */}
        <div className="flex gap-2">
          {formats.map((fmt) => (
            <button
              key={fmt.value}
              onClick={() => setSelectedFormat(fmt.value)}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                selectedFormat === fmt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/30'
              )}
            >
              {fmt.label}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="relative max-h-[300px] overflow-auto rounded-lg border border-border bg-[#0f172a] p-4">
          <pre className="text-xs text-gray-300 leading-relaxed">
            <code>{content}</code>
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-1.5 h-4 w-4 text-green-500" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-4 w-4" />
                Copiar
              </>
            )}
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <Download className="mr-1.5 h-4 w-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  X,
  Stethoscope,
  ListChecks,
  HelpCircle,
  Info,
} from 'lucide-react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import ReactDOM from 'react-dom';

// --- Types ---
interface AnalysisResultObject {
  generatedAnalysis?: string;
  potentialDiagnosis?: string | null;
  modelUsed?: string;
  analysisTimestamp?: string;
  conditionDetected?: string;
  confidence?: number;
  recommendation?: string;
  _simulation?: boolean;
  error?: string;
  rawData?: string;
  [key: string]: unknown;
}

interface AnalysisHistoryItem {
  _id: string;
  analysisDate: string;
  results: AnalysisResultObject | string | null;
  imagePath: string;
}

interface AnalysisViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisHistoryItem | null;
  apiBaseUrl: string;
}

// --- Markdown Component Overrides ---
const markdownComponents: Components = {
  h2: ({ node, ...props }) => {
    let Icon: React.ElementType | null = null;
    const child = node.children[0];
    const text =
      typeof child === 'object' && 'value' in child
        ? String(child.value).toLowerCase()
        : '';

    if (text.includes('visual observation')) Icon = ListChecks;
    else if (text.includes('potential diagnosis suggestion'))
      Icon = HelpCircle;
    else if (text.includes('general information')) Icon = Info;
    else if (text.includes('disclaimer')) Icon = AlertTriangle;

    return (
      <h2
        className="text-base font-semibold text-foreground mt-5 mb-2 flex items-center gap-2 border-b border-border/60 pb-1.5"
        {...props}
      >
        {Icon && <Icon className="w-4 h-4 text-primary flex-shrink-0" />}
        {props.children}
      </h2>
    );
  },
  b: ({ node, ...props }) => {
    const child = node.children[0];
    const content =
      typeof child === 'object' && 'value' in child
        ? String(child.value)
        : '';
    const isCritical = /AI Analysis Disclaimer:|This is NOT a confirmed diagnosis\.|This is general information and NOT treatment advice\./i.test(
      content
    );

    return (
      <strong
        className={cn(
          'font-semibold',
          isCritical ? 'text-destructive' : 'text-foreground'
        )}
        {...props}
      />
    );
  },
};

const AnalysisViewModal: React.FC<AnalysisViewModalProps> = ({
  isOpen,
  onClose,
  analysis,
  apiBaseUrl,
}) => {
  const analysisDateFormatted = React.useMemo(() => {
    if (!analysis?.analysisDate) return 'Date Unknown';
    try {
      return format(new Date(analysis.analysisDate), 'PPP p');
    } catch {
      return 'Invalid Date';
    }
  }, [analysis?.analysisDate]);

  const fullImageUrl = React.useMemo(() => {
    if (!apiBaseUrl || !analysis?.imagePath) return '';
    const base = apiBaseUrl.endsWith('/')
      ? apiBaseUrl.slice(0, -1)
      : apiBaseUrl;
    const path = analysis.imagePath.startsWith('/')
      ? analysis.imagePath
      : `/${analysis.imagePath}`;
    return `${base}${path}`;
  }, [apiBaseUrl, analysis?.imagePath]);

  if (!analysis) return null;

  const renderResults = () => {
    const res = analysis.results;
    if (!res) {
      return (
        <p className="text-sm text-muted-foreground italic px-1">
          No analysis results available.
        </p>
      );
    }

    if (typeof res === 'string') {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/95">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={markdownComponents}
          >
            {res}
          </ReactMarkdown>
        </div>
      );
    }

    // object case
    if (res.error) {
      return (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive space-y-2">
          <p className="font-medium">Error during analysis:</p>
          <p>{String(res.error)}</p>
          {res.rawData && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs hover:underline">
                Show Raw Data
              </summary>
              <pre className="mt-1 text-xs overflow-auto bg-destructive/20 p-2 rounded max-h-40">
                <code>{String(res.rawData)}</code>
              </pre>
            </details>
          )}
        </div>
      );
    }

    if (res.generatedAnalysis) {
      return (
        <>
          {res.potentialDiagnosis && (
            <div className="mb-5 p-3 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-md shadow-sm">
              <h4 className="font-semibold text-sm text-blue-800 mb-1 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                Potential Suggestion Highlight:
              </h4>
              <p className="text-lg font-bold text-blue-900 ml-6">
                {String(res.potentialDiagnosis)}
              </p>
            </div>
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/95">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={markdownComponents}
            >
              {res.generatedAnalysis}
            </ReactMarkdown>
          </div>
        </>
      );
    }

    const hasFallback =
      res.conditionDetected || typeof res.confidence === 'number' || res.recommendation;
    if (hasFallback) {
      return (
        <div className="space-y-3 text-sm p-3 border rounded-md bg-muted/50">
          <p className="text-xs italic text-muted-foreground mb-2">
            (Displaying fallback analysis fields)
          </p>
          {res.conditionDetected && (
            <p>
              <strong>Condition Detected:</strong>{' '}
              {String(res.conditionDetected)}
            </p>
          )}
          {typeof res.confidence === 'number' && (
            <p>
              <strong>Confidence:</strong>{' '}
              {(res.confidence * 100).toFixed(0)}%
            </p>
          )}
          {res.recommendation && (
            <div>
              <p className="font-medium mb-1">Recommendations:</p>
              <p className="text-muted-foreground">
                {String(res.recommendation)}
              </p>
            </div>
          )}
          {res._simulation && (
            <p className="text-xs italic text-muted-foreground mt-2">
              (Analysis result was simulated)
            </p>
          )}
        </div>
      );
    }

    return (
      <div>
        <p className="text-sm text-muted-foreground italic mb-2">
          Displaying raw analysis data:
        </p>
        <pre className="text-xs overflow-auto bg-muted p-3 rounded max-h-60 border">
          <code>{JSON.stringify(res, null, 2)}</code>
        </pre>
      </div>
    );
  };

  const ImageErrorFallback = () => (
    <div className="flex flex-col items-center justify-center text-destructive p-4">
      <AlertTriangle className="w-8 h-8 mb-2" />
      <p className="text-sm font-medium">Image Failed to Load</p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Analysis Details
          </DialogTitle>
          <DialogDescription>
            Viewing analysis recorded on: {analysisDateFormatted}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" /> Analyzed
              Image
            </h3>
            <div
              className={cn(
                "relative flex justify-center items-center p-2 border rounded-md bg-slate-50 dark:bg-slate-800/50 min-h-[150px] max-h-72 overflow-hidden",
                !fullImageUrl && "items-center justify-center"
              )}
            >
              {fullImageUrl ? (
                <img
                  src={fullImageUrl}
                  alt="Analyzed skin condition"
                  className="max-w-full max-h-64 object-contain rounded cursor-pointer"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.style.display = 'none';
                    const container = img.parentElement;
                    if (container) {
                      const fallbackRoot = document.createElement('div');
                      container.appendChild(fallbackRoot);
                      ReactDOM.render(<ImageErrorFallback />, fallbackRoot);
                    }
                  }}
                />
              ) : (
                <div className="text-sm italic text-muted-foreground p-4">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <p>No image path recorded.</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-muted-foreground" /> Analysis
              Results
            </h3>
            {renderResults()}
          </div>

          <Separator />

          <div className="p-4 rounded-md border border-amber-300 bg-amber-50">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" /> Important Disclaimer
            </h4>
            <p className="text-xs leading-relaxed text-amber-700">
              This AI-generated analysis is for informational purposes only and is{' '}
              <strong>NOT</strong> a medical diagnosis. Always consult a
              healthcare professional before making any decisions.
            </p>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-slate-50 flex-shrink-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">
              <X className="mr-1.5 h-4 w-4" /> Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisViewModal;

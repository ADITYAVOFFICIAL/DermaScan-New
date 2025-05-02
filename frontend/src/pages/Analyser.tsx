import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  Loader2,
  Info,
  CheckCircle,
  AlertTriangle,
  Microscope,
  FileText,
  Stethoscope,
  ListChecks,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

// --- Import Gemini utility functions ---
import {
  analyzeImageWithGemini,
  isGeminiAvailable,
  hasGeminiApiKey,
} from "@/lib/gemini";

// --- Environment Variable Handling ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  console.warn(
    "⚠️ Missing VITE_API_BASE_URL in environment variables. Cannot save analysis to backend."
  );
}

// Helper to pull out the “Potential suggestion” line
const extractPotentialDiagnosis = (text: string): string | null => {
  const specific = text.match(
    /Potential suggestion based on visuals:\s*<b>(.*?)\.?<\/b>/i
  );
  if (specific?.[1]) return specific[1].trim().replace(/\.$/, "");
  const fallback = text.match(
    /Potential suggestion based on visuals:.*?<b>(.*?)<\/b>/is
  );
  return fallback?.[1]?.trim().replace(/\.$/, "") ?? null;
};

// Custom-render ReactMarkdown headings & bold tags with icons / styling
const markdownComponents: Components = {
  h2: ({ node, ...props }) => {
    let Icon: React.ElementType | null = null;
    const firstChild = node.children[0];
    const text = typeof firstChild === "object" && "value" in firstChild
      ? String(firstChild.value).toLowerCase()
      : "";

    if (text.includes("visual observation")) Icon = ListChecks;
    else if (text.includes("potential diagnosis suggestion")) Icon = HelpCircle;
    else if (text.includes("general information")) Icon = Info;
    else if (text.includes("disclaimer")) Icon = AlertTriangle;

    return (
      <h2
        className="text-lg font-semibold text-foreground mt-6 mb-3 flex items-center gap-2 border-b border-border/60 pb-2"
        {...props}
      >
        {Icon && <Icon className="w-5 h-5 text-primary flex-shrink-0" />}
        {props.children}
      </h2>
    );
  },
  b: ({ node, ...props }) => {
    const child = node.children[0];
    const content = typeof child === "object" && "value" in child
      ? String(child.value)
      : "";
    const isDisclaimer = /AI Analysis Disclaimer:|This is NOT a confirmed diagnosis\.|This is general information and NOT treatment advice\./i.test(
      content
    );

    return (
      <strong
        className={`font-semibold ${
          isDisclaimer ? "text-destructive" : "text-foreground"
        }`}
        {...props}
      />
    );
  },
};

const Analyser: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState<"idle" | "analyzing" | "saving">("idle");
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [potentialDiagnosis, setPotentialDiagnosis] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      // reset if no file
      setSelectedImage(null);
      setImagePreview("");
      setAnalysisResult("");
      setPotentialDiagnosis(null);
      setLoading("idle");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a PNG, JPG, or WEBP image.",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Image size cannot exceed 10MB.",
      });
      return;
    }

    setSelectedImage(file);
    setAnalysisResult("");
    setPotentialDiagnosis(null);
    setLoading("idle");

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      } else {
        toast({
          variant: "destructive",
          title: "File Read Error",
          description: "Could not generate image preview.",
        });
        setImagePreview("");
      }
    };
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "Could not read the selected file.",
      });
      setImagePreview("");
    };
    reader.readAsDataURL(file);
  };

  const handleAnalysis = async () => {
    if (!selectedImage) {
      toast({
        variant: "destructive",
        title: "No Image Selected",
        description: "Please upload an image first.",
      });
      return;
    }
    if (!isGeminiAvailable()) {
      toast({
        variant: "destructive",
        title: "AI Not Available",
        description: hasGeminiApiKey()
          ? "AI model failed to initialize. Check console or API Key."
          : "Gemini API Key is missing. Please check environment variables.",
      });
      return;
    }
    if (!API_BASE_URL) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Backend API URL is not configured. Cannot save results.",
      });
      return;
    }

    setLoading("analyzing");
    setAnalysisResult("");
    setPotentialDiagnosis(null);

    try {
      const generatedAnalysis = await analyzeImageWithGemini(selectedImage);
      const diag = extractPotentialDiagnosis(generatedAnalysis);
      setAnalysisResult(generatedAnalysis);
      setPotentialDiagnosis(diag);
      setLoading("saving");

      const form = new FormData();
      form.append("skinImage", selectedImage);
      form.append(
        "analysisData",
        JSON.stringify({
          generatedAnalysis,
          potentialDiagnosis: diag,
          modelUsed: "gemini-1.5-flash",
          analysisTimestamp: new Date().toISOString(),
        })
      );

      const res = await fetch(`${API_BASE_URL}/api/analysis`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Save failed: ${res.status} ${txt}`);
      }

      setLoading("idle");
      toast({
        title: "Analysis Complete & Saved",
        description: "AI suggestion generated and the record has been saved.",
        action: <CheckCircle className="h-5 w-5 text-green-500" />,
        duration: 5000,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: msg,
        duration: 9000,
        action: <AlertTriangle className="h-5 w-5 text-destructive" />,
      });
      setLoading("idle");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  const isLoading = loading !== "idle";
  const buttonText =
    loading === "analyzing"
      ? "Analyzing Image..."
      : loading === "saving"
      ? "Saving Record..."
      : "Generate Analysis";
  const isAnalyzeDisabled =
    !selectedImage || isLoading || !isGeminiAvailable() || !API_BASE_URL;

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-8 p-4 md:p-8"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
          <Microscope className="w-8 h-8 text-primary" /> AI Skin Image Analyzer{" "}
          <span className="text-base font-medium text-orange-500 align-super">
            (Experimental)
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Upload a clear skin image for an AI visual analysis and{" "}
          <b className="text-foreground">experimental</b> condition suggestion.
          Results can be saved to your profile.
        </p>
      </motion.div>

      {/* Warning Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-destructive/10 border-destructive border-l-4 shadow-lg">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center text-xl">
              <AlertTriangle className="w-6 h-6 mr-2 flex-shrink-0" /> Critical
              Warning: Use Responsibly
            </CardTitle>
          </CardHeader>
          <CardContent className="text-destructive/90 text-base font-medium space-y-2">
            <p>This is an <b className="text-destructive">experimental AI tool</b>, not a medical device.</p>
            <p>Visual analysis alone is <b className="text-destructive">insufficient for diagnosis</b> and can be inaccurate.</p>
            <p><b className="text-destructive">NOT</b> a substitute for professional medical evaluation. <b className="text-destructive">Consult a qualified doctor/dermatologist</b> for any health concerns.</p>
            <p><b className="text-destructive">DO NOT</b> use this for self-diagnosis or treatment decisions.</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upload & Analyze */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden shadow-lg border border-border/60">
          <div className="grid md:grid-cols-2">
            {/* Upload */}
            <div className="p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border/60">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center mb-2">
                  <Upload className="w-6 h-6 mr-2 text-primary" /> 1. Upload Image
                </CardTitle>
                <CardDescription>Select a clear photo (PNG, JPG, WEBP, max 10MB).</CardDescription>
                <motion.div whileHover={{ scale: selectedImage && !isLoading ? 1 : 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} className="my-4">
                  <label htmlFor="image-upload" className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${imagePreview ? 'border-primary/70 bg-primary/5' : 'border-border hover:border-primary/40 bg-muted/20 hover:bg-muted/40'} ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} className="absolute inset-0 w-full h-full object-contain p-2" alt="Preview"/>
                        {!isLoading && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <p className="text-white font-semibold text-lg">Change Image</p>
                            <p className="text-white/80 text-xs mt-1">Click or drop new file</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                        <p><span className="text-primary font-semibold">Click to upload</span> or drag & drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP (Max 10MB)</p>
                      </div>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                  </label>
                </motion.div>
              </div>
              {!hasGeminiApiKey() && (
                <p className="text-xs text-destructive text-center mt-2 flex items-center justify-center">
                  <Info className="w-3 h-3 mr-1"/> Gemini API Key missing. Analysis disabled.
                </p>
              )}
              {hasGeminiApiKey() && !isGeminiAvailable() && (
                <p className="text-xs text-destructive text-center mt-2 flex items-center justify-center">
                  <AlertTriangle className="w-3 h-3 mr-1"/> AI Model init failed. Analysis disabled.
                </p>
              )}
              {!API_BASE_URL && (
                <p className="text-xs text-destructive text-center mt-2 flex items-center justify-center">
                  <Info className="w-3 h-3 mr-1"/> Backend URL missing. Saving disabled.
                </p>
              )}
            </div>

            {/* Analyze */}
            <div className="p-6 flex flex-col items-center justify-center bg-muted/20">
              <CardTitle className="text-xl font-semibold flex items-center mb-4">
                <Stethoscope className="w-6 h-6 mr-2 text-primary"/> 2. Get AI Suggestion
              </CardTitle>
              <CardDescription className="text-center mb-6">
                Click below to start the AI visual analysis and save the record to your profile.
              </CardDescription>
              <motion.div whileTap={{ scale: isLoading ? 1 : 0.97 }}>
                <Button
                  onClick={handleAnalysis}
                  className="w-full max-w-xs text-lg py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
                  size="lg"
                  disabled={isAnalyzeDisabled}
                  aria-label="Analyze uploaded image and save result"
                >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <FileText className="h-6 w-6"/>}
                  {buttonText}
                </Button>
              </motion.div>
              {imagePreview && !isLoading && (
                <div className="mt-6 text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Image ready:</p>
                  <img src={imagePreview} className="max-h-20 mx-auto rounded border border-border/60 shadow-sm" alt="Uploaded preview"/>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {(isLoading || analysisResult) && (
          <motion.div
            key="results-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="mt-10"
          >
            <Card className="border-border/60 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border/60 p-6">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary"/> 3. AI Analysis Results <span className="text-sm font-normal text-orange-500">(Experimental Suggestion)</span>
                </CardTitle>
                <CardDescription>
                  {loading === "analyzing"
                    ? "Generating visual analysis from Gemini AI..."
                    : loading === "saving"
                    ? "Saving analysis record to your profile..."
                    : "AI-generated analysis based on the uploaded image:"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-5" />
                    <p className="font-semibold text-lg">
                      {loading === "analyzing" ? "Processing & Analyzing Image..." : "Saving Record..."}
                    </p>
                    <p className="text-sm mt-1">Please wait, this may take a moment.</p>
                  </div>
                )}
                {!isLoading && analysisResult && (
                  <>
                    {potentialDiagnosis && (
                      <div className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-md shadow">
                        <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-blue-700 dark:text-blue-300"/>Potential Suggestion Highlight:
                        </h3>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 ml-7">{potentialDiagnosis}</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 ml-7 mt-1">Based on visual patterns only. See full details & limitations below.</p>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg text-foreground mb-2 flex items-center gap-2">
                        <Microscope className="w-5 h-5 text-primary"/> Analyzed Image:
                      </h3>
                      <img src={imagePreview} className="max-h-40 w-auto rounded border-2 border-border/80 shadow-md p-1 ml-7 bg-muted/20" alt="Analyzed skin image"/>
                    </div>
                    <div className="border-t border-border/60 pt-4">
                      <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary"/> Full AI Analysis Details:
                      </h3>
                      <div className="prose prose-base dark:prose-invert max-w-none
                                      prose-headings:text-foreground prose-headings:font-semibold
                                      prose-p:leading-relaxed prose-p:text-foreground/90
                                      prose-ul:list-disc prose-ul:pl-5 prose-ul:my-3 prose-li:my-1 prose-li:ml-2
                                      prose-strong:font-medium prose-strong:text-foreground
                                      prose-a:text-primary hover:prose-a:underline
                                      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
                                      prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:text-foreground/80">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={markdownComponents}
                        >
                          {analysisResult}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t-2 border-destructive/50">
                      <div className="p-5 rounded-lg border border-destructive bg-destructive/10 shadow-inner">
                        <h4 className="font-bold text-destructive mb-3 flex items-center text-lg">
                          <AlertTriangle className="w-6 h-6 mr-2"/>Crucial Reminder & Limitations
                        </h4>
                        <div className="text-sm text-destructive/95 font-medium space-y-2">
                          <p>This AI suggestion (<b className="text-destructive">{potentialDiagnosis || "shown above"}</b>) is <b className="text-destructive">EXPERIMENTAL</b> and derived <b className="text-destructive">ONLY</b> from visual data. It is <b className="text-destructive">NOT</b> a diagnosis.</p>
                          <p>AI can misinterpret images. Accuracy is <b className="text-destructive">NOT GUARANTEED</b>. Do <b className="text-destructive">NOT</b> use for medical decisions.</p>
                          <p><b className="text-destructive">ALWAYS consult a qualified healthcare professional</b> (e.g., dermatologist) for any skin concerns or before starting/stopping any treatment.</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Analyser;

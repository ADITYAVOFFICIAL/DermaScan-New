import React, { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
// import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Upload, Loader2, Info, CheckCircle, AlertTriangle, Microscope, FileText, Stethoscope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'; // <--- Import rehype-raw

// --- Environment Variable Handling ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
    console.warn("⚠️ Missing VITE_GEMINI_API_KEY in environment variables. AI features will be disabled.");
}
// --- ---

// Helper function to extract the potential diagnosis (Keep as is or refine regex if needed)
const extractPotentialDiagnosis = (text: string): string | null => {
    const match = text.match(/Potential suggestion based on visuals:\s*<b>(.*?)\.?<\/b>/i);
     if (match && match[1]) {
        // Check if the captured group itself contains markdown/html and clean it if necessary
        const potentialDiagnosis = match[1].trim().replace(/\.$/, '');
        // Basic cleanup example (might need more robust parsing depending on AI output)
        return potentialDiagnosis.replace(/<[^>]*>/g, ''); // Strip any remaining tags within the diagnosis name
    }
    // Add more fallbacks if needed
    return null;
};


const Analyser: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [loading, setLoading] = useState<'idle' | 'analyzing'>('idle');
    const [analysisResult, setAnalysisResult] = useState<string>(""); // Will store raw result from AI
    const [potentialDiagnosis, setPotentialDiagnosis] = useState<string | null>(null);
    const { toast } = useToast();

    const genAIClient = useMemo(() => API_KEY ? new GoogleGenerativeAI(API_KEY) : null, []);

    // Safety settings (keep commented out unless needed)
    /*
    const safetySettings = [ ... ];
    */

    const model = useMemo(() => genAIClient?.getGenerativeModel({
        model: "gemini-1.5-flash",
        // safetySettings: safetySettings
    }), [genAIClient]);

    // --- REFINED PROMPT (Use Markdown Headings, re-emphasize spacing) ---
    const generateImageAnalysisWithDiagnosis = async (
        imageFile: File
    ): Promise<string> => {
        if (!model) throw new Error("Generative AI client not initialized.");

        const fileToGenerativePart = async (file: File) => {
            // ... (Base64 conversion - no changes)
             const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    if (result && result.includes(',')) { resolve(result.split(',')[1]); }
                    else { reject(new Error("FileReader result format error.")); }
                };
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
            return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
        };

        const imagePart = await fileToGenerativePart(imageFile);

        // Prompt asking for Markdown Headings (##) and better spacing
        const prompt = `You are an AI assistant simulating a preliminary visual analysis for educational purposes. You CANNOT provide a medical diagnosis. Base your analysis SOLELY on the visual information in the image.

**Task:** Analyze the skin image and provide a potential condition suggestion based strictly on visual features.

**Output Structure (Use Markdown):**

## Visual Observations
*   Describe key visual characteristics (lesions, color, texture, distribution, etc.). Be objective and detailed. Use bullet points.
*   Ensure there is a blank line (double newline \`\\n\\n\`) before this heading and after the last bullet point.

## Potential Diagnosis Suggestion & Reasoning
*   State the most likely potential condition(s) suggested ONLY by the visuals. Use a phrase like: "Potential suggestion based on visuals: <b>Condition Name</b>." Use HTML <b> tags ONLY for the condition name itself or very specific inline emphasis where needed.
*   Explain how visual features support the suggestion(s). Use standard paragraphs.
*   Acknowledge ambiguity or visual overlap with other conditions if applicable.
*   State clearly: <b>This is NOT a confirmed diagnosis.</b>
*   Ensure there is a blank line (double newline \`\\n\\n\`) before this heading and after this section.

## General Information on Suggested Condition(s)
*   Provide 2-3 concise bullet points of general info about the primary suggested condition (common traits, affected areas).
*   State clearly: <b>This is general information and NOT treatment advice.</b>
*   Ensure there is a blank line (double newline \`\\n\\n\`) before this heading and after this section.

## Crucial Disclaimer
*   Include the following disclaimer text verbatim, ensuring it's preceded by a blank line:
    <b>AI Analysis Disclaimer:</b> This AI-generated analysis is HIGHLY EXPERIMENTAL AND FOR ILLUSTRATIVE PURPOSES ONLY. It is based SOLELY on visual patterns from the image and CANNOT replace a professional medical evaluation by a qualified healthcare provider (e.g., a dermatologist). Accuracy is not guaranteed. DO NOT use this information for self-diagnosis or making any treatment decisions. Misdiagnosis or delayed diagnosis can have serious consequences. Always consult a doctor for any health concerns.

**Formatting Constraints:**
*   Use Markdown Level 2 Headings (##) for section titles.
*   Use HTML <b> tags ONLY for inline emphasis (like condition names) or the required disclaimer labels. Do NOT use them for headings.
*   Crucially, use double newlines (\`\\n\\n\`) to create blank lines BETWEEN paragraphs, BETWEEN list items and surrounding text/headings, and BEFORE/AFTER each section heading to ensure proper visual separation.`;

        try {
            const result = await model.generateContent([prompt, imagePart]);
            const response = result.response;

            // ... (Safety/error checking as before)
            if (response.promptFeedback?.blockReason) { throw new Error(`Analysis blocked: ${response.promptFeedback.blockReason}.`); }
            const text = response.text();
            if (!text?.trim()) {
                 const finishReason = response.candidates?.[0]?.finishReason;
                 if (finishReason && finishReason !== 'STOP') { throw new Error(`Analysis stopped unexpectedly (${finishReason}).`);}
                 throw new Error("Received an empty analysis from the AI.");
            }
            // Return the raw text from AI. Formatting/rendering handled by ReactMarkdown + rehypeRaw.
            return text;

        } catch (error) {
            // ... (Error handling as before)
             console.error("Error generating analysis:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            if (errorMessage.includes('blocked') || errorMessage.includes('empty analysis') || errorMessage.includes('stopped unexpectedly')) { throw error; }
            throw new Error(`Analysis failed: ${errorMessage}`);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        // ... (No changes needed here, keep existing logic)
        const file = event.target.files?.[0];
        if (file) {
           if (!file.type.startsWith("image/")) { toast({ variant: "destructive", title: "Invalid File Type", description: "PNG, JPG, or WEBP only."}); return; }
           if (file.size > 10 * 1024 * 1024) { toast({ variant: "destructive", title: "File Too Large", description: "Max 10MB."}); return; }
           setSelectedImage(file);
           setAnalysisResult("");
           setPotentialDiagnosis(null);
           setLoading('idle');
           const reader = new FileReader();
           reader.onloadend = () => setImagePreview(reader.result as string);
           reader.onerror = (error) => { console.error("FileReader error:", error); toast({ variant: "destructive", title: "File Read Error" }); setImagePreview(""); };
           reader.readAsDataURL(file);
        }
    };

    const handleAnalysis = async () => {
        // ... (Validation logic as before)
         if (!selectedImage || !model) {
             toast({ variant: "destructive", title: !selectedImage ? "No Image" : "Initialization Error", description: !selectedImage ? "Upload an image." : "AI model unavailable." });
             return;
         }

        setLoading('analyzing');
        setAnalysisResult("");
        setPotentialDiagnosis(null);

        try {
            const rawAnalysis = await generateImageAnalysisWithDiagnosis(selectedImage);

            // 1. Extract potential diagnosis (from raw text is likely best)
            const diagnosis = extractPotentialDiagnosis(rawAnalysis);

            // 2. Set state (store the RAW analysis result)
            setAnalysisResult(rawAnalysis); // Store the raw Markdown/HTML mix
            setPotentialDiagnosis(diagnosis);

            setLoading('idle');
            toast({ title: "Suggestion Complete", description: "AI analysis suggestion is ready.", action: <CheckCircle className="h-5 w-5 text-green-500" /> });

        } catch (error: unknown) {
            // ... (Error handling as before)
            console.error("Analysis error:", error);
            const message = error instanceof Error ? error.message : "Unknown analysis error.";
            toast({ variant: "destructive", title: "Analysis Failed", description: message, duration: 9000, action: <AlertTriangle className="h-5 w-5 text-destructive" /> });
            setLoading('idle');
        }
    };

    // Animation Variants (Keep as is)
    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

    const isAnalyzing = loading === 'analyzing';

    // --- JSX with UI Improvements ---
    return (
        <motion.div
            className="max-w-4xl mx-auto space-y-8 p-4 md:p-8"
            initial="hidden" animate="show" variants={containerVariants}
        >
            {/* Header Section (Keep as is) */}
             <motion.div variants={itemVariants} className="text-center space-y-2 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                   <Microscope className="w-8 h-8 text-primary"/> AI Skin Image Analyzer <span className="text-base font-medium text-orange-500 align-super">(Experimental)</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Upload a clear skin image for an AI visual analysis and <b className="text-foreground">experimental</b> condition suggestion.
                </p>
            </motion.div>


            {/* High-Risk Warning (Keep as is) */}
             <motion.div variants={itemVariants}>
                 <Card className="bg-destructive/10 border-destructive border-l-4 shadow-lg">
                     <CardHeader>
                         <CardTitle className="text-destructive flex items-center text-xl">
                             <AlertTriangle className="w-6 h-6 mr-2 flex-shrink-0" /> Critical Warning: Use Responsibly
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

            {/* Combined Upload & Analyze Card (Keep as is) */}
             <motion.div variants={itemVariants}>
                 <Card className="overflow-hidden shadow-lg border border-border/60">
                    <div className="grid md:grid-cols-2 gap-0">
                         {/* Column 1: Upload Area (Keep as is) */}
                         <div className="p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border/60">
                             <div>
                                 <CardTitle className="text-xl font-semibold text-foreground flex items-center mb-2">
                                     <Upload className="w-6 h-6 mr-2 text-primary" /> 1. Upload Image
                                 </CardTitle>
                                 <CardDescription className="mb-4">Select a clear photo (PNG, JPG, WEBP, max 10MB).</CardDescription>
                                 <motion.div whileHover={{ scale: selectedImage && !isAnalyzing ? 1 : 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} className="mb-4">
                                     <label htmlFor="image-upload" className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out overflow-hidden group ${imagePreview ? 'border-primary/70 bg-primary/5' : 'border-border hover:border-primary/40 bg-muted/20 hover:bg-muted/40'} ${isAnalyzing ? 'cursor-not-allowed opacity-60 pointer-events-none' : ''}`}>
                                         {imagePreview ? ( <> <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2 z-0"/> {!isAnalyzing && (<div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 p-4"><p className="text-white font-semibold text-lg">Change Image</p><p className="text-white/80 text-xs mt-1">Click or drop new file</p></div>)} </>
                                         ) : ( <div className="flex flex-col items-center justify-center text-center p-4 z-10"><Upload className="w-12 h-12 text-muted-foreground mb-3 transition-transform group-hover:scale-110" /><p className="text-base text-foreground font-medium"><span className="text-primary font-semibold">Click to upload</span> or drag & drop</p><p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP (Max 10MB)</p></div> )}
                                         <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} disabled={isAnalyzing} />
                                     </label>
                                 </motion.div>
                             </div>
                             {!API_KEY && ( <p className="text-xs text-destructive text-center mt-2 flex items-center justify-center"><Info className="w-3 h-3 mr-1"/> API Key missing. Analysis disabled.</p> )}
                             {!model && API_KEY && ( <p className="text-xs text-destructive text-center mt-2 flex items-center justify-center"><AlertTriangle className="w-3 h-3 mr-1"/> AI Model init failed. Analysis disabled.</p> )}
                         </div>
                         {/* Column 2: Analyze Button (Keep as is) */}
                         <div className="p-6 flex flex-col items-center justify-center bg-muted/20">
                              <CardTitle className="text-xl font-semibold text-foreground flex items-center mb-4 text-center"><Stethoscope className="w-6 h-6 mr-2 text-primary"/> 2. Get AI Suggestion</CardTitle>
                              <CardDescription className="text-center mb-6">Click below to start the AI visual analysis.</CardDescription>
                              <motion.div whileTap={{ scale: isAnalyzing ? 1 : 0.97 }} className="w-full max-w-xs">
                                 <Button onClick={handleAnalysis} className="w-full text-lg py-3 h-auto rounded-lg shadow-lg transition-all font-semibold flex items-center justify-center gap-2" size="lg" disabled={!selectedImage || isAnalyzing || !model} aria-label="Analyze uploaded image">
                                     {isAnalyzing ? ( <> <Loader2 className="h-6 w-6 animate-spin" /> Analyzing... </> ) : ( <> <FileText className="h-6 w-6" /> Generate Analysis </> )}
                                 </Button>
                              </motion.div>
                              {imagePreview && !isAnalyzing && ( <div className="mt-6 text-center"><p className="text-sm font-medium text-muted-foreground mb-2">Image ready:</p><img src={imagePreview} alt="Uploaded preview" className="max-h-20 mx-auto rounded border border-border/60 shadow-sm bg-white" /></div> )}
                         </div>
                     </div>
                 </Card>
             </motion.div>


            {/* Results Section - Enhanced Layout & Rendering */}
            <AnimatePresence>
                {(isAnalyzing || analysisResult) && (
                    <motion.div
                        key="results-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="mt-10"
                    >
                        <Card className="border-border/60 shadow-lg overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border/60 p-6">
                                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-primary"/>
                                    3. AI Analysis Results <span className="text-sm font-normal text-orange-500">(Experimental Suggestion)</span>
                                </CardTitle>
                                <CardDescription>
                                    {isAnalyzing ? "Generating visual analysis..." : "AI-generated analysis based on the uploaded image:"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8 space-y-6">
                                {/* Loader (Keep as is) */}
                                {isAnalyzing && (
                                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-5" />
                                        <p className="font-semibold text-lg">Processing & Analyzing Image...</p>
                                        <p className="text-sm mt-1">Please wait.</p>
                                    </div>
                                )}

                                {/* Analysis Content */}
                                {analysisResult && !isAnalyzing && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-6" >

                                        {/* Section 1: Extracted Potential Diagnosis (Improved Styling) */}
                                        {potentialDiagnosis && (
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-md shadow">
                                                <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                                                     <Stethoscope className="w-5 h-5 text-blue-700 dark:text-blue-300"/>Potential Suggestion Highlight:
                                                </h3>
                                                {/* Display the extracted diagnosis */}
                                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 ml-7">{potentialDiagnosis}</p>
                                                <p className="text-xs text-blue-700 dark:text-blue-300 ml-7 mt-1">Based on visual patterns only. See full details & limitations below.</p>
                                            </div>
                                        )}

                                        {/* Section 2: Analyzed Image Thumbnail (Keep as is) */}
                                        {imagePreview && (
                                            <div className="pt-2">
                                                <h3 className="font-semibold text-lg text-foreground mb-2">Analyzed Image:</h3>
                                                <img src={imagePreview} alt="Analyzed skin image" className="max-h-40 w-auto rounded border-2 border-border/80 shadow-md bg-muted/20 p-1" />
                                            </div>
                                        )}

                                        {/* Section 3: Full AI Analysis Details (Rendered with rehype-raw) */}
                                        <div>
                                            <h3 className="font-semibold text-lg text-foreground mb-3 border-b pb-2 border-border/60">Full AI Analysis Details:</h3>
                                            {/* **KEY CHANGE**: Added rehypePlugins={[rehypeRaw]} */}
                                            {/* Ensure prose classes handle spacing correctly */}
                                            <div className="prose prose-base dark:prose-invert max-w-none text-foreground/95
                                                            prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-3 {/* Increased heading margin */}
                                                            prose-p:my-3 {/* Paragraph margin */}
                                                            prose-ul:my-4 prose-li:my-1.5 {/* List margins */}
                                                            prose-b:text-foreground prose-b:font-semibold {/* Ensure b tags look right */}
                                                            ">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    rehypePlugins={[rehypeRaw]} // <--- USE REHYPE-RAW HERE
                                                >
                                                    {analysisResult /* Render the RAW result */}
                                                </ReactMarkdown>
                                            </div>
                                        </div>

                                        {/* Section 4: Final Critical Reminder (Keep as is) */}
                                         <div className="mt-8 pt-6 border-t-2 border-destructive/50">
                                             <div className="p-5 rounded-lg border border-destructive bg-destructive/10 shadow-inner">
                                                 <h4 className="font-bold text-destructive mb-3 flex items-center text-lg">
                                                     <AlertTriangle className="w-6 h-6 mr-2 flex-shrink-0"/>Crucial Reminder & Limitations
                                                 </h4>
                                                 <div className="text-sm text-destructive/95 font-medium space-y-2">
                                                     <p>This AI suggestion (<b className="text-destructive">{potentialDiagnosis || "shown above"}</b>) is <b className="text-destructive">EXPERIMENTAL</b> and derived <b className="text-destructive">ONLY</b> from visual data. It is <b className="text-destructive">NOT</b> a diagnosis.</p>
                                                     <p>AI can misinterpret images. Accuracy is <b className="text-destructive">NOT GUARANTEED</b>. Do <b className="text-destructive">NOT</b> use for medical decisions.</p>
                                                     <p><b className="text-destructive">ALWAYS consult a qualified healthcare professional</b> (e.g., dermatologist) for any skin concerns or before starting/stopping any treatment.</p>
                                                 </div>
                                             </div>
                                         </div>
                                    </motion.div>
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
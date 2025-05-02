import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// --- Environment Variable Handling ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("⚠️ Missing VITE_GEMINI_API_KEY in environment variables. AI features will be disabled.");
    // Optionally throw an error or handle this case more explicitly depending on requirements
    // throw new Error("Missing VITE_GEMINI_API_KEY environment variable.");
}

// --- AI Client and Model Initialization ---
const genAIClient = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const model = genAIClient?.getGenerativeModel({
    model: "gemini-2.0-flash",
    // Optional: Configure safety settings if needed
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
});

// --- Helper Function to Convert File to GenerativePart ---
// Removed GenerativePart type annotation as it's not directly exported
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Ensure result is a data URL and extract base64 part
            if (result && result.startsWith('data:') && result.includes(',')) {
                resolve(result.split(',')[1]);
            } else {
                reject(new Error("FileReader result format error or empty."));
            }
        };
        reader.onerror = (error) => reject(error); // Handle file reading errors
        reader.readAsDataURL(file); // Read file as Base64 Data URL
    });
    // Return the structure expected by Gemini API
    // TypeScript will infer the return type { inlineData: { data: string, mimeType: string } }
    return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
};

// --- Gemini Analysis Function ---
/**
 * Analyzes a skin image using the Gemini AI model and returns the raw analysis text.
 * @param imageFile The image file to analyze.
 * @returns A promise that resolves with the raw Markdown/HTML string from Gemini.
 * @throws An error if the AI client is not initialized, the analysis is blocked,
 *         or any other error occurs during the generation process.
 */
export const analyzeImageWithGemini = async (
    imageFile: File
): Promise<string> => {
    if (!model) {
        throw new Error("Generative AI client not initialized. Check API Key.");
    }

    // Convert the selected image file
    const imagePart = await fileToGenerativePart(imageFile);

    // The detailed prompt for Gemini
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
        // Send the prompt and image part to the Gemini model
        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;

        // Check if the response was blocked due to safety filters
        if (response.promptFeedback?.blockReason) {
            throw new Error(`Analysis blocked by safety filter: ${response.promptFeedback.blockReason}. Consider adjusting safety settings or image content.`);
        }

        // Extract the generated text
        const text = response.text();

        // Check if the response text is empty or only whitespace
        if (!text?.trim()) {
             const finishReason = response.candidates?.[0]?.finishReason;
             // Provide more context if the generation stopped unexpectedly
             if (finishReason && finishReason !== 'STOP') {
                 throw new Error(`Analysis stopped unexpectedly (${finishReason}). May be due to safety settings, input issues, or model limitations.`);
             }
             // Generic error for empty response
             throw new Error("Received an empty analysis from the AI. The model might not have been able to process the request.");
        }

        return text; // Return the raw Markdown/HTML mix string

    } catch (error) {
         console.error("Error generating analysis with Gemini:", error);
        // Format error message for better user feedback
        const errorMessage = error instanceof Error ? error.message : "Unknown AI generation error";
        // Re-throw specific, actionable errors
        if (errorMessage.includes('blocked') || errorMessage.includes('empty analysis') || errorMessage.includes('stopped unexpectedly')) {
            throw error;
        }
        if (errorMessage.includes('API key not valid')) {
             throw new Error("Invalid Gemini API Key. Please check your VITE_GEMINI_API_KEY environment variable.");
        }
        // Fallback generic error
        throw new Error(`AI analysis failed: ${errorMessage}. Please try again or check the console for details.`);
    }
};

// --- Utility function to check if the Gemini model is available ---
export const isGeminiAvailable = (): boolean => {
    return !!model;
};

// --- Utility function to check if the API key is present ---
export const hasGeminiApiKey = (): boolean => {
    return !!API_KEY;
};
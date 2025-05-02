// src/lib/geminiChat.ts
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
    Content,
    GenerateContentRequest
} from "@google/generative-ai";

// Assume ChatMessage interface is defined elsewhere or here
interface ChatMessage { id: string; sender: 'user' | 'bot'; text: string; timestamp: number; }

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.5-flash-latest"; // Use latest alias

let genAI: GoogleGenerativeAI | null = null;

// --- Updated System Instruction ---
const DERMASCAN_SYSTEM_INSTRUCTION = `You are DermaScan AI, a specialized AI assistant focused on dermatology, skin health, and related topics. Your purpose is to provide general information about skin conditions, skincare ingredients, routines, and common questions related to skin health.

**User Context:** You may be provided with relevant snippets of the user's profile information (like skin type or allergies) or analysis history *by the application* to help answer specific questions. Do NOT ask the user directly for sensitive personal details you haven't been provided.

**Crucially, you must adhere to the following guidelines:**
1.  **Disclaimer:** Always prioritize user safety. Include a clear disclaimer in your first response and when discussing conditions/symptoms: "Remember, I am an AI assistant and cannot provide medical advice or diagnosis. My responses are for informational purposes only. Please consult a qualified healthcare professional (like a dermatologist) for any personal health concerns."
2.  **No Diagnosis:** Do NOT attempt to diagnose. Discuss conditions generally and always advise professional consultation for personal issues.
3.  **General Information:** Focus on general knowledge about dermatology and skin health.
4.  **Professional Advice:** Do NOT recommend specific prescription treatments. Mention treatment *types* cautiously and defer to doctors.
5.  **Responsible Tone:** Be helpful, informative, cautious, and responsible. Acknowledge AI limitations.
6.  **Scope:** Stick to dermatology, skin health, skincare. Politely decline unrelated questions.
7.  **Privacy:** Do not request unnecessary personal information. If provided with context (like allergies), use it only for the direct question asked.

Start the conversation by introducing yourself briefly and including the disclaimer.`;

// --- Initialize Gemini AI ---
if (!API_KEY) {
    console.warn(`⚠️ Gemini API Key (VITE_GEMINI_API_KEY) is missing.`);
} else {
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
    } catch (error) {
        console.error("🚨 Failed to initialize GoogleGenerativeAI:", error);
    }
}

// --- Model Configuration ---
const generationConfig = { temperature: 0.7, topK: 1, topP: 0.95, maxOutputTokens: 2048 };
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/** Formats chat history for the Gemini API. */
const formatHistoryForGemini = (messages: ChatMessage[]): Content[] => {
    // ... (Keep the previous corrected version of this function)
    let conversation = messages.filter(msg => msg.sender === 'user' || msg.sender === 'bot');
    const firstUserIndex = conversation.findIndex(msg => msg.sender === 'user');
    if (firstUserIndex === -1) return [];
    if (firstUserIndex > 0) conversation = conversation.slice(firstUserIndex);

    const formatted: Content[] = [];
    let lastRole: 'user' | 'model' | null = null;
    for (const msg of conversation) {
        const currentRole = msg.sender === 'bot' ? 'model' : 'user';
        if (currentRole !== lastRole) {
             formatted.push({ role: currentRole, parts: [{ text: msg.text }] });
             lastRole = currentRole;
        } else {
            console.warn(`Skipping consecutive message from ${currentRole}`);
        }
    }
    return formatted;
};

/** Sends a message to the Gemini model with DermaScan AI persona. */
export const sendMessageToGemini = async (prompt: string, history: ChatMessage[]): Promise<string> => {
    if (!genAI) return "Sorry, the chat service is currently unavailable (Configuration Error).";
    if (!prompt) return "Please enter a message.";

    try {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: { role: "system", parts: [{ text: DERMASCAN_SYSTEM_INSTRUCTION }] },
            safetySettings,
            generationConfig,
        });

        const formattedHistory = formatHistoryForGemini(history);
        const chat = model.startChat({ history: formattedHistory });

        console.log("Sending to Gemini (DermaScan):", { prompt, history: formattedHistory });

        const result = await chat.sendMessage(prompt); // Send the potentially augmented prompt
        const response = result.response;

        // ... (Keep the previous response handling and error checking)
        if (response.promptFeedback?.blockReason) {
            console.warn("Gemini request blocked:", response.promptFeedback.blockReason);
            return `I cannot respond due to safety settings (${response.promptFeedback.blockReason}). Please rephrase.`;
        }
        if (!response.text) {
            console.warn("Gemini response missing text content.", response);
             if (response.candidates && response.candidates.length > 0 && !response.candidates[0].content) {
                 return "Sorry, I couldn't generate a response. It might be due to safety filters. Please try again or rephrase.";
             }
            return "Sorry, I received an empty or incomplete response. Please try again.";
        }
        const responseText = response.text();
        console.log("Received from Gemini (DermaScan):", responseText);
        return responseText;

    } catch (error: unknown) {
        // ... (Keep the previous error handling)
        console.error("🚨 Error sending message to Gemini:", error);
        if (error instanceof Error) {
             if (error.message.includes('API key not valid')) return "Chat service config error (Invalid API Key). Contact support.";
             if (error.message.toLowerCase().includes('quota')) return "Chat service busy (Quota Exceeded). Try again later.";
             if (error.message.includes('400')) return `Request issue. Simplify query or check input. (${error.message})`;
             return `Error getting response: ${error.message}`;
        }
        return "Unknown error getting response.";
    }
};

/** Checks if the Gemini API seems to be configured. */
export const isGeminiConfigured = (): boolean => !!genAI;
// src/components/Chatbot.tsx
import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, X, Send, Bot, User as UserIcon, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendMessageToGemini, isGeminiConfigured } from '@/lib/geminiChat';
import { AuthContext } from '@/context/AuthContext'; // Assuming you have AuthContext
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns'; // For formatting dates
import ReactMarkdown from 'react-markdown'; // Import Markdown renderer
import remarkGfm from 'remark-gfm'; // Import GFM plugin for tables, etc.

// --- Type Definitions ---
interface ChatMessage { id: string; sender: 'user' | 'bot'; text: string; timestamp: number; }
interface AnalysisResultObject { generatedAnalysis?: string; potentialDiagnosis?: string | null; modelUsed?: string; analysisTimestamp?: string; error?: string; [key: string]: unknown; }
interface AnalysisHistoryItem { _id: string; analysisDate: string; results: AnalysisResultObject | string | null; imagePath: string; }
interface UserProfileContextData { firstName?: string; skinType?: string; allergies?: string; skinConditions?: string; }
interface AuthContextType { user: UserProfileContextData | null; isAuthenticated: boolean; }

// --- API Fetcher Function ---
const fetchAnalysisHistory = async (): Promise<AnalysisHistoryItem[]> => { /* ... same as before ... */
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
    if (!API_BASE_URL) throw new Error("API URL not configured.");
    const response = await fetch(`${API_BASE_URL}/api/analysis`, { method: 'GET', credentials: 'include', headers: { 'Accept': 'application/json' } });
    if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized.");
        const errorData = await response.json().catch(() => ({ msg: `HTTP error ${response.status}` }));
        throw new Error(errorData.msg || `Failed to fetch history (${response.status})`);
    }
    return response.json();
};

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'welcome-1', sender: 'bot', text: "Hello! I'm DermaScan AI. I can provide general information about skin health and dermatology topics. How can I help you today?\n\n**Remember, I am an AI and cannot provide medical advice or diagnosis. Please consult a qualified healthcare professional for personal health concerns.**", timestamp: Date.now() },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const auth = useContext(AuthContext);
    const queryClient = useQueryClient();

    // --- Fetch Analysis History ---
    const { data: analysisHistory, isLoading: isLoadingHistory, error: historyError, refetch: refetchHistory } = useQuery<AnalysisHistoryItem[], Error>({
        queryKey: ['analysisHistory'],
        queryFn: fetchAnalysisHistory,
        enabled: isOpen && !!auth?.isAuthenticated, // Fetch only when open and logged in
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    // --- Config Check ---
    useEffect(() => {
        if (!isGeminiConfigured()) {
            const configErrorMsg = "Chat service unavailable (config error).";
            setError(configErrorMsg);
            setMessages((prev) => prev.some(msg => msg.id === 'error-config') ? prev : [...prev, { id: 'error-config', sender: 'bot', text: "Chat assistant configuration error. Contact support.", timestamp: Date.now() }]);
        }
    }, []);

    // --- Scroll Logic ---
    useEffect(() => {
        if (isOpen) setTimeout(scrollToBottom, 150); // Slightly longer timeout for smoother scroll after render
    }, [messages, isOpen]);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });

    // --- Event Handlers ---
    const toggleChat = () => setIsOpen(!isOpen);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value);

    // --- Context Injection (Example) ---
    const preparePromptWithContext = (userPrompt: string, userProfile: UserProfileContextData | null, historyData: AnalysisHistoryItem[] | undefined): string => {
        let contextualPrompt = userPrompt;
        const lowerCasePrompt = userPrompt.toLowerCase();
        // Basic keyword checks (improve for production)
        if (userProfile?.skinType && (lowerCasePrompt.includes('my skin type'))) {
            contextualPrompt += `\n\n[User Context: Skin Type: ${userProfile.skinType}]`;
        }
        if (userProfile?.allergies && (lowerCasePrompt.includes('my allergies'))) {
            contextualPrompt += `\n\n[User Context: Allergies: ${userProfile.allergies}]`;
        }
        if (historyData?.[0] && (lowerCasePrompt.includes('last analysis'))) {
            const last = historyData[0];
            let summary = `Date: ${format(new Date(last.analysisDate), 'PP')}`;
            if (typeof last.results === 'object' && last.results?.potentialDiagnosis) summary += `, Suggestion: ${last.results.potentialDiagnosis}`;
            contextualPrompt += `\n\n[User Context: Last Analysis Summary: ${summary}]`;
        }
        if (contextualPrompt !== userPrompt) console.log("Augmented prompt:", contextualPrompt);
        return contextualPrompt;
    };

    // --- Send Message Handler ---
    const handleSendMessage = useCallback(async () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading || !isGeminiConfigured()) return;

        const newUserMessage: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', text: trimmedInput, timestamp: Date.now() };
        const historyForApi = [...messages];
        const promptToSend = preparePromptWithContext(trimmedInput, auth?.user as UserProfileContextData ?? null, analysisHistory);

        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            const botText = await sendMessageToGemini(promptToSend, historyForApi);
            const newBotMessage: ChatMessage = { id: `bot-${Date.now()}`, sender: 'bot', text: botText, timestamp: Date.now() };
            setMessages((prev) => [...prev, newBotMessage]);
        } catch (err) {
            console.error("Error in handleSendMessage callback:", err);
            const errorMsg = err instanceof Error ? err.message : "Unexpected error.";
            setError(errorMsg); // Keep track of send errors if needed
            setMessages((prev) => [...prev, { id: `error-${Date.now()}`, sender: 'bot', text: `Sorry, error sending message: ${errorMsg}`, timestamp: Date.now() }]);
        } finally {
            setIsLoading(false);
        }
    }, [inputValue, isLoading, messages, auth?.user, analysisHistory]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    };

    // --- Animation & State ---
    const fabVariants = { hidden: { scale: 0, opacity: 0, y: 50 }, visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } } };
    const chatWindowVariants = { hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } }, exit: { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.15, ease: 'easeIn' } } };
    const messageVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
    const isChatDisabled = !isGeminiConfigured();

    return (
        <>
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={chatWindowVariants} initial="hidden" animate="visible" exit="exit"
                        className="fixed bottom-[calc(4rem+1.5rem)] right-4 sm:right-5 z-50 w-[95vw] max-w-md" // Adjusted width slightly for small screens
                        aria-modal="true" role="dialog" aria-labelledby="chatbot-title"
                    >
                        <Card className="h-[70vh] sm:h-[65vh] max-h-[650px] flex flex-col shadow-xl border dark:border-slate-700/80 bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
                            {/* Improved Header */}
                            <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 border-b dark:border-slate-700/80 flex-shrink-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/70 dark:to-slate-800/90">
                                <CardTitle id="chatbot-title" className="text-base sm:text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                    <Bot className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                                    DermaScan AI Chat
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100" aria-label="Close chat">
                                    <X className="h-5 w-5" />
                                </Button>
                            </CardHeader>

                            {/* Improved Content Area */}
                            <CardContent className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50 relative">
                                {/* Config Error Display */}
                                {error && !isLoading && messages.some(m => m.id === 'error-config') && (
                                    <motion.div variants={messageVariants} className="sticky top-0 z-10 flex items-center gap-2 p-2 rounded-md bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 text-xs shadow-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                {/* History Loading/Error Display - Centered */}
                                {auth?.isAuthenticated && (isLoadingHistory || historyError) && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm z-10 p-4">
                                        {isLoadingHistory ? (
                                            <>
                                                <Loader2 className="h-6 w-6 animate-spin text-sky-600 dark:text-sky-400 mb-2" />
                                                <p className="text-sm text-slate-600 dark:text-slate-400">Loading history...</p>
                                            </>
                                        ) : historyError ? (
                                            <div className="text-center">
                                                <AlertCircle className="h-6 w-6 text-red-500 mb-2 mx-auto" />
                                                <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading history:</p>
                                                <p className="text-xs text-red-500 dark:text-red-500 mb-3">{historyError.message}</p>
                                                <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => refetchHistory()}>
                                                    <RefreshCw className="h-3 w-3 mr-1" /> Retry
                                                </Button>
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                {/* Message List */}
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        variants={messageVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className={cn('flex flex-col', message.sender === 'user' ? 'items-end' : 'items-start')}
                                    >
                                        <div className={cn(
                                            'flex items-end gap-2 max-w-[85%] sm:max-w-[80%]',
                                            message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                                        )}>
                                            {/* Avatar */}
                                            <div className={cn("flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mb-1", message.sender === 'bot' ? 'bg-sky-100 dark:bg-sky-900' : 'bg-slate-200 dark:bg-slate-700')}>
                                                {/* Use the renamed UserIcon */}
                                                {message.sender === 'bot' ? <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 dark:text-sky-400" /> : <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300" />}
                                            </div>
                                            {/* Message Bubble with Markdown */}
                                            <div className={cn(
                                                'p-2 sm:p-2.5 rounded-lg shadow-sm text-sm leading-relaxed',
                                                message.sender === 'user'
                                                    ? 'bg-sky-600 text-white rounded-br-none'
                                                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border dark:border-slate-600/50 rounded-bl-none'
                                            )}>
                                                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1"> {/* Apply prose styles to wrapper */}
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{ // Customize rendering if needed
                                                            p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />, // Add spacing between paragraphs
                                                            a: ({ node, ...props }) => <a className="text-sky-600 dark:text-sky-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                                        }}
                                                    >
                                                        {message.text}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Timestamp */}
                                        <p className={cn(
                                            "text-xs text-slate-400 dark:text-slate-500 mt-1",
                                            message.sender === 'user' ? 'mr-8 sm:mr-9' : 'ml-8 sm:ml-9' // Align timestamp roughly under bubble
                                        )}>
                                            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                        </p>
                                    </motion.div>
                                ))}

                                {/* Loading Indicator */}
                                {isLoading && (
                                    <motion.div variants={messageVariants} className="flex items-end gap-2 max-w-[85%] mr-auto">
                                        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-sky-100 dark:bg-sky-900 mb-1"><Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" /></div>
                                        <div className="p-2.5 rounded-lg shadow-sm bg-white dark:bg-slate-700 border dark:border-slate-600/50 rounded-bl-none"><Loader2 className="w-5 h-5 animate-spin text-slate-500 dark:text-slate-400" /></div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </CardContent>

                            {/* Improved Footer */}
                            <CardFooter className="p-2 sm:p-3 border-t dark:border-slate-700/80 flex-shrink-0 bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex w-full items-center space-x-2">
                                    <Input
                                        type="text"
                                        placeholder={isChatDisabled ? "Chat unavailable..." : "Ask about skin health..."}
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        disabled={isLoading || isChatDisabled}
                                        className="flex-1 h-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus-visible:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                        aria-label="Chat input"
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isLoading || isChatDisabled}
                                        className="w-10 h-10 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                                        aria-label="Send message"
                                    >
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button (FAB) */}
            <motion.div
                variants={fabVariants} initial="hidden" animate="visible" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                className="fixed bottom-5 right-5 z-40"
            >
                <Button
                    size="lg"
                    className="rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-lg bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white flex items-center justify-center"
                    onClick={toggleChat}
                    aria-label={isOpen ? 'Close chat' : 'Open chat'}
                >
                    {isOpen ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />}
                </Button>
            </motion.div>
        </>
    );
};

export default Chatbot;
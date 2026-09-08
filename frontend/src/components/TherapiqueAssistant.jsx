import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { isValidRoute } from '../data/assistantDataBridge';

// ═══════════════════════════════════════════════════════════════════════════
// QUICK START SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════
const QUICK_START_QUESTIONS = [
    "What is Therapique?",
    "What is CBT?",
    "Which specialists do you offer?",
    "Find books about mental health",
    "How do I book an appointment?",
];

// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// TYPING INDICATOR
// ═══════════════════════════════════════════════════════════════════════════
const TypingIndicator = () => (
    <div className="flex items-start gap-2.5 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#2D241E] to-[#43372F] flex items-center justify-center shrink-0 mt-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EADBCE]" />
        </div>
        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#EADBCE]/80">
            <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#9C8B7A]"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                    />
                ))}
            </div>
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// ACTION BUTTON — navigates to real Therapique routes
// ═══════════════════════════════════════════════════════════════════════════
const ActionButton = ({ label, route, type, onClick }) => {
    // Double-validate route on the frontend too
    if (!isValidRoute(route)) return null;

    const isPrimary = type === 'primary';

    return (
        <button
            onClick={() => onClick(route)}
            className={`
                inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
                transition-all duration-200 cursor-pointer text-left
                ${isPrimary
                    ? 'bg-[#2D241E] text-white hover:bg-[#43372F] shadow-sm hover:shadow-md'
                    : 'bg-[#F7EFE9] text-[#2D241E] hover:bg-[#EADBCE] border border-[#EADBCE]'
                }
            `}
        >
            <span>{label}</span>
            <ArrowRight className="w-3 h-3 shrink-0 opacity-80" />
        </button>
    );
};

// Helper to parse markdown bold formatting (**text**) safely into react nodes
const formatLineText = (text, keyPrefix) => {
    if (!text || !text.includes('**')) {
        return text;
    }
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return (
                <strong key={`${keyPrefix}-${idx}`} className="font-semibold text-inherit">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return part;
    });
};

// Helper to normalize and render text paragraphs safely
const renderFormattedContent = (content, isUser = false) => {
    if (!content || typeof content !== 'string') return null;

    let sanitized = content.trim();

    // Safety defense: If raw JSON string was passed, extract the human text field
    if (sanitized.startsWith('{') && sanitized.endsWith('}')) {
        try {
            const parsed = JSON.parse(sanitized);
            if (parsed && typeof parsed.text === 'string') {
                sanitized = parsed.text;
            }
        } catch (_) {}
    }

    // Normalize any literal "\\n" strings into real newlines
    const normalized = sanitized
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, ' ')
        .trim();

    // Split into paragraphs by double newlines
    const paragraphs = normalized.split(/\n\s*\n/);

    return paragraphs.map((paragraph, pIdx) => {
        const lines = paragraph.split('\n');
        return (
            <p key={pIdx} className={`last:mb-0 ${isUser ? 'text-white leading-snug mb-1.5' : 'text-[#2D241E] leading-[1.65] mb-3.5'}`}>
                {lines.map((line, lIdx) => (
                    <React.Fragment key={lIdx}>
                        {lIdx > 0 && <br />}
                        {formatLineText(line, `${pIdx}-${lIdx}`)}
                    </React.Fragment>
                ))}
            </p>
        );
    });
};

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE BUBBLE
// ═══════════════════════════════════════════════════════════════════════════
const MessageBubble = ({ message, onActionClick }) => {
    const isUser = message.role === 'user';

    if (isUser) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full flex justify-end"
            >
                <div className="max-w-[75%] sm:max-w-[70%]">
                    <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#2D241E] text-white text-[13px] sm:text-[13.5px] font-medium leading-snug rounded-2xl rounded-tr-xs shadow-sm">
                        {renderFormattedContent(message.content, true)}
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full flex items-start gap-3"
        >
            {/* Avatar for Assistant - top aligned */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#2D241E] to-[#43372F] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EADBCE]" />
            </div>

            <div className="max-w-[88%] sm:max-w-[85%] min-w-0 flex-1">
                {/* Bubble */}
                <div className="px-4 sm:px-4.5 py-3.5 sm:py-4 bg-white text-[#2D241E] text-[13.5px] sm:text-[14px] leading-[1.65] rounded-2xl rounded-tl-xs shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#EADBCE]/80">
                    {renderFormattedContent(message.content, false)}
                </div>

                {/* Action buttons (distinct 12-14px gap below assistant message) */}
                {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 mt-3.5">
                        {message.actions.map((action, i) => (
                            <ActionButton
                                key={i}
                                label={action.label}
                                route={action.route}
                                type={action.type}
                                onClick={onActionClick}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const TherapiqueAssistant = () => {
    const navigate = useNavigate();
    const { backendUrl } = useContext(AppContext);

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasShownWelcome, setHasShownWelcome] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const abortControllerRef = useRef(null);
    const messagesRef = useRef(messages);
    messagesRef.current = messages;

    // Auto-scroll strictly within the chat container without jumping page
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isLoading]);

    // Focus input when panel opens & cleanup on unmount
    useEffect(() => {
        if (isOpen && inputRef.current) {
            const timer = setTimeout(() => inputRef.current?.focus(), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Abort in-flight requests on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Show welcome message on first open
    useEffect(() => {
        if (isOpen && !hasShownWelcome) {
            setMessages([{
                role: 'assistant',
                content: "Hi! I'm the Therapique Assistant.\n\nI can help you learn about our therapy specialties, find specialists, explore our Blog & Library, or guide you through booking an appointment.\n\nWhat would you like to know?",
                actions: [],
            }]);
            setHasShownWelcome(true);
        }
    }, [isOpen, hasShownWelcome]);

    // Send message to backend
    const sendMessage = useCallback(async (text) => {
        if (!text || text.trim().length === 0 || isLoading) return;

        const userMessage = { role: 'user', content: text.trim() };
        const updatedMessages = [...messagesRef.current, userMessage];

        setMessages(updatedMessages);
        setInputValue('');
        setError(null);
        setIsLoading(true);

        // Cancel any pending previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const apiMessages = updatedMessages
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .map(m => ({ role: m.role, content: m.content }));

            const response = await fetch(`${backendUrl}/api/assistant/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'bypass-tunnel-reminder': 'true',
                },
                body: JSON.stringify({ messages: apiMessages }),
                signal: controller.signal
            });

            if (response.status === 429) {
                setError('You\'re sending messages too quickly. Please wait a moment.');
                return;
            }

            if (response.status === 504) {
                setError('The assistant is taking longer than expected. Please try again.');
                return;
            }

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.response) {
                const validatedActions = (data.response.actions || []).filter(a =>
                    a && typeof a.label === 'string' && isValidRoute(a.route)
                );

                const assistantMessage = {
                    role: 'assistant',
                    content: data.response.text || "I'm sorry, I couldn't process that. Could you try rephrasing?",
                    actions: validatedActions,
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                return; // Silently handle intended abortion
            }
            console.log('Assistant error:', err);
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                setError("Can't reach the server. Please check your connection.");
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, backendUrl]);

    // Handle action button click — navigate to the route
    const handleActionClick = useCallback((route) => {
        if (!isValidRoute(route)) return;
        setIsOpen(false);
        navigate(route);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [navigate]);

    // Handle form submit
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        sendMessage(inputValue);
    }, [sendMessage, inputValue]);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputValue);
        }
    }, [sendMessage, inputValue]);

    // Handle quick start click
    const handleQuickStart = useCallback((question) => {
        sendMessage(question);
    }, [sendMessage]);

    // Show quick starts only when there's just the welcome message
    const showQuickStarts = messages.length <= 1 && !isLoading;

    return (
        <>
            {/* ═══════════════════════════════════════════════════════════════
                FLOATING BUTTON
            ═══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        aria-label="Open Therapique Assistant"
                        id="therapique-assistant-button"
                        className="
                            fixed z-50 cursor-pointer
                            bottom-5 right-5 sm:bottom-7 sm:right-7
                            w-13 h-13 sm:w-14 sm:h-14
                            rounded-2xl
                            bg-gradient-to-br from-[#322A24] to-[#4A3F37]
                            text-[#EADBCE]
                            shadow-[0_8px_32px_rgba(50,42,36,0.35)]
                            hover:shadow-[0_12px_40px_rgba(50,42,36,0.5)]
                            flex items-center justify-center
                            border border-[#5A4F47]/50
                            transition-shadow duration-300
                            group
                        "
                    >
                        <MessageCircle className="w-5.5 h-5.5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                        {/* Subtle ping animation */}
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3">
                            <span className="absolute inset-0 rounded-full bg-[#81C784] animate-ping opacity-75" />
                            <span className="relative block w-3 h-3 rounded-full bg-[#81C784] border border-white/40" />
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════════════
                CHAT PANEL
            ═══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="
                            fixed z-50
                            bottom-0 right-0 sm:bottom-6 sm:right-6
                            w-full sm:w-[400px] md:w-[420px]
                            h-[100dvh] sm:h-auto sm:max-h-[min(680px,85vh)]
                            bg-[#FDF7F3]
                            sm:rounded-2xl
                            shadow-[0_20px_60px_rgba(0,0,0,0.2)]
                            border-0 sm:border sm:border-[#EADBCE]/70
                            flex flex-col
                            overflow-hidden
                        "
                        role="dialog"
                        aria-label="Therapique Assistant chat"
                    >
                        {/* ───────── HEADER ───────── */}
                        <div className="bg-gradient-to-r from-[#322A24] to-[#4A3F37] px-4 sm:px-5 py-3.5 sm:py-4 flex items-start justify-between shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-[#EADBCE]/15 border border-[#EADBCE]/20 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4.5 h-4.5 text-[#EADBCE]" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-white text-sm font-semibold font-therapique tracking-wide">Therapique Assistant</h3>
                                    <p className="text-[#B0A294] text-[10.5px] mt-0.5 leading-snug truncate">
                                        Services • Specialists • Articles • Library
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close assistant"
                                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5"
                            >
                                <X className="w-4 h-4 text-[#EADBCE]" />
                            </button>
                        </div>

                        {/* ───────── MESSAGES AREA ───────── */}
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto px-4 sm:px-5 pt-4 pb-6 flex flex-col gap-6 sm:gap-7 scrollbar-thin scrollbar-thumb-[#EADBCE] scrollbar-track-transparent"
                            style={{ overscrollBehavior: 'contain' }}
                        >
                            {messages.map((msg, i) => (
                                <MessageBubble
                                    key={i}
                                    message={msg}
                                    onActionClick={handleActionClick}
                                />
                            ))}

                            {/* Quick Start Suggestions */}
                            {showQuickStarts && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35, duration: 0.3 }}
                                    className="flex flex-col gap-2 mt-1 mb-2"
                                >
                                    <div className="flex items-center gap-1.5 px-0.5">
                                        <Sparkles className="w-3 h-3 text-[#9C8B7A]" />
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9C8B7A]">
                                            Suggested Questions
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        {QUICK_START_QUESTIONS.map((q, i) => (
                                            <motion.button
                                                key={i}
                                                initial={{ opacity: 0, x: -6 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 + i * 0.05 }}
                                                whileHover={{ x: 3 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleQuickStart(q)}
                                                className="
                                                    group w-full flex items-center justify-between
                                                    px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium text-left cursor-pointer
                                                    bg-white text-[#43372F] border border-[#EADBCE]
                                                    hover:bg-[#FBF5F0] hover:border-[#D4C4B4] hover:text-[#2D241E]
                                                    transition-all duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.02)]
                                                "
                                            >
                                                <span className="truncate pr-2">{q}</span>
                                                <ArrowRight className="w-3.5 h-3.5 text-[#B0A294] group-hover:text-[#43372F] group-hover:translate-x-0.5 transition-all shrink-0 opacity-60 group-hover:opacity-100" />
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Typing indicator */}
                            {isLoading && <TypingIndicator />}

                            {/* Error message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-2 px-3.5 py-3 rounded-xl bg-red-50 border border-red-200/60 mb-5"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-[12.5px] text-red-600 leading-relaxed">{error}</p>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} className="h-6 shrink-0" />
                        </div>

                        {/* ───────── INPUT AREA ───────── */}
                        <div className="shrink-0 border-t border-[#EADBCE]/80 bg-[#FDF7F3] px-3.5 py-3 sm:px-4 sm:py-3.5">
                            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about Therapique..."
                                    maxLength={500}
                                    disabled={isLoading}
                                    aria-label="Type your message"
                                    className="
                                        flex-1 min-w-0
                                        px-3.5 py-2.5
                                        bg-[#FDF7F3] border border-[#EADBCE]
                                        rounded-xl
                                        text-[13px] text-[#424242]
                                        placeholder:text-[#B0A294]
                                        focus:outline-none focus:ring-2 focus:ring-[#81C784]/40 focus:border-[#81C784]
                                        transition-all duration-200
                                        disabled:opacity-60
                                    "
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || inputValue.trim().length === 0}
                                    aria-label="Send message"
                                    className="
                                        w-10 h-10
                                        rounded-xl
                                        bg-[#322A24] hover:bg-[#4A3F37]
                                        text-[#EADBCE]
                                        flex items-center justify-center
                                        transition-all duration-200
                                        disabled:opacity-40 disabled:cursor-not-allowed
                                        cursor-pointer
                                        shrink-0
                                        shadow-sm hover:shadow-md
                                    "
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                            <p className="text-[9.5px] text-[#B0A294] mt-1.5 text-center select-none">
                                Therapique Assistant helps you explore our platform · Not a therapist
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default React.memo(TherapiqueAssistant);

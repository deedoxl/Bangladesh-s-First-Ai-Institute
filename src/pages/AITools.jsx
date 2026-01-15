import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import Button from '../components/ui/Button';
import { Bot, Send, AlertTriangle, Check, Layers, Cpu, Image as ImageIcon, Mic, Code, Globe, MessageSquare, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { chatWithAI } from '../lib/aiHandler';

const AITools = () => {
    // USE NEW aiModels and capabilities from DataContext (DB-Driven)
    const { settings, aiModels, capabilities, apiKeyMasked } = useData();
    const [prompt, setPrompt] = useState('');

    // Mode State (Which capability is active?)
    const [activeCapability, setActiveCapability] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null); // Single model for simplicity in this new mode
    const [isSelectorOpen, setIsSelectorOpen] = useState(false); // [NEW] Loading State for Custom Selector

    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [thinkingSeconds, setThinkingSeconds] = useState(0); // Timer for thinking

    // Initial Load: Set Default Capability
    useEffect(() => {
        if (capabilities?.items?.length > 0) {
            // [FIX] Ensure default capability is set even if aiModels load late
            if (!activeCapability) {
                const defaultCap = capabilities.items.find(c => c.capability_name === 'text_chat' && c.enabled) || capabilities.items.find(c => c.enabled);
                if (defaultCap) {
                    handleCapabilityChange(defaultCap);
                }
            } else if (activeCapability && !selectedModel && aiModels?.items?.length > 0) {
                // [FIX] Retry select model logic if aiModels arrived late
                handleCapabilityChange(activeCapability);
            }
        }
    }, [capabilities?.items, aiModels?.items]);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (loading) {
            setThinkingSeconds(0);
            interval = setInterval(() => {
                setThinkingSeconds(prev => prev + 1);
            }, 1000);
        } else {
            setThinkingSeconds(0);
        }
        return () => clearInterval(interval);
    }, [loading]);

    // Scroll to bottom
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [responses, loading]);

    // Map Capability Slug to DB Group Name
    const CAPABILITY_TO_GROUP = {
        'text_chat': 'text',
        'voice_to_text': 'voice',
        'image_generation': 'image',
        'coding_assistant': 'code'
    };

    const handleCapabilityChange = (cap) => {
        setActiveCapability(cap);

        // Resolve Default Model based on Group Settings (Admin Controlled)
        const groupName = CAPABILITY_TO_GROUP[cap.capability_name];
        if (groupName && aiModels?.items) {
            // Filter: Enabled AND Show on Main Site
            const availableModels = aiModels.items.filter(m => m.group_type === groupName && m.enabled && m.show_on_main_site);

            // 1. Try to find the specific "Main Default" for this group
            const defaultModel = availableModels.find(m => m.is_default);

            if (defaultModel) {
                setSelectedModel(defaultModel.id);
            } else if (availableModels.length > 0) {
                // 2. Fallback: Any available model in this group
                setSelectedModel(availableModels[0].id);
            } else {
                setSelectedModel(null);
            }
        } else {
            // Legacy Fallback if group mapping fails
            if (aiModels?.items?.length > 0) {
                const any = aiModels.items.find(m => m.enabled && m.show_on_main_site);
                setSelectedModel(any ? any.id : null);
            } else {
                setSelectedModel(null);
            }
        }

        setResponses([]); // Clear previous chat when switching modes
    };

    const handleSend = async () => {
        if (!prompt.trim()) return;
        if (!selectedModel) {
            alert("No model selected or available for this capability.");
            return;
        }

        setLoading(true);
        const startTime = Date.now();
        const userMsgId = Date.now();

        const newResponseEntry = {
            id: userMsgId,
            role: 'user',
            content: prompt,
            model: 'User',
            startTime,
            thoughtTime: null
        };

        setResponses(prev => [...prev, newResponseEntry]);
        setPrompt('');

        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);

        try {
            // Import new Service
            const { sendAIMessage } = await import('../services/aiService');

            // Build Context (System Prompt + History)
            // Note: AITools simple chat usually has less "System" context than Student Dashboard,
            // but we can add a generic one if needed or leave empty.
            // Let's add simple one.
            const history = responses.map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content }));
            const fullMessages = [
                { role: "system", content: "You are an AI assistant in Deedox AI Tools." },
                ...history,
                { role: "user", content: newResponseEntry.content }
            ];

            const result = await sendAIMessage({ modelId: selectedModel, messages: fullMessages });

            if (result.error) throw new Error(result.error);
            const content = result.content || result.choices?.[0]?.message?.content || "No response";

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(1);

            // Add AI Message
            setResponses(prev => [...prev, {
                role: 'ai',
                content: content,
                model: selectedModel,
                id: Date.now() + 1,
                thoughtTime: duration
            }]);

        } catch (e) {
            console.error(e);
            setResponses(prev => [...prev, {
                model: selectedModel,
                content: "Error: " + (e.message || "Failed to connect"),
                error: true,
                role: 'ai',
                id: Date.now() + 2
            }]);
        } finally {
            setLoading(false);
            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

    const getModelName = (id) => aiModels?.items?.find(m => m.id === id)?.model_name || id;

    // Helper to get Icon
    const getIcon = (name) => {
        switch (name) {
            case 'text_chat': return <Brain size={18} />;
            case 'voice_to_text': return <Mic size={18} />;
            case 'image_generation': return <ImageIcon size={18} />;
            case 'coding_assistant': return <Code size={18} />;
            default: return <Bot size={18} />;
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-10 container mx-auto px-4 flex flex-col gap-6 font-sans">
            {/* Background Glows */}
            {/* Premium Neon Glass Background Animation */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-[#a3e635]/10 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-[#a3e635]/5 rounded-full blur-[150px] animate-blob" />
            </div>

            {/* Header */}
            <div className="text-center space-y-4 relative z-10 animate-fade-in mt-10 mb-6">
                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter drop-shadow-2xl">
                    AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a3e635] to-[#4ade80] drop-shadow-[0_0_15px_rgba(163,230,53,0.3)]">Studio</span>
                </h1>
                <p className="text-white/40 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                    Experience the future of productivity with our intelligent assistants.
                </p>
                {!apiKeyMasked && (
                    <div className="inline-flex items-center gap-2 bg-yellow-500/5 text-yellow-500/80 px-4 py-1.5 rounded-full border border-yellow-500/10 mt-6 backdrop-blur-md text-xs font-medium uppercase tracking-wider">
                        <AlertTriangle size={12} />
                        <span>System Check: AI Key Config Required</span>
                    </div>
                )}
            </div>

            {/* Main Interface (Liquid Glass Panel) */}
            <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh] lg:h-[calc(100vh-180px)] relative z-10 glass-panel rounded-[2.5rem] p-4 lg:p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] border border-white/10 backdrop-blur-[50px] bg-black/40">

                {/* 1. Capabilities Sidebar (Glass Drawer) */}
                <div className="w-full lg:w-1/4 flex flex-col gap-6 lg:border-r border-white/5 pr-0 lg:pr-6">
                    <div className="space-y-4">
                        <h3 className="text-white/40 font-bold uppercase tracking-widest text-[10px] mb-4 pl-2">Select Mode</h3>
                        <div className="space-y-2 overflow-y-auto max-h-[200px] lg:max-h-none custom-scrollbar">
                            {capabilities?.items?.filter(c => c.enabled).sort((a, b) => a.label.localeCompare(b.label)).map(cap => (
                                <button
                                    key={cap.id}
                                    onClick={() => handleCapabilityChange(cap)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-sm font-medium relative overflow-hidden group",
                                        activeCapability?.id === cap.id
                                            ? "bg-white/10 border-white/10 text-white shadow-inner"
                                            : "bg-transparent border-transparent text-white/50 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <div className={cn("p-2 rounded-lg transition-all duration-300", activeCapability?.id === cap.id ? "bg-white/20 scale-105" : "bg-white/5 group-hover:bg-white/10")}>
                                        {getIcon(cap.capability_name)}
                                    </div>
                                    <span className="flex-grow text-left tracking-wide text-xs">{cap.label}</span>
                                    {activeCapability?.id === cap.id && <div className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_10px_#a3e635]" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Model Selector (Frosted Card) */}
                    {activeCapability && (
                        <div className="mt-auto bg-gradient-to-b from-white/5 to-transparent p-4 rounded-xl border border-white/5 backdrop-blur-md relative group z-50">
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
                            <span className="text-[9px] text-white/30 uppercase font-bold tracking-wider mb-3 block flex items-center gap-2 relative z-10">
                                <Cpu size={10} className="text-deedox-accent-primary" /> Active Model
                            </span>
                            {(() => {
                                const groupName = CAPABILITY_TO_GROUP[activeCapability.capability_name];
                                const availableModels = aiModels?.items?.filter(m => m.enabled && m.group_type === groupName && m.show_on_main_site) || [];

                                if (availableModels.length > 1) {
                                    return (
                                        <div className="relative z-20">
                                            {/* Custom Selector */}
                                            <div
                                                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                                                className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-lg px-3 py-2.5 cursor-pointer hover:bg-black/60 transition-colors flex justify-between items-center group/select"
                                            >
                                                <span className="truncate pr-2 font-mono opacity-80 group-hover/select:opacity-100 transition-opacity">
                                                    {availableModels.find(m => m.id === selectedModel)?.display_name || availableModels.find(m => m.id === selectedModel)?.model_name || 'Select Model'}
                                                </span>
                                                {isSelectorOpen ? <ChevronUp size={14} className="text-white/50" /> : <ChevronDown size={14} className="text-white/50" />}
                                            </div>

                                            <AnimatePresence>
                                                {isSelectorOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        className="absolute bottom-full mb-2 left-0 w-full bg-[#151515] border border-white/10 rounded-xl overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-[100] flex flex-col max-h-[400px] overflow-y-auto custom-scrollbar backdrop-blur-xl"
                                                    >
                                                        <div className="sticky top-0 bg-[#151515] p-2 border-b border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-wider z-10">
                                                            Available Models
                                                        </div>
                                                        {availableModels.map(m => (
                                                            <div
                                                                key={m.id}
                                                                onClick={() => {
                                                                    setSelectedModel(m.id);
                                                                    setResponses([]);
                                                                    setIsSelectorOpen(false);
                                                                }}
                                                                className={cn(
                                                                    "px-4 py-3 text-xs cursor-pointer border-b border-white/5 last:border-0 flex items-center justify-between group/item hover:bg-white/5 transition-colors",
                                                                    selectedModel === m.id ? "bg-[#a3e635]/10 text-white font-bold" : "text-white/60"
                                                                )}
                                                            >
                                                                <span className="truncate">{m.display_name || m.model_name}</span>
                                                                {selectedModel === m.id && <Check size={14} className="text-[#a3e635]" />}
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div className="text-white/80 font-mono text-xs flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            {getModelName(selectedModel)}
                                        </div>
                                    )
                                }
                            })()}
                        </div>
                    )}
                </div>

                {/* 2. Chat Area */}
                <div className="w-full lg:w-3/4 flex flex-col relative h-full">

                    {/* Chat Messages */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar pb-32 px-4 space-y-6 scroll-smooth">
                        {responses.length === 0 && !loading && (
                            <div className="h-full flex flex-col items-center justify-center opacity-60">
                                <div className="w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-[2rem] flex items-center justify-center mb-6 border border-white/10 shadow-2xl backdrop-blur-md">
                                    {activeCapability ? getIcon(activeCapability.capability_name) : <Bot size={40} />}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">How can I help you?</h3>
                                <p className="text-white/50 max-w-sm text-center font-light">Select a tool and start typing to unleash the power of AI.</p>
                            </div>
                        )}

                        <AnimatePresence mode="popLayout">
                            {responses.map((res, index) => (
                                <motion.div
                                    key={res.id || index}
                                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className={cn("flex w-full", res.role === 'user' ? "justify-end" : "justify-start")}
                                >
                                    {/* User Message Row */}
                                    {res.role === 'user' ? (
                                        <div className="max-w-[85%] md:max-w-[70%] bg-[#a3e635] text-black px-6 py-4 rounded-[2rem] rounded-tr-sm shadow-[0_10px_30px_-10px_rgba(163,230,53,0.3)] font-medium leading-relaxed border border-[#a3e635] relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />
                                            <span className="relative z-10">{res.content}</span>
                                        </div>
                                    ) : (
                                        /* AI Message */
                                        <div className="flex flex-col items-start gap-1 md:max-w-[75%]">
                                            <div className={cn(
                                                "glass-card px-8 py-6 rounded-[2rem] rounded-tl-sm text-sm leading-7 border backdrop-blur-2xl transition-all bg-black/40",
                                                res.error ? "border-red-500/30 bg-red-500/5 text-red-200" : "border-white/10 text-white/90"
                                            )}>
                                                {res.thoughtTime && (
                                                    <div className="text-[10px] uppercase font-bold tracking-widest text-[#a3e635] mb-2 opacity-60">
                                                        Processed in {res.thoughtTime}s
                                                    </div>
                                                )}
                                                <div className="prose prose-invert prose-lg max-w-none">
                                                    {res.content}
                                                </div>
                                            </div>
                                            {res.model && (
                                                <span className="text-[10px] text-white/20 font-mono self-start ml-4 uppercase">{getModelName(res.model)}</span>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Thinking State - Left Aligned (Like AI is typing) */}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start items-center gap-4 mb-6"
                            >
                                <div className="px-6 py-3 rounded-full flex items-center gap-3 border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-xl">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-[#a3e635] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-[#a3e635] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-[#a3e635] rounded-full animate-bounce" />
                                    </div>
                                    <span className="text-white/60 text-xs font-medium font-mono tracking-widest uppercase">
                                        Thinking <span className="text-[#a3e635]">{thinkingSeconds}s</span>
                                    </span>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area (Floating Glass Bar) */}
                    <div className="absolute bottom-6 left-4 right-4 md:left-8 md:right-8 z-20">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent -z-10 h-32 -bottom-6 pointer-events-none opacity-50" />

                            <div className="bg-black/60 backdrop-blur-[20px] border border-white/10 p-2 pl-6 rounded-full flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all focus-within:bg-black/80 focus-within:border-white/20 focus-within:shadow-[0_20px_60px_rgba(0,0,0,0.8)] focus-within:scale-[1.01]">
                                <Globe size={20} className="text-white/20" />
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={activeCapability?.capability_name === 'image_generation' ? "Describe the image..." : "Type your prompt..."}
                                    className="flex-grow bg-transparent border-none outline-none text-white placeholder:text-white/30 h-10"
                                    disabled={loading}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !prompt.trim()}
                                    className="w-12 h-12 rounded-full bg-[#a3e635] text-black flex items-center justify-center hover:scale-110 hover:shadow-[0_0_20px_rgba(163,230,53,0.5)] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                                >
                                    <Send size={20} className="ml-0.5" />
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AITools;

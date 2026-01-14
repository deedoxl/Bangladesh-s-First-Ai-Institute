"use client";

import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Bot, Send, AlertTriangle, Check, Layers, Cpu, Image as ImageIcon, Mic, Code, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAI } from '@/lib/aiHandler';
import { cn } from '@/utils/cn';

// Minimal Button for App Router if not importing shared component
const Button = ({ children, variant, className, ...props }) => {
    const base = "px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2";
    const variants = {
        accent: "bg-[#70E000] text-black hover:bg-[#70E000]/90 shadow-[0_0_15px_rgba(112,224,0,0.3)]",
        outline: "border border-white/10 hover:bg-white/5 text-white"
    };
    return <button className={cn(base, variants[variant] || variants.outline, className)} {...props}>{children}</button>;
};

export default function StudentAITools() {
    const { settings, aiModels, capabilities } = useData();
    const [prompt, setPrompt] = useState('');
    const [activeCapability, setActiveCapability] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Capability Mapping
    const CAPABILITY_TO_GROUP = {
        'text_chat': 'Text Chat / Reasoning',
        'voice_to_text': 'Voice / Speech',
        'image_generation': 'Image Generation',
        'coding_assistant': 'Coding / Tech Support'
    };

    // Initial Load
    useEffect(() => {
        if (capabilities?.items?.length > 0 && !activeCapability) {
            const defaultCap = capabilities.items.find(c => c.capability_name === 'text_chat' && c.enabled) || capabilities.items.find(c => c.enabled);
            if (defaultCap) handleCapabilityChange(defaultCap);
        }
    }, [capabilities?.items]);

    const handleCapabilityChange = (cap) => {
        setActiveCapability(cap);

        // Resolve Default Model based on Group Settings (STUDENT DEFAULT)
        const groupName = CAPABILITY_TO_GROUP[cap.capability_name];
        if (groupName && aiModels?.items) {
            // 1. Try to find the specific "Student Default" for this group
            const defaultModel = aiModels.items.find(m => m.group_name === groupName && m.enabled && m.is_default_student);

            if (defaultModel) {
                setSelectedModel(defaultModel.id);
            } else {
                // 2. Fallback: Any enabled model in this group
                const anyModel = aiModels.items.find(m => m.group_name === groupName && m.enabled);
                setSelectedModel(anyModel ? anyModel.id : null);
            }
        } else {
            setSelectedModel(cap.default_model || (cap.allowed_models?.[0] || null));
        }

        setResponses([]);
    };

    const handleSend = async () => {
        if (!prompt.trim()) return;
        if (!selectedModel) {
            alert("No model selected or available for this capability.");
            return;
        }

        if (!settings.openRouterKey) {
            setLoading(true);
            setTimeout(() => {
                setResponses([{
                    model: selectedModel,
                    content: "API Key missing. Please ask Admin to configure OpenRouter API Key. (Demo Mode)",
                    error: true
                }]);
                setLoading(false);
            }, 1000);
            return;
        }

        setLoading(true);
        const newResponseEntry = { role: 'user', content: prompt, model: 'User' };
        setResponses(prev => [newResponseEntry, ...prev]);

        const result = await chatWithAI({
            modelId: selectedModel,
            messages: [{ role: "user", content: prompt }],
            apiKey: settings.openRouterKey,
            settings: aiModels?.items
        });

        setResponses(prev => [{ ...result, role: 'ai' }, ...prev]);
        setLoading(false);
        setPrompt('');
    };

    const getModelName = (id) => aiModels?.items?.find(m => m.id === id)?.model_name || id;
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
        <div className="flex flex-col gap-8 h-full">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Cpu className="text-blue-600" size={32} />
                    AI Study Assistant
                </h1>
                <p className="text-gray-500">Access powerful AI tools optimized for your learning journey.</p>
            </div>

            {/* Main Interface (Light Mode for Student Dashboard usually, but keep glass if requested? 
                User said "UI must remain EXACTLY same". Student Dashboard has white/gray theme (see layout.tsx).
                I will adapt to Student Theme (White/Gray) but keep layout structure. 
                Wait, "UI must remain EXACTLY same" applies to the *existing* UI. 
                Since this is NEW for student dashboard, I should match the Student Dashboard theme (Gray-50/White).
            */}

            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
                {/* 1. Capabilities Sidebar */}
                <div className="w-full lg:w-1/4 space-y-4">
                    <div className="bg-white p-6 rounded-2xl h-full border border-gray-200 shadow-sm">
                        <h3 className="text-gray-900 font-bold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                            <Layers size={18} className="text-blue-600" /> AI Modules
                        </h3>
                        <div className="space-y-3">
                            {capabilities?.items?.filter(c => c.enabled).sort((a, b) => a.label.localeCompare(b.label)).map(cap => (
                                <button
                                    key={cap.id}
                                    onClick={() => handleCapabilityChange(cap)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-sm font-bold",
                                        activeCapability?.id === cap.id
                                            ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                                            : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
                                    )}
                                >
                                    {getIcon(cap.capability_name)}
                                    <span className="flex-grow text-left">{cap.label}</span>
                                    {activeCapability?.id === cap.id && <Check size={16} />}
                                </button>
                            ))}
                        </div>

                        {activeCapability && (
                            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Active Model</span>

                                {(() => {
                                    const groupName = CAPABILITY_TO_GROUP[activeCapability.capability_name];
                                    const availableModels = aiModels?.items?.filter(m => m.enabled && m.group_name === groupName) || [];

                                    if (availableModels.length > 1) {
                                        return (
                                            <div className="relative">
                                                <select
                                                    value={selectedModel || ''}
                                                    onChange={(e) => {
                                                        setSelectedModel(e.target.value);
                                                        setResponses([]);
                                                    }}
                                                    className="w-full bg-white border border-gray-200 text-gray-800 text-sm font-bold rounded-lg px-3 py-2 outline-none focus:border-blue-400 appearance-none cursor-pointer shadow-sm"
                                                >
                                                    {availableModels.map(m => (
                                                        <option key={m.id} value={m.id} className="bg-white text-gray-800">
                                                            {m.model_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <Cpu size={14} />
                                                </div>
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <div className="text-blue-600 font-bold text-sm flex items-center gap-2">
                                                <Cpu size={14} /> {getModelName(selectedModel)}
                                            </div>
                                        )
                                    }
                                })()}

                                <p className="text-[10px] text-gray-400 leading-tight pt-2">
                                    Student AI Engine
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Workspace */}
                <div className="w-full lg:w-3/4 flex flex-col gap-6">
                    {/* Input */}
                    <div className="bg-white p-1 rounded-2xl border border-gray-200 focus-within:border-blue-400 transition-colors relative shadow-sm">
                        <textarea
                            className="w-full bg-transparent text-gray-900 border-0 outline-none resize-none h-32 p-6 placeholder:text-gray-400 text-lg leading-relaxed"
                            placeholder={activeCapability?.capability_name === 'image_generation' ? "Describe the image you want to create..." : "Ask your AI tutor anything..."}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        />
                        <div className="absolute bottom-4 right-4">
                            <Button
                                variant="accent"
                                className="w-12 h-12 !p-0 rounded-xl flex items-center justify-center shadow-md bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleSend}
                                disabled={loading || !prompt.trim()}
                            >
                                {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Cpu size={20} /></motion.div> : <Send size={20} />}
                            </Button>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex-grow space-y-4 min-h-[400px]">
                        <AnimatePresence mode="popLayout">
                            {responses.map((res, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={cn(
                                        "p-6 rounded-2xl border max-w-4xl mx-auto",
                                        res.role === 'user'
                                            ? "bg-blue-50 border-blue-100 ml-auto text-right w-fit max-w-[80%] text-gray-800"
                                            : cn("w-full shadow-sm", res.error ? "bg-red-50 border-red-100 text-red-600" : "bg-white border-gray-200 text-gray-800")
                                    )}
                                >
                                    {res.role !== 'user' && (
                                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                                                <Bot size={14} /> {getModelName(res.model)}
                                            </div>
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap leading-relaxed">{res.content}</div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

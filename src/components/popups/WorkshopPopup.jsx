import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, Zap, CheckCircle, Play } from 'lucide-react';
import { useData } from '../../context/DataContext';

import { useLocation } from 'react-router-dom';

const WorkshopPopup = () => {
    const { workshopPopupConfig } = useData();
    // Fallback to empty object if config is still loading
    const config = workshopPopupConfig || {};
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    // Auto-show logic (Show on mount if enabled AND on allowed pages)
    useEffect(() => {
        // Allowed paths: Home (/) and Student Dashboard (/student/dashboard)
        // We explicitly block Admin and Login routes just in case.
        const isAllowedPage = location.pathname === '/' || location.pathname.startsWith('/student/dashboard');

        if (config.enabled && isAllowedPage) {
            // Small delay for smooth entrance after page load
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [config.enabled, location.pathname]);

    if (!isVisible) return null;

    // Helper to split title for highlighting
    const renderTitle = () => {
        if (!config.title) return "Join Our Workshop";
        if (!config.highlightWord) return config.title;

        const parts = config.title.split(config.highlightWord);
        // This simple split works for one occurrence.
        // If the word appears multiple times, this might act oddly, but usually sufficient for titles.
        return (
            <>
                {parts[0]}
                <span className="text-[#70E000]">{config.highlightWord}</span>
                {parts[1]}
            </>
        );
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsVisible(false)}
                    />

                    {/* Popup Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full max-w-sm md:max-w-md bg-[#080808] border border-white/5 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                        {/* Glow Effects */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-[#70E000]/10 to-transparent blur-[80px] pointer-events-none" />

                        {/* Close Button */}
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <div className="relative z-10 p-6 flex flex-col items-center text-center">

                            {/* Badges */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE SESSION
                                </div>
                                <div className="px-3 py-1 rounded-full bg-[#70E000]/20 border border-[#70E000]/30 text-[#70E000] text-[10px] font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(112,224,0,0.2)]">
                                    <SparklesIcon /> {config.seatsLeftText || 'Limited Seats'}
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4 tracking-tight">
                                {renderTitle()}
                            </h2>
                            <p className="text-white/50 text-xs md:text-sm px-4 mb-8 leading-relaxed">
                                {config.subtitle || "Master practical skills in a focused live session."}
                            </p>

                            {/* Video/Image Preview Container */}
                            <div className="w-full aspect-video rounded-3xl bg-black/50 border border-white/10 mb-8 relative overflow-hidden group cursor-pointer shadow-2xl">
                                {config.thumbnailUrl ? (
                                    <img src={config.thumbnailUrl} alt="Workshop" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
                                )}

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                        <Play size={20} className="text-white fill-white ml-1" />
                                    </div>
                                </div>

                                {/* Label Overlay */}
                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                    <span className="text-white text-xs font-bold flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#70E000]" />
                                        Workshop Preview
                                    </span>
                                </div>
                            </div>

                            {/* Info Grid (Glass Cards) */}
                            <div className="grid grid-cols-3 gap-3 w-full mb-8">
                                <InfoCard icon={Calendar} label="DATE" value={config.date} />
                                <InfoCard icon={Clock} label="TIME" value={config.time} />
                                <InfoCard icon={Users} label="ENROLLED" value={config.enrolledCount} />
                            </div>

                            {/* Feature List */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full px-4 mb-8 text-left">
                                <FeatureItem text="AI Fundamentals" />
                                <FeatureItem text="AI Agents" />
                                <FeatureItem text="Content Creation" />
                                <FeatureItem text="Vibe Coding" />
                            </div>

                            {/* CTA Button */}
                            <a
                                href={config.primaryBtnLink || '#'}
                                className="w-full bg-[#70E000] text-black font-bold py-4 rounded-2xl mb-3 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(112,224,0,0.3)] hover:shadow-[0_0_30px_rgba(112,224,0,0.5)]"
                            >
                                {config.primaryBtnText || "Reserve My Seat Now"} <ArrowRightIcon />
                            </a>

                            {/* Secondary Button */}
                            <button
                                onClick={() => setIsVisible(false)}
                                className="w-full py-3 rounded-2xl text-white/30 text-sm font-bold hover:text-white hover:bg-white/5 transition-colors"
                            >
                                {config.secondaryBtnText || "Maybe Later"}
                            </button>

                            {/* Footer Price */}
                            <p className="mt-6 text-[10px] text-[#70E000] font-bold tracking-wide uppercase opacity-80">
                                {config.priceText || "Starting at just PKR 1,99 • Limited Time Offer"}
                            </p>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Subcomponents for cleaner code
const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
        <Icon size={16} className="text-[#70E000] mb-2" />
        <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-white text-xs font-bold text-center leading-tight">{value}</span>
    </div>
);

const FeatureItem = ({ text }) => (
    <div className="flex items-center gap-2">
        <Zap size={12} className="text-[#70E000]" />
        <span className="text-white/70 text-xs font-medium">{text}</span>
    </div>
);

// Custom Icons to match exact look if Lucide isn't enough
const SparklesIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" /></svg>
);

const ArrowRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);

export default WorkshopPopup;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { useData } from '../../context/DataContext';

const DashboardHero = () => {
    const { dashboardSlides } = useData();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeSlides, setActiveSlides] = useState([]);

    // Filter active slides
    useEffect(() => {
        if (dashboardSlides) {
            const active = dashboardSlides.filter(s => s.is_active).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
            setActiveSlides(active);
        }
    }, [dashboardSlides]);

    // Auto-advance
    useEffect(() => {
        if (activeSlides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % activeSlides.length);
        }, 5000); // 5 seconds
        return () => clearInterval(timer);
    }, [activeSlides.length]);

    if (!activeSlides || activeSlides.length === 0) return null;

    const slide = activeSlides[currentIndex];

    return (
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[450px] rounded-[2.5rem] overflow-hidden group shadow-2xl mb-8 border border-white/5">
            {/* Background Image with Transition */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.image_url})` }}
                >
                    {/* Gradient Overlay for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content Content */}
            <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 md:p-12 lg:p-16 max-w-4xl">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-4"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-xl tracking-tight">
                            {slide.title}
                        </h2>
                        {slide.description && (
                            <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl leading-relaxed drop-shadow-md">
                                {slide.description}
                            </p>
                        )}

                        <div className="pt-6">
                            <a
                                href={slide.cta_link || '#'}
                                className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-base hover:bg-deedox-accent-primary transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(112,224,0,0.5)] transform hover:scale-105 active:scale-95 group/btn"
                            >
                                {slide.cta_text || 'Explore'}
                                <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress/Indicators */}
            <div className="absolute bottom-6 right-8 z-20 flex gap-2">
                {activeSlides.map((s, idx) => (
                    <button
                        key={s.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`transition-all duration-300 rounded-full h-1.5 shadow-lg ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                    />
                ))}
            </div>

            {/* Glass decoration */}
            <div className="absolute top-6 right-6 z-20 hidden md:block">
                <div className="glass-card px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/60 uppercase tracking-widest backdrop-blur-md bg-black/30">
                    Featured
                </div>
            </div>
        </div>
    );
};

export default DashboardHero;

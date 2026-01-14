"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { useData } from '@/context/DataContext';

const Hero = () => {
    const { heroContent, heroImages, heroSettings } = useData();

    // Safety check to prevent crash if context is not ready
    if (!heroSettings || !heroImages) return null;

    const scrollToPrograms = () => {
        const section = document.getElementById('programs');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    };

    // Animation Speed Logic
    const getDuration = () => {
        if (!heroSettings.animationEnabled) return 0;
        switch (heroSettings.animationSpeed) {
            case 'slow': return 60;
            case 'fast': return 20;
            default: return 40; // normal
        }
    };

    // Duplicate images for infinite loop
    const displayImages = [...(heroImages.items || []), ...(heroImages.items || []), ...(heroImages.items || [])];

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505]">

            {/* --- Cinematic Background Slider (Multi-Row) --- */}
            <div
                className="absolute inset-x-0 top-0 h-full z-0 overflow-hidden flex flex-col justify-center gap-6 select-none pointer-events-none md:pointer-events-auto transition-opacity duration-300"
                style={{ opacity: heroSettings.overlayOpacity !== undefined ? heroSettings.overlayOpacity : 0.5 }}
            >
                {/* Row 1: Moves Left */}
                <div className="relative flex overflow-hidden w-full">
                    <motion.div
                        className="flex gap-6 items-center w-max hover:[animation-play-state:paused]"
                        animate={heroSettings.animationEnabled ? { x: ["0%", "-50%"] } : {}}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: getDuration()
                        }}
                    >
                        {[...displayImages, ...displayImages].map((img: any, idx: number) => (
                            <div key={`r1-${img.id}-${idx}`} className="relative w-[60vw] md:w-[25vw] h-[30vh] md:h-[40vh] flex-shrink-0 rounded-xl overflow-hidden grayscale brightness-50 hover:grayscale-0 hover:brightness-100 transition-all duration-500 ease-in-out cursor-pointer group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.url} alt={img.alt} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-[#050505]/20 group-hover:bg-transparent transition-colors" />
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Row 2: Moves Right */}
                <div className="relative flex overflow-hidden w-full">
                    <motion.div
                        className="flex gap-6 items-center w-max hover:[animation-play-state:paused]"
                        animate={heroSettings.animationEnabled ? { x: ["-50%", "0%"] } : {}}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: getDuration() * 1.2
                        }}
                    >
                        {[...displayImages, ...displayImages].map((img: any, idx: number) => (
                            <div key={`r2-${img.id}-${idx}`} className="relative w-[60vw] md:w-[25vw] h-[30vh] md:h-[40vh] flex-shrink-0 rounded-xl overflow-hidden grayscale brightness-50 hover:grayscale-0 hover:brightness-100 transition-all duration-500 ease-in-out cursor-pointer group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.url} alt={img.alt} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-[#050505]/20 group-hover:bg-transparent transition-colors" />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* --- Overlays & Gradients (Dynamic Visibility) --- */}
            <div
                className="absolute inset-0 z-0 bg-gradient-to-b from-[#050505]/90 via-[#050505]/70 to-[#050505] transition-opacity duration-300 pointer-events-none"
                style={{ opacity: Math.max(0, 1 - (heroSettings.overlayOpacity !== undefined ? heroSettings.overlayOpacity : 0.5)) }}
            />

            {/* --- Static Glows (New Design) --- */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#70E000]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-slow pointer-events-none z-10" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#70E000]/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-pulse-slow pointer-events-none z-10" />

            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,224,0,0.05),transparent_60%)]" />

            {/* --- Content --- */}
            <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center max-w-5xl pt-20">

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
                >
                    {heroContent.titlePrefix} <br />
                    <span className="text-white drop-shadow-[0_0_25px_rgba(112,224,0,0.4)]">
                        {heroContent.titleHighlight}
                    </span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="text-lg md:text-2xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
                >
                    {heroContent.subtitle}
                </motion.p>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Button
                        onClick={scrollToPrograms}
                        variant="primary"
                        className="text-base md:text-lg px-8 md:px-10 py-4 md:py-5 rounded-full bg-white text-black font-bold uppercase tracking-wider hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300"
                    >
                        SEE ALL PROGRAMS
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;

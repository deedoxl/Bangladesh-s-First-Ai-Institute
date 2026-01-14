import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';

const GlobalBackground = () => {
    const { settings, previewSettings } = useData();
    const [scrollY, setScrollY] = useState(0);

    // Use Preview if available, otherwise Settings
    const visuals = previewSettings?.globalVisuals || settings.globalVisuals || { enabled: true, intensity: 'medium' };

    useEffect(() => {
        if (!visuals.enabled) return;

        const handleScroll = () => {
            requestAnimationFrame(() => setScrollY(window.scrollY));
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [visuals.enabled]);

    if (!visuals.enabled) return null;

    // Intensity / Visuals Map
    // Use granular values if present, else fall back to preset map
    const opacityMap = { low: 0.1, medium: 0.2, high: 0.4 };
    const opacity = visuals.opacity !== undefined ? visuals.opacity : (opacityMap[visuals.intensity] || 0.2);
    const blur = visuals.blur !== undefined ? visuals.blur : 120; // Default blur
    const color = visuals.color || '#70E000'; // Default Neon Green

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden h-screen w-screen">
            {/* Base Dark Background (Redundant if body has it, but ensures coverage) */}
            <div className="absolute inset-0 bg-[#050505] -z-20" />

            {/* 1. Main Neon Green Glow - Bottom Left (Moves Up on Scroll) */}
            <div
                className="absolute -bottom-[20%] -left-[10%] w-[80vw] h-[80vw] rounded-full"
                style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                    opacity: opacity,
                    filter: `blur(${blur}px)`, // Dynamic Blur
                    transform: `translateY(${-scrollY * 0.15}px) translateZ(0)`,
                    transition: 'transform 0.1s linear, opacity 0.3s ease, filter 0.3s ease',
                    willChange: 'transform'
                }}
            />

            {/* 2. Secondary Glow - Top Right (Moves Down on Scroll) */}
            <div
                className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full"
                style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                    opacity: opacity * 0.8, // Slightly softer
                    filter: `blur(${blur * 0.8}px)`, // Dynamic Blur
                    transform: `translateY(${scrollY * 0.1}px) translateZ(0)`,
                    transition: 'transform 0.1s linear, opacity 0.3s ease, filter 0.3s ease',
                    willChange: 'transform'
                }}
            />

            {/* 3. Floating Particles / Noise Texture for texture */}
            <div
                className="absolute inset-0 mix-blend-overlay opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                    transform: `translateY(${scrollY * 0.05}px)`,
                }}
            />

            {/* 4. Pulse Animation Blob (Center) */}
            <div
                className="absolute top-1/2 left-1/2 w-[50vw] h-[50vw] rounded-full blur-[150px] animate-pulse-slow"
                style={{
                    background: `radial-gradient(circle, #70E000 0%, transparent 70%)`,
                    opacity: opacity * 0.5,
                    transform: 'translate(-50%, -50%)',
                }}
            />
        </div>
    );
};

export default GlobalBackground;

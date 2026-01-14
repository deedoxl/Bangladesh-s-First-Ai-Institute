import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import Button from '../ui/Button';
import { useData } from '../../context/DataContext';

const Hero = () => {
    const { heroContent, heroImagesTable } = useData();
    const activeImages = heroImagesTable?.items?.filter(img => img.enabled) || [];

    // Ensure we have enough images for the slider (duplicate if needed)
    const baseImages = activeImages.length > 0 ? activeImages : [
        { id: 1, image_url: 'https://placehold.co/400x300/101010/70E000/png?text=Co+Founder', alt_text: 'Co Founder' },
        { id: 2, image_url: 'https://placehold.co/400x300/050505/ffffff/png?text=AI+Startup', alt_text: 'AI Startup' },
        { id: 3, image_url: 'https://placehold.co/400x300/1a1a1a/70E000/png?text=NexZen+AI', alt_text: 'NexZen AI' },
        { id: 4, image_url: 'https://placehold.co/400x300/000000/ffffff/png?text=Deedox', alt_text: 'Deedox' },
    ];

    // Create long arrays for infinite scroll (Triple the content)
    const row1Images = [...baseImages, ...baseImages, ...baseImages];
    const row2Images = [...baseImages.reverse(), ...baseImages, ...baseImages];
    const row3Images = [...baseImages, ...baseImages, ...baseImages]; // New Row 3

    const scrollToPrograms = () => {
        const section = document.getElementById('programs');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-0">

            {/* --- Full Screen Sliding Marquee Background --- */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 z-0 flex flex-col justify-center gap-8 overflow-hidden pointer-events-none"
            >
                {/* Light Overlay - Images are clearly visible */}
                <div className="absolute inset-0 bg-[#050505]/40 z-10" />

                {/* Horizontal Fade Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10" />

                {/* Row 1: Slides Left */}
                <div className="flex overflow-hidden w-full relative -rotate-3 scale-110">
                    <motion.div
                        className="flex gap-6 w-max"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 60
                        }}
                    >
                        {row1Images.map((img, idx) => (
                            <div key={`r1-${idx}`} className="w-[450px] h-[250px] flex-shrink-0 rounded-[21.2px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-none transition-colors">
                                <img src={img.image_url} alt={img.alt_text} className="w-full h-full object-cover opacity-100" />
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Row 2: Slides Right */}
                <div className="flex overflow-hidden w-full relative -rotate-3 scale-110 translate-x-20">
                    <motion.div
                        className="flex gap-6 w-max"
                        animate={{ x: ["-50%", "0%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 70
                        }}
                    >
                        {row2Images.map((img, idx) => (
                            <div key={`r2-${idx}`} className="w-[450px] h-[250px] flex-shrink-0 rounded-[21.2px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-none transition-colors">
                                <img src={img.image_url} alt={img.alt_text} className="w-full h-full object-cover opacity-100" />
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Row 3: Slides Left */}
                <div className="flex overflow-hidden w-full relative -rotate-3 scale-110 -translate-x-10">
                    <motion.div
                        className="flex gap-6 w-max"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 80
                        }}
                    >
                        {row3Images.map((img, idx) => (
                            <div key={`r3-${idx}`} className="w-[450px] h-[250px] flex-shrink-0 rounded-[21.2px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-none transition-colors">
                                <img src={img.image_url} alt={img.alt_text} className="w-full h-full object-cover opacity-100" />
                            </div>
                        ))}
                    </motion.div>
                </div>

            </motion.div>

            {/* Localized Glow for Text Pop */}
            <div className="hidden md:block absolute left-[-10%] top-[20%] w-[600px] h-[600px] bg-[#70E000]/20 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />

            <div className="container mx-auto px-4 relative z-10 flex flex-col justify-center h-full">

                {/* --- Content (Centered & Highlighted) --- */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="max-w-4xl space-y-8 py-20 lg:py-0"
                >
                    <div className="space-y-4">

                        <h1 className="text-6xl md:text-8xl font-bold leading-[1.05] tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                            <span className="text-white">
                                {heroContent?.titlePrefix || "Bangladesh's First"}
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-white via-white via-70% to-gray-500 text-transparent bg-clip-text drop-shadow-sm">
                                {heroContent?.titleHighlight || "AI Startup Institute"}
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white max-w-2xl font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {heroContent?.subtitle || "Learn how to use AI in real life and start a company people actually want."}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-start gap-6">
                        <Button
                            onClick={scrollToPrograms}
                            className="bg-black/40 border-white/30 hover:bg-black/60 px-10 py-5 rounded-full font-bold uppercase tracking-wider text-base backdrop-blur-md text-white transition-transform hover:scale-105"
                        >
                            Explore AI Programs
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Floating Chat Button (Bottom Right) */}


        </section>
    );
};

export default Hero;

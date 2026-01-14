import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';

const Mission = () => {
    const { missionContent } = useData();
    // Use cards if available, otherwise just show the text/values for legacy safety (or show nothing)
    const cards = missionContent.cards || [];

    return (
        <section id="mission" className="py-24 bg-[#050505] min-h-screen relative overflow-hidden flex flex-col items-center">

            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-deedox-accent-primary/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 w-full">

                {/* Header Text */}
                <div className="mb-20 text-center max-w-4xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm font-bold text-deedox-accent-primary uppercase tracking-widest mb-4"
                    >
                        {missionContent.headline}
                    </motion.h2>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold text-white leading-tight mb-8"
                    >
                        {missionContent.subheadline}
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-deedox-text-secondary text-lg leading-relaxed whitespace-pre-line"
                    >
                        {missionContent.body}
                    </motion.p>
                </div>

                {/* --- MISSION CARDS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-7xl mx-auto">
                    {cards.map((card, index) => {
                        // Layout Logic: 
                        // If 3 cards: 
                        // Card 1: 5 cols (Portrait-ish)
                        // Card 2: 7 cols (Landscape-ish) 
                        // Card 3: 12 cols (Full Width Landscape) 
                        // Or create a masonry effect. 
                        // For now, let's try a varied span logic to match typical 'Bento' grids.

                        let spanClass = "md:col-span-4"; // Default 1/3
                        if (index === 0) spanClass = "md:col-span-5";
                        if (index === 1) spanClass = "md:col-span-7";
                        if (index === 2) spanClass = "md:col-span-12 h-[500px]"; // Big featured bottom card

                        // Height adjustments for top row
                        const heightClass = index === 2 ? "h-[450px] md:h-[600px]" : "h-[450px] md:h-[550px]";

                        return (
                            <motion.div
                                key={card.id || index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className={`relative group rounded-3xl overflow-hidden border border-white/10 ${spanClass} ${heightClass}`}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 w-full h-full">
                                    <img
                                        src={card.image || "https://placehold.co/800x600/101010/333"}
                                        alt={card.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Gradient Overlay for Text Readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                                    <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                                        {/* Subtitle / Tag */}
                                        {card.subtitle && (
                                            <div className="inline-flex items-center gap-2 mb-4">
                                                <span className="h-[1px] w-8 bg-deedox-accent-primary" />
                                                <span className="text-deedox-accent-primary font-bold tracking-widest uppercase text-sm">
                                                    {card.subtitle}
                                                </span>
                                            </div>
                                        )}
                                        {/* Title */}
                                        <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                            {card.title}
                                        </h3>

                                        {/* Description (Visible/Expanded) */}
                                        {card.description && (
                                            <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
                                                {card.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* --- EXISTING VALUES (Subtle) --- */}
                {missionContent.values && missionContent.values.length > 0 && (
                    <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
                        {missionContent.values.map((val) => (
                            <div key={val.id} className="p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
                                <h4 className="text-white font-bold mb-2 text-lg">{val.title}</h4>
                                <p className="text-sm text-white/50">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
};

export default Mission;

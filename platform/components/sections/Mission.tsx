"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/context/DataContext';

// Simple text renderer to avoid external dependencies
const SimpleMarkdown = ({ text }: { text: string }) => {
    return (
        <div className="space-y-4 text-gray-400 text-lg leading-relaxed font-light">
            {text.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
            ))}
        </div>
    );
};

const Mission = () => {
    const { missionContent } = useData() as any;

    if (!missionContent) return null;

    return (
        <section id="mission" className="py-24 bg-[#050505] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#70E000]/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-start">

                    {/* Left Content */}
                    <div className="lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-sm font-bold text-[#70E000] uppercase tracking-widest mb-2">
                                {missionContent.headline}
                            </h2>
                            <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                                {missionContent.subheadline}
                            </h3>

                            <SimpleMarkdown text={missionContent.body} />
                        </motion.div>
                    </div>

                    {/* Right Content - Values */}
                    <div className="lg:w-1/2 w-full">
                        <div className="grid gap-6">
                            {missionContent.values.map((val: any, index: number) => (
                                <motion.div
                                    key={val.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="glass-card p-8 rounded-2xl border border-white/5 hover:border-[#70E000]/30 transition-all group"
                                >
                                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#70E000] transition-colors">
                                        {val.title}
                                    </h4>
                                    <p className="text-gray-400">
                                        {val.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Mission;

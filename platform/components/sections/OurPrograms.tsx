"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BarChart, User, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { useData } from '@/context/DataContext';

const ProgramCard = ({ program, index }: { program: any, index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="group relative"
    >
        {/* Card Content */}
        <div className="bg-[#0A0A0A] rounded-3xl overflow-hidden h-full flex flex-col border border-white/5 group-hover:border-[#70E000]/50 group-hover:shadow-[0_0_30px_rgba(112,224,0,0.1)] transition-all duration-500 relative z-10">

            {/* Image Container */}
            <div className="relative h-64 overflow-hidden">
                <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                    <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
                        {program.level}
                    </span>
                    {program.status && (
                        <span className="bg-[#70E000] text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_#70E000]">
                            {program.status}
                        </span>
                    )}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90" />
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col flex-grow -mt-20 relative z-20">
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#70E000] transition-colors leading-tight">
                    {program.title}
                </h3>

                <div className="space-y-3 mb-8 flex-grow">
                    <div className="flex items-center gap-3 text-gray-400">
                        <Clock size={16} className="text-[#70E000]" />
                        <span className="text-sm">{program.duration}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                        <User size={16} className="text-[#70E000]" />
                        <span className="text-sm">Instructor: <span className="text-white font-medium">{program.instructor}</span></span>
                    </div>
                </div>

                <a href={program.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button
                        variant="accent"
                        className="w-full justify-between rounded-xl py-4 hover:shadow-lg hover:-translate-y-1 transition-all"
                    >
                        View Program <ArrowRight size={18} />
                    </Button>
                </a>
            </div>
        </div>

        {/* Glow Effect behind card */}
        <div className="absolute inset-0 bg-[#70E000]/20 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10" />
    </motion.div>
);

const OurPrograms = () => {
    const { programs } = useData() as any;

    if (!programs) return null;

    return (
        <section id="programs" className="py-24 relative bg-transparent">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight">Our Programs</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
                        Industry-designed courses to help you master AI and build the future.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {programs.items.map((program: any, index: number) => (
                        <ProgramCard key={program.id} program={program} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OurPrograms;

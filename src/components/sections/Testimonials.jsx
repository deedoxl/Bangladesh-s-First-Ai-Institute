import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Youtube, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { useData } from '../../context/DataContext';

const TestimonialCard = ({ testimonial, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        viewport={{ once: true }}
        className="break-inside-avoid mb-6"
    >
        <div className="bg-[#0A0A0A] p-8 rounded-3xl border border-white/5 hover:border-[#70E000]/30 transition-all relative group">
            <div className="absolute top-6 right-6 flex gap-3">
                {/* Requested Red Youtube Icon - Linked */}
                {testimonial.video_url ? (
                    <a href={testimonial.video_url} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        <Youtube size={24} className="text-[#FF0000] opacity-80 group-hover:opacity-100 transition-opacity" />
                    </a>
                ) : (
                    <Youtube size={24} className="text-gray-700 opacity-20" /> // Disabled state
                )}
                <Quote size={24} className="text-[#70E000]/20" />
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-6 italic relative z-10">
                "{testimonial.quote}"
            </p>

            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-white overflow-hidden">
                    {testimonial.image_url ? (
                        <img src={testimonial.image_url} alt={testimonial.name} className="w-full h-full object-cover" />
                    ) : (
                        testimonial.name[0]
                    )}
                </div>
                <div>
                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
            </div>
        </div>
    </motion.div>
);

const Testimonials = () => {
    const { testimonials } = useData();

    return (
        <section id="testimonials" className="py-24 premium-glass-green-bg relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
                        <span className="text-[#70E000]">Student</span>{' '}
                        <span className="bg-gradient-to-r from-white via-white via-70% to-gray-500 text-transparent bg-clip-text">Stories</span>
                    </h2>
                    <p className="text-gray-400 text-lg">Hear from the founders building the future.</p>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 mb-16">
                    {testimonials?.items?.map((t, index) => (
                        <TestimonialCard key={t.id} testimonial={t} index={index} />
                    ))}
                </div>

                <div className="text-center">
                    <Button variant="accent" className="px-8 py-4 shadow-[0_0_20px_rgba(112,224,0,0.3)] hover:shadow-[0_0_30px_rgba(112,224,0,0.5)]">
                        View All Testimonials <ArrowRight size={20} />
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;

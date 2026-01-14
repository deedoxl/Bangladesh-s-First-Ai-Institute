import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import Button from '../ui/Button';
import { useData } from '../../context/DataContext';

const Book3D = ({ image, title, type }) => {
    return (
        <div className="w-[180px] h-[260px] relative preserve-3d group-hover:rotate-y-[-10deg] transition-transform duration-500 ease-out cursor-pointer mx-auto mb-8 perspective-[1000px] z-10">
            {/* Glow Under Book (Green) */}
            <div className="absolute -bottom-8 left-0 right-0 h-4 bg-[#70E000]/30 blur-2xl rounded-full transform scale-x-75 group-hover:scale-x-90 transition-transform duration-500" />

            {/* Spine (Darker for realism) */}
            <div className="absolute left-0 top-0 bottom-0 w-[30px] bg-[#111] transform -translate-x-[14px] translate-z-[-10px] rotate-y-[-90deg] shadow-2xl brightness-75 rounded-l-sm" />
            {/* Pages (White) */}
            <div className="absolute right-1 top-1 bottom-1 w-[20px] bg-[#eee] transform translate-z-[-2px]" />

            {/* Front Cover */}
            <div className="absolute inset-0 bg-[#0A0A0A] rounded-r-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform translate-z-[0px] overflow-hidden border-l border-white/5 group-hover:translate-y-[-5px] transition-all">
                {/* Dynamic Image Mapping */}
                <div className="absolute inset-0 z-0">
                    <img src={image} alt={title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent" />
                </div>

                {/* Text Overlay */}
                <div className="absolute bottom-5 left-5 right-5 z-10">
                    <span className="text-[10px] font-bold text-[#70E000] uppercase tracking-widest mb-2 block">{type}</span>
                    <h4 className="text-base font-bold text-white leading-tight">{title}</h4>
                </div>

                {/* Subtle highlight/sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
        </div>
    );
};

const ResourceCard = ({ resource, index }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        viewport={{ once: true }}
        className="group h-full"
    >
        <div className="bg-transparent p-0 rounded-3xl flex flex-col items-center text-center h-full relative overflow-visible">
            <Book3D image={resource.image} title={resource.title} type={resource.type} />

            <div className="mt-auto w-full px-4">
                <a href={resource.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button variant="accent" className="w-full py-3 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(112,224,0,0.3)] hover:shadow-[0_0_25px_rgba(112,224,0,0.6)]">
                        <Download size={16} /> Download
                    </Button>
                </a>
            </div>
        </div>
    </motion.div>
);

const FreeResources = () => {
    const { resources } = useData();

    return (
        <section id="resources" className="py-24 premium-glass-green-bg relative">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
                            <span className="text-[#70E000]">Free</span>{' '}
                            <span className="bg-gradient-to-r from-white via-white via-70% to-gray-500 text-transparent bg-clip-text">Resources</span>
                        </h2>
                        <p className="text-deedox-text-secondary text-lg font-light">
                            Hand-picked tools, templates, and guides to accelerate your startup journey without spending a dime.
                        </p>
                    </div>
                    <Button variant="outline" className="px-6 py-3">View All Resources</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {resources?.items?.map((res, index) => (
                        <ResourceCard key={res.id} resource={res} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FreeResources;

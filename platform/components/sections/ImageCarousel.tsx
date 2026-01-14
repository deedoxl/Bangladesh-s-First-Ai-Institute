"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';

const ImageCard = ({ item }: { item: any }) => {
    // If it's a link, wrap in anchor
    const Content = () => (
        <div className="flex-shrink-0 w-[300px] md:w-[480px] h-[180px] md:h-[280px] rounded-2xl overflow-hidden mx-4 relative group cursor-pointer transition-transform hover:scale-[1.02] border border-white/5 bg-white/5 hover:border-[#70E000]/50 shadow-lg hover:shadow-[0_0_30px_rgba(112,224,0,0.15)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={item.image || `https://placehold.co/480x280/1e2139/FFFFFF/png?text=${encodeURIComponent(item.text)}`}
                alt={item.text}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" // Started dimmed, brightens on hover
                loading="lazy"
            />
            {/* Text Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center p-4 backdrop-blur-sm group-hover:backdrop-blur-none">
                <h3 className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-2xl uppercase tracking-wider translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{item.text}</h3>
            </div>
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] pointer-events-none" />
        </div>
    );

    if (item.link && item.link !== '#') {
        return (
            <a href={item.link} target="_blank" rel="noopener noreferrer">
                <Content />
            </a>
        );
    }

    return <Content />;
};

const CarouselRow = ({ items, direction = 'left' }: { items: any[], direction?: 'left' | 'right' }) => {
    // Triple items for seamless loop
    const rowItems = [...items, ...items, ...items];

    return (
        <div className="flex overflow-hidden relative w-full py-4 group">
            <div
                className={cn(
                    "flex w-max pause-on-hover",
                    direction === 'left' ? "animate-scroll-left" : "animate-scroll-right"
                )}
            >
                {rowItems.map((item, index) => (
                    <ImageCard key={`${item.id}-${index}`} item={item} />
                ))}
            </div>
        </div>
    );
};

const ImageCarousel = () => {
    const { carousel } = useData() as any;
    const items = carousel?.items?.length > 0 ? carousel.items : [{ id: 0, text: 'No Items', image: '', link: '#' }];

    return (
        <section className="py-20 bg-[#050505] overflow-hidden space-y-4 md:space-y-8">
            <CarouselRow items={items} direction="left" />
            <CarouselRow items={items} direction="right" />
        </section>
    );
};

export default ImageCarousel;

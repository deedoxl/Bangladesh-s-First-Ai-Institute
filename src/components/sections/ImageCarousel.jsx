import React from 'react';
import { cn } from '../../utils/cn';
import { useData } from '../../context/DataContext';

const ImageCard = ({ item, enableBlur }) => {
    // If enabled, use a standard subtle blur, else 0.
    // We ignore 'clarity' prop now as we are strictly using global On/Off per user request.
    const blurPx = enableBlur ? 3 : 0;

    // If it's a link, wrap in anchor
    const Content = () => (
        <div className="flex-shrink-0 w-[300px] md:w-[480px] h-[180px] md:h-[280px] rounded-2xl overflow-hidden mx-4 relative group cursor-pointer transition-transform hover:scale-[1.02] border border-white/5 bg-white/5 hover:border-deedox-accent-primary/50 shadow-lg hover:shadow-[0_0_30px_rgba(112,224,0,0.15)]">
            <img
                src={item.image || item.image_url || item.img || item.url || `https://placehold.co/480x280/1e2139/FFFFFF/png?text=${encodeURIComponent(item.text || item.title)}`}
                alt={item.text || item.title}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/480x280/1e2139/FFFFFF/png?text=Error"; }} // Fallback on broken link
                className={cn("w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100")} // Started dimmed, brightens on hover
                style={{ filter: `blur(${blurPx}px)` }}
                loading="lazy"
            />
            {/* Text Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center p-4 backdrop-blur-sm group-hover:backdrop-blur-none">
                <h3 className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-2xl uppercase tracking-wider translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{item.text || item.title}</h3>
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

const CarouselRow = ({ items, direction = 'left', enableBlur }) => {
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
                    <ImageCard key={`${item.id}-${index}`} item={item} enableBlur={enableBlur} />
                ))}
            </div>
        </div>
    );
};

const ImageCarousel = () => {
    // USE NEW TABLE DATA & SETTINGS
    const { slideImagesTable, slideSettings, loadingContent } = useData();

    // 0. Wait for Load to prevent flash (Pop-in is better than Flash-out)
    if (loadingContent) return null;

    // 1. Global Visibility Check
    const showSlider = slideSettings?.sliderEnabled !== false; // default true
    if (!showSlider) return null;

    // 2. Blur Logic
    const enableBlur = slideSettings?.blurEnabled !== false; // default true

    // Filter enabled items
    const items = slideImagesTable?.items
        ?.filter(item => item.enabled)
        ?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        || [];

    // Fallback if empty sorting/fetching
    const safeItems = items.length > 0
        ? items
        : [{ id: 0, title: 'No Slides', image_url: '', link: '#' }];

    return (
        <section className="py-20 bg-deedox-bg-dark overflow-hidden space-y-4 md:space-y-8">
            {/* key added to force re-render when items change */}
            <CarouselRow key={`row-left-${safeItems.length}`} items={safeItems} direction="left" enableBlur={enableBlur} />
            <CarouselRow key={`row-right-${safeItems.length}`} items={safeItems} direction="right" enableBlur={enableBlur} />
        </section>
    );
};

export default ImageCarousel;

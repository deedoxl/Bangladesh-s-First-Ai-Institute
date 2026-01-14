import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

const LatestNews = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestNews = async () => {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false })
                .limit(3);

            if (!error && data) {
                setNews(data);
            }
            setLoading(false);
        };

        fetchLatestNews();

        // Realtime Subscription for immediate updates
        const channel = supabase.channel('latest_news_home')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, fetchLatestNews)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    if (loading) return null; // Don't show anything while loading to avoid layout shift, or show skeleton? Prefer clean.
    if (news.length === 0) return null; // Hide section if no news

    return (
        <section className="relative py-24 px-4 overflow-hidden premium-glass-green-bg">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[200px] bg-deedox-accent-primary/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-7xl relative z-10">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-white/5 pb-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deedox-accent-primary/10 border border-deedox-accent-primary/20 text-deedox-accent-primary text-xs font-bold uppercase tracking-widest mb-2">
                            <Sparkles size={12} />
                            <span>Latest Updates</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Newsroom</span>
                        </h2>
                    </div>
                    <div>
                        <Link to="/news">
                            <Button variant="outline" className="group">
                                View Full Portal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {news.map((item, index) => (
                        <Link
                            to="/news"
                            target="_blank"
                            key={item.id}
                            className="group relative flex flex-col h-full"
                        >
                            {/* Card Container with Glass Effect */}
                            <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm transition-all duration-500 group-hover:border-deedox-accent-primary/30 group-hover:bg-white/10" />

                            {/* Image Wrapper */}
                            <div className="relative h-56 m-2 rounded-xl overflow-hidden">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                                <img
                                    src={item.image_url || 'https://placehold.co/600x400/101010/70E000/png?text=AI+News'}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {/* Date Badge */}
                                <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                                    <Calendar size={12} className="text-deedox-accent-primary" />
                                    <span className="text-xs font-bold text-white uppercase">{new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="relative p-6 flex flex-col flex-grow z-10">
                                <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-deedox-accent-primary transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-white/50 text-sm line-clamp-3 mb-6 flex-grow">
                                    {item.description}
                                </p>

                                <span className="inline-flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest opacity-60 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                                    Read Article <ArrowRight size={12} className="text-deedox-accent-primary" />
                                </span>
                            </div>

                            {/* Neon Glow Hover Effect */}
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[0_0_30px_rgba(112,224,0,0.1)]" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LatestNews;

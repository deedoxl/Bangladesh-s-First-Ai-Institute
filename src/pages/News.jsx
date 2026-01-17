import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, ArrowRight, Mail, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import SEO from '../components/common/SEO';

const News = () => {
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Newsletter States
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setNews(data);
            }
            setLoading(false);
        };

        fetchNews();

        // Realtime updates for News
        const channel = supabase.channel('public_news_page')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, fetchNews)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setSubmitting(true);
        const { error } = await supabase.from('newsletter_subscribers').insert([{ email }]);

        if (!error) {
            setSubscribed(true);
            setEmail('');
        } else {
            if (error.code === '23505') { // Unique violation
                alert('You are already subscribed!');
            } else {
                console.error(error);
                alert('Something went wrong. Please try again.');
            }
        }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-20 md:pt-24 pb-20 px-4 relative overflow-hidden">
            <SEO
                title="AI News"
                description="Latest updates and insights on Artificial Intelligence from DEEDOX."
                keywords="AI News, Tech News, Artificial Intelligence Updates, Machine Learning News"
                url="/news"
            />
            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-deedox-accent-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
            </div>

            <div className="container mx-auto max-w-6xl relative z-10 space-y-20">

                {/* 1. Header Section */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-deedox-accent-primary/10 border border-deedox-accent-primary/20 text-deedox-accent-primary text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                        <Sparkles size={12} />
                        <span>Intelligence Hub</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-4">
                        AI <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#70E000] to-[#408000] drop-shadow-[0_0_15px_rgba(112,224,0,0.5)]">News</span> Portal
                    </h1>
                    <p className="text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
                        Stay ahead of the curve. Curated updates on Artificial Intelligence, Machine Learning, and the future of tech.
                    </p>
                </div>

                {/* 2. Featured / Latest News Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-deedox-accent-primary" size={48} />
                    </div>
                ) : news.length === 0 ? (
                    <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                        <p className="text-white/30 text-xl font-medium">No published articles yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((item, index) => (
                            <div
                                key={item.id}
                                className="group relative bg-[#101010]/60 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-xl transition-all duration-500 hover:border-deedox-accent-primary/30 hover:shadow-[0_0_40px_rgba(112,224,0,0.1)] hover:-translate-y-2 flex flex-col"
                            >
                                {/* Image */}
                                <div className="h-60 w-full overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#101010] to-transparent opacity-60 z-10" />
                                    <img
                                        src={item.image_url || 'https://placehold.co/800x600/101010/70E000/png?text=DEEDOX+News'}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Date Tag */}
                                    <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                                        <Calendar size={12} className="text-deedox-accent-primary" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col flex-grow relative z-20">
                                    <h2 className="text-2xl font-bold leading-tight text-white mb-4 group-hover:text-deedox-accent-primary transition-colors">
                                        {item.title}
                                    </h2>
                                    <p className="text-white/50 text-sm line-clamp-3 mb-8 flex-grow leading-relaxed">
                                        {item.description}
                                    </p>

                                    {/* Action */}
                                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                        <button
                                            onClick={() => navigate(`/news/${item.id}`)}
                                            className="text-xs font-bold text-deedox-accent-primary uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all hover:underline"
                                        >
                                            Read Full Release <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 3. Newsletter Subscription Section (Premium Glass) */}
                <div className="relative rounded-[40px] overflow-hidden p-1">
                    {/* Animated Border Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-deedox-accent-primary/30 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

                    <div className="relative bg-[#0A0A0A] rounded-[38px] p-6 md:p-16 text-center border border-white/10 backdrop-blur-2xl overflow-hidden">
                        {/* Inner Glows */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-deedox-accent-primary/10 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />

                        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10 mb-4 shadow-[0_0_30px_rgba(112,224,0,0.2)]">
                                <Mail size={32} className="text-deedox-accent-primary" />
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-4xl font-bold text-white">Join the <span className="text-deedox-accent-primary">Inner Circle</span></h2>
                                <p className="text-white/60">
                                    Get exclusive AI insights, early access to tools, and top news delivered directly to your inbox. No spam, just value.
                                </p>
                            </div>

                            {!subscribed ? (
                                <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        className="flex-grow bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white outline-none focus:border-deedox-accent-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-deedox-accent-primary text-black font-bold px-8 py-4 rounded-full hover:shadow-[0_0_20px_#70E000] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {submitting ? 'Subscribing...' : 'Subscribe Now'}
                                    </button>
                                </form>
                            ) : (
                                <div className="bg-deedox-accent-primary/10 border border-deedox-accent-primary/20 rounded-2xl p-6 flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
                                    <CheckCircle size={32} className="text-deedox-accent-primary" />
                                    <h3 className="text-xl font-bold text-white">You're Subscribed!</h3>
                                    <p className="text-white/50 text-sm">Welcome to the future of AI news.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default News;

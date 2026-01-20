import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Calendar, Loader2, Share2 } from 'lucide-react';
import Button from '../components/ui/Button';
import SEO from '../components/common/SEO';

const NewsDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [newsItem, setNewsItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewsItem = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setNewsItem(data);
            } else {
                console.error("Error fetching news:", error);
            }
            setLoading(false);
        };

        fetchNewsItem();
    }, [id]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: newsItem.title,
                    text: newsItem.description,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-deedox-accent-primary" size={48} />
            </div>
        );
    }

    if (!newsItem) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white space-y-4">
                <h1 className="text-3xl font-bold">News Not Found</h1>
                <Button variant="outline" onClick={() => navigate('/news')}>Back to News</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4 relative overflow-hidden">
            <SEO
                title={newsItem.title}
                description={newsItem.description}
                image={newsItem.image_url}
                url={`/news/${newsItem.id}`}
                type="article"
                datePublished={newsItem.created_at}
                dateModified={newsItem.updated_at || newsItem.created_at}
            />
            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-deedox-accent-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10 space-y-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/news')}
                    className="flex items-center gap-2 text-white/50 hover:text-deedox-accent-primary transition-colors text-sm uppercase font-bold tracking-widest"
                >
                    <ArrowLeft size={16} /> Back to News
                </button>

                {/* Hero Image */}
                <div className="w-full h-[400px] md:h-[500px] rounded-[40px] overflow-hidden border border-white/10 relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
                    <img
                        src={newsItem.image_url || 'https://placehold.co/1200x600/101010/70E000/png?text=DEEDOX+News'}
                        alt={newsItem.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-deedox-accent-primary">
                                <Calendar size={14} />
                                <span className="text-xs font-bold uppercase tracking-wider text-white">
                                    {new Date(newsItem.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight max-w-3xl">
                            {newsItem.title}
                        </h1>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-[#101010]/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/5">
                    {/* Share / Actions */}
                    <div className="flex justify-between items-start mb-8 pb-8 border-b border-white/5">
                        <div className="text-lg text-deedox-accent-primary font-medium italic">
                            "{newsItem.description}"
                        </div>
                        <button
                            onClick={handleShare}
                            className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                            title="Share Article"
                        >
                            <Share2 size={20} />
                        </button>
                    </div>

                    {/* Main Text */}
                    <article className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-white/70 prose-a:text-deedox-accent-primary prose-strong:text-white">
                        <div className="whitespace-pre-wrap">{newsItem.content || "No additional content available."}</div>
                    </article>
                </div>
            </div>
        </div>
    );
};

export default NewsDetails;

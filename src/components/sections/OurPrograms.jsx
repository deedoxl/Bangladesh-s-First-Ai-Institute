import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, BarChart, User, ArrowRight, X, Calendar, Users, 
    Sparkles, Zap, Play, Volume2, VolumeX, Maximize, Pause, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useData } from '../../context/DataContext';
import ProAccessModal from '../popups/ProAccessModal';

// Load YouTube Iframe API if not loaded
const loadYouTubeAPI = (callback) => {
    if (window.YT && window.YT.Player) {
        callback();
        return;
    }

    if (!window.onYouTubeIframeAPIReady) {
        const callbacks = [];
        window.onYouTubeIframeAPIReady = () => {
            callbacks.forEach(cb => cb());
        };
        window.onYouTubeIframeAPIReady.callbacks = callbacks;

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady.callbacks.push(callback);
};

const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds === null) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const Rewind10Icon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <text x="12" y="15" fontSize="7.5" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
    </svg>
);

const Forward10Icon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <text x="12" y="15" fontSize="7.5" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
    </svg>
);

const CustomGlassVideoPlayer = ({ videoId, title }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    const progressBarRef = useRef(null);
    const pollingRef = useRef(null);

    useEffect(() => {
        loadYouTubeAPI(() => {
            if (!document.getElementById('yt-player-embed')) return;
            
            playerRef.current = new window.YT.Player('yt-player-embed', {
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    fs: 0,
                    disablekb: 1,
                    origin: window.location.origin
                },
                events: {
                    onReady: (event) => {
                        setDuration(event.target.getDuration() || 0);
                        setIsPlaying(true);
                        startPolling();
                    },
                    onStateChange: (event) => {
                        if (event.data === 1) { // Playing
                            setIsPlaying(true);
                            startPolling();
                        } else if (event.data === 2) { // Paused
                            setIsPlaying(false);
                            stopPolling();
                        } else if (event.data === 0) { // Ended
                            setIsPlaying(false);
                            stopPolling();
                            setProgress(100);
                            setCurrentTime(event.target.getDuration());
                        }
                    },
                    onPlaybackRateChange: (event) => {
                        setPlaybackRate(event.data);
                    }
                }
            });
        });

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            stopPolling();
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy();
            }
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [videoId]);

    const startPolling = () => {
        stopPolling();
        pollingRef.current = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                const current = playerRef.current.getCurrentTime();
                const dur = playerRef.current.getDuration() || 0;
                setCurrentTime(current);
                setDuration(dur);
                if (dur > 0) {
                    setProgress((current / dur) * 100);
                }
            }
        }, 250);
    };

    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
        }
    };

    const togglePlayPause = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const handleSeek = (e) => {
        if (!playerRef.current || duration === 0 || !progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const newTime = percentage * duration;
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
        setProgress(percentage * 100);
    };

    const handleSkip = (seconds) => {
        if (!playerRef.current || duration === 0) return;
        const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
        setProgress((newTime / duration) * 100);
    };

    const cycleSpeed = () => {
        if (!playerRef.current) return;
        const speeds = [0.5, 1, 1.25, 1.5, 2];
        const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
        const nextSpeed = speeds[nextIndex];
        playerRef.current.setPlaybackRate(nextSpeed);
        setPlaybackRate(nextSpeed);
    };

    const toggleMute = () => {
        if (!playerRef.current) return;
        if (isMuted) {
            playerRef.current.unMute();
            setIsMuted(false);
        } else {
            playerRef.current.mute();
            setIsMuted(true);
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black group select-none">
            {/* Embedded YT Player */}
            <div id="yt-player-embed" className="w-full h-full pointer-events-none"></div>

            {/* Clickable transparent overlay to toggle play/pause */}
            <div 
                className="absolute inset-0 z-10 w-full h-full cursor-pointer" 
                onClick={togglePlayPause}
            ></div>

            {/* Premium Liquid Glass Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-4 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-3">
                
                {/* Seekbar Track */}
                <div 
                    ref={progressBarRef}
                    onClick={handleSeek}
                    className="w-full h-4 flex items-center cursor-pointer group/seek"
                >
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden relative backdrop-blur-md border border-white/5 transition-all group-hover/seek:h-1.5">
                        {/* Progress Fill */}
                        <div 
                            style={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-[#70E000] to-[#9EF000] relative rounded-full"
                        >
                            {/* Glow seeker knob */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border border-[#70E000] shadow-[0_0_8px_#70E000] opacity-0 group-hover/seek:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                </div>

                {/* Control buttons bar */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button 
                            onClick={togglePlayPause}
                            className="text-[#70E000] hover:text-[#82F000] transition-colors p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
                        >
                            {isPlaying ? <Pause size={14} fill="#70E000" /> : <Play size={14} fill="#70E000" />}
                        </button>

                        {/* Rewind 10s */}
                        <button 
                            onClick={() => handleSkip(-10)}
                            className="text-gray-300 hover:text-white transition-colors p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
                            title="Rewind 10 seconds"
                        >
                            <Rewind10Icon size={14} />
                        </button>

                        {/* Forward 10s */}
                        <button 
                            onClick={() => handleSkip(10)}
                            className="text-gray-300 hover:text-white transition-colors p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
                            title="Forward 10 seconds"
                        >
                            <Forward10Icon size={14} />
                        </button>

                        {/* Mute/Unmute */}
                        <button 
                            onClick={toggleMute}
                            className="text-gray-300 hover:text-white transition-colors p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
                        >
                            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>

                        {/* Timer */}
                        <span className="text-[11px] text-gray-300 font-mono tracking-wider">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Speed cycle selector */}
                        <button 
                            onClick={cycleSpeed}
                            className="text-[10px] text-gray-300 hover:text-white font-extrabold px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                            title="Playback Speed"
                        >
                            {playbackRate === 1 ? '1.0x (Normal)' : `${playbackRate}x`}
                        </button>

                        {/* Fullscreen */}
                        <button 
                            onClick={toggleFullscreen}
                            className="text-gray-300 hover:text-white transition-colors p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
                        >
                            <Maximize size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProgramDetailModal = ({ program, onClose, isDashboard = false }) => {
    const [isPlayingVideo, setIsPlayingVideo] = useState(false);
    const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(0);

    if (!program) return null;

    const playlist = program.playlist || [];
    const hasPlaylist = playlist.length > 0;
    const isLocked = hasPlaylist && selectedPlaylistIndex > 0 && !isDashboard;

    // Helper to get YouTube ID
    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        let match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const currentLesson = hasPlaylist ? playlist[selectedPlaylistIndex] : null;
    const activeVideoUrl = currentLesson ? (currentLesson.video_url || currentLesson.videoUrl) : program.video_url;
    const currentLessonTitle = currentLesson ? currentLesson.title : program.title;

    const videoId = getYouTubeVideoId(activeVideoUrl);
    const thumbnailUrl = videoId 
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
        : (program.image || 'https://placehold.co/640x360/101010/70E000/png?text=Preview');

    // Helper for headline highlighting: wraps **bold** parts or auto-highlights keywords
    const renderHeadline = (text, fallback) => {
        const raw = text || fallback;
        if (!raw) return null;
        const parts = raw.split('**');
        if (parts.length > 1) {
            return parts.map((part, index) => 
                index % 2 === 1 ? <span key={index} className="text-[#70E000]">{part}</span> : part
            );
        }
        // Auto highlight common keywords
        const keywords = ['2-Hour Live AI Workshop', 'Live AI Workshop', 'AI Startup Institute', 'AI Workshop', 'AI', 'Live'];
        for (let word of keywords) {
            if (raw.includes(word)) {
                const pieces = raw.split(word);
                return (
                    <span key={word}>
                        {pieces[0]}
                        <span className="text-[#70E000]">{word}</span>
                        {pieces[1]}
                    </span>
                );
            }
        }
        return raw;
    };

    // Helper to style pricing/footer text
    const renderFooterText = (text) => {
        let raw = text || "Created by DEEDOX";
        if (raw.includes("Starting at just PKR 1,99") || raw.includes("Limited Time Offer")) {
            raw = "Created by DEEDOX";
        }
        const parts = raw.split(/(DEEDOX|PKR \d+[\d,]*|USD \d+[\d,]*)/gi);
        return parts.map((part, idx) => {
            if (/DEEDOX/i.test(part)) {
                return <span key={idx} className="text-[#70E000] font-bold">{part}</span>;
            }
            if (/(PKR \d+[\d,]*|USD \d+[\d,]*)/i.test(part)) {
                return <span key={idx} className="text-[#70E000] font-bold">{part}</span>;
            }
            return part;
        });
    };

    const features = [
        program.popup_feature_1,
        program.popup_feature_2,
        program.popup_feature_3,
        program.popup_feature_4
    ].filter(Boolean);

    // Fallback default features if none are saved
    const displayFeatures = features.length > 0 ? features : [
        'AI Fundamentals',
        'AI Agents',
        'Content Creation',
        'Vibe Coding'
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md overflow-y-auto py-8 px-4"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className={`w-full bg-[#0C0C0F] border border-white/10 rounded-3xl overflow-hidden relative shadow-[0_0_50px_rgba(112,224,0,0.15)] flex flex-col my-auto transition-all duration-300 ${hasPlaylist ? 'max-w-4xl' : 'max-w-xl'}`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 text-gray-400 hover:text-white transition-colors cursor-pointer bg-[#18181C] hover:bg-[#25252B] p-2 rounded-full border border-white/5"
                    aria-label="Close modal"
                >
                    <X size={18} />
                </button>

                <div className="p-6 md:p-8 flex flex-col h-full overflow-y-auto max-h-[85vh] scrollbar-thin">
                    {/* Header Badges */}
                    <div className="flex justify-center items-center gap-3 mb-4 mt-2">
                        <span className="flex items-center gap-1.5 bg-[#FF0055]/10 border border-[#FF0055]/20 text-[#FF0055] px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF0055] animate-pulse" />
                            {program.popup_badge_left || 'LIVE SESSION'}
                        </span>
                        <span className="flex items-center gap-1.5 bg-[#70E000]/10 border border-[#70E000]/20 text-[#70E000] px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                            <Sparkles size={12} />
                            {program.popup_badge_right || 'Only 10 seats left!'}
                        </span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-center text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight leading-tight px-2">
                        {renderHeadline(program.popup_headline, `Join Our Live ${program.title} Workshop`)}
                    </h3>

                    {/* Subheadline */}
                    <p className="text-center text-gray-400 text-xs md:text-sm font-light max-w-md mx-auto mb-6 leading-relaxed px-2">
                        {program.popup_subheadline || `Master AI tools and work hands-on with AI in this intensive training session.`}
                    </p>

                    {hasPlaylist ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
                            {/* Left Pane (Player and Details) */}
                            <div className="lg:col-span-7 flex flex-col">
                                {/* Video Player Box */}
                                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black mb-6 group shadow-lg">
                                    {isLocked ? (
                                        <div className="absolute inset-0 bg-[#0C0C0F]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center border border-white/10 rounded-2xl">
                                            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3 animate-pulse">
                                                <Lock size={20} className="text-red-500" />
                                            </div>
                                            <h4 className="text-white font-extrabold text-sm md:text-base mb-1">Part Locked</h4>
                                            <p className="text-gray-400 text-[10px] md:text-xs max-w-xs mb-4">
                                                Log in to your Student Dashboard to unlock all parts and lessons of this program.
                                            </p>
                                            <Link
                                                to="/student/login"
                                                className="bg-[#70E000] hover:bg-[#82F000] text-black font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg hover:scale-[1.02]"
                                            >
                                                Log In Dashboard
                                            </Link>
                                        </div>
                                    ) : isPlayingVideo && videoId ? (
                                        <CustomGlassVideoPlayer videoId={videoId} title={currentLessonTitle} />
                                    ) : (
                                        <div className="relative w-full h-full cursor-pointer" onClick={() => videoId && setIsPlayingVideo(true)}>
                                            <img
                                                src={thumbnailUrl}
                                                alt="Video Preview"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/55 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                                                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 transition-transform duration-300 group-hover:scale-110 shadow-2xl">
                                                    <Play size={24} className="text-white fill-white ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] md:text-xs px-3 py-1.5 rounded-full border border-white/10">
                                                {currentLessonTitle}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Info Cards */}
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="bg-[#141416] border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                                        <Calendar size={18} className="text-[#70E000] mb-1" />
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">DATE</span>
                                        <span className="text-xs md:text-sm font-bold text-white mt-0.5 whitespace-nowrap">
                                            {program.popup_date || program.duration}
                                        </span>
                                    </div>
                                    <div className="bg-[#141416] border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                                        <Clock size={18} className="text-[#70E000] mb-1" />
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">TIME</span>
                                        <span className="text-xs md:text-sm font-bold text-white mt-0.5 whitespace-nowrap">
                                            {program.popup_time || '4:00 PM PKT'}
                                        </span>
                                    </div>
                                    <div className="bg-[#141416] border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                                        <Users size={18} className="text-[#70E000] mb-1" />
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">ENROLLED</span>
                                        <span className="text-xs md:text-sm font-bold text-white mt-0.5 whitespace-nowrap">
                                            {program.popup_enrolled || '1,33+'}
                                        </span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-4 mb-6">
                                    {displayFeatures.map((feat, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-gray-300 text-xs md:text-sm">
                                            <Zap size={14} className="text-[#70E000] flex-shrink-0 fill-[#70E000]/10" />
                                            <span className="font-medium truncate">{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <a
                                        href={program.popup_btn_primary_link || program.link || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full"
                                        onClick={(e) => {
                                            if ((program.popup_btn_primary_link || program.link || '#') === '#') {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        <button className="w-full bg-[#70E000] hover:bg-[#82F000] text-black font-extrabold text-xs md:text-sm py-4 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(112,224,0,0.25)] transition-all hover:scale-[1.02] cursor-pointer">
                                            {program.popup_btn_primary_text || 'Reserve My Seat Now'}
                                            <ArrowRight size={16} />
                                        </button>
                                    </a>
                                    <button
                                        onClick={onClose}
                                        className="w-full bg-[#161619] hover:bg-[#202025] text-gray-300 hover:text-white font-bold text-xs md:text-sm py-4 px-4 rounded-2xl flex items-center justify-center border border-white/5 transition-all cursor-pointer"
                                    >
                                        {program.popup_btn_secondary_text || 'Maybe Later'}
                                    </button>
                                </div>
                            </div>

                            {/* Right Pane (Playlist) */}
                            <div className="lg:col-span-5 flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <Play size={14} className="text-[#70E000]" />
                                        Course Playlist
                                    </h4>
                                    <span className="bg-[#70E000]/10 text-[#70E000] text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-[#70E000]/20">
                                        {playlist.length} {playlist.length === 1 ? 'Part' : 'Parts'}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {playlist.map((item, index) => {
                                        const isItemLocked = index > 0 && !isDashboard;
                                        const isItemActive = index === selectedPlaylistIndex;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedPlaylistIndex(index);
                                                    if (!isItemLocked) {
                                                        setIsPlayingVideo(true);
                                                    } else {
                                                        setIsPlayingVideo(false);
                                                    }
                                                }}
                                                className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 flex items-center gap-3 relative overflow-hidden group cursor-pointer ${
                                                    isItemActive
                                                        ? 'bg-[#70E000]/10 border-[#70E000] text-[#70E000] shadow-[0_0_15px_rgba(112,224,0,0.1)]'
                                                        : 'bg-[#141416]/50 border-white/5 text-white hover:bg-[#141416]/80 hover:border-white/10'
                                                } ${isItemLocked ? 'opacity-60' : ''}`}
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                                    isItemActive 
                                                        ? 'bg-[#70E000] text-black' 
                                                        : 'bg-white/5 text-white/60'
                                                }`}>
                                                    {isItemLocked ? (
                                                        <Lock size={12} className="text-white/40" />
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <h5 className="font-bold text-xs md:text-sm truncate pr-4">
                                                        {item.title || `Part ${index + 1}`}
                                                    </h5>
                                                    <span className="text-[10px] text-gray-500 font-mono">
                                                        {isItemLocked ? 'Premium Lesson' : 'Unlocked'}
                                                    </span>
                                                </div>
                                                {isItemLocked && (
                                                    <Lock size={14} className="text-white/30 absolute right-4 top-1/2 transform -translate-y-1/2" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Standard Single-Column Layout when there is no playlist
                        <>
                            {/* Video Player Box */}
                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black mb-6 group shadow-lg">
                                {isPlayingVideo && videoId ? (
                                    <CustomGlassVideoPlayer videoId={videoId} title={program.title} />
                                ) : (
                                    <div className="relative w-full h-full cursor-pointer" onClick={() => videoId && setIsPlayingVideo(true)}>
                                        <img
                                            src={thumbnailUrl}
                                            alt="Video Preview"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/55 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 transition-transform duration-300 group-hover:scale-110 shadow-2xl">
                                                <Play size={24} className="text-white fill-white ml-1" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] md:text-xs px-3 py-1.5 rounded-full border border-white/10">
                                            {program.title} Preview
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info Cards */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-[#141416] border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                                    <Calendar size={18} className="text-[#70E000] mb-1" />
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">DATE</span>
                                    <span className="text-xs md:text-sm font-bold text-white mt-0.5 whitespace-nowrap">
                                        {program.popup_date || program.duration}
                                    </span>
                                </div>
                                <div className="bg-[#141416] border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                                    <Clock size={18} className="text-[#70E000] mb-1" />
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">TIME</span>
                                    <span className="text-xs md:text-sm font-bold text-white mt-0.5 whitespace-nowrap">
                                        {program.popup_time || '4:00 PM PKT'}
                                    </span>
                                </div>
                                <div className="bg-[#141416] border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                                    <Users size={18} className="text-[#70E000] mb-1" />
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">ENROLLED</span>
                                    <span className="text-xs md:text-sm font-bold text-white mt-0.5 whitespace-nowrap">
                                        {program.popup_enrolled || '1,33+'}
                                    </span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-4 mb-6">
                                {displayFeatures.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-gray-300 text-xs md:text-sm">
                                        <Zap size={14} className="text-[#70E000] flex-shrink-0 fill-[#70E000]/10" />
                                        <span className="font-medium truncate">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <a
                                    href={program.popup_btn_primary_link || program.link || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full"
                                    onClick={(e) => {
                                        if ((program.popup_btn_primary_link || program.link || '#') === '#') {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    <button className="w-full bg-[#70E000] hover:bg-[#82F000] text-black font-extrabold text-xs md:text-sm py-4 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(112,224,0,0.25)] transition-all hover:scale-[1.02] cursor-pointer">
                                        {program.popup_btn_primary_text || 'Reserve My Seat Now'}
                                        <ArrowRight size={16} />
                                    </button>
                                </a>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-[#161619] hover:bg-[#202025] text-gray-300 hover:text-white font-bold text-xs md:text-sm py-4 px-4 rounded-2xl flex items-center justify-center border border-white/5 transition-all cursor-pointer"
                                >
                                    {program.popup_btn_secondary_text || 'Maybe Later'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Footer text */}
                    <div className="text-center text-gray-500 text-[10px] md:text-xs leading-relaxed">
                        {renderFooterText(program.popup_footer_text)}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ProgramCard = ({ program, index, onSelect, userProfile, isAdmin }) => {
    const isProUser = userProfile?.membership_type === 'pro' || 
                      userProfile?.membership_type === 'admin' || 
                      userProfile?.membership_type === 'dashboard_admin' || 
                      isAdmin;
    const isLocked = program.is_locked && !isProUser;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group relative cursor-pointer"
            onClick={() => onSelect(program, isLocked)}
        >
            {/* Card Content */}
            <div className="bg-[#0A0A0A] rounded-3xl overflow-hidden h-full flex flex-col border border-white/5 group-hover:border-[#70E000]/50 group-hover:shadow-[0_0_30px_rgba(112,224,0,0.1)] transition-all duration-500 relative z-10">

                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                    <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                        <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
                            {program.level}
                        </span>
                        {program.is_locked ? (
                            <span className={`px-3 py-1 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                                isProUser 
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                            }`}>
                                <Lock size={13} /> {isProUser ? 'PRO UNLOCKED' : 'PRO ONLY'}
                            </span>
                        ) : program.status && (
                            <span className="bg-[#70E000] text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_#70E000]">
                                {program.status}
                            </span>
                        )}
                    </div>
                    <img
                        src={program.image}
                        alt={program.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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

                    <div className="block w-full">
                        <Button
                            variant={isLocked ? "secondary" : "accent"}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(program, isLocked);
                            }}
                            className={`w-full justify-between rounded-xl py-4 hover:shadow-lg hover:-translate-y-1 transition-all ${
                                isLocked ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : ''
                            }`}
                        >
                            {isLocked ? (
                                <>
                                    <span className="flex items-center gap-2"><Lock size={16} /> Request Pro Access</span> <ArrowRight size={18} />
                                </>
                            ) : (
                                <>
                                    View Program <ArrowRight size={18} />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Glow Effect behind card */}
            <div className="absolute inset-0 bg-deedox-accent-primary/20 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10" />
        </motion.div>
    );
};

const OurPrograms = () => {
    const { programs, currentUser, userProfile, isAdmin } = useData();
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [proModalProgram, setProModalProgram] = useState(null);

    const handleSelectProgram = (program, isLocked) => {
        if (isLocked) {
            setProModalProgram(program);
        } else {
            setSelectedProgram(program);
        }
    };

    return (
        <section id="programs" className="py-24 relative premium-glass-green-bg">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">
                        <span className="text-[#70E000]">DEEDOX</span>{' '}
                        <span className="bg-gradient-to-r from-white via-white via-70% to-gray-500 text-transparent bg-clip-text">Programs</span>
                    </h2>
                    <p className="text-deedox-text-secondary max-w-2xl mx-auto text-lg font-light">
                        Industry-designed courses to help you master AI and build the future.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {programs?.items?.map((program, index) => (
                        <ProgramCard 
                            key={program.id} 
                            program={program} 
                            index={index} 
                            onSelect={handleSelectProgram}
                            userProfile={userProfile}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            </div>

            {/* Popup Modal */}
            <AnimatePresence>
                {selectedProgram && (
                    <ProgramDetailModal
                        program={selectedProgram}
                        onClose={() => setSelectedProgram(null)}
                    />
                )}
                {proModalProgram && (
                    <ProAccessModal
                        program={proModalProgram}
                        currentUser={currentUser}
                        userProfile={userProfile}
                        onClose={() => setProModalProgram(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};

export { ProgramDetailModal };
export default OurPrograms;

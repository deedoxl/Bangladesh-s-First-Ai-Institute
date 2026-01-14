import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import { useData } from '../../context/DataContext';

const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Programs', path: '/#programs' },
    { name: 'Our Mission', path: '/mission' },
    { name: 'AI Tools', path: '/ai-tools' },
    { name: 'Testimonials', path: '/#testimonials' },
];

const Header = () => {
    const { settings, headerSettings } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => setIsOpen(false), [location.pathname]);

    // Check for hash on load/location change to scroll
    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);

    // Glow Logic
    const getGlow = () => {
        switch (headerSettings?.glowIntensity) {
            case 'high': return `0 0 25px ${headerSettings.iconColor || '#70E000'}`;
            case 'low': return `0 0 10px ${headerSettings.iconColor || '#70E000'}`;
            default: return `0 0 15px ${headerSettings.iconColor || '#70E000'}`; // medium
        }
    };

    // Smooth scroll handler
    const handleNavClick = (path) => (e) => {
        if (path.startsWith('/#')) {
            // If we are already on the home page, prevent default and scroll
            if (location.pathname === '/') {
                e.preventDefault();
                const element = document.getElementById(path.substring(2)); // Remove /#
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
            // If we are NOT on home page, let Link handle navigation to '/'
        } else if (path.startsWith('#')) {
            e.preventDefault();
            const element = document.getElementById(path.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <header
            className={cn(
                "fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b border-transparent",
                scrolled ? "backdrop-blur-xl border-white/5 py-3 shadow-lg" : "bg-transparent py-5"
            )}
            style={{
                backgroundColor: scrolled ? '#00000099' : 'transparent'
            }}
        >
            <div className="container mx-auto px-6 h-full flex items-center justify-between">

                {/* Brand */}
                <Link
                    to="/"
                    className="flex items-center gap-2 group relative z-50 !bg-transparent bg-transparent outline-none border-none shadow-none ring-0"
                    style={{ background: 'transparent', backgroundColor: 'transparent', boxShadow: 'none' }}
                >
                    {settings.logoUrl ? (
                        <img
                            src={settings.logoUrl}
                            alt={settings.brandName || 'Bio'}
                            style={{
                                width: `${headerSettings?.logoWidth || 140}px`,
                                height: `${headerSettings?.logoHeight || 60}px`,
                                background: 'transparent !important',
                                backgroundColor: 'transparent !important',
                                boxShadow: 'none !important',
                                border: 'none !important',
                                outline: 'none !important',
                                backdropFilter: 'none !important',
                            }}
                            className="object-contain !bg-transparent bg-transparent border-none shadow-none outline-none ring-0 backdrop-filter-none m-0 p-0 block"
                        />
                    ) : (
                        <>
                            <div className="relative">
                                {/* Icon */}
                                <div
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                    style={{ boxShadow: getGlow() }}
                                >
                                    <div className="w-4 h-4 rounded-sm rotate-45" style={{ backgroundColor: headerSettings?.iconColor || '#70E000' }} />
                                    <div className="absolute inset-0 bg-white/5 blur-lg rounded-full -z-10 opacity-50" />
                                </div>
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-white/90 transition-colors">
                                {settings.brandName || "DEEDOX"}
                            </span>
                        </>
                    )}
                </Link>

                {/* --- Desktop Nav (Premium Animations) --- */}
                <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
                    {navLinks.map((link) => {
                        const displayName = link.name === 'AI Tools' ? (settings.aiPageTitle || 'AI Tools') : link.name;
                        // For desktop hash links on homepage, intercepts are handled by onClick
                        // For cross-page links, to={link.path} is sufficient with handleNavClick logic
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={handleNavClick(link.path)}
                                className="relative px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-[#70E000] transition-colors group"
                            >
                                {displayName}
                                {/* Hover Underline Reveal */}
                                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#70E000] rounded-full group-hover:w-1/2 transition-all duration-300 shadow-[0_0_10px_#70E000]" />
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    {location.pathname !== '/login' && (
                        <Link to="/login">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm tracking-wide hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all"
                            >
                                Dashboard
                            </motion.button>
                        </Link>
                    )}
                </div>



                {/* --- Mobile Hamburger --- */}
                <button
                    className="md:hidden text-white p-2 relative z-50 hover:text-[#70E000] transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={32} /> : <Menu size={32} />}
                </button>
            </div>

            {/* --- Mobile Menu (Full Screen - Liquid Glass) --- */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
                        animate={{ opacity: 1, clipPath: "circle(150% at 100% 0%)" }}
                        exit={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="fixed inset-0 top-0 bg-black/60 z-40 flex flex-col items-center justify-center gap-8 backdrop-blur-3xl"
                    >
                        {navLinks.map((link, i) => {
                            const displayName = link.name === 'AI Tools' ? (settings.aiPageTitle || 'AI Tools') : link.name;
                            return (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.1 }}
                                >
                                    <Link
                                        to={link.path}
                                        onClick={(e) => {
                                            handleNavClick(link.path)(e);
                                            setIsOpen(false);
                                        }}
                                        className="text-3xl font-bold text-white hover:text-[#70E000] transition-colors tracking-tight"
                                    >
                                        {displayName}
                                    </Link>
                                </motion.div>
                            );
                        })}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            {location.pathname !== '/login' && (
                                <Link to="/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="primary" className="mt-8 px-10 py-4 text-xl rounded-full bg-white text-black !hover:shadow-[0_0_30px_#70E000]">
                                        Dashboard
                                    </Button>
                                </Link>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
import { useData } from '../../context/DataContext';

const Footer = () => {
    const { socials, settings } = useData();

    // Smooth scroll handler
    const handleScroll = (id) => (e) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const { pathname } = useLocation();

    // Minimal Footer for AI Tools Page
    if (pathname === '/ai-tools') {
        return (
            <footer className="bg-[#050505] border-t border-white/5 py-10">
                <div className="container mx-auto flex justify-center">
                    <Link to="/" className="text-2xl font-bold text-deedox-accent-primary tracking-wide block">
                        {settings.logoUrl ? (
                            <img src={settings.logoUrl} alt={settings.brandName || "DEEDOX"} className="h-8 w-auto object-contain" />
                        ) : (
                            settings.brandName || "DEEDOX"
                        )}
                    </Link>
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-transparent premium-glass-green-bg border-t border-white/5 pt-20 pb-10">
            <div className="container mx-auto px-4">
                {/* Grid Layout: 3 Columns on Mobile (Links side-by-side), 4 Columns on Desktop */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-12 mb-16 text-center md:text-left">

                    {/* Brand - Full Width on Mobile */}
                    <div className="space-y-6 col-span-3 md:col-span-1 mb-8 md:mb-0">
                        <Link to="/" className="text-2xl font-bold text-deedox-accent-primary tracking-wide block md:inline-block">
                            {settings.logoUrl ? (
                                <img src={settings.logoUrl} alt={settings.brandName || "DEEDOX"} className="h-8 w-auto object-contain mx-auto md:mx-0" />
                            ) : (
                                settings.brandName || "DEEDOX"
                            )}
                        </Link>
                        <p className="text-deedox-text-secondary text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
                            Empowering the next generation of AI founders and builders across Asia.
                        </p>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <a href={socials.twitter} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-deedox-accent-primary hover:text-black transition-all">
                                <Twitter size={18} />
                            </a>
                            <a href={socials.instagram} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-deedox-accent-primary hover:text-black transition-all">
                                <Instagram size={18} />
                            </a>
                            <a href={socials.facebook} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-deedox-accent-primary hover:text-black transition-all">
                                <Facebook size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1">
                        <h4 className="text-white font-bold mb-4 md:mb-6 text-sm md:text-base">Quick Links</h4>
                        <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-deedox-text-secondary">
                            <li><Link to="/programs" className="hover:text-deedox-accent-primary transition-colors">Our Programs</Link></li>
                            <li><Link to="/mission" className="hover:text-deedox-accent-primary transition-colors">Our Mission</Link></li>
                            <li><Link to="/ai-tools" className="hover:text-deedox-accent-primary transition-colors">Tools</Link></li>
                            <li><Link to="/student/login" className="hover:text-deedox-accent-primary transition-colors">Login</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="col-span-1">
                        <h4 className="text-white font-bold mb-4 md:mb-6 text-sm md:text-base">Resources</h4>
                        <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-deedox-text-secondary">
                            <li><a href="#resources" onClick={handleScroll('resources')} className="hover:text-deedox-accent-primary transition-colors">Guides</a></li>
                            <li><Link to="/news" className="hover:text-deedox-accent-primary transition-colors">AI News</Link></li>
                            <li><a href="#" className="hover:text-deedox-accent-primary transition-colors">Community</a></li>
                            <li><Link to="/support" className="hover:text-deedox-accent-primary transition-colors text-deedox-brand">Support</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-span-1">
                        <h4 className="text-white font-bold mb-4 md:mb-6 text-sm md:text-base">Contact</h4>
                        <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-deedox-text-secondary break-words">
                            <li>{socials.contactEmail}</li>
                            <li>{socials.contactPhone}</li>
                            <li><Link to="/support" className="hover:text-deedox-accent-primary transition-colors">Contact Support</Link></li>
                            <li><Link to="/privacy-policy" className="hover:text-deedox-accent-primary transition-colors">Privacy Policy</Link></li>
                            <li className="hidden md:block">{socials.address}</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-xs text-deedox-text-muted">
                    <p>&copy; {new Date().getFullYear()} {settings.brandName || "DEEDOX"} AI Institute. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

import React, { useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
// import Lenis from '@studio-freight/lenis'; // Removed for performance
import Header from './Header';
import Footer from './Footer';
import FloatingWhatsApp from '../common/FloatingWhatsApp';
import CursorGlow from '../common/CursorGlow';
import ScrollGlow from '../common/ScrollGlow';
import GlobalAaghazBackground from '../common/GlobalAaghazBackground';

const Layout = () => {
    const [scrollY, setScrollY] = React.useState(0);
    const { pathname } = useLocation();

    // Removed Lenis Scroll Physics due to performance issues on some devices.
    // Native generic scroll is smoother for low-end machines.

    // 2. Track Scroll
    React.useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 3. Scroll to top on route change
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-[#70E000] selection:text-black relative overflow-hidden">
            {/* Global Fixed Background (The "Deep Room") */}
            <GlobalAaghazBackground />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header />
                {/* 4. Page Transitions (Simplified: Fade Only) */}
                <AnimatePresence mode="wait">
                    <motion.main
                        key={pathname}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }} // Fast, simple fade
                        className="flex-grow origin-top"
                    >
                        <Outlet />
                    </motion.main>
                </AnimatePresence>
                <Footer />
                <FloatingWhatsApp />
                <CursorGlow />
                <ScrollGlow />
            </div>
        </div>
    );
};

export default Layout;

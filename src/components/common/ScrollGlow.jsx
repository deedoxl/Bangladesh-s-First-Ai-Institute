import React, { useEffect, useState } from 'react';

const ScrollGlow = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;
            setScrollProgress(Number(scroll));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className="fixed left-0 top-0 w-[200px] h-screen pointer-events-none z-40"
        >
            <div
                className="absolute left-[-100px] w-[300px] h-[600px] rounded-full bg-[#70E000]/10 blur-[100px] transition-transform duration-100 ease-out"
                style={{
                    transform: `translateY(${scrollProgress * 100}vh) translateY(-50%)`,

                }}
            />
        </div>
    );
};

export default ScrollGlow;

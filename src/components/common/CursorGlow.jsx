import React, { useEffect, useState } from 'react';

const CursorGlow = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updateCursor = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', updateCursor);
        document.body.addEventListener('mouseleave', handleMouseLeave);
        document.body.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', updateCursor);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
            document.body.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div
            className="fixed pointer-events-none z-50 transition-opacity duration-500"
            style={{
                left: position.x,
                top: position.y,
                width: '600px',
                height: '600px',
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle at center, rgba(112, 224, 0, 0.08) 0%, rgba(112, 224, 0, 0.03) 25%, transparent 60%)',
                filter: 'blur(40px)',
                opacity: 0.8,
            }}
        />
    );
};

export default CursorGlow;

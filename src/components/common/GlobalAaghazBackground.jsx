import React from 'react';

const GlobalAaghazBackground = () => {
    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
            {/* 1. Base Black */}
            <div className="absolute inset-0 bg-black" />

            {/* 2. Deep Green Floor Gradient (Fixed visual) */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(7deg, rgba(0, 80, 0, 0.5) 0%, #000000 60%)'
                }}
            />

            {/* 3. Blueish-Cyan Outer Glow / Frame */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(0, 200, 255, 0.04) 100%)'
                }}
            />
        </div>
    );
};

export default GlobalAaghazBackground;

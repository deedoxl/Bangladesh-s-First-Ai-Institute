"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'glow';
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
    const baseStyles = "px-6 py-2.5 rounded-full font-medium transition-all duration-300 transform flex items-center justify-center gap-2 cursor-pointer";

    const variants = {
        primary: "bg-white text-black font-bold hover:scale-105 hover:shadow-[0_0_20px_#70E000] active:scale-95",
        accent: "bg-[#70E000] text-black font-bold hover:scale-105 hover:shadow-[0_0_20px_#70E000] active:scale-95",
        secondary: "bg-white/10 text-white hover:bg-white/20 hover:scale-105 backdrop-blur-md active:scale-95",
        outline: "border border-white/20 text-white hover:border-[#70E000] hover:text-[#70E000] active:scale-95",
        ghost: "text-gray-400 hover:text-white hover:bg-white/5 active:scale-95",
        glow: "bg-black/40 text-[#70E000] border border-[#70E000]/30 shadow-[0_0_15px_rgba(112,224,0,0.2)] hover:shadow-[0_0_25px_rgba(112,224,0,0.5)] hover:border-[#70E000] active:scale-95"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            className={cn(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;

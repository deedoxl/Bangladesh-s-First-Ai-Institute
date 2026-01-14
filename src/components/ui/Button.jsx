import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Button = ({ children, variant = 'primary', className, ...props }) => {
    const baseStyles = "px-6 py-2.5 rounded-full font-medium transition-all duration-300 transform flex items-center justify-center gap-2 cursor-pointer";

    const variants = {
        primary: "bg-white text-black font-bold hover:scale-105 hover:shadow-[0_0_20px_#70E000] active:scale-95",
        accent: "bg-deedox-accent-primary text-black font-bold hover:scale-105 hover:shadow-[0_0_20px_#70E000] active:scale-95",
        secondary: "bg-white/10 text-white hover:bg-white/20 hover:scale-105 backdrop-blur-md active:scale-95",
        outline: "border border-white/20 text-white hover:border-deedox-accent-primary hover:text-deedox-accent-primary active:scale-95",
        ghost: "text-deedox-text-secondary hover:text-white hover:bg-white/5 active:scale-95",
        glow: "bg-black/40 text-deedox-accent-primary border border-deedox-accent-primary/30 shadow-[0_0_15px_rgba(112,224,0,0.2)] hover:shadow-[0_0_25px_rgba(112,224,0,0.5)] hover:border-deedox-accent-primary active:scale-95"
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

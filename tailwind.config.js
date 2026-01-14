/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                deedox: {
                    bg: {
                        dark: '#050505', // Deep Black
                        secondary: '#111111', // Slightly Lighter Black
                        card: 'rgba(20, 20, 20, 0.8)',
                    },
                    text: {
                        heading: '#FFFFFF', // Pure White
                        secondary: '#D1D5DB', // Light Gray
                        muted: '#6B7280',
                    },
                    accent: {
                        primary: '#70E000', // Neon Lime Green
                        glow: '#70E000',
                    }
                }
            },
            fontFamily: {
                sans: ['Inter', 'Poppins', 'Roboto', 'sans-serif'],
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scroll-left': 'scrollLeft 40s linear infinite',
                'scroll-right': 'scrollRight 40s linear infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scrollLeft: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                scrollRight: {
                    '0%': { transform: 'translateX(-50%)' },
                    '100%': { transform: 'translateX(0)' },
                },
            }
        },
    },
    plugins: [],
}

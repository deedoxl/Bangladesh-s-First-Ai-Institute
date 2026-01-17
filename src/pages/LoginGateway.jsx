import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, LogIn, ArrowRight } from 'lucide-react';
import SEO from '../components/common/SEO';

const LoginGateway = () => {
    return (
        <div className="min-h-[85vh] flex items-center justify-center container mx-auto px-4 py-12 relative z-10 w-full">
            <SEO
                title="Login"
                description="Access your DEEDOX Student Dashboard, AI tools, and community."
                keywords="Login, Sign In, Student Dashboard, AI Tools Access"
                url="/login"
            />
            {/* Background Ambience (Localized) */}
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[#70E000]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Layout: Grid 2 cols for desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 w-full max-w-6xl items-center">

                {/* Left Content */}
                <div className="space-y-6 text-center lg:text-left">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                        Student <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Login</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-md mx-auto lg:mx-0 leading-relaxed">
                        Access your dashboard, AI tools, and a community of startup founders.
                    </p>
                </div>

                {/* Right Cards */}
                <div className="space-y-6 w-full max-w-md mx-auto lg:max-w-none">

                    {/* Card 1: Sign Up */}
                    <Link to="/student/signup" className="block group relative">
                        <div className="relative overflow-hidden rounded-3xl p-8 h-[200px] md:h-[220px] border border-white/5 bg-[#0a0a0a] group-hover:border-[#70E000]/40 transition-all duration-500 ease-out group-hover:scale-[1.02] shadow-2xl">

                            {/* Green Gradient Mesh */}
                            <div className="absolute top-0 right-0 w-[80%] h-full bg-gradient-to-l from-[#70E000]/20 via-[#0a2e0a]/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Icon Background */}
                            <div className="absolute bottom-[-20%] right-[-10%] text-[#70E000]/5 group-hover:text-[#70E000]/10 transition-colors duration-500">
                                <Rocket size={200} strokeWidth={0.5} />
                            </div>

                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-3xl font-bold text-white drop-shadow-md">Sign Up</h2>
                                    <div className="bg-[#70E000]/10 p-3 rounded-full group-hover:bg-[#70E000]/20 transition-colors backdrop-blur-md">
                                        <Rocket className="text-[#70E000] w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] group-hover:text-[#70E000] transition-colors">Create Your Account</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Card 2: Sign In */}
                    <Link to="/student/login" className="block group relative">
                        <div className="relative overflow-hidden rounded-3xl p-8 h-[200px] md:h-[220px] border border-white/5 bg-[#0a0a0a] group-hover:border-red-500/40 transition-all duration-500 ease-out group-hover:scale-[1.02] shadow-2xl">

                            {/* Red Gradient Mesh */}
                            <div className="absolute top-0 right-0 w-[80%] h-full bg-gradient-to-l from-[#360000]/40 via-[#2e0a0a]/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Icon Background */}
                            <div className="absolute bottom-[-10%] right-[-5%] text-red-500/5 group-hover:text-red-500/10 transition-colors duration-500">
                                <LogIn size={180} strokeWidth={0.5} />
                            </div>

                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-3xl font-bold text-white drop-shadow-md">Sign In</h2>
                                    <div className="bg-red-500/10 p-3 rounded-full group-hover:bg-red-500/20 transition-colors backdrop-blur-md">
                                        <LogIn className="text-red-500 w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] group-hover:text-red-500 transition-colors">Welcome Back</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                </div>
            </div>
        </div>
    );
};

export default LoginGateway;

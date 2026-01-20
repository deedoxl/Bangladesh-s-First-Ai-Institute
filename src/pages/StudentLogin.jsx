import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Loader2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { supabase } from '../lib/supabaseClient';
import logoDeedox from '../assets/logo-deedox.png';
import SEO from '../components/common/SEO';

const StudentLogin = () => {
    // ... component implementation
    const navigate = useNavigate();
    const location = useLocation();

    // UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [step, setStep] = useState('email'); // 'email' | 'otp'

    // Form State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');

    // Determine mode (Login vs Signup)
    const [isLogin, setIsLogin] = useState(location.pathname !== '/student/signup');

    // AUTO-CONNECT TO DATABASE
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate('/student/dashboard');
            }
        };
        checkSession();
    }, [navigate]);

    // STEP 1: SEND OTP (EMAIL)
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const cleanEmail = email.trim().toLowerCase();
            if (!cleanEmail) throw new Error("Email is required");

            // Use ONLY this (Standard Supabase OTP Send)
            const { error } = await supabase.auth.signInWithOtp({
                email: cleanEmail,
                options: {
                    shouldCreateUser: true, // As requested: ALWAYS try to create/find user
                    data: (!isLogin && name) ? { full_name: name } : undefined
                }
            });

            if (error) throw error;

            setStep('otp');
            setMessage("✅ OTP Code sent! Please check your email.");

        } catch (error) {
            console.error("Send OTP Error:", error);
            setMessage(error.message || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: VERIFY OTP (CRITICAL FIX)
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const cleanEmail = email.trim().toLowerCase();
            const cleanOtp = otp.trim();

            if (!cleanOtp) {
                throw new Error("Please enter verification code.");
            }

            // Use ONLY this (Standard Supabase OTP Verify)
            // type MUST be "email" to work with standard OTP codes
            const { data, error } = await supabase.auth.verifyOtp({
                email: cleanEmail,
                token: cleanOtp,
                type: 'email'
            });

            if (error) throw error;

            // STEP 3: DATABASE CONNECTION (AUTO)
            if (data?.session) {
                // STEP 4: SUCCESS FLOW
                navigate('/student/dashboard');
            } else {
                throw new Error("Verification successful but no session created.");
            }

        } catch (error) {
            console.error("Verify OTP Error:", error);
            // STEP 5: ERROR HANDLING
            setMessage(error.message || "Invalid or expired code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setMessage(null);
        setStep('email');
        setOtp('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
            <SEO
                title={isLogin ? "Login - Student Dashboard" : "Sign Up - Student Dashboard"}
                description="Access the DEEDOX Student Dashboard to control your AI learning journey."
                keywords="Student Login, DEEDOX Dashboard, AI Education Platform"
                url="/student/login"
            />
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#0f3b14] rounded-full blur-[150px] opacity-40" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-[#08220b] rounded-full blur-[150px] opacity-40" />
            </div>

            <div className="flex flex-col items-center z-10 w-full max-w-[420px] px-4">
                <div className="mb-8">
                    <Link to="/">
                        <img src={logoDeedox} alt="Deedox" className="h-[40px] w-auto hover:opacity-80 transition-opacity" />
                    </Link>
                </div>

                <div className="w-full bg-[#111111] border border-[#222] rounded-[30px] p-8 shadow-2xl relative">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {isLogin ? 'Login' : 'Sign up'}
                    </h2>
                    <p className="text-[#888] text-sm mb-8">
                        {isLogin ? 'Enter your email below to login to your account' : 'Create a new account'}
                    </p>

                    {message && (
                        <div className={`p-4 rounded-xl text-center mb-6 text-sm font-medium backdrop-blur-md transition-all duration-300 ${message.includes('✅') ? 'bg-[#C6F221]/10 border border-[#C6F221]/20 text-[#C6F221] shadow-[0_0_20px_rgba(198,242,33,0.1)]' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                            {message}
                        </div>
                    )}

                    {step === 'email' ? (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-white block">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Elon Musk"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-[#1A1A1A] border border-[#333] px-4 py-3.5 rounded-xl text-white outline-none focus:border-[#C6F221] transition-all placeholder:text-[#444] text-[15px]"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-white block">Email</label>
                                <input
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-[#1A1A1A] border border-[#333] px-4 py-3.5 rounded-xl text-white outline-none focus:border-[#C6F221] transition-all placeholder:text-[#444] text-[15px]"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <Button
                                variant="primary"
                                className="w-full justify-center py-3.5 text-[15px] font-bold border-none bg-[#C6F221] hover:bg-[#b0d91d] text-black rounded-full mt-6 transition-transform hover:scale-[1.02]"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin text-black" size={20} /> : (isLogin ? 'Send Login Code' : 'Sign Up with Code')}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 block mb-3 uppercase tracking-wider">Enter Login Code</label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-[#C6F221]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <input
                                        type="text"
                                        placeholder="--------"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="relative w-full bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-5 rounded-2xl text-white outline-none focus:border-[#C6F221]/50 focus:bg-white/10 focus:shadow-[0_0_30px_rgba(198,242,33,0.1)] transition-all placeholder:text-white/5 text-2xl tracking-[0.8em] text-center font-mono font-bold"
                                        required
                                        autoFocus
                                        disabled={loading}
                                        maxLength={8}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-xs mt-2 px-1">
                                    <button
                                        type="button"
                                        onClick={() => { setStep('email'); setMessage(null); }}
                                        className="text-[#888] hover:text-[#C6F221] transition-colors"
                                    >
                                        ← Change Email
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        className="text-[#C6F221] hover:underline font-bold disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full justify-center py-3.5 text-[15px] font-bold border-none bg-[#C6F221] hover:bg-[#b0d91d] text-black rounded-full mt-6 transition-transform hover:scale-[1.02]"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin text-black" size={20} /> : 'Verify & Login'}
                            </Button>
                        </form>
                    )}

                    <div className="mt-8 text-center text-sm">
                        <span className="text-white">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                        </span>
                        <button
                            onClick={toggleMode}
                            className="text-white font-bold underline decoration-white/30 hover:decoration-white/100 underline-offset-4 transition-all"
                        >
                            {isLogin ? 'Sign up' : 'Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Loader2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { supabase } from '../lib/supabaseClient';
import logoDeedox from '../assets/logo-deedox.png';

const StudentLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { settings } = useData();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    // Default to Sign Up if path is /student/signup, else Login
    const [isLogin, setIsLogin] = useState(location.pathname !== '/student/signup');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Auto-redirect if already logged in
    React.useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate('/student/dashboard');
            }
        };
        checkSession();
    }, [navigate]);

    const handleAuth = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setMessage(null);

        try {
            const options = {
                emailRedirectTo: `${window.location.origin}/student/dashboard`,
            };

            // If signing up, add metadata
            if (!isLogin && name) {
                options.data = { full_name: name };
            }

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options
            });

            if (error) throw error;
            setMessage("Check your email for the magic link!");
        } catch (error) {
            console.error("Login error:", error);
            // Show the actual error message to the user for debugging
            setMessage(error.message || error.error_description || "Error logging in. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
            {/* Background Ambience - Green/Dark Gradient similar to reference */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#0f3b14] rounded-full blur-[150px] opacity-40" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-[#08220b] rounded-full blur-[150px] opacity-40" />
            </div>

            <div className="flex flex-col items-center z-10 w-full max-w-[420px] px-4">
                {/* Logo */}
                <div className="mb-8">
                    <Link to="/">
                        <img src={logoDeedox} alt="Deedox" className="h-[40px] w-auto hover:opacity-80 transition-opacity" />
                    </Link>
                </div>

                {/* Card */}
                <div className="w-full bg-[#111111] border border-[#222] rounded-[30px] p-8 shadow-2xl relative">

                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {isLogin ? 'Login' : 'Sign up'}
                    </h2>
                    <p className="text-[#888] text-sm mb-8">
                        {isLogin ? 'Enter your email below to login to your account' : 'Create a new account'}
                    </p>

                    {message ? (
                        <div className="bg-[#1a2e1b] border border-[#2e5c30] p-4 rounded-xl text-[#a3e6a7] text-center mb-6">
                            {message}
                            <button onClick={() => setMessage(null)} className="block w-full text-xs font-bold mt-4 underline hover:text-white">Try again</button>
                        </div>
                    ) : (
                        <form onSubmit={handleAuth} className="space-y-5">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-white block">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Elon Musk"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-[#1A1A1A] border border-[#333] px-4 py-3.5 rounded-xl text-white outline-none focus:border-[#C6F221] transition-all placeholder:text-[#444] text-[15px]"
                                        required={!isLogin}
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
                                {loading ? <Loader2 className="animate-spin text-black" size={20} /> : (isLogin ? 'Login' : 'Sign up')}
                            </Button>
                        </form>
                    )}

                    <div className="mt-8 text-center text-sm">
                        <span className="text-white">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                        </span>
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setMessage(null);
                            }}
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


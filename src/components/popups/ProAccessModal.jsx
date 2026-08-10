import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, X, Send, CheckCircle2, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useData } from '../../context/DataContext';

const ProAccessModal = ({ program, currentUser, userProfile, onClose }) => {
    const { socials } = useData();
    
    const [name, setName] = useState(
        userProfile?.name || 
        currentUser?.user_metadata?.full_name || 
        currentUser?.user_metadata?.name || 
        ''
    );
    const [email, setEmail] = useState(
        userProfile?.email || 
        currentUser?.email || 
        ''
    );
    const [phone, setPhone] = useState(
        userProfile?.phone || 
        userProfile?.whatsapp || 
        ''
    );
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!email.trim() || !phone.trim() || !name.trim()) {
            setErrorMsg('Please fill in your name, email, and WhatsApp number.');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Save Request in Supabase
            if (supabase) {
                const { error } = await supabase
                    .from('pro_requests')
                    .insert([{
                        user_id: currentUser?.id || null,
                        user_name: name.trim(),
                        email: email.trim().toLowerCase(),
                        phone: phone.trim(),
                        course_id: program?.id || null,
                        course_title: program?.title || 'Locked Course',
                        status: 'pending',
                        notes: note.trim() || null
                    }]);

                if (error) {
                    console.warn("Supabase insert warning for pro_requests:", error.message);
                }
            }

            // 2. Format WhatsApp Message
            const rawAdminPhone = socials?.whatsapp || socials?.contactPhone || '8801700000000';
            const cleanAdminPhone = rawAdminPhone.replace(/[^0-9]/g, '');

            const message = `Hello DEEDOX Admin,\n\nI would like to request Pro Access for the following course:\n\n📚 Course: *${program?.title || 'Locked Course'}*\n👤 Name: ${name.trim()}\n📧 Email: ${email.trim()}\n📱 Phone/WhatsApp: ${phone.trim()}\n${note.trim() ? `💬 Note: ${note.trim()}\n` : ''}\nPlease approve my Pro status so I can access this course. Thank you!`;

            const waUrl = `https://wa.me/${cleanAdminPhone}?text=${encodeURIComponent(message)}`;

            // Open WhatsApp in new tab
            window.open(waUrl, '_blank');

            setIsSubmitted(true);
        } catch (err) {
            console.error("Error submitting Pro request:", err);
            setErrorMsg(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-[#0A0A0C] border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(112,224,0,0.15)] overflow-hidden my-8"
            >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#70E000]/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                {!isSubmitted ? (
                    <div>
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                <Lock size={28} />
                            </div>
                            <div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#70E000]/10 text-[#70E000] border border-[#70E000]/30 mb-1">
                                    <Sparkles size={12} /> PRO MEMBERS ONLY
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                                    Unlock Pro Course
                                </h3>
                            </div>
                        </div>

                        {/* Course Badge */}
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl mb-6 flex items-center gap-3">
                            <div className="w-2 h-10 bg-[#70E000] rounded-full shrink-0" />
                            <div>
                                <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">REQUESTING ACCESS FOR</div>
                                <div className="text-sm font-bold text-white">{program?.title || 'Selected Program'}</div>
                            </div>
                        </div>

                        <p className="text-xs md:text-sm text-white/70 mb-6 leading-relaxed">
                            This program is reserved for <strong className="text-[#70E000]">Deedox Pro Members</strong>. Please enter your details below to submit your access request. You will be redirected to WhatsApp to contact the Admin directly for instant approval.
                        </p>

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                                <ShieldAlert size={16} /> {errorMsg}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-white/60 font-bold uppercase mb-1.5">Your Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-black/60 border border-white/15 focus:border-[#70E000] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-white/60 font-bold uppercase mb-1.5">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full bg-black/60 border border-white/15 focus:border-[#70E000] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-white/60 font-bold uppercase mb-1.5">WhatsApp / Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+880 1700-000000"
                                        className="w-full bg-black/60 border border-white/15 focus:border-[#70E000] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-white/60 font-bold uppercase mb-1.5">Additional Note (Optional)</label>
                                <textarea
                                    rows={2}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Any message for the admin..."
                                    className="w-full bg-black/60 border border-white/15 focus:border-[#70E000] rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 px-6 bg-[#70E000] hover:bg-[#82F000] text-black font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(112,224,0,0.3)] transition-all cursor-pointer disabled:opacity-50 mt-6"
                            >
                                {isSubmitting ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                        <MessageSquare size={18} /> Send Request via WhatsApp
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    /* Success State */
                    <div className="text-center py-6">
                        <div className="w-20 h-20 bg-[#70E000]/10 border border-[#70E000]/30 text-[#70E000] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(112,224,0,0.3)]">
                            <CheckCircle2 size={44} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
                        <p className="text-sm text-white/70 max-w-md mx-auto mb-6 leading-relaxed">
                            We have opened WhatsApp to send your request directly to the admin. Once approved, your access to <strong className="text-[#70E000]">{program?.title}</strong> will activate automatically in real-time.
                        </p>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-6 text-xs text-white/60">
                            ⚡ Real-time database sync is active. As soon as the admin grants Pro status, your lock will vanish instantly!
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl transition-all"
                        >
                            Got It & Close
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ProAccessModal;

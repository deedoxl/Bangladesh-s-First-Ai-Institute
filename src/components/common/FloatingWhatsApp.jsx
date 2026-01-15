import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Modal from '../common/Modal';
import { cn } from '../../utils/cn';
import { useData } from '../../context/DataContext';

const FloatingWhatsApp = () => {
    const { socials } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', role: '', goal: '' });

    const roles = ['Student', 'Freelancer', 'Business Owner', 'Job Seeker'];
    const goals = ['AI Learning', 'Launching a Startup', 'Partnership', 'Consultation'];

    const handleNext = () => setStep(s => s + 1);

    const sendMessage = () => {
        const text = `*New Inquiry via Website* %0A%0A👤 *Name:* ${formData.name} %0A💼 *Role:* ${formData.role} %0A🎯 *Goal:* ${formData.goal}`;
        const url = `https://wa.me/${socials.whatsapp}?text=${text}`;
        window.open(url, '_blank');
        setIsOpen(false);
        setStep(1);
        setFormData({ name: '', role: '', goal: '' });
    };

    const StepIndicator = () => (
        <div className="flex gap-2 mb-6 justify-center">
            {[1, 2, 3].map(i => (
                <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i <= step ? "w-8 bg-deedox-accent-primary" : "w-2 bg-white/10")} />
            ))}
        </div>
    );

    return (
        <>
            <div className="fixed bottom-8 right-8 z-40 group">
                <div className="absolute bottom-full right-0 mb-3 w-48 bg-deedox-accent-primary text-black text-xs font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center shadow-[0_0_15px_#70E000]">
                    Emrul Our Community
                    <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-deedox-accent-primary" />
                </div>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 rounded-full bg-deedox-accent-primary text-black flex items-center justify-center shadow-[0_0_20px_#70E000] animate-pulse-slow border-2 border-white/20 hover:border-white"
                >
                    <MessageCircle size={32} fill="currentColor" />
                </motion.button>
            </div>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={step < 4 ? <span className="text-deedox-accent-primary">Select your role to get started</span> : "Ready to Send?"}
            >
                <StepIndicator />
                {/* Step 1: Name */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h4 className="text-xl text-white font-bold text-center">What's your good name?</h4>
                        <input
                            type="text"
                            placeholder="e.g. Ali Khan"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-deedox-accent-primary outline-none text-lg placeholder:text-white/20 transition-colors focus:shadow-[0_0_15px_rgba(112,224,0,0.1)]"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            autoFocus
                        />
                        <Button variant="accent" className="w-full justify-center py-4" disabled={!formData.name.trim()} onClick={handleNext}>Next Step</Button>
                    </motion.div>
                )}
                {/* Step 2: Role */}
                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h4 className="text-xl text-white font-bold text-center">Which describes you best?</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {roles.map(role => (
                                <button
                                    key={role}
                                    className={cn("p-4 rounded-xl border transition-all text-sm font-medium", formData.role === role ? "bg-deedox-accent-primary text-black border-deedox-accent-primary shadow-[0_0_10px_#70E000]" : "bg-black/40 border-white/10 text-deedox-text-secondary hover:border-deedox-accent-primary hover:text-white")}
                                    onClick={() => { setFormData({ ...formData, role }); setTimeout(handleNext, 200); }}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
                {/* Step 3: Goal */}
                {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h4 className="text-xl text-white font-bold text-center">What are you looking for?</h4>
                        <div className="space-y-3">
                            {goals.map(goal => (
                                <button
                                    key={goal}
                                    className={cn("w-full p-4 rounded-xl border transition-all text-left font-medium flex justify-between items-center group", formData.goal === goal ? "bg-deedox-accent-primary text-black border-deedox-accent-primary shadow-[0_0_10px_#70E000]" : "bg-black/40 border-white/10 text-deedox-text-secondary hover:border-deedox-accent-primary hover:text-white")}
                                    onClick={() => setFormData({ ...formData, goal })}
                                >
                                    {goal}
                                    {formData.goal === goal && <div className="w-2 h-2 rounded-full bg-black" />}
                                </button>
                            ))}
                        </div>
                        <Button variant="accent" className="w-full justify-center py-4 gap-2" disabled={!formData.goal} onClick={sendMessage}>Start Chat <Send size={18} /></Button>
                    </motion.div>
                )}
            </Modal>
        </>
    );
};

export default FloatingWhatsApp;

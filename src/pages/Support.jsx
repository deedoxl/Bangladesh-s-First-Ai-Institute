import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, GraduationCap, Building2, HelpCircle, Send, MessageCircle, X } from 'lucide-react';
import SEO from '../components/common/SEO';
import { useData } from '../context/DataContext';

const Support = () => {
    const { contactInfo } = useData();
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        message: ''
    });

    // Use contact number from DB (Admin Panel) or fallback to this specific number
    const whatsappNumber = contactInfo?.phone || '+8801817296013';

    const roles = [
        {
            id: 'student',
            title: 'Student',
            icon: GraduationCap,
            description: 'Get help with courses, certifications, and account issues.',
            action: 'Get Student Support',
            placeholder: 'e.g., I cannot access my AI certification course...'
        },
        {
            id: 'educator',
            title: 'Educator / Mentor',
            icon: User,
            description: 'Resources for teaching, workshops, and partnership.',
            action: 'Get Educator Support',
            placeholder: 'e.g., I want to organize an AI workshop...'
        },
        {
            id: 'partner',
            title: 'Institution / Partner',
            icon: Building2,
            description: 'Collaboration inquiries and institutional access.',
            action: 'Partner Inquiries',
            placeholder: 'e.g., We want to collaborate for an event...'
        },
        {
            id: 'other',
            title: 'General Support',
            icon: HelpCircle,
            description: 'For all other questions and general inquiries.',
            action: 'Contact Support',
            placeholder: 'How can we help you today?'
        }
    ];

    const handleRoleClick = (roleId) => {
        setSelectedRole(roleId);
        setFormData({ name: '', message: '' }); // Reset form when opening
    };

    const handleClose = () => {
        setSelectedRole(null);
    };

    const handleSend = (e) => {
        e.preventDefault();

        const roleTitle = roles.find(r => r.id === selectedRole)?.title || 'General';

        const text = `*New Support Request form Website*%0A` +
            `---------------------------%0A` +
            `*Role:* ${roleTitle}%0A` +
            `*Name:* ${formData.name}%0A` +
            `*Message:* ${formData.message}`;

        window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
        handleClose(); // Optional: Close modal after sending
    };

    const activeRole = roles.find(r => r.id === selectedRole);

    return (
        <div className="min-h-screen bg-deedox-bg-dark text-gray-300 font-sans">
            <SEO
                title="Support Center"
                description="Get help and support for your DEEDOX journey. Select your role to find relevant resources."
            />

            <div className="container mx-auto px-4 py-16 max-w-6xl">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-deedox-brand hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        How can we help you?
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Select your role to get started with personalized support.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => handleRoleClick(role.id)}
                            className="p-6 rounded-2xl border bg-white/5 border-white/10 hover:border-deedox-brand/50 hover:bg-white/10 transition-all text-left group"
                        >
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors bg-white/10 text-gray-400 group-hover:text-white group-hover:bg-deedox-brand">
                                <role.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                            <p className="text-sm text-gray-400 mb-6 min-h-[40px]">{role.description}</p>

                            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 group-hover:text-deedox-brand transition-colors">
                                {role.action}
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </div>
                        </button>
                    ))}
                </div>

                {/* MODAL POPUP */}
                {selectedRole && activeRole && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                            onClick={handleClose}
                        ></div>

                        {/* Modal Content */}
                        <div className="relative w-full max-w-lg bg-[#0F1115] border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-deedox-brand/10 flex items-center justify-center text-deedox-brand">
                                        <activeRole.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Contact Support</h3>
                                        <p className="text-xs text-deedox-brand">{activeRole.title}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form body */}
                            <div className="p-6">
                                <form onSubmit={handleSend} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-deedox-brand focus:ring-1 focus:ring-deedox-brand outline-none transition-all placeholder:text-gray-600"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">How can we help?</label>
                                        <textarea
                                            required
                                            rows="4"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-deedox-brand focus:ring-1 focus:ring-deedox-brand outline-none transition-all placeholder:text-gray-600 resize-none"
                                            placeholder={activeRole.placeholder}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-green-900/20"
                                    >
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Support;

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import SEO from '../components/common/SEO';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-deedox-bg-dark text-gray-300 font-sans">
            <SEO
                title="Privacy Policy"
                description="Privacy Policy for Deedox - Learn how we collect, use, and protect your data."
            />

            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-deedox-brand hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="bg-deedox-bg-light/30 backdrop-blur-md rounded-2xl p-8 border border-white/5 shadow-xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-deedox-brand/20 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-deedox-brand" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
                    </div>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
                            <p className="leading-relaxed text-gray-400">
                                Welcome to Deedox. We respect your privacy and are committed to protecting your personal data.
                                This privacy policy will inform you as to how we look after your personal data when you visit our
                                website and tell you about your privacy rights and how the law protects you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. Data We Collect</h2>
                            <p className="leading-relaxed text-gray-400">
                                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                                    <li>Identity Data includes first name, last name, username or similar identifier.</li>
                                    <li>Contact Data includes email address and telephone numbers.</li>
                                    <li>Technical Data includes internet protocol (IP) address, your login data, browser type and version.</li>
                                </ul>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Data</h2>
                            <p className="leading-relaxed text-gray-400">
                                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                                    <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                                    <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                                    <li>Where we need to comply with a legal or regulatory obligation.</li>
                                </ul>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
                            <p className="leading-relaxed text-gray-400">
                                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Contact Us</h2>
                            <p className="leading-relaxed text-gray-400">
                                If you have any questions about this privacy policy or our privacy practices, please contact us at support@deedox.site.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-white/5 text-sm text-gray-500">
                            Last Updated: January 2026
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

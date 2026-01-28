import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import SEO from '../components/common/SEO';

const UnderConstruction = () => {
    return (
        <div className="min-h-screen bg-deedox-bg-dark flex flex-col items-center justify-center p-4">
            <SEO
                title="Coming Soon"
                description="This page is currently under construction. Please check back later."
            />

            <div className="max-w-md w-full bg-deedox-bg-light/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center shadow-2xl">
                <div className="w-20 h-20 bg-deedox-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Construction className="w-10 h-10 text-deedox-brand" />
                </div>

                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
                    Coming Soon
                </h1>

                <p className="text-gray-400 mb-8">
                    We're working hard to bring you this page. Stay tuned for updates!
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-white bg-deedox-brand hover:bg-deedox-brand-dark px-6 py-3 rounded-xl transition-all font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default UnderConstruction;

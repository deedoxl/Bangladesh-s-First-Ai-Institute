import React, { useEffect } from 'react';
import Mission from '../components/sections/Mission';
import SEO from '../components/common/SEO';

const MissionPage = () => {
    // Ensure we start at the top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-20 min-h-screen bg-deedox-bg-dark">
            <SEO
                title="Our Mission"
                description="Our mission at DEEDOX is to democratize AI education and provide powerful tools for the next generation of innovators in Bangladesh."
                keywords="AI Mission, DEEDOX Vision, Future of AI, Tech Education, Bangladesh"
                url="/mission"
            />
            <Mission />
        </div>
    );
};

export default MissionPage;

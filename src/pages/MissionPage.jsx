import React, { useEffect } from 'react';
import Mission from '../components/sections/Mission';

const MissionPage = () => {
    // Ensure we start at the top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-20 min-h-screen bg-deedox-bg-dark">
            <Mission />
        </div>
    );
};

export default MissionPage;

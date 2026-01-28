import React from 'react';
import Hero from '../components/sections/Hero';
import ImageCarousel from '../components/sections/ImageCarousel';
import SEO from '../components/common/SEO';
// Mission removed as per request
import OurPrograms from '../components/sections/OurPrograms';
import FreeResources from '../components/sections/FreeResources';
import Testimonials from '../components/sections/Testimonials';
import LatestNews from '../components/sections/LatestNews';

const Home = () => {
    return (
        <div className="bg-deedox-bg-dark min-h-screen">
            <SEO
                description="DEEDOX is Bangladesh's first AI institute, empowering the next generation with artificial intelligence education and tools."
                keywords="AI Institute, Bangladesh AI, Artificial Intelligence Education, machine learning, tech education"
                url="/"
            />
            <Hero />
            <ImageCarousel />
            {/* Mission Section Removed */}
            <OurPrograms />
            <FreeResources />
            <Testimonials />
            <LatestNews />
        </div>
    );
};

export default Home;

import React from 'react';
import Hero from '../components/sections/Hero';
import ImageCarousel from '../components/sections/ImageCarousel';
// Mission removed as per request
import OurPrograms from '../components/sections/OurPrograms';
import FreeResources from '../components/sections/FreeResources';
import Testimonials from '../components/sections/Testimonials';
import LatestNews from '../components/sections/LatestNews';

const Home = () => {
    return (
        <div className="bg-deedox-bg-dark min-h-screen">
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

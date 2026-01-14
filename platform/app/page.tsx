import Hero from '@/components/sections/Hero';
import ImageCarousel from '@/components/sections/ImageCarousel';
import Mission from '@/components/sections/Mission';
import OurPrograms from '@/components/sections/OurPrograms';
import FreeResources from '@/components/sections/FreeResources';
import Testimonials from '@/components/sections/Testimonials';

export default function Home() {
    return (
        <main className="min-h-screen bg-[#050505]">
            <Hero />
            <ImageCarousel />
            <Mission />
            <OurPrograms />
            <FreeResources />
            <Testimonials />
        </main>
    );
}

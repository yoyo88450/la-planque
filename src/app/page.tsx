import ArtistsSection from "../components/princpale/ArtistsSection";
import HeroSection from "../components/princpale/HeroSection";
import AboutSection from "../components/princpale/AboutSection";
import ServicesSection from "../components/princpale/ServicesSection";
import TestimonialsSection from "../components/princpale/TestimonialsSection";
import ContactSection from "../components/princpale/ContactSection";
import "./services-animations.css";
import ScrollArrow from "../components/ScrollArrow";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <HeroSection />

      <ScrollArrow sections={['about', 'services', 'artists', 'testimonials', 'contact']} />

      <AboutSection />

      <ServicesSection />

      <div id="artists">
        <ArtistsSection />
      </div>

      <TestimonialsSection />

      <ContactSection />
    </div>
  );
}

import ArtistsSection from "../components/princpale/ArtistsSection";
import HeroSection from "../components/princpale/HeroSection";
import AboutSection from "../components/princpale/AboutSection";
import ServicesSection from "../components/princpale/ServicesSection";
import TestimonialsSection from "../components/princpale/TestimonialsSection";
import ContactSection from "../components/princpale/ContactSection";
import "./services-animations.css";
import ScrollArrow from "../components/ScrollArrow";

export default async function Home() {
  // Fetch settings to determine if artists section should be shown
  let artistsEnabled = true;
  try {
    const settingsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/settings`, {
      cache: 'no-store' // Ensure fresh data
    });
    if (settingsResponse.ok) {
      const settings = await settingsResponse.json();
      artistsEnabled = settings.artistsEnabled;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error);
    // Default to enabled if error
  }

  return (
    <div className="min-h-screen bg-black">
      <HeroSection />

      <ScrollArrow sections={['about', 'services', ...(artistsEnabled ? ['artists'] : []), 'testimonials', 'contact']} />

      <AboutSection />

      <ServicesSection />

      {artistsEnabled && (
        <div id="artists">
          <ArtistsSection />
        </div>
      )}

      <TestimonialsSection />

      <ContactSection />
    </div>
  );
}

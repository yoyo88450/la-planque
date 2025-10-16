import Image from "next/image";
import Link from "next/link";
import ScrollAnimation from "../ScrollAnimation";

export default function HeroSection() {
  return (
    <ScrollAnimation>
      <section id="hero" className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-gray-900/80 to-black/70 z-10"></div>
          <Image
            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop&crop=center"
            alt="Studio d'enregistrement professionnel"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1200px, 1200px"
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 text-center">
          <ScrollAnimation delay={0.2}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Bienvenue à La Planque
            </h1>
          </ScrollAnimation>
          <ScrollAnimation delay={0.4}>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md px-4">
              Votre studio d'enregistrement professionnel.
              Enregistrez vos meilleurs albums dans des conditions optimales.
            </p>
          </ScrollAnimation>
          <ScrollAnimation delay={0.6}>
            <div className="flex flex-col items-center sm:flex-row sm:justify-center sm:space-x-4 space-y-4 sm:space-y-0">
              <Link
                href="/reservation"
                className="bg-white text-black px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
              >
                Réserver maintenant
              </Link>
              <Link
                href="/boutique"
                className="border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
              >
                Voir la boutique
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </ScrollAnimation>
  );
}

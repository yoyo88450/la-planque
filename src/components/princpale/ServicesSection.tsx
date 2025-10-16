import Image from "next/image";
import ScrollAnimation from "../ScrollAnimation";

export default function ServicesSection() {
  return (
    <ScrollAnimation>
      <section id="services" className="relative py-16 bg-black overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-gray-900/95 to-black/90 z-10"></div>
          <Image
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=800&fit=crop&crop=center"
            alt="Studio d'enregistrement sombre avec équipement professionnel"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1200px, 1200px"
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4">
          <ScrollAnimation delay={0.2}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Nos Services</h2>
              <p className="text-gray-300 max-w-2xl mx-auto drop-shadow-md">
                Découvrez nos services d'enregistrement professionnel pour donner vie à vos projets musicaux.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollAnimation delay={0.4} direction="up">
              <div className="text-center bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl animate-float-1">
                <div className="bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎙️</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Enregistrement</h3>
                <p className="text-gray-300">Enregistrement professionnel avec matériel haut de gamme</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.6} direction="up">
              <div className="text-center bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl animate-float-2">
                <div className="bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎛️</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Mixage</h3>
                <p className="text-gray-300">Mixage professionnel pour sublimer vos productions</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.8} direction="up">
              <div className="text-center bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl animate-float-3">
                <div className="bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎚️</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Mastering</h3>
                <p className="text-gray-300">Mastering final pour une qualité optimale</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>
    </ScrollAnimation>
  );
}

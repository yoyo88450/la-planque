import ScrollAnimation from "../ScrollAnimation";

export default function AboutSection() {
  return (
    <ScrollAnimation>
      <section id="about" className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <ScrollAnimation delay={0.2}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">À propos de nous</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Depuis plus de 10 ans, La Planque vous accompagne dans vos projets musicaux.
                Que vous soyez débutant ou expérimenté, notre équipe vous propose des équipements
                de qualité et des conseils personnalisés pour des enregistrements professionnels.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </ScrollAnimation>
  );
}

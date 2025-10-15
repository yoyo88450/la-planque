import Image from "next/image";
import Link from "next/link";
import { testimonials } from "../data/mockData";
import ArtistsSection from "../components/ArtistsSection";
import "./services-animations.css";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-gray-900/80 to-black/70 z-10"></div>
          <Image
            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop&crop=center"
            alt="Studio d'enregistrement professionnel"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6 drop-shadow-lg">
            Bienvenue à La Planque
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
            Votre studio d'enregistrement professionnel.
            Enregistrez vos meilleurs albums dans des conditions optimales.
          </p>
          <div className="space-x-4">
            <Link
              href="/reservation"
              className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Réserver maintenant
            </Link>
            <Link
              href="/boutique"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Voir la boutique
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">À propos de nous</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Depuis plus de 10 ans, La Planque vous accompagne dans vos projets musicaux.
              Que vous soyez débutant ou expérimenté, notre équipe vous propose des équipements
              de qualité et des conseils personnalisés pour des enregistrements professionnels.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-16 bg-black overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-gray-900/95 to-black/90 z-10"></div>
          <Image
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=800&fit=crop&crop=center"
            alt="Studio d'enregistrement sombre avec équipement professionnel"
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Nos Services</h2>
            <p className="text-gray-300 max-w-2xl mx-auto drop-shadow-md">
              Découvrez nos services d'enregistrement professionnel pour donner vie à vos projets musicaux.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl animate-float-1">
              <div className="bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎙️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Enregistrement</h3>
              <p className="text-gray-300">Enregistrement professionnel avec matériel haut de gamme</p>
            </div>

            <div className="text-center bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl animate-float-2">
              <div className="bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎛️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Mixage</h3>
              <p className="text-gray-300">Mixage professionnel pour sublimer vos productions</p>
            </div>

            <div className="text-center bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl animate-float-3">
              <div className="bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎚️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Mastering</h3>
              <p className="text-gray-300">Mastering final pour une qualité optimale</p>
            </div>
          </div>
        </div>
      </section>

      <ArtistsSection />

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Témoignages</h2>
            <p className="text-gray-300">Ce que disent nos clients</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.message}"</p>
                <div className="font-semibold text-white">{testimonial.name}</div>
                <div className="text-sm text-gray-400">{testimonial.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Contactez-nous</h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Une question ? Un projet spécial ? N'hésitez pas à nous contacter.
                Nous vous répondrons dans les plus brefs délais.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">Adresse</h3>
                    <p className="text-gray-300">123 Rue de la Musique<br />75001 Paris, France</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">Téléphone</h3>
                    <p className="text-gray-300">+33 1 23 45 67 89</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">Email</h3>
                    <p className="text-gray-300">contact@laplanque.fr</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">Horaires</h3>
                    <p className="text-gray-300">
                      Lundi - Vendredi: 9h - 18h<br />
                      Samedi: 10h - 16h<br />
                      Dimanche: Fermé
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Votre prénom"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Sujet *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="" className="bg-gray-700">Choisir un sujet</option>
                      <option value="reservation" className="bg-gray-700">Réservation</option>
                      <option value="information" className="bg-gray-700">Demande d'information</option>
                      <option value="technique" className="bg-gray-700">Support technique</option>
                      <option value="autre" className="bg-gray-700">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Votre message..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Envoyer le message
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

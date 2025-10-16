import { testimonials } from "../../data/mockData";
import ScrollAnimation from "../ScrollAnimation";

export default function TestimonialsSection() {
  return (
    <ScrollAnimation>
      <section id="testimonials" className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <ScrollAnimation delay={0.2}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Témoignages</h2>
              <p className="text-gray-300">Ce que disent nos clients</p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <ScrollAnimation key={testimonial.id} delay={0.4 + index * 0.2} direction="up">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.message}"</p>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.date}</div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>
    </ScrollAnimation>
  );
}

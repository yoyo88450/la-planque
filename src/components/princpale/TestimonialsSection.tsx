'use client';

import { useState, useEffect } from "react";
import { testimonials } from "../../data/mockData";
import ScrollAnimation from "../ScrollAnimation";

interface GoogleReview {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

export default function TestimonialsSection() {
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoogleReviews = async () => {
      try {
        const response = await fetch('/api/google/reviews');
        if (response.ok) {
          const data = await response.json();
          setGoogleReviews(data.reviews || []);
        } else {
          // If Google reviews fail, we'll fall back to mock data
          console.log('Google reviews not available, using mock data');
        }
      } catch (error) {
        console.error('Error fetching Google reviews:', error);
        // Fall back to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchGoogleReviews();
  }, []);

  // Combine Google reviews with mock testimonials, prioritizing Google reviews
  const displayTestimonials = googleReviews.length > 0
    ? googleReviews.slice(0, 3).map(review => ({
        id: review.id,
        name: review.author_name,
        message: review.text,
        rating: review.rating,
        date: review.relative_time_description,
        source: 'google' as const
      }))
    : testimonials.slice(0, 3).map(testimonial => ({
        ...testimonial,
        source: 'mock' as const
      }));

  return (
    <ScrollAnimation>
      <section id="testimonials" className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <ScrollAnimation delay={0.2}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Témoignages</h2>
              <p className="text-gray-300">
                {googleReviews.length > 0 ? "Avis Google My Business" : "Ce que disent nos clients"}
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayTestimonials.map((testimonial, index) => (
              <ScrollAnimation key={testimonial.id} delay={0.4 + index * 0.2} direction="up">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">⭐</span>
                      ))}
                    </div>
                    {testimonial.source === 'google' && (
                      <div className="flex items-center text-xs text-gray-400">
                        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                      </div>
                    )}
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

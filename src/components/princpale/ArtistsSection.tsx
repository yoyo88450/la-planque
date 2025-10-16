'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';

interface Artist {
  id: string;
  name: string;
  description: string;
  profileImage: string;
  albumCover: string;
}

export default function ArtistsSection() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const visibleArtists = 3; // Always show 3 artists
  const radius = 280; // Further reduced radius for better visibility
  const autoRotateInterval = 8000; // Auto-rotation interval

  // Load artists from API
  useEffect(() => {
    const loadArtists = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/artists');
        if (response.ok) {
          const data = await response.json();
          setArtists(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des artistes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArtists();
  }, []);

  // Auto-rotate through artists every 8 seconds, but pause if any card is flipped
  useEffect(() => {
    if (artists.length === 0 || flippedCards.size > 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % artists.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [artists.length, flippedCards.size, autoRotateInterval]);

  const handleCardClick = useCallback((artistId: string) => {
    if (isAnimating) return; // Prevent multiple clicks during animation

    // Find the index of the clicked artist
    const clickedIndex = artists.findIndex(artist => artist.id === artistId);
    if (clickedIndex === -1) return;

    setIsAnimating(true);

    // If the clicked artist is not at the center, scroll to it first
    if (clickedIndex !== currentIndex) {
      setCurrentIndex(clickedIndex);

      // Wait for scroll animation to complete, then start flip
      setTimeout(() => {
        // If there are flipped cards and we're clicking on a different one, close them first
        if (flippedCards.size > 0 && !flippedCards.has(artistId)) {
          setFlippedCards(new Set()); // Close all flipped cards

          // Wait for close animation, then flip the new card
          setTimeout(() => {
            setFlippedCards(new Set([artistId]));
            setIsAnimating(false);
          }, 350); // Half of the flip animation duration
        } else {
          // Toggle the clicked card
          setFlippedCards(prev => {
            const newFlipped = new Set(prev);
            if (newFlipped.has(artistId)) {
              newFlipped.delete(artistId);
            } else {
              newFlipped.add(artistId);
            }
            return newFlipped;
          });
          setIsAnimating(false);
        }
      }, 1000); // Wait for scroll animation to complete
    } else {
      // Artist is already at center, proceed with flip
      // If there are flipped cards and we're clicking on a different one, close them first
      if (flippedCards.size > 0 && !flippedCards.has(artistId)) {
        setFlippedCards(new Set()); // Close all flipped cards

        // Wait for close animation, then flip the new card
        setTimeout(() => {
          setFlippedCards(new Set([artistId]));
          setIsAnimating(false);
        }, 350); // Half of the flip animation duration
      } else {
        // Toggle the clicked card
        setFlippedCards(prev => {
          const newFlipped = new Set(prev);
          if (newFlipped.has(artistId)) {
            newFlipped.delete(artistId);
          } else {
            newFlipped.add(artistId);
          }
          return newFlipped;
        });
        setIsAnimating(false);
      }
    }
  }, [flippedCards, isAnimating, artists, currentIndex]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (artists.length === 0) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => (prev - 1 + artists.length) % artists.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => (prev + 1) % artists.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [artists.length]);

  // Get the current artists for the wheel
  const wheelArtists = useMemo(() => {
    if (artists.length === 0) return [];
    const result = [];
    for (let i = 0; i < artists.length; i++) {
      result.push(artists[i]);
    }
    return result;
  }, [artists]);

  // Calculate position for each artist in the circle
  const getArtistPosition = useCallback((index: number) => {
    const angle = ((index - currentIndex) * (360 / artists.length)) * (Math.PI / 180);
    const x = Math.sin(angle) * radius;
    const y = -Math.cos(angle) * radius * 0.05; // Even further flatten the circle
    const scale = Math.cos(angle * 0.8) * 0.5 + 0.5; // More pronounced scale difference
    const opacity = Math.cos(angle * 1.2) * 0.6 + 0.4; // More pronounced opacity difference

    return { x, y, scale, opacity, angle };
  }, [currentIndex, artists.length, radius]);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-r from-black via-gray-900 to-black relative overflow-hidden">
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Nos Artistes</h2>
            <div className="flex justify-center gap-6">
              {Array.from({ length: visibleArtists }, (_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-700 rounded-2xl w-64 h-64"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (artists.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-r from-black via-gray-900 to-black relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Nos Artistes
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto drop-shadow-md text-lg">
            Découvrez les talents qui font vibrer notre studio d'enregistrement.
          </p>
        </div>

        {/* Wheel Carousel */}
        <div className="flex justify-center items-center overflow-hidden" ref={carouselRef}>
          <div className="relative w-full h-96 flex items-center justify-center">
            {wheelArtists.map((artist, index) => {
              const { x, y, scale, opacity } = getArtistPosition(index);
              const isVisible = opacity > 0.2; // Lower threshold for more visibility

              return (
                <div
                  key={`${artist.id}-${index}`}
                  className={`absolute transition-all duration-1000 ease-out ${
                    isVisible ? 'pointer-events-auto' : 'pointer-events-none'
                  }`}
                  style={{
                    transform: `translate(${x}px, ${y}px) scale(${scale})`,
                    opacity: opacity,
                    zIndex: Math.round(scale * 10),
                  }}
                >
                  {/* Artist Profile Image - Top Left */}
                  <div className="absolute -top-3 -left-3 z-20 transition-transform duration-300 hover:scale-110">
                    <Image
                      src={artist.profileImage}
                      alt={artist.name}
                      width={50}
                      height={50}
                      className="rounded-full border-3 border-white shadow-2xl object-cover"
                    />
                  </div>

                  {/* Album Cover Card */}
                  <div
                    className={`relative w-64 h-64 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                      isAnimating ? 'pointer-events-none' : ''
                    }`}
                    onClick={() => handleCardClick(artist.id)}
                    style={{ perspective: '1000px' }}
                    tabIndex={isVisible ? 0 : -1}
                    role="button"
                    aria-label={`Voir les détails de ${artist.name}`}
                  >
                    <div
                      className={`relative w-full h-full transition-transform duration-700 preserve-3d ${
                        flippedCards.has(artist.id) ? 'rotate-y-180' : ''
                      }`}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front of card - Album Cover */}
                      <div
                        className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-2xl overflow-hidden group"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <Image
                          src={artist.albumCover}
                          alt={`Album de ${artist.name}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Enhanced Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent rounded-2xl">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white text-xl font-bold drop-shadow-lg mb-1">
                              {artist.name}
                            </h3>
                            <div className="w-8 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Back of card - Description */}
                      <div
                        className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-gray-700/50 flex flex-col justify-center items-center p-6"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        <h3 className="text-white text-xl font-bold mb-4 text-center">
                          {artist.name}
                        </h3>
                        <p className="text-gray-300 text-center leading-relaxed text-sm">
                          {artist.description}
                        </p>
                        <div className="mt-4 w-8 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Dots */}
        {artists.length > visibleArtists && (
          <div className="flex justify-center mt-10 space-x-3">
            {artists.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-3 bg-gradient-to-r from-purple-400 to-pink-400 shadow-lg'
                    : 'w-3 h-3 bg-gray-600 hover:bg-gray-400 hover:scale-125'
                }`}
                aria-label={`Voir l'artiste ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Enhanced Instruction Text */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm flex items-center justify-center space-x-2">
            <span className="animate-pulse">💫</span>
            <span>Cliquez sur une pochette pour découvrir l'artiste</span>
            <span className="animate-pulse">💫</span>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Utilisez les flèches ← → pour naviguer
          </p>
        </div>
      </div>

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </section>
  );
}

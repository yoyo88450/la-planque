'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';

interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export default function SpotifyMusicSection() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const minSwipeDistance = 50;

  const visibleTracks = 3;
  const radius = 280;
  const autoRotateInterval = 4000;

  // Load Spotify settings from database
  const [spotifySettings, setSpotifySettings] = useState({
    accessToken: '',
    playlistId: ''
  });

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setSpotifySettings({
            accessToken: '', // Will be fetched fresh each time
            playlistId: data.spotifyPlaylistId || ''
          });
        } else {
          // Don't set defaults if API fails
          setSpotifySettings({
            accessToken: '',
            playlistId: ''
          });
        }
      } catch (error) {
        // Don't set defaults if error
        setSpotifySettings({
          accessToken: '',
          playlistId: ''
        });
      }
    };

    loadSettings();
  }, []);

  // Spotify playlist ID from settings
  const playlistId = spotifySettings.playlistId;

  // Load tracks from Spotify API
  useEffect(() => {
    const loadTracks = async () => {
      try {
        setIsLoading(true);
        // Prepare headers - use token if available, otherwise try without for public playlists
        const headers: Record<string, string> = {};
        if (spotifySettings.accessToken) {
          headers['Authorization'] = `Bearer ${spotifySettings.accessToken}`;
        }

        // Fetch tracks for audio
        let tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, { headers });

        console.log('Fetching tracks from playlist ID:', playlistId);

        // If unauthorized, try to get new token using client credentials
        if (tracksResponse.status === 401) {
          console.log('Access token expired or invalid, attempting to get new token...');

          try {
            const refreshResponse = await fetch('/api/spotify/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              console.log('Token obtained successfully');

              // Update local state with new access token
              setSpotifySettings(prev => ({
                ...prev,
                accessToken: refreshData.access_token
              }));

              // Retry the playlist fetch with new token
              headers['Authorization'] = `Bearer ${refreshData.access_token}`;
              tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, { headers });
            } else {
              console.error('Failed to get token:', refreshResponse.status, refreshResponse.statusText);
              console.error('Response body:', await refreshResponse.text());
              setTracks([]);
              return;
            }
          } catch (refreshError) {
            console.error('Error getting token:', refreshError);
            setTracks([]);
            return;
          }
        }

        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          console.log('Spotify Tracks API Response:', tracksData);
          setTracks(tracksData.items.map((item: any) => item.track).slice(0, 10));
        } else {
          console.error('Spotify Tracks API Error Response:', tracksResponse.status, tracksResponse.statusText);
          setTracks([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des pistes:', error);
        setTracks([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (spotifySettings.playlistId) {
      loadTracks();
    }
  }, [playlistId, spotifySettings.accessToken, spotifySettings.playlistId]);

  // Auto-rotate through tracks
  useEffect(() => {
    if (tracks.length === 0 || flippedCards.size > 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tracks.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [tracks.length, flippedCards.size, autoRotateInterval]);

  const handleCardClick = useCallback((trackId: string) => {
    if (isAnimating) return;

    const clickedIndex = tracks.findIndex(track => track.id === trackId);
    if (clickedIndex === -1) return;

    setIsAnimating(true);

    if (clickedIndex !== currentIndex) {
      setCurrentIndex(clickedIndex);

      setTimeout(() => {
        const track = tracks.find(t => t.id === trackId);
        if (!track) return;

        if (flippedCards.size > 0 && !flippedCards.has(trackId)) {
          setFlippedCards(new Set());
          setTimeout(() => {
            setFlippedCards(new Set([trackId]));
            // Auto-play when flipping to back
            if (track.preview_url) {
              handlePlayPause(track.id, track.preview_url);
            }
            setIsAnimating(false);
          }, 350);
        } else {
          setFlippedCards(prev => {
            const newFlipped = new Set(prev);
            if (newFlipped.has(trackId)) {
              newFlipped.delete(trackId);
              // Stop audio when closing card
              const audio = audioRefs.current.get(trackId);
              if (audio) {
                audio.pause();
                audio.currentTime = 0;
              }
              setCurrentlyPlaying(null);
            } else {
              newFlipped.add(trackId);
              // Auto-play when flipping to back
              if (track.preview_url) {
                handlePlayPause(track.id, track.preview_url);
              }
            }
            return newFlipped;
          });
          setIsAnimating(false);
        }
      }, 700);
    } else {
      if (flippedCards.size > 0 && !flippedCards.has(trackId)) {
        setFlippedCards(new Set());
        setTimeout(() => {
          setFlippedCards(new Set([trackId]));
          setIsAnimating(false);
        }, 350);
      } else {
        setFlippedCards(prev => {
          const newFlipped = new Set(prev);
          if (newFlipped.has(trackId)) {
            newFlipped.delete(trackId);
            const audio = audioRefs.current.get(trackId);
            if (audio) {
              audio.pause();
              audio.currentTime = 0;
            }
            setCurrentlyPlaying(null);
          } else {
            newFlipped.add(trackId);
          }
          return newFlipped;
        });
        setIsAnimating(false);
      }
    }
  }, [flippedCards, isAnimating, tracks, currentIndex]);

  const handlePlayPause = useCallback((trackId: string, previewUrl: string | null) => {
    const audio = audioRefs.current.get(trackId);

    if (currentlyPlaying === trackId) {
      if (audio) {
        audio.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      // Stop any currently playing audio
      if (currentlyPlaying) {
        const currentAudio = audioRefs.current.get(currentlyPlaying);
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      if (audio && previewUrl) {
        audio.play();
        setCurrentlyPlaying(trackId);
      }
    }
  }, [currentlyPlaying]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Touch navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current) return;

    const currentX = e.targetTouches[0].clientX;
    const diff = touchStartX.current - currentX;

    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current) return;

    touchEndX.current = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && tracks.length > 1) {
      setCurrentIndex(prev => (prev + 1) % tracks.length);
    } else if (isRightSwipe && tracks.length > 1) {
      setCurrentIndex(prev => (prev - 1 + tracks.length) % tracks.length);
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [tracks.length, minSwipeDistance]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (tracks.length === 0) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => (prev - 1 + tracks.length) % tracks.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => (prev + 1) % tracks.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tracks.length]);

  const wheelTracks = useMemo(() => {
    if (tracks.length === 0) return [];
    const result = [];
    for (let i = 0; i < tracks.length; i++) {
      result.push(tracks[i]);
    }
    return result;
  }, [tracks]);

  const getTrackPosition = useCallback((index: number) => {
    const angle = ((index - currentIndex) * (360 / tracks.length)) * (Math.PI / 180);
    const x = Math.sin(angle) * radius;
    const y = -Math.cos(angle) * radius * 0.05;
    const scale = Math.cos(angle * 0.8) * 0.5 + 0.5;
    const opacity = Math.cos(angle * 1.2) * 0.6 + 0.4;

    return { x, y, scale, opacity, angle };
  }, [currentIndex, tracks.length, radius]);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-r from-black via-gray-900 to-black relative overflow-hidden">
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Musique Spotify</h2>
            <div className="flex justify-center gap-6">
              {Array.from({ length: visibleTracks }, (_, i) => (
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

  if (tracks.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-r from-black via-gray-900 to-black relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-transparent to-blue-900/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(29,185,84,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Musique Spotify
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto drop-shadow-md text-lg">
            Découvrez les hits du moment depuis Spotify.
          </p>
        </div>

        {/* Wheel Carousel */}
        <div
          className="flex justify-center items-center overflow-hidden"
          ref={carouselRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'pan-y' }}
        >
          <div className="relative w-full h-96 flex items-center justify-center">
            {wheelTracks.map((track, index) => {
              const { x, y, scale, opacity } = getTrackPosition(index);
              const isVisible = opacity > 0.2;

              return (
                <div
                  key={`${track.id}-${index}`}
                  className={`absolute transition-all duration-700 ease-out ${
                    isVisible ? 'pointer-events-auto' : 'pointer-events-none'
                  }`}
                  style={{
                    transform: `translate(${x}px, ${y}px) scale(${scale})`,
                    opacity: opacity,
                    zIndex: Math.round(scale * 10),
                  }}
                >
                  {/* Spotify Icon - Top Left */}
                  <div className="absolute -top-3 -left-3 z-20 transition-transform duration-300 hover:scale-110">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.6-.12-.421.18-.78.6-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.241 1.081zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.42-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Album Cover Card */}
                  <div
                    className={`relative w-64 h-64 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                      isAnimating ? 'pointer-events-none' : ''
                    }`}
                    onClick={() => handleCardClick(track.id)}
                    style={{ perspective: '1000px' }}
                    tabIndex={isVisible ? 0 : -1}
                    role="button"
                    aria-label={`Voir les détails de ${track.name}`}
                  >
                    <div
                      className={`relative w-full h-full transition-transform duration-700 preserve-3d ${
                        flippedCards.has(track.id) ? 'rotate-y-180' : ''
                      }`}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front of card - Album Cover */}
                      <div
                        className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-2xl overflow-hidden group"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <Image
                          src={track.album.images[0]?.url || '/api/placeholder/300/300'}
                          alt={`Album ${track.album.name}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Enhanced Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent rounded-2xl">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white text-xl font-bold drop-shadow-lg mb-1">
                              {track.name}
                            </h3>
                            <p className="text-gray-200 text-sm drop-shadow-md">
                              {track.artists.map(artist => artist.name).join(', ')}
                            </p>
                            <div className="w-8 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
                          </div>

                          {/* Mini Audio Player */}
                          {track.preview_url && (
                            <div className="absolute top-4 right-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayPause(track.id, track.preview_url);
                                }}
                                className="bg-green-500/80 hover:bg-green-500 text-white p-2 rounded-full transition-colors duration-200 shadow-lg backdrop-blur-sm"
                                aria-label={`Jouer ${track.name}`}
                              >
                                {currentlyPlaying === track.id ? (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Back of card - Music Player */}
                      <div
                        className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-gray-700/50 flex flex-col justify-center items-center p-6"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        <h3 className="text-white text-xl font-bold mb-2 text-center">
                          {track.name}
                        </h3>
                        <p className="text-gray-300 text-sm mb-4 text-center">
                          {track.artists.map(artist => artist.name).join(', ')}
                        </p>
                        <p className="text-gray-400 text-xs mb-6 text-center">
                          Album: {track.album.name}
                        </p>

                        {/* Bouton Ouvrir dans Spotify */}
                        <div className="flex justify-center">
                          <a
                            href={track.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-200 shadow-lg flex items-center space-x-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.6-.12-.421.18-.78.6-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.241 1.081zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.42-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            <span>Ouvrir</span>
                          </a>
                        </div>

                        <div className="mt-4 w-8 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Dots */}
        {tracks.length > visibleTracks && (
          <div className="flex justify-center mt-10 space-x-3">
            {tracks.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-3 bg-gradient-to-r from-green-400 to-blue-400 shadow-lg'
                    : 'w-3 h-3 bg-gray-600 hover:bg-gray-400 hover:scale-125'
                }`}
                aria-label={`Voir la piste ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Enhanced Instruction Text */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm flex items-center justify-center space-x-2">
            <span className="animate-pulse">🎵</span>
            <span>Cliquez sur une pochette pour découvrir la musique</span>
            <span className="animate-pulse">🎵</span>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Utilisez les flèches ← → ou glissez pour naviguer
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

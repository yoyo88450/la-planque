'use client';

import { useEffect, useRef, useState } from 'react';

interface SpotifyPlayerProps {
  trackId: string;
  accessToken: string;
  onTrackEnd?: () => void;
}

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

export default function SpotifyPlayer({ trackId, accessToken, onTrackEnd }: SpotifyPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // Try Web Playback SDK first, fallback to preview URL
    if (!accessToken || !hasValidScopes(accessToken)) {
      setUseFallback(true);
      return;
    }

    // Load Spotify Web Playback SDK
    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    function initializePlayer() {
      const player = new window.Spotify.Player({
        name: 'La Planque Music Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(accessToken);
        },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        setIsReady(true);
        setError(null);
      });

      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      player.addListener('player_state_changed', (state: any) => {
        if (!state) return;

        setIsPlaying(!state.paused);

        // Check if track ended
        if (state.position === 0 && state.paused && state.track_window.previous_tracks.length > 0) {
          onTrackEnd?.();
        }
      });

      player.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Failed to initialize:', message);
        setUseFallback(true);
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Failed to authenticate:', message);
        setUseFallback(true);
      });

      player.addListener('account_error', ({ message }: { message: string }) => {
        // Handle Premium requirement gracefully - this is expected for free accounts
        if (message.includes('premium users only') || message.includes('restricted to premium')) {
          console.log('Spotify Web Playback SDK requires Premium account - using fallback player');
        } else {
          console.error('Failed to validate Spotify account:', message);
        }
        setUseFallback(true);
      });

      player.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('Failed to perform playback:', message);
        setUseFallback(true);
      });

      player.connect();
      playerRef.current = player;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [accessToken, onTrackEnd]);

  // Check if token has valid scopes for Web Playback SDK
  const hasValidScopes = (token: string) => {
    // This is a basic check - in production you'd decode the JWT token
    // For now, we'll assume the token is valid if it exists
    return token.length > 50; // Basic length check
  };

  const togglePlay = async () => {
    if (useFallback) {
      // Use preview URL fallback
      window.open(`https://open.spotify.com/track/${trackId}`, '_blank');
      return;
    }

    if (!playerRef.current || !isReady) return;

    try {
      const state = await playerRef.current.getCurrentState();
      if (!state) {
        // No active device, start playing the track
        await fetch(`https://api.spotify.com/v1/me/player/play`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: [`spotify:track:${trackId}`],
          }),
        });
      } else {
        if (state.paused) {
          await playerRef.current.resume();
        } else {
          await playerRef.current.pause();
        }
      }
    } catch (err) {
      console.error('Error toggling play:', err);
      setError('Failed to control playback');
      setUseFallback(true);
    }
  };

  if (useFallback) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <p className="text-xs text-gray-400 text-center">
          Lecteur intégré nécessite Spotify Premium
        </p>
        <a
          href={`https://open.spotify.com/track/${trackId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm transition-colors duration-200 shadow-lg flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.6-.12-.421.18-.78.6-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.241 1.081zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span>Ouvrir dans Spotify</span>
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-gray-400 text-sm">
        <p>{error}</p>
        <a
          href={`https://open.spotify.com/track/${trackId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-500 hover:text-green-400 underline"
        >
          Ouvrir sur Spotify
        </a>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="text-center text-gray-400 text-sm">
        <p>Chargement du lecteur...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={togglePlay}
        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors duration-200 shadow-lg"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
      <a
        href={`https://open.spotify.com/track/${trackId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-xs transition-colors duration-200 shadow-lg"
      >
        Ouvrir sur Spotify
      </a>
    </div>
  );
}

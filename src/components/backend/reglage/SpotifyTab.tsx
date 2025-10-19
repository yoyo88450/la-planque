'use client';

import { useState, useEffect } from 'react';

interface Settings {
  artistsEnabled: boolean;
  boutiqueEnabled: boolean;
  spotifyEnabled: boolean;
  spotifyPlaylistId?: string;
  spotifyClientId?: string;
  spotifyClientSecret?: string;
}

export default function SpotifyTab() {
  const [settings, setSettings] = useState<Settings>({
    artistsEnabled: true,
    boutiqueEnabled: true,
    spotifyEnabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update settings
  const updateSettings = async (updates: Partial<Settings>) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        alert('Erreur lors de la mise à jour des paramètres');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updates: Partial<Settings> = {
      spotifyPlaylistId: formData.get('spotifyPlaylistId') as string || undefined,
      spotifyClientId: formData.get('spotifyClientId') as string || undefined,
      spotifyClientSecret: formData.get('spotifyClientSecret') as string || undefined,
    };
    updateSettings(updates);
  };

  const handleSpotifyAuth = async () => {
    try {
      const response = await fetch('/api/spotify/auth');
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        alert('Erreur lors de l\'authentification Spotify');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'authentification Spotify');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
        <h3 className="text-base md:text-lg font-semibold text-white mb-4">Configuration Spotify</h3>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
      <h3 className="text-base md:text-lg font-semibold text-white mb-4">Configuration Spotify</h3>
      <p className="text-sm text-gray-400 mb-6">
        Configurez l'intégration Spotify pour afficher une playlist sur la page d'accueil.
        Vous pouvez obtenir ces informations depuis le tableau de bord développeur Spotify.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Client ID Spotify
          </label>
          <input
            type="text"
            name="spotifyClientId"
            defaultValue={settings.spotifyClientId || ''}
            placeholder="Entrez votre Client ID Spotify"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Identifiant client de votre application Spotify
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Client Secret Spotify
          </label>
          <input
            type="password"
            name="spotifyClientSecret"
            defaultValue={settings.spotifyClientSecret || ''}
            placeholder="Entrez votre Client Secret Spotify"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Secret client de votre application Spotify (gardez-le confidentiel)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ID de la Playlist
          </label>
          <input
            type="text"
            name="spotifyPlaylistId"
            defaultValue={settings.spotifyPlaylistId || ''}
            placeholder="Entrez l'ID de votre playlist Spotify"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            ID de la playlist à afficher (trouvable dans l'URL Spotify de la playlist)
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSpotifyAuth}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Connexion OAuth Spotify
          </button>
          {settings.spotifyClientId && settings.spotifyClientSecret && (
            <span className="text-sm text-green-400 flex items-center">
              ✓ Client configuré
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-gray-700 rounded-md">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Comment configurer Spotify ?</h4>
        <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
          <li>Allez sur le <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">tableau de bord développeur Spotify</a></li>
          <li>Créez une application ou utilisez une existante</li>
          <li>Dans les paramètres de l'application, notez le Client ID et Client Secret</li>
          <li>Saisissez ces informations dans les champs ci-dessus et sauvegardez</li>
          <li>Cliquez sur "Connexion OAuth Spotify" pour autoriser l'application</li>
          <li>L'ID de playlist se trouve dans l'URL de votre playlist Spotify</li>
        </ol>
        <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded">
          <p className="text-xs text-yellow-300">
            <strong>Note:</strong> Le Web Playback SDK nécessite un compte Spotify Premium pour fonctionner.
            Si vous n'avez pas de compte Premium, le lecteur utilisera un lien vers Spotify.
          </p>
        </div>
      </div>
    </div>
  );
}

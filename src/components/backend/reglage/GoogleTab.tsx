'use client';

import { useState, useEffect } from 'react';

interface Settings {
  googleEnabled: boolean;
  googleApiKey?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googlePlaceId?: string;
  googleCalendarId?: string;
  googleAccessToken?: string;
}

export default function GoogleTab() {
  const [settings, setSettings] = useState<Settings>({
    googleEnabled: false
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
      googleApiKey: formData.get('googleApiKey') as string || undefined,
      googlePlaceId: formData.get('googlePlaceId') as string || undefined,
      googleCalendarId: formData.get('googleCalendarId') as string || undefined,
    };
    updateSettings(updates);
  };

  const handleGoogleAuth = async () => {
    try {
      const response = await fetch('/api/google/auth');
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        alert('Erreur lors de l\'authentification Google');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'authentification Google');
    }
  };

  const handleSetupWebhook = async () => {
    try {
      const response = await fetch('/api/google/calendar/webhook', {
        method: 'PUT',
      });
      if (response.ok) {
        const data = await response.json();
        alert('Webhook configuré avec succès ! Les changements dans Google Calendar seront maintenant synchronisés automatiquement.');
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la configuration du webhook: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la configuration du webhook');
    }
  };

  const handleManualSync = async () => {
    try {
      const response = await fetch('/api/google/calendar/sync', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Synchronisation terminée ! ${data.message}`);
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la synchronisation: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la synchronisation manuelle');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
        <h3 className="text-base md:text-lg font-semibold text-white mb-4">Configuration Google</h3>
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
      <h3 className="text-base md:text-lg font-semibold text-white mb-4">Configuration Google</h3>
      <p className="text-sm text-gray-400 mb-6">
        Connectez un compte Google pour récupérer les avis Google My Business.
        Vous pouvez obtenir ces informations depuis Google Cloud Console.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Clé API Google Places
          </label>
          <input
            type="password"
            name="googleApiKey"
            defaultValue={settings.googleApiKey || ''}
            placeholder="Entrez votre clé API Google Places"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Clé API pour accéder aux avis Google Places (gardez-la confidentielle)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ID du Lieu Google My Business
          </label>
          <input
            type="text"
            name="googlePlaceId"
            defaultValue={settings.googlePlaceId || ''}
            placeholder="Entrez l'ID de votre lieu Google My Business"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            ID du lieu pour récupérer les avis (trouvable dans Google My Business)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ID du Calendrier Google
          </label>
          <input
            type="text"
            name="googleCalendarId"
            defaultValue={settings.googleCalendarId || ''}
            placeholder="Entrez l'ID de votre calendrier Google"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            ID du calendrier pour synchroniser les rendez-vous (primary ou ID personnalisé)
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Connexion Google</span>
          </button>
          {settings.googleApiKey && settings.googlePlaceId && settings.googleCalendarId && (
            <span className="text-sm text-green-400 flex items-center">
              ✓ API configurée
            </span>
          )}
          <button
            type="button"
            onClick={handleSetupWebhook}
            disabled={!settings.googleAccessToken || !settings.googleCalendarId}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Configurer Webhook
          </button>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={!settings.googleAccessToken || !settings.googleCalendarId}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Synchronisation Manuelle
          </button>
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
        <h4 className="text-sm font-medium text-gray-300 mb-2">Comment configurer Google ?</h4>
        <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
          <li>Allez sur la <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Google Cloud Console</a></li>
          <li>Créez un projet ou utilisez un existant</li>
          <li>Activez l'API Places (New)</li>
          <li>Créez une clé API (API Key)</li>
          <li>Notez la clé API générée</li>
          <li>Pour le lieu, trouvez l'ID dans Google My Business Manager ou utilisez l'API Places pour rechercher votre établissement</li>
        </ol>
        <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded">
          <p className="text-xs text-yellow-300">
            <strong>Note:</strong> L'API Places permet d'accéder aux avis publics. Pour les avis privés, utilisez Google My Business API.
          </p>
        </div>
      </div>
    </div>
  );
}

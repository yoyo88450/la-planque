'use client';

import { useState, useEffect } from 'react';

interface Settings {
  artistsEnabled: boolean;
  boutiqueEnabled: boolean;
}

export default function SettingsSwitches() {
  const [settings, setSettings] = useState<Settings>({
    artistsEnabled: true,
    boutiqueEnabled: true
  });
  const [loading, setLoading] = useState(true);

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

  // Update setting
  const updateSetting = async (key: keyof Settings, value: boolean) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });

      if (response.ok) {
        setSettings(prev => ({ ...prev, [key]: value }));
      } else {
        alert('Erreur lors de la mise à jour du paramètre');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du paramètre');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700 mb-6">
        <h3 className="text-base md:text-lg font-semibold text-white mb-4">Paramètres des sections</h3>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700 mb-6">
      <h3 className="text-base md:text-lg font-semibold text-white mb-4">Paramètres des sections</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Section Artistes
            </label>
            <p className="text-xs text-gray-500">
              Activer/désactiver l'affichage des artistes sur la page d'accueil
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.artistsEnabled}
              onChange={(e) => updateSetting('artistsEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Section Boutique
            </label>
            <p className="text-xs text-gray-500">
              Activer/désactiver l'accès à la boutique (page de maintenance si désactivé)
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.boutiqueEnabled}
              onChange={(e) => updateSetting('boutiqueEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import NavigationMenu from '../../../components/backend/NavigationMenu';
import ArtistsTab from '../../../components/backend/reglage/ArtistsTab';
import BoutiqueTab from '../../../components/backend/reglage/BoutiqueTab';
import SettingsSwitches from '../../../components/backend/reglage/SettingsSwitches';

type TabType = 'artists' | 'boutique';

export default function AdminReglagePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('artists');

  return (
    <div className="min-h-screen bg-gray-900">
      <NavigationMenu mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Réglages</h2>
          <p className="text-gray-400 text-sm md:text-base">Gérez les paramètres de l'application</p>
        </div>

        {/* Settings Switches */}
        <SettingsSwitches />

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('artists')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'artists'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Artistes
              </button>
              <button
                onClick={() => setActiveTab('boutique')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'boutique'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Boutique
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'artists' && <ArtistsTab />}

        {activeTab === 'boutique' && <BoutiqueTab />}
      </div>
    </div>
  );
}

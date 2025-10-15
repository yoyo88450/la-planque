'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '../../lib/stores';
import { mockReservations } from '../../data/mockData';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, login, logout } = useAdminStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setLoginError('');
    } else {
      setLoginError('Mot de passe incorrect');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">Administration</h1>

          <div className="bg-gray-800 rounded-lg shadow-md p-8 border border-gray-700">
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  placeholder="Entrez le mot de passe"
                />
                {loginError && (
                  <p className="text-red-600 text-sm mt-2">{loginError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Se connecter
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Custom Navigation Menu */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg md:text-xl font-bold text-white">Administration La Planque</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/admin"
                className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Tableau de bord
              </Link>
              <Link
                href="/admin/reservations"
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Réservations
              </Link>
              <Link
                href="/admin/artistes"
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Artistes
              </Link>
                <Link
                href="/admin/boutique"
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Boutique
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
              >
                Déconnexion
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-gray-300 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700 py-4">
              <div className="flex flex-col space-y-2">
                <Link
                  href="/admin"
                  className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/admin/reservations"
                  className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Réservations
                </Link>
              <Link
                href="/admin/artistes"
                className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Artistes
              </Link>                
                <Link
                  href="/admin/boutique"
                  className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Boutique
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm text-left"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Tableau de bord</h2>
          <p className="text-gray-400 text-sm md:text-base">Bienvenue dans votre espace d'administration</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gray-800 rounded-lg shadow-md p-4 md:p-6 border border-gray-700">
            <h3 className="text-base md:text-lg font-semibold text-white mb-2">Réservations aujourd'hui</h3>
            <p className="text-2xl md:text-3xl font-bold text-blue-400">
              {mockReservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-md p-4 md:p-6 border border-gray-700">
            <h3 className="text-base md:text-lg font-semibold text-white mb-2">Réservations cette semaine</h3>
            <p className="text-2xl md:text-3xl font-bold text-green-400">
              {mockReservations.filter(r => {
                const reservationDate = new Date(r.date);
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                return reservationDate >= weekAgo;
              }).length}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-md p-4 md:p-6 border border-gray-700">
            <h3 className="text-base md:text-lg font-semibold text-white mb-2">Total réservations</h3>
            <p className="text-2xl md:text-3xl font-bold text-purple-400">{mockReservations.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
          <h3 className="text-base md:text-lg font-semibold text-white mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <Link
              href="/admin/reservations"
              className="bg-blue-600 text-white px-3 md:px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center text-sm md:text-base"
            >
              Gérer les réservations
            </Link>
            <Link
              href="/admin/boutique"
              className="bg-green-600 text-white px-3 md:px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center text-sm md:text-base"
            >
              Gérer la boutique
            </Link>
            <button className="bg-purple-600 text-white px-3 md:px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm md:text-base">
              Exporter les données
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

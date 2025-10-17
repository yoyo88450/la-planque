'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavigationMenu from '../../components/backend/NavigationMenu';
import { mockReservations } from '../../data/mockData';

export default function AdminPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appointmentsCount, setAppointmentsCount] = useState(0);

  // Fetch appointments count for stats
  useEffect(() => {
    const fetchAppointmentsCount = async () => {
      try {
        const response = await fetch('/api/admin/appointments');
        if (response.ok) {
          const appointments = await response.json();
          setAppointmentsCount(appointments.length);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des rendez-vous:', error);
      }
    };

    fetchAppointmentsCount();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <NavigationMenu mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Tableau de bord</h2>
          <p className="text-gray-400 text-sm md:text-base">Bienvenue dans votre espace d'administration</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gray-800 rounded-lg shadow-md p-4 md:p-6 border border-gray-700">
            <h3 className="text-base md:text-lg font-semibold text-white mb-2">Rendez-vous aujourd'hui</h3>
            <p className="text-2xl md:text-3xl font-bold text-blue-400">
              {mockReservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-md p-4 md:p-6 border border-gray-700">
            <h3 className="text-base md:text-lg font-semibold text-white mb-2">Rendez-vous cette semaine</h3>
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
            <h3 className="text-base md:text-lg font-semibold text-white mb-2">Total rendez-vous</h3>
            <p className="text-2xl md:text-3xl font-bold text-purple-400">{appointmentsCount}</p>
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
              Gérer les rendez-vous
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

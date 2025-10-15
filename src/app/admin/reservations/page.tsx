'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '../../../lib/stores';
import { mockReservations } from '../../../data/mockData';

export default function AdminReservationsPage() {
  const { isAuthenticated } = useAdminStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Accès refusé</h1>
          <p className="text-gray-400">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  // Generate time slots from 8h to 23h
  const timeSlots = [];
  for (let hour = 8; hour <= 23; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  // Get reservations for selected date
  const dayReservations = mockReservations.filter(r => r.date === selectedDate);

  // Create a map of time slots to reservations
  const reservationsByTime = timeSlots.reduce((acc, time) => {
    acc[time] = dayReservations.find(r => r.time === time) || null;
    return acc;
  }, {} as Record<string, typeof mockReservations[0] | null>);

  // Get week dates
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();

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
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Tableau de bord
              </Link>
              <Link
                href="/admin/reservations"
                className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Réservations
              </Link>
              <Link
                href="/admin/boutique"
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Boutique
              </Link>
              <Link
                href="/admin"
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
              >
                Retour
              </Link>
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
                  className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/admin/reservations"
                  className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Réservations
                </Link>
                <Link
                  href="/admin/boutique"
                  className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Boutique
                </Link>
                <Link
                  href="/admin"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm text-left"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Retour
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Agenda des réservations</h2>
          <p className="text-gray-400 text-sm md:text-base">Gérez les réservations par semaine et par heure</p>
        </div>

        {/* Week Navigation - Mobile Optimized */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {weekDates.map((date) => {
              const dateObj = new Date(date);
              const isSelected = date === selectedDate;
              const isToday = date === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-xs md:text-sm whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : isToday
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="hidden md:block">
                    {dateObj.toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                  <div className="md:hidden">
                    {dateObj.toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Agenda Grid - Mobile Optimized */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-base md:text-lg font-semibold text-white">
              {new Date(selectedDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </h3>
          </div>

          <div className="max-h-[60vh] md:max-h-[600px] overflow-y-auto">
            {timeSlots.map((time) => {
              const reservation = reservationsByTime[time];

              return (
                <div
                  key={time}
                  className={`p-3 md:p-4 border-b border-gray-700 hover:bg-gray-750 transition-colors ${
                    reservation ? 'bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div className="flex items-center space-x-3 md:space-x-4 flex-1">
                      <div className="text-white font-medium w-12 md:w-16 text-sm md:text-base">{time}</div>
                      {reservation ? (
                        <div className="flex-1 min-w-0">
                          <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium inline-block mb-1">
                            Réservé
                          </div>
                          <div className="text-gray-300 text-sm">
                            <div className="font-medium truncate">{reservation.name}</div>
                            <div className="text-xs md:text-sm">{reservation.guests} musiciens • {reservation.email}</div>
                            {reservation.message && (
                              <div className="text-xs text-gray-400 mt-1 truncate">{reservation.message}</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 text-gray-500 text-sm">
                          <span>Disponible</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 md:justify-end">
                      {reservation ? (
                        <>
                          <button className="text-blue-400 hover:text-blue-300 text-xs md:text-sm px-2 md:px-3 py-1 rounded border border-blue-400 hover:border-blue-300 transition-colors">
                            Modifier
                          </button>
                          <button className="text-red-400 hover:text-red-300 text-xs md:text-sm px-2 md:px-3 py-1 rounded border border-red-400 hover:border-red-300 transition-colors">
                            Annuler
                          </button>
                        </>
                      ) : (
                        <button className="text-green-400 hover:text-green-300 text-xs md:text-sm px-2 md:px-3 py-1 rounded border border-green-400 hover:border-green-300 transition-colors">
                          Réserver
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend - Mobile Optimized */}
        <div className="mt-4 md:mt-6 bg-gray-800 rounded-lg p-3 md:p-4 border border-gray-700">
          <h4 className="text-white font-medium mb-3 text-sm md:text-base">Légende</h4>
          <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-700 rounded"></div>
              <span className="text-gray-300">Disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-600 rounded"></div>
              <span className="text-gray-300">Réservé</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-green-600 rounded"></div>
              <span className="text-gray-300">Aujourd'hui</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

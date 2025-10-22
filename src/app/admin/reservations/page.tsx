'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavigationMenu from '../../../components/backend/NavigationMenu';


import Legend from '../../../components/backend/reservation_admin/Legend';
import SelectedTimesSummary from '../../../components/backend/reservation_admin/SelectedTimesSummary';
import CalendarGrid from '../../../components/backend/reservation_admin/CalendarGrid';
import BookingFormModal from '../../../components/backend/reservation_admin/BookingFormModal';
import EditFormModal from '../../../components/backend/reservation_admin/EditFormModal';
import ReservationDetailsModal from '../../../components/backend/reservation_admin/ReservationDetailsModal';
import LoadingSpinner from '../../../components/backend/reservation_admin/LoadingSpinner';
import WeekNavigator from '../../../components/backend/reservation_admin/WeekNavigator';

import { Appointment, Reservation } from '../../../components/backend/reservation_admin/types';

interface Settings {
  googleEnabled: boolean;
  googleApiKey?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googlePlaceId?: string;
  googleCalendarId?: string;
  googleAccessToken?: string;
}

export default function AdminReservationsPage() {
  // No authentication needed
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showReservationDetails, setShowReservationDetails] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    date: '',
    time: ''
  });
  const [settings, setSettings] = useState<Settings | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  // Handle calendar sync
  const handleSyncCalendars = async () => {
    try {
      setSyncLoading(true);
      const response = await fetch('/api/google/calendar/sync', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Synchronisation avec Google Calendar réussie!');
        fetchAppointments(); // Refresh appointments after sync
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la synchronisation: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      alert('Erreur lors de la synchronisation avec Google Calendar');
    } finally {
      setSyncLoading(false);
    }
  };

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Set up real-time sync with Google Calendar
  useEffect(() => {
    // Set up webhook for real-time updates
    const setupRealtimeSync = async () => {
      try {
        const response = await fetch('/api/google/calendar/webhook', {
          method: 'PUT',
        });

        if (response.ok) {
          console.log('Real-time sync with Google Calendar enabled');
        } else {
          console.log('Real-time sync setup failed, will use manual sync');
        }
      } catch (error) {
        console.log('Real-time sync setup failed, will use manual sync');
      }
    };

    // Only set up webhook if we have Google Calendar configured
    if (settings?.googleAccessToken && settings?.googleCalendarId) {
      setupRealtimeSync();
    }

    // Set up polling as fallback (every 5 minutes)
    const pollInterval = setInterval(() => {
      if (settings?.googleAccessToken && settings?.googleCalendarId) {
        handleSyncCalendars();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(pollInterval);
  }, [settings]);

  // Detect screen size and set view mode
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768; // md breakpoint
      setViewMode(isMobile ? 'day' : 'week');
    };

    handleResize(); // Set initial mode
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        console.error('Erreur lors du chargement des rendez-vous');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert appointments to reservation format for calendar display
  const convertToReservations = (appointments: Appointment[]): Reservation[] => {
    return appointments.map(appointment => {
      const date = new Date(appointment.date);
      return {
        id: appointment.id,
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().slice(0, 5),
        name: appointment.clientName || (appointment.user?.username) || 'Client',
        email: appointment.clientEmail || 'user@example.com',
        phone: appointment.clientPhone || '06 XX XX XX XX',
        guests: 1, // Default
        message: appointment.clientMessage || appointment.description || undefined,
        service: appointment.title.replace('Réservation ', '') || 'enregistrement'
      };
    });
  };

  const reservations = convertToReservations(appointments);

  // No authentication check needed

  // Handle reservation click to show details
  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowReservationDetails(true);
  };

  // Handle reservation deletion
  const handleDeleteReservation = async (reservation: Reservation) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la réservation de ${reservation.name} pour le ${new Date(reservation.date).toLocaleDateString('fr-FR')} à ${reservation.time} ?`)) {
      try {
        const response = await fetch(`/api/admin/appointments/${reservation.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Réservation supprimée avec succès!');
          setShowReservationDetails(false);
          fetchAppointments(); // Refresh the appointments
        } else {
          alert('Erreur lors de la suppression de la réservation');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la réservation');
      }
    }
  };

  // Handle edit reservation
  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setEditFormData({
      name: reservation.name,
      email: reservation.email,
      phone: reservation.phone,
      service: reservation.service || '',
      message: reservation.message || '',
      date: reservation.date,
      time: reservation.time
    });
    setShowEditForm(true);
    setShowReservationDetails(false);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReservation) return;

    try {
      // Combine date and time for the appointment
      const appointmentDate = new Date(`${editFormData.date}T${editFormData.time}`);

      const response = await fetch(`/api/admin/appointments/${editingReservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Réservation ${editFormData.service}`,
          description: editFormData.message,
          date: appointmentDate.toISOString(),
          duration: 60 // Default duration
        }),
      });

      if (response.ok) {
        alert('Réservation modifiée avec succès!');
        setShowEditForm(false);
        setEditingReservation(null);
        fetchAppointments(); // Refresh the appointments
      } else {
        alert('Erreur lors de la modification de la réservation');
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification de la réservation');
    }
  };

  // Generate week dates starting from Monday
  const generateWeekDates = () => {
    const week = [];
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = generateWeekDates();

  // Generate full day time slots (8 AM to 11 PM, every hour)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Handle time slot selection (date-time combination)
  const handleTimeClick = (dateStr: string, time: string) => {
    const slotKey = `${dateStr}|${time}`;
    const reservation = reservations.find(r => r.date === dateStr && r.time === time);
    if (reservation) {
      // If there's a reservation, show details instead of selecting
      handleReservationClick(reservation);
      return;
    }

    setSelectedTimes(prev =>
      prev.includes(slotKey)
        ? prev.filter(t => t !== slotKey)
        : [...prev, slotKey]
    );
  };

  // Check if time slot is selected
  const isTimeSelected = (dateStr: string, time: string) => {
    return selectedTimes.includes(`${dateStr}|${time}`);
  };

  // Handle booking form submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // No need to fetch userId anymore - API handles it automatically

      // Create appointments for each selected time slot
      const createdAppointments = [];
      for (const slotKey of selectedTimes) {
        const [dateStr, time] = slotKey.split('|');
        const appointmentDate = new Date(`${dateStr}T${time}`);

        const response = await fetch('/api/admin/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `Réservation ${bookingFormData.service}`,
            description: bookingFormData.message,
            date: appointmentDate.toISOString(),
            duration: 60,

            clientName: bookingFormData.name,
            clientEmail: bookingFormData.email,
            clientPhone: bookingFormData.phone,
            clientMessage: bookingFormData.message
          }),
        });

        if (response.ok) {
          const appointment = await response.json();
          createdAppointments.push(appointment);
        } else {
          console.error('Erreur lors de la création du rendez-vous');
        }
      }

      if (createdAppointments.length > 0) {
        alert(`${createdAppointments.length} rendez-vous créés avec succès!`);
        setShowBookingForm(false);
        setSelectedTimes([]);
        setBookingFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          message: ''
        });
        fetchAppointments(); // Refresh the appointments
      }
    } catch (error) {
      console.error('Erreur lors de la création des rendez-vous:', error);
      alert('Erreur lors de la création des rendez-vous');
    }
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBookingFormData({
      ...bookingFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  // Navigation functions
  const goToPreviousWeek = () => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
    setSelectedTimes([]); // Reset selections when changing week
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
    setSelectedTimes([]); // Reset selections when changing week
  };

  const goToPreviousDay = () => {
    setCurrentDay(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
    setSelectedTimes([]); // Reset selections when changing day
  };

  const goToNextDay = () => {
    setCurrentDay(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
    setSelectedTimes([]); // Reset selections when changing day
  };

  // Check if date is in the past
  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if time slot is in the past for today
  const isTimeSlotInPast = (dateStr: string, time: string) => {
    const today = new Date();
    if (dateStr !== today.toISOString().split('T')[0]) return false;

    const [hours] = time.split(':').map(Number);
    const slotTime = new Date(today);
    slotTime.setHours(hours, 0, 0, 0);
    return slotTime < today;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <NavigationMenu />

      <br></br>
      <br></br>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 md:mb-16 space-y-8 lg:space-y-0">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Agenda des réservations</h2>
            <p className="text-gray-400 text-base md:text-lg">
              {viewMode === 'day' ? 'Vue détaillée de la journée' : 'Vue complète de la semaine avec tous les rendez-vous'}
            </p>
          </div>

          <div className="flex flex-col space-y-6 w-full lg:w-auto">
            {/* Navigation Controls */}
            <div className="flex flex-col space-y-4">
              {/* Week Navigation Row */}
              <div className="flex items-center justify-center space-x-2 bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-700/30">
                <button
                  onClick={viewMode === 'day' ? goToPreviousDay : goToPreviousWeek}
                  className="p-2 rounded-lg bg-gray-700/60 text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                  title={viewMode === 'day' ? "Jour précédent" : "Semaine précédente"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex flex-col items-center min-w-[160px] px-3 py-2 bg-gradient-to-br from-gray-800/60 to-gray-700/60 rounded-lg shadow-inner">
                  {viewMode === 'day' ? (
                    <>
                      <h3 className="text-sm md:text-base font-bold text-white text-center">
                        {currentDay.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </h3>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        {currentDay.toLocaleDateString('fr-FR', { year: 'numeric' })}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm md:text-base font-bold text-white text-center">
                        Semaine du {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      </h3>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        au {weekDates[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </>
                  )}
                </div>

                <button
                  onClick={viewMode === 'day' ? goToNextDay : goToNextWeek}
                  className="p-2 rounded-lg bg-gray-700/60 text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                  title={viewMode === 'day' ? "Jour suivant" : "Semaine suivante"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    if (viewMode === 'day') {
                      setCurrentDay(new Date());
                    } else {
                      setCurrentWeek(new Date());
                    }
                  }}
                  className="p-2 rounded-lg bg-gray-700/60 text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                  title={viewMode === 'day' ? "Jour actuel" : "Semaine actuelle"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12a9 9 0 012-5.657V3a1 1 0 011-1h1a1 1 0 010 2H5.414a7 7 0 00-2.828 2.828A7 7 0 0012 19a7 7 0 000-14v-.586a1 1 0 011-1h1a1 1 0 010 2h-1v.586A9 9 0 013 12z" />
                  </svg>
                </button>

                <button
                  onClick={fetchAppointments}
                  disabled={loading}
                  className="p-2 rounded-lg bg-gradient-to-r from-blue-600/60 to-blue-700/60 text-blue-300 hover:from-blue-600 hover:to-blue-700 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 hover:shadow-lg"
                  title="Actualiser les rendez-vous"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                <button
                  onClick={handleSyncCalendars}
                  disabled={syncLoading}
                  className="p-2 rounded-lg bg-gradient-to-r from-green-600/60 to-green-700/60 text-green-300 hover:from-green-600 hover:to-green-700 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 hover:shadow-lg"
                  title="Synchroniser avec Google Calendar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <Legend />



        {/* Weekly Calendar Grid */}
        <CalendarGrid
          weekDates={weekDates}
          timeSlots={timeSlots}
          reservations={reservations}
          selectedTimes={selectedTimes}
          handleTimeClick={handleTimeClick}
          isTimeSelected={isTimeSelected}
          isDateInPast={isDateInPast}
          isTimeSlotInPast={isTimeSlotInPast}
          viewMode={viewMode}
          currentDay={currentDay}
        />

        {/* Booking Form Modal */}
        <BookingFormModal
          showBookingForm={showBookingForm}
          setShowBookingForm={setShowBookingForm}
          selectedTimes={selectedTimes}
          bookingFormData={bookingFormData}
          setBookingFormData={setBookingFormData}
          handleBookingSubmit={handleBookingSubmit}
          handleFormChange={handleFormChange}
        />

        {/* Edit Form Modal */}
        <EditFormModal
          showEditForm={showEditForm}
          setShowEditForm={setShowEditForm}
          editingReservation={editingReservation}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          handleEditSubmit={handleEditSubmit}
          handleEditFormChange={handleEditFormChange}
        />

        {/* Reservation Details Modal */}
        <ReservationDetailsModal
          showReservationDetails={showReservationDetails}
          setShowReservationDetails={setShowReservationDetails}
          selectedReservation={selectedReservation}
          handleEditReservation={handleEditReservation}
          handleDeleteReservation={handleDeleteReservation}
        />

        {/* Loading State */}
        <LoadingSpinner loading={loading} />

        {/* Floating Action Buttons */}
        {selectedTimes.length > 0 && (
          <div className="fixed bottom-4 right-4 flex items-center space-x-2 z-50">
            <button
              onClick={() => setSelectedTimes([])}
              className="bg-gray-600 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300"
              title="Annuler la sélection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setShowBookingForm(true)}
              className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300"
              title="Ajouter une réservation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

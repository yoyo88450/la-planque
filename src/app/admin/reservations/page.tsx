'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminStore } from '../../../lib/stores';

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  date: string;
  duration: number;
  user: {
    username: string;
  };
  clientName?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientMessage?: string | null;
}

interface Reservation {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  message?: string;
  service?: string;
}

export default function AdminReservationsPage() {
  const { isAuthenticated } = useAdminStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
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
        name: appointment.clientName || appointment.user.username,
        email: appointment.clientEmail || 'user@example.com',
        phone: appointment.clientPhone || '06 XX XX XX XX',
        guests: 1, // Default
        message: appointment.clientMessage || appointment.description || undefined,
        service: appointment.title.replace('Réservation ', '') || 'enregistrement'
      };
    });
  };

  const reservations = convertToReservations(appointments);

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
      // Get default user for new appointments
      const userResponse = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'admin123' }) });
      let userId = 'cmgsbo9ts00001rm0pdmc9922'; // Use the correct admin user ID from database

      if (userResponse.ok) {
        const userData = await userResponse.json();
        // Since auth doesn't return user ID, use the correct one
        userId = 'cmgsbo9ts00001rm0pdmc9922';
      }

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
            userId: userId,
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
                href="/admin/artistes"
                className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Artistes
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
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Agenda des réservations</h2>
            <p className="text-gray-400 text-sm md:text-base">Vue complète de la semaine avec tous les rendez-vous</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousWeek}
              className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <h3 className="text-lg md:text-xl font-semibold text-white min-w-[200px] text-center">
              Semaine du {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </h3>

            <button
              onClick={goToNextWeek}
              className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={fetchAppointments}
              disabled={loading}
              className="p-2 rounded-lg bg-blue-600/50 text-blue-300 hover:bg-blue-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Actualiser les rendez-vous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

                {/* Legend */}
        <div className="mt-4 md:mt-6 bg-gray-800 rounded-lg p-3 md:p-4 border border-gray-700">
          <h4 className="text-white font-medium mb-3 text-sm md:text-base">Légende</h4>
          <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-700/50 rounded"></div>
              <span className="text-gray-300">Libre</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-600 rounded"></div>
              <span className="text-gray-300">Réservé</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-green-600 rounded"></div>
              <span className="text-gray-300">Sélectionné</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-800/50 rounded"></div>
              <span className="text-gray-300">Passé</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-900/20 border border-blue-600/30 rounded"></div>
              <span className="text-gray-300">Aujourd'hui</span>
            </div>
          </div>
        </div>

        <br></br>

        {/* Selected Times Summary */}
        {selectedTimes.length > 0 && (
          <div className="mb-4 md:mb-6 bg-green-900/20 border border-green-600/30 rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
              <div>
                <h4 className="text-green-300 font-semibold text-sm md:text-base">Créneaux sélectionnés ({selectedTimes.length})</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTimes.sort().map(slotKey => {
                    const [dateStr, time] = slotKey.split('|');
                    const date = new Date(dateStr);
                    return (
                      <span key={slotKey} className="px-3 py-1 bg-green-600/50 text-green-200 rounded-lg text-sm">
                        {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })} {time}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                >
                  Réserver ({selectedTimes.length})
                </button>
                <button
                  onClick={() => setSelectedTimes([])}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm"
                >
                  Désélectionner
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Calendar Grid */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {/* Header with days */}
          <div className="grid grid-cols-8 gap-1 p-4 border-b border-gray-700">
            <div className="text-center text-gray-400 font-medium text-sm py-2">Heure</div>
            {weekDates.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isPast = isDateInPast(date);
              return (
                <div
                  key={index}
                  className={`text-center text-sm font-medium py-2 ${
                    isToday
                      ? 'text-blue-400 bg-blue-900/20 rounded-lg'
                      : isPast
                      ? 'text-gray-500'
                      : 'text-gray-300'
                  }`}
                >
                  <div className="font-semibold">
                    {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </div>
                  <div className="text-xs">
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time slots grid */}
          <div className="max-h-[60vh] md:max-h-[600px] overflow-y-auto">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 gap-1 p-1">
                <div className="p-2 text-center text-gray-400 font-medium text-sm bg-gray-700/30 rounded-lg flex items-center justify-center">
                  {time}
                </div>
                {weekDates.map((date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const reservation = reservations.find(r => r.date === dateStr && r.time === time);
                  const isSelected = isTimeSelected(dateStr, time);
                  const isPast = isDateInPast(date) || isTimeSlotInPast(dateStr, time);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={`${dateStr}|${time}`}
                      onClick={() => handleTimeClick(dateStr, time)}
                      disabled={isPast}
                      className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 min-h-[60px] md:min-h-[80px] ${
                        reservation
                          ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                          : isSelected
                          ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700'
                          : isPast
                          ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                          : isToday
                          ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 border border-blue-600/30'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {reservation ? (
                        <div className="h-full flex flex-col justify-center text-center">
                          <div className="font-semibold truncate">{reservation.name}</div>
                          <div className="text-xs opacity-90">{reservation.service}</div>
                          <div className="text-xs opacity-75 mt-1">{reservation.email}</div>
                        </div>
                      ) : isSelected ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="font-semibold">Sélectionné</div>
                            <div className="w-4 h-4 bg-white rounded-full mx-auto mt-1"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-center">
                          {isPast ? 'Passé' : 'Libre'}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Nouvelle réservation</h3>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600/50 rounded-xl">
                  <div className="flex items-center space-x-2 text-blue-300 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Créneaux sélectionnés ({selectedTimes.length})</span>
                  </div>
                  <div className="space-y-1">
                    {selectedTimes.sort().map(slotKey => {
                      const [dateStr, time] = slotKey.split('|');
                      const date = new Date(dateStr);
                      return (
                        <p key={slotKey} className="text-white text-sm">
                          {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {time}
                        </p>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
                      Service souhaité *
                    </label>
                    <select
                      id="service"
                      name="service"
                      required
                      value={bookingFormData.service}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="" className="bg-gray-700">Choisir un service</option>
                      <option value="enregistrement" className="bg-gray-700">Enregistrement</option>
                      <option value="mixage" className="bg-gray-700">Mixage</option>
                      <option value="mastering" className="bg-gray-700">Mastering</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={bookingFormData.name}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Votre nom"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={bookingFormData.email}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={bookingFormData.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="+33 6 XX XX XX XX"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message (optionnel)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      value={bookingFormData.message}
                      onChange={handleFormChange}
                      placeholder="Informations supplémentaires, demandes spéciales..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      Confirmer la réservation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {showEditForm && editingReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Modifier la réservation</h3>
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="edit-service" className="block text-sm font-medium text-gray-300 mb-2">
                      Service souhaité *
                    </label>
                    <select
                      id="edit-service"
                      name="service"
                      required
                      value={editFormData.service}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="" className="bg-gray-700">Choisir un service</option>
                      <option value="enregistrement" className="bg-gray-700">Enregistrement</option>
                      <option value="mixage" className="bg-gray-700">Mixage</option>
                      <option value="mastering" className="bg-gray-700">Mastering</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-date" className="block text-sm font-medium text-gray-300 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        id="edit-date"
                        name="date"
                        required
                        value={editFormData.date}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-time" className="block text-sm font-medium text-gray-300 mb-2">
                        Heure *
                      </label>
                      <input
                        type="time"
                        id="edit-time"
                        name="time"
                        required
                        value={editFormData.time}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        id="edit-name"
                        name="name"
                        required
                        value={editFormData.name}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Votre nom"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="edit-email"
                        name="email"
                        required
                        value={editFormData.email}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      id="edit-phone"
                      name="phone"
                      required
                      value={editFormData.phone}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="+33 6 XX XX XX XX"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      Modifier la réservation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Reservation Details Modal */}
        {showReservationDetails && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Détails de la réservation</h3>
                  <button
                    onClick={() => setShowReservationDetails(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-900/30 border border-blue-600/50 rounded-xl">
                    <div className="flex items-center space-x-2 text-blue-300 mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Informations de réservation</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-white">
                        <span className="text-gray-400">Date:</span> {new Date(selectedReservation.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-white">
                        <span className="text-gray-400">Heure:</span> {selectedReservation.time}
                      </p>
                      <p className="text-white">
                        <span className="text-gray-400">Service:</span> {selectedReservation.service}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-xl">
                    <div className="flex items-center space-x-2 text-gray-300 mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">Informations client</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-white">
                        <span className="text-gray-400">Nom:</span> {selectedReservation.name}
                      </p>
                      <p className="text-white">
                        <span className="text-gray-400">Email:</span> {selectedReservation.email}
                      </p>
                      <p className="text-white">
                        <span className="text-gray-400">Téléphone:</span> {selectedReservation.phone}
                      </p>
                      {selectedReservation.message && (
                        <p className="text-white">
                          <span className="text-gray-400">Message:</span> {selectedReservation.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => handleEditReservation(selectedReservation)}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteReservation(selectedReservation)}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-white">Chargement des rendez-vous...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

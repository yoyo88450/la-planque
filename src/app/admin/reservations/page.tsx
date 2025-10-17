'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminStore } from '../../../lib/stores';

import Legend from '../../../components/reservation_admin/Legend';
import SelectedTimesSummary from '../../../components/reservation_admin/SelectedTimesSummary';
import CalendarGrid from '../../../components/reservation_admin/CalendarGrid';
import BookingFormModal from '../../../components/reservation_admin/BookingFormModal';
import EditFormModal from '../../../components/reservation_admin/EditFormModal';
import ReservationDetailsModal from '../../../components/reservation_admin/ReservationDetailsModal';
import LoadingSpinner from '../../../components/reservation_admin/LoadingSpinner';

import { Appointment, Reservation } from '../../../components/reservation_admin/types';

export default function AdminReservationsPage() {
  const { isAuthenticated } = useAdminStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
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

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

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
                className="text-white hover:text-gray-300 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
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
        <Legend />

        {/* Selected Times Summary */}
        {selectedTimes.length > 0 && (
          <SelectedTimesSummary
            selectedTimes={selectedTimes}
            setShowBookingForm={setShowBookingForm}
            setSelectedTimes={setSelectedTimes}
          />
        )}

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
      </div>
    </div>
  );
}

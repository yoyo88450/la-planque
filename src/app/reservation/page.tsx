'use client';

import { useState } from 'react';
import { useBookingStore } from '../../lib/stores';

export default function ReservationPage() {
  const [formData, setFormData] = useState({
    date: '',
    times: [] as string[],
    service: '',
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const addBooking = useBookingStore((state) => state.addBooking);
  const getBookingsByDate = useBookingStore((state) => state.getBookingsByDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create separate bookings for each selected time
    formData.times.forEach(time => {
      addBooking({
        date: formData.date,
        time: time,
        service: formData.service,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        guests: 1,
        message: formData.message
      });
    });
    setIsSubmitted(true);
    setFormData({
      date: '',
      times: [],
      service: '',
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    setSelectedDate('');
    setShowForm(false);
    setSelectedTime('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTimeClick = (time: string, dateStr: string) => {
    const isBooked = getBookingsByDate(dateStr).some(booking => booking.time === time);
    if (!isBooked) {
      setSelectedTime(time);
      setSelectedDate(dateStr);
      setFormData(prev => ({
        ...prev,
        date: dateStr,
        times: [time]
      }));
      setShowForm(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Réservation confirmée !</h2>
          <p className="text-green-700 mb-6">
            Merci pour votre réservation. Nous vous contacterons bientôt pour confirmer les détails.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Nouvelle réservation
          </button>
        </div>
      </div>
    );
  }

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

  // Generate full day time slots (9 AM to 6 PM, every hour)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Navigation functions
  const goToPreviousWeek = () => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
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
    const slotDate = new Date(dateStr);
    if (slotDate.toDateString() !== today.toDateString()) return false;

    const [hours] = time.split(':').map(Number);
    const slotTime = new Date(today);
    slotTime.setHours(hours, 0, 0, 0);
    return slotTime < today;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-center text-white mb-4">Réserver votre session</h1>
          <p className="text-center text-gray-300 mb-12 text-lg">Choisissez votre créneau horaire pour une session d'enregistrement professionnelle</p>

          {/* Info Section */}
          <div className="mt-12 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Informations importantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Les réservations sont confirmées sous 24h</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Apportez vos instruments et partitions</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Annulation gratuite jusqu'à 48h avant</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Équipements professionnels fournis</p>
                </div>
              </div>
            </div>
          </div>

          <br></br>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            {/* Weekly Calendar Section */}
            <div className="xl:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Semaine du {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </h2>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPreviousWeek}
                    className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={goToNextWeek}
                    className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Week Calendar Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Header with days */}
                  <div className="grid grid-cols-8 gap-1 mb-2">
                    <div className="p-2 text-center text-gray-400 font-medium text-sm">Heure</div>
                    {weekDates.map((date, index) => {
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isPast = isDateInPast(date);
                      return (
                        <div
                          key={index}
                          className={`p-2 text-center text-sm font-medium ${
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
                  <div className="space-y-1">
                    {timeSlots.map((time) => (
                      <div key={time} className="grid grid-cols-8 gap-1">
                        <div className="p-2 text-center text-gray-400 font-medium text-sm bg-gray-700/30 rounded-lg">
                          {time}
                        </div>
                        {weekDates.map((date) => {
                          const dateStr = date.toISOString().split('T')[0];
                          const isBooked = getBookingsByDate(dateStr).some(booking => booking.time === time);
                          const isPast = isDateInPast(date) || isTimeSlotInPast(dateStr, time);
                          const isToday = date.toDateString() === new Date().toDateString();

                          return (
                            <button
                              key={`${dateStr}-${time}`}
                              onClick={() => !isPast && !isBooked && handleTimeClick(time, dateStr)}
                              disabled={isPast || isBooked}
                              className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 min-h-[40px] ${
                                isBooked
                                  ? 'bg-red-900/50 text-red-300 cursor-not-allowed'
                                  : isPast
                                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                                  : isToday
                                  ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-600/30'
                                  : 'bg-gray-700/50 text-gray-300 hover:bg-green-600 hover:text-white'
                              }`}
                            >
                              {isBooked ? 'Réservé' : isPast ? 'Passé' : 'Libre'}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-700/50 rounded"></div>
                  <span className="text-gray-300">Libre</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span className="text-gray-300">Survol</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-900/50 rounded"></div>
                  <span className="text-gray-300">Réservé</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-800/50 rounded"></div>
                  <span className="text-gray-300">Passé</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-900/30 border border-blue-600/30 rounded"></div>
                  <span className="text-gray-300">Aujourd'hui</span>
                </div>
              </div>
            </div>

            {/* Form Section */}
            {showForm && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-white flex items-center">
                    <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Réservation - {selectedTime}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setSelectedTime('');
                      setFormData(prev => ({ ...prev, times: [] }));
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
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
                    <span className="text-sm font-medium">Créneau sélectionné</span>
                  </div>
                  <p className="text-white font-semibold mb-2">
                    {new Date(selectedDate).toLocaleDateString('fr-FR')} à {selectedTime}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
                        Service souhaité *
                      </label>
                      <select
                        id="service"
                        name="service"
                        required
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="" className="bg-gray-700">Choisir un service</option>
                        <option value="enregistrement" className="bg-gray-700">Enregistrement</option>
                        <option value="mixage" className="bg-gray-700">Mixage</option>
                        <option value="mastering" className="bg-gray-700">Mastering</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
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
                          value={formData.name}
                          onChange={handleChange}
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
                          value={formData.email}
                          onChange={handleChange}
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
                        value={formData.phone}
                        onChange={handleChange}
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
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Informations supplémentaires, demandes spéciales..."
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirmer la réservation
                    </span>
                  </button>
                </form>
              </div>
            )}

            {/* Placeholder when no form is shown */}
            {!showForm && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Sélectionnez un créneau</h3>
                  <p className="text-gray-500">Cliquez sur un horaire disponible dans le calendrier pour ouvrir le formulaire de réservation</p>
                </div>
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
}

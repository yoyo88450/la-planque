'use client';

import { useState, useEffect } from 'react';
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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [existingReservations, setExistingReservations] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const addBooking = useBookingStore((state) => state.addBooking);
  const getBookingsByDate = useBookingStore((state) => state.getBookingsByDate);

  // Fetch existing reservations on component mount and when form is submitted
  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        // Transformer les données pour correspondre au format attendu
        const transformedData = data.map((appointment: any) => ({
          date: appointment.start.split('T')[0],
          time: new Date(appointment.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }));
        setExistingReservations(transformedData);
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Créer les rendez-vous via l'API
      const appointments = formData.times.map(time => ({
        date: formData.date,
        time: time,
        service: formData.service,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        guests: 1,
        message: formData.message
      }));

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointments }),
      });

      if (response.ok) {
        // Rafraîchir les réservations depuis la base de données
        await fetchReservations();

        // Ajouter aussi au store local pour l'affichage immédiat
        formData.times.forEach(time => {
          addBooking({
            date: formData.date,
            time: time,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            guests: 1,
            message: formData.message
          });
        });

        setShowConfirmationModal(true);
      } else {
        console.error('Erreur lors de la création des rendez-vous');
        alert('Erreur lors de la réservation. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la réservation. Veuillez réessayer.');
    }
  };

  const handleConfirmReservation = () => {
    setShowConfirmationModal(false);
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  // Generate calendar dates for current month
  const generateCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get the day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();

    // Generate all dates for the calendar grid
    const dates = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      dates.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      dates.push(new Date(year, month, day));
    }

    return dates;
  };

  const calendarDates = generateCalendarDates();
  const bookedSlots = selectedDate ? getBookingsByDate(selectedDate) : [];
  const existingBookedSlots = selectedDate ? existingReservations.filter((res: any) => res.date === selectedDate) : [];

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Check if date is in the past
  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-center text-white mb-4">Réserver votre session</h1>
          <p className="text-center text-gray-300 mb-12 text-lg">Choisissez votre date et service pour une session d'enregistrement professionnelle</p>

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calendar Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Sélectionnez une date
              </h2>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <h3 className="text-xl font-semibold text-white">
                  {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h3>

                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                  <div key={day} className="text-center text-gray-400 font-medium text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDates.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="aspect-square"></div>;
                  }

                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const dayBookings = getBookingsByDate(dateStr);
                  const isFullyBooked = dayBookings.length >= 6;
                  const isPast = isDateInPast(date);

                  return (
                    <button
                      key={index}
                      onClick={() => !isPast && !isFullyBooked && setSelectedDate(dateStr)}
                      className={`aspect-square rounded-xl text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : isFullyBooked
                          ? 'bg-red-900/50 text-red-300 cursor-not-allowed line-through'
                          : isPast
                          ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:scale-105'
                      }`}
                      disabled={isPast || isFullyBooked}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="mt-6 p-4 bg-gray-700/50 rounded-xl">
                  <h3 className="text-white font-semibold mb-3">Sélectionnez vos créneaux - {new Date(selectedDate).toLocaleDateString('fr-FR')}</h3>
                  <p className="text-gray-400 text-sm mb-4">Vous pouvez sélectionner plusieurs créneaux pour la même journée</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(time => {
                      const isBooked = bookedSlots.some(booking => booking.time === time) || existingBookedSlots.some((booking: any) => booking.time === time);
                      const isSelected = formData.date === selectedDate && formData.times.includes(time);
                      return (
                        <button
                          key={time}
                          onClick={() => {
                            if (isBooked) return;
                            setFormData(prev => {
                              const newTimes = isSelected
                                ? prev.times.filter(t => t !== time)
                                : [...prev.times, time];
                              return {
                                ...prev,
                                date: selectedDate,
                                times: newTimes
                              };
                            });
                          }}
                          disabled={isBooked}
                          className={`p-3 rounded-lg text-sm font-medium text-center transition-all duration-200 relative ${
                            isBooked
                              ? 'bg-red-900/50 text-red-300 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-600 text-white shadow-lg scale-105'
                              : 'bg-green-900/50 text-green-300 hover:bg-green-800/50 hover:scale-105'
                          }`}
                        >
                          {time}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {formData.times.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                      <p className="text-blue-300 text-sm font-medium">
                        {formData.times.length} créneau{formData.times.length > 1 ? 'x' : ''} sélectionné{formData.times.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Informations de réservation
              </h2>

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

                  {/* Selected Date/Times Display */}
                  {(formData.date && formData.times.length > 0) && (
                    <div className="p-4 bg-blue-900/30 border border-blue-600/50 rounded-xl">
                      <div className="flex items-center space-x-2 text-blue-300 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">
                          {formData.times.length === 1 ? 'Créneau sélectionné' : `${formData.times.length} créneaux sélectionnés`}
                        </span>
                      </div>
                      <p className="text-white font-semibold mb-2">
                        {new Date(formData.date).toLocaleDateString('fr-FR')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.times.map(time => (
                          <span key={time} className="px-3 py-1 bg-blue-600/50 text-blue-200 rounded-lg text-sm">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                  disabled={!formData.date || formData.times.length === 0 || !formData.service}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirmer {formData.times.length > 1 ? `les ${formData.times.length} réservations` : 'la réservation'}
                  </span>
                </button>
              </form>
            </div>
          </div>


        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Réservation confirmée !</h3>
              <p className="text-gray-600 mb-6">
                Votre réservation a été enregistrée avec succès. Nous vous contacterons bientôt pour confirmer les détails.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Service:</strong> {formData.service}</p>
                  <p><strong>Date:</strong> {new Date(formData.date).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Créneaux:</strong> {formData.times.join(', ')}</p>
                  <p><strong>Nom:</strong> {formData.name}</p>
                </div>
              </div>
              <button
                onClick={handleConfirmReservation}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Parfait !
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

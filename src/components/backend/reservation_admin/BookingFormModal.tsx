import { useState } from 'react';

interface BookingFormModalProps {
  showBookingForm: boolean;
  setShowBookingForm: (show: boolean) => void;
  selectedTimes: string[];
  bookingFormData: {
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
  };
  setBookingFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
  }>>;
  handleBookingSubmit: (e: React.FormEvent) => void;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function BookingFormModal({
  showBookingForm,
  setShowBookingForm,
  selectedTimes,
  bookingFormData,
  setBookingFormData,
  handleBookingSubmit,
  handleFormChange
}: BookingFormModalProps) {
  if (!showBookingForm) return null;

  return (
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
  );
}

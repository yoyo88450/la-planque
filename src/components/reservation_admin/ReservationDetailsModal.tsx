import { Reservation } from './types';

interface ReservationDetailsModalProps {
  showReservationDetails: boolean;
  setShowReservationDetails: (show: boolean) => void;
  selectedReservation: Reservation | null;
  handleEditReservation: (reservation: Reservation) => void;
  handleDeleteReservation: (reservation: Reservation) => void;
}

export default function ReservationDetailsModal({
  showReservationDetails,
  setShowReservationDetails,
  selectedReservation,
  handleEditReservation,
  handleDeleteReservation
}: ReservationDetailsModalProps) {
  if (!showReservationDetails || !selectedReservation) return null;

  return (
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
  );
}

interface ConfirmationModalProps {
  showConfirmationModal: boolean;
  setShowConfirmationModal: (show: boolean) => void;
  formData: any;
  handleConfirmReservation: () => void;
}

export default function ConfirmationModal({ showConfirmationModal, setShowConfirmationModal, formData, handleConfirmReservation }: ConfirmationModalProps) {
  if (!showConfirmationModal) return null;

  return (
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
  );
}

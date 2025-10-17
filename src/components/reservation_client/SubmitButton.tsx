interface SubmitButtonProps {
  formData: any;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SubmitButton({ formData, onSubmit }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      onClick={onSubmit}
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
  );
}

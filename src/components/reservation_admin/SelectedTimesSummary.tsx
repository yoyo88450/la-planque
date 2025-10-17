interface SelectedTimesSummaryProps {
  selectedTimes: string[];
  setShowBookingForm: (show: boolean) => void;
}

export default function SelectedTimesSummary({
  selectedTimes,
  setShowBookingForm
}: SelectedTimesSummaryProps) {
  if (selectedTimes.length === 0) return null;

  return (
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
            onClick={() => {}}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm"
          >
            Désélectionner
          </button>
        </div>
      </div>
    </div>
  );
}

interface CalendarHeaderProps {
  weekDates: Date[];
  currentWeek: Date;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  fetchAppointments: () => void;
  loading: boolean;
}

export default function CalendarHeader({
  weekDates,
  currentWeek,
  goToPreviousWeek,
  goToNextWeek,
  fetchAppointments,
  loading
}: CalendarHeaderProps) {
  return (
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
  );
}

interface WeekNavigatorProps {
  currentWeek: Date;
  setCurrentWeek: (date: Date) => void;
  setSelectedTimes: (times: string[]) => void;
}

export default function WeekNavigator({
  currentWeek,
  setCurrentWeek,
  setSelectedTimes
}: WeekNavigatorProps) {
  return (
    <div className="flex items-center space-x-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 shadow-lg">
      <label htmlFor="week-navigator" className="text-sm font-medium text-gray-300 whitespace-nowrap">
        Naviguer vers une semaine :
      </label>
      <input
        id="week-navigator"
        type="date"
        value={currentWeek.toISOString().split('T')[0]}
        onChange={(e) => {
          const selectedDate = new Date(e.target.value);
          if (!isNaN(selectedDate.getTime())) {
            setCurrentWeek(selectedDate);
            setSelectedTimes([]);
          }
        }}
        className="px-4 py-2 bg-gray-700/70 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-gray-600/70 transition-all duration-200 min-w-[140px]"
        title="Sélectionner une date pour naviguer vers cette semaine"
      />
    </div>
  );
}

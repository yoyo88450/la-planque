import { Reservation } from './types';

interface CalendarGridProps {
  weekDates: Date[];
  timeSlots: string[];
  reservations: Reservation[];
  selectedTimes: string[];
  handleTimeClick: (dateStr: string, time: string) => void;
  isTimeSelected: (dateStr: string, time: string) => boolean;
  isDateInPast: (date: Date) => boolean;
  isTimeSlotInPast: (dateStr: string, time: string) => boolean;
  viewMode: 'week' | 'month' | 'day';
  currentDay: Date;
}

export default function CalendarGrid({
  weekDates,
  timeSlots,
  reservations,
  selectedTimes,
  handleTimeClick,
  isTimeSelected,
  isDateInPast,
  isTimeSlotInPast,
  viewMode,
  currentDay
}: CalendarGridProps) {
  // Filter dates based on view mode
  const displayDates = viewMode === 'day' ? [currentDay] : weekDates;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Header with days */}
      <div className={`grid gap-1 p-4 border-b border-gray-700 ${viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'}`}>
        {displayDates.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const isPast = isDateInPast(date);
          return (
            <div
              key={index}
              className={`text-center text-sm font-medium py-2 px-1 ${
                isToday
                  ? 'text-blue-400 bg-blue-900/20 rounded-lg border border-blue-600/30'
                  : isPast
                  ? 'text-gray-500'
                  : 'text-gray-300'
              }`}
            >
              <div className="font-semibold">
                {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
              </div>
              <div className="text-xs mt-1">
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time slots grid */}
      <div>
        {timeSlots.map((time, timeIndex) => (
          <div key={time}>
            {/* Time slot row */}
            <div className={`grid gap-1 p-1 ml-12 ${viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'}`}>
              {displayDates.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const reservation = reservations.find(r => r.date === dateStr && r.time === time);
                const isSelected = isTimeSelected(dateStr, time);
                const isPast = isDateInPast(date) || isTimeSlotInPast(dateStr, time);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={`${dateStr}|${time}`}
                    onClick={() => handleTimeClick(dateStr, time)}
                    disabled={isPast}
                    className={`p-1 rounded-md text-xs font-medium transition-all duration-200 min-h-[50px] md:min-h-[70px] transform hover:scale-[1.02] ${
                      reservation
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white cursor-pointer hover:from-blue-700 hover:to-blue-800 shadow-lg'
                        : isSelected
                        ? 'bg-gradient-to-br from-green-600 to-green-700 text-white cursor-pointer hover:from-green-700 hover:to-green-800 shadow-lg'
                        : isPast
                        ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                        : isToday
                        ? 'bg-gradient-to-br from-gray-700/50 to-gray-600/50 text-gray-300 hover:from-gray-600 hover:to-gray-700 border border-blue-600/30 shadow-md'
                        : 'bg-gradient-to-br from-gray-700/50 to-gray-600/50 text-gray-300 hover:from-gray-600 hover:to-gray-700 shadow-md'
                    }`}
                  >
                    {reservation ? (
                      <div className="h-full flex flex-col justify-center text-center">
                        <div className="font-semibold truncate text-xs">{reservation.name}</div>
                        <div className="text-xs opacity-90 truncate">{reservation.service}</div>
                        <div className="text-xs opacity-75 mt-1 truncate">{reservation.email}</div>
                      </div>
                    ) : isSelected ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="font-semibold text-xs">Sélectionné</div>
                          <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center">
                        <span className="text-xs">{isPast ? 'Passé' : 'Libre'}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Separator line with time label */}
            {timeIndex < timeSlots.length - 1 && (
              <div className="relative flex items-center py-1">
                <div className="text-gray-400 font-medium text-sm mr-2 ml-2">
                  {timeSlots[timeIndex + 1].replace(':00', 'h')}
                </div>
                <div className="flex-1 border-b border-gray-700/50"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

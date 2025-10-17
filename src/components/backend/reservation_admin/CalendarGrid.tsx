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
}

export default function CalendarGrid({
  weekDates,
  timeSlots,
  reservations,
  selectedTimes,
  handleTimeClick,
  isTimeSelected,
  isDateInPast,
  isTimeSlotInPast
}: CalendarGridProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-8 gap-1 p-4 border-b border-gray-700">
        <div className="text-center text-gray-400 font-medium text-sm py-2">Heure</div>
        {weekDates.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const isPast = isDateInPast(date);
          return (
            <div
              key={index}
              className={`text-center text-sm font-medium py-2 ${
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
      <div className="max-h-[60vh] md:max-h-[600px] overflow-y-auto">
        {timeSlots.map((time) => (
          <div key={time} className="grid grid-cols-8 gap-1 p-1">
            <div className="p-2 text-center text-gray-400 font-medium text-sm bg-gray-700/30 rounded-lg flex items-center justify-center">
              {time}
            </div>
            {weekDates.map((date) => {
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
                  className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 min-h-[60px] md:min-h-[80px] ${
                    reservation
                      ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                      : isSelected
                      ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700'
                      : isPast
                      ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                      : isToday
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 border border-blue-600/30'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {reservation ? (
                    <div className="h-full flex flex-col justify-center text-center">
                      <div className="font-semibold truncate">{reservation.name}</div>
                      <div className="text-xs opacity-90">{reservation.service}</div>
                      <div className="text-xs opacity-75 mt-1">{reservation.email}</div>
                    </div>
                  ) : isSelected ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-semibold">Sélectionné</div>
                        <div className="w-4 h-4 bg-white rounded-full mx-auto mt-1"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center">
                      {isPast ? 'Passé' : 'Libre'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

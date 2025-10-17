import { useState } from 'react';
import { useBookingStore } from '../../lib/stores';

interface CalendarSectionProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  formData: any;
  setFormData: (data: any) => void;
  existingReservations: any[];
}

export default function CalendarSection({ selectedDate, setSelectedDate, formData, setFormData, existingReservations }: CalendarSectionProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const getBookingsByDate = useBookingStore((state) => state.getBookingsByDate);

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
  );
}

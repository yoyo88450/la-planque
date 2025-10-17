import { useState, useMemo, useCallback } from 'react';
import { useBookingStore } from '../../lib/stores';

interface CalendarSectionProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  formData: {
    duration: number;
    times: Record<number, string[]>;
    date?: string;
  };
  setFormData: (data: (prev: any) => any) => void;
  existingReservations: Array<{
    date: string;
    time: string;
  }>;
}

export default function CalendarSection({ selectedDate, setSelectedDate, formData, setFormData, existingReservations }: CalendarSectionProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const getBookingsByDate = useBookingStore((state) => state.getBookingsByDate);

  // Memoized calendar dates generation
  const calendarDates = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();

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
  }, [currentMonth]);

  // Memoized booked slots
  const bookedSlots = useMemo(() =>
    selectedDate ? getBookingsByDate(selectedDate) : [],
    [selectedDate, getBookingsByDate]
  );

  const existingBookedSlots = useMemo(() =>
    selectedDate ? existingReservations.filter(res => res.date === selectedDate) : [],
    [selectedDate, existingReservations]
  );

  // Navigation functions
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  // Check if date is in the past
  const isDateInPast = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }, []);

  // Helper function to check if a time slot is available for a given duration
  const isTimeSlotAvailable = useCallback((time: string, duration: number): boolean => {
    const startHour = parseInt(time.split(':')[0]);
    const endHour = startHour + duration;

    // Check operating hours
    if (endHour > 22) return false;

    // Check consecutive slots availability
    for (let i = 0; i < duration; i++) {
      const checkTime = new Date(`2000-01-01T${time}`);
      checkTime.setHours(checkTime.getHours() + i);
      const checkTimeStr = checkTime.toTimeString().slice(0, 5);

      if (bookedSlots.some(booking => booking.time === checkTimeStr) ||
          existingBookedSlots.some(booking => booking.time === checkTimeStr)) {
        return false;
      }
    }

    return true;
  }, [bookedSlots, existingBookedSlots]);

  // Helper function to get blocked hours from selected slots for all durations
  const getBlockedHours = useCallback((timesRecord: Record<number, string[]>, excludeTime?: string): Set<number> => {
    const blockedHours = new Set<number>();
    for (const [durationStr, times] of Object.entries(timesRecord)) {
      const duration = parseInt(durationStr);
      for (const selectedTime of times) {
        if (selectedTime !== excludeTime) {
          const selectedStartHour = parseInt(selectedTime.split(':')[0]);
          for (let h = 0; h < duration; h++) {
            blockedHours.add(selectedStartHour + h);
          }
        }
      }
    }
    return blockedHours;
  }, []);

  // Optimized duration change handler
  const handleDurationChange = useCallback((newDuration: number) => {
    setFormData(prev => ({
      ...prev,
      duration: newDuration,
      times: {} // Clear all selections when changing duration
    }));
  }, [setFormData]);

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
          <p className="text-gray-400 text-sm mb-4">Sélectionnez d'abord la durée, puis plusieurs créneaux horaires disponibles</p>

          {/* Time Slot Options */}
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <p className="text-blue-300 text-sm font-medium mb-2">Durée de session :</p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 8].map(duration => (
                <button
                  key={duration}
                  onClick={() => handleDurationChange(duration)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    formData.duration === duration
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600/50 text-gray-300 hover:bg-gray-500/50'
                  }`}
                >
                  {duration}h
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 22 - 9 - (formData.duration || 1) + 1 }, (_, i) => {
              const hour = 9 + i;
              return `${hour.toString().padStart(2, '0')}:00`;
            }).map(time => {
              const isBooked = bookedSlots.some(booking => booking.time === time) || existingBookedSlots.some((booking: any) => booking.time === time);
              const currentDurationTimes = formData.times[formData.duration] || [];
              const isSelected = formData.date === selectedDate && currentDurationTimes.includes(time);
              const duration = formData.duration || 1;
              const endTime = new Date(`2000-01-01T${time}`);
              endTime.setHours(endTime.getHours() + duration);
              const endTimeStr = endTime.toTimeString().slice(0, 5);

              // Check if the slot fits within operating hours (8h-22h)
              const startHour = parseInt(time.split(':')[0]);
              const endHour = startHour + duration;
              const withinOperatingHours = endHour <= 22;

              // Check if the slot is available for the selected duration
              let isAvailable = withinOperatingHours;
              if (duration > 1 && withinOperatingHours) {
                for (let i = 1; i < duration; i++) {
                  const nextTime = new Date(`2000-01-01T${time}`);
                  nextTime.setHours(nextTime.getHours() + i);
                  const nextTimeStr = nextTime.toTimeString().slice(0, 5);
                  if (bookedSlots.some(booking => booking.time === nextTimeStr) || existingBookedSlots.some((booking: any) => booking.time === nextTimeStr)) {
                    isAvailable = false;
                    break;
                  }
                }
              }

              // Check if this slot conflicts with other selected slots
              let conflictsWithSelected = false;
              if (!isSelected) {
                const blockedHours = getBlockedHours(formData.times, time);
                for (let h = 0; h < duration; h++) {
                  if (blockedHours.has(startHour + h)) {
                    conflictsWithSelected = true;
                    break;
                  }
                }
              }

              isAvailable = isAvailable && !conflictsWithSelected;

              return (
                <button
                  key={time}
                  onClick={() => {
                    if (isBooked || !isAvailable) return;
                    setFormData(prev => {
                      const newTimesRecord = { ...prev.times };
                      const currentTimes = newTimesRecord[prev.duration] || [];
                      const newTimes = isSelected
                        ? currentTimes.filter((t: string) => t !== time)
                        : [...currentTimes, time]; // Allow multiple time slots
                      newTimesRecord[prev.duration] = newTimes;
                      return {
                        ...prev,
                        date: selectedDate,
                        times: newTimesRecord
                      };
                    });
                  }}
                  disabled={isBooked || !isAvailable}
                  className={`p-3 rounded-lg text-sm font-medium text-center transition-all duration-200 relative ${
                    isBooked || !isAvailable
                      ? 'bg-red-900/50 text-red-300 line-through cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : conflictsWithSelected
                      ? 'bg-orange-900/50 text-orange-300 hover:bg-orange-800/50'
                      : 'bg-green-900/50 text-green-300 hover:bg-green-800/50 hover:scale-105'
                  }`}
                >
                  <div>{time}</div>
                  {duration > 1 && <div className="text-xs opacity-75">à {endTimeStr}</div>}
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

          {(formData.times[formData.duration] || []).length > 0 && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <p className="text-blue-300 text-sm font-medium">
                {(formData.times[formData.duration] || []).length} créneau{(formData.times[formData.duration] || []).length > 1 ? 'x' : ''} pour {formData.duration}h
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

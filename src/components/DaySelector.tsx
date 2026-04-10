"use client";

import { format, addDays, subDays } from "date-fns";
import { fr } from "date-fns/locale";

interface DaySelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DaySelector({
  selectedDate,
  onDateChange,
}: DaySelectorProps) {
  const date = new Date(selectedDate + "T12:00:00");

  const goToPrev = () => {
    onDateChange(format(subDays(date, 1), "yyyy-MM-dd"));
  };

  const goToNext = () => {
    onDateChange(format(addDays(date, 1), "yyyy-MM-dd"));
  };

  const goToToday = () => {
    onDateChange(format(new Date(), "yyyy-MM-dd"));
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={goToPrev}
        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
      >
        &larr;
      </button>

      <div className="text-center">
        <h2 className="text-xl font-bold capitalize">
          {format(date, "EEEE d MMMM yyyy", { locale: fr })}
        </h2>
      </div>

      <button
        onClick={goToNext}
        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
      >
        &rarr;
      </button>

      <button
        onClick={goToToday}
        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
      >
        Aujourd&apos;hui
      </button>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="px-3 py-2 border rounded-lg"
      />
    </div>
  );
}

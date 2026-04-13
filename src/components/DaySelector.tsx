"use client";

import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import type { ViewMode } from "./ViewSwitcher";

interface DaySelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  viewMode: ViewMode;
}

export default function DaySelector({
  selectedDate,
  onDateChange,
  viewMode,
}: DaySelectorProps) {
  const date = new Date(selectedDate + "T12:00:00");

  const goToPrev = () => {
    if (viewMode === "day") {
      onDateChange(format(subDays(date, 1), "yyyy-MM-dd"));
    } else if (viewMode === "week") {
      onDateChange(format(subWeeks(date, 1), "yyyy-MM-dd"));
    } else {
      onDateChange(format(subMonths(date, 1), "yyyy-MM-dd"));
    }
  };

  const goToNext = () => {
    if (viewMode === "day") {
      onDateChange(format(addDays(date, 1), "yyyy-MM-dd"));
    } else if (viewMode === "week") {
      onDateChange(format(addWeeks(date, 1), "yyyy-MM-dd"));
    } else {
      onDateChange(format(addMonths(date, 1), "yyyy-MM-dd"));
    }
  };

  const goToToday = () => {
    onDateChange(format(new Date(), "yyyy-MM-dd"));
  };

  const getLabel = () => {
    if (viewMode === "day") {
      return format(date, "EEEE d MMMM yyyy", { locale: fr });
    } else if (viewMode === "week") {
      const ws = startOfWeek(date, { weekStartsOn: 1 });
      const we = endOfWeek(date, { weekStartsOn: 1 });
      return `${format(ws, "d MMM", { locale: fr })} - ${format(we, "d MMM yyyy", { locale: fr })}`;
    } else {
      return format(date, "MMMM yyyy", { locale: fr });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={goToPrev}
        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
      >
        &larr;
      </button>

      <div className="text-center min-w-[220px]">
        <h2 className="text-xl font-bold capitalize">{getLabel()}</h2>
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

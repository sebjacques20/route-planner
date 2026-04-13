"use client";

import { useState, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { fr } from "date-fns/locale";

interface Appointment {
  id: string;
  clientName: string;
  date: string;
  period: string;
  routeOrder: number | null;
}

interface MonthViewProps {
  selectedDate: string;
  onDayClick: (date: string) => void;
}

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function MonthView({ selectedDate, onDayClick }: MonthViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const baseDate = new Date(selectedDate + "T12:00:00");
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  useEffect(() => {
    const fetchMonth = async () => {
      setLoading(true);
      try {
        const from = format(calendarStart, "yyyy-MM-dd");
        const to = format(calendarEnd, "yyyy-MM-dd");
        const res = await fetch(`/api/appointments?from=${from}&to=${to}`);
        const data = await res.json();
        setAppointments(data.appointments ?? []);
      } catch (error) {
        console.error("Failed to fetch month:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const getAppointmentsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return appointments.filter((a) => a.date === dateStr);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Chargement du mois...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      {/* Month header */}
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h3 className="text-lg font-bold text-gray-900 capitalize">
          {format(baseDate, "MMMM yyyy", { locale: fr })}
        </h3>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center py-2 text-xs font-semibold text-gray-500 uppercase"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayAppts = getAppointmentsForDay(day);
          const amCount = dayAppts.filter((a) => a.period === "AM").length;
          const pmCount = dayAppts.filter((a) => a.period === "PM").length;
          const inMonth = isSameMonth(day, baseDate);
          const selected = isSameDay(day, baseDate);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(format(day, "yyyy-MM-dd"))}
              className={`min-h-[90px] p-1.5 border-b border-r cursor-pointer transition hover:bg-gray-50 ${
                !inMonth ? "bg-gray-50/50" : ""
              } ${selected ? "bg-blue-50" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday(day)
                      ? "bg-blue-600 text-white"
                      : inMonth
                      ? "text-gray-900"
                      : "text-gray-300"
                  }`}
                >
                  {format(day, "d")}
                </span>

                {dayAppts.length > 0 && (
                  <span className="text-[10px] text-gray-400 font-medium">
                    {dayAppts.length} RDV
                  </span>
                )}
              </div>

              {dayAppts.length > 0 && (
                <div className="space-y-0.5">
                  {amCount > 0 && (
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="text-blue-700 font-medium">
                        {amCount} AM
                      </span>
                    </div>
                  )}
                  {pmCount > 0 && (
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      <span className="text-amber-700 font-medium">
                        {pmCount} PM
                      </span>
                    </div>
                  )}

                  {/* Show first 2 names */}
                  {dayAppts.slice(0, 2).map((apt) => (
                    <div
                      key={apt.id}
                      className={`text-[10px] rounded px-1 py-0.5 truncate ${
                        apt.period === "AM"
                          ? "bg-blue-50 text-blue-800"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {apt.clientName}
                    </div>
                  ))}
                  {dayAppts.length > 2 && (
                    <div className="text-[10px] text-gray-400 pl-1">
                      +{dayAppts.length - 2} autres
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

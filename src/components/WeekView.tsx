"use client";

import { useState, useEffect } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isSameDay,
} from "date-fns";
import { fr } from "date-fns/locale";

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  period: string;
  routeOrder: number | null;
  status: string;
}

interface WeekViewProps {
  selectedDate: string;
  onDayClick: (date: string) => void;
}

export default function WeekView({ selectedDate, onDayClick }: WeekViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const baseDate = new Date(selectedDate + "T12:00:00");
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    const fetchWeek = async () => {
      setLoading(true);
      try {
        const from = format(weekStart, "yyyy-MM-dd");
        const to = format(weekEnd, "yyyy-MM-dd");
        const res = await fetch(`/api/appointments?from=${from}&to=${to}`);
        const data = await res.json();
        setAppointments(data.appointments ?? []);
      } catch (error) {
        console.error("Failed to fetch week:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const getAppointmentsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return appointments.filter((a) => a.date === dateStr);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Chargement de la semaine...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dayAppts = getAppointmentsForDay(day);
        const amAppts = dayAppts.filter((a) => a.period === "AM");
        const pmAppts = dayAppts.filter((a) => a.period === "PM");
        const selected = isSameDay(day, baseDate);

        return (
          <div
            key={day.toISOString()}
            onClick={() => onDayClick(format(day, "yyyy-MM-dd"))}
            className={`bg-white rounded-xl shadow p-3 cursor-pointer transition hover:shadow-md min-h-[200px] ${
              selected ? "ring-2 ring-blue-500" : ""
            } ${isToday(day) ? "border-2 border-blue-300" : ""}`}
          >
            {/* Day header */}
            <div className="text-center mb-2">
              <p className="text-xs text-gray-400 uppercase">
                {format(day, "EEE", { locale: fr })}
              </p>
              <p
                className={`text-lg font-bold ${
                  isToday(day) ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {format(day, "d")}
              </p>
            </div>

            {dayAppts.length === 0 ? (
              <p className="text-xs text-gray-300 text-center mt-4">-</p>
            ) : (
              <div className="space-y-1">
                {/* AM section */}
                {amAppts.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-blue-600 mb-0.5">
                      AM ({amAppts.length})
                    </div>
                    {amAppts.map((apt) => (
                      <div
                        key={apt.id}
                        className="text-[11px] bg-blue-50 rounded px-1.5 py-0.5 mb-0.5 truncate"
                        title={`${apt.clientName} - ${apt.address}`}
                      >
                        <span className="font-medium">{apt.routeOrder}.</span>{" "}
                        {apt.clientName}
                      </div>
                    ))}
                  </div>
                )}

                {/* PM section */}
                {pmAppts.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-amber-600 mb-0.5">
                      PM ({pmAppts.length})
                    </div>
                    {pmAppts.map((apt) => (
                      <div
                        key={apt.id}
                        className="text-[11px] bg-amber-50 rounded px-1.5 py-0.5 mb-0.5 truncate"
                        title={`${apt.clientName} - ${apt.address}`}
                      >
                        <span className="font-medium">{apt.routeOrder}.</span>{" "}
                        {apt.clientName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

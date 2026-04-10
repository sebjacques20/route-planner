"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import DaySelector from "../components/DaySelector";
import AppointmentList from "../components/AppointmentList";
import RouteMap from "../components/RouteMap";

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

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [amAppointments, setAmAppointments] = useState<Appointment[]>([]);
  const [pmAppointments, setPmAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    am?: { totalDuration: string; totalDistance: string };
    pm?: { totalDuration: string; totalDistance: string };
  }>({});

  const originLat = parseFloat(
    process.env.NEXT_PUBLIC_ORIGIN_LAT ?? "45.5017"
  );
  const originLng = parseFloat(
    process.env.NEXT_PUBLIC_ORIGIN_LNG ?? "-73.5673"
  );

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?date=${selectedDate}`);
      const data = await res.json();
      setAmAppointments(data.am ?? []);
      setPmAppointments(data.pm ?? []);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/calendly/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate }),
      });
      const data = await res.json();
      if (data.error) {
        alert(`Erreur de synchronisation: ${data.error}`);
      } else {
        alert(`${data.synced} rendez-vous synchronisés`);
        await fetchAppointments();
      }
    } catch (error) {
      console.error("Sync failed:", error);
      alert("La synchronisation a échoué");
    } finally {
      setSyncing(false);
    }
  };

  const handleOptimize = async (period: "AM" | "PM") => {
    setOptimizing(true);
    try {
      const res = await fetch("/api/routes/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          period,
          originLat,
          originLng,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(`Erreur d'optimisation: ${data.error}`);
      } else if (data.route) {
        setRouteInfo((prev) => ({
          ...prev,
          [period.toLowerCase()]: {
            totalDuration: data.route.totalDuration,
            totalDistance: data.route.totalDistance,
          },
        }));
        await fetchAppointments();
      }
    } catch (error) {
      console.error("Optimize failed:", error);
      alert("L'optimisation a échoué");
    } finally {
      setOptimizing(false);
    }
  };

  const allAppointments = [...amAppointments, ...pmAppointments];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Route Planner
          </h1>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            {syncing ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Synchronisation...
              </>
            ) : (
              "Synchroniser Calendly"
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Date Selector */}
        <div className="bg-white rounded-xl shadow p-4 flex items-center justify-center">
          <DaySelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Chargement des rendez-vous...
          </div>
        ) : (
          <>
            {/* Optimize Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => handleOptimize("AM")}
                disabled={optimizing || amAppointments.length === 0}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {optimizing
                  ? "Optimisation..."
                  : `Optimiser AM (${amAppointments.length} RDV)`}
              </button>
              <button
                onClick={() => handleOptimize("PM")}
                disabled={optimizing || pmAppointments.length === 0}
                className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition"
              >
                {optimizing
                  ? "Optimisation..."
                  : `Optimiser PM (${pmAppointments.length} RDV)`}
              </button>
            </div>

            {/* Route Info */}
            {(routeInfo.am || routeInfo.pm) && (
              <div className="flex gap-4">
                {routeInfo.am && (
                  <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <strong>AM:</strong> {routeInfo.am.totalDistance} -{" "}
                    {routeInfo.am.totalDuration}
                  </div>
                )}
                {routeInfo.pm && (
                  <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                    <strong>PM:</strong> {routeInfo.pm.totalDistance} -{" "}
                    {routeInfo.pm.totalDuration}
                  </div>
                )}
              </div>
            )}

            {/* Map */}
            {allAppointments.some((a) => a.latitude && a.longitude) && (
              <RouteMap
                appointments={allAppointments}
                originLat={originLat}
                originLng={originLng}
              />
            )}

            {/* Appointment Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppointmentList
                title="Matin (AM)"
                appointments={amAppointments}
                color="#3b82f6"
              />
              <AppointmentList
                title="Après-midi (PM)"
                appointments={pmAppointments}
                color="#f59e0b"
              />
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading &&
          amAppointments.length === 0 &&
          pmAppointments.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500 text-lg mb-4">
                Aucun rendez-vous pour cette date
              </p>
              <p className="text-gray-400 text-sm">
                Cliquez sur &quot;Synchroniser Calendly&quot; pour importer les
                rendez-vous
              </p>
            </div>
          )}
      </main>
    </div>
  );
}

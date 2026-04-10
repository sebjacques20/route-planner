"use client";

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  address: string;
  period: string;
  routeOrder: number | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
}

interface AppointmentListProps {
  title: string;
  appointments: Appointment[];
  color: string;
}

export default function AppointmentList({
  title,
  appointments,
  color,
}: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        <h3
          className="text-lg font-bold mb-3 px-3 py-1 rounded-lg text-white inline-block"
          style={{ backgroundColor: color }}
        >
          {title}
        </h3>
        <p className="text-gray-400 italic">Aucun rendez-vous</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3
        className="text-lg font-bold mb-3 px-3 py-1 rounded-lg text-white inline-block"
        style={{ backgroundColor: color }}
      >
        {title} ({appointments.length})
      </h3>

      <div className="space-y-2">
        {appointments.map((apt, index) => (
          <div
            key={apt.id}
            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
          >
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: color }}
            >
              {apt.routeOrder ?? index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{apt.clientName}</p>
              <p className="text-sm text-gray-600 truncate">{apt.address}</p>
              <p className="text-xs text-gray-400">{apt.clientEmail}</p>
            </div>

            {apt.latitude && apt.longitude ? (
              <span className="text-green-500 text-xs flex-shrink-0">
                Localis&eacute;
              </span>
            ) : (
              <span className="text-red-500 text-xs flex-shrink-0">
                Non localis&eacute;
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

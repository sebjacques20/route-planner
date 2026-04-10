export interface CalendlyEvent {
  uri: string;
  name: string;
  start_time: string;
  end_time: string;
  invitees_counter: {
    total: number;
    active: number;
  };
  status: string;
}

export interface CalendlyInvitee {
  uri: string;
  name: string;
  email: string;
  questions_and_answers: {
    question: string;
    answer: string;
    position: number;
  }[];
}

export interface AppointmentInput {
  calendlyEventId: string;
  clientName: string;
  clientEmail: string;
  address: string;
  date: string; // YYYY-MM-DD
  period: "AM" | "PM";
}

export interface OptimizedRoute {
  period: "AM" | "PM";
  appointments: {
    id: string;
    clientName: string;
    address: string;
    routeOrder: number;
    latitude: number;
    longitude: number;
  }[];
  totalDuration: string;
  totalDistance: string;
}

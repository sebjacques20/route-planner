import type { CalendlyEvent, CalendlyInvitee, AppointmentInput } from "../types";

const CALENDLY_API_BASE = "https://api.calendly.com";

function getHeaders() {
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) throw new Error("CALENDLY_API_TOKEN is not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getCalendlyUser(): Promise<string> {
  const res = await fetch(`${CALENDLY_API_BASE}/users/me`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Calendly API error: ${res.status}`);
  const data = await res.json();
  return data.resource.uri;
}

export async function getScheduledEvents(
  userUri: string,
  minStartTime: string,
  maxStartTime: string
): Promise<CalendlyEvent[]> {
  const params = new URLSearchParams({
    user: userUri,
    min_start_time: minStartTime,
    max_start_time: maxStartTime,
    status: "active",
    count: "100",
  });

  const res = await fetch(
    `${CALENDLY_API_BASE}/scheduled_events?${params.toString()}`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error(`Calendly API error: ${res.status}`);
  const data = await res.json();
  return data.collection;
}

export async function getEventInvitees(
  eventUri: string
): Promise<CalendlyInvitee[]> {
  const eventUuid = eventUri.split("/").pop();
  const res = await fetch(
    `${CALENDLY_API_BASE}/scheduled_events/${eventUuid}/invitees`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error(`Calendly API error: ${res.status}`);
  const data = await res.json();
  return data.collection;
}

function extractAddress(invitee: CalendlyInvitee): string {
  const addressQuestion = invitee.questions_and_answers.find(
    (qa) =>
      qa.question.toLowerCase().includes("adresse") ||
      qa.question.toLowerCase().includes("address") ||
      qa.question.toLowerCase().includes("lieu")
  );
  return addressQuestion?.answer ?? "";
}

function determinePeriod(startTime: string): "AM" | "PM" {
  const hour = new Date(startTime).getHours();
  return hour < 12 ? "AM" : "PM";
}

export async function syncCalendlyEvents(
  date: string
): Promise<AppointmentInput[]> {
  const userUri = await getCalendlyUser();

  const minStart = `${date}T00:00:00Z`;
  const maxStart = `${date}T23:59:59Z`;

  const events = await getScheduledEvents(userUri, minStart, maxStart);
  const appointments: AppointmentInput[] = [];

  for (const event of events) {
    const invitees = await getEventInvitees(event.uri);

    for (const invitee of invitees) {
      const address = extractAddress(invitee);
      if (!address) continue;

      appointments.push({
        calendlyEventId: event.uri.split("/").pop()!,
        clientName: invitee.name,
        clientEmail: invitee.email,
        address,
        date,
        period: determinePeriod(event.start_time),
      });
    }
  }

  return appointments;
}

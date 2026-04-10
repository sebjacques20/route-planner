import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { syncCalendlyEvents } from "../../../../lib/calendly";
import { geocodeAddress } from "../../../../lib/google-maps";

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json();

    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    // Fetch appointments from Calendly
    const appointments = await syncCalendlyEvents(date);

    const results = [];

    for (const apt of appointments) {
      // Upsert appointment
      const existing = await prisma.appointment.findUnique({
        where: { calendlyEventId: apt.calendlyEventId },
      });

      if (existing) {
        results.push(existing);
        continue;
      }

      // Geocode address
      const coords = await geocodeAddress(apt.address);

      const created = await prisma.appointment.create({
        data: {
          calendlyEventId: apt.calendlyEventId,
          clientName: apt.clientName,
          clientEmail: apt.clientEmail,
          address: apt.address,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          date: apt.date,
          period: apt.period,
        },
      });

      results.push(created);
    }

    return NextResponse.json({
      synced: results.length,
      appointments: results,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}

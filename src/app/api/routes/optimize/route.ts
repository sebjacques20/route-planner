import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { optimizeRoute } from "../../../../lib/google-maps";

export async function POST(request: NextRequest) {
  try {
    const { date, period, originLat, originLng } = await request.json();

    if (!date || !period) {
      return NextResponse.json(
        { error: "date and period are required" },
        { status: 400 }
      );
    }

    // Default origin: can be configured (e.g., home/office address)
    const origin = {
      lat: originLat ?? parseFloat(process.env.ORIGIN_LAT ?? "45.5017"),
      lng: originLng ?? parseFloat(process.env.ORIGIN_LNG ?? "-73.5673"),
    };

    const appointments = await prisma.appointment.findMany({
      where: {
        date,
        period,
        status: { not: "cancelled" },
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    if (appointments.length === 0) {
      return NextResponse.json({
        message: "No appointments to optimize",
        route: null,
      });
    }

    const waypoints = appointments.map((apt) => ({
      id: apt.id,
      lat: apt.latitude!,
      lng: apt.longitude!,
    }));

    const result = await optimizeRoute(origin, waypoints);

    if (!result) {
      return NextResponse.json(
        { error: "Route optimization failed" },
        { status: 500 }
      );
    }

    // Update route order in DB
    for (let i = 0; i < result.orderedIds.length; i++) {
      await prisma.appointment.update({
        where: { id: result.orderedIds[i] },
        data: { routeOrder: i + 1 },
      });
    }

    // Fetch updated appointments
    const optimized = await prisma.appointment.findMany({
      where: { date, period, status: { not: "cancelled" } },
      orderBy: { routeOrder: "asc" },
    });

    return NextResponse.json({
      route: {
        period,
        totalDuration: result.totalDuration,
        totalDistance: result.totalDistance,
        appointments: optimized,
      },
    });
  } catch (error) {
    console.error("Optimize error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Optimization failed" },
      { status: 500 }
    );
  }
}

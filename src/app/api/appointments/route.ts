import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { date, status: { not: "cancelled" } },
    orderBy: [{ period: "asc" }, { routeOrder: "asc" }],
  });

  const am = appointments.filter((a) => a.period === "AM");
  const pm = appointments.filter((a) => a.period === "PM");

  return NextResponse.json({ am, pm });
}

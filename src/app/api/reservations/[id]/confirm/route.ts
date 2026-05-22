import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const reservation = await prisma.reservation.findUnique({
      where: {
        id,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    if (reservation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Reservation already processed" },
        { status: 400 }
      );
    }

    if (new Date() > reservation.expiresAt) {
      return NextResponse.json(
        { error: "Reservation expired" },
        { status: 410 }
      );
    }

    const updatedReservation =
      await prisma.reservation.update({
        where: {
          id,
        },
        data: {
          status: "CONFIRMED",
        },
      });

    return NextResponse.json(updatedReservation);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
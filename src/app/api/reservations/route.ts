import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { cleanupExpiredReservations } from "@/lib/cleanupExpiredReservations";

export async function POST(req: NextRequest) {

    await cleanupExpiredReservations();

  try {

    const body = await req.json()

    const {
      productId,
      warehouseId,
      quantity
    } = body

    const result = await prisma.$transaction(async (tx) => {

      // Find inventory
      const inventory = await tx.inventory.findFirst({
        where: {
          productId,
          warehouseId
        }
      })

      if (!inventory) {
        throw new Error("Inventory not found")
      }

      const availableStock =
        inventory.totalStock - inventory.reservedStock

      // Not enough stock
      if (availableStock < quantity) {

        return NextResponse.json(
          {
            error: "Not enough stock"
          },
          {
            status: 409
          }
        )
      }

      // Increase reserved stock
      await tx.inventory.update({
        where: {
          id: inventory.id
        },
        data: {
          reservedStock: {
            increment: quantity
          }
        }
      })

      // Create reservation
      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: "pending",

          expiresAt: new Date(
            Date.now() + 10 * 60 * 1000
          )
        }
      })

      return NextResponse.json(reservation)

    })

    return result

  } catch (error) {

    console.log(error)

    return NextResponse.json(
      {
        error: "Something went wrong"
      },
      {
        status: 500
      }
    )
  }
}
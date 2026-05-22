"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();

  const [reservation, setReservation] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetchReservation();
  }, []);

  useEffect(() => {
    if (!reservation) return;

    const interval = setInterval(() => {
      const remaining =
        new Date(reservation.expiresAt).getTime() -
        Date.now();

      setTimeLeft(
        Math.max(0, Math.floor(remaining / 1000))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  async function fetchReservation() {
    try {
      const res = await fetch(
        `/api/reservations/${params.id}`
      );

      const data = await res.json();

      setReservation(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function confirmReservation() {
    try {
      const res = await fetch(
        `/api/reservations/${params.id}/confirm`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      alert(data.status || data.error);

      fetchReservation();
    } catch (error) {
      console.error(error);
    }
  }

  async function cancelReservation() {
    try {
      const res = await fetch(
        `/api/reservations/${params.id}/release`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      alert(data.status || data.error);

      router.push("/");
    } catch (error) {
      console.error(error);
    }
  }

  if (!reservation) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Reservation Details
      </h1>

      <div className="border rounded-lg p-6">
        <p>
          <strong>Reservation ID:</strong>{" "}
          {reservation.id}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {reservation.status}
        </p>

        <p>
          <strong>Quantity:</strong>{" "}
          {reservation.quantity}
        </p>

        <p>
          <strong>Expires At:</strong>{" "}
          {reservation.expiresAt}
        </p>

        <p className="mt-4">
          <strong>Time Left:</strong>{" "}
          {timeLeft}s
        </p>

        <div className="flex gap-4 mt-6">
          <button
            onClick={confirmReservation}
            disabled={
              reservation.status !== "PENDING" ||
              timeLeft <= 0
            }
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            Confirm Purchase
          </button>

          <button
            onClick={cancelReservation}
            disabled={
              reservation.status !== "PENDING" ||
              timeLeft <= 0
            }
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}
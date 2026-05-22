"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProductItem {
  productId: string;
  warehouseId: string;
  productName: string;
  warehouseName: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();

      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function reserveProduct(
    productId: string,
    warehouseId: string
  ) {
    try {
      setLoading(true);

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          warehouseId,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      router.push(`/reservation/${data.id}`);
    } catch (error) {
      console.error(error);
      alert("Reservation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Allo Inventory System
      </h1>

      <div className="grid gap-6">
        {products.map((item) => (
          <div
            key={`${item.productId}-${item.warehouseId}`}
            className="border rounded-lg p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              {item.productName}
            </h2>

            <p className="mt-2">
              Warehouse: {item.warehouseName}
            </p>

            <p>Total Stock: {item.totalStock}</p>

            <p>Reserved Stock: {item.reservedStock}</p>

            <p>
              Available Stock: {item.availableStock}
            </p>

            <button
              onClick={() =>
                reserveProduct(
                  item.productId,
                  item.warehouseId
                )
              }
              disabled={
                item.availableStock <= 0 || loading
              }
              className="mt-4 px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            >
              Reserve
            </button>
          </div>
        ))}
      </div>
    </main>
  );
} 

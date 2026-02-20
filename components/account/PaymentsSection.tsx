"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  productName: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

export default function PaymentsSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/shop/orders", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Please sign in." : "Failed to load payments.");
        return res.json();
      })
      .then((data: { orders: Order[] }) => {
        if (!cancelled) setOrders(data.orders ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load payments.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--stack-border-color,#e5e7eb)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 py-4" role="alert">
        {error}
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <p className="text-sm text-[var(--stack-muted-color,#6b7280)] py-4">
        You haven&apos;t made any payments yet. Orders you pay for will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--stack-muted-color,#6b7280)]">
        Payments (orders) you&apos;ve made. Completed payments are listed below.
      </p>
      <ul className="divide-y divide-[var(--stack-border-color,#e5e7eb)]">
        {orders.map((order) => (
          <li key={order.id} className="py-4 first:pt-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium">{order.orderNumber}</span>
              <span className="text-sm text-[var(--stack-muted-color,#6b7280)]">
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span
                className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor:
                    order.paymentStatus === "COMPLETED"
                      ? "var(--stack-success-bg,#dcfce7)"
                      : order.paymentStatus === "FAILED"
                        ? "var(--stack-destructive-bg,#fee2e2)"
                        : "var(--stack-muted-bg,#f3f4f6)",
                  color:
                    order.paymentStatus === "COMPLETED"
                      ? "var(--stack-success-text,#166534)"
                      : order.paymentStatus === "FAILED"
                        ? "var(--stack-destructive-text,#991b1b)"
                        : "var(--stack-muted-color,#6b7280)",
                }}
              >
                {order.paymentStatus}
              </span>
              <span className="text-sm text-[var(--stack-muted-color,#6b7280)]">
                Order: {order.status}
              </span>
            </div>
            <ul className="mt-2 text-sm text-[var(--stack-muted-color,#6b7280)] space-y-0.5">
              {order.items.slice(0, 3).map((item, idx) => (
                <li key={idx}>
                  {item.productName} × {item.quantity} — RM {(item.quantity * item.price).toFixed(2)}
                </li>
              ))}
              {order.items.length > 3 && (
                <li>+{order.items.length - 3} more item(s)</li>
              )}
            </ul>
            <p className="mt-2 text-sm font-medium">
              Total: RM {order.total.toFixed(2)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

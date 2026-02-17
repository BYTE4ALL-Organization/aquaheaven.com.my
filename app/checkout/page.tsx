"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, adjustedTotalPrice } = useAppSelector((state: RootState) => state.carts);
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Malaysia",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const items = cart.items.map((item) => ({
        id: String(item.id),
        quantity: item.quantity,
      }));
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            fullName: shipping.fullName,
            phone: shipping.phone,
            address: shipping.address,
            city: shipping.city,
            state: shipping.state,
            zip: shipping.zip,
            country: shipping.country,
          },
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed.");
        setLoading(false);
        return;
      }
      if (data.billUrl) {
        window.location.href = data.billUrl;
        return;
      }
      router.push(`/checkout/success?order=${data.orderId}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <main className="pb-20 max-w-frame mx-auto px-4 xl:px-0 py-12">
        <p className="text-black/60 mb-4">Your cart is empty.</p>
        <Button asChild className="rounded-full">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <h2
          className={cn([
            integralCF.className,
            "font-bold text-[32px] md:text-[40px] text-black uppercase mb-6",
          ])}
        >
          Checkout
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <InputGroup className="bg-[#F0F0F0]">
              <InputGroup.Input
                required
                placeholder="Full name *"
                value={shipping.fullName}
                onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))}
                className="bg-transparent"
              />
            </InputGroup>
            <InputGroup className="bg-[#F0F0F0]">
              <InputGroup.Input
                type="tel"
                placeholder="Phone *"
                value={shipping.phone}
                onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                className="bg-transparent"
              />
            </InputGroup>
            <InputGroup className="bg-[#F0F0F0]">
              <InputGroup.Input
                required
                placeholder="Address *"
                value={shipping.address}
                onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
                className="bg-transparent"
              />
            </InputGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  placeholder="City"
                  value={shipping.city}
                  onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                  className="bg-transparent"
                />
              </InputGroup>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  placeholder="State"
                  value={shipping.state}
                  onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
                  className="bg-transparent"
                />
              </InputGroup>
            </div>
            <InputGroup className="bg-[#F0F0F0]">
              <InputGroup.Input
                placeholder="Postcode"
                value={shipping.zip}
                onChange={(e) => setShipping((s) => ({ ...s, zip: e.target.value }))}
                className="bg-transparent"
              />
            </InputGroup>
            <InputGroup className="bg-[#F0F0F0]">
              <InputGroup.Input
                placeholder="Country"
                value={shipping.country}
                onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                className="bg-transparent"
              />
            </InputGroup>
          </div>
          <div className="lg:w-[400px] p-5 rounded-[20px] border border-black/10 h-fit">
            <h6 className="text-xl font-bold text-black mb-4">Order total</h6>
            <p className="text-2xl font-bold mb-6">
              {formatPrice(Math.round(adjustedTotalPrice))}
            </p>
            <p className="text-sm text-black/60 mb-4">
              You will be redirected to Billplz to pay securely.
            </p>
            {error && (
              <p className="text-red-600 text-sm mb-4" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full h-12 font-medium"
            >
              {loading ? "Processing…" : "Proceed to payment"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

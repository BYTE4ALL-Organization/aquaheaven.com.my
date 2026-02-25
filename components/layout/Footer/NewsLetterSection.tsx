"use client";

import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Image from "next/image";
import React, { useState } from "react";

const NewsLetterSection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data?.error ?? "Subscription failed. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("Thanks! You're subscribed.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 py-9 md:py-11 px-6 md:px-16 max-w-frame mx-auto bg-gradient-to-r from-brand to-brand-accent rounded-[20px]">
      <p
        className={cn([
          integralCF.className,
          "font-bold text-[32px] md:text-[40px] text-white mb-9 md:mb-0",
        ])}
      >
        STAY UP TO DATE ABOUT OUR LATEST OFFERS
      </p>
      <div className="flex items-center">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full max-w-[349px] mx-auto"
        >
          <InputGroup className="flex bg-white mb-[14px]">
            <InputGroup.Text>
              <Image
                priority
                src="/icons/envelope.svg"
                height={20}
                width={20}
                alt="email"
                className="min-w-5 min-h-5"
              />
            </InputGroup.Text>
            <InputGroup.Input
              type="email"
              name="email"
              placeholder="Enter your email address"
              className="bg-transparent placeholder:text-black/40 placeholder:text-sm sm:placeholder:text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              aria-invalid={status === "error"}
            />
          </InputGroup>
          {message && (
            <p
              className={cn(
                "mb-2 text-sm text-center",
                status === "success" ? "text-white" : "text-red-100"
              )}
            >
              {message}
            </p>
          )}
          <Button
            variant="secondary"
            className="text-sm sm:text-base font-medium bg-white text-brand border-0 hover:bg-white/90 hover:text-brand h-12 rounded-full px-4 py-3"
            aria-label="Subscribe to Newsletter"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Subscribing…" : "Subscribe to Newsletter"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NewsLetterSection;
